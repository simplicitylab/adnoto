# Curl commands

### Create a new notebook

```
curl -H "Content-Type: application/json" -d '{"name":"dit is een testje"}' http://localhost:8080/api/v1/notebook
`` 
 
### Create a new page

```
curl -H "Content-Type: application/json" -d '{"title":"dit is een testje", "content":"#hello"}' http://localhost:8080/api/v1/notebook/1/page
``