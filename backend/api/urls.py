from django.urls import path
from api import views

urlpatterns = [
    path("auth/register", views.UserCreateView.as_view(), name="register"),
    path("user", views.UserListView.as_view(), name="user-list"),
]
