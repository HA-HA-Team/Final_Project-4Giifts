"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User.create_new_user(
        # aqui se harian validaciones
        email=data.get("email"),
        password=data.get("password")
    )
    return jsonify(user.to_dict())


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.find_by_email(data.get("email"))

    if not user:
        return jsonify({
            "error": True,
            "msg": "usuario no encontrado"
        }), 400

    if user and user.check_psw(data.get("password")):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "user": user.to_dict(),
            "token": access_token}), 200

    return jsonify({
        "error": True,
        "msg": "verifica los datos ingresados"
    }), 400


@api.route('/private', methods=['POST', 'GET'])
@jwt_required()
def msg_privado():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    response_body = {
        "message": "Zona exclusiva PRIVADA",
        "user": user.to_dict()
    }

    return jsonify(response_body), 200
