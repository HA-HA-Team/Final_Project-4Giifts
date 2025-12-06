import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./dashboard.module.css";
import { getPrivateData, getUserContacts } from '../services';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const giftsSectionRef = useRef(null);
  const trackRef = useRef(null);
  const intervalRef = useRef(null);

  const [contacts, setContacts] = useState([]);

  const initialGifts = [
    { id: 101, name: 'Cartera de Cuero', price: '170 €', img: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?w=300', link: '#' },
    { id: 102, name: 'Set de Café', price: '100 €', img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300', link: '#' },
    { id: 103, name: 'Navaja Suiza', price: '250 €', img: 'https://images.unsplash.com/photo-1589311204213-9114f4e3c79c?w=300', link: '#' },
  ];
  const [gifts, setGifts] = useState(initialGifts);

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

  useEffect(() => {
    const loadData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const userResp = await getPrivateData();
        if (!userResp.ok) throw new Error("Auth failed");

        const contactsResp = await getUserContacts();
        if (contactsResp.ok) {
          setContacts(await contactsResp.json());
        }
      } catch (e) {
        sessionStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  useEffect(() => {
    const start = () => { intervalRef.current = setInterval(() => setCurrentSlide(p => (p + 1) % reminders.length), 3000); };
    start();
    return () => clearInterval(intervalRef.current);
  }, [reminders.length]);

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
    if (activeContact && giftsSectionRef.current) {
      setTimeout(() => giftsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [activeContact]);

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
      } catch (e) { console.error(e); }
    }
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const handleLogout = () => { sessionStorage.removeItem("token"); navigate("/"); };

  if (loading) return <div className="text-center p-5">Cargando...</div>;

  return (
    <div className={`${styles["dashboard-wrapper"]} container-fluid p-0`}>
      <div className="row g-0">
        <aside className={`col-md-3 col-lg-2 ${styles["sidebar-wrapper"]}`}>
          <div className={`${styles["sidebar-custom"]} d-flex flex-column`}>
            <nav className="flex-grow-1">
              <a href="#contactos" className={styles["sidebar-link"]}>Contactos</a>
              <div
                className={styles["sidebar-link"]}
                onClick={() => navigate('/generar-ideas/user')}
                style={{ cursor: 'pointer' }}
              >
                Generar ideas para mí
              </div>
              <a href="/favoritos" className={styles["sidebar-link"]}>Mis favoritos</a>
              <a href="#recordatorios" className={styles["sidebar-link"]}>Recordatorios</a>
              <div className="mt-4">
                <label className="text-white mb-2 small">Regalos guardados</label>
                <select className={`form-select ${styles["custom-select"]}`} value={selectedContactId} onChange={(e) => setSelectedContactId(e.target.value)}>
                  <option value="">Selecciona contacto...</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button className={`btn ${styles["btn-ideas"]} mt-5 mx-auto`} onClick={handleLogout}>Salir</button>
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
              <input className={`form-control form-control-plaintext ${styles["search-input"]}`} placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="row g-4 mb-5">
            {filteredContacts.length > 0 ? (
              filteredContacts.map(c => (
                <div key={c.id} className="col-12 col-sm-6 col-lg-4">
                  <div className={`card ${styles["contact-card"]} h-100 text-center p-3`} onClick={() => setSelectedContactId(c.id.toString())}>
                    <button className={styles["btn-delete-contact"]} onClick={(e) => { e.stopPropagation(); setContactToDelete(c); setShowDeleteModal(true); }}>X</button>
                    <div className="card-body d-flex flex-column align-items-center">
                      <img src={c.img || "https://i.pravatar.cc/150"} className={`${styles["contact-img"]} mb-3`} onError={(e) => e.target.src = "https://i.pravatar.cc/150"} alt={c.name} />
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
            <h5 className={`${styles["section-title"]} text-center mb-4`}>RECORDATORIOS</h5>
            <div className={styles["reminder-viewport"]} ref={trackRef} onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}>
              <div className={`${styles["reminder-track"]} ${isDragging ? styles.dragging : ''}`} style={{ transform: `translateX(calc(-${currentSlide * 33.33}% + ${dragTranslate}%))` }}>
                {reminders.concat(reminders).map((r, i) => (
                  <div key={`${r.id}-${i}`} className={styles["reminder-card"]}>
                    <div className="display-4">{r.icon}</div>
                    <h6 className="fw-bold">{r.title}</h6>
                    <small>{r.subtitle}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeContact && (
            <div ref={giftsSectionRef} className={`${styles["saved-gifts-section"]} shadow`}>
              <button className={styles["btn-close-gifts"]} onClick={() => setSelectedContactId('')}>X</button>
              <div className={styles["saved-gifts-inner"]}>
                <div className="row mb-4 align-items-center">
                  <div className="col-auto"><img src={activeContact.img || "https://i.pravatar.cc/150"} className={styles["contact-img"]} style={{ width: 60, height: 60 }} onError={(e) => e.target.src = "https://i.pravatar.cc/150"} alt="" /></div>
                  <div className="col">
                    <h4 className="fw-bold text-dark">Regalos de {activeContact.name}</h4>
                    <small className="text-muted d-block mb-2">Relación: {activeContact.relation}</small>
                    <button
                      className={`btn ${styles["btn-ideas"]} btn-sm`}
                      style={{ marginTop: '0' }}
                      onClick={() => navigate(`/generar-ideas/${activeContact.id}`)}
                    >
                      Generar ideas
                    </button>
                  </div>
                </div>
                <div className="row g-3">
                  {gifts.map(g => (
                    <div key={g.id} className="col-12 col-sm-6 col-lg-3">
                      <div className={`${styles["gift-item-card"]} h-100 d-flex flex-column`}>
                        <button className={styles["btn-delete-gift"]} onClick={() => setGifts(gifts.filter(x => x.id !== g.id))}>X</button>
                        <img src={g.img} className={styles["gift-img"]} alt="" />
                        <div className="p-3 flex-grow-1 d-flex flex-column">
                          <h6 className="small fw-bold">{g.name}</h6>
                          <p className="small mb-2 fw-bold text-muted">{g.price}</p>
                          <a href={g.link} className={`btn ${styles["btn-buy"]} mt-auto`}>Comprar</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <h5 className="modal-title">Nuevo Contacto</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3"><label className="form-label">Nombre</label><input type="text" className="form-control" /></div>
                  <div className="mb-3"><label className="form-label">Apellidos</label><input type="text" className="form-control" /></div>
                  <div className="mb-3"><label className="form-label">Parentesco</label><input type="text" className="form-control" /></div>
                  <div className="mb-3"><label className="form-label">Fecha Nacimiento</label><input type="date" className="form-control" /></div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" style={{ backgroundColor: 'var(--color-rose)', border: 'none' }}>Guardar</button>
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