from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.serializers import LearnerProfileSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = LearnerProfileSerializer

    def get_object(self):
        return self.request.user.profile
