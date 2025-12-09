import os
import json
import requests
import google.generativeai as genai
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from datetime import datetime, timezone
from api.models import db, User, Contactos, ImagenProducto, bcrypt

api = Blueprint('api', __name__)
CORS(api)

# --- CONSTANTES ---
FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop"

# --- UTILS (DB CACHÉ + SEARCH) ---

def get_image_from_db(term):
    try:
        clean_term = term.lower().strip()
        cached = db.session.execute(
            db.select(ImagenProducto).where(ImagenProducto.termino_busqueda == clean_term)
        ).scalar_one_or_none()
        if cached: return cached.img_url
    except Exception:
        pass
    return None

def save_image_to_db(term, url):
    try:
        clean_term = term.lower().strip()
        existing = db.session.execute(
            db.select(ImagenProducto).where(ImagenProducto.termino_busqueda == clean_term)
        ).scalar_one_or_none()
        
        if not existing:
            new_entry = ImagenProducto(termino_busqueda=clean_term, img_url=url)
            db.session.add(new_entry)
            db.session.commit()
    except Exception:
        db.session.rollback()

def google_search_api(query, search_type=None):
    # Check DB Cache (para evitar consultas API)
    db_img = get_image_from_db(query)
    if db_img: return db_img

    # Google Search API
    api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
    cx = os.getenv("GOOGLE_SEARCH_ENGINE_ID")

    if not api_key or not cx: return None

    url = "https://www.googleapis.com/customsearch/v1"
    params = { "q": query, "cx": cx, "key": api_key, "num": 1, "safe": "active" }
    
    if search_type == "image":
        params["searchType"] = "image"
        params["imgSize"] = "medium"

    try:
        response = requests.get(url, params=params, timeout=3)
        data = response.json()
        if "items" in data and len(data["items"]) > 0:
            found_url = data["items"][0]["link"]
            # 3. Save to DB Cache
            save_image_to_db(query, found_url)
            return found_url
    except Exception:
        pass
    return None

# --- USER ENDPOINTS ---

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    return jsonify({"message": "Backend online"}), 200

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
        tipo_personalidad=data.get("tipo_personalidad"),
        gender=data.get("gender"),
        profile_pic=data.get("profile_pic")
    )
    return jsonify(user.to_dict()), 201

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.find_by_email(data.get("email"))
    if not user: return jsonify({"message": "Usuario no encontrado"}), 400
    if user.check_psw(data.get("password")):
        token = create_access_token(identity=str(user.user_id))
        return jsonify({"user": user.to_dict(), "token": token}), 200
    return jsonify({"message": "Datos incorrectos"}), 400

@api.route('/private', methods=['GET'])
@jwt_required()
def msg_privado():
    user_id = int(get_jwt_identity())
    user = db.session.execute(db.select(User).where(User.user_id == user_id)).scalar_one_or_none()
    if not user: return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify({"user": user.to_dict()}), 200

@api.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id: return jsonify({"msg": "No autorizado"}), 403
    user = db.session.get(User, user_id)
    return jsonify(user.to_dict()), 200

@api.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user = int(get_jwt_identity())
    if current_user != user_id: return jsonify({"msg": "No autorizado"}), 403
    data = request.get_json()
    user = db.session.get(User, user_id)
    fields = ["email", "first_name", "last_name", "profile_pic", "birth_date", "hobbies", "ocupacion", "tipo_personalidad"]
    for field in fields:
        if data.get(field): setattr(user, field, data[field])
    if data.get("password"):
        user.password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    db.session.commit()
    return jsonify({"msg": "Usuario actualizado", "user": user.to_dict()})

