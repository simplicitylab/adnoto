# Import flask dependencies
from flask import Blueprint, request, render_template

# Define the blueprint: 'rest_service', set its url prefix: app.url/api/v1
mod_rest_service = Blueprint('rest_service', __name__, url_prefix='/api/v1')

# Set the route and accepted methods
@mod_rest_service.route('/test', methods=['GET'])
def test():
    # render test.html
    return render_template("rest/test.html")
