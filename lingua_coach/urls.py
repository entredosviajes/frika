from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/curriculum/", include("curriculum.urls")),
    path("api/submissions/", include("submissions.urls")),
    path("api/analysis/", include("analysis.urls")),
    path("api/progress/", include("progress.urls")),
]
