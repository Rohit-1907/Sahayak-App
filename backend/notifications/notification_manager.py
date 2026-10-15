"""
Firebase Cloud Messaging Notification Manager Service

This service handles sending push notifications via Firebase Cloud Messaging (FCM)
and Expo Push Notification Service for both client and worker mobile applications.
"""

import logging
import requests
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Optional, List, Tuple, Dict
from django.conf import settings
from django.utils import timezone
from firebase_admin import messaging

logger = logging.getLogger(__name__)
_notification_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix='notifications')


@dataclass
class NotificationPayload:
    """Standard notification payload structure for FCM/Expo"""
    title: str
    body: str
    data: dict
    priority: str = 'high'
    sound: str = 'default'
    badge: Optional[int] = None
    
    def to_expo_format(self) -> dict:
        """Convert to Expo Push Notification format"""
        return {
            'to': [],  # Will be populated with Expo push tokens
            'title': self.title,
            'body': self.body,
            'data': self.data,
            'priority': self.priority,
            'sound': self.sound,
            'badge': self.badge,
        }
    
    def to_fcm_format(self) -> dict:
        """Convert to FCM format"""
        return {
            'notification': {
                'title': self.title,
                'body': self.body,
            },
            'data': {k: str(v) for k, v in self.data.items()},  # FCM requires string values
            'android': {
                'priority': self.priority,
                'notification': {
                    'sound': self.sound,
                }
            },
            'apns': {
                'payload': {
                    'aps': {
                        'sound': self.sound,
                        'badge': self.badge,
                    }
                }
            }
        }


@dataclass
class SendResult:
    """Result of notification send attempt"""
    success: bool
    message_id: Optional[str] = None
    error: Optional[str] = None
    
    @staticmethod
    def from_expo_response(response: dict) -> 'SendResult':
        """Parse Expo API response"""
        if response.get('status') == 'ok':
            return SendResult(success=True, message_id=response.get('id'))
        else:
            return SendResult(success=False, error=response.get('message', 'Unknown error'))


@dataclass
class DeliveryResult:
    """Aggregate delivery result for multiple devices"""
    success: int = 0
    failure: int = 0
    
    @staticmethod
    def from_results(results: List[SendResult]) -> 'DeliveryResult':
        """Aggregate multiple send results"""
        success_count = sum(1 for r in results if r.success)
        failure_count = len(results) - success_count
        return DeliveryResult(success=success_count, failure=failure_count)


class InvalidTokenError(Exception):
    """Raised when device token is invalid"""
    pass


class NetworkError(Exception):
    """Raised on network failures"""
    pass


