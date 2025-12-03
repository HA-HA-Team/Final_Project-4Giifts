import { useNavigate } from "react-router-dom";
import { createUser } from "../services";
import "./Signup.css";


export const Signup = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;

    const newUser = {
      email: form.inputEmail.value,
      password: form.inputPassword.value,
      first_name: form.firstName.value,
      last_name: form.lastName.value,
      birth_date: form.birthDate.value,
      hobbies: form.hobbies.value,
      ocupacion: form.ocupacion.value,
      tipo_personalidad: form.tipoPersonalidad.value
    };

    try {
      const resp = await createUser(newUser);

      if (resp.ok) {
        alert("Usuario creado");
        navigate("/login");
      } else {
        alert("Error al crear usuario");
      }

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
   
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow p-4" style={{ width: "420px" }}>

        <h2 className="text-center mb-3">Crear Cuenta</h2>
        <p className="text-center text-muted mb-4">Regístrate para comenzar</p>

        <form onSubmit={handleSubmit}>

          <label className="form-label">Email</label>
          <input type="email" id="inputEmail" className="form-control mb-3" required />

          <label className="form-label">Contraseña</label>
          <input type="password" id="inputPassword" className="form-control mb-3" required />

          <label className="form-label">Nombre</label>
          <input type="text" id="firstName" className="form-control mb-3" />

          <label className="form-label">Apellidos</label>
          <input type="text" id="lastName" className="form-control mb-3" />

          <label className="form-label">Fecha de nacimiento</label>
          <input type="date" id="birthDate" className="form-control mb-3" />

          <label className="form-label">Hobbies</label>
          <input type="text" id="hobbies" className="form-control mb-3" />

          <label className="form-label">Ocupación</label>
          <input type="text" id="ocupacion" className="form-control mb-3" />

          <label className="form-label">Tipo de personalidad</label>
          <input type="text" id="tipoPersonalidad" className="form-control mb-4" />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Crear Cuenta
          </button>

        </form>

        <div className="text-center mt-3">
          <small>¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a></small>
        </div>

      </div>
    </div>
    
  );
};
