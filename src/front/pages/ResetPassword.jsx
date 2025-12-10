import { useState } from "react";
import styles from "./ResetPassword.module.css";

export const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");
    const [success, setSuccess] = useState(false);

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.card}>
                    <h3 className={styles.title}>Token inválido o expirado.</h3>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/recover/reset`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ password }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setStatus("Contraseña actualizada correctamente. Serás redirigido al login.");

                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                setStatus(data.msg || "Error al actualizar contraseña.");
            }
        } catch (error) {
            setStatus("Error en el servidor.");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <h2 className={styles.title}>Restablecer contraseña</h2>
                <p className={styles.subtitle}>
                    Escribe tu nueva contraseña para acceder de nuevo a tu cuenta.
                </p>

                {!success && (
                    <form onSubmit={handleSubmit}>
                        <label className={styles.label}>Nueva contraseña</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nueva contraseña"
                            required
                        />

                        <button className={styles.submitBtn} type="submit">
                            Guardar nueva contraseña
                        </button>
                    </form>
                )}

                {status && (
                    <p className={success ? styles.success : styles.error}>
                        {status}
                    </p>
                )}
            </div>
        </div>
    );
};