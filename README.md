nodejs
# CRUD Usuarios - Node.js + Express + Sequelize + MySQL

## Requisitos
Node.js 18+, MySQL (XAMPP), Insomnia o Postman

## Configuración de la base de datos
Crear base de datos en MySQL:
CREATE DATABASE mi_tienda;

Archivo `.env` en la raíz:
DB_NAME=mi_tienda
DB_USER=root
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_DIALECT=mysql
PORT=3000

## Crear modelo Usuario
npx sequelize-cli model:generate --name Usuario --attributes nombre:string,email:string,password:string,activo:boolean

## Ejecutar migración
npm run db:migrate

## Crear seeders de usuarios
npx sequelize-cli seed:generate --name demo-usuarios

Editar el archivo generado en `seeders/demo-usuarios.js`:
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('123456', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('Usuarios', [
      { nombre: 'Juan Pérez', email: 'juan@ejemplo.com', password: passwordHash, activo: true, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'María García', email: 'maria@ejemplo.com', password: passwordHash, activo: true, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Carlos López', email: 'carlos@ejemplo.com', password: passwordHash, activo: false, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Admin Sistema', email: 'admin@ejemplo.com', password: adminPasswordHash, activo: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};

Ejecutar seeders:
npm run db:seed:all

---

## Código completo para CRUD

### index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./models');
const usuarioRouter = require('./routes/usuarios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => { console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); next(); });

app.get('/', (req, res) => { res.json({ message: 'API funcionando correctamente :)', timestamp: new Date().toISOString() }); });

app.use('/api/usuario', usuarioRouter);

app.use((req, res) => { res.status(404).json({ error: 'Ruta no encontrada', message: `La ruta ${req.originalUrl} no existe` }); });

async function iniciarServidor() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: false });
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (error) {
    console.log('Error al iniciar servidor', error.message);
    process.exit(1);
  }
}
iniciarServidor();

---

### models/usuario.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model { static associate(models) {} }
  Usuario.init({
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
    timestamps: true
  });
  return Usuario;
};

---

### routes/usuarios.js
const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

//  CREATE
router.post('/', async (req, res) => {
  try {
    const { nombre, email, password, activo } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const nuevo = await Usuario.create({ nombre, email, password: hash, activo });
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  READ (todos)
router.get('/', async (req, res) => {
  const usuarios = await Usuario.findAll();
  res.json(usuarios);
});

//  READ (uno)
router.get('/:id', async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  usuario ? res.json(usuario) : res.status(404).json({ error: 'No encontrado' });
});

//  UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { nombre, email, password, activo } = req.body;
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'No encontrado' });
    const data = { nombre, email, activo };
    if (password) data.password = await bcrypt.hash(password, 10);
    await usuario.update(data);
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  DELETE
router.delete('/:id', async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  await usuario.destroy();
  res.json({ mensaje: 'Usuario eliminado' });
});

module.exports = router;

---

## Probar en Insomnia / Postman

# Crear usuario
POST http://localhost:3000/api/usuario
Body JSON:
{
  "nombre": "Nuevo Usuario",
  "email": "nuevo@ejemplo.com",
  "password": "123456",
  "activo": true
}

# Listar todos los usuarios
GET http://localhost:3000/api/usuario

# Obtener un usuario por ID
GET http://localhost:3000/api/usuario/:id

# Actualizar un usuario
PUT http://localhost:3000/api/usuario/:id
Body JSON:
{
  "nombre": "Nombre Actualizado",
  "email": "nuevoemail@ejemplo.com",
  "password": "nuevo123",
  "activo": false
}

# Borrar un usuario
DELETE http://localhost:3000/api/usuario/:id
