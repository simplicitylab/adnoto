# Import flask dependencies
from flask import Blueprint, request, render_template, jsonify, redirect

# Import login manager
from app import login_manager
from flask.ext.login import current_user, login_user, logout_user

# Import User model
from app.mod_auth.models import User

# Import the forms
from app.mod_auth.forms import LoginForm

# Define the blueprint: 'auth'
mod_auth = Blueprint('auth', __name__)

### Flask-login ###
@login_manager.user_loader
def load_user(userid):
    return User.query.get(userid)

### Routes ###

@mod_auth.route('/login', methods=['GET','POST'])
def login():
    """
    Renders a login screen
    """

    # create login form
    loginForm = LoginForm(request.form)

    if loginForm.validate_on_submit():

        # get request data
        username = request.form.get('username')
        password = request.form.get('password')

        # find user
        user = User.query.filter(User.username==username).first()

        if user != None:
            # check password
            if user.checkPassword(password):
                login_user(user)
                return jsonify({"status":"user found"})

    # render login html
    return render_template('auth/login.html', form=loginForm)

@mod_auth.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return redirect('/login')



