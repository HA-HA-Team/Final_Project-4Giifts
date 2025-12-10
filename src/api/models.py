from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, ForeignKey
from flask_bcrypt import Bcrypt
from datetime import datetime, timezone

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = "user"

    user_id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)

    profile_pic: Mapped[str] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str] = mapped_column(String(80), nullable=True)
    last_name: Mapped[str] = mapped_column(String(80), nullable=True)
    birth_date: Mapped[str] = mapped_column(String(10), nullable=True) 
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    hobbies: Mapped[str] = mapped_column(String(999), nullable=True)
    ocupacion: Mapped[str] = mapped_column(String(120), nullable=True)
    tipo_personalidad: Mapped[str] = mapped_column(String(120), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    contactos = db.relationship(
        "Contactos",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    compras = db.relationship(
        "ComprasRealizadas",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    favoritos = db.relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    productos = db.relationship(
        "Producto",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.email}>"
# kwargs recibe todos los argumentos del endpoint- asi si añadimos algo mas no hay que modificar el metodo de clase

    @classmethod
    def create_new_user(self, **kwargs):
        raw_password = kwargs.get("password")
        kwargs["password"] = bcrypt.generate_password_hash(
            raw_password).decode("utf-8")
        kwargs["email"] = kwargs.get("email", "").strip().lower()
        user = self(**kwargs)
        db.session.add(user)
        db.session.commit()
        return user

    @classmethod
    def find_by_email(self, email):
        email = email.strip().lower()
        return db.session.execute(
            db.select(self).where(self.email == email)
        ).scalar_one_or_none()

    def check_psw(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "profile_pic": self.profile_pic,
            "birth_date": self.birth_date,
            "hobbies": self.hobbies,
            "gender":self.gender,
            "ocupacion": self.ocupacion,
            "tipo_personalidad": self.tipo_personalidad
        }


class Contactos(db.Model):
    __tablename__ = "contactos"

    contactos_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.user_id"), nullable=False)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    relation: Mapped[str] = mapped_column(String(20), nullable=True)
    birth_date: Mapped[str] = mapped_column(String(10), nullable=True)
    hobbies: Mapped[str] = mapped_column(String(999), nullable=True)
    url_img: Mapped[str] = mapped_column(String(899), nullable=True)
    ocupacion: Mapped[str] = mapped_column(String(120), nullable=True)
    tipo_personalidad: Mapped[str] = mapped_column(String(120), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship("User", back_populates="contactos")
    favoritos = db.relationship(
        "Favorite",
        back_populates="contacto",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Contacto {self.name}>"


class ComprasRealizadas(db.Model):
    __tablename__ = "compras_realizadas"

    compras_realizadas_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.user_id"), nullable=False)

    articulos: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship("User", back_populates="compras")

    def __repr__(self):
        return f"<Compra {self.compras_realizadas_id}>"


class Producto(db.Model):
    __tablename__ = "producto"

    item_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.user_id"), nullable=False)

    item_url: Mapped[str] = mapped_column(String(255), nullable=False)
    img_url: Mapped[str] = mapped_column(String(255), nullable=True)

    user = db.relationship("User", back_populates="productos")
    favorito = db.relationship(
        "Favorite",
        back_populates="producto",
        uselist=False
    )

    def __repr__(self):
        return f"<Producto {self.item_id}>"


class Favorite(db.Model):
    __tablename__ = "favorite"

    favorite_id: Mapped[int] = mapped_column(primary_key=True)

    contact_id: Mapped[int] = mapped_column(
        ForeignKey("contactos.contactos_id"), nullable=False)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.user_id"), nullable=False)
    regalo_guardado: Mapped[int] = mapped_column(
        ForeignKey("producto.item_id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship("User", back_populates="favoritos")
    contacto = db.relationship("Contactos", back_populates="favoritos")
    producto = db.relationship(
        "Producto", back_populates="favorito", uselist=False)

    def __repr__(self):
        return f"<Favorite {self.favorite_id}>"
    


# almacenar la url de imagen para evitar consultas repetidas a api google search
class ImagenProducto(db.Model):
    __tablename__ = "imagen_producto"

    id: Mapped[int] = mapped_column(primary_key=True)
    termino_busqueda: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    img_url: Mapped[str] = mapped_column(String(500), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "termino_busqueda": self.termino_busqueda,
            "img_url": self.img_url,
            "updated_at": self.updated_at
        }

    
    def __repr__(self):
        return f"<Imagen {self.termino_busqueda}>"
