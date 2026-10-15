from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet,
    create_payment_order,
    verify_payment,
    hosted_checkout_page
)

router = DefaultRouter()
router.register(r'history', PaymentViewSet, basename='payment-history')

urlpatterns = [
    path('create-order/', create_payment_order, name='payment-create-order'),
    path('verify/', verify_payment, name='payment-verify'),
    path('checkout/<uuid:payment_id>/', hosted_checkout_page, name='payment-hosted-checkout'),
    path('', include(router.urls)),
]
