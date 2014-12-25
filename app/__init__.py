# Import flask and template operators
from flask import Flask, render_template

# Define the WSGI application object
app = Flask(__name__)

# Configurations
app.config.from_object('config')

# Import a module / component using its blueprint handler variable (mod_rest_service)
from app.mod_rest_service.controllers import mod_rest_service as rest_service_module

# Import blueprints
app.register_blueprint(rest_service_module)
