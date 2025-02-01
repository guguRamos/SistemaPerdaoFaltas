from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import User, Absence, ForgivenessRequest
from .serializers import UserSerializer, AbsencesSerializer, ForgivenessRequestsSerializer
from .permissions import IsAdmin, IsProfessor, IsStudent
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status

class CustomTokenObtainPairView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # O usuário é recuperado a partir do serializer
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.user  # Obtem o usuário autenticado

            response.data.update({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            })
        return response

# View de Usuários

#Registra usuários
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]  # Apenas o adm pode criar uma conta

#Lista Usuários
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

#View de Faltas

#Listagem de Faltas
#Professores veem as faltas de todo mundo, alunos veem apenas as próprias faltas
class AbsenceListView(generics.ListAPIView):
    serializer_class = AbsencesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["professor", "admin"]:
            return Absence.objects.all()  # Professores veem todas as faltas
        elif user.role == "student":
            return Absence.objects.filter(student=user)  # Alunos veem suas faltas
        return Absence.objects.none()

#Criar as faltas
class AbsenceCreateView(generics.CreateAPIView):
    serializer_class = AbsencesSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfessor | IsAdmin]

    def perform_create(self, serializer):
        serializer.save()

#View de solicitação de Perdão

#Criar a solicitação
#Apenas os alunos criam a solicitação
class ForgivenessRequestCreateView(generics.CreateAPIView):
    serializer_class = ForgivenessRequestsSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(absence=serializer.validated_data.get('absence'))  # Liga a falta a solicitação

#Listar solicitações
#Professores veem as pendentes e os adms veem todas
class ForgivenessRequestListView(generics.ListAPIView):
    serializer_class = ForgivenessRequestsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "professor":
            return ForgivenessRequest.objects.filter(status="PENDING")  # Professores veem apenas pendentes
        elif user.role == "admin":
            return ForgivenessRequest.objects.all()  # Admins veem tudo
        return ForgivenessRequest.objects.none()
    
#Atualizar os status da solicitação
#Apenas professores rejeitam ou aprovam uma solicitação
class ForgivenessRequestUpdateView(generics.UpdateAPIView):
    queryset = ForgivenessRequest.objects.all()
    serializer_class = ForgivenessRequestsSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfessor | IsAdmin]  # Admins também podem aprovar/rejeitar


    def perform_update(self, serializer):
        serializer.save(status=self.request.data.get("status"))

