# Statement for enabling the development environment
DEBUG = True

# Define the application directory
import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Define the database - we are working with
# SQLite for this example
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'adnoto.db')
DATABASE_CONNECT_OPTIONS = {}

# Secret key
SECRET_KEY  = "fdqfsd343EFDSQFQS"