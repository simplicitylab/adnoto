# Import flask and template operators
from flask import Flask, render_template

# Import SQLAlchemy
from flask.ext.sqlalchemy import SQLAlchemy

# Import Form-login
from flask.ext.login import LoginManager

# Define the WSGI application object
app = Flask(__name__)

# Configurations
app.config.from_object('config')

# Define the database object which is imported
# by modules and controllers
db = SQLAlchemy(app)

# Define the login sessionmanager
login_manager = LoginManager()
login_manager.init_app(app)

# Import a module / component using its blueprint handler variable
from app.mod_rest_service.controllers import mod_rest_service as rest_service_module
from app.mod_auth.controllers import mod_auth as auth_module

# Import blueprints
app.register_blueprint(rest_service_module)
app.register_blueprint(auth_module)

# Build the database:
# This will create the database file using SQLAlchemy
db.create_all()
