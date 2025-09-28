const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

// 🟢 CREATE
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

// 🔵 READ (todos)
router.get('/', async (req, res) => {
  const usuarios = await Usuario.findAll();
  res.json(usuarios);
});

// 🟠 READ (uno)
router.get('/:id', async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  usuario ? res.json(usuario) : res.status(404).json({ error: 'No encontrado' });
});

// 🟡 UPDATE
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

// 🔴 DELETE
router.delete('/:id', async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  await usuario.destroy();
  res.json({ mensaje: 'Usuario eliminado' });
});

module.exports = router;
