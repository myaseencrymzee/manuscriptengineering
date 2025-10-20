# payments/serializers.py
from rest_framework import serializers
from .models import OrderTransaction, OrderDownloadToken

class OrderTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTransaction
        fields = "__all__"

class OrderDownloadTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderDownloadToken
        fields = "__all__"
