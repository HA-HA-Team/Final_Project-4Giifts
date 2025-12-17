from threading import Thread
import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY")


def send_async_email(payload):
    try:
        resend.Emails.send(payload)
        print("EMAIL ENVIADO CON RESEND")
    except Exception as e:
        print("ERROR RESEND:", str(e))


def send_recovery_email(first_name, email, reset_link):
    payload = {
        "from": os.getenv("RESEND_FROM_EMAIL"),
        "to": [email],
        "subject": "Recuperación de contraseña 4Giifts",
        "html": f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <p>Hola {first_name}:</p>

            <p>
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en
                <b>4Giifts</b>.
            </p>

            <p>
                Para crear una nueva, haz clic en el siguiente botón:
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

            <p><small>Este enlace expira en 15 minutos.</small></p>
            <p><small>{reset_link}</small></p>
        </body>
        </html>
        """,
        "text": (
            f"Hola {first_name},\n\n"
            f"Enlace: {reset_link}\n\n"
            "Este enlace expira en 15 minutos."
        ),
    }

    Thread(
        target=send_async_email,
        args=(payload,)
    ).start()
