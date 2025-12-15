import { Link } from "react-router-dom";

export const Jumbotron = () => (
	<div>
      <div className="jumbotron m-5 p-5 rounded-3 text-center pers-bg-img-jumbotron">
        <h1 className="display-4 fw-bold">Regalos que hablan por ti</h1>
        <p className="lead fw-bold">Convierte tus recuerdos en el detalle perfecto.</p>
        <hr className="my-4" />
        <p>Cuando las palabras no bastan, un regalo lo dice todo!</p>
        <p className="lead d-flex justify-content-center mt-5 pers-shadow-none">
          <Link to="/dashboard">
          <button className="btn btn-primary btn-lg pers-secondary-btn-color border-0">¡Regalar!</button>
        </Link>
        </p>
      </div>
    </div>
);