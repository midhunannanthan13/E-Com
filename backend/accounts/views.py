from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/accounts/register/  -> Sign Up (open to anyone)."""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': f'Account created. Welcome, {user.username}! (id #{user.id})'},
            status=201,
        )


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Sign In: issues a JWT access + refresh token pair, and embeds the user
    object in the response so the frontend doesn't need a second request
    right after logging in.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    """POST /api/accounts/login/  -> Sign In."""
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(APIView):
    """GET/PUT /api/accounts/profile/  -> the logged-in user's own profile."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
