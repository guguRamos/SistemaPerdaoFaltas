from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import User, Absence, ForgivenessRequest
from .serializers import UserSerializer, AbsencesSerializer, ForgivenessRequestsSerializer
from .permissions import IsAdmin, IsProfessor, IsStudent

# View de Usuários

#Registra usuários
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]  # Todos podem criar uma conta

#Lista Usuários
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
