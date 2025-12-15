import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { checkLogin } from "../services";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      email: e.target.elements.email.value,
      password: e.target.elements.password.value,
    };

    try {
      const resp = await checkLogin(user);
      const data = await resp.json();

      if (resp.ok) {
        sessionStorage.setItem("token", data.token);

        if (data.user) {
            dispatch({ type: "setUser", payload: data.user });
        }
        
        window.dispatchEvent(new Event("auth-change")); // añado esto para que funcione la parte del navbar.
        
        navigate("/dashboard");
      } else {
        alert("Error en el login: " + (data.message || "Credenciales incorrectas"));
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #FDEBD0 0%, #F7CAC9 100%)" }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: "420px", borderRadius: "20px" }}>
        <div className="card-body p-4">

          <div className="text-center mb-3">
            <img src="/Logo4giift.jpeg" width="90" alt="Logo" />
            <h5 className="mt-2" style={{ color: "#DC143C" }}>Nunca olvides un regalo importante</h5>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email_login" className="form-label fw-semibold" style={{ color: "#DC143C" }}>
                Correo
              </label>
              <input
                type="email"
                id="email_login"
                name="email"
                className="form-control"
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="passw_login" className="form-label fw-semibold" style={{ color: "#DC143C" }}>
                Contraseña
              </label>

              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="passw_login"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-lg fw-bold"
                style={{ backgroundColor: "#DC143C", color: "#fff", borderRadius: "12px" }}>
                Entrar
              </button>
            </div>
          </form>

          <div className="text-center mt-3">
            <Link to="/signup" style={{ color: "#F75270" }}>
              ¿Primera vez? Crea tu cuenta
            </Link>

            <div>
              <small style={{ color: "#F75270" }}>
                ¿Olvidaste tu contraseña?
                <Link to="/recover/request" className="ms-1">Recuperar acceso</Link>
              </small>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};