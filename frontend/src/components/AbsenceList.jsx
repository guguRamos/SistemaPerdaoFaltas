import { useEffect, useState } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import api from "../api";
import { getAuthToken, getUserRole } from "../utils/authHelpers";

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

  useEffect(() => {
    const fetchAbsences = async () => {
        setLoading(true);
        setError(null);
      
        let token = getAuthToken(); // Pega o token atual
        console.log("Token antes da requisição:", token);
      
        try {
          const response = await api.get("/api/absences/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Dados da API:", response.data);
          setAbsences(response.data);
        } catch (err) {
          if (err.response?.status === 401) { // Se for erro 401 (Unauthorized)
            console.log("Token expirado, tentando atualizar...");
            token = await refreshToken();
            
            if (token) {
              console.log("Token atualizado, refazendo requisição...");
              try {
                const retryResponse = await api.get("/api/absences/", {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setAbsences(retryResponse.data);
              } catch (retryErr) {
                console.error("Erro ao refazer requisição:", retryErr);
                setError("Erro ao carregar as faltas.");
              }
            } else {
              console.error("Refresh token falhou, redirecionando para login.");
              setError("Sessão expirada. Faça login novamente.");
              localStorage.clear();
            }
          } else {
            console.error("Erro ao carregar as faltas:", err);
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
  }, [token]);

  const handleFileUpload = async (absenceId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("absence", absenceId);
    formData.append("justification_file", file);

    try {
      const response = await api.post("/api/forgiveness-requests/create/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Justificativa enviada com sucesso!");
      console.log("Resposta da API:", response.data);
    } catch (err) {
      alert("Erro ao enviar justificativa.");
      console.error(err);
    }
  };

  const handleAbsenceChange = async (absence, updatedFields) => {
    console.log("Alterando falta para:", { ...absence, ...updatedFields });
  
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("Resposta da API:", response.data);
  
      // 🔹 Atualiza o estado local
      setAbsences((prevAbsences) =>
        prevAbsences.map((a) =>
          a.id === absence.id ? { ...a, ...updatedFields, is_absent: updatedFields.is_absent } : a
        )
      );
      
    } catch (err) {
      console.error("Erro ao atualizar a falta:", err);
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
      {/* Navegação */}
      <Disclosure as="nav" className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="shrink-0">
                <img
                  alt="Logo"
                  src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                  className="size-8"
                />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? "page" : undefined}
                      className={classNames(
                        item.current ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
              </DisclosureButton>
            </div>
          </div>
        </div>
      </Disclosure>

      {/* Conteúdo Principal */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Controle de Faltas</h1>

        {/* 🔍 Input de busca */}
        {userRole !== "student" && (
          <div className="flex justify-between items-center mb-6">
            <input
              type="text"
              placeholder="Pesquise o nome do aluno..."
              className="w-1/3 px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

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
                  <label className="cursor-pointer bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
                    Escolher Arquivo
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(absence.id, e)}
                    />
                  </label>
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
