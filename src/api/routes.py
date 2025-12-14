import os
import json
import requests
import google.generativeai as genai
from flask import Flask, request, jsonify, Blueprint, current_app
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from datetime import datetime, timezone, timedelta
from api.models import db, User, Contactos, Producto, Historial, Favorite, bcrypt
from flask_mail import Message
from api.extensions import mail
from itsdangerous import URLSafeTimedSerializer

api = Blueprint('api', __name__)
CORS(api)

FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=500&auto=format&fit=crop"

def get_product_from_db(term):
    try:
        clean_term = term.lower().strip()
        cached = db.session.execute(
            db.select(Producto).where(Producto.termino_busqueda == clean_term)
        ).scalar_one_or_none()
        return cached
    except Exception:
        return None

def save_product_to_db(term, url, name, link, price, desc):
    try:
        clean_term = term.lower().strip()
        existing = get_product_from_db(clean_term)
        
        if not existing:
            new_entry = Producto(
                termino_busqueda=clean_term, 
                img_url=url, 
                nombre=name, 
                link_compra=link,
                precio=price,
                descripcion=desc
            )
            db.session.add(new_entry)
            db.session.commit()
            return new_entry
        return existing
    except Exception:
        db.session.rollback()
        return None

def google_search_api(query, search_type=None):
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
            return data["items"][0]["link"]
    except Exception:
        pass
    return None

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    return jsonify({"message": "Backend online"}), 200

@api.route('/signup', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User.create_new_user(
        # aqui se harian validaciones
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

@api.route('/private', methods=['POST', 'GET'])
@jwt_required()
def msg_privado():
    user_id = int(get_jwt_identity())
    user = db.session.execute(db.select(User).where(User.user_id == user_id)).scalar_one_or_none()
    if not user: return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify({"user": user.to_dict()}), 200

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
            "hobbies": c.hobbies,
            "gender": c.gender,
            "ocupacion": c.ocupacion,
            "tipo_personalidad": c.tipo_personalidad
        })
    return jsonify(result), 200

