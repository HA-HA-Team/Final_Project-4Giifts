import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./dashboard.module.css";

import {
  getPrivateData,
  getUserContacts,
  createContact,
  updateContact,
  getContactFavorites,
  deleteFavorite,
} from "../services";

import RemindersCarousel from "../components/RemindersCarousel";
import {
  getReminders,
  createReminder,
  deleteReminder,
} from "../services";

const Dashboard = () => {
  const navigate = useNavigate();
  const giftsSectionRef = useRef(null);

  /* ===================== STATE ===================== */

  const [loading, setLoading] = useState(true);

  const [contacts, setContacts] = useState([]);
  const [activeFavorites, setActiveFavorites] = useState([]);
  const [userReminders, setUserReminders] = useState([]);

  const [selectedContactId, setSelectedContactId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const initialFormState = {
    name: "",
    relation: "",
    birth_date: "",
    gender: "",
    hobbies: "",
    ocupacion: "",
    tipo_personalidad: "",
    url_img: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editingContactId, setEditingContactId] = useState(null);

 

  const reminders = [
    { id: 1, title: "Cumpleaños", subtitle: "(Pronto)", icon: "🎂" },
    { id: 2, title: "Navidad", subtitle: "(Se acerca)", icon: "🎄" },
    { id: 3, title: "San Valentín", subtitle: "(Próximo)", icon: "❤️" },
  ];

  

  useEffect(() => {
    const loadData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userResp = await getPrivateData();
        if (!userResp.ok) throw new Error();

        const contactsResp = await getUserContacts();
        if (contactsResp.ok) {
          setContacts(await contactsResp.json());
        }

        const remindersResp = await getReminders();
        if (remindersResp.ok) {
          setUserReminders(await remindersResp.json());
        }
      } catch (e) {
        console.error(e);
        sessionStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  

  const activeContact = contacts.find(
    (c) => c.id.toString() === selectedContactId.toString()
  );

  const normalize = (t) =>
    t
      ? t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";

  const filteredContacts = contacts.filter(
    (c) =>
      normalize(c.name).includes(normalize(searchTerm)) ||
      normalize(c.relation).includes(normalize(searchTerm))
  );

 
  useEffect(() => {
    if (!activeContact) return;

    getContactFavorites(activeContact.id)
      .then((res) => (res.ok ? res.json() : []))
      .then(setActiveFavorites);

    if (giftsSectionRef.current) {
      setTimeout(() => {
        giftsSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [activeContact, selectedContactId]);


 
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetModal = () => {
    setShowAddModal(false);
    setFormData(initialFormState);
    setEditingContactId(null);
  };

  const handleEditClick = (e, contact) => {
    e.stopPropagation();
    setEditingContactId(contact.id);
    setFormData({
      name: contact.name || "",
      relation: contact.relation || "",
      birth_date: contact.birth_date || "",
      gender: contact.gender || "",
      hobbies: contact.hobbies || "",
      ocupacion: contact.ocupacion || "",
      tipo_personalidad: contact.tipo_personalidad || "",
      url_img: contact.img || "",
    });
    setShowAddModal(true);
  };

  const handleSaveContact = async () => {
    if (!formData.name) return alert("El nombre es obligatorio");

    try {
      const res = editingContactId
        ? await updateContact(editingContactId, formData)
        : await createContact(formData);

      if (!res.ok) throw new Error();

      const saved = await res.json();
      setContacts((prev) =>
        editingContactId
          ? prev.map((c) => (c.id === editingContactId ? saved : c))
          : [...prev, saved]
      );

      resetModal();
    } catch {
      alert("Error al guardar contacto");
    }
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contacto/${contactToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setContacts((prev) =>
          prev.filter((c) => c.id !== contactToDelete.id)
        );
        if (selectedContactId === contactToDelete.id.toString()) {
          setSelectedContactId("");
        }
      }
    } catch (e) {
      console.error(e);
    }

    setShowDeleteModal(false);
    setContactToDelete(null);
    setDeleteConfirmed(false);
  };

  const handleDeleteFav = async (favId) => {
    const res = await deleteFavorite(favId);
    if (res.ok) {
      setActiveFavorites((prev) =>
        prev.filter((f) => f.favorite_id !== favId)
      );
    }
  };

  if (loading) return <div className="text-center p-5">Cargando...</div>;

 

  return (
    <div className={`${styles["dashboard-wrapper"]} container-fluid p-0`}>
      <div className="row g-0">
        {/* SIDEBAR */}
        <aside className={`col-md-3 col-lg-2 ${styles["sidebar-wrapper"]}`}>
          <div className={`${styles["sidebar-custom"]} d-flex flex-column`}>
            <nav className="flex-grow-1">
              <a href="#contactos" className={styles["sidebar-link"]}>
                Contactos
              </a>

              <div
                className={styles["sidebar-link"]}
                onClick={() => navigate("/generar-ideas/user")}
                style={{ cursor: "pointer" }}
              >
                Generar ideas para mí
              </div>

              <a href="#recordatorios" className={styles["sidebar-link"]}>
                Recordatorios
              </a>

              <div className="mt-4">
                <label className="text-white mb-2 small">
                  Regalos guardados
                </label>
                <select
                  className={`form-select ${styles["custom-select"]}`}
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                >
                  <option value="">Selecciona contacto...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className={`btn ${styles["btn-ideas"]} mt-3 mx-auto`}
                onClick={() => navigate("/profile/edit")}
              >
                Editar Perfil
              </button>

              <button
                className={`btn ${styles["btn-ideas"]} mt-5 mx-auto`}
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </aside>

       
        <main className="col-md-9 col-lg-10 p-4 p-md-5">
          
          <div
            id="contactos"
            className="d-flex justify-content-between align-items-center mb-4 pt-3"
          >
            <div className="d-flex align-items-center">
              <h2 className={`${styles["section-title"]} mb-0 me-3`}>
                CONTACTOS
              </h2>
              <button
                className={styles["btn-add-contact"]}
                onClick={() => setShowAddModal(true)}
              >
                +
              </button>
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
            {filteredContacts.map((c) => (
              <div key={c.id} className="col-12 col-sm-6 col-lg-4">
                <div
                  className={`card ${styles["contact-card"]} h-100 text-center p-3`}
                  onClick={() => setSelectedContactId(c.id.toString())}
                >
                  <button
                    className={styles["btn-edit-contact"]}
                    onClick={(e) => handleEditClick(e, c)}
                  >
                    ✎
                  </button>

                  <button
                    className={styles["btn-delete-contact"]}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContactToDelete(c);
                      setShowDeleteModal(true);
                    }}
                  >
                    X
                  </button>

                  <div className="card-body d-flex flex-column align-items-center">
                    <img
                      src={c.img || "https://i.pravatar.cc/150"}
                      className={`${styles["contact-img"]} mb-3`}
                      alt={c.name}
                    />
                    <h5 className="fw-bold">{c.name}</h5>
                    <small className="text-muted mb-2">{c.relation}</small>

                    <button
                      className={`btn ${styles["btn-ideas"]} mt-auto`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/generar-ideas/${c.id}`);
                      }}
                    >
                      Generar ideas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
          <RemindersCarousel
            reminders={reminders}
            contacts={contacts}
            userReminders={userReminders}
            onCreateReminder={async (data) => {
              const res = await createReminder(data);
              if (res.ok) {
                const saved = await res.json();
                setUserReminders((prev) => [...prev, saved]);
              }
            }}
            onDeleteReminder={async (id) => {
              const res = await deleteReminder(id);
              if (res.ok) {
                setUserReminders((prev) =>
                  prev.filter((r) => r.id !== id)
                );
              }
            }}
          />

          
          {activeContact && (
            <div
              ref={giftsSectionRef}
              className={`${styles["saved-gifts-section"]} shadow`}
            >
              <button
                className={styles["btn-close-gifts"]}
                onClick={() => setSelectedContactId("")}
              >
                X
              </button>

              <div className={styles["saved-gifts-inner"]}>
                <h4 className="fw-bold mb-3">
                  Favoritos de {activeContact.name}
                </h4>

                <div className="row g-3">
                  {activeFavorites.map((g) => (
                    <div
                      key={g.favorite_id}
                      className="col-12 col-sm-6 col-lg-3"
                    >
                      <div className={`${styles["gift-item-card"]} h-100`}>
                        <button
                          className={styles["btn-delete-gift"]}
                          onClick={() =>
                            handleDeleteFav(g.favorite_id)
                          }
                        >
                          X
                        </button>
                        <img
                          src={g.img}
                          className={styles["gift-img"]}
                          alt=""
                        />
                        <div className="p-3">
                          <h6>{g.name}</h6>
                          <p className="fw-bold">{g.price}</p>
                          <a
                            href={g.link}
                            target="_blank"
                            rel="noreferrer"
                            className={`btn ${styles["btn-buy"]}`}
                          >
                            Comprar
                          </a>
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

      
    </div>
  );
};

export default Dashboard;
