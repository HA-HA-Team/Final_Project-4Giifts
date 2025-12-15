import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPrivateData } from "../services";

export const Navbar = () => {
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) {
                setIsLogged(false);
                setUser(null);
                return;
            }

            setIsLogged(true);
            const resp = await getPrivateData();
            if (resp.ok) {
                const data = await resp.json();
                setUser(data.user);
            }
        };

        checkAuth();
        window.addEventListener("auth-change", checkAuth);
        return () => window.removeEventListener("auth-change", checkAuth);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        window.dispatchEvent(new Event("auth-change"));
        navigate("/");
    };

    return (
        <nav className="navbar pers-bg-color">
            <div className="container">

                {/* Logo */}
                <Link to="/" className="d-flex align-items-center gap-2">
                    <img
                        src="public/Logo_solo_4giifts-removebg-preview (1).png"
                        height="40"
                        alt="Logo"
                    />
                </Link>

                <div className="ms-auto d-flex align-items-center gap-3">

                    {/* NO LOGUEADO */}
                    {!isLogged && (
                        <>
                            <Link to="/signup">
                                <button className="btn pers-secondary-btn-color border-0">
                                    Registrar
                                </button>
                            </Link>
                            <Link to="/login">
                                <button className="btn pers-primary-btn-color border-0">
                                    Login
                                </button>
                            </Link>
                        </>
                    )}

                    {/* LOGUEADO */}
                    {isLogged && user && (
                        <div className="d-flex align-items-center gap-4">

                            <span
                                className="nav-link-custom"
                                onClick={() => navigate("/")}
                            >
                                Home
                            </span>

                            <span
                                className="nav-link-custom"
                                onClick={() => navigate("/dashboard")}
                            >
                                Dashboard
                            </span>

                            <img
                                src={user.profile_pic || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.first_name}`}
                                className="rounded-circle avatar-clickable"
                                width="40"
                                height="40"
                                alt="avatar"
                                onClick={() => navigate("/dashboard")}
                            />


                            <div className="dropdown">
                                <button
                                    className="btn pers-secondary-btn-color dropdown-toggle fw-semibold dropdown-user"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    {user.first_name}
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => navigate("/profile/edit")}
                                        >
                                            Gestión de usuario
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item text-danger"
                                            onClick={handleLogout}
                                        >
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </nav>
    );
};
