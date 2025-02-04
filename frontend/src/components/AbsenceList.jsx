import { useEffect, useState } from "react";
import api from "../api";
import { getAuthToken, getUserRole } from "../utils/authHelpers";
import Header from "./Header";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function AbsenceList() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = getAuthToken();
  const userRole = getUserRole();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    const fetchAbsences = async () => {
        setLoading(true);
        setError(null);
    
        let token = getAuthToken(); // Token inicial

        try {
          const params = showAll ? {} : { date: selectedDate };
          const [absencesResponse, forgivenessResponse] = await Promise.all([
            api.get("/api/absences/", { params, headers: { Authorization: `Bearer ${token}` } }),
            api.get("/api/forgiveness-requests/", { headers: { Authorization: `Bearer ${token}` } }),
          ]);
        
            const forgivenessRequestsMap = {};
            forgivenessResponse.data.forEach(request => {
                forgivenessRequestsMap[request.absence] = true;
            });
        
            const updatedAbsences = absencesResponse.data.map(absence => ({
                ...absence,
                has_justification: absence.has_justification || false,
                has_forgiveness_request: forgivenessRequestsMap[absence.id] || false,
            }));

            console.log("Absences recebidas:", updatedAbsences);


            setAbsences(updatedAbsences);
        } catch (err) {
            console.error("Erro na requisição:", err);
            if (err.response?.data) {
                console.error("Detalhes do erro:", err.response.data);
            }

            if (err.response?.status === 401) {
                try {
                    token = await refreshToken();
                    if (token) {
                        const retryResponse = await api.get("/api/absences/", {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        setAbsences(retryResponse.data);
                    } else {
                        throw new Error("Erro ao atualizar token");
                    }
                } catch {
                    setError("Sessão expirada. Faça login novamente.");
                    localStorage.clear();
                }
            } else {
                setError("Erro ao carregar as faltas.");
            }
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
}, [selectedDate, showAll]);

  

const handleFileUpload = async (absenceId, file) => {
  if (!file) {
    console.error("Nenhum arquivo selecionado.");
    return;
  }

  const formData = new FormData();
  formData.append("absence", absenceId); // ID da ausência associada
  formData.append("justification_file", file); // Arquivo da justificativa

  try {
    const response = await api.post("/api/forgiveness-requests/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    console.log("Justificativa enviada com sucesso!", response.data);
  } catch (error) {
    console.error("Erro ao enviar justificativa:", error);
  }
};


  const handleAbsenceChange = async (absence, updatedFields) => {
    try {
      const response = await api.put(
        `/api/absences/update/${absence.id}/`,
        {
          user_id: absence.student,
          discipline: updatedFields.discipline || absence.discipline,
          is_absent: updatedFields.is_absent ?? absence.is_absent,
          reason: updatedFields.reason || absence.reason || "Motivo atualizado",
        },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      setAbsences((prevAbsences) =>
        prevAbsences.map((a) => (a.id === absence.id ? { ...a, ...updatedFields } : a))
      );
    } catch (err) {
      setError("Erro ao atualizar a falta.");
    }
  };
  
  
  const filteredAbsences = absences.filter((absence) =>
    absence.student_username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center">Carregando...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const navigation = [
    { name: "Home", href: "/dashboard/", current: false },
    { name: "Gerenciar Faltas", href: "/absences/professor/", current: true },
    { name: "Solicitações de Perdão", href: "/professor/requests/", current: false },
    ...(userRole === "admin" ? [{ name: "Cadastrar Novo Usuário", href: "/auth/register", current: false }] : []),
  ];

  const renderActions = (absence) => {
    if (userRole === "admin" || userRole === "professor") {
      return (
        <td className="border p-3">
        {userRole === "admin" || userRole === "professor" ? (
            <input
            type="checkbox"
            checked={absence.is_absent || false}
            onChange={(e) =>
                handleAbsenceChange(absence, { is_absent: e.target.checked })
            }
            className="w-6 h-6 cursor-pointer accent-blue-500"
            />
        ) : (
            <span className={absence.is_absent ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
            {absence.is_absent ? "Falta" : "Presente"}
            </span>
            
        )}
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
    <div className="min-h-full">
      <Header navigation={navigation} />

      {/* Conteúdo Principal */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Controle de Faltas</h1>

        {/* 🔍 Input de busca */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <input
              type="text"
              placeholder="Pesquisar aluno..."
              className="px-4 py-2 border rounded-lg shadow focus:ring-2 focus:ring-blue-500 flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg shadow"
                disabled={showAll}
              />
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {showAll ? "Filtrar por data" : "Ver todas"}
              </button>
            </div>
          </div>
        

        <table className="w-full border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-black text-white">
              <th className="border p-3">Aluno</th>
              <th className="border p-3">Razão</th>
              <th className="border p-3">Disciplina</th>
              <th className="border p-3">Data</th>
              <th className="border p-3">Falta</th>
              {userRole === "student" && <th className="border p-3">Solicitação de Perdão</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAbsences.map((absence) => (
                <tr key={absence.id} className="border-b hover:bg-gray-100">
                <td className="border p-3">{absence.student_username}</td>

                {/* 🔹 Professores/Admins podem editar o Comentário */}
                <td className="border p-3">
                {userRole === "admin" || userRole === "professor" ? (
                    <textarea
                    className="border p-1 w-full"
                    placeholder="Justifique a falta"
                    defaultValue={absence.reason || ""}
                    onBlur={(e) => {
                        handleAbsenceChange(absence, { reason: e.target.value.trim() || "" });
                    }}
                    />
                ) : (
                    absence.reason || "—"
                )}
                </td>


                {/* 🔹 Professores/Admins podem editar a Disciplina */}
                <td className="border p-3">
                    {userRole === "admin" || userRole === "professor" ? (
                    <input
                        type="text"
                        className="border p-1 w-full"
                        defaultValue={absence.discipline}
                        onBlur={(e) =>
                        handleAbsenceChange(absence, { discipline: e.target.value })
                        }
                    />
                    ) : (
                    absence.discipline
                    )}
                </td>

                <td className="border p-3">{absence.date}</td>
                {renderActions(absence)}

                
                {userRole === "student" && (
                    <td className="border p-3">
                        {absence.has_forgiveness_request ? (
                        <span className="text-green-500 font-semibold">Solicitação Enviada</span>
                        ) : (
                        <label className="cursor-pointer bg-black text-white px-3 py-2 rounded hover:bg-gray-800 disabled:opacity-50">
                            Solicitar Perdão
                            <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(absence.id, e)}
                            disabled={absence.has_forgiveness_request} 
                            />
                        </label>
                        )}
                    </td>
                    )}

                </tr>
            ))}
            </tbody>

        </table>
      </div>
    </div>
  );
}

export default AbsenceList;