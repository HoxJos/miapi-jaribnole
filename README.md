// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Sequelize, DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Express
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configurar Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'mi_tienda',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false
  }
);

// Definir modelo Usuario
class Usuario extends Model {}
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

// RUTAS

// 🟢 CREATE
app.post('/api/usuario', async (req, res) => {
  try {
    const { nombre, email, password, activo } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const nuevo = await Usuario.create({ nombre, email, password: hash, activo });
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔵 READ ALL
app.get('/api/usuario', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ attributes: { exclude: ['password'] } });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟠 READ ONE
app.get('/api/usuario/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    usuario ? res.json(usuario) : res.status(404).json({ error: 'No encontrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟡 UPDATE
app.put('/api/usuario/:id', async (req, res) => {
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

// 🔴 DELETE
app.delete('/api/usuario/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'No encontrado' });
    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente :)' });
});

// Iniciar servidor y base de datos
async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('Conexión a la base de datos OK');
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (error) {
    console.error('Error al iniciar servidor:', error.message);
    process.exit(1);
  }
}
iniciarServidor();
