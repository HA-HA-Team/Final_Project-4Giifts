// Import necessary components from react-router-dom and other parts of the application.
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { createUser } from "../services";

export const Signup = () => {
  // Access the global state and dispatch function using the useGlobalReducer hook.
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = {
        email: e.target.elements.inputEmail.value,
        password: e.target.elements.inputPassword.value
      }
      const createNewUser = await createUser(newUser)

      createNewUser.ok
        ? alert("Usuario creado")
        : alert("¡Ups! algo salió mal");

      navigate("/")

    } catch (err) {
      console.error(err);
      alert("Error desconocido: " + err.message);
    }



  }




  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="inputEmail" className="form-label">Email address</label>
          <input type="email" className="form-control" id="inputEmail" aria-describedby="emailHelp" required />
          <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
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
