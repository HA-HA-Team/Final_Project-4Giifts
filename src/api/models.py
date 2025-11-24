from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt=Bcrypt()

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    @classmethod
    def create_new_user(self, email,password, is_active=True):
        hashed_psw= bcrypt.generate_password_hash(password).decode("utf-8")
        user=self(email=email, password=hashed_psw, is_active=is_active)

        db.session.add(user)
        db.session.commit()
        return user
    
    @classmethod
    def find_by_email(self, email):
        return db.session.execute(db.select(self).where(self.email==email)).scalar_one_or_none()

    def check_psw(self, password):
        if bcrypt.check_password_hash(self.password, password):
            return True
        return False

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }