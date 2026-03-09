import os

from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


@csrf_exempt
@require_http_methods(["PUT"])
def local_upload(request, path):
    """Handle local file uploads during development (replaces S3 presigned URLs)."""
    media_root = getattr(settings, "MEDIA_ROOT", settings.BASE_DIR / "media")
    full_path = os.path.join(media_root, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    with open(full_path, "wb") as f:
        for chunk in request:
            f.write(chunk)

    return HttpResponse(status=200)
