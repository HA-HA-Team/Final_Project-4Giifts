import React, { useEffect, useRef, useState } from "react";
import styles from "../pages/dashboard.module.css";

const REMINDER_REASONS = [
    "Aniversario",
    "Cumpleaños",
    "Navidad",
    "San Valentín",
    "Día de la Madre",
    "Día del Padre",
    "Graduación",
    "Boda",
    "Nacimiento",
    "Otro",
];

const ICONS = {
    Aniversario: "💍",
    Cumpleaños: "🎂",
    Navidad: "🎄",
    "San Valentín": "❤️",
    "Día de la Madre": "🌷",
    "Día del Padre": "👔",
    Graduación: "🎓",
    Boda: "💒",
    Nacimiento: "👶",
    Otro: "⏰",
};

const RemindersCarousel = ({
    reminders = [],
    contacts = [],
    onCreateReminder,
    onDeleteReminder,
}) => {
    const trackRef = useRef(null);
    const intervalRef = useRef(null);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [dragTranslate, setDragTranslate] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    const [formData, setFormData] = useState({
        reminder_date: "",
        title: "",
    });


    const infiniteReminders =
        reminders.length > 0
            ? [...reminders, ...reminders, ...reminders]
            : [];


    useEffect(() => {
        if (reminders.length) {
            setCurrentSlide(reminders.length);
        }
    }, [reminders.length]);


    useEffect(() => {
        if (!reminders.length) return;

        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setCurrentSlide((p) => p + 1);
        }, 3000);

        return () => clearInterval(intervalRef.current);
    }, [reminders.length]);


    useEffect(() => {
        if (!reminders.length || !trackRef.current) return;

        if (currentSlide >= reminders.length * 2) {
            trackRef.current.style.transition = "none";
            setCurrentSlide(reminders.length);
            trackRef.current.offsetHeight; // force reflow
            trackRef.current.style.transition = "";
        }

        if (currentSlide <= reminders.length - 1) {
            trackRef.current.style.transition = "none";
            setCurrentSlide(reminders.length * 2 - 1);
            trackRef.current.offsetHeight;
            trackRef.current.style.transition = "";
        }
    }, [currentSlide, reminders.length]);

    const stopAuto = () => clearInterval(intervalRef.current);


    const handleDragStart = (e) => {
        setIsDragging(true);
        setStartX(e.clientX || e.touches?.[0]?.clientX);
        stopAuto();
    };

    const handleDragMove = (e) => {
        if (!isDragging || !trackRef.current) return;
        const x = e.clientX || e.touches?.[0]?.clientX;
        setDragTranslate(((x - startX) / trackRef.current.offsetWidth) * 100);
    };

    const handleDragEnd = () => {
        setIsDragging(false);

        if (dragTranslate < -5) setCurrentSlide((p) => p + 1);
        else if (dragTranslate > 5) setCurrentSlide((p) => p - 1);

        setDragTranslate(0);
    };


    const closeModal = () => {
        setShowModal(false);
        setSelectedContact(null);
        setFormData({ reminder_date: "", title: "" });
    };

    const handleSaveReminder = async () => {
        if (!selectedContact || !formData.reminder_date || !formData.title) {
            alert("Completa todos los campos");
            return;
        }

        await onCreateReminder({
            contact_id: selectedContact.id,
            reminder_date: formData.reminder_date,
            title: formData.title,
        });

        closeModal();
    };

    return (
        <div id="recordatorios" className="mb-4 pt-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className={styles["section-title"]}>RECORDATORIOS DESDE COMPONENTE</h5>
                <button
                    className={`btn ${styles["btn-ideas"]}`}
                    onClick={() => setShowModal(true)}
                >
                    + Agregar recordatorio
                </button>
            </div>

            {reminders.length === 0 && (
                <div className="row justify-content-center mb-4">
                    <div className="col-12 col-md-6 col-lg-4">
                        <div
                            className="card h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center"
                            style={{
                                border: "2px dashed #ccc",
                                borderRadius: "20px",
                                minHeight: "220px",
                            }}
                        >
                            <div className="display-4 mb-3">⏰</div>

                            <h5 className="text-muted mb-2">
                                Aún no tienes recordatorios
                            </h5>

                            <p className="text-muted small mb-3">
                                Crea recordatorios para no olvidar fechas importantes.
                            </p>

                            <button
                                className={`btn ${styles["btn-ideas"]}`}
                                onClick={() => setShowModal(true)}
                            >
                                Agregar primer recordatorio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {reminders.length > 0 && (
                <>

                    <div
                        className={styles["reminder-viewport"]}
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                    >
                        <div
                            ref={trackRef}
                            className={styles["reminder-track"]}
                            style={{
                                transform: `translateX(-${currentSlide * (100 / infiniteReminders.length)}%)`,
                            }}
                        >
                            {infiniteReminders.map((r, i) => {
                                const contact = contacts.find(c => c.id === r.contact_id);

                                return (
                                    <div key={`${r.id}-${i}`} className={styles["reminder-card"]}>


                                        {contact && (
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <img
                                                    src={contact.img || "https://i.pravatar.cc/100"}
                                                    alt={contact.name}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                <strong className="small">{contact.name}</strong>
                                            </div>
                                        )}


                                        <div className="display-4">
                                            {ICONS[r.title] || "⏰"}
                                        </div>


                                        <h6 className="fw-bold">{r.title}</h6>


                                        <small>{r.reminder_date}</small>

                                        <div>
                                            <button
                                                className="btn btn-sm btn-outline-danger mt-2"
                                                onClick={() => onDeleteReminder(r.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}



            {showModal && (
                <div className="modal show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content p-4">

                            <h5 className="mb-3">Nuevo Recordatorio</h5>

                            <label className="form-label">Contacto</label>
                            <div className="d-flex gap-2 mb-3 flex-wrap">
                                {contacts.map((c) => (
                                    <div
                                        key={c.id}
                                        className={`text-center p-2 border rounded ${selectedContact?.id === c.id ? "border-danger" : ""
                                            }`}
                                        style={{ cursor: "pointer", width: 90 }}
                                        onClick={() => setSelectedContact(c)}
                                    >
                                        <img
                                            src={c.img || "https://i.pravatar.cc/100"}
                                            alt={c.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <small className="d-block mt-1">{c.name}</small>
                                    </div>
                                ))}
                            </div>

                            <label className="form-label">Fecha</label>
                            <input
                                type="date"
                                className="form-control mb-3"
                                value={formData.reminder_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, reminder_date: e.target.value })
                                }
                            />

                            <label className="form-label">Motivo</label>
                            <select
                                className="form-select mb-4"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            >
                                <option value="">Selecciona un motivo</option>
                                {REMINDER_REASONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>

                            <div className="d-flex justify-content-end gap-2">
                                <button className="btn btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleSaveReminder}>
                                    Guardar
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemindersCarousel;
