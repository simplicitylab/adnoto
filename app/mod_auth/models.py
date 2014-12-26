# Import the database object (db) from the main application module
# this is defined inside /app/__init__.py
from app import db

# Import werkzeug security
from werkzeug.security import generate_password_hash, check_password_hash

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


class User(Base):
    """
    Represents a user in the database
    """
    __tablename__ = "user"

    username = db.Column('username', db.String(20), unique=True , index=True)
    password = db.Column('password' , db.String(10))
    is_admin = db.Column('is_admin', db.Boolean())

    def __init__(self, username, password, is_admin):
        self.username = username
        self.password = generate_password_hash(password)
        self.is_admin = is_admin

    def checkPassword(self, password):
        """
        Checks if password is correct for user
        """
        return check_password_hash(self.password, password)

    def is_authenticated(self):
        return True

    def is_active(self):
       return True

    def is_anonymous(self):
       return False

    def get_id(self):
       return unicode(self.id)
