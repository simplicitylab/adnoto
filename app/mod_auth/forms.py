from flask_wtf import Form
from wtforms import StringField, PasswordField

### Forms ###
class LoginForm(Form):
    username = StringField()
    password = PasswordField()

