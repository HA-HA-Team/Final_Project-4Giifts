import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./giftideas.module.css";
import { getPrivateData } from "../services";

export const GiftIdeas = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "", edad: "", sexo: "", hobbies: "", ocupacion: "",
    ocasion: "", parentesco: "", personalidad: "",
    presupuesto: "", evitar: "", observaciones: ""
  });

  const [contactImg, setContactImg] = useState("https://i.pravatar.cc/300");
  const [loadingData, setLoadingData] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [giftIdeas, setGiftIdeas] = useState([]);

  const emptyStyle = { backgroundColor: 'var(--color-beige)' };
  const filledStyle = { backgroundColor: 'white' };

  const calculateAge = (d) => {
    if (!d) return "";
    const today = new Date();
    const birth = new Date(d);
    if (isNaN(birth.getTime())) return "";
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age.toString();
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      try {
        let data = null;
        if (contactId === "user") {
          const resp = await getPrivateData();
          if (resp.ok) {
            const json = await resp.json();
            const user = json.user;
            data = {
              name: user.first_name || "Mí mismo",
              birth_date: user.birth_date,
              gender: user.gender,
              hobbies: user.hobbies,
              ocupacion: user.ocupacion,
              tipo_personalidad: user.tipo_personalidad,
              relation: "Yo mismo",
              imagen: user.profile_pic
            };
          }
        } else {
          const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contacto/${contactId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resp.ok) data = await resp.json();
        }

        if (data) {
          if (data.imagen) setContactImg(data.imagen);
          setFormData(prev => ({
            ...prev,
            nombre: data.name || "",
            edad: data.birth_date ? calculateAge(data.birth_date) : "",
            sexo: data.gender || "",
            hobbies: data.hobbies || "",
            ocupacion: data.ocupacion || "",
            personalidad: data.tipo_personalidad || "",
            parentesco: data.relation || ""
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    };
    loadProfile();
  }, [contactId, navigate]);

  const handleGenerate = async () => {
    setGenerating(true);
    const token = sessionStorage.getItem("token");
    const currentNames = giftIdeas.map(i => i.nombre_regalo);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/generate_gift_ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, historial: currentNames })
      });
      const response = await res.json();
      if (res.ok) {
        setGiftIdeas(response);
        setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: 'smooth' }), 200);
      } else {
        alert("Error generando regalos " + response.msg);
      }
    } catch (e) {
      alert("Error de conexión " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loadingData) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={`container my-5 ${styles.pageContainer}`}>
        <div className="d-flex justify-content-between mb-4">
          <h1 className={styles.pageTitle}>
            🎁 Ideas para <span className={styles.nameHighlight}>{formData.nombre}</span>
          </h1>
          <button onClick={() => navigate("/dashboard")} className={`btn mb-5 ${styles.secondaryBtn}`}>Volver</button>
        </div>

        <div className={`card ${styles.mainCard} p-4`}>
          <div className="row">
            <div className="col-md-4 d-flex flex-column align-items-center mb-4">
              <div className={styles.imageContainer}>
                <img
                  src={contactImg}
                  className={styles.profileImage}
                  onError={(e) => e.target.src = "https://i.pravatar.cc/300"}
                  alt="perfil"
                />
              </div>
              <h3 className="mt-3 fw-bold">{formData.nombre}</h3>
            </div>

            <div className="col-md-8">
              <h4 className={styles.subsectionTitle}>Datos básicos</h4>
              <div className="row">
                <div className="col-6 mb-3">
                  <label className={styles.label}>Edad</label>
                  <input name="edad" className={`form-control ${styles.inputCustom}`} value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                    placeholder="Ej: 25" style={!formData.edad ? emptyStyle : filledStyle} />
                </div>
                <div className="col-6 mb-3">
                  <label className={styles.label}>Sexo</label>
                  <input name="sexo" className={`form-control ${styles.inputCustom}`} value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    placeholder="Masculino/Femenino/Otro" style={!formData.sexo ? emptyStyle : filledStyle} />
                </div>
              </div>

              <h4 className={styles.subsectionTitle}>Intereses y ocupación</h4>
              <div className="mb-3">
                <label className={styles.label}>Ocasión*</label>
                <input list="occasions" name="ocasion*" className={`form-control ${styles.inputCustom}`}
                  value={formData.ocasion}
                  onChange={(e) => setFormData({ ...formData, ocasion: e.target.value })}
                  placeholder="Escribe o selecciona..." style={!formData.ocasion ? emptyStyle : filledStyle} required/>
                <datalist id="occasions">
                  <option value="Cumpleaños" /><option value="Navidad" />
                  <option value="San Valentín" /><option value="Aniversario" />
                </datalist>
              </div>

              <div className="mb-3">
                <label className={styles.label}>Hobbies y Gustos Personales*</label>
                <input name="hobbies*" className={`form-control ${styles.inputCustom}`}
                  value={formData.hobbies} onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  placeholder="Ej: Tenis, Videojuegos, Lectura..." style={!formData.hobbies ? emptyStyle : filledStyle} required />
              </div>

              <div className="mb-3">
                <label className={styles.label}>Ocupación</label>
                <input name="ocupacion" className={`form-control ${styles.inputCustom}`}
                  value={formData.ocupacion} onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                  placeholder="Ej: Arquitecto, Estudiante..." style={!formData.ocupacion ? emptyStyle : filledStyle} />
              </div>

              <h4 className={styles.subsectionTitle}>Detalles personales</h4>
              <div className="mb-3">
                <label className={styles.label}>Parentesco</label>
                <input name="parentesco" className={`form-control ${styles.inputCustom}`}
                  value={formData.parentesco} onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                  placeholder="Ej: Amiga, Padre, Primo..." style={!formData.parentesco ? emptyStyle : filledStyle} />
              </div>

              <div className="mb-3">
                <label className={styles.label}>Personalidad</label>
                <input name="personalidad" className={`form-control ${styles.inputCustom}`}
                  value={formData.personalidad} onChange={(e) => setFormData({ ...formData, personalidad: e.target.value })}
                  placeholder="Ej: Extrovertido, Friki, Serio..." style={!formData.personalidad ? emptyStyle : filledStyle} />
              </div>

              <div className="mb-3">
                <label className={styles.label}>Presupuesto*</label>
                <input name="presupuesto*" className={`form-control ${styles.inputCustom}`}
                  value={formData.presupuesto} onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                  placeholder="Ej: 50-100 €" style={!formData.presupuesto ? emptyStyle : filledStyle} required/>
              </div>

              <div className="mb-3">
                <label className={styles.label}>LO QUE NO QUIERO...</label>
                <textarea name="evitar" className={`form-control ${styles.inputCustom} ${styles.textAreaBig}`}
                  value={formData.evitar} onChange={(e) => setFormData({ ...formData, evitar: e.target.value })}
                  placeholder="Ej: Nada de ropa, ni tazas..." style={!formData.evitar ? emptyStyle : filledStyle} />
              </div>

              <div className="mb-3">
                <label className={styles.label}>¿Algo más que añadir?</label>
                <textarea name="observaciones" className={`form-control ${styles.inputCustom}`} rows="2"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Ej: Le encantan los gadgets japoneses..." style={!formData.observaciones ? emptyStyle : filledStyle} />
              </div>

              <button className={`btn w-100 py-3 ${styles.generateBtn}`} onClick={handleGenerate} disabled={generating}>
                {generating ? <span><i className="fas fa-spinner fa-spin me-2"></i> Pensando...</span> : "Generar lista de regalos"}
              </button>
            </div>
          </div>
        </div>

        <div id="results"></div>

        {giftIdeas.length > 0 && (
          <div className="text-center mt-5">
            <hr className={styles.divider} />
            <button className={`btn mb-5 ${styles.secondaryBtn}`} onClick={handleGenerate} disabled={generating}>
              {generating ? <span><i className="fas fa-spinner fa-spin me-2"></i> Pensando...</span> : "Generar otras 6 ideas"}
            </button>


            <div className="row justify-content-center g-4"> 
              {giftIdeas.map((idea, i) => (
                
                <div key={i} className="col-md-4 d-flex">
                  <article className={styles.ideaCard}>
                    <div className={styles.cardImgContainer}>
                      <img src={idea.imagen} alt={idea.nombre_regalo}
                        className={styles.cardImg}
                        onError={(e) => e.target.src = "https://via.placeholder.com/400"} />
                    </div>
                    <h5 className={styles.cardTitle}>{idea.nombre_regalo}</h5>
                    <p className="small text-muted flex-grow-1">{idea.descripcion}</p>
                    <p className={styles.price}>Precio estimado {idea.precio_estimado}</p>
                    <a href={idea.link_compra} target="_blank" rel="noreferrer" className={styles.buyBtn}>
                      Ver en Amazon
                    </a>
                  </article>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};