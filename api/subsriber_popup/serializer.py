from rest_framework import serializers
from . models import SubscriptionPopup

class SubscriptionPopupSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPopup
        fields = ['id', 'title', 'message', 'lead_magnet_image', 'lead_magnet_pdf']
