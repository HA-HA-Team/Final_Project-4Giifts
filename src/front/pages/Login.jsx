// Import necessary components from react-router-dom and other parts of the application.
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { checkLogin } from "../services";

export const Login = () => {
  // Access the global state and dispatch function using the useGlobalReducer hook.
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = {
        email: e.target.elements.email.value,
        password: e.target.elements.password.value
      }
      const checkUser = await checkLogin(user)
      const data = await checkUser.json()
      console.log(data);
      if (checkUser.ok) {
        const token = data.token;
        sessionStorage.setItem("token", token);
        navigate("/dashboard")
      }
      else {
        alert("Error en el login: " + data.message);
      }

    } catch (err) {
      console.error(err);
      alert("Error desconocido: " + err.message);
    }


  }




  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #FDEBD0 0%, #F7CAC9 100%)" }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ width: "100%", maxWidth: "420px", borderRadius: "20px" }}
      >
        <div className="card-body p-4">


          {/* Logo */}
          <div className="text-center mb-3">
            <img src="public/Logo4giift.jpeg" alt="4giift" width="90" />
            <h5 className="mt-2" style={{ color: "#DC143C" }}>
              Nunca olvides un regalo importante
            </h5>
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
              <input
                type="password"
                id="passw_login"
                name="password"
                className="form-control"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-lg fw-bold"
                style={{
                  backgroundColor: "#DC143C",
                  color: "#fff",
                  borderRadius: "12px",
                }}
              >
                Entrar
              </button>
            </div>
          </form>

          <div className="text-center mt-3">
            <Link to="/signup" className="text-decoration-none" style={{ color: "#F75270" }}>
              ¿Primera vez? Crea tu cuenta
            </Link>
            <div><small>
              ¿Olvidaste tu contraseña?
              <a href="/recover/request">Recuperar acceso</a>
            </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

