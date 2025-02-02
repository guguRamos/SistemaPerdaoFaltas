import { useState } from "react";
import api from "../api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../features/authSlice";
import LoadingIndicator from "./LoadingIndicator";

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

  const isLogin = method === "login";
  const formTitle = isLogin ? "Login" : "Cadastro";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = isLogin
      ? { username, password }
      : { username, name, password, email, role };

    const apiRoute = isLogin ? "/api/auth/login/" : "/api/auth/register/";

    try {
      const res = await api.post(apiRoute, payload);

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

        let redirectPath = role === "student" ? "/aluno/absences/" : "/dashboard/";
        navigate(redirectPath);
      } else {
        alert("Usuário registrado com sucesso!");
        navigate("/auth/login");
      }
    } catch (error) {
      setError(error.response?.data?.detail || "Erro ao processar a solicitação");
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">{formTitle}</h1>

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
        {loading && <LoadingIndicator />}

        <button 
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          type="submit" 
          disabled={loading}
        >
          {formTitle}
        </button>
      </form>
    </div>
  );
}

export default Form;
