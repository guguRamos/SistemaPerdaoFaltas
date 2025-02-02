import { useEffect, useState } from "react";
import axios from "axios";
import { ACCESS_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";

function AbsenceList() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem("user_role"); // Supondo que a role seja armazenada após o login
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    console.log
    const fetchAbsences = async () => {
      try {
        let url = "/api/absences/";
        
        // Alunos veem apenas suas próprias faltas
        if (userRole === "student") {
          url = `/api/absences/?student=${userId}`; 
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          },
        });
        setAbsences(response.data);
      } catch (error) {
        setError("Erro ao carregar as faltas");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, [userRole, userId]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleForgivenessRequest = (absenceId) => {
    // Lógica para o aluno solicitar perdão para a falta
    console.log(`Solicitando perdão para a falta de ID: ${absenceId}`);
    // Você pode fazer uma requisição à API para criar a solicitação de perdão
  };

  const handleMarkAbsence = (absenceId, isAbsent) => {
    // Lógica para o professor ou admin marcar a falta
    console.log(`Marcando a falta com ID: ${absenceId} como ${isAbsent ? "presente" : "ausente"}`);
    // Você pode fazer uma requisição à API para atualizar o status da falta
  };

  return (
    <div>
      <h2>{userRole === "student" ? "Minhas Faltas" : "Faltas de Todos os Alunos"}</h2>
      <table>
        <thead>
          <tr>
            <th>{userRole === "student" ? "Disciplina" : "Aluno"}</th>
            <th>Data</th>
            <th>Motivo</th>
            {userRole === "student" && <th>Solicitar Perdão</th>}
            {userRole !== "student" && <th>Marcar Falta</th>}
          </tr>
        </thead>
        <tbody>
          {absences.map((absence) => (
            <tr key={absence.id}>
              <td>{userRole === "student" ? absence.discipline : absence.student_username}</td>
              <td>{absence.date}</td>
              <td>{absence.reason || "Motivo não informado"}</td>
              {userRole === "student" && (
                <td>
                  <button onClick={() => handleForgivenessRequest(absence.id)}>
                    Solicitar Perdão
                  </button>
                </td>
              )}
              {userRole !== "student" && (
                <td>
                  <input
                    type="checkbox"
                    checked={absence.isAbsent} // Supondo que o status da falta tenha esse campo
                    onChange={(e) =>
                      handleMarkAbsence(absence.id, e.target.checked)
                    }
                  />
                  <textarea
                    placeholder="Justifique a falta"
                    defaultValue={absence.justification || ""}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AbsenceList;
