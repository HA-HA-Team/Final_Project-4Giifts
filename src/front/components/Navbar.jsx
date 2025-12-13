/*import { Link } from "react-router-dom";

export const Navbar = () => {

    return (
        <nav className="navbar pers-bg-color">
            <div className="container">
                <Link to="/">
                    <span className="navbar-brand mb-0 h1"><img src="public/Logo_solo_4giifts-removebg-preview (1).png" width="10%" height="10%" alt="" /></span>
                </Link>
                <div className="ml-auto d-flex gap-2">
                    <Link to="/signup">
                        <button className="btn btn-secondary pers-secondary-btn-color border-0">Registrar</button>
                    </Link>
                    <Link to="/login">
                        <button className="btn btn-primary pers-primary-btn-color border-0">Login</button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
*/

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const Navbar = () => {
    const [isLogged, setIsLogged] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLogin = () => {
            const token = sessionStorage.getItem("token");
            setIsLogged(!!token);
        };

        checkLogin();


        window.addEventListener("storage", checkLogin);

        return () => window.removeEventListener("storage", checkLogin);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        setIsLogged(false);
        navigate("/");

        // Forzar actualización en toda la app
        window.dispatchEvent(new Event("storage"));

        setOpen(false);
    };

    return (
        <nav className="navbar pers-bg-color">
            <div className="container">

                <Link to="/">
                    <span className="navbar-brand mb-0 h1">
                        <img
                            src="public/Logo_solo_4giifts-removebg-preview (1).png"
                            width="10%"
                            height="10%"
                            alt=""
                        />
                    </span>
                </Link>

                <div className="ml-auto d-flex gap-2 align-items-center">

                    {/* --- OPCIONES NO LOGUEADO --- */}
                    {!isLogged && (
                        <>
                            <Link to="/signup">
                                <button className="btn btn-secondary pers-secondary-btn-color border-0">
                                    Registrar
                                </button>
                            </Link>

                            <Link to="/login">
                                <button className="btn btn-primary pers-primary-btn-color border-0">
                                    Login
                                </button>
                            </Link>
                        </>
                    )}

                    {/* --- OPCIONES LOGUEADO --- */}
                    {isLogged && (
                        <div className="position-relative">

                            {/* Icono usuario */}
                            <div
                                className="d-flex justify-content-center align-items-center rounded-circle bg-dark text-white"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    cursor: "pointer",
                                    userSelect: "none"
                                }}
                                onClick={() => setOpen(!open)}
                            >
                                U
                            </div>

                            {/* Dropdown */}
                            {open && (
                                <div
                                    className="position-absolute bg-white p-2 shadow-sm"
                                    style={{
                                        right: 0,
                                        top: "45px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        minWidth: "150px"
                                    }}
                                >
                                    <div
                                        className="dropdown-item mb-1"
                                        onClick={() => navigate("/Gestion")}
                                    >
                                        Gestión de usuario
                                    </div>

                                    <div className="dropdown-item" onClick={handleLogout}>
                                        Cerrar sesión
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </div>
        </nav>
    );
};
