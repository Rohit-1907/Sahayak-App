from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    worker_name = serializers.SerializerMethodField()
    service_category = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'work_request',
            'booking',
            'client',
            'worker',
            'client_name',
            'worker_name',
            'service_category',
            'base_price',
            'visiting_charges',
            'platform_fee',
            'additional_charges',
            'additional_charges_reason',
            'total_amount',
            'worker_gross_amount',
            'deducted_platform_dues',
            'worker_net_payout',
            'cash_platform_fee_settled',
            'payment_method',
            'status',
            'razorpay_order_id',
            'razorpay_payment_id',
            'transaction_id',
            'paid_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'paid_at']

    def get_client_name(self, obj):
        if obj.client and obj.client.user:
            return obj.client.user.get_full_name() or obj.client.user.phone_number
        return 'Client'

    def get_worker_name(self, obj):
        if obj.worker and obj.worker.user:
            return obj.worker.user.get_full_name() or obj.worker.user.phone_number
        return 'Worker'

    def get_service_category(self, obj):
        if obj.work_request:
            return obj.work_request.service_category
        return None
