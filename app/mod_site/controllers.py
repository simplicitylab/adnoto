# Import flask dependencies
from flask import Blueprint, render_template

# Import form-login required decorator
from flask.ext.login import login_required

# Define the blueprint: 'rest_service', set its url prefix: app.url/api/v1
mod_site = Blueprint('mod_site', __name__)

### Routes ###

@mod_site.route('/', methods=['GET'])
@login_required
def homepage():
    """
    Handles homepage
    """
    # render test.html
    return render_template("site/index.html")

