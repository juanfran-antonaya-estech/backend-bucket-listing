# Documentación API de bucket listing

## URL

- La URL base es ``http://localhost:3000/api/``

## Endpoints

### Cathingory

- ``GET /api/cathingory``: obtiene todas las categorías<br>
- ``GET /api/cathingory/{nombre}``: obtiene todas las categorías cuyo nombre coincide con ``name``

> ```
>{
>  "id": int,
>  "name": "nombre",
>  "description": "descripcion",
>  "image": "URL de la imagen"
>}

### Perfil

- ``GET /api/perfil/{id}``: obtiene el perfil cuya id coincida con ``id`` y proporciona la siguiente información:

```
{
    "nombre_usuario": "user",
    "id": 1,
    "nombre_perfil": "nombre",
    "imagen_perfil": "url_imagen",
    "banner": "url_banner",
    "bio": "bio",
    "thingos": 0,
    "confirmaciones": [],
    "mentiras": 0,
    "insanidad": 0,
    "seguidores": 0,
    "seguidos": 0,
    "mutuals": 0
}
```

El YAML de los endpoints:

openapi: 3.0.3
info:
title: Title
description: Title
version: 1.0.0
servers:

- url: 'https'
  paths:
  /api/feed/{page}:
  get:
  summary: "GET api/feed/{page}"
  parameters:
    - name: "page"
      in: "path"
      required: false
      responses:
      "200":
      description: "OK"
      /api/thingos/{name}:
      get:
      summary: "GET api/thingos/{name}"
      parameters:
    - name: "name"
      in: "path"
      required: false
      responses:
      "200":
      description: "OK"
      /api/thingos/{page}/{id}:
      get:
      summary: "GET api/thingos/{page}/{id}"
      parameters:
    - name: "page"
      in: "path"
      required: false
    - name: "id"
      in: "path"
      required: false
      responses:
      "200":
      description: "OK"
      /api/cathingory:
      get:
      summary: "GET api/cathingory"
      responses:
      "200":
      description: "OK"
      /api/cathingory/{name}:
      get:
      summary: "GET api/cathingory/{name}"
      parameters:
    - name: "name"
      in: "path"
      required: false
      responses:
      "200":
      description: "OK"
      /api/login:
      post:
      summary: "POST api/login"
      responses:
      "200":
      description: "OK"
      /api/register:
      post:
      summary: "POST api/register"
      responses:
      "200":
      description: "OK"
      /api/trending:
      get:
      summary: "GET api/trending"
      responses:
      "200":
      description: "OK"
      /api/suggestions/friendsuggestions:
      get:
      summary: "GET api/suggestions/friendsuggestions"
      responses:
      "200":
      description: "OK"
      /api/suggestions/sugerenciasthingos:
      get:
      summary: "GET api/suggestions/sugerenciasthingos"
      responses:
      "200":
      description: "OK"
      /api/perfil:
      get:
      summary: "GET api/perfil"
      responses:
      "200":
      description: "OK"
      post:
      summary: "POST api/perfil"
      responses:
      "200":
      description: "OK"
      /api/perfil/{id}:
      get:
      summary: "GET api/perfil/{id}"
      parameters:
    - name: "id"
      in: "path"
      required: false
      responses:
      "200":
      description: "OK"


