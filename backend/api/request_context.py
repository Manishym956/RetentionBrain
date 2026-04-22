import hashlib

from django.conf import settings
from django.contrib.auth.models import User

from .models import UserProfile


def get_request_user(request):
    request_user = getattr(request, "user", None)
    if request_user is not None and request_user.is_authenticated:
        return request.user

    client_id = (
        request.headers.get("X-RetentionBrain-Client-Id")
        or request.META.get("HTTP_X_RETENTIONBRAIN_CLIENT_ID")
        or "public"
    )
    client_hash = hashlib.sha256(client_id.encode("utf-8")).hexdigest()[:20]
    username = f"{settings.ANONYMOUS_USER_PREFIX}_{client_hash}"

    user, created = User.objects.get_or_create(
        username=username,
        defaults={"email": f"{username}@anonymous.retentionbrain.local"},
    )
    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])

    UserProfile.objects.get_or_create(
        user=user,
        defaults={"full_name": "Guest Workspace"},
    )
    return user
