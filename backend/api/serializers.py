from rest_framework import serializers
from .models import User, Absence, ForgivenessRequest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "role","name", "date_joined"]
        extra_kwargs = {
            "password": {"write_only": True},
            "date_joined": {"read_only": True},
        }

    def create(self, validated_data):
        role = validated_data.pop('role', None)
        name = validated_data.pop('name', None)
        user = User.objects.create_user(**validated_data)
        if role:
            user.role = role
        if name:
            user.name = name
        user.save()
        return user


class AbsencesSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = Absence
        fields = ["id", "student", "student_username", "discipline", "date", "reason", "created_at"]
        extra_kwargs = {
            "created_at": {"read_only": True},
            "reason": {"allow_blank": True},
        }
    
    def create(self, validated_data):
        student = validated_data.get("student")
        if student.role != "student":
            raise serializers.ValidationError("A falta só pode ser atribuída a um estudante.")

        absence = Absence.objects.create(**validated_data)
        return absence


class ForgivenessRequestsSerializer(serializers.ModelSerializer):
    absence_details = AbsencesSerializer(source="absence", read_only=True)

    class Meta:
        model = ForgivenessRequest
        fields = [
            "id",
            "absence",
            "absence_details",
            "justification_file",
            "status",
            "comments",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
            "status": {"read_only": True},  
        }
        
    def create(self, validated_data):
        absence = validated_data.get("absence")
        
        if ForgivenessRequest.objects.filter(absence=absence, status="PENDING").exists():
            raise serializers.ValidationError("Já existe um pedido pendente para esta ausência.")

        request = ForgivenessRequest.objects.create(**validated_data)
        return request