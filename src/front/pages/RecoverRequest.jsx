import { useState } from "react";
import styles from "./RecoverRequest.module.css"; // 👈 Importamos el módulo CSS

export const RecoverRequest = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const sendRequest = async (e) => {
        e.preventDefault();

        setStatus("");
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/recover/request`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            if (!response.ok) throw new Error("Error en el servidor");

            setStatus("Si estas registrado, recibirás un email en unos minutos.");
        } catch (err) {
            console.error("ERROR:", err);
            setError("Hubo un problema enviando el correo. Intenta más tarde.");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <h2 className={styles.title}>Recuperar contraseña</h2>

                <p className={styles.subtitle}>
                    Ingresa tu correo para recibir instrucciones.
                </p>

                <form onSubmit={sendRequest}>
                    <label className={styles.label}>Correo electrónico</label>

                    <input
                        type="email"
                        className={styles.input}
                        placeholder="tucorreo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button className={styles.submitBtn} type="submit">
                        Enviar instrucciones
                    </button>
                </form>

                {status && <p className={styles.success}>{status}</p>}
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
    );
};
