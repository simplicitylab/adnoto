# Import flask dependencies
from flask import Blueprint, request, render_template, jsonify

# Import the database object from the main app module
from app import db

# Import module models and schema Notebook, Page
from app.mod_rest_service.models import Notebook
from app.mod_rest_service.models import NotebookSchema

from app.mod_rest_service.models import Page
from app.mod_rest_service.models import PageSchema

# Define the blueprint: 'rest_service', set its url prefix: app.url/api/v1
mod_rest_service = Blueprint('rest_service', __name__, url_prefix='/api/v1')

### Routes ###

@mod_rest_service.route('/test', methods=['GET'])
def test():
    """
    Test url
    """
    # render test.html
    return render_template("rest/test.html")


@mod_rest_service.route('/notebooks', methods=['GET'])
def list_notebooks():
    """
    This endpoint returns all notebooks
    """
    # get all notebooks
    notebooks = Notebook.query.all()

    # serialize sqlalchemy data
    serializer = NotebookSchema(many=True)
    result = serializer.dump(notebooks)

    # return json result
    return jsonify({"notebooks": result.data})


@mod_rest_service.route('/notebook', methods=['POST'])
def create_new_notebook():
    """
    This endpoint creates a new notebook
    """

    # get json request data
    json_data =  request.get_json()

    # create new notebook
    new_notebook =  Notebook(json_data["name"])

    # add new notebook to database
    db.session.add(new_notebook)
    db.session.commit()

    # return json result
    return jsonify({})


@mod_rest_service.route('/notebook/<notebook_id>/pages', methods=['GET'])
def list_pages_notebook(notebook_id):
    """
    This endpoint returns all pages within a notebook
    """

    # gets all pages from notebook
    pages = Page.query.filter(Page.notebook_id==notebook_id)

    # serialize sqlalchemy data
    serializer = PageSchema(many=True)
    result = serializer.dump(pages)

    # return json result
    return jsonify({"pages": result.data})


@mod_rest_service.route('/notebook/<notebook_id>/page', methods=['POST'])
def create_new_page(notebook_id):
    """
    This endpoint creates a new page in a notebook
    """

    # get json request data
    json_data =  request.get_json()

    # get notebook
    notebook = Notebook.query.get(notebook_id)

    # create new page
    new_page = Page(json_data["title"], json_data["content"] , notebook)

    # store new page into dbase
    db.session.add(new_page)
    db.session.commit()

    # return json result
    return jsonify({})
