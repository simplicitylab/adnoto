# Adnoto	

Frustrated with the available online note taking apps - I want to use markdown and choose simplicity over features - I've build my own as a week project. 

I'm opening the code as I get a lot of inquiries of getting the code. Please keep in mind that I release Adnoto "as is" and **NOT** giving any support! 


## Technology stack

* Python
* Flask
* SQLAlchemy (sqlite) 
* Werkzeug 
* Jinja2 

## Setup

Install requirements

```
pip install -r requirements.txt
```

You can run the adnoto installation by executing following command

```
python run.py
```

## Access

You can access the web interface by opening your browser and navigate to server_ip:8080/login.

Login: admin
Password: admin

## API

The API is very rudementary. 

### Create a new notebook

```
curl -H "Content-Type: application/json" -d '{"name":"dit is een testje"}' http://localhost:8080/api/v1/notebook
``` 
 
### Create a new page

```
curl -H "Content-Type: application/json" -d '{"title":"dit is een testje", "content":"#hello"}' http://localhost:8080/api/v1/notebook/1/page
```


### Deletes a page

```
curl -H "Content-Type: application/json" -X DELETE http://localhost:8080/api/v1/notebook/1/page/1
```

### Creates a new user

```
curl -H "Content-Type: application/json" -d '{"username":"admin", "password":"admin", "is_admin": 1}' http://localhost:8080/api/v1/user
```


## License 

Adnoto is released under the Affero General Public License 3 
