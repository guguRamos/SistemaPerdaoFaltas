import { useEffect, useState } from "react";
import api from "../api";
import { getAuthToken, getUserRole } from "../utils/authHelpers";

function AbsenceList() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = getAuthToken();
  const userRole = getUserRole(); 

  useEffect(() => {
    const fetchAbsences = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/api/absences/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAbsences(response.data);
      } catch (err) {
        setError("Erro ao carregar as faltas.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAbsences();
    } else {
      setError("Usuário não autenticado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  const handleAbsenceChange = async (absence, isChecked) => {
    try {
      await api.put(
        "/api/absences/update/",
        {
          user_id: absence.user_id,
          discipline: absence.discipline,
          is_absent: isChecked,
          reason: absence.reason || "Esse é o motivo",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Atualizar o estado local para refletir a mudança
      setAbsences((prevAbsences) =>
        prevAbsences.map((a) =>
          a.id === absence.id ? { ...a, is_absent: isChecked } : a
        )
      );
    } catch (err) {
      setError("Erro ao atualizar a falta.");
    }
  };

  if (loading) return <p className="text-center">Carregando...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const renderActions = (absence) => {
    if (userRole === "admin" || userRole === "professor") {
      return (
        <td className="border p-3 flex justify-center items-center">
          <input
            type="checkbox"
            checked={absence.is_absent}
            onChange={(e) => handleAbsenceChange(absence, e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </td>
      );
    }
    return (
      <td className="border p-3 text-gray-500">
        {absence.is_absent ? "Falta Marcada" : "Presente"}
      </td>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Controle de Faltas</h1>

      {userRole !== "student" && (
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Pesquise o nome do Aluno"
            className="w-1/3 px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300 text-center">
        <thead>
          <tr className="bg-black text-white">
            <th className="border p-3">Aluno</th>
            <th className="border p-3">Comentário</th>
            <th className="border p-3">Disciplina</th>
            <th className="border p-3">Data</th>
            <th className="border p-3">Falta</th>
          </tr>
        </thead>
        <tbody>
          {absences.map((absence) => (
            <tr key={absence.id} className="border-b hover:bg-gray-100">
              <td className="border p-3">{absence.student_username}</td>
              <td className="border p-3">{absence.reason || "—"}</td>
              <td className="border p-3">{absence.discipline}</td>
              <td className="border p-3">{absence.date}</td>
              {renderActions(absence)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AbsenceList;