import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPrivateData } from "../services";

export const ProfileEdit = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({});
    const [deleteCheck, setDeleteCheck] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState();


    useEffect(() => {
        const loadData = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) { navigate("/login"); return; }

            try {
                const userResp = await getPrivateData();
                if (!userResp.ok) throw new Error("Auth failed");

                const data = await userResp.json();


                setUser(data);

                setForm({
                    first_name: data.user.first_name || "",
                    last_name: data.user.last_name || "",
                    email: data.user.email || "",
                    birth_date: data.user.birth_date ? data.user.birth_date.substring(0, 10) : "",
                    hobbies: data.user.hobbies || "",
                    ocupacion: data.user.ocupacion || "",
                    tipo_personalidad: data.user.tipo_personalidad || "",
                });

            } catch (e) {
                console.log(e);
                sessionStorage.removeItem("token");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const saveChanges = async () => {
        const token = sessionStorage.getItem("token");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/${user.user.user_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                }
            );

            if (response.ok) {
                alert("¡Perfil actualizado correctamente!");
                navigate("/dashboard")
            } else {
                alert("Hubo un problema al actualizar el perfil.");
            }

        } catch (error) {
            console.error("Error en la petición:", error);
            alert("Error de conexión con el servidor.");
        }
    };

    const deleteAccount = async () => {
        if (!deleteCheck) return;

        const token = sessionStorage.getItem("token");

        await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/user/${user.user.user_id}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        sessionStorage.removeItem("token");
        navigate("/");
    };


    if (loading) return <div className="text-center p-5">Cargando...</div>;

    return (
        <div className="container mt-5" style={{ minHeight: "100vh" }}>
           <button className="btn btn-outline-secondary mb-4" onClick={() => navigate('/dashboard')}>&larr; Volver</button> 
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            
            <h2 className="text-center mb-4">Editar Perfil</h2>

            <div className="card p-4 shadow" style={{ borderRadius: "12px" }}>

                <label className="form-label">Nombre</label>
                <input
                    type="text"
                    name="first_name"
                    className="form-control mb-3"
                    value={form.first_name}
                    onChange={handleChange}
                />

                <label className="form-label">Apellidos</label>
                <input
                    type="text"
                    name="last_name"
                    className="form-control mb-3"
                    value={form.last_name}
                    onChange={handleChange}
                />

                <label className="form-label">Email</label>
                <input
                    type="email"
                    name="email"
                    className="form-control mb-3"
                    value={form.email}
                    onChange={handleChange}
                />

                <label className="form-label">Fecha de nacimiento</label>
                <input
                    type="date"
                    name="birth_date"
                    className="form-control mb-3"
                    value={form.birth_date}
                    onChange={handleChange}
                />

                <label className="form-label">Hobbies</label>
                <input
                    type="text"
                    name="hobbies"
                    className="form-control mb-3"
                    value={form.hobbies}
                    onChange={handleChange}
                />

                <label className="form-label">Ocupación</label>
                <input
                    type="text"
                    name="ocupacion"
                    className="form-control mb-3"
                    value={form.ocupacion}
                    onChange={handleChange}
                />

                <label className="form-label">Tipo de personalidad</label>
                <input
                    type="text"
                    name="tipo_personalidad"
                    className="form-control mb-3"
                    value={form.tipo_personalidad}
                    onChange={handleChange}
                />

                <button
                    className="btn w-100 mb-3"
                    style={{
                        backgroundColor: "#1E66FF",
                        color: "#fff",
                        borderRadius: "10px",
                        fontWeight: "bold",
                    }}
                    onClick={saveChanges}
                >
                    Guardar Cambios
                </button>

                <hr />

                <div className="form-check mb-2">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={deleteCheck}
                        onChange={(e) => setDeleteCheck(e.target.checked)}
                        id="deleteCheck"
                    />
                    <label className="form-check-label" htmlFor="deleteCheck">
                        Seguro de eliminar mi cuenta
                    </label>
                </div>

                <button
                    className="btn w-100"
                    disabled={!deleteCheck}
                    style={{
                        backgroundColor: "#ff5b5b",
                        color: "white",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        opacity: deleteCheck ? 1 : 0.5,
                    }}
                    onClick={deleteAccount}
                >
                    Eliminar Cuenta
                </button>
            </div>
        </div>
        </div>
    );
};
