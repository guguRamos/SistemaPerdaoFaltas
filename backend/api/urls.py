from django.urls import path
from api import views
from api.views import CustomTokenObtainPairView

urlpatterns = [
    # Rotas de Autenticação
    path("auth/register/", views.UserCreateView.as_view(), name="register"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("user/", views.UserListView.as_view(), name="user-list"),
    path("students/", views.StudentListView.as_view(), name="student-list"),

    # Rotas de Faltas
    path("absences/", views.AbsenceListView.as_view(), name="absence-list"),
    path("absences/create/", views.AbsenceCreateView.as_view(), name="absence-create"), 
    path('absences/check/', views.AbsenceCheckView.as_view(), name='absence-check'), 
    path("absences/update/<int:pk>/", views.AbsenceUpdateView.as_view(), name="absence-update"),

    # Rotas de Solicitações de Perdão
    path("forgiveness-requests/", views.ForgivenessRequestListView.as_view(), name="forgiveness-request-list"), 
    path("forgiveness-requests/create/", views.ForgivenessRequestCreateView.as_view(), name="forgiveness-request-create"), 
    path("forgiveness-requests/<int:pk>/update/", views.ForgivenessRequestUpdateView.as_view(), name="forgiveness-request-update"), 
]
