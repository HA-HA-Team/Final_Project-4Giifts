import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './favorites.module.css';
import { getPrivateData, getUserFavorites, deleteFavorite, generateShareLink } from '../services';

export const MyFavorites = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: '', img: '' });
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shareLink, setShareLink] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const uRes = await getPrivateData();
                if (uRes.ok) {
                    const uData = await uRes.json();
                    setUser({
                        name: uData.user.first_name,
                        img: uData.user.profile_pic
                    });
                }
                const fRes = await getUserFavorites();
                if (fRes.ok) setFavorites(await fRes.json());
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleDelete = async (favId) => {
        const res = await deleteFavorite(favId);
        if (res.ok) setFavorites(favorites.filter(f => f.favorite_id !== favId));
    };

    const handleShare = async () => {
        const res = await generateShareLink();
        if (res.ok) {
            const data = await res.json();
            setShareLink(data.link);
            navigator.clipboard.writeText(data.link);
            alert("Enlace copiado al portapapeles (válido 5 días)");
        }
    };

    if (loading) return <div className="text-center p-5">Cargando...</div>;

    return (
        <div className={styles.container}>
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate('/dashboard')}>&larr; Volver</button>
            <div className={styles.header}>
                <img
                    src={user.img || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                    className={styles.profileImg}
                    onError={(e) => e.target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                    alt=""
                />
                <h2 className={styles.userName}>{user.name}</h2>
                <h4 className="text-muted">Mis Favoritos Guardados</h4>
                <button className={`btn mt-3 ${styles.btnShare}`} onClick={handleShare}>Compartir lista con amigos 🔗</button>
                {shareLink && <p className="small text-muted mt-2">Link generado: {shareLink}</p>}
            </div>

            <div className="row g-4">
                {favorites.map(fav => (
                    <div key={fav.favorite_id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div className={styles.card}>
                            <button className={styles.btnDelete} onClick={() => handleDelete(fav.favorite_id)}>X</button>
                            <img src={fav.img} className={styles.giftImg} onError={(e) => e.target.src = "https://via.placeholder.com/300"} alt="" />
                            <div className="p-3 d-flex flex-column flex-grow-1">
                                <h6 className="fw-bold">{fav.name}</h6>
                                <p className="text-muted fw-bold">{fav.price}</p>
                                <a href={fav.link} target="_blank" rel="noreferrer" className={styles.btnBuy}>Comprar</a>
                            </div>
                        </div>
                    </div>
                ))}
                {favorites.length === 0 && <p className="text-center w-100">Aún no has guardado favoritos para ti mismo.</p>}
            </div>
        </div>
    );
};