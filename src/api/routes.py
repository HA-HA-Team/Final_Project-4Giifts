"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from api.models import bcrypt


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

# Actualizado metodo crear usuario correspondiente a dbmodel// cambio edad por fecha nacimiento


@api.route('/signup', methods=['POST'])
def create_user():
    data = request.get_json()

    user = User.create_new_user(
        email=data.get("email"),
        password=data.get("password"),
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        birth_date=data.get("birth_date"),
        hobbies=data.get("hobbies"),
        ocupacion=data.get("ocupacion"),
        tipo_personalidad=data.get("tipo_personalidad")
    )

    return jsonify(user.to_dict()), 201


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    userbyemail = User.find_by_email(data.get("email"))
    print(not userbyemail)
    if not userbyemail:
        return jsonify({
            "error": True,
            "message": "usuario no encontrado"
        }), 400
    if userbyemail.check_psw(data.get("password")):
        access_token = create_access_token(identity=str(userbyemail.user_id))
        return jsonify({
            "user": userbyemail.to_dict(),
            "token": access_token}), 200

    return jsonify({
        "error": True,
        "message": "verifica los datos ingresados"
    }), 400


@api.route('/private', methods=['GET'])
@jwt_required()
def msg_privado():
    user_id = int(get_jwt_identity())

    user = db.session.execute(
        db.select(User).where(User.user_id == user_id)
    ).scalar_one_or_none()

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify({
        "message": "Zona exclusiva PRIVADA",
        "user": user.to_dict()
    }), 200

# Agregado 3/12


@api.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = int(get_jwt_identity())

    # permitir que un usuario vea su propio perfil
    if current_user_id != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify(user.to_dict()), 200


# AGREGADOS 29-30/11


# modificar user
@api.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user = int(get_jwt_identity())
    if current_user != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    data = request.get_json()
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    # campos a cambiar
    fields = [
        "email", "first_name", "last_name", "profile_pic",
        "fecha_nacimiento", "hobbies", "ocupacion", "tipo_personalidad"
    ]

    for field in fields:
        if data.get(field):
            setattr(user, field, data[field])

    # contraseña aparte
    if data.get("password"):
        hashed = bcrypt.generate_password_hash(
            data["password"]).decode("utf-8")
        user.password = hashed

    db.session.commit()

    return jsonify({"msg": "Usuario actualizado", "user": user.to_dict()})


# borrar user
@api.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = int(get_jwt_identity())

    if current_user != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "Cuenta eliminada"}), 200

# get all users endpoint agregado 01/12


@api.route('/users/', methods=['GET'])
def get_all_users():
    users = db.session.execute(db.select(User)).scalars().all()

    result = [user.to_dict() for user in users]

    return jsonify(result), 200

# # recuperacion de contraseña --- > no se exactamente como plantearlo
# @api.route('/recover', methods=['POST'])
# def recover_password():
#     data = request.get_json()
#     email = data.get("email")
#     new_password = data.get("new_password")

#     user = User.find_by_email(email)

#     if not user:
#         return jsonify({"msg": "Usuario no encontrado"}), 404

#     hashed = bcrypt.generate_password_hash(new_password).decode("utf-8")
#     user.password = hashed
#     db.session.commit()

#     return jsonify({"msg": "Contraseña actualizada"}), 200

# @api.route('/recover/request', methods=['POST'])
# def request_recover():
#     data = request.get_json()
#     email = data.get("email")

#     user = User.find_by_email(email)
#     if not user:
#         return jsonify({"msg": "Si el correo existe, recibirá un email"}), 200

#     # generar token temporal
#     token = create_access_token(identity=str(user.user_id), expires_delta=timedelta(minutes=15))

#     reset_link = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"

#     # enviar correo
#     msg = Message(
#         subject="Recuperar contraseña",
#         sender=os.getenv("EMAIL_USER"),
#         recipients=[email]
#     )
#     msg.body = f"Hola, haz clic en este enlace para cambiar tu contraseña:\n{reset_link}"

#     mail.send(msg)

#     return jsonify({"msg": "Correo enviado si el usuario existe"}), 200