@api.route('/contacts', methods=['POST'])
@jwt_required()
def create_contact():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data.get("name"): return jsonify({"msg": "El nombre es obligatorio"}), 400
    new_contact = Contactos(
        user_id=current_user_id,
        name=data.get("name"),
        relation=data.get("relation"),
        birth_date=data.get("birth_date"),
        gender=data.get("gender"),
        hobbies=data.get("hobbies"),
        ocupacion=data.get("ocupacion"),
        tipo_personalidad=data.get("tipo_personalidad"),
        url_img=data.get("url_img")
    )
    try:
        db.session.add(new_contact)
        db.session.commit()
        return jsonify({
            "id": new_contact.contactos_id,
            "name": new_contact.name,
            "relation": new_contact.relation,
            "img": new_contact.url_img,
            "birth_date": new_contact.birth_date,
            "hobbies": new_contact.hobbies,
            "gender": new_contact.gender,
            "ocupacion": new_contact.ocupacion,
            "tipo_personalidad": new_contact.tipo_personalidad
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@api.route('/contacto/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    current_user_id = int(get_jwt_identity())
    c = db.session.execute(db.select(Contactos).where(Contactos.contactos_id == contact_id, Contactos.user_id == current_user_id)).scalar_one_or_none()
    if not c: return jsonify({"msg": "No encontrado"}), 404
    data = request.get_json()
    if "name" in data: c.name = data["name"]
    if "relation" in data: c.relation = data["relation"]
    if "birth_date" in data: c.birth_date = data["birth_date"]
    if "gender" in data: c.gender = data["gender"]
    if "hobbies" in data: c.hobbies = data["hobbies"]
    if "ocupacion" in data: c.ocupacion = data["ocupacion"]
    if "tipo_personalidad" in data: c.tipo_personalidad = data["tipo_personalidad"]
    if "url_img" in data: c.url_img = data["url_img"]
    db.session.commit()
    return jsonify({
        "id": c.contactos_id,
        "name": c.name,
        "relation": c.relation,
        "img": c.url_img,
        "birth_date": c.birth_date,
        "hobbies": c.hobbies,
        "gender": c.gender,
        "ocupacion": c.ocupacion,
        "tipo_personalidad": c.tipo_personalidad
    }), 200

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

@api.route('/generate_gift_ideas', methods=['POST'])
@jwt_required()
def generate_gift_ideas():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    api_key_gemini = os.getenv("GOOGLE_API_KEY")
    if not api_key_gemini: return jsonify({"msg": "Falta API Key"}), 500

    contact_id = data.get('contact_id')
    if contact_id == 'user': contact_id = None 

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

        result_ideas = []

        for idea in ideas:
            term = idea.get('termino_busqueda', idea.get('nombre_regalo'))
            search_url = term.replace(" ", "+")
            link_compra = f"https://www.amazon.es/s?k={search_url}&tag=4giifts-21"

            cached_prod = get_product_from_db(term)
            
            if cached_prod:
                final_prod = cached_prod
            else:
                img_url = google_search_api(f"{term} producto", search_type="image")
                if not img_url: img_url = google_search_api(idea.get('nombre_regalo'), search_type="image")
                if not img_url: img_url = FALLBACK_IMAGE_URL
                
                final_prod = save_product_to_db(term, img_url, idea.get('nombre_regalo'), link_compra, idea.get('precio_estimado'), idea.get('descripcion'))

            if final_prod:
                hist = Historial(user_id=current_user_id, contact_id=contact_id, producto_id=final_prod.id)
                db.session.add(hist)
                db.session.commit()

                result_ideas.append({
                    "id": final_prod.id,
                    "nombre_regalo": final_prod.nombre,
                    "descripcion": final_prod.descripcion,
                    "precio_estimado": final_prod.precio,
                    "link_compra": final_prod.link_compra,
                    "imagen": final_prod.img_url
                })

        return jsonify(result_ideas), 200

    except Exception as e:
        print(f"Error IA: {e}")
        return jsonify({"msg": "Error generando ideas"}), 500

@api.route('/history/<string:contact_id_str>', methods=['GET'])
@jwt_required()
def get_history(contact_id_str):
    current_user_id = int(get_jwt_identity())
    
    if contact_id_str == 'user':
        history = db.session.execute(db.select(Historial).where(Historial.user_id == current_user_id, Historial.contact_id == None).order_by(Historial.created_at.desc())).scalars().all()
    else:
        try:
            c_id = int(contact_id_str)
            history = db.session.execute(db.select(Historial).where(Historial.user_id == current_user_id, Historial.contact_id == c_id).order_by(Historial.created_at.desc())).scalars().all()
        except:
            return jsonify([]), 200

    return jsonify([h.to_dict() for h in history]), 200

@api.route('/history/<string:contact_id_str>', methods=['DELETE'])
@jwt_required()
def clear_history(contact_id_str):
    current_user_id = int(get_jwt_identity())
    if contact_id_str == 'user':
        db.session.execute(db.delete(Historial).where(Historial.user_id == current_user_id, Historial.contact_id == None))
    else:
        try:
            c_id = int(contact_id_str)
            db.session.execute(db.delete(Historial).where(Historial.user_id == current_user_id, Historial.contact_id == c_id))
        except:
            pass
    db.session.commit()
    return jsonify({"msg": "Historial borrado"}), 200

@api.route('/favorites', methods=['POST'])
@jwt_required()
def toggle_favorite():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    product_id = data.get("product_id")
    target_contact_id = data.get("contact_id") 

    existing = db.session.execute(db.select(Favorite).where(
        Favorite.user_id == current_user_id,
        Favorite.producto_id == product_id,
        Favorite.contact_id == target_contact_id
    )).scalar_one_or_none()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"msg": "Eliminado de favoritos", "status": "removed"}), 200
    else:
        new_fav = Favorite(user_id=current_user_id, producto_id=product_id, contact_id=target_contact_id)
        db.session.add(new_fav)
        db.session.commit()
        return jsonify({"msg": "Añadido a favoritos", "status": "added"}), 201

@api.route('/favorites/<int:contact_id>', methods=['GET'])
@jwt_required()
def get_contact_favorites(contact_id):
    current_user_id = int(get_jwt_identity())
    favs = db.session.execute(db.select(Favorite).where(Favorite.user_id == current_user_id, Favorite.contact_id == contact_id)).scalars().all()
    
    result = []
    for f in favs:
        p = f.producto
        result.append({
            "favorite_id": f.favorite_id,
            "product_id": p.id,
            "name": p.nombre,
            "img": p.img_url,
            "price": p.precio,
            "link": p.link_compra
        })
    return jsonify(result), 200

@api.route('/favorite/<int:fav_id>', methods=['DELETE'])
@jwt_required()
def delete_favorite_by_id(fav_id):
    current_user_id = int(get_jwt_identity())
    fav = db.session.get(Favorite, fav_id)
    if not fav or fav.user_id != current_user_id:
        return jsonify({"msg": "No encontrado"}), 404
    db.session.delete(fav)
    db.session.commit()
    return jsonify({"msg": "Favorito eliminado"}), 200

@api.route("/recover/request", methods=["POST"])
def request_recover():
    data = request.get_json()
    email = data.get("email")
    user = User.find_by_email(email)
    msg_ok = {"msg": "Si el correo existe, recibirás un email para restablecer tu contraseña"}
    if not user: return jsonify(msg_ok), 200
    token = create_access_token(identity=str(user.user_id), expires_delta=timedelta(minutes=15))
    reset_link = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"
    msg = Message(subject="Recuperación de contraseña", recipients=[email])
    msg.body = f"Hola, has solicitado restablecer tu contraseña.\nHaz clic en el siguiente enlace: {reset_link}\nExpira en 15 min."
    mail.send(msg)
    return jsonify(msg_ok), 200

@api.route("/recover/reset", methods=["POST"])
@jwt_required()
def reset_password():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    new_password = data.get("password")
    user = db.session.get(User, user_id)
    if not user: return jsonify({"msg": "Usuario no encontrado"}), 404
    user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    return jsonify({"msg": "Contraseña actualizada con éxito"}), 200

@api.route('/user/favorites', methods=['GET'])
@jwt_required()
def get_user_own_favorites():
    current_user_id = int(get_jwt_identity())
    favs = db.session.execute(db.select(Favorite).where(Favorite.user_id == current_user_id, Favorite.contact_id == None)).scalars().all()
    result = []
    for f in favs:
        p = f.producto
        result.append({
            "favorite_id": f.favorite_id,
            "product_id": p.id,
            "name": p.nombre,
            "img": p.img_url,
            "price": p.precio,
            "link": p.link_compra
        })
    return jsonify(result), 200
#Vista dinamica - extre favoritos reales de los usarios# 

@api.route('/get_favorite_user', methods=['GET'])
def handle_get_favorite_user():
    favs = db.session.execute(db.select(Favorite)).scalars().all()
    result = []
    for f in favs:
        p = f.producto
        result.append({
            "favorite_id": f.favorite_id,
            "product_id": p.id,
            "name": p.nombre,
            "img": p.img_url,
            "price": p.precio,
            "link": p.link_compra
        })
    return jsonify(result), 200

@api.route('/user/share_link', methods=['POST'])
@jwt_required()
def generate_share_link():
    user_id = get_jwt_identity()
    s = URLSafeTimedSerializer(current_app.config["JWT_SECRET_KEY"])
    token = s.dumps(user_id, salt='share-favorites').replace('.', '~')
    link = f"{os.getenv('FRONTEND_URL')}/share/{token}"
    return jsonify({"link": link}), 200

@api.route('/shared/favorites/<token>', methods=['GET'])
def get_shared_favorites(token):
    s = URLSafeTimedSerializer(current_app.config["JWT_SECRET_KEY"])
    try:
        real_token = token.replace('~', '.')
        user_id = int(s.loads(real_token, salt='share-favorites', max_age=432000))
    except:
        return jsonify({"msg": "Enlace inválido o expirado"}), 400
    
    user = db.session.get(User, user_id)
    if not user: return jsonify({"msg": "Usuario no encontrado"}), 404

    favs = db.session.execute(db.select(Favorite).where(Favorite.user_id == user_id, Favorite.contact_id == None)).scalars().all()
    
    products = []
    for f in favs:
        p = f.producto
        products.append({
            "name": p.nombre,
            "img": p.img_url,
            "price": p.precio,
            "link": p.link_compra,
            "description": p.descripcion
        })
    
    return jsonify({
        "user_name": f"{user.first_name}",
        "user_img": user.profile_pic,
        "products": products
    }), 200
