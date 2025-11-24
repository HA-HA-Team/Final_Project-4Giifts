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
        email: e.target.elements.inputEmail.value,
        password: e.target.elements.inputPassword.value
      }
      const checkUser = await checkLogin(user)


      if (checkUser.ok) {
        const data = await checkUser.json()
        console.log(data)
        const token = data.token;
        sessionStorage.setItem("token", token);
        alert("Login correcto")
      }
      else alert("credenciales incorrectos");

      navigate("/private")

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
        <button type="submit" className="btn btn-primary">Logear</button>
      </form>
    </div>
  );
};

