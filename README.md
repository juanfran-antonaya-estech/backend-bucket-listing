# Documentación API de bucket listing
## URL
- La URL base es ``http://localhost:3000/api/``
## Endpoints
### Cathingory
- ``GET /api/cathingory``: obtiene todas las categorías<br>
- ``GET /api/cathingory/{nombre}``: obtiene todas las categorías cuyo nombre coincide con ``name``
>```
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

