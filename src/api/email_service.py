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

    # Versión HTML
    msg.html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <p>Hola {first_name}:</p>

        <p>
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en
            <b>4Giifts</b>.
        </p>

        <p>
            Entendemos que con tantas fechas y regalos en la cabeza,
            una contraseña se puede olvidar.
        </p>

        <p>
            Para crear una nueva, simplemente haz clic en el siguiente botón:
        </p>

        <p style="text-align: center; margin: 24px 0;">
            <a href="{reset_link}"
               style="
                   background-color: #4CAF50;
                   color: white;
                   padding: 12px 24px;
                   text-decoration: none;
                   border-radius: 5px;
                   font-weight: bold;
                   display: inline-block;
               ">
                Restablecer contraseña
            </a>
        </p>

        <p>
            <small>Este enlace expira en 15 minutos.</small>
        </p>

        <p>
            <small>
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                {reset_link}
            </small>
        </p>
    </body>
    </html>
    """

    # Versión texto plano (muy recomendable)
    msg.body = (
        f"Hola {first_name},\n\n"
        "Has solicitado restablecer tu contraseña en 4Giifts.\n\n"
        f"Enlace: {reset_link}\n\n"
        "Este enlace expira en 15 minutos."
    )

    Thread(
        target=send_async_email,
        args=(current_app._get_current_object(), msg)
    ).start()
