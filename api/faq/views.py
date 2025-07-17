from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from api.core.pagination import Pagination
from . serializers import FAQSerializer
from rest_framework.filters import SearchFilter
from . models import FAQ
# Create your views here.

class FAQViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter]
    search_fields = ['question', 'answer']

