from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from . models import *
from . serializers import *
from api.core.pagination import Pagination
# Create your views here.


class CourseViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        data =  super().get_queryset().order_by("-id")
        return data
    

class CourseVideosViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = CourseVideo.objects.all()
    serializer_class = CourseVideoSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter]
    search_fields = ["title", "description"]


class CoachingViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Coaching.objects.all()
    serializer_class = CoachingSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter]
    search_fields = ["title", "description"]


class ConsultingViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Consulting.objects.all()
    serializer_class = ConsultingSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter]
    search_fields = ["title", "description"]


class SpeakingViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Speaking.objects.all()
    serializer_class = SpeakingSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter]
    search_fields = ["title", "description"]


class ManuscriptViewSet(ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Manuscript.objects.all()
    serializer_class = ManuscriptSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter]
    search_fields = ["title", "description"]
