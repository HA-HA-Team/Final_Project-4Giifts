import { useNavigate } from "react-router-dom";

export const Instrucciones = () => {

    const navigate = useNavigate();


    return (
        <div>
            <h3 className="d-flex justify-content-center fw-bold">¿Cómo funciona?</h3>
            <div className='ms-5 me-5 mb-5 mt-3 d-flex row gap-4 justify-content-center pers-shadow rounded-3'>

                <div  onClick={()=>navigate("/signup")} className="card instruction-card pers-shadow p-0 rounded-3 m-4" style={{ width: "18rem" }}>
                    <div className="ratio ratio-21x9">
                        <i className="fa-solid fa-file-pen display-5 d-flex justify-content-center align-items-center"></i>
                    </div>
                    <div  className="card-body text-center d-flex justify-content-between flex-column">
                        <div>
                            <h5 className="card-title fw-bold ">1. Regístrate</h5>
                            <p className="card-text flex-grow-1">Crea tu cuenta en pocos segundos para empezar a personalizar regalos únicos. Solo necesitas tus datos básicos y estarás listo para usar todas las funcionalidades de la plataforma.</p>
                        </div>

                    </div>
                </div>

                <div  onClick={()=>navigate("/login")} className="card instruction-card pers-shadow p-0 rounded-3 m-4" style={{ width: "18rem" }}>
                    <div className="ratio ratio-21x9">
                        <i className="fa-solid fa-door-open display-5 d-flex justify-content-center align-items-center"></i>
                    </div>
                    <div className="card-body text-center d-flex justify-content-between flex-column">
                        <div>
                            <h5 className="card-title fw-bold ">2. Loguéate</h5>
                            <p className="card-text flex-grow-1">Accede a tu cuenta de forma segura cuando quieras. Desde aquí podrás gestionar tus preferencias y continuar creando regalos personalizados sin perder tu progreso.</p>
                        </div>

                    </div>
                </div>

                <div  onClick={()=>navigate("/dashboard")} className="card instruction-card pers-shadow p-0 rounded-3 m-4" style={{ width: "18rem" }}>
                    <div className="ratio ratio-21x9">
                        <i className="fa-solid fa-wand-magic-sparkles display-5 d-flex justify-content-center align-items-center"></i>
                    </div>
                    <div className="card-body text-center d-flex justify-content-between flex-column">
                        <div>
                            <h5 className="card-title fw-bold">3. ¡Genera tus regalos!</h5>
                            <p className="card-text flex-grow-1">Indica para quién es el regalo, la ocasión y algunos detalles importantes. Nuestra plataforma te propondrá ideas personalizadas para acertar siempre con tu regalo.</p>
                        </div>

                    </div>
                </div>


            </div>


        </div>
    );
}
