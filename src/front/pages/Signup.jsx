// Import necessary components from react-router-dom and other parts of the application.
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { createUser } from "../services";
import { useState } from "react";

export const Signup = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    profile_pic: "",
    hobbies: "",
    ocupacion: "",
    tipo_personalidad: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await createUser(formData);

      response.ok
        ? alert("Usuario creado correctamente 🎉")
        : alert("¡Ups! algo salió mal");

      navigate("/");
    } catch (err) {
      alert("Error desconocido: " + err.message);
      console.error(err);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <div className="card shadow p-4" style={{ maxWidth: "600px", width: "100%" }}>

        <h2 className="text-center mb-4" style={{ color: "var(--color-rose)" }}>
          Crear Cuenta
        </h2>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <hr />

          {/* NOMBRE */}
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          {/* APELLIDO */}
          <div className="mb-3">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              className="form-control"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          {/* FECHA NACIMIENTO */}
          <div className="mb-3">
            <label className="form-label">Fecha de nacimiento</label>
            <input
              type="date"
              className="form-control"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
            />
          </div>

          {/* FOTO DE PERFIL */}
          <div className="mb-3">
            <label className="form-label">Foto de perfil (URL)</label>
            <input
              type="text"
              className="form-control"
              name="profile_pic"
              value={formData.profile_pic}
              onChange={handleChange}
            />
          </div>

          {/* HOBBIES */}
          <div className="mb-3">
            <label className="form-label">Hobbies</label>
            <input
              type="text"
              className="form-control"
              name="hobbies"
              value={formData.hobbies}
              onChange={handleChange}
            />
          </div>

          {/* OCUPACION */}
          <div className="mb-3">
            <label className="form-label">Ocupación</label>
            <input
              type="text"
              className="form-control"
              name="ocupacion"
              value={formData.ocupacion}
              onChange={handleChange}
            />
          </div>

          {/* PERSONALIDAD */}
          <div className="mb-3">
            <label className="form-label">Tipo de personalidad</label>
            <input
              type="text"
              className="form-control"
              name="tipo_personalidad"
              value={formData.tipo_personalidad}
              onChange={handleChange}
            />
          </div>

          {/* CHECK */}
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" id="check" required />
            <label className="form-check-label" htmlFor="check">
              Acepto crear usuario
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="btn w-100 text-white"
            style={{ backgroundColor: "var(--color-rose)", border: "none" }}
          >
            Crear usuario
          </button>

        </form>

        <p className="text-center mt-3">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>

      </div>
    </div>
  );
};
