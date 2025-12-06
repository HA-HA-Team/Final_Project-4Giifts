"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""

import os
""" import google.generativeai as genai
import requests """
import json
from api.models import Contactos
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


# endpoint peticion de contactos del user
@api.route('/contacts', methods=['GET'])
@jwt_required()
def get_user_contacts():
    current_user_id = int(get_jwt_identity())
    
    user_contacts = db.session.execute(
        db.select(Contactos).where(Contactos.user_id == current_user_id)
    ).scalars().all()

    result = []
    for contact in user_contacts:
        result.append({
            "id": contact.contactos_id,  
            "name": contact.name,
            "relation": contact.relation,
            "img": contact.url_img,
            "birth_date": contact.birth_date,
            "hobbies": contact.hobbies,
            "personality": contact.tipo_personalidad
        })

    return jsonify(result), 200



#  LÓGICA IA + OBTENER UN CONTACTO

# Función para buscar imágenes en Google (Backend)
def get_google_image(query):
    api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
    cx = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
    
    if not api_key or not cx:
        return "https://via.placeholder.com/400x300?text=Configura+API+Keys"

    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "cx": cx,
        "key": api_key,
        "searchType": "image",
        "num": 1, 
        "imgSize": "medium", 
        "safe": "active"
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()
        if "items" in data and len(data["items"]) > 0:
            return data["items"][0]["link"]
    except Exception as e:
        print(f"Error buscando imagen: {e}")
    
    return "https://via.placeholder.com/400x300?text=Imagen+No+Disponible"


# Endpoint para obtener UN contacto específico para rellenar el formulario
@api.route('/contacto/<int:contact_id>', methods=['GET'])
@jwt_required()
def get_single_contact(contact_id):
    current_user_id = int(get_jwt_identity())
    
    contacto = db.session.execute(
        db.select(Contactos).where(Contactos.contactos_id == contact_id, Contactos.user_id == current_user_id)
    ).scalar_one_or_none()

    if not contacto:
        return jsonify({"msg": "Contacto no encontrado"}), 404

    return jsonify({
        "name": contacto.name,
        "birth_date": contacto.birth_date,
        "gender": contacto.gender,
        "hobbies": contacto.hobbies,
        "ocupacion": contacto.ocupacion,
        "tipo_personalidad": contacto.tipo_personalidad,
        "relation": contacto.relation,  
        "imagen": contacto.url_img       
    }), 200


# 3. Endpoint para generar Regalos con IA (Gemini)
@api.route('/generate_gift_ideas', methods=['POST'])
@jwt_required()
def generate_gift_ideas():
    data = request.get_json()
    
    api_key_gemini = os.getenv("GOOGLE_API_KEY")
    if not api_key_gemini:
        return jsonify({"msg": "Falta API Key de Google"}), 500

    genai.configure(api_key=api_key_gemini)
    model = genai.GenerativeModel('gemini-1.5-flash') 

    perfil = data.get('perfil', {})
    evitar = data.get('evitar', '')
    presupuesto = data.get('presupuesto', '')
    
    prompt = f"""
    Actúa como un experto en regalos. Genera 6 ideas de regalos ÚNICAS para:
    - Edad: {perfil.get('edad')}
    - Género: {perfil.get('sexo')}
    - Hobbies: {perfil.get('hobbies')}
    - Ocupación: {perfil.get('ocupacion')}
    - Ocasión: {perfil.get('ocasion')}
    - Relación: {perfil.get('parentesco')}
    - Personalidad: {perfil.get('personalidad')}
    - Presupuesto: {presupuesto}
    
    EVITAR: {evitar}
    
    Responde SOLO con un JSON válido (lista de objetos). Sin markdown.
    Claves obligatorias por objeto:
    "nombre_regalo", "descripcion" (max 15 palabras), "precio_estimado", "termino_busqueda" (para buscar la foto).
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        ideas = json.loads(text)
        
        for idea in ideas:
            term = idea['termino_busqueda']
            search_url = term.replace(" ", "+")
            
            idea['link_compra'] = f"https://www.amazon.es/s?k={search_url}&tag=4giifts-21"
            
            idea['imagen'] = get_google_image(f"{term} producto")

        return jsonify(ideas), 200

    except Exception as e:
        print(f"Error IA: {e}")
        return jsonify({"msg": "Error generando ideas"}), 500