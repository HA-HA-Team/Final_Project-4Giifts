import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./dashboard.module.css";
import { getPrivateData, getUserContacts, createContact, updateContact, getContactFavorites, deleteFavorite } from '../services';
import RemindersCarousel from "../components/RemindersCarousel";
import {
  getReminders,
  createReminder,
  deleteReminder,
} from "../services";
import { faCommentsDollar } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const giftsSectionRef = useRef(null);
  const trackRef = useRef(null);
  const intervalRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [activeFavorites, setActiveFavorites] = useState([]);

  const initialFormState = {
    name: '', relation: '', birth_date: '', gender: '', hobbies: '', ocupacion: '', tipo_personalidad: '', url_img: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingContactId, setEditingContactId] = useState(null);

  const [reminders, setReminders] = useState([]);




{/*HUGO: automatizar reminders*/}
  const loadReminders = async () => {
    try {
      const res = await getReminders();
      if (res.ok) {
        const data = await res.json();
        const dataWithReminder = data.map(reminder => {
          const msPerDay = 24 * 60 * 60 * 1000;
          const reminderDate = new Date(reminder.reminder_date);
          const today = new Date();

          let nextDate = new Date(
            today.getFullYear(), 
            reminderDate.getMonth(),
            reminderDate.getDate()
          );
          if (nextDate < today) {
            nextDate.setFullYear(today.getFullYear() + 1);
          }
          const daysLeft = Math.ceil((nextDate - today) / msPerDay);
          return { daysLeft, nextDate, ...reminder };
        })
        const sortedReminders = dataWithReminder.sort((a, b) => {
          const dateA = new Date(a.reminder_date);
          const dateB = new Date(b.reminder_date);

          return dateA - dateB;
        });

        setReminders(sortedReminders);
      }
    } catch (err) {
      console.error("Error cargando recordatorios", err);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);


  const handleCreateReminder = async (data) => {
    try {
      const res = await createReminder(data);
      if (!res.ok) return;


      await loadReminders();
    } catch (err) {
      console.error("Error creando recordatorio", err);
    }
  };


  const handleDeleteReminder = async (id) => {
    try {
      await deleteReminder(id);


      await loadReminders();
    } catch (err) {
      console.error("Error eliminando recordatorio", err);
    }
  };



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



  const stopAuto = () => clearInterval(intervalRef.current);
  const handleDragStart = (e) => { setIsDragging(true); setStartX(e.clientX || e.touches[0].clientX); stopAuto(); };
  const handleDragMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX || e.touches[0].clientX;
    if (trackRef.current) setDragTranslate(((x - startX) / trackRef.current.offsetWidth) * 100);
  };
  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragTranslate < -5) setCurrentSlide(p => (p + 1) % reminders.length);
    else if (dragTranslate > 5) setCurrentSlide(p => (p - 1 + reminders.length) % reminders.length);
    setDragTranslate(0);
  };

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

  const normalize = (t) => t ? t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
  const filteredContacts = contacts.filter(c =>
    normalize(c.name).includes(normalize(searchTerm)) || normalize(c.relation).includes(normalize(searchTerm))
  );

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
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorito/contact/${contactToDelete.id}`, 
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          await loadReminders();
      } catch (e) { console.error(e); }
    }
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const handleLogout = () => { sessionStorage.removeItem("token"); navigate("/"); window.dispatchEvent(new Event("auth-change")); };
  const handleInputChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const resetModal = () => { setShowAddModal(false); setFormData(initialFormState); setEditingContactId(null); };

  const handleEditClick = (e, contact) => {
    e.stopPropagation();
    setEditingContactId(contact.id);
    setFormData({
      name: contact.name || '', relation: contact.relation || '', birth_date: contact.birth_date || '',
      gender: contact.gender || '', hobbies: contact.hobbies || '', ocupacion: contact.ocupacion || '',
      tipo_personalidad: contact.tipo_personalidad || '', url_img: contact.img || ''
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
        if (editingContactId) 
          setContacts(contacts.map(c => c.id === editingContactId ? savedContact : c));
        else setContacts([...contacts, savedContact]);
        setContacts([...contacts, savedContact]);
        await loadReminders();
        
        resetModal();
      } else 
        alert("Error al guardar contacto");
    } catch (error) { console.error("Error:", error); }
  };

  if (loading) return <div className="text-center p-5">Cargando...</div>;

  return (
    <div className={`${styles["dashboard-wrapper"]} container-fluid p-0`}>
      <div className="row g-0">
        <aside className={`col-md-3 col-lg-2 ${styles["sidebar-wrapper"]}`}>
          <div className={`${styles["sidebar-custom"]} d-flex flex-column`}>
            <nav className="flex-grow-1">
              <a href="#contactos" className={styles["sidebar-link"]}>Contactos</a>
              <div className={styles["sidebar-link"]} onClick={() => navigate('/generar-ideas/user')} style={{ cursor: 'pointer' }}>Generar ideas para mí</div>
              <div className={styles["sidebar-link"]} onClick={() => navigate('/misfavoritos')} style={{ cursor: 'pointer' }}>Mis Favoritos</div>
              <a href="#recordatorios" className={styles["sidebar-link"]}>Recordatorios</a>
              <div className="mt-4">
                <label className={styles["sidebar-link"]}>Regalos guardados</label>
                <select className={`form-select ${styles["custom-select"]}`} value={selectedContactId} onChange={(e) => setSelectedContactId(e.target.value)}>
                  <option value="">Selecciona contacto...</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="mt-5 d-flex justify-content-center gap-3">
                <button
                  className={`btn ${styles["btn-ideas"]}`}
                  onClick={() => navigate("/profile/edit")}
                >
                  Editar Perfil
                </button>

                <button
                  className={`btn ${styles["btn-ideas"]}`}
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
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
              <input className={`form-control form-control-plaintext ${styles["search-input"]}`} placeholder="Buscar contactos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="row g-4 mb-5">
            {filteredContacts.length > 0 ? (
              filteredContacts.map(c => (
                <div key={c.id} className="col-12 col-sm-6 col-lg-4">
                  <div className={`card ${styles["contact-card"]} h-100 text-center p-3`} onClick={() => setSelectedContactId(c.id.toString())}>
                    <button className={styles["btn-edit-contact"]} onClick={(e) => handleEditClick(e, c)}>✎</button>
                    <button className={styles["btn-delete-contact"]} onClick={(e) => { e.stopPropagation(); setContactToDelete(c); setShowDeleteModal(true); }}>X</button>
                    <div className="card-body d-flex flex-column align-items-center">
                      <img
                        src={c.img || `https://api.dicebear.com/9.x/avataaars/svg?seed=${c.name}`}
                        className={`${styles["contact-img"]} mb-3`}
                        onError={(e) => e.target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${c.name}`}
                        alt={c.name}
                      />
                      <h5 className="fw-bold">{c.name}</h5>
                      <small className="text-muted mb-2">{c.relation}</small>
                      <button className={`btn ${styles["btn-ideas"]} mt-auto`} onClick={(e) => { e.stopPropagation(); navigate(`/generar-ideas/${c.id}`); }}>Generar ideas</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 col-sm-6 col-lg-4">
                <div className={`card h-100 d-flex flex-column align-items-center justify-content-center p-4`} style={{ border: '2px dashed #ccc', borderRadius: '20px', minHeight: '250px' }}>
                  <h5 className="text-muted mb-3">Crea tu primer contacto</h5>
                  <button className={styles["btn-add-contact"]} style={{ width: '60px', height: '60px', fontSize: '2rem' }} onClick={() => setShowAddModal(true)}>+</button>
                </div>
              </div>
            )}
          </div>

          <div id="recordatorios" className="mb-2 pt-3">
            <RemindersCarousel
              reminders={reminders}
              contacts={contacts}
              onCreateReminder={handleCreateReminder}
              onDeleteReminder={handleDeleteReminder}
            />
          </div>

          {activeContact && (
            <div ref={giftsSectionRef} className={`${styles["saved-gifts-section"]} shadow`}>
              <button className={styles["btn-close-gifts"]} onClick={() => setSelectedContactId('')}>X</button>
              <div className={styles["saved-gifts-inner"]}>
                <div className="row mb-4 align-items-center">
                  <div className="col-auto">
                    <img
                      src={activeContact.img || `https://api.dicebear.com/9.x/avataaars/svg?seed=${activeContact.name}`}
                      className={styles["contact-img"]}
                      style={{ width: 60, height: 60 }}
                      onError={(e) => e.target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${activeContact.name}`}
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
                  <div className="mb-3"><label className="form-label">Nombre*</label><input type="text" className="form-control" name="name" placeholder="Nombre" value={formData.name} required onChange={handleInputChange} /></div>
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

      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-danger">Eliminar Contacto</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Vas a eliminar a <strong>{contactToDelete?.name}</strong>.</p>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" checked={deleteConfirmed} onChange={(e) => setDeleteConfirmed(e.target.checked)} id="delCheck" />
                  <label className="form-check-label" htmlFor="delCheck">¿Estás seguro que deseas borrar este contacto?</label>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={!deleteConfirmed}>Confirmar Borrado</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;