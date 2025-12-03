export const Instrucciones = () => {
    return (
        <div>
            <h3 className="d-flex justify-content-center fw-bold">¿Cómo funciona?</h3>
            <div className='ms-5 me-5 mb-5 mt-3 d-flex row gap-4 justify-content-center pers-shadow rounded-3'>

                <div className="card pers-shadow p-0 rounded-3 m-4" style={{ width: "18rem" }}>
                    <div className="ratio ratio-21x9">
                        <i className="fa-solid fa-file-pen display-5 d-flex justify-content-center align-items-center"></i>
                    </div>
                    <div className="card-body d-flex justify-content-between flex-column">
                        <div>
                            <h5 className="card-title">1. Regístrate</h5>
                            <p className="card-text flex-grow-1">Description</p>
                        </div>

                    </div>
                </div>

                <div className="card pers-shadow p-0 rounded-3 m-4" style={{ width: "18rem" }}>
                    <div className="ratio ratio-21x9">
                        <i class="fa-solid fa-door-open display-5 d-flex justify-content-center align-items-center"></i>
                    </div>
                    <div className="card-body d-flex justify-content-between flex-column">
                        <div>
                            <h5 className="card-title">2. Loguéate</h5>
                            <p className="card-text flex-grow-1">Description</p>
                        </div>

                    </div>
                </div>

                <div className="card pers-shadow p-0 rounded-3 m-4" style={{ width: "18rem" }}>
                    <div className="ratio ratio-21x9">
                        <i class="fa-solid fa-wand-magic-sparkles display-5 d-flex justify-content-center align-items-center"></i>
                    </div>
                    <div className="card-body d-flex justify-content-between flex-column">
                        <div>
                            <h5 className="card-title">3. ¡Genera tus regalos!</h5>
                            <p className="card-text flex-grow-1">Description</p>
                        </div>

                    </div>
                </div>


            </div>


        </div>
    );
}
