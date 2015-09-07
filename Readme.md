# Adnoto	

Frustrated with the available online note taking apps - I want to use markdown and choose simplicity over features - I've build my own as a week project. You can see the project in action [here](https://vimeo.com/115867480).

I'm opening the project as I get a lot of inquiries regarding opening up the code. Please keep in mind that I release Adnoto "as is" and **NOT** giving any support! 


## Technology stack

Server: 

* [Python 2.x](https://www.python.org/)
* [Flask](http://flask.pocoo.org/)
* [SQLAlchemy](http://www.sqlalchemy.org/) (sqlite) 
* [Werkzeug](http://werkzeug.pocoo.org/)
* [Jinja2](http://jinja.pocoo.org/docs/dev/)

WebUI:

* [Backbone](http://backbonejs.org/)
* [Underscore](http://underscorejs.org/)
* [Prism](http://prismjs.com/)
* [CodeMirror](https://codemirror.net/)
* [CommonMark](http://commonmark.org/)
* [jQuery](https://jquery.com/)
* [Bootstrap](http://getbootstrap.com/)

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

You can access the web interface by opening your browser and navigate to localhost:8080/login.

* Login: admin
* Password: admin

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

### Sqlite

There are 2 tables

* notes
* users

You can use the sqlite3 commandline tool or something like [sqlitebrowser](http://sqlitebrowser.org/) to modify the dbase.

## License 

Adnoto is released under the Affero General Public License 3 
