import { useState } from "react";
import api from "../api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../features/authSlice";
import "../styles/Form.css";
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
  const formTitle = isLogin ? "Login" : "Register";

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

        // Dispara a ação de login
        dispatch(
          login({
            user: username,
            token: access,
            role,
          })
        );

        let redirectPath = "/";
        if (role === "student") {
          redirectPath = "/aluno/absences/";
        } else if (role === "professor" || role === "admin") {
          redirectPath = "/dashboard/";
        }

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
    <form onSubmit={handleSubmit} className="form-container">
      <h1>{formTitle}</h1>

      {!isLogin && (
        <input
          className="form-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome Completo"
          required
        />
      )}

      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />

      {!isLogin && (
        <input
          className="form-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
      )}

      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      {!isLogin && (
        <select
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="student">Aluno</option>
          <option value="professor">Professor</option>
          <option value="admin">Administrador</option>
        </select>
      )}

      {error && <p className="error-message">{error}</p>}
      {loading && <LoadingIndicator />}

      <button className="form-button" type="submit" disabled={loading}>
        {formTitle}
      </button>
    </form>
  );
}

export default Form;
