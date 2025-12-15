import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './favorites.module.css';
import { getSharedFavorites } from '../services';

export const SharedFavorites = () => {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        getSharedFavorites(token).then(async res => {
            if (res.ok) setData(await res.json());
            else setError(true);
        });
    }, [token]);

    if (error) return <div className="text-center p-5"><h2>Enlace expirado o inválido</h2></div>;
    if (!data) return <div className="text-center p-5">Cargando...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <img
                    src={data.user_img || `https://api.dicebear.com/9.x/avataaars/svg?seed=${data.user_name}`}
                    className={styles.profileImg}
                    onError={(e) => e.target.src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${data.user_name}`}
                    alt=""
                />
                <h2 className={styles.userName}>Favoritos de {data.user_name}</h2>
            </div>
            <div className="container">
                <div className="row g-4 justify-content-center">
                    {data.products.map((prod, i) => (
                        <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div className={styles.card}>
                                <img src={prod.img} className={styles.giftImg} onError={(e) => e.target.src = "https://via.placeholder.com/300"} alt="" />
                                <div className="p-3 d-flex flex-column flex-grow-1">
                                    <h6 className="fw-bold">{prod.name}</h6>
                                    <p className="small text-muted">{prod.description}</p>
                                    <p className="text-muted fw-bold">{prod.price}</p>
                                    <a href={prod.link} target="_blank" rel="noreferrer" className={styles.btnBuy}>Ver producto</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};