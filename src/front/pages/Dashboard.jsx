import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const giftsSectionRef = useRef(null);
  const intervalRef = useRef(null);
  const trackRef = useRef(null);

  // --- Verificación Token y recogida datos---
  useEffect(() => {
          const verifyToken = async () => {
              const token = sessionStorage.getItem("token");
  
              if (!token) {
  
                  alert("No tienes acceso, inicia sesión!")
                  //Quitar este comentario para que redirija a login
                  //navigate("/login");
                  return;
              }

  // --- Peticiones fetch y almacenamiento datos---
              /* try {
                  const resp = await getPrivateData();
                  if (resp.ok) {
                      const data = await resp.json();
                      setUserInfo(data);
                      setLoading(false);
                  } else {
                      sessionStorage.removeItem("token");
                      navigate("/login");
                  }
              } catch (error) {
                  console.error(error);
                  sessionStorage.removeItem("token");
                  navigate("/login");
              }
          }; */
  
          verifyToken();
      }, []);

  // --- DATOS PROVISIONALES ---
  const initialContacts = [
    { id: 1, name: 'María', relation: 'Mamá', img: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Juan', relation: 'Papá', img: 'https://i.pravatar.cc/150?img=11' },
    { id: 3, name: 'Ana', relation: 'Novi@', img: 'https://i.pravatar.cc/150?img=5' },
    { id: 4, name: 'Chirla', relation: 'Amig@', img: 'https://i.pravatar.cc/150?img=9' },
    { id: 5, name: 'Ella', relation: 'Amig@', img: 'https://i.pravatar.cc/150?img=20' },
    { id: 6, name: 'Carlos', relation: 'Hermano', img: 'https://i.pravatar.cc/150?img=13' },
    { id: 7, name: 'María', relation: 'Mamá', img: 'https://i.pravatar.cc/150?img=1' },
    { id: 8, name: 'Juan', relation: 'Papá', img: 'https://i.pravatar.cc/150?img=11' },
    { id: 9, name: 'Ana', relation: 'Novi@', img: 'https://i.pravatar.cc/150?img=5' },
  ];

  const initialReminders = [
    { id: 1, title: 'Cumpleaños de Laura', subtitle: '(Pronto)', icon: '🎂' },
    { id: 2, title: 'Navidad', subtitle: '(Se acerca)', icon: '🎄' },
    { id: 3, title: 'San Valentín', subtitle: '(Próximo)', icon: '❤️' },
    { id: 4, title: 'Día de la Madre', subtitle: 'Mayo 5', icon: '👩' },
    { id: 5, title: 'Aniversario', subtitle: 'Julio 20', icon: '💍' },
    { id: 6, title: 'Cumpleaños de Pedro', subtitle: 'Agosto 15', icon: '🎁' },
  ];

  const initialGiftIdeasData = [
    { id: 101, name: 'Cartera de Cuero', price: '170 €', img: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?auto=format&fit=crop&w=300&q=80', link: '#' },
    { id: 102, name: 'Set de Café', price: '100 €', img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=300&q=80', link: '#' },
    { id: 103, name: 'Navaja Suiza', price: '250 €', img: 'https://images.unsplash.com/photo-1589311204213-9114f4e3c79c?auto=format&fit=crop&w=300&q=80', link: '#' },
    { id: 104, name: 'Paquete Regalo', price: '150 €', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80', link: '#' },
  ];

  // --- ESTADOS ---
  const [contacts, setContacts] = useState(initialContacts);
  const [reminders] = useState(initialReminders);
  const [gifts, setGifts] = useState(initialGiftIdeasData);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragTranslate, setDragTranslate] = useState(0);

  // Estados de Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  // --- LÓGICA CARRUSEL AUTOMÁTICO ---
  const startAutoPlay = () => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reminders.length);
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [reminders.length]);

  // --- LÓGICA DE ARRASTRE (DRAG) ---
  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches[0].clientX);
    stopAutoPlay();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || e.touches[0].clientX;
    const diff = currentX - startX;
    if (trackRef.current) {
        const width = trackRef.current.offsetWidth;
        const movePercent = (diff / width) * 100; 
        setDragTranslate(movePercent);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const threshold = 5; 
    if (dragTranslate < -threshold) {
      setCurrentSlide(prev => (prev + 1) % reminders.length);
    } else if (dragTranslate > threshold) {
      setCurrentSlide(prev => (prev - 1 + reminders.length) % reminders.length);
    }
    setDragTranslate(0);
    startAutoPlay();
  };

  // --- BÚSQUEDA DEL CONTACTO ACTIVO ---
  const activeContact = contacts.find(c => c.id.toString() === selectedContactId.toString());

  // --- AUTO SCROLL ---
  useEffect(() => {
    if (activeContact && giftsSectionRef.current) {
      setTimeout(() => {
        giftsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [activeContact]);

  // --- FILTRADO NORMALIZADO ---
  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filteredContacts = contacts.filter(contact => 
    normalizeText(contact.name).includes(normalizeText(searchTerm)) || 
    normalizeText(contact.relation).includes(normalizeText(searchTerm))
  );

  // --- MANEJADORES DE EVENTOS ---
  const handleContactSelect = (e) => {
    setSelectedContactId(e.target.value);
  };

  const handleCardClick = (id) => {
    setSelectedContactId(id.toString());
  };

  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
    setDeleteConfirmed(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      setContacts(contacts.filter(c => c.id !== contactToDelete.id));
      if (selectedContactId.toString() === contactToDelete.id.toString()) {
        setSelectedContactId('');
      }
    }
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const handleDeleteGift = (giftId) => {
    setGifts(gifts.filter(gift => gift.id !== giftId));
  };

  return (
    <div className="dashboard-wrapper container-fluid p-0">
      <div className="row g-0">
        
        {/* --- SIDEBAR IZQUIERDA --- */}
        <aside className="col-md-3 col-lg-2 sidebar-wrapper">
          <div className="sidebar-custom d-flex flex-column">
             <nav className="flex-grow-1">
              <a href="#contactos-section" className="sidebar-link">Contactos</a>
              <a href="/ideas" className="sidebar-link">Generar ideas para mí</a>
              <a href="/favoritos" className="sidebar-link">Mis favoritos</a>
              <a href="#recordatorios-section" className="sidebar-link">Recordatorios</a>
              
              <div className="mt-4">
                <label className="text-white mb-2 small">Regalos guardados</label>
                <select 
                  className="form-select custom-select" 
                  value={selectedContactId}
                  onChange={handleContactSelect}
                >
                  <option value="">Selecciona contacto...</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.relation})
                    </option>
                  ))}
                </select>
              </div>
            </nav>
          </div>
        </aside>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="col-md-9 col-lg-10 p-4 p-md-5">
          
          {/* SECCIÓN CONTACTOS Y BUSCADOR */}
          <div id="contactos-section" className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pt-3">
            <div className="d-flex align-items-center mb-3 mb-md-0">
              <h2 className="section-title mb-0 me-3">CONTACTOS</h2>
              <button className="btn-add-contact shadow-sm" onClick={() => setShowAddModal(true)}>+</button>
            </div>
            
            <div className="search-input-container w-100 w-md-auto">
              <input 
                type="text" 
                className="form-control form-control-plaintext search-input" 
                placeholder="Buscar por nombre o parentesco..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-4 mb-5">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <div key={contact.id} className="col-12 col-sm-6 col-lg-4">
                  <div 
                    className="card contact-card h-100 text-center p-3"
                    onClick={() => handleCardClick(contact.id)}
                  >
                    <button 
                      className="btn-delete-contact shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDeleteClick(contact);
                      }}
                    >
                      X
                    </button>
                    
                    <div className="card-body d-flex flex-column align-items-center">
                      <img src={contact.img} alt={contact.name} className="contact-img mb-3 shadow-sm" />
                      <h5 className="fw-bold mb-0">{contact.name}</h5>
                      <small className="text-muted mb-2">{contact.relation}</small>
                      
                      <a 
                        href={`/generar-ideas/${contact.id}`} 
                        className="btn btn-ideas mt-auto"
                        onClick={(e) => e.stopPropagation()} 
                      >
                        Generar ideas
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">No se encontraron contactos.</p>
            )}
          </div>

          {/* SECCIÓN RECORDATORIOS */}
          <div id="recordatorios-section" className="mb-2 pt-3">
            <h5 className="section-title text-center mb-4">RECORDATORIOS</h5>
            
            <div 
              className="reminder-viewport"
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
                className={`reminder-track ${isDragging ? 'dragging' : ''}`} 
                style={{ 
                    transform: `translateX(calc(-${currentSlide * (100 / 3)}% + ${dragTranslate}%))` 
                }}
              >
                {reminders.concat(reminders).map((reminder, index) => (
                  <div key={`${reminder.id}-${index}`} className="reminder-card">
                    <div className="display-4 mb-2">{reminder.icon}</div>
                    <h6 className="fw-bold">{reminder.title}</h6>
                    <small>{reminder.subtitle}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN REGALOS GUARDADOS */}
          {activeContact && (
            <div ref={giftsSectionRef} className="saved-gifts-section shadow">
               <button 
                 className="btn-close-gifts shadow-sm" 
                 onClick={() => setSelectedContactId('')}
               >
                 X
               </button>

               <div className="saved-gifts-inner">
                 <div className="row mb-4 align-items-center">
                    <div className="col-auto">
                      <img src={activeContact.img} alt={activeContact.name} className="contact-img" style={{width: '60px', height: '60px'}} />
                    </div>
                    <div className="col">
                       <h4 className="fw-bold mb-0 text-dark">Regalos guardados de {activeContact.name}</h4>
                       <small className="text-muted d-block mb-2">Relación: {activeContact.relation}</small>
                       <a 
                         href={`/generar-ideas/${activeContact.id}`} 
                         className="btn btn-ideas btn-sm"
                         style={{marginTop: '0'}} 
                       >
                         Generar ideas
                       </a>
                    </div>
                 </div>

                 <div className="row g-3">
                    {gifts.length > 0 ? (
                      gifts.map((gift) => (
                        <div key={gift.id} className="col-12 col-sm-6 col-lg-3">
                          <div className="gift-item-card d-flex flex-column h-100">
                            <button 
                              className="btn-delete-gift shadow-sm"
                              onClick={() => handleDeleteGift(gift.id)}
                              title="Eliminar regalo"
                            >
                              X
                            </button>

                            <img src={gift.img} alt={gift.name} className="gift-img" />
                            <div className="p-3 d-flex flex-column flex-grow-1">
                              <h6 className="small fw-bold mb-1 text-truncate text-dark">{gift.name}</h6>
                              <p className="small mb-3 fw-bold text-muted">{gift.price}</p>
                              <a href={gift.link} className="btn btn-buy mt-auto">
                                Comprar
                              </a>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted w-100">No hay regalos guardados para este contacto.</p>
                    )}
                 </div>
               </div>
            </div>
          )}

        </main>
      </div>

      {/* --- MODAL: AÑADIR CONTACTO --- */}
      {showAddModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
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
                <button type="button" className="btn btn-primary" style={{backgroundColor: 'var(--color-rose)', border:'none'}}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ELIMINAR CONTACTO --- */}
      {showDeleteModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-danger">Eliminar Contacto</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Vas a eliminar a <strong>{contactToDelete?.name}</strong>.</p>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" checked={deleteConfirmed} onChange={(e) => setDeleteConfirmed(e.target.checked)} id="delCheck"/>
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