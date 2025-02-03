from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Model de usuário """
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('professor', 'Professor'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.role})"


class Absence(models.Model):
    """Representa uma falta registrada para um aluno"""
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    discipline = models.CharField(max_length=100)
    date = models.DateField()
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_absent = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.username} - {self.discipline} - {self.date}"


class ForgivenessRequest(models.Model):
    """Solicitação de perdão de falta associada a uma falta"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pendente'),
        ('APPROVED', 'Aprovado'),
        ('REJECTED', 'Rejeitado'),
    ]
    
    absence = models.ForeignKey(Absence, on_delete=models.CASCADE)
    justification_file = models.FileField(upload_to='justifications/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request for {self.absence.student.username} - Status: {self.status}"
