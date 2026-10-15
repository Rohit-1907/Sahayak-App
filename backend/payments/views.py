"""Payment processing views with Razorpay integration and automated job completion."""
import os
import uuid
import hmac
import hashlib
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Payment
from .serializers import PaymentSerializer
from jobs.models import WorkRequest, ServicePricing
from users.models import CustomerProfile, WorkerProfile
from notifications.notification_manager import notification_manager
import logging

logger = logging.getLogger(__name__)

# Try importing razorpay
try:
    import razorpay
except ImportError:
    razorpay = None


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve payment records."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'customer_profile'):
            return Payment.objects.filter(client=user.customer_profile).order_by('-created_at')
        elif hasattr(user, 'worker_profile'):
            return Payment.objects.filter(worker=user.worker_profile).order_by('-created_at')
        return Payment.objects.none()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_order(request):
    """
    Create a Razorpay order for an in-progress or scheduled work request.
    
    POST /api/v1/payments/create-order/
    Payload:
    {
        "work_request_id": "uuid-string",
        "additional_charges": 50.00 (optional),
        "additional_charges_reason": "Extra parts" (optional)
    }
    """
    try:
        work_request_id = request.data.get('work_request_id')
        if not work_request_id:
            return Response({'success': False, 'error': 'work_request_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        work_request = get_object_or_404(
            WorkRequest.objects.select_related('client__user', 'worker__user'),
            id=work_request_id
        )

        # Check authorization
        if hasattr(request.user, 'customer_profile'):
            if work_request.client.id != request.user.customer_profile.id:
                return Response({'success': False, 'error': 'You can only pay for your own requests'}, status=status.HTTP_403_FORBIDDEN)
        
        # Verify status
        if work_request.status not in ['SCHEDULED', 'IN_PROGRESS', 'WORKER_ARRIVED', 'COMPLETED']:
            return Response({
                'success': False, 
                'error': f'Cannot initiate payment for work request with status {work_request.status}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate exact breakdown
        visiting_charges = Decimal(str(work_request.worker.hourly_rate or '100.00'))
        platform_fee = Decimal('50.00') # Exactly 50 rs
        
        # Base price lookup
        city = getattr(work_request.client.user, 'city', '') or 'Pune'
        try:
            pricing = ServicePricing.objects.filter(
                service_category__iexact=work_request.service_category,
                is_active=True
            ).first()
            base_price = pricing.base_price if pricing else Decimal('400.00')
        except Exception:
            base_price = Decimal('400.00')

        # If estimated_budget was explicitly set, derive base if needed
        if work_request.estimated_budget and work_request.estimated_budget > (visiting_charges + platform_fee):
            base_price = work_request.estimated_budget - visiting_charges - platform_fee

        additional_charges = Decimal(str(request.data.get('additional_charges', 0.00) or 0.00))
        additional_charges_reason = request.data.get('additional_charges_reason', '')

        total_amount = base_price + visiting_charges + platform_fee + additional_charges
        worker_gross = base_price + visiting_charges + additional_charges

        # Razorpay Keys
        rzp_key_id = getattr(settings, 'RAZORPAY_KEY_ID', None) or os.getenv('RAZORPAY_KEY_ID', '')
        rzp_key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None) or os.getenv('RAZORPAY_KEY_SECRET', '')

        amount_in_paise = int(total_amount * 100)
        order_id = None
        is_test_mode = False

        if rzp_key_id and rzp_key_secret and razorpay:
            try:
                client = razorpay.Client(auth=(rzp_key_id, rzp_key_secret))
                order_payload = {
                    'amount': amount_in_paise,
                    'currency': 'INR',
                    'receipt': f'sahayak_{str(work_request.id)[:8]}',
                    'notes': {
                        'work_request_id': str(work_request.id),
                        'client_name': work_request.client.user.get_full_name() or 'Client',
                        'service': work_request.service_category,
                    }
                }
                rzp_order = client.order.create(data=order_payload)
                order_id = rzp_order.get('id')
            except Exception as e:
                logger.error(f"Error creating Razorpay order: {e}")
                is_test_mode = True
                order_id = f"order_test_{uuid.uuid4().hex[:14]}"
        else:
            is_test_mode = True
            order_id = f"order_test_{uuid.uuid4().hex[:14]}"
            rzp_key_id = rzp_key_id or 'rzp_test_mock_sahayak'

        # Create or update pending Payment record
        payment, created = Payment.objects.update_or_create(
            work_request=work_request,
            status='pending',
            defaults={
                'client': work_request.client,
                'worker': work_request.worker,
                'base_price': base_price,
                'visiting_charges': visiting_charges,
                'platform_fee': platform_fee,
                'additional_charges': additional_charges,
                'additional_charges_reason': additional_charges_reason,
                'total_amount': total_amount,
                'worker_gross_amount': worker_gross,
                'payment_method': 'razorpay',
                'razorpay_order_id': order_id,
            }
        )

        return Response({
            'success': True,
            'payment_id': str(payment.id),
            'order_id': order_id,
            'amount': amount_in_paise,
            'total_amount': float(total_amount),
            'currency': 'INR',
            'key_id': rzp_key_id,
            'breakdown': {
                'base_price': float(base_price),
                'visiting_charges': float(visiting_charges),
                'platform_fee': float(platform_fee),
                'additional_charges': float(additional_charges),
                'total_amount': float(total_amount)
            },
            'test_mode': is_test_mode,
            'checkout_url': f"/api/v1/payments/checkout/{payment.id}/"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.exception("create_payment_order error")
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    Verify payment from Razorpay, deduct past cash platform fees from worker payout,
    and AUTOMATICALLY mark the work request status as COMPLETED.
    
    POST /api/v1/payments/verify/
    Payload:
    {
        "payment_id": "uuid-string",
        "razorpay_order_id": "order_...",
        "razorpay_payment_id": "pay_...",
        "razorpay_signature": "..."
    }
    """
    try:
        payment_id = request.data.get('payment_id')
        rzp_order_id = request.data.get('razorpay_order_id')
        rzp_payment_id = request.data.get('razorpay_payment_id')
        rzp_signature = request.data.get('razorpay_signature')

        if not payment_id:
            return Response({'success': False, 'error': 'payment_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        payment = get_object_or_404(
            Payment.objects.select_related('work_request', 'worker__user', 'client__user'),
            id=payment_id
        )

        # Verify signature if real Razorpay credentials exist
        rzp_key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None) or os.getenv('RAZORPAY_KEY_SECRET', '')
        if rzp_key_secret and not rzp_order_id.startswith('order_test_'):
            msg = f"{rzp_order_id}|{rzp_payment_id}"
            generated_sig = hmac.new(
                rzp_key_secret.encode('utf-8'),
                msg.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            if generated_sig != rzp_signature:
                payment.status = 'failed'
                payment.save(update_fields=['status'])
                return Response({'success': False, 'error': 'Payment verification failed: Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        # ------------------------------------------------------------------
        # CASH PLATFORM FEE DEDUCTION LEDGER
        # ------------------------------------------------------------------
        worker = payment.worker
        worker_gross = payment.worker_gross_amount
        
        # Check if worker owes platform fees from previous cash jobs
        pending_dues = getattr(worker, 'pending_platform_fees', Decimal('0.00')) or Decimal('0.00')
        deduct_dues = min(pending_dues, worker_gross)
        worker_net = worker_gross - deduct_dues

        # Update worker balance
        worker.pending_platform_fees = pending_dues - deduct_dues
        worker.total_earnings = (worker.total_earnings or Decimal('0.00')) + worker_gross
        worker.total_jobs_completed = (worker.total_jobs_completed or 0) + 1
        worker.save(update_fields=['pending_platform_fees', 'total_earnings', 'total_jobs_completed'])

        # Mark past cash jobs as settled
        if deduct_dues > 0:
            Payment.objects.filter(
                worker=worker,
                payment_method='cash',
                cash_platform_fee_settled=False
            ).update(cash_platform_fee_settled=True)

        # ------------------------------------------------------------------
        # UPDATE PAYMENT RECORD
        # ------------------------------------------------------------------
        payment.status = 'completed'
        payment.payment_method = 'razorpay'
        payment.razorpay_order_id = rzp_order_id
        payment.razorpay_payment_id = rzp_payment_id or f"pay_sim_{uuid.uuid4().hex[:12]}"
        payment.razorpay_signature = rzp_signature or 'simulated_sig'
        payment.deducted_platform_dues = deduct_dues
        payment.worker_net_payout = worker_net
        payment.paid_at = timezone.now()
        payment.save()

        # ------------------------------------------------------------------
        # AUTOMATICALLY CHANGE JOB STATUS TO COMPLETED
        # ------------------------------------------------------------------
        work_request = payment.work_request
        if work_request:
            work_request.status = 'COMPLETED'
            work_request.completed_at = timezone.now()
            work_request.save(update_fields=['status', 'completed_at', 'updated_at'])

            # Send push notifications to both client and worker
            try:
                client_user = work_request.client.user
                worker_user = work_request.worker.user
                notification_manager.send_job_completed_notification(
                    work_request=work_request,
                    client_user=client_user,
                    worker_user=worker_user
                )
            except Exception as e:
                logger.error(f"Failed to send job completed notification: {e}")

        logger.info(f"[OK] Payment #{payment.id} verified. WorkRequest #{work_request.id} automatically set to COMPLETED.")

        return Response({
            'success': True,
            'message': 'Payment successful. Work request has been automatically marked as COMPLETED.',
            'status': 'COMPLETED',
            'work_request_id': str(work_request.id),
            'deducted_platform_dues': float(deduct_dues),
            'worker_net_payout': float(worker_net),
            'payment': PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.exception("verify_payment error")
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def hosted_checkout_page(request, payment_id):
    """
    Renders a responsive Razorpay Standard Checkout page for Expo WebBrowser or WebView.
    """
    try:
        payment = get_object_or_404(Payment.objects.select_related('work_request', 'client__user'), id=payment_id)
        rzp_key_id = getattr(settings, 'RAZORPAY_KEY_ID', None) or os.getenv('RAZORPAY_KEY_ID', '')
        client_user = payment.client.user

        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sahayak Payment</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #F8FAFC;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }}
        .card {{
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }}
        .title {{ font-size: 20px; font-weight: 700; color: #1F2937; margin-bottom: 8px; }}
        .amount {{ font-size: 32px; font-weight: 800; color: #49769F; margin-bottom: 20px; }}
        .btn {{
            background: #49769F;
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
        }}
        .btn-cancel {{
            background: transparent;
            color: #6B7280;
            border: none;
            margin-top: 12px;
            padding: 10px;
            cursor: pointer;
            width: 100%;
        }}
    </style>
</head>
<body>
    <div class="card">
        <div class="title">Sahayak Payment</div>
        <p style="color: #64748B; font-size: 14px;">Service: {payment.work_request.service_category}</p>
        <div class="amount">Rs. {payment.total_amount}</div>
        <button id="rzp-button" class="btn">Pay Now with Razorpay</button>
        <button class="btn-cancel" onclick="cancelPayment()">Cancel</button>
    </div>

    <script>
        const options = {{
            "key": "{rzp_key_id or 'rzp_test_mock_sahayak'}",
            "amount": "{int(payment.total_amount * 100)}",
            "currency": "INR",
            "name": "Sahayak Services",
            "description": "{payment.work_request.service_category} Booking",
            "order_id": "{payment.razorpay_order_id or ''}",
            "prefill": {{
                "name": "{client_user.get_full_name() or 'Customer'}",
                "contact": "{client_user.phone_number or ''}"
            }},
            "theme": {{
                "color": "#49769F"
            }},
            "handler": function (response) {{
                const redirectUrl = `sahayak://payment-complete?status=success&payment_id={payment.id}&razorpay_payment_id=${{response.razorpay_payment_id}}&razorpay_order_id=${{response.razorpay_order_id}}&razorpay_signature=${{response.razorpay_signature}}`;
                window.location.href = redirectUrl;
            }},
            "modal": {{
                "ondismiss": function() {{
                    window.location.href = `sahayak://payment-complete?status=cancelled&payment_id={payment.id}`;
                }}
            }}
        }};

        const rzp = new Razorpay(options);
        document.getElementById('rzp-button').onclick = function(e) {{
            rzp.open();
            e.preventDefault();
        }};
        
        // Auto-launch on load
        window.onload = function() {{
            setTimeout(() => {{ rzp.open(); }}, 400);
        }};

        function cancelPayment() {{
            window.location.href = `sahayak://payment-complete?status=cancelled&payment_id={payment.id}`;
        }}
    </script>
</body>
</html>"""
        return HttpResponse(html_content, content_type='text/html')
    except Exception as e:
        return HttpResponse(f"Error loading checkout: {str(e)}", status=500)
