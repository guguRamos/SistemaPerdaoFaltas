import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardAdminProfessor() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem("user_role");
    if (!userRole) {
      navigate("/auth/login/");
    }
    setRole(userRole);
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Acesso comum para professores e administradores */}
      <div>
        <h2>Gerenciar Faltas</h2>
        <button onClick={() => navigate("/absences/professor/")}>
          Registrar Faltas
        </button>
        <button onClick={() => navigate("/professor/requests/")}>
          Pedidos de Justificativa
        </button>
      </div>

      {/* Exibição da aba de cadastro apenas para ADMIN */}
      {role === "admin" && (
        <div>
          <h2>Gestão de Usuários</h2>
          <button onClick={() => navigate("/auth/register/")}>
            Cadastrar Novo Usuário
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardAdminProfessor;
