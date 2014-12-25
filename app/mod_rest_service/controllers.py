# Import flask dependencies
from flask import Blueprint, request, render_template, jsonify

# Import the database object from the main app module
from app import db

# Import module models and schema Notebook, Page
from app.mod_rest_service.models import Notebook
from app.mod_rest_service.models import NotebookSchema

from app.mod_rest_service.models import Page

# Define the blueprint: 'rest_service', set its url prefix: app.url/api/v1
mod_rest_service = Blueprint('rest_service', __name__, url_prefix='/api/v1')

# Set the route and accepted methods
@mod_rest_service.route('/test', methods=['GET'])
def test():
    # render test.html
    return render_template("rest/test.html")


# List notebooks
@mod_rest_service.route('/notebooks', methods=['GET'])
def list_notebooks():

    # get all notebooks
    notebooks = Notebook.query.all()

    # serialize sqlalchemy data
    serializer = NotebookSchema(many=True)
    result = serializer.dump(notebooks)

    # return json result
    return jsonify({"notebooks": result.data})