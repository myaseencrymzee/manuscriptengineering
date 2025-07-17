from api.tags.models import Tag
from api.subscribers.models import Subscriber

def get_tags(request):
    tags = Tag.objects.all()
    tags_string = ", ".join([tag.text for tag in tags])
    meta_context = {"keywords": tags_string}
    return {'meta_tags': meta_context}




def subscribed_topics(request):
    if request.user.is_authenticated:
        return {
            "subscribed_topics": list(Subscriber.objects.filter(user=request.user).values_list("topic", flat=True))
        }
    return {"subscribed_topics": []}