# Import the database object (db) from the main application module
# this is defined inside /app/__init__.py
from app import db

# Define a base model for other database tables to inherit
class Base(db.Model):

    __abstract__  = True

    id            = db.Column(db.Integer, primary_key=True)
    date_created  = db.Column(db.DateTime,  default=db.func.current_timestamp())
    date_modified = db.Column(db.DateTime,  default=db.func.current_timestamp(),
                                           onupdate=db.func.current_timestamp())

# Define a Page model
class Page(Base):
    __tablename__ = 'page'

    # Page title
    title    = db.Column(db.String(128),  nullable=False)

    # notebook id
    notebook_id = db.Column(db.Integer, db.ForeignKey('notebook.id'))


# Define a Notebook model
class Notebook(Base):
    __tablename__ = 'notebook'

    # Notebook Name
    name    = db.Column(db.String(128),  nullable=False)

    # Pages children
    pages = db.relationship("Page")



