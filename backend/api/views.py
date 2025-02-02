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

    def put(self, request, *args, **kwargs):
        user = request.user

        # Verifica permissões
        if not user.role in ["professor", "admin"]:
            return Response({"error": "Permissão negada"}, status=status.HTTP_403_FORBIDDEN)

        # Dados da requisição
        user_id = request.data.get("user_id")
        discipline = request.data.get("discipline")
        is_absent = request.data.get("is_absent")  # True = faltou, False = presente
        reason = request.data.get("reason", "")

        # Valida usuário como estudante
        try:
            student = User.objects.get(id=user_id, role="student")
        except User.DoesNotExist:
            return Response({"error": "Usuário não encontrado ou não é um estudante."}, status=status.HTTP_404_NOT_FOUND)

        if is_absent:
            # Registrar falta
            absence, created = Absence.objects.get_or_create(
                student=student,
                discipline=discipline,
                date=now().date(),
                defaults={"reason": ""}
            )
            # Atualizar reason caso já exista a falta
            if not created and reason:
                absence.reason = reason
                absence.save()
            return Response({"message": "Falta registrada", "absence": AbsencesSerializer(absence).data}, status=status.HTTP_201_CREATED)
        else:
            # Remover falta se desmarcar
            deleted, _ = Absence.objects.filter(student=student, discipline=discipline, date=now().date()).delete()
            if deleted:
                return Response({"message": "Falta removida"}, status=status.HTTP_200_OK)
            return Response({"message": "Nenhuma falta encontrada para remover"}, status=status.HTTP_404_NOT_FOUND)

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
        return ForgivenessRequest.objects.none()
    
#Atualizar os status da solicitação
#Apenas professores rejeitam ou aprovam uma solicitação
class ForgivenessRequestUpdateView(generics.UpdateAPIView):
    queryset = ForgivenessRequest.objects.all()
    serializer_class = ForgivenessRequestsSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfessor | IsAdmin]  # Admins também podem aprovar/rejeitar


    def perform_update(self, serializer):
        serializer.save(status=self.request.data.get("status"))

