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

