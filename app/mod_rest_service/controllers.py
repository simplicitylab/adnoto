# Import flask dependencies
from flask import Blueprint, request, render_template, jsonify

# Import the database object from the main app module
from app import db

# Import form-login required decorator
from flask.ext.login import login_required

# Import module models and schema Notebook, Page
from app.mod_rest_service.models import Notebook
from app.mod_rest_service.models import NotebookSchema

from app.mod_rest_service.models import Page
from app.mod_rest_service.models import PageSchema

from app.mod_auth.models import User

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
@login_required
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


@mod_rest_service.route('/notebook/<notebook_id>/page/<page_id>', methods=['GET'])
def get_page(notebook_id, page_id):
    """
    This endpoint gets the page information
    """
    # gets  page from notebook
    page = Page.query.filter(Page.notebook_id==notebook_id, Page.id==page_id).first()

    # if page is not found
    if page == None:
        return jsonify({"message": "Page could not be found."}), 400
    else:
         # serialize sqlalchemy data
        serializer = PageSchema()
        result = serializer.dump(page)

        # return json result
        return jsonify({"page": result.data})


@mod_rest_service.route('/notebook/<notebook_id>/page/<page_id>', methods=['DELETE'])
def delete(notebook_id, page_id):
    """
    This endpoint deletes a page
    """

    # gets  page from notebook
    page = Page.query.filter(Page.notebook_id==notebook_id, Page.id==page_id).first()

    # if page is not found
    if page == None:
        return jsonify({"message": "Page could not be found."}), 400
    else:
        # remove page from database
        db.session.delete(page)
        db.session.commit()

        # return json result
        return jsonify({})

@mod_rest_service.route('/user', methods=['POST'])
def create_new_user():

    # get json request data
    json_data =  request.get_json()

    # create new user
    new_user = User(json_data["username"], json_data["password"])

    # store new user into dbase
    db.session.add(new_user)
    db.session.commit()

    # return json result
    return jsonify({})
