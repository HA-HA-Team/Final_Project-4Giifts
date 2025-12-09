import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { checkLogin } from "../services";

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

      if (!resp.ok) {
        alert(data.message);
        return;
      }

      sessionStorage.setItem("token", data.token);
      dispatch({ type: "setUser", payload: data.user });

      navigate("/dashboard");
    } catch (err) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #FDEBD0 0%, #F7CAC9 100%)" }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: "420px", borderRadius: "20px" }}>
        <div className="card-body p-4">

          <div className="text-center mb-3">
            <img src="/Logo4giift.jpeg" width="90" />
            <h5 className="mt-2" style={{ color: "#DC143C" }}>Nunca olvides un regalo importante</h5>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: "#DC143C" }}>Correo</label>
              <input type="email" name="email" className="form-control" required />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: "#DC143C" }}>Contraseña</label>
              <input type="password" name="password" className="form-control" required />
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
