from django.shortcuts import render
from rest_framework import generics
from . models import SubscriptionPopup
from . serializer import SubscriptionPopupSerializer
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
# Create your views here.

class SubscriptionPopupViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPopup.objects.all()
    serializer_class = SubscriptionPopupSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return SubscriptionPopup.objects.last()
