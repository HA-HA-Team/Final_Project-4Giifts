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
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    profile_pic: Mapped[str] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str] = mapped_column(String(80), nullable=True)
    last_name: Mapped[str] = mapped_column(String(80), nullable=True)
    birth_date: Mapped[str] = mapped_column(String(10), nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    hobbies: Mapped[str] = mapped_column(String(999), nullable=True)
    ocupacion: Mapped[str] = mapped_column(String(120), nullable=True)
    tipo_personalidad: Mapped[str] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    contactos = db.relationship("Contactos", back_populates="user", cascade="all, delete-orphan")
    favoritos = db.relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    historial = db.relationship("Historial", back_populates="user", cascade="all, delete-orphan")
    reminders = db.relationship("Reminder", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"

    @classmethod
    def create_new_user(self, **kwargs):
        raw_password = kwargs.get("password")
        kwargs["password"] = bcrypt.generate_password_hash(raw_password).decode("utf-8")
        kwargs["email"] = kwargs.get("email", "").strip().lower()
        user = self(**kwargs)
        db.session.add(user)
        db.session.commit()
        return user

    @classmethod
    def find_by_email(self, email):
        email = email.strip().lower()
        return db.session.execute(db.select(self).where(self.email == email)).scalar_one_or_none()

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
            "gender": self.gender,
            "ocupacion": self.ocupacion,
            "tipo_personalidad": self.tipo_personalidad
        }


class Contactos(db.Model):
    __tablename__ = "contactos"
    contactos_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    relation: Mapped[str] = mapped_column(String(20), nullable=True)
    birth_date: Mapped[str] = mapped_column(String(10), nullable=True)
    hobbies: Mapped[str] = mapped_column(String(999), nullable=True)
    url_img: Mapped[str] = mapped_column(String(899), nullable=True)
    ocupacion: Mapped[str] = mapped_column(String(120), nullable=True)
    tipo_personalidad: Mapped[str] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="contactos")
    favoritos = db.relationship("Favorite", back_populates="contacto", cascade="all, delete-orphan")
    historial = db.relationship("Historial", back_populates="contacto", cascade="all, delete-orphan")
    reminders = db.relationship("Reminder", back_populates="contacto", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Contacto {self.name}>"


class Producto(db.Model):
    __tablename__ = "producto"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    termino_busqueda: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    link_compra: Mapped[str] = mapped_column(String(899), nullable=True)
    img_url: Mapped[str] = mapped_column(String(899), nullable=True)
    descripcion: Mapped[str] = mapped_column(String(999), nullable=True)
    precio: Mapped[str] = mapped_column(String(50), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    favoritos = db.relationship("Favorite", back_populates="producto", cascade="all, delete-orphan")
    historial = db.relationship("Historial", back_populates="producto", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "link": self.link_compra,
            "img": self.img_url,
            "precio": self.precio,
            "descripcion": self.descripcion
        }
    
class Historial(db.Model):
    __tablename__ = "historial"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=False)
    contact_id: Mapped[int] = mapped_column(ForeignKey("contactos.contactos_id"), nullable=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("producto.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="historial")
    contacto = db.relationship("Contactos", back_populates="historial")
    producto = db.relationship("Producto", back_populates="historial")

    def to_dict(self):
        return {
            "id": self.id,
            "producto": self.producto.to_dict(),
            "date": self.created_at
        }

class Favorite(db.Model):
    __tablename__ = "favorite"
    favorite_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"), nullable=False)
    contact_id: Mapped[int] = mapped_column(ForeignKey("contactos.contactos_id"), nullable=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("producto.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="favoritos")
    contacto = db.relationship("Contactos", back_populates="favoritos")
    producto = db.relationship("Producto", back_populates="favoritos")

    def to_dict(self):
        return {
            "id": self.favorite_id,
            "contact_id": self.contact_id,
            "producto": self.producto.to_dict()
        }

class Reminder(db.Model):
    __tablename__ = "reminder"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.user_id"), nullable=False)
    contact_id: Mapped[int] = mapped_column(
        ForeignKey("contactos.contactos_id"), nullable=True)

    title: Mapped[str] = mapped_column(String(120), nullable=False)
    reminder_date: Mapped[str] = mapped_column(String(10), nullable=False)
    notify_days_before: Mapped[int] = mapped_column(Integer, default=30)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship("User", back_populates="reminders")
    contacto = db.relationship("Contactos", back_populates="reminders")

    def to_dict(self):
        return {
            "id": self.id,
            "contact_id": self.contact_id,
            "title": self.title,
            "reminder_date": self.reminder_date
        }
