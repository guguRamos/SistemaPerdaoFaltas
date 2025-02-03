from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import User, Absence, ForgivenessRequest
from .serializers import UserSerializer, AbsencesSerializer, ForgivenessRequestsSerializer
from .permissions import IsAdmin, IsProfessor, IsStudent
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now

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
    
class StudentListView(generics.ListAPIView):
    queryset = User.objects.filter(role='student')  # Filtra apenas estudantes
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
class AbsenceUpdateView(generics.UpdateAPIView):
    queryset = Absence.objects.all()
    serializer_class = AbsencesSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfessor | IsAdmin]

    def put(self, request, pk, *args, **kwargs):
        user = request.user

        # Verifica permissões
        if user.role not in ["professor", "admin"]:
            return Response({"error": "Permissão negada"}, status=status.HTTP_403_FORBIDDEN)

        try:
            absence = Absence.objects.get(id=pk)
        except Absence.DoesNotExist:
            return Response({"error": "Falta não encontrada."}, status=status.HTTP_404_NOT_FOUND)

        # Obtém os dados da requisição
        discipline = request.data.get("discipline", absence.discipline)
        is_absent = request.data.get("is_absent", absence.is_absent)
        reason = request.data.get("reason", absence.reason)

        # Atualiza os campos necessários
        absence.discipline = discipline
        absence.is_absent = is_absent
        absence.reason = reason
        absence.save()

        return Response({"message": "Falta atualizada com sucesso", "absence": AbsencesSerializer(absence).data}, status=status.HTTP_200_OK)


class AbsenceCheckView(generics.ListAPIView):
    queryset = Absence.objects.all()
    serializer_class = AbsencesSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        elif user.role == "student":
            return ForgivenessRequest.objects.filter(absence__student=user)  # Estudantes veem suas próprias solicitações
        return ForgivenessRequest.objects.none()

#Atualizar os status da solicitação
#Apenas professores rejeitam ou aprovam uma solicitação
class ForgivenessRequestUpdateView(generics.UpdateAPIView):
    queryset = ForgivenessRequest.objects.all()
    serializer_class = ForgivenessRequestsSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfessor | IsAdmin]  # Admins também podem aprovar/rejeitar


    def perform_update(self, serializer):
        serializer.save(status=self.request.data.get("status"))

