import { useEffect, useState } from "react";
import api from "../api";
import { getAuthToken, getUserRole } from "../utils/authHelpers";
import Header from "../components/Header";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const token = getAuthToken();
  const userRole = getUserRole();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      let token = getAuthToken();

      try {
        const params = userRole === "professor" && showPendingOnly ? { status: "PENDING" } : {};
        const response = await api.get("/api/forgiveness-requests/", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setRequests(response.data);
      } catch (err) {
        console.error("Erro ao carregar solicitações:", err);
        if (err.response?.status === 401) {
          try {
            token = await refreshToken();
            if (token) {
              const retryResponse = await api.get("/api/forgiveness-requests/", {
                headers: { Authorization: `Bearer ${token}` },
              });
              setRequests(retryResponse.data);
            } else {
              throw new Error("Erro ao atualizar token");
            }
          } catch {
            setError("Sessão expirada. Faça login novamente.");
            localStorage.clear();
          }
        } else {
          setError("Erro ao carregar as solicitações.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRequests();
    } else {
      setError("Usuário não autenticado. Faça login novamente.");
      setLoading(false);
    }
  }, [token, showPendingOnly]);

  const handleCommentChange = async (id, newComment, request) => {
    try {
      if (!request) {
        console.error("Erro: request está indefinido!");
        return;
      }

      const payload = {
        id: id,
        absence: request?.absence || null,
        justification_file: request?.justification_file || null,
        status: request?.status || "PENDING",
        comments: newComment,
      };

      console.log("Enviando JSON:", payload);

      await api.put(`/api/forgiveness-requests/${id}/update/`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Comentário atualizado com sucesso!");
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, comments: newComment } : req))
      );
    } catch (error) {
      console.error("Erro ao atualizar o comentário:", error);
    }
  };

  const handleStatusChange = async (id, newStatus, request) => {
    try {
        const payload = {
            id: id,
            absence: request.absence || null,
            justification_file: request.justification_file || null,
            status: newStatus, // Aqui deve ser newStatus, pois é o que o usuário alterou
            comments: request.comments || "", // Mantendo os comentários atuais
        };

        await api.put(`/api/forgiveness-requests/${id}/update/`, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Status atualizado com sucesso!");

        setRequests((prev) =>
            prev.map((req) =>
                req.id === id ? { ...req, status: newStatus } : req
            )
        );
    } catch (error) {
        console.error("Erro ao atualizar o status:", error);
    }
};

  
  
  

const downloadFile = (filePath) => {
    if (!filePath) {
      console.error("Arquivo não disponível.");
      return;
    }
  
    const fileUrl = `justifcations/media/${filePath}`;
    window.open(fileUrl, "_blank");
  };
  

  const navigation = [
    { name: "Home", href: "/dashboard/", current: false },
    { name: "Gerenciar Faltas", href: "/absences/professor/", current: false },
    { name: "Solicitações de Perdão", href: "/professor/requests/", current: true },
    ...(userRole === "admin" ? [{ name: "Cadastrar Novo Usuário", href: "/auth/register", current: false }] : []),
  ];

  const filteredRequests = showPendingOnly
    ? requests.filter(request => request.status === "PENDING")
    : requests;

  if (loading) return <p className="text-center">Carregando...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-full">
      <Header navigation={navigation} />

      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Solicitações de Perdão {userRole === "student" && "do Aluno"}
        </h1>

        {(userRole === "admin") && (
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => setShowPendingOnly(!showPendingOnly)}
              className={`px-4 py-2 rounded-lg ${
                showPendingOnly 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {showPendingOnly ? "Mostrar Todas" : "Mostrar Apenas Pendentes"}
            </button>
          </div>
        )}

        <table className="w-full border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-black text-white">
              {(userRole === "professor" || userRole === "admin") && (
                <>
                  <th className="border p-3">Disciplina</th>
                  <th className="border p-3">Data</th>
                  <th className="border p-3">Justificativa</th>
                  <th className="border p-3">Comentário</th>
                  <th className="border p-3">Status</th>
                </>
              )}
              {userRole === "student" && (
                <>
                  <th className="border p-3">Disciplina</th>
                  <th className="border p-3">Data</th>
                  <th className="border p-3">Justificativa</th>
                  <th className="border p-3">Comentário do Professor</th>
                  <th className="border p-3">Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} className="border-b hover:bg-gray-100">
                {(userRole === "professor" || userRole === "admin") && (
                  <>
                    <td className="border p-3">{request.absence_details.discipline}</td>
                    <td className="border p-3">{new Date(request.created_at).toLocaleString("pt-BR")}</td>
                    <td className="border p-3">
                      <button
                        onClick={() => downloadFile(request.justification_file)}
                        className="text-blue-600 hover:underline"
                      >
                        Ver Arquivo
                      </button>
                    </td>
                    <td className="border p-3">
                    <input
                        type="text"
                        defaultValue={request.comments || ""}
                        onBlur={(e) => handleCommentChange(
                            request.id,
                            e.target.value,
                            request // Passando o objeto correto
                        )}
                        />

                    </td>
                    <td className="border p-3">
                    <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value, request)}
                        className="bg-transparent"
                    >
                        <option value="PENDING">Pendente</option>
                        <option value="APPROVED">Aprovado</option>
                        <option value="REJECTED">Rejeitado</option>
                    </select>

                        </td>
                  </>
                )}

                {userRole === "student" && (
                  <>
                    <td className="border p-3">{request.absence_details.discipline}</td>
                    <td className="border p-3">{new Date(request.created_at).toLocaleString("pt-BR")}</td>
                    <td className="border p-3">
                      <button
                        onClick={() => downloadFile(request.justification_file)}
                        className="text-blue-600 hover:underline"
                      >
                        Ver Arquivo
                      </button>
                    </td>
                    <td className="border p-3">
                    <span>{request.comments || "Sem comentário"}</span>
                    </td>


                    <td className="border p-3">
                      <span className={
                        request.status === "APPROVED" ? "text-green-500" :
                        request.status === "REJECTED" ? "text-red-500" :
                        "text-yellow-500"
                      }>
                        {request.status}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Requests;