# CRUD Usuarios - Node.js + Express + Sequelize + MySQL

## Requisitos
Node.js 18+, MySQL (XAMPP), Insomnia o Postman

## Archivos incluidos
- server.js → servidor principal con Express y Sequelize
- models/usuario.js → modelo Usuario
- routes/usuarios.js → rutas CRUD
- .env → configuración de base de datos

## Configuración de la base de datos
1. Crear base de datos en MySQL:
CREATE DATABASE mi_tienda;
2. Configurar `.env`:
DB_NAME=mi_tienda
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_DIALECT=mysql
PORT=3000

## Ejecutar la aplicación
npm install
node server.js

## Probar en Insomnia / Postman
- Crear usuario: POST http://localhost:3000/api/usuario  
  Body JSON:
  {
    "nombre": "Nuevo Usuario",
    "email": "nuevo@ejemplo.com",
    "password": "123456",
    "activo": true
  }
- Listar todos los usuarios: GET http://localhost:3000/api/usuario
- Obtener un usuario por ID: GET http://localhost:3000/api/usuario/:id
- Actualizar un usuario: PUT http://localhost:3000/api/usuario/:id  
  Body JSON:
  {
    "nombre": "Nombre Actualizado",
    "email": "nuevoemail@ejemplo.com",
    "password": "nuevo123",
    "activo": false
  }
- Borrar un usuario: DELETE http://localhost:3000/api/usuario/:id