@api.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = int(get_jwt_identity())
    if current_user != user_id: return jsonify({"msg": "No autorizado"}), 403
    user = db.session.get(User, user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Cuenta eliminada"}), 200

@api.route('/users/', methods=['GET'])
def get_all_users():
    users = db.session.execute(db.select(User)).scalars().all()
    return jsonify([user.to_dict() for user in users]), 200

# --- CONTACTS ENDPOINTS ---

@api.route('/contacts', methods=['GET'])
@jwt_required()
def get_user_contacts():
    current_user_id = int(get_jwt_identity())
    contacts = db.session.execute(db.select(Contactos).where(Contactos.user_id == current_user_id)).scalars().all()
    result = []
    for c in contacts:
        result.append({
            "id": c.contactos_id,
            "name": c.name,
            "relation": c.relation,
            "img": c.url_img,
            "birth_date": c.birth_date,
            "hobbies": c.hobbies
        })
    return jsonify(result), 200

@api.route('/contacto/<int:contact_id>', methods=['GET'])
@jwt_required()
def get_single_contact(contact_id):
    current_user_id = int(get_jwt_identity())
    c = db.session.execute(db.select(Contactos).where(Contactos.contactos_id == contact_id, Contactos.user_id == current_user_id)).scalar_one_or_none()
    if not c: return jsonify({"msg": "No encontrado"}), 404
    return jsonify({
        "name": c.name,
        "birth_date": c.birth_date,
        "gender": c.gender,
        "hobbies": c.hobbies,
        "ocupacion": c.ocupacion,
        "tipo_personalidad": c.tipo_personalidad,
        "relation": c.relation,
        "imagen": c.url_img
    }), 200

@api.route('/contacto/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    current_user_id = int(get_jwt_identity())
    c = db.session.execute(db.select(Contactos).where(Contactos.contactos_id == contact_id, Contactos.user_id == current_user_id)).scalar_one_or_none()
    if not c: return jsonify({"msg": "No encontrado"}), 404
    db.session.delete(c)
    db.session.commit()
    return jsonify({"msg": "Contacto eliminado"}), 200

# --- AI GIFT GENERATION ---

@api.route('/generate_gift_ideas', methods=['POST'])
@jwt_required()
def generate_gift_ideas():
    data = request.get_json()
    api_key_gemini = os.getenv("GOOGLE_API_KEY")
    if not api_key_gemini: return jsonify({"msg": "Falta API Key"}), 500

    genai.configure(api_key=api_key_gemini)
    model = genai.GenerativeModel('gemini-flash-latest')

    perfil = data
    evitar = data.get('evitar', '')
    observaciones = data.get('observaciones', '')
    presupuesto = data.get('presupuesto', '')
    historial = data.get('historial', [])
    history_str = ", ".join(historial) if historial else "Ninguno"

    prompt = f"""
    Rol: Eres un Personal Shopper experto internacionalmente y en España.
    Tarea: Genera 6 regalos FÍSICOS, ORIGINALES y ESPECÍFICOS que sean ideales para el PERFIL que te describo a continuacion. Los Hobbies se refiere tanto a Hobbies como a gustos del perfil.

    PERFIL:
    - Edad: {perfil.get('edad')} | Género: {perfil.get('sexo')}
    - Hobbies: {perfil.get('hobbies')}
    - Ocupación: {perfil.get('ocupacion')}
    - Contexto: {perfil.get('ocasion')} | Relación: {perfil.get('parentesco')}
    - Personalidad: {perfil.get('personalidad')}
    - Presupuesto: {presupuesto} (Precios realistas Amazon España)
    
    OBSERVACIONES EXTRA: {observaciones}

    REGLAS:
    1. Cruza hobbies/personalidad para ser original. Evita lo genérico.
    2. EVITAR TEMAS: {evitar}.
    3. NO REPETIR: {history_str}.
    4. "nombre_regalo" debe ser el nombre del producto comercial exacto.

    Salida OBLIGATORIA: JSON Array con 6 objetos. Claves:
    "nombre_regalo", "descripcion" (cortas, persuasivas), "precio_estimado" (ej: "45 €"), "termino_busqueda".
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        ideas = json.loads(text)

        for idea in ideas:
            term = idea.get('termino_busqueda', idea.get('nombre_regalo'))
            search_url = term.replace(" ", "+")

            # Enlace Amazon, podremos añadir la busqueda en otras plataformas
            idea['link_compra'] = f"https://www.amazon.es/s?k={search_url}&tag=4giifts-21" # El tag=xxxxxx seria el codigo de afiliados que tenemos que crear 

            # Búsqueda de Imagen (Cascada + Caché DB)
            img_url = google_search_api(f"{term} producto", search_type="image")
            
            if not img_url:
                img_url = google_search_api(idea.get('nombre_regalo'), search_type="image")

            idea['imagen'] = img_url if img_url else FALLBACK_IMAGE_URL

        return jsonify(ideas), 200

    except Exception as e:
        print(f"Error IA: {e}")
        return jsonify({"msg": "Error generando ideas"}), 500
    


@api.route('/getdata', methods=['GET'])
def get_data():
    result= db.session.query(ImagenProducto).all()
    result= [product.to_dict() for product in result]
    print(result)
    return jsonify(result)