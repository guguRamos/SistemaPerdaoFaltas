import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Importando as páginas
import AbsencesAluno from "./pages/AbsencesAluno";
import RequestsAluno from "./pages/RequestsAluno";
import DashboardAdminProfessor from "./pages/DashboardAdminProfessor";

import AbsencesProfessor from "./pages/AbsencesProfessor";
import RequestsProfessor from "./pages/RequestsProfessor";

// Função de Logout
function Logout() {
  localStorage.clear();
  return <Navigate to="/auth/login/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 Rotas de Autenticação */}
        <Route path="/auth/login/" element={<Login />} />
        <Route
          path="/auth/register/"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Register />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Rotas para ALUNOS */}
        <Route
          path="/aluno/absences/"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <AbsencesAluno />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aluno/forgiveness-requests/"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RequestsAluno />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Dashboard para PROFESSORES e ADMINISTRADORES */}
        <Route
          path="/dashboard/"
          element={
            <ProtectedRoute allowedRoles={["professor", "admin"]}>
              <DashboardAdminProfessor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/absences/professor"
          element={
            <ProtectedRoute allowedRoles={["professor", "admin"]}>
              <AbsencesProfessor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/requests/"
          element={
            <ProtectedRoute allowedRoles={["professor", "admin"]}>
              <RequestsProfessor />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Logout */}
        <Route path="/logout" element={<Logout />} />

        {/* 🔹 Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
