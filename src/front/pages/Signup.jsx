// Import necessary components from react-router-dom and other parts of the application.
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { createUser } from "../services";
import styles from "./Signup.module.css";

export const Signup = () => {
  // Access the global state and dispatch function using the useGlobalReducer hook.
  const { store, dispatch } = useGlobalReducer()
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
      const newUser = {
        email: e.target.elements.inputEmail.value,
        password: e.target.elements.inputPassword.value
      }
      const createNewUser = await createUser(newUser)

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

      navigate("/")

          <label htmlFor="inputEmail" className={styles.label}>Email</label>
          <input type="email" id="inputEmail" className={`form-control mb-3 ${styles.input}`} required />

          <label htmlFor="inputPassword" className={styles.label}>Contraseña</label>
          <input type="password" id="inputPassword" className={`form-control mb-3 ${styles.input}`} required />

          <label htmlFor="firstName" className={styles.label}>Nombre</label>
          <input type="text" id="firstName" className={`form-control mb-3 ${styles.input}`} />

          <label htmlFor="lastName" className={styles.label}>Apellidos</label>
          <input type="text" id="lastName" className={`form-control mb-3 ${styles.input}`} />

          <label htmlFor="gender" className={styles.label}>Género</label>
          <input type="text" id="gender" className={`form-control mb-3 ${styles.input}`} />

          <label htmlFor="birthDate" className={styles.label}>Fecha de nacimiento</label>
          <input type="date" id="birthDate" className={`form-control mb-3 ${styles.input}`} />

          <label htmlFor="hobbies" className={styles.label}>Hobbies y Gustos Personales</label>
          <input type="text" id="hobbies" className={`form-control mb-3 ${styles.input}`} />

          <label htmlFor="ocupacion" className={styles.label}>Ocupación</label>
          <input type="text" id="ocupacion" className={`form-control mb-3 ${styles.input}`} />

          <label htmlFor="tipoPersonalidad" className={styles.label}>Tipo de personalidad</label>
          <input type="text" id="tipoPersonalidad" className={`form-control mb-4 ${styles.input}`} />

          <label htmlFor="profile_pic" className={styles.label}>Link para imagen de perfil</label>
          <input type="text" id="profile_pic" className={`form-control mb-4 ${styles.input}`} />

          <button type="submit" className={styles.submitBtn}>
            Crear Cuenta
          </button>


        <div className="text-center mt-3">
          <small>
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className={styles.link}>Inicia sesión</a>
          </small>
        </div>
        <div className="mb-3">
          <label htmlFor="inputPassword" className="form-label">Password</label>
          <input type="password" className="form-control" id="inputPassword" required />
        </div>
        <div className="mb-3 form-check">
          <input type="checkbox" className="form-check-input" id="exampleCheck1" required />
          <label className="form-check-label" htmlFor="exampleCheck1">Acepto crear usuario</label>
        </div>
        <button type="submit" className="btn btn-primary">Crear usuario</button>
      </form>
    </div>
  );
};
