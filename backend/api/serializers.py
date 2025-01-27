from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Absence, ForgivenessRequest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "role","name", "date_joined"]
        extra_kwargs = {
            "password": {"write_only": True},
            "role": {"read_only": True},
            "date_joined": {"read_only": True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class AbsencesSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = Absence
        fields = ["id", "student", "student_username", "discipline", "date", "reason", "created_at"]
        extra_kwargs = {
            "created_at": {"read_only": True},
        }


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
