import { useNavigate } from "react-router-dom";

export const Instrucciones = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h3 className="d-flex justify-content-center fw-bold">
                ¿Cómo funciona?
            </h3>

            <div className="ms-5 me-5 mb-5 mt-3 d-flex row gap-4 justify-content-center pers-shadow rounded-3">

                
                <div
                    onClick={() => navigate("/signup")}
                    className="card instruction-card instruction-overlay pers-shadow p-0 rounded-3 m-4"
                    style={{ width: "18rem", height: "260px" }}
                >
                    <img
                        src="/registro.png"
                        alt="Registro"
                        className="instruction-img"
                    />

                    <div className="instruction-content">
                        <h5 className="fw-bold mb-2 text-dark instruction-title pers-shadow">
                            1. Regístrate
                        </h5>

                        <p className="instruction-text mb-0">
                            Crea tu cuenta en pocos segundos para empezar a personalizar regalos únicos.
                            Solo necesitas tus datos básicos y estarás listo para usar todas las funcionalidades de la plataforma.
                        </p>
                    </div>
                </div>

                
                <div
                    onClick={() => navigate("/login")}
                    className="card instruction-card instruction-overlay pers-shadow p-0 rounded-3 m-4"
                    style={{ width: "18rem", height: "260px" }}
                >
                    <img
                        src="/login.png"
                        alt="Login"
                        className="instruction-img"
                    />

                    <div className="instruction-content">
                        <h5 className="fw-bold mb-2 text-dark instruction-title pers-shadow">
                            2. Loguéate
                        </h5>

                        <p className="instruction-text mb-0">
                            Accede a tu cuenta de forma segura cuando quieras y continúa creando regalos personalizados sin perder tu progreso.
                        </p>
                    </div>
                </div>

                
                <div
                    onClick={() => navigate("/dashboard")}
                    className="card instruction-card instruction-overlay pers-shadow p-0 rounded-3 m-4"
                    style={{ width: "18rem", height: "260px" }}
                >
                    <img
                        src="/generar ideas.png"
                        alt="Dashboard"
                        className="instruction-img instruction-img-top-left"
                    />

                    <div className="instruction-content">
                        <h5 className="fw-bold mb-2 text-dark instruction-title pers-shadow">
                            3. Genera tus regalos
                        </h5>

                        <p className="instruction-text mb-0">
                            Indica para quién es el regalo, la ocasión y los detalles importantes.
                            La plataforma te propondrá ideas personalizadas para acertar siempre.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

