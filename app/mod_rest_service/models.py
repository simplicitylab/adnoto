# Import the database object (db) from the main application module
# this is defined inside /app/__init__.py
from app import db

# Import marshmallow serializer
from marshmallow import Schema, fields, ValidationError

##### Models #####

# Define a base model for other database tables to inherit
class Base(db.Model):
    """
    Base model that other models inherit from
    """
    __abstract__  = True

    id            = db.Column(db.Integer, primary_key=True)
    date_created  = db.Column(db.DateTime,  default=db.func.current_timestamp())
    date_modified = db.Column(db.DateTime,  default=db.func.current_timestamp(),
                                           onupdate=db.func.current_timestamp())

# Define a Page model
class Note(Base):
    """
    Describes a page in the notebook
    """
    __tablename__ = 'note'

    # Note title
    title  = db.Column(db.String(128),  nullable=False)

    # Note color
    color  = db.Column(db.String(128),  nullable=False)

    # Note content
    content = db.Column(db.Text, nullable=False)

    # notebook id
    notebook_id = db.Column(db.Integer, db.ForeignKey('notebook.id'))

    def __init__(self, title, content, color, notebook):
        """
        Default constructor
        """
        self.title = title
        self.content = content
        self.color = color
        self.notebook_id = notebook.id


# Define a Notebook model
class Notebook(Base):
    """
    Describes a notebook model
    """
    __tablename__ = 'notebook'

    # Notebook Name
    name    = db.Column(db.String(128),  nullable=False)

    # Number of notes
    number_notes   = db.Column(db.Integer)

    # Notes children
    notes = db.relationship("Note", backref="note", lazy="select", cascade="all, delete, delete-orphan")

    def __init__(self, name):
        """
        Default constructor
        """
        self.name = name
        self.number_notes = 0;

##### SCHEMAS #####

# validator
def must_not_be_blank(data):
    if not data:
        raise ValidationError('Data not provided.')

# Notebook schema
class NotebookSchema(Schema):
    """
    Schema for model Notebook
    """
    id = fields.Integer()
    name = fields.Str(required=True, validate=must_not_be_blank)
    number_notes = fields.Method("get_number_of_articles")

    def get_number_of_articles(self, obj):
        return len(obj.notes)



   # class Meta:
   #     fields = ("id", "date_created", "date_modified", 'name', 'number_notes')

# Page schema
class NoteSchema(Schema):
    """
    Schema for model note
    """
    class Meta:
        fields = ("id", "date_created", "date_modified", 'title', 'color', 'content')
