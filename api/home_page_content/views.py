# views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import HomePageVideo
from .serializers import HomePageVideoSerializer
from django.shortcuts import get_object_or_404
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
import django_filters


class HomePageVideoModelFilters(django_filters.FilterSet):

    class Meta:
        model = HomePageVideo
        fields = ['title']



class HomePageVideoViewSet(viewsets.ModelViewSet):
    queryset = HomePageVideo.objects.all()
    serializer_class = HomePageVideoSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['title']  
    filterset_class = HomePageVideoModelFilters

    def create(self, request, *args, **kwargs):
        # Deactivate all other videos when uploading a new one
        HomePageVideo.objects.all().update(is_active=False)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # If making this video active, deactivate others
        if 'is_active' in request.data and request.data['is_active']:
            HomePageVideo.objects.exclude(pk=instance.pk).update(is_active=False)
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Custom action to get the active video"""
        video = get_object_or_404(HomePageVideo, is_active=True)
        serializer = self.get_serializer(video)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Custom action to set a video as active"""
        video = self.get_object()
        HomePageVideo.objects.exclude(pk=video.pk).update(is_active=False)
        video.is_active = True
        video.save()
        return Response({'status': 'video set as active'})