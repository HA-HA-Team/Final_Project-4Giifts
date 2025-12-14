import React, { useEffect, useRef, useState, useMemo } from "react";
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

const RemindersCarousel = ({
    reminders,
    contacts,
    userReminders,
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
    const [formData, setFormData] = useState({
        contactId: "",
        date: "",
        reason: "",
    });



    const selectedContact = contacts.find(
        (c) => c.id === Number(formData.contactId)
    );

    // 🔒 SOLO recordatorios válidos del backend
    const validUserReminders = userReminders.filter(
        (r) => r && r.id && r.contact_id
    );


    const carouselItems = useMemo(
        () => [
            ...reminders.map((r) => ({ type: "static", ...r })),
            ...validUserReminders.map((r) => ({ type: "user", ...r })),
        ],
        [reminders, validUserReminders]
    );



    useEffect(() => {
        if (!carouselItems.length) return;

        intervalRef.current = setInterval(() => {
            setCurrentSlide((p) => (p + 1) % carouselItems.length);
        }, 3000);

        return () => clearInterval(intervalRef.current);
    }, [carouselItems.length]);

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

        if (dragTranslate < -5) {
            setCurrentSlide((p) => (p + 1) % carouselItems.length);
        } else if (dragTranslate > 5) {
            setCurrentSlide(
                (p) => (p - 1 + carouselItems.length) % carouselItems.length
            );
        }

        setDragTranslate(0);
    };



    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSaveReminder = async () => {
        if (!formData.contactId || !formData.date || !formData.reason) {
            alert("Completa todos los campos");
            return;
        }

        await onCreateReminder({
            contact_id: Number(formData.contactId),
            title: formData.reason,
            reminder_date: formData.date,
        });

        setShowModal(false);
        setFormData({ contactId: "", date: "", reason: "" });
    };



    return (
        <div id="recordatorios" className="mb-4 pt-3">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className={`${styles["section-title"]} mb-0`}>
                    RECORDATORIOS DESDE COMPONENTE
                </h5>

                <button
                    className={`btn ${styles["btn-ideas"]}`}
                    onClick={() => setShowModal(true)}
                >
                    + Añadir Recordatorio
                </button>
            </div>


            <div
                className={styles["reminder-viewport"]}
                ref={trackRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
            >
                <div
                    className={`${styles["reminder-track"]} ${isDragging ? styles.dragging : ""
                        }`}
                    style={{
                        transform: `translateX(calc(-${currentSlide * 33.33}% + ${dragTranslate}%))`,
                    }}
                >
                    {carouselItems.map((item, i) => {
                        if (item.type === "static") {
                            return (
                                <div key={`static-${item.id}`} className={styles["reminder-card"]}>
                                    <div className="display-4">{item.icon}</div>
                                    <h6 className="fw-bold">{item.title}</h6>
                                    <small>{item.subtitle}</small>
                                </div>
                            );
                        }

                        const contact = contacts.find(
                            (c) => c.id === item.contact_id
                        );

                        return (
                            <div key={`user-${item.id}`} className={styles["reminder-card"]}>
                                <img
                                    src={contact?.img || "https://i.pravatar.cc/80"}
                                    alt={contact?.name}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginBottom: 8,
                                    }}
                                />
                                <h6 className="fw-bold">{contact?.name}</h6>
                                <small className="text-muted">{item.title}</small>
                                <small className="text-muted d-block">
                                    📅 {item.reminder_date}
                                </small>

                                <button
                                    className="btn btn-sm btn-outline-danger mt-2"
                                    onClick={(e) => {
                                        e.stopPropagation(); // 🔑 evita drag
                                        onDeleteReminder(item.id); // 🔥 ID real del backend
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ background: "rgba(0,0,0,.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5>Añadir Recordatorio</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>

                            <div className="modal-body">
                                <select
                                    className="form-select mb-3"
                                    name="contactId"
                                    value={formData.contactId}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecciona un contacto</option>
                                    {contacts.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>

                                {selectedContact && (
                                    <div className="text-center mb-3">
                                        <img
                                            src={selectedContact.img || "https://i.pravatar.cc/100"}
                                            alt=""
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: "50%",
                                            }}
                                        />
                                    </div>
                                )}

                                <input
                                    type="date"
                                    className="form-control mb-3"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                />

                                <select
                                    className="form-select"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecciona un motivo</option>
                                    {REMINDER_REASONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveReminder}
                                >
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
