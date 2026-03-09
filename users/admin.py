from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from users.models import LearnerProfile, User


class LearnerProfileInline(admin.StackedInline):
    model = LearnerProfile
    can_delete = False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = [LearnerProfileInline]
