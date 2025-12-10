from api.utils import APIException  # para evitar import circular
import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_mail import Mail

# -----------------------------
# CONFIGURACIÓN GLOBAL DE MAIL
# -----------------------------

mail = Mail()

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"

static_file_dir = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), '../dist/'
)

app = Flask(__name__)
app.url_map.strict_slashes = False

# -----------------------------
# CONFIGURACIÓN EMAIL
# -----------------------------
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("EMAIL_USER")
app.config["MAIL_PASSWORD"] = os.getenv("EMAIL_PASS")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("EMAIL_USER")

mail.init_app(app)

# -----------------------------
# CONFIGURACIÓN BASE DE DATOS
# -----------------------------
db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://"
    )
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# -----------------------------
# JWT CONFIG
# -----------------------------
app.config['JWT_SECRET_KEY'] = 'vmoehrpmcvfpojoanveifsfef4354t3e6efg5y54defgve45546b44hg45brbrtbrtyu656y5yrthhtrhfdh'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=180)

jwt = JWTManager(app)

# -----------------------------
# INIT APP
# -----------------------------
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

setup_admin(app)
setup_commands(app)

# 👇 IMPORTAMOS LAS RUTAS DESPUÉS DE CONFIGURAR MAIL Y APP
from api.routes import api  # noqa: E402

app.register_blueprint(api, url_prefix='/api')

# -----------------------------
# ERROR HANDLER
# -----------------------------


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# -----------------------------
# SITEMAP
# -----------------------------


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# -----------------------------
# STATIC FILES
# -----------------------------


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response


# -----------------------------
# RUN
# -----------------------------
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