class NotificationManager:
    """
    Service for creating and sending push notifications.
    Integrates with Firebase Admin SDK and Expo Push API.
    """
    
    EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

    def send_to_user_async(self, user, payload: NotificationPayload) -> None:
        """Create notification record synchronously, then queue push delivery in background."""
        from notifications.models import Notification
        notif_id_str = "new"
        try:
            notification = Notification.objects.create(
                user=user,
                type=payload.data.get('type', 'message'),
                title=payload.title,
                message=payload.body,
                related_id=payload.data.get('work_request_id', payload.data.get('otp_id', '')),
            )
            notif_id_str = str(notification.id)[:8]
        except Exception as e:
            logger.error(f"[FAIL] Error creating notification record in DB: {e}")

        _notification_executor.submit(self._send_to_user_in_background, user, payload, notif_id_str)

    def _send_to_user_in_background(self, user, payload: NotificationPayload, notif_id_str: str = "new") -> None:
        try:
            result = self.send_to_user(user, payload, create_record=False, notif_id_str=notif_id_str)
            logger.info(
                "[OK] Background notification delivery for user %s: %s sent, %s failed",
                user.id,
                result.success,
                result.failure,
            )
        except Exception:
            logger.exception("[FAIL] Background notification delivery failed for user %s", user.id)
        finally:
            try:
                from django.db import connection
                connection.close()
            except Exception:
                pass
    
    def send_otp_notification(self, user, otp) -> None:
        """
        Send OTP notification to user's devices.
        
        Args:
            user: SahayakUser instance
            otp: OTPNotification instance
        """
        from notifications.models import Notification
        
        payload = NotificationPayload(
            title="Worker Arrival Verification",
            body=f"Your verification PIN is: {otp.pin}",
            data={
                'type': 'otp',
                'otp_id': str(otp.id),
                'pin': otp.pin,
                'expires_at': otp.expires_at.isoformat(),
            },
            priority='high',
        )
        
        logger.info(f"[REQ] Sending OTP notification to user {user.id}")
        self.send_to_user_async(user, payload)
    
    def send_job_status_notification(self, user, work_request, status: str) -> None:
        """
        Send job status update notification.
        
        Args:
            user: SahayakUser instance (client or worker)
            work_request: WorkRequest instance
            status: New status (SCHEDULED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED)
        """
        title, body = self._format_job_notification(work_request, status)
        
        payload = NotificationPayload(
            title=title,
            body=body,
            data={
                'type': 'job_update',
                'work_request_id': str(work_request.id),
                'status': status,
                'service_category': getattr(work_request, 'service_category', 'Service'),
            },
            priority='high',
        )
        
        logger.info(f"[REQ] Sending job status notification ({status}) to user {user.id}")
        self.send_to_user_async(user, payload)
    
    def send_to_user(self, user, payload: NotificationPayload, create_record: bool = True, notif_id_str: str = None) -> DeliveryResult:
        """
        Send notification to all active devices for a user.
        
        Args:
            user: SahayakUser instance
            payload: NotificationPayload instance
            create_record: Whether to create a Notification model record (default True)
            notif_id_str: Optional ID prefix for logging
            
        Returns:
            DeliveryResult with success/failure counts
        """
        from authentication.models import DeviceToken
        from notifications.models import Notification
        
        # 1. ALWAYS create notification record in database first if requested
        if create_record:
            notification = None
            try:
                notification = Notification.objects.create(
                    user=user,
                    type=payload.data.get('type', 'message'),
                    title=payload.title,
                    message=payload.body,
                    related_id=payload.data.get('work_request_id', payload.data.get('otp_id', '')),
                )
                notif_id_str = str(notification.id)[:8]
            except Exception as e:
                logger.error(f"[FAIL] Error creating notification record in DB: {e}")
                notif_id_str = "new"
        elif not notif_id_str:
            notif_id_str = "new"
        
        if not settings.NOTIFICATIONS_ENABLED:
            logger.warning("Notifications are disabled (Firebase not initialized)")
            return DeliveryResult(success=0, failure=0)
        
        # 2. Get all active device tokens
        tokens = DeviceToken.objects.filter(user=user, is_active=True)
        
        if not tokens.exists():
            logger.warning(f"[WARN] No active tokens for user {user.id}")
            return DeliveryResult(success=0, failure=0)
        
        # 3. Send to all tokens
        results = []
        for token in tokens:
            try:
                result = self._send_to_token(token.token, payload, token.device_type)
                results.append(result)
                
                if result.success:
                    logger.info(f"[OK] Sent notification {notif_id_str} to token {str(token.id)[:8]}...")
                else:
                    logger.error(f"[FAIL] Failed to send to token {str(token.id)[:8]}...: {result.error}")
                    
            except InvalidTokenError:
                logger.warning(f"[WARN] Invalid token {str(token.id)[:8]}..., marking inactive")
                token.is_active = False
                token.save()
                
            except Exception as e:
                logger.error(f"[FAIL] Error sending notification: {e}", exc_info=True)
                results.append(SendResult(success=False, error=str(e)))
        
        return DeliveryResult.from_results(results)
    
    def _send_to_token(
        self, 
        token: str, 
        payload: NotificationPayload,
        device_type: str
    ) -> SendResult:
        """
        Send notification to a single device token.
        Uses Expo Push API for Expo tokens, FCM for others.
        """
        if token.startswith('ExponentPushToken'):
            return self._send_via_expo(token, payload)
        else:
            return self._send_via_fcm(token, payload)
    
    def _send_via_expo(self, token: str, payload: NotificationPayload) -> SendResult:
        """Send notification via Expo Push API"""
        try:
            message = payload.to_expo_format()
            message['to'] = token
            
            response = requests.post(
                self.EXPO_PUSH_URL,
                json=message,
                headers={
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            )
            
            if response.status_code == 200:
                data = response.json().get('data', [{}])[0]
                return SendResult.from_expo_response(data)
            else:
                return SendResult(success=False, error=f"HTTP {response.status_code}")
                
        except Exception as e:
            logger.error(f"Expo push error: {e}")
            return SendResult(success=False, error=str(e))
    
    def _send_via_fcm(self, token: str, payload: NotificationPayload) -> SendResult:
        """Send notification via Firebase Admin SDK"""
        try:
            fcm_payload = payload.to_fcm_format()
            
            message = messaging.Message(
                token=token,
                notification=messaging.Notification(
                    title=fcm_payload['notification']['title'],
                    body=fcm_payload['notification']['body'],
                ),
                data=fcm_payload['data'],
                android=messaging.AndroidConfig(
                    priority='high',
                    notification=messaging.AndroidNotification(
                        sound='default',
                        channel_id='default',
                    ),
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound='default',
                            badge=payload.badge,
                        ),
                    ),
                ),
            )
            
            response = messaging.send(message)
            return SendResult(success=True, message_id=response)
            
        except messaging.UnregisteredError:
            raise InvalidTokenError("Token is no longer registered")
        except Exception as e:
            logger.error(f"FCM push error: {e}")
            return SendResult(success=False, error=str(e))
    
    def _format_job_notification(self, work_request, status: str) -> Tuple[str, str]:
        """Format title and body for job status notifications"""
        if status == 'SCHEDULED':
            worker_name = getattr(work_request.worker.user, 'get_full_name', lambda: 'Worker')()
            time = work_request.required_time.strftime('%I:%M %p') if hasattr(work_request, 'required_time') else 'soon'
            return ("Booking Confirmed", f"{worker_name} will arrive at {time}")
            
        elif status == 'REJECTED':
            reason = getattr(work_request, 'rejection_reason', None) or "No reason provided"
            return ("Booking Rejected", f"Reason: {reason}")
            
        elif status == 'IN_PROGRESS':
            return ("Work Started", "Worker has arrived and started work")
            
        elif status == 'COMPLETED':
            return ("Work Completed", "Please rate your experience and provide feedback")
            
        elif status == 'CANCELLED':
            reason = getattr(work_request, 'cancellation_reason', None) or "No reason provided"
            return ("Booking Cancelled", f"Reason: {reason}")
            
        else:
            return ("Job Update", f"Status changed to {status}")



    def send_new_job_request_notification(self, worker_user=None, work_request=None, client_user=None) -> None:
        """
        Notify worker about new job request, AND notify client that request was submitted.
        
        Args:
            worker_user: Worker's SahayakUser instance (optional if in work_request)
            work_request: WorkRequest instance
            client_user: Client's SahayakUser instance (optional if in work_request)
        """
        # Support calling as send_new_job_request_notification(work_request)
        if hasattr(worker_user, 'service_category') and work_request is None:
            work_request = worker_user
            worker_user = None

        if not work_request:
            return

        client_obj = client_user or (work_request.client.user if hasattr(work_request, 'client') and hasattr(work_request.client, 'user') else None)
        worker_obj = worker_user or (work_request.worker.user if hasattr(work_request, 'worker') and hasattr(work_request.worker, 'user') else None)

        client_name = client_obj.get_full_name() if client_obj and hasattr(client_obj, 'get_full_name') and client_obj.get_full_name() else (client_obj.first_name or 'A client') if client_obj else 'A client'
        worker_name = worker_obj.get_full_name() if worker_obj and hasattr(worker_obj, 'get_full_name') and worker_obj.get_full_name() else (worker_obj.first_name or 'the worker') if worker_obj else 'the worker'

        service = getattr(work_request, 'service_category', 'Service')
        date = work_request.required_date.strftime('%b %d') if hasattr(work_request, 'required_date') and work_request.required_date else 'Soon'
        
        # 1. Notify Worker
        if worker_obj:
            worker_payload = NotificationPayload(
                title="New Job Request",
                body=f"{client_name} needs {service} on {date}. Tap to view details.",
                data={
                    'type': 'new_job_request',
                    'work_request_id': str(work_request.id),
                    'status': 'REQUESTED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending new job request notification to worker {worker_obj.id}")
            self.send_to_user_async(worker_obj, worker_payload)

        # 2. Notify Client
        if client_obj:
            client_payload = NotificationPayload(
                title="Request Sent",
                body=f"Your {service} request has been sent to {worker_name}. Waiting for confirmation.",
                data={
                    'type': 'new_job_request',
                    'work_request_id': str(work_request.id),
                    'status': 'REQUESTED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending request sent notification to client {client_obj.id}")
            self.send_to_user_async(client_obj, client_payload)
    
    def send_org_work_request_notification(self, admin_user, org_work_request) -> None:
        """
        Notify organisation admin about a new work request from a client.
        
        Args:
            admin_user: SahayakUser instance (admin of the organisation)
            org_work_request: OrgWorkRequest instance
        """
        client_name = getattr(org_work_request, 'client_name', '') or 'A client'
        work_type = getattr(org_work_request, 'work_type', '') or 'service'
        org_name = org_work_request.org.org_name if hasattr(org_work_request, 'org') else 'Organization'
        
        date_str = ""
        if getattr(org_work_request, 'required_date', None):
            date_str = f" on {org_work_request.required_date.strftime('%b %d')}"
            
        payload = NotificationPayload(
            title="New Organization Request! ",
            body=f"{client_name} requested {work_type}{date_str} for {org_name}. Tap to view details.",
            data={
                'type': 'new_job_request',
                'work_request_id': str(org_work_request.id),
                'org_id': str(org_work_request.org.org_id) if hasattr(org_work_request, 'org') else '',
                'status': getattr(org_work_request, 'status', 'pending'),
                'service_category': work_type,
            },
            priority='high',
        )
        
        logger.info(f"[REQ] Sending org work request notification to admin {admin_user.id} ({getattr(admin_user, 'email', '')})")
        self.send_to_user_async(admin_user, payload)
    
    def send_job_accepted_notification(self, client_user=None, work_request=None, worker_name=None, worker_user=None) -> None:
        """
        Notify client that worker accepted job, AND notify worker with confirmation.
        
        Args:
            client_user: Client's SahayakUser instance (optional if in work_request)
            work_request: WorkRequest instance
            worker_name: Worker's full name (optional)
            worker_user: Worker's SahayakUser instance (optional)
        """
        # Support calling as send_job_accepted_notification(work_request)
        if hasattr(client_user, 'service_category') and work_request is None:
            work_request = client_user
            client_user = None

        if not work_request:
            return

        service = getattr(work_request, 'service_category', 'Service')
        time = work_request.required_time.strftime('%I:%M %p') if hasattr(work_request, 'required_time') and work_request.required_time else 'the scheduled time'
        date = work_request.required_date.strftime('%b %d') if hasattr(work_request, 'required_date') and work_request.required_date else 'the scheduled date'

        client_obj = client_user or (work_request.client.user if hasattr(work_request, 'client') and hasattr(work_request.client, 'user') else None)
        worker_obj = worker_user or (work_request.worker.user if hasattr(work_request, 'worker') and hasattr(work_request.worker, 'user') else None)

        w_name = worker_name or (worker_obj.get_full_name() if worker_obj and hasattr(worker_obj, 'get_full_name') and worker_obj.get_full_name() else (worker_obj.first_name or 'Worker') if worker_obj else 'Worker')
        c_name = client_obj.get_full_name() if client_obj and hasattr(client_obj, 'get_full_name') and client_obj.get_full_name() else (client_obj.first_name or 'Client') if client_obj else 'Client'

        # 1. Notify Client
        if client_obj:
            client_payload = NotificationPayload(
                title="Job Accepted!",
                body=f"{w_name} accepted your {service} request. They'll arrive at {time}.",
                data={
                    'type': 'job_accepted',
                    'work_request_id': str(work_request.id),
                    'status': 'SCHEDULED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending job accepted notification to client {client_obj.id}")
            self.send_to_user_async(client_obj, client_payload)

        # 2. Notify Worker
        if worker_obj:
            worker_payload = NotificationPayload(
                title="Job Accepted!",
                body=f"You accepted the {service} request from {c_name} for {date} at {time}.",
                data={
                    'type': 'job_accepted',
                    'work_request_id': str(work_request.id),
                    'status': 'SCHEDULED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending job accepted confirmation to worker {worker_obj.id}")
            self.send_to_user_async(worker_obj, worker_payload)
    
    def send_job_rejected_notification(self, client_user=None, work_request=None, worker_name=None, reason=None, worker_user=None) -> None:
        """
        Notify client that worker rejected job, AND notify worker with confirmation.
        
        Args:
            client_user: Client's SahayakUser instance
            work_request: WorkRequest instance
            worker_name: Worker's full name
            reason: Rejection reason (optional)
            worker_user: Worker's SahayakUser instance (optional)
        """
        # Support calling as send_job_rejected_notification(work_request, reason=reason)
        if hasattr(client_user, 'service_category') and work_request is None:
            work_request = client_user
            client_user = None

        if not work_request:
            return

        service = getattr(work_request, 'service_category', 'Service')
        reason_text = f" Reason: {reason}" if reason else ""

        client_obj = client_user or (work_request.client.user if hasattr(work_request, 'client') and hasattr(work_request.client, 'user') else None)
        worker_obj = worker_user or (work_request.worker.user if hasattr(work_request, 'worker') and hasattr(work_request.worker, 'user') else None)

        w_name = worker_name or (worker_obj.get_full_name() if worker_obj and hasattr(worker_obj, 'get_full_name') and worker_obj.get_full_name() else (worker_obj.first_name or 'Worker') if worker_obj else 'Worker')
        c_name = client_obj.get_full_name() if client_obj and hasattr(client_obj, 'get_full_name') and client_obj.get_full_name() else (client_obj.first_name or 'the client') if client_obj else 'the client'

        # 1. Notify Client
        if client_obj:
            client_payload = NotificationPayload(
                title="Job Request Declined",
                body=f"{w_name} declined your {service} request.{reason_text}",
                data={
                    'type': 'job_rejected',
                    'work_request_id': str(work_request.id),
                    'status': 'REJECTED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending job rejected notification to client {client_obj.id}")
            self.send_to_user_async(client_obj, client_payload)

        # 2. Notify Worker
        if worker_obj:
            worker_payload = NotificationPayload(
                title="Job Request Declined",
                body=f"You declined the {service} request from {c_name}.{reason_text}",
                data={
                    'type': 'job_rejected',
                    'work_request_id': str(work_request.id),
                    'status': 'REJECTED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending job rejected confirmation to worker {worker_obj.id}")
            self.send_to_user_async(worker_obj, worker_payload)
    
    def send_worker_arrived_notification(self, work_request, otp_pin=None, client_user=None, worker_user=None) -> None:
        """
        Notify client and worker when worker marks arrival at job location.
        """
        if not work_request:
            return

        service = getattr(work_request, 'service_category', 'Service')
        client_obj = client_user or (work_request.client.user if hasattr(work_request, 'client') and hasattr(work_request.client, 'user') else None)
        worker_obj = worker_user or (work_request.worker.user if hasattr(work_request, 'worker') and hasattr(work_request.worker, 'user') else None)

        w_name = worker_obj.get_full_name() if worker_obj and hasattr(worker_obj, 'get_full_name') and worker_obj.get_full_name() else (worker_obj.first_name or 'Your worker') if worker_obj else 'Your worker'
        c_name = client_obj.get_full_name() if client_obj and hasattr(client_obj, 'get_full_name') and client_obj.get_full_name() else (client_obj.first_name or 'the client') if client_obj else 'the client'

        # 1. Notify Client (with PIN if present)
        if client_obj:
            pin_text = f" Please share PIN {otp_pin} with the worker." if otp_pin else " Please verify with the worker."
            client_payload = NotificationPayload(
                title=f"Worker Arrived - {service}",
                body=f"{w_name} has arrived at your location.{pin_text}",
                data={
                    'type': 'otp' if otp_pin else 'job_update',
                    'pin': str(otp_pin) if otp_pin else '',
                    'work_request_id': str(work_request.id),
                    'status': 'WORKER_ARRIVED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending worker arrived notification to client {client_obj.id}")
            self.send_to_user_async(client_obj, client_payload)

        # 2. Notify Worker
        if worker_obj:
            worker_payload = NotificationPayload(
                title="Arrival Recorded",
                body=f"Arrival marked for {c_name}. Verification PIN has been sent to the client.",
                data={
                    'type': 'job_update',
                    'work_request_id': str(work_request.id),
                    'status': 'WORKER_ARRIVED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending arrival recorded notification to worker {worker_obj.id}")
            self.send_to_user_async(worker_obj, worker_payload)

    def send_job_started_notification(self, client_user=None, work_request=None, worker_user=None) -> None:
        """
        Notify client AND worker that work has started.
        """
        # Support calling as send_job_started_notification(work_request)
        if hasattr(client_user, 'service_category') and work_request is None:
            work_request = client_user
            client_user = None

        if not work_request:
            return

        service = getattr(work_request, 'service_category', 'Service')

        client_obj = client_user or (work_request.client.user if hasattr(work_request, 'client') and hasattr(work_request.client, 'user') else None)
        worker_obj = worker_user or (work_request.worker.user if hasattr(work_request, 'worker') and hasattr(work_request.worker, 'user') else None)

        w_name = worker_obj.get_full_name() if worker_obj and hasattr(worker_obj, 'get_full_name') and worker_obj.get_full_name() else (worker_obj.first_name or 'The worker') if worker_obj else 'The worker'
        c_name = client_obj.get_full_name() if client_obj and hasattr(client_obj, 'get_full_name') and client_obj.get_full_name() else (client_obj.first_name or 'Client') if client_obj else 'Client'

        # 1. Notify Client
        if client_obj:
            client_payload = NotificationPayload(
                title="Work Started",
                body=f"Arrival verified! {w_name} has started work on your {service} request.",
                data={
                    'type': 'job_started',
                    'work_request_id': str(work_request.id),
                    'status': 'IN_PROGRESS',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending job started notification to client {client_obj.id}")
            self.send_to_user_async(client_obj, client_payload)

        # 2. Notify Worker
        if worker_obj:
            worker_payload = NotificationPayload(
                title="Work Started",
                body=f"Arrival verified! Work in progress for {c_name} ({service}).",
                data={
                    'type': 'job_started',
                    'work_request_id': str(work_request.id),
                    'status': 'IN_PROGRESS',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending job started notification to worker {worker_obj.id}")
            self.send_to_user_async(worker_obj, worker_payload)
    
    def send_job_completed_notification(self, users_list=None, work_request=None, client_user=None, worker_user=None) -> None:
        """
        Notify client AND worker that job is completed with tailored messages.
        """
        # Support calling as send_job_completed_notification(work_request)
        if hasattr(users_list, 'service_category') and work_request is None:
            work_request = users_list
            users_list = None

        if not work_request:
            return

        service = getattr(work_request, 'service_category', 'Service')

        client_obj = client_user or (work_request.client.user if hasattr(work_request, 'client') and hasattr(work_request.client, 'user') else None)
        worker_obj = worker_user or (work_request.worker.user if hasattr(work_request, 'worker') and hasattr(work_request.worker, 'user') else None)

        w_name = worker_obj.get_full_name() if worker_obj and hasattr(worker_obj, 'get_full_name') and worker_obj.get_full_name() else (worker_obj.first_name or 'the worker') if worker_obj else 'the worker'
        c_name = client_obj.get_full_name() if client_obj and hasattr(client_obj, 'get_full_name') and client_obj.get_full_name() else (client_obj.first_name or 'the client') if client_obj else 'the client'

        # 1. Notify Client
        if client_obj:
            client_payload = NotificationPayload(
                title="Work Completed! ",
                body=f"Your {service} job with {w_name} is completed. Please rate and provide feedback.",
                data={
                    'type': 'job_completed',
                    'work_request_id': str(work_request.id),
                    'status': 'COMPLETED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending job completed notification to client {client_obj.id}")
            self.send_to_user_async(client_obj, client_payload)

        # 2. Notify Worker
        if worker_obj:
            worker_payload = NotificationPayload(
                title="Work Completed! ",
                body=f"You completed the {service} job for {c_name}. Payment has been received.",
                data={
                    'type': 'job_completed',
                    'work_request_id': str(work_request.id),
                    'status': 'COMPLETED',
                    'service_category': service,
                },
                priority='high',
            )
            logger.info(f"[REQ] Sending job completed notification to worker {worker_obj.id}")
            self.send_to_user_async(worker_obj, worker_payload)
    
    def send_job_cancelled_notification(self, recipient_user=None, work_request=None, cancelled_by='client', reason=None, client_user=None, worker_user=None) -> None:
        """
        Notify both client and worker about job cancellation.
        """
        # Support calling as send_job_cancelled_notification(work_request, cancelled_by=..., reason=...)
        if hasattr(recipient_user, 'service_category') and work_request is None:
            work_request = recipient_user
            recipient_user = None

        if not work_request:
            return

        service = getattr(work_request, 'service_category', 'Service')
        reason_text = f" Reason: {reason}" if reason else ""

        client_obj = client_user or (work_request.client.user if hasattr(work_request, 'client') and hasattr(work_request.client, 'user') else None)
        worker_obj = worker_user or (work_request.worker.user if hasattr(work_request, 'worker') and hasattr(work_request.worker, 'user') else None)

        w_name = worker_obj.get_full_name() if worker_obj and hasattr(worker_obj, 'get_full_name') and worker_obj.get_full_name() else (worker_obj.first_name or 'Worker') if worker_obj else 'Worker'
        c_name = client_obj.get_full_name() if client_obj and hasattr(client_obj, 'get_full_name') and client_obj.get_full_name() else (client_obj.first_name or 'Client') if client_obj else 'Client'

        if cancelled_by == 'client':
            # Client cancelled: Worker gets alert, client gets confirmation
            if worker_obj:
                worker_payload = NotificationPayload(
                    title="Job Cancelled",
                    body=f"{c_name} cancelled the {service} job.{reason_text}",
                    data={
                        'type': 'job_cancelled',
                        'work_request_id': str(work_request.id),
                        'status': 'CANCELLED',
                        'service_category': service,
                    },
                    priority='high',
                )
                logger.info(f"[REQ] Sending job cancelled notification to worker {worker_obj.id}")
                self.send_to_user_async(worker_obj, worker_payload)

            if client_obj:
                client_payload = NotificationPayload(
                    title="Job Cancelled",
                    body=f"You cancelled the {service} job with {w_name}.{reason_text}",
                    data={
                        'type': 'job_cancelled',
                        'work_request_id': str(work_request.id),
                        'status': 'CANCELLED',
                        'service_category': service,
                    },
                    priority='high',
                )
                logger.info(f"[REQ] Sending job cancelled confirmation to client {client_obj.id}")
                self.send_to_user_async(client_obj, client_payload)
        else:
            # Worker cancelled: Client gets alert, worker gets confirmation
            if client_obj:
                client_payload = NotificationPayload(
                    title="Job Cancelled",
                    body=f"{w_name} cancelled the {service} job.{reason_text}",
                    data={
                        'type': 'job_cancelled',
                        'work_request_id': str(work_request.id),
                        'status': 'CANCELLED',
                        'service_category': service,
                    },
                    priority='high',
                )
                logger.info(f"[REQ] Sending job cancelled notification to client {client_obj.id}")
                self.send_to_user_async(client_obj, client_payload)

            if worker_obj:
                worker_payload = NotificationPayload(
                    title="Job Cancelled",
                    body=f"You cancelled the {service} job for {c_name}.{reason_text}",
                    data={
                        'type': 'job_cancelled',
                        'work_request_id': str(work_request.id),
                        'status': 'CANCELLED',
                        'service_category': service,
                    },
                    priority='high',
                )
                logger.info(f"[REQ] Sending job cancelled confirmation to worker {worker_obj.id}")
                self.send_to_user_async(worker_obj, worker_payload)
    
    def send_welcome_notification(self, user, user_type, custom_name=None) -> None:
        """
        Send welcome notification when user creates account or logs in
        
        Args:
            user: SahayakUser instance
            user_type: 'client', 'worker', 'org_worker', or 'organization'
            custom_name: Optional custom display name (e.g. for org workers)
        """
        if custom_name:
            name = custom_name
        else:
            name = user.get_full_name() if hasattr(user, 'get_full_name') and user.get_full_name() else (user.first_name or user.username)
        
        if user_type == 'client':
            body = "Welcome to Sahayak! Find reliable workers for all your service needs."
        elif user_type == 'worker':
            body = "Welcome to Sahayak! Start receiving job requests and earning money."
        elif user_type == 'org_worker':
            body = "Welcome to Sahayak! Check your assigned tasks and work updates."
        else:
            body = "Welcome to Sahayak! Manage your workforce efficiently."
        
        payload = NotificationPayload(
            title=f"Welcome, {name}! ",
            body=body,
            data={
                'type': 'welcome',
                'user_type': user_type,
            },
            priority='high',
        )
        
        logger.info(f"[REQ] Sending welcome notification to user {user.id} ({name})")
        # Small delay to ensure device token is registered
        try:
            self.send_to_user_async(user, payload)
        except Exception as e:
            logger.warning(f"Welcome notification failed (user may not have token yet): {e}")
    
    def send_login_notification(self, user, device_info=None) -> None:
        """
        Send security notification on login (optional feature)
        
        Args:
            user: SahayakUser instance
            device_info: Device information dict (optional)
        """
        from django.utils import timezone
        
        time_str = timezone.now().strftime('%b %d at %I:%M %p')
        device_str = f" from {device_info.get('name', 'Unknown device')}" if device_info else ""
        
        payload = NotificationPayload(
            title="New Login Detected",
            body=f"Account accessed on {time_str}{device_str}. If this wasn't you, please secure your account.",
            data={
                'type': 'login_alert',
                'timestamp': timezone.now().isoformat(),
            },
            priority='normal',
        )
        
        logger.info(f"[REQ] Sending login notification to user {user.id}")
        try:
            self.send_to_user_async(user, payload)
        except Exception as e:
            logger.warning(f"Login notification failed: {e}")

# Global singleton instance
notification_manager = NotificationManager()

