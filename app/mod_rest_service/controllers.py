# Import flask dependencies
from flask import Blueprint, request, render_template, jsonify

# Import the database object from the main app module
from app import db

# Import form-login required decorator
from flask.ext.login import login_required

# Import module models and schema Notebook, Note
from app.mod_rest_service.models import Notebook
from app.mod_rest_service.models import NotebookSchema

from app.mod_rest_service.models import Note
from app.mod_rest_service.models import NoteSchema

from app.mod_auth.models import User

# Define the blueprint: 'rest_service', set its url prefix: app.url/api/v1
mod_rest_service = Blueprint('rest_service', __name__, url_prefix='/api/v1')

### Routes ###


@mod_rest_service.route('/notebooks', methods=['GET'])
@login_required
def list_notebooks():
    '''
    This endpoint returns all notebooks
    '''
    try:
        # get all notebooks
        notebooks = Notebook.query.all()

        # serialize sqlalchemy data
        serializer = NotebookSchema(many=True)
        result = serializer.dump(notebooks)

        # return json result
        return jsonify({'notebooks': result.data})
    except Exception:
        # return json result
        return jsonify({'status' : 'error while listing notebooks'}), 400


@mod_rest_service.route('/notebook', methods=['POST'])
@login_required
def create_new_notebook():
    '''
    This endpoint creates a new notebook
    '''
    try:
        # get json request data
        json_data =  request.get_json()

        # create new notebook
        new_notebook =  Notebook(json_data['name'])

        # add new notebook to database
        db.session.add(new_notebook)
        db.session.commit()

        # serialize sqlalchemy data
        serializer = NotebookSchema(many=False)
        result = serializer.dump(new_notebook)

        # return json result
        return jsonify({"notebook" : result.data})
    except Exception:
        # return json result
        return jsonify({'status' : 'error while creating a new notebook'})


@mod_rest_service.route('/notebook/<notebook_id>', methods=['DELETE'])
@login_required
def delete_notebook(notebook_id):
    '''
    This endpoint deletes a notebook
    '''
    try:
        # get notebook
        notebook = Notebook.query.filter(Notebook.id==notebook_id).first()

        # if notebook is not found
        if notebook is None:
            return jsonify({'message': 'Notebook could not be found.'}), 400
        else:
            # remove notebook from database
            db.session.delete(notebook)
            db.session.commit()

            # return json result
            return jsonify({})
    except Exception:
        # return json result
        return jsonify({'status' : 'error while delete a notebook'}), 400

@mod_rest_service.route('/notebook/<notebook_id>', methods=['PUT'])
@login_required
def update_notebook(notebook_id):
    '''
    This endpoint updates a notebook
    '''
    try:
        # get notebook
        notebook = Notebook.query.filter(Notebook.id==notebook_id).first()

        # if notebook is not found
        if notebook is None:
            return jsonify({'message': 'Notebook could not be found.'}), 400
        else:

            # get json request data
            json_data =  request.get_json()

            notebook.name = json_data["name"]

            # update
            db.session.commit()

            # serialize sqlalchemy data
            serializer = NotebookSchema(many=False)
            result = serializer.dump(notebook)

            # return json result
            return jsonify({'notebook': result.data})

    except Exception:
        # return json result
        return jsonify({'status' : 'error while updating notebook'}), 400


@mod_rest_service.route('/notebook/<notebook_id>/notes', methods=['GET'])
@login_required
def list_notes_notebook(notebook_id):
    '''
    This endpoint returns all notes within a notebook
    '''
    try:
        # gets all notes from notebook
        notes = Note.query.filter(Note.notebook_id==notebook_id)

        # serialize sqlalchemy data
        serializer = NoteSchema(many=True)
        result = serializer.dump(notes)

        # return json result
        return jsonify({'notes': result.data})
    except Exception:
        # return json result
        return jsonify({'status' : 'error while listing notes'}), 400


@mod_rest_service.route('/notebook/<notebook_id>/note', methods=['POST'])
def create_new_note(notebook_id):
    '''
    This endpoint creates a new note in a notebook
    '''
    try:
        # get json request data
        json_data =  request.get_json()

        # get notebook
        notebook = Notebook.query.get(notebook_id)

        # create new note
        new_note = Note(json_data['title'], json_data['content'], 'red', notebook)

        # store new note into dbase
        db.session.add(new_note)
        db.session.commit()

         # serialize sqlalchemy data
        serializer =  NoteSchema()
        result = serializer.dump(new_note)

        # return json result
        return jsonify({'note' : result.data})
    except Exception as ex:
        print ex
        # return json result
        return jsonify({'status' : 'error while creating a new note'}), 400


@mod_rest_service.route('/notebook/<notebook_id>/note/<note_id>', methods=['GET'])
@login_required
def get_note(notebook_id, note_id):
    '''
    This endpoint gets the note information
    '''
    try:
        # gets  note from notebook
        note = Note.query.filter(Note.notebook_id==notebook_id, Note.id==note_id).first()

        # if note is not found
        if note is None:
            return jsonify({'message': 'Note could not be found.'}), 400
        else:
             # serialize sqlalchemy data
            serializer =  NoteSchema()
            result = serializer.dump(note)

            # return json result
            return jsonify({'note': result.data})
    except Exception:
        # return json result
        return jsonify({'status' : 'error while getting content of note'}), 400


@mod_rest_service.route('/notebook/<notebook_id>/note/<note_id>', methods=['PUT'])
@login_required
def update_note(notebook_id, note_id):
    '''
    This endpoint updates note
    '''
    try:

        # get json request data
        json_data =  request.get_json()

        print json_data

        # gets note from notebook
        note = Note.query.filter(Note.notebook_id==notebook_id, Note.id==note_id).first()

        # if note is not found
        if note is None:
            return jsonify({'message': 'Note could not be found.'}), 400
        else:

            # update note
            note.title   = json_data['title']
            note.content = json_data['content']
            note.color   = json_data['color']

            db.session.commit()

             # serialize sqlalchemy data
            serializer =  NoteSchema()
            result = serializer.dump(note)

            # return json result
            return jsonify({'note': result.data})
    except Exception:
        # return json result
        return jsonify({'status' : 'error while update content of note'}), 400


@mod_rest_service.route('/notebook/<notebook_id>/note/<note_id>', methods=['DELETE'])
@login_required
def delete_note(notebook_id, note_id):
    '''
    This endpoint deletes a note
    '''
    try:
        # gets note from notebook
        note = Note.query.filter(Note.notebook_id==notebook_id, Note.id==note_id).first()

        # if note is not found
        if note == None:
            return jsonify({'message': 'Note could not be found.'}), 400
        else:
            # remove note from database
            db.session.delete(note)
            db.session.commit()

            # return json result
            return jsonify({})
    except Exception:
        # return json result
        return jsonify({'status' : 'error while delete note'}), 400


@mod_rest_service.route('/user', methods=['POST'])
def create_new_user():
    """
    This endpoint creates a new user
    """
    try:
        # get json request data
        json_data =  request.get_json()

        # create new user
        new_user = User(json_data['username'], json_data['password'], json_data['is_admin'])

        # store new user into dbase
        db.session.add(new_user)
        db.session.commit()

        # return json result
        return jsonify({})

    except Exception:
        # return json result
        return jsonify({'status' : 'error while creating new user'}), 400

