import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./dashboard.module.css";
import {
  getPrivateData,
  getUserContacts,
  createContact,
  updateContact,
  getContactFavorites,
  deleteFavorite,
  getReminders,
  createUserReminder   // 👈 ESTE FALTABA
} from '../services';


const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const giftsSectionRef = useRef(null);
  const trackRef = useRef(null);
  const intervalRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [activeFavorites, setActiveFavorites] = useState([]);
  const [userReminders, setUserReminders] = useState([]);

  const initialFormState = {
    name: '', relation: '', birth_date: '', gender: '', hobbies: '', ocupacion: '', tipo_personalidad: '', url_img: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingContactId, setEditingContactId] = useState(null);

  // Carrusel mock que ya tenías (NO lo elimino)
  const [reminders] = useState([
    { id: 1, title: 'Cumpleaños', subtitle: '(Pronto)', icon: '🎂' },
    { id: 2, title: 'Navidad', subtitle: '(Se acerca)', icon: '🎄' },
    { id: 3, title: 'San Valentín', subtitle: '(Próximo)', icon: '❤️' },
  ]);

  const [selectedContactId, setSelectedContactId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragTranslate, setDragTranslate] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  // ===================== NUEVO: MODAL RECORDATORIO =====================
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    contact_id: '',
    title: '',
    reminder_date: ''
  });

  const MOTIVES = [
    { label: 'Cumpleaños', icon: '🎂' },
    { label: 'Aniversario', icon: '💍' },
    { label: 'Navidad', icon: '🎄' },
    { label: 'San Valentín', icon: '❤️' },
    { label: 'Día del Padre', icon: '👔' },
    { label: 'Día de la Madre', icon: '🌷' },
    { label: 'Graduación', icon: '🎓' },
    { label: 'Boda', icon: '💒' },
    { label: 'Ascenso', icon: '🚀' },
    { label: 'Amigo Invisible', icon: '🎁' },
    { label: 'Otro', icon: '🔔' }
  ];

  const motiveToIcon = (title) => {
    const found = MOTIVES.find(m => m.label.toLowerCase() === (title || '').toLowerCase());
    return found ? found.icon : '🔔';
  };

  const pad2 = (n) => String(n).padStart(2, '0');
  const formatDateESFromISO = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return '';
    const [y, m, d] = yyyy_mm_dd.split('-');
    if (!y || !m || !d) return yyyy_mm_dd;
    return `${pad2(d)}\/${pad2(m)}\/${y}`;
  };

  // ===================== LOAD DATA =====================
  useEffect(() => {
    const loadData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const userResp = await getPrivateData();
        if (!userResp.ok) throw new Error("Auth failed");
        const contactsResp = await getUserContacts();
        if (contactsResp.ok) setContacts(await contactsResp.json());
      } catch (e) {
        sessionStorage.removeItem("token");
        navigate("/login");
      } finally { setLoading(false); }
    };
    loadData();
  }, [navigate]);

  const loadReminders = async () => {
    try {
      const res = await getReminders();
      if (res.ok) setUserReminders(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================== CARRUSEL =====================
  useEffect(() => {
    const start = () => {
      intervalRef.current = setInterval(
        () => setCurrentSlide(p => (p + 1) % reminders.length),
        3000
      );
    };
    start();
    return () => clearInterval(intervalRef.current);
  }, [reminders.length]);

  const stopAuto = () => clearInterval(intervalRef.current);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches?.[0]?.clientX);
    stopAuto();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX || e.touches?.[0]?.clientX;
    if (trackRef.current && typeof x === 'number') {
      setDragTranslate(((x - startX) / trackRef.current.offsetWidth) * 100);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragTranslate < -5) setCurrentSlide(p => (p + 1) % reminders.length);
    else if (dragTranslate > 5) setCurrentSlide(p => (p - 1 + reminders.length) % reminders.length);
    setDragTranslate(0);
  };

  // ===================== FAVORITOS =====================
  const activeContact = contacts.find(c => c.id.toString() === selectedContactId.toString());

  useEffect(() => {
    if (activeContact) {
      getContactFavorites(activeContact.id).then(res => {
        if (res.ok) return res.json();
        return [];
      }).then(data => setActiveFavorites(data));

      if (giftsSectionRef.current) {
        setTimeout(() => giftsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      }
    }
  }, [activeContact, selectedContactId]);

  const handleDeleteFav = async (favId) => {
    const res = await deleteFavorite(favId);
    if (res.ok) {
      setActiveFavorites(activeFavorites.filter(f => f.favorite_id !== favId));
    }
  };

  // ===================== CONTACTOS FILTRADOS =====================
  const normalize = (t) => t ? t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
  const filteredContacts = contacts.filter(c =>
    normalize(c.name).includes(normalize(searchTerm)) || normalize(c.relation).includes(normalize(searchTerm))
  );

  // ===================== DELETE CONTACT =====================
  const confirmDelete = async () => {
    if (contactToDelete) {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contacto/${contactToDelete.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setContacts(contacts.filter(c => c.id !== contactToDelete.id));
          if (selectedContactId === contactToDelete.id.toString()) setSelectedContactId('');
        }
      } catch (e) {
        console.error(e);
      }
    }
    setShowDeleteModal(false);
    setContactToDelete(null);
    setDeleteConfirmed(false);
  };

  // ===================== AUTH / FORM =====================
  const handleLogout = () => { sessionStorage.removeItem("token"); navigate("/"); };
  const handleInputChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const resetModal = () => { setShowAddModal(false); setFormData(initialFormState); setEditingContactId(null); };

  const handleEditClick = (e, contact) => {
    e.stopPropagation();
    setEditingContactId(contact.id);
    setFormData({
      name: contact.name || '',
      relation: contact.relation || '',
      birth_date: contact.birth_date || '',
      gender: contact.gender || '',
      hobbies: contact.hobbies || '',
      ocupacion: contact.ocupacion || '',
      tipo_personalidad: contact.tipo_personalidad || '',
      // ✅ FIX: usar url_img real del backend
      url_img: contact.url_img || contact.img || ''
    });
    setShowAddModal(true);
  };

  const handleSaveContact = async () => {
    if (!formData.name) return alert("El nombre es obligatorio");
    try {
      let res;
      if (editingContactId) res = await updateContact(editingContactId, formData);
      else res = await createContact(formData);

      if (res.ok) {
        const savedContact = await res.json();
        if (editingContactId) setContacts(contacts.map(c => c.id === editingContactId ? savedContact : c));
        else setContacts([...contacts, savedContact]);
        resetModal();
      } else alert("Error al guardar contacto");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ===================== RECORDATORIOS ENRIQUECIDOS =====================
  const remindersDisplay = useMemo(() => {
    // userReminders: [{id, contact_id, title, reminder_date, ...}]
    return (Array.isArray(userReminders) ? userReminders : [])
      .map(r => {
        const contact = contacts.find(c => c.id === r.contact_id);
        return {
          ...r,
          _contact: contact || null,
          _icon: motiveToIcon(r.title),
          _dateLabel: formatDateESFromISO(r.reminder_date)
        };
      })
      .sort((a, b) => {
        const da = new Date(a.reminder_date).getTime();
        const db = new Date(b.reminder_date).getTime();
        return da - db;
      });
  }, [userReminders, contacts]);

  const selectedReminderContact = useMemo(() => {
    return contacts.find(c => c.id.toString() === reminderForm.contact_id.toString());
  }, [contacts, reminderForm.contact_id]);

  const saveReminder = async () => {
    if (!reminderForm.contact_id) return alert("Selecciona un contacto");
    if (!reminderForm.title) return alert("Selecciona un motivo");
    if (!reminderForm.reminder_date) return alert("Selecciona una fecha");

    // ✅ FIX fecha a ISO seguro
    const isoDate = reminderForm.reminder_date.includes('/')
      ? reminderForm.reminder_date.split('/').reverse().join('-')
      : reminderForm.reminder_date;

    try {
      const res = await createUserReminder({
        contact_id: Number(reminderForm.contact_id),
        title: reminderForm.title,
        reminder_date: isoDate
      });

      if (res.ok) {
        setShowReminderModal(false);
        setReminderForm({ contact_id: '', title: '', reminder_date: '' });
        await loadReminders();
      } else {
        alert("Error al crear recordatorio");
      }
    } catch (e) {
      console.error(e);
      alert("Error al crear recordatorio");
    }
  };

  if (loading) return <div className="text-center p-5">Cargando...</div>;

  return (
    <div className={`${styles["dashboard-wrapper"]} container-fluid p-0`}>
      <div className="row g-0">
        <aside className={`col-md-3 col-lg-2 ${styles["sidebar-wrapper"]}`}>
          <div className={`${styles["sidebar-custom"]} d-flex flex-column`}>
            <nav className="flex-grow-1">
              <a href="#contactos" className={styles["sidebar-link"]}>Contactos</a>
              <div className={styles["sidebar-link"]} onClick={() => navigate('/generar-ideas/user')} style={{ cursor: 'pointer' }}>
                Generar ideas para mí
              </div>
              <a href="#recordatorios" className={styles["sidebar-link"]}>Recordatorios</a>

              <div className="mt-4">
                <label className="text-white mb-2 small">Regalos guardados</label>
                <select
                  className={`form-select ${styles["custom-select"]}`}
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                >
                  <option value="">Selecciona contacto...</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <button className={`btn ${styles["btn-ideas"]} mt-3 mx-auto`} onClick={() => navigate("/profile/edit")}>
                Editar Perfil
              </button>

              <button className={`btn ${styles["btn-ideas"]} mt-5 mx-auto`} onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </aside>

        <main className="col-md-9 col-lg-10 p-4 p-md-5">
          <div id="contactos" className="d-flex justify-content-between align-items-center mb-4 pt-3">
            <div className="d-flex align-items-center">
              <h2 className={`${styles["section-title"]} mb-0 me-3`}>CONTACTOS</h2>
              <button className={styles["btn-add-contact"]} onClick={() => setShowAddModal(true)}>+</button>
            </div>
            <div className={styles["search-input-container"]}>
              <input
                className={`form-control form-control-plaintext ${styles["search-input"]}`}
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-4 mb-5">
            {filteredContacts.length > 0 ? (
              filteredContacts.map(c => (
                <div key={c.id} className="col-12 col-sm-6 col-lg-4">
                  <div
                    className={`card ${styles["contact-card"]} h-100 text-center p-3`}
                    onClick={() => setSelectedContactId(c.id.toString())}
                  >
                    <button className={styles["btn-edit-contact"]} onClick={(e) => handleEditClick(e, c)}>✎</button>
                    <button
                      className={styles["btn-delete-contact"]}
                      onClick={(e) => { e.stopPropagation(); setContactToDelete(c); setDeleteConfirmed(false); setShowDeleteModal(true); }}
                    >
                      X
                    </button>

                    <div className="card-body d-flex flex-column align-items-center">
                      {/* ✅ FIX: usar url_img primero */}
                      <img
                        src={c.url_img || c.img || "https://i.pravatar.cc/150"}
                        className={`${styles["contact-img"]} mb-3`}
                        onError={(e) => { e.target.src = "https://i.pravatar.cc/150"; }}
                        alt={c.name}
                      />
                      <h5 className="fw-bold">{c.name}</h5>
                      <small className="text-muted mb-2">{c.relation}</small>
                      <button
                        className={`btn ${styles["btn-ideas"]} mt-auto`}
                        onClick={(e) => { e.stopPropagation(); navigate(`/generar-ideas/${c.id}`); }}
                      >
                        Generar ideas
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 col-sm-6 col-lg-4">
                <div
                  className={`card h-100 d-flex flex-column align-items-center justify-content-center p-4`}
                  style={{ border: '2px dashed #ccc', borderRadius: '20px', minHeight: '250px' }}
                >
                  <h5 className="text-muted mb-3">Crea tu primer contacto</h5>
                  <button
                    className={styles["btn-add-contact"]}
                    style={{ width: '60px', height: '60px', fontSize: '2rem' }}
                    onClick={() => setShowAddModal(true)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div id="recordatorios" className="mb-2 pt-3">
            <h5 className={`${styles["section-title"]} text-center mb-4`}>RECORDATORIOS</h5>

            {/* ✅ NUEVO: botón añadir recordatorio */}
            <div className="text-center mb-3">
              <button className={`btn ${styles["btn-ideas"]}`} onClick={() => setShowReminderModal(true)}>
                Añadir recordatorio
              </button>
            </div>

            {/* Carrusel mock original (NO lo elimino) */}
            <div
              className={styles["reminder-viewport"]}
              ref={trackRef}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              <div
                className={`${styles["reminder-track"]} ${isDragging ? styles.dragging : ''}`}
                style={{ transform: `translateX(calc(-${currentSlide * 33.33}% + ${dragTranslate}%))` }}
              >
                {reminders.concat(reminders).map((r, i) => (
                  <div key={`${r.id}-${i}`} className={styles["reminder-card"]}>
                    <div className="display-4">{r.icon}</div>
                    <h6 className="fw-bold">{r.title}</h6>
                    <small>{r.subtitle}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ NUEVO: recordatorios reales del usuario */}
            {remindersDisplay.length > 0 && (
              <div className="row g-3 mt-4">
                {remindersDisplay.map(r => {
                  const c = r._contact;
                  return (
                    <div key={r.id} className="col-12 col-sm-6 col-lg-4">
                      <div className="card p-3 shadow-sm" style={{ borderRadius: "16px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ fontSize: "1.6rem" }}>{r._icon}</div>
                          <div className="fw-bold">{r.title}</div>
                        </div>

                        {c ? (
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <img
                              src={c.url_img || c.img || "https://i.pravatar.cc/150"}
                              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                              onError={(e) => { e.target.src = "https://i.pravatar.cc/150"; }}
                              alt={c.name}
                            />
                            <div>
                              <small className="text-muted d-block">{c.name}</small>
                              <div className="fw-semibold">{r._dateLabel}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <small className="text-muted d-block">Contacto no encontrado</small>
                            <div className="fw-semibold">{r._dateLabel}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {remindersDisplay.length === 0 && (
              <div className="text-center text-muted mt-3">
                Aún no tienes recordatorios guardados.
              </div>
            )}
          </div>

          {activeContact && (
            <div ref={giftsSectionRef} className={`${styles["saved-gifts-section"]} shadow`}>
              <button className={styles["btn-close-gifts"]} onClick={() => setSelectedContactId('')}>X</button>
              <div className={styles["saved-gifts-inner"]}>
                <div className="row mb-4 align-items-center">
                  <div className="col-auto">
                    {/* ✅ FIX: usar url_img primero */}
                    <img
                      src={activeContact.url_img || activeContact.img || "https://i.pravatar.cc/150"}
                      className={styles["contact-img"]}
                      style={{ width: 60, height: 60 }}
                      onError={(e) => { e.target.src = "https://i.pravatar.cc/150"; }}
                      alt=""
                    />
                  </div>
                  <div className="col">
                    <h4 className="fw-bold text-dark">Favoritos de {activeContact.name}</h4>
                    <small className="text-muted d-block mb-2">Relación: {activeContact.relation}</small>
                  </div>
                </div>

                {activeFavorites.length > 0 ? (
                  <div className="row g-3">
                    {activeFavorites.map(g => (
                      <div key={g.favorite_id} className="col-12 col-sm-6 col-lg-3">
                        <div className={`${styles["gift-item-card"]} h-100 d-flex flex-column`}>
                          <button className={styles["btn-delete-gift"]} onClick={() => handleDeleteFav(g.favorite_id)}>X</button>
                          <img src={g.img} className={styles["gift-img"]} alt="" onError={(e) => e.target.src = "https://via.placeholder.com/300"} />
                          <div className="p-3 flex-grow-1 d-flex flex-column">
                            <h6 className="small fw-bold">{g.name}</h6>
                            <p className="small mb-2 fw-bold text-muted">{g.price}</p>
                            <a href={g.link} target="_blank" rel="noreferrer" className={`btn ${styles["btn-buy"]} mt-auto`}>Comprar</a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <h5 className="text-muted mb-3">No hay favoritos guardados para {activeContact.name}</h5>
                    <button className={`btn ${styles["btn-ideas"]}`} onClick={() => navigate(`/generar-ideas/${activeContact.id}`)}>
                      Generar ideas para regalarle a {activeContact.name}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL CONTACTO (existente) */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingContactId ? "Editar Contacto" : "Nuevo Contacto"}</h5>
                <button type="button" className="btn-close" onClick={resetModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3"><label className="form-label">Nombre Completo</label><input type="text" className="form-control" name="name" placeholder="Nombre y Apellidos" value={formData.name} onChange={handleInputChange} /></div>
                  <div className="row">
                    <div className="col-6 mb-3"><label className="form-label">Parentesco</label><input type="text" className="form-control" name="relation" placeholder="Ej: Amiga, Padre, Primo..." value={formData.relation} onChange={handleInputChange} /></div>
                    <div className="col-6 mb-3"><label className="form-label">Fecha Nacimiento</label><input type="date" className="form-control" name="birth_date" value={formData.birth_date} onChange={handleInputChange} /></div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Género</label>
                      <select className="form-select" name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="">Masculino/Femenino/Otro</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option>
                      </select>
                    </div>
                    <div className="col-6 mb-3"><label className="form-label">Ocupación</label><input type="text" className="form-control" name="ocupacion" placeholder="Ej: Arquitecto, Estudiante..." value={formData.ocupacion} onChange={handleInputChange} /></div>
                  </div>
                  <div className="mb-3"><label className="form-label">Personalidad</label><input type="text" className="form-control" name="tipo_personalidad" placeholder="Ej: Extrovertido, Friki, Serio..." value={formData.tipo_personalidad} onChange={handleInputChange} /></div>
                  <div className="mb-3"><label className="form-label">Hobbies</label><textarea className="form-control" rows="2" name="hobbies" placeholder="Ej: Tenis, Videojuegos, Lectura..." value={formData.hobbies} onChange={handleInputChange}></textarea></div>
                  <div className="mb-3"><label className="form-label">URL Imagen</label><input type="text" className="form-control" name="url_img" placeholder="https://..." value={formData.url_img} onChange={handleInputChange} /></div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetModal}>Cancelar</button>
                <button type="button" className="btn btn-primary" style={{ backgroundColor: 'var(--color-rose)', border: 'none' }} onClick={handleSaveContact}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE (existente) */}
      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-danger">Eliminar Contacto</h5>
                <button type="button" className="btn-close" onClick={() => { setShowDeleteModal(false); setDeleteConfirmed(false); }}></button>
              </div>
              <div className="modal-body">
                <p>Vas a eliminar a <strong>{contactToDelete?.name}</strong>.</p>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" checked={deleteConfirmed} onChange={(e) => setDeleteConfirmed(e.target.checked)} id="delCheck" />
                  <label className="form-check-label" htmlFor="delCheck">¿Estás seguro que deseas borrar este contacto?</label>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowDeleteModal(false); setDeleteConfirmed(false); }}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={!deleteConfirmed}>Confirmar Borrado</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NUEVO MODAL: AÑADIR RECORDATORIO */}
      {showReminderModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Añadir recordatorio</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => { setShowReminderModal(false); setReminderForm({ contact_id: '', title: '', reminder_date: '' }); }}
                ></button>
              </div>

              <div className="modal-body">
                {selectedReminderContact && (
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src={selectedReminderContact.url_img || selectedReminderContact.img || "https://i.pravatar.cc/150"}
                      className={styles["contact-img"]}
                      style={{ width: 60, height: 60 }}
                      onError={(e) => { e.target.src = "https://i.pravatar.cc/150"; }}
                      alt={selectedReminderContact.name}
                    />
                    <div>
                      <div className="fw-bold">{selectedReminderContact.name}</div>
                      {selectedReminderContact.birth_date && (
                        <small className="text-muted">
                          Cumpleaños: {formatDateESFromISO(selectedReminderContact.birth_date)}
                        </small>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Contacto</label>
                  <select
                    className="form-select"
                    value={reminderForm.contact_id}
                    onChange={(e) => setReminderForm({ ...reminderForm, contact_id: e.target.value })}
                  >
                    <option value="">Selecciona contacto...</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Motivo</label>
                  <select
                    className="form-select"
                    value={reminderForm.title}
                    onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  >
                    <option value="">Selecciona motivo...</option>
                    {MOTIVES.map(m => (
                      <option key={m.label} value={m.label}>
                        {m.icon} {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={reminderForm.reminder_date}
                    onChange={(e) => setReminderForm({ ...reminderForm, reminder_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowReminderModal(false); setReminderForm({ contact_id: '', title: '', reminder_date: '' }); }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--color-rose)', border: 'none' }}
                  onClick={saveReminder}
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

export default Dashboard;
