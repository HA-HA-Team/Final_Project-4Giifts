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
    Alerta: "⚠️",
};

const SLIDES_PER_VIEW = 3;
const AUTOPLAY_DELAY = 3000;
const DRAG_THRESHOLD = 50;

const RemindersCarousel = ({
    reminders = [],
    contacts = [],
    onCreateReminder,
    onDeleteReminder,
}) => {
    const trackRef = useRef(null);
    const intervalRef = useRef(null);
    const isLoopingRef = useRef(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [formData, setFormData] = useState({
        reminder_date: "",
        title: "",
    });

    const sortedReminders = useMemo(() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return [...reminders].map(r => {
            let eventDate = new Date(r.reminder_date);

            // Si es cumpleaños o nacimiento, forzamos que sea la PRÓXIMA fecha
            if (r.title === "Cumpleaños" || r.title === "Nacimiento" || r.title === "Aniversario") {
                eventDate.setFullYear(hoy.getFullYear());
                if (eventDate < hoy) {
                    eventDate.setFullYear(hoy.getFullYear() + 1);
                }
            }

            // Calculamos días restantes exactos
            const diffTime = eventDate.getTime() - hoy.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return { ...r, calculatedDate: eventDate, daysLeft: daysLeft };
        }).sort((a, b) => a.daysLeft - b.daysLeft); // Ordenamos: el que falte menos días primero
    }, [reminders]);
    const len = sortedReminders.length;
    const canLoop = len >= SLIDES_PER_VIEW;

    const infiniteReminders = canLoop
        ? [...sortedReminders, ...sortedReminders, ...sortedReminders]
        : sortedReminders;


    useEffect(() => {
        if (len > 0 && canLoop) {

            if (trackRef.current) {
                trackRef.current.style.transition = "none";
                setCurrentSlide(len);
                requestAnimationFrame(() => {
                    if (trackRef.current) {
                        trackRef.current.style.transition = "transform 0.4s ease";
                    }
                });
            }
        }
    }, [len, canLoop]);

    function startAuto() {
        stopAuto();
        intervalRef.current = setInterval(() => {
            if (isLoopingRef.current) return;
            setCurrentSlide((p) => p + 1);
        }, AUTOPLAY_DELAY);
    }


    const stopAuto = () => { clearInterval(intervalRef.current); };

    useEffect(() => {
        if (canLoop) startAuto();
        return () => stopAuto();
    }, [canLoop, len]);

    useEffect(() => {
        if (!canLoop || !trackRef.current) return;

        const track = trackRef.current;

        if (currentSlide >= len * 2) {
            isLoopingRef.current = true;
            track.style.transition = "none";
            setCurrentSlide(len);
            requestAnimationFrame(() => {
                track.style.transform = `translateX(-${len * (100 / SLIDES_PER_VIEW)}%)`;
                requestAnimationFrame(() => {
                    track.style.transition = "transform 0.4s ease";
                    isLoopingRef.current = false;
                });
            });
        }

        if (currentSlide < len) {
            isLoopingRef.current = true;
            track.style.transition = "none";
            const target = len * 2 - 1;
            setCurrentSlide(target);
            requestAnimationFrame(() => {
                track.style.transform = `translateX(-${(len * 2 - 1) * (100 / SLIDES_PER_VIEW)}%)`;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        track.style.transition = "transform 0.4s ease";
                        isLoopingRef.current = false;
                    });
                });
            });
        }
    }, [currentSlide, len, canLoop]);


    const handleDragStart = (e) => {
        if (!canLoop) return;
        setIsDragging(true);
        setStartX(e.clientX || e.touches?.[0]?.clientX);
        stopAuto();
    };

    const handleDragMove = () => { };

    const handleDragEnd = (e) => {
        if (!canLoop || !isDragging) return;

        const endX = e.clientX || e.changedTouches?.[0]?.clientX;
        const diff = endX - startX;
        if (diff < -DRAG_THRESHOLD) setCurrentSlide((p) => p + 1);
        else if (diff > DRAG_THRESHOLD) setCurrentSlide((p) => p - 1);
        setIsDragging(false);
        startAuto();
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
    const europeDate = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
    }

    return (
        <div id="recordatorios" className="mb-4 pt-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className={styles["section-title"]}>RECORDATORIOS</h5>
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
                            transform: `translateX(-${currentSlide * (100 / SLIDES_PER_VIEW)}%)`,
                            transition: "transform 0.4s ease",
                            display: "flex",
                        }}
                    >
                        {infiniteReminders.map((r, i) => {
                            const contact = contacts.find(
                                (c) => c.id === r.contact_id
                            );


                            return (
                                <div
                                    key={`${r.id}-${i}`}
                                    className={styles["reminder-card"]}
                                >
                                    <div className={styles["reminder-card-inner"]}>
                                        {contact && (
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <img
                                                    src={contact.img || `https://api.dicebear.com/9.x/avataaars/svg?seed=${contact.name}`}
                                                    alt={contact.name}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                                <strong className="small">
                                                    {contact.name}
                                                </strong>
                                            </div>
                                        )}

                                        <h6 className="fw-bold">{r.title}</h6>
                                        <small>{europeDate(r.calculatedDate.toISOString().split('T')[0])}</small>
                                        <div className="display-4">
                                            {ICONS[r.title] || "⏰"}
                                        </div>


                                        <h4
                                            className={`${styles["days-lefts"]} ${r.daysLeft <= 15 ? styles.emergencyLight : ""}`}
                                        >
                                            {r.daysLeft === 0 ? "¡Es HOY!" : `${r.daysLeft} días restantes`}
                                        </h4>
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
            )}

            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ background: "rgba(0,0,0,.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content p-4">
                            <h5 className="mb-3">Nuevo Recordatorio</h5>

                            <label className="form-label">Contacto</label>
                            <div className="d-flex gap-2 mb-3 flex-wrap">
                                {contacts.map((c) => (
                                    <div
                                        key={c.id}
                                        className={`text-center p-2 border rounded ${selectedContact?.id === c.id
                                            ? "border-danger"
                                            : ""
                                            }`}
                                        style={{ cursor: "pointer", width: 90 }}
                                        onClick={() => setSelectedContact(c)}
                                    >
                                        <img
                                            src={c.img || `https://api.dicebear.com/9.x/avataaars/svg?seed=${c.name}`}
                                            alt={c.name}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <small className="d-block mt-1">
                                            {c.name}
                                        </small>
                                    </div>
                                ))}
                            </div>

                            <label className="form-label">Fecha</label>
                            <input
                                type="date"
                                className="form-control mb-3"
                                value={formData.reminder_date}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        reminder_date: e.target.value,
                                    })
                                }
                            />

                            <label className="form-label">Motivo</label>
                            <select
                                className="form-select mb-4"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
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
                                <button
                                    className="btn btn-secondary"
                                    onClick={closeModal}
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
