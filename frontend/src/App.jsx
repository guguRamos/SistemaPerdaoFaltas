import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Importando as páginas específicas
import AbsencesAluno from "./pages/AbsencesAluno";
import RequestsAluno from "./pages/RequestsAluno";
import AbsencesProfessor from "./pages/AbsencesProfessor";
import RequestsProfessor from "./pages/RequestsProfessor";

// Função de Logout
function Logout() {
  localStorage.clear();
  return <Navigate to="/api/auth/login" />;
}

// Componente principal
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rotas para Alunos */}
        <Route
          path="/aluno/faltas"
          element={
            <ProtectedRoute>
              <AbsencesAluno />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aluno/pedidos"
          element={
            <ProtectedRoute>
              <RequestsAluno />
            </ProtectedRoute>
          }
        />

        {/* Rotas para Professores */}
        <Route
          path="/professor/faltas"
          element={
            <ProtectedRoute>
              <AbsencesProfessor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professor/pedidos"
          element={
            <ProtectedRoute>
              <RequestsProfessor />
            </ProtectedRoute>
          }
        />

        {/* Rotas públicas */}
        <Route path="/api/auth/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
