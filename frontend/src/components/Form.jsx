import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { login } from "../features/authSlice";
import LoadingIndicator from "./LoadingIndicator";
import api from "../api";
import { getAuthToken } from "../utils/authHelpers";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { role: userRole, user } = useSelector((state) => state.auth);
  
    const isLogin = method === "login";
    const formTitle = isLogin ? "Login" : "Cadastro";
  
    const navigation = [
      { name: "Home", href: "/dashboard/", current: false },
      { name: "Gerenciar Faltas", href: "/absences/professor/", current: false },
      { name: "Solicitações de Perdão", href: "/professor/requests/", current: false },
      ...(userRole === "admin" ? [{ name: "Cadastrar Novo Usuário", href: "/auth/register", current: true }] : []),
    ];
  
    // Condicional para mostrar navegação apenas na página de cadastro
    const showNavigation = route === "register"; 
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
  
      const payload = isLogin
        ? { username, password }
        : { username, name, password, email, role };
  
      const apiRoute = isLogin ? "/api/auth/login/" : "/api/auth/register/";
  
      try {
        const res = await api.post(apiRoute, payload, {
          headers: isLogin ? {} : { Authorization: `Bearer ${getAuthToken()}` }, 
        });
  
        if (isLogin) {
          const { access, refresh, role } = res.data;
          console.log("Dados recebidos no login:", res.data);
          
          dispatch(
            login({
              user: username,
              token: access,
              role,
            })
          );
  
          let redirectPath = "/dashboard/";
          navigate(redirectPath);
        } else {
          alert("Usuário registrado com sucesso!");
          navigate("/auth/login");
        }
      } catch (error) {
        console.error("Erro na requisição:", error.response?.data);
        setError(error.response?.data?.message || "Erro ao processar a solicitação");
      }
       finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-full">
        {/* Renderiza a navegação apenas na página de cadastro */}
        {showNavigation && (
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
        )}
  
        {/* Formulário */}
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">{formTitle}</h1>

            <form onSubmit={handleSubmit}>
            {/* Campos do formulário */}
            {!isLogin && (
                <input
                className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome Completo"
                required
                />
            )}

            <input
                className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />

            {!isLogin && (
                <input
                className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                />
            )}

            <input
                className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
            />

            {!isLogin && (
              <select
                className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="student">Aluno</option>
                <option value="professor">Professor</option>
                <option value="admin">Administrador</option>
              </select>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex justify-center items-center"
                disabled={loading}
            >
                {loading ? <LoadingIndicator className="size-5" /> : isLogin ? "Entrar" : "Cadastrar"}
            </button>
            </form>
        </div>

        {/* Footer fixado na parte inferior - Apenas na página de login */}
        {isLogin && (
            <footer className="mt-auto w-full py-4 text-center text-gray-600 text-sm absolute bottom-0">
            <p> adm123 (Username e senha) para adm | student123 para student | professor123 para professor |</p>
            </footer>
        )}
        </div>

        </div>
      
    );
  }
  
  export default Form;
  