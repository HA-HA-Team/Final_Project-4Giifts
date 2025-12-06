import { useNavigate } from "react-router-dom";
import { createUser } from "../services";
import styles from "./Signup.module.css";

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
      tipo_personalidad: form.tipoPersonalidad.value,
      profile_pic: form.profile_pic.value,
      gender: form.gender.value
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
    <div className={styles.signupWrapper}>
      <div className={styles.card}>

        <h2 className={`${styles.title} text-center mb-3`}>Crear Cuenta</h2>
        <p className={`${styles.subtitle} text-center mb-4`}>
          Regístrate para comenzar
        </p>

        <form onSubmit={handleSubmit}>

          <label className={styles.label}>Email</label>
          <input type="email" id="inputEmail" className={`form-control mb-3 ${styles.input}`} required />

          <label className={styles.label}>Contraseña</label>
          <input type="password" id="inputPassword" className={`form-control mb-3 ${styles.input}`} required />

          <label className={styles.label}>Nombre</label>
          <input type="text" id="firstName" className={`form-control mb-3 ${styles.input}`} />

          <label className={styles.label}>Apellidos</label>
          <input type="text" id="lastName" className={`form-control mb-3 ${styles.input}`} />

          <label className={styles.label}>Género</label>
          <input type="text" id="gender" className={`form-control mb-3 ${styles.input}`} />

          <label className={styles.label}>Fecha de nacimiento</label>
          <input type="date" id="birthDate" className={`form-control mb-3 ${styles.input}`} />

          <label className={styles.label}>Hobbies y Gustos Personales</label>
          <input type="text" id="hobbies" className={`form-control mb-3 ${styles.input}`} />

          <label className={styles.label}>Ocupación</label>
          <input type="text" id="ocupacion" className={`form-control mb-3 ${styles.input}`} />

          <label className={styles.label}>Tipo de personalidad</label>
          <input type="text" id="tipoPersonalidad" className={`form-control mb-4 ${styles.input}`} />

          <label className={styles.label}>Link para imagen de perfil</label>
          <input type="text" id="profile_pic" className={`form-control mb-4 ${styles.input}`} />

          <button type="submit" className={styles.submitBtn}>
            Crear Cuenta
          </button>

        </form>

        <div className="text-center mt-3">
          <small>
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className={styles.link}>Inicia sesión</a>
          </small>
        </div>

      </div>
    </div>
  );
};
