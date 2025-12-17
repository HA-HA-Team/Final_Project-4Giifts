from threading import Thread
from flask import current_app
from flask_mail import Message
from api.extensions import mail


def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)


def send_recovery_email(first_name, email, reset_link):
    msg = Message(
        subject="Recuperación de contraseña 4Giifts",
        recipients=[email],
    )

    msg.body = (
        f"Hola {first_name},\n\n"
        "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en 4Giifts.\n"
        "Entendemos que con tantas fechas y regalos en la cabeza, una contraseña se puede olvidar.\n\n"


        "Para crear una nueva, haz clic en el siguiente enlace:\n"
        f"{reset_link}\n\n"
        "Este enlace expira en 15 minutos."
    )

    Thread(
        target=send_async_email,
        args=(current_app._get_current_object(), msg)
    ).start()
