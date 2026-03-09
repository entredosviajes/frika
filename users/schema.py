import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required

from users.models import LearnerProfile, User


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "email", "profile")


class LearnerProfileType(DjangoObjectType):
    class Meta:
        model = LearnerProfile
        fields = (
            "id",
            "target_language",
            "proficiency_level",
            "daily_streak",
            "timezone",
            "created_at",
            "updated_at",
        )


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)

    @login_required
    def resolve_me(self, info):
        return info.context.user


class Register(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        target_language = graphene.String(required=True)
        proficiency_level = graphene.String(required=True)

    user = graphene.Field(UserType)

    def mutate(self, info, username, email, password, target_language, proficiency_level):
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        LearnerProfile.objects.create(
            user=user,
            target_language=target_language,
            proficiency_level=proficiency_level,
        )
        return Register(user=user)


class UpdateProfile(graphene.Mutation):
    class Arguments:
        target_language = graphene.String()
        proficiency_level = graphene.String()
        timezone = graphene.String()

    profile = graphene.Field(LearnerProfileType)

    @login_required
    def mutate(self, info, **kwargs):
        profile = info.context.user.profile
        for field, value in kwargs.items():
            if value is not None:
                setattr(profile, field, value)
        profile.save()
        return UpdateProfile(profile=profile)


class Mutation(graphene.ObjectType):
    register = Register.Field()
    update_profile = UpdateProfile.Field()
