from rest_framework import serializers

from users.models import LearnerProfile, User


class LearnerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnerProfile
        fields = [
            "target_language",
            "proficiency_level",
            "daily_streak",
            "timezone",
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = LearnerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]
        read_only_fields = ["id", "username"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    target_language = serializers.CharField(write_only=True)
    proficiency_level = serializers.ChoiceField(
        choices=LearnerProfile.ProficiencyLevel.choices,
        write_only=True,
    )

    class Meta:
        model = User
        fields = ["username", "email", "password", "target_language", "proficiency_level"]

    def create(self, validated_data):
        target_language = validated_data.pop("target_language")
        proficiency_level = validated_data.pop("proficiency_level")
        user = User.objects.create_user(**validated_data)
        LearnerProfile.objects.create(
            user=user,
            target_language=target_language,
            proficiency_level=proficiency_level,
        )
        return user
