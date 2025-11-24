import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPrivateData } from "../services";

export const Private = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        const verifyToken = async () => {
            const token = sessionStorage.getItem("token");

            if (!token) {

                alert("No tienes acceso, inicia sesión!")
                navigate("/login");
                return;
            }

            try {
                const resp = await getPrivateData();
                if (resp.ok) {
                    const data = await resp.json();
                    setUserInfo(data);
                    setLoading(false);
                } else {
                    sessionStorage.removeItem("token");
                    navigate("/login");
                }
            } catch (error) {
                console.error(error);
                sessionStorage.removeItem("token");
                navigate("/login");
            }
        };

        verifyToken();
    }, []);


    const handleLogout = () => {
        sessionStorage.removeItem("token");

        navigate("/");
    };


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 text-center">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    Zona Privada
                </div>
                <div className="card-body">
                    <h2 className="card-title mb-4">¡Hola de nuevo!</h2>

                    <p className="card-text lead">{userInfo.message}</p>

                    <div className="alert alert-info d-inline-block mt-3">
                        Sesión iniciada como: <strong>{userInfo.user.email}</strong>
                    </div>

                    <hr className="my-4" />

                    <button
                        className="btn btn-danger px-4 py-2"
                        onClick={handleLogout}
                    >
                        Cerrar Sesión
                    </button>

                </div>
            </div>
        </div>
    );
};