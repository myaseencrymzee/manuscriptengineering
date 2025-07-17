from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.filters import SearchFilter
from api.core.pagination import Pagination
from .models import Blog, BlogComments, BlogImage
from .serializers import BlogCommentsSerializer, BlogSerializer, BlogImageSerializer
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from api.core.choices import Status
from rest_framework.exceptions import PermissionDenied


class BlogModelFilters(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Status)

    class Meta:
        model = Blog
        fields = ['status']

class BlogViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = BlogSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'content', 'date', 'author__full_name', 'status']  
    filterset_class = BlogModelFilters

    def get_queryset(self):
        return Blog.objects.select_related('author').prefetch_related('images').order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class BlogImageViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BlogImageSerializer

    def get_queryset(self):
        return BlogImage.objects.all()
    
class BlogCommentsViewSet(ModelViewSet):
    serializer_class = BlogCommentsSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = Pagination

    def get_queryset(self):
        blog_id = self.kwargs.get('blog_id')
        return BlogComments.objects.filter(blog_id=blog_id)
    
    def perform_create(self, serializer):
        """Pass request context to serializer so it can get blog_id"""
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        """Ensure users can only delete their own comments"""
        instance = self.get_object()
        if instance.user != request.user:
            raise PermissionDenied("You can only delete your own comments.")
        return super().destroy(request, *args, **kwargs)
