function Card ({imageUrl, title, description, button}) {
    return (
        <div className="card pers-shadow p-0 rounded-3" style={{width: "18rem"}}>
            <div className="ratio ratio-16x9">
                <img src={imageUrl} className="object-fit-cover" alt="..."/>
            </div>
            <div className="card-body d-flex justify-content-between flex-column">
                <div>
                    <h5 className="card-title">{title}</h5>
                <p className="card-text flex-grow-1">{description}</p>
                </div>
                <div className="mt-5">
                    <a href="#" className="btn btn-primary d-flex justify-content-center pers-primary-btn-color border-0">{button}</a>
                </div>
            </div>
        </div>
    );
}

export default Card; 