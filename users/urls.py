from django.urls import path

from users import views

app_name = "users"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("me/", views.MeView.as_view(), name="me"),
    path("profile/", views.ProfileUpdateView.as_view(), name="profile-update"),
]
