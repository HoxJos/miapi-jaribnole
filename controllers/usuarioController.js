const { Usuario } = require('../models');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const obtenerUsuarios = async(req, res) => {
    try{
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password'] },//no se envia contraseña
        order: [['createdAt','DESC']]
        });

        res.json({
            success: true,
            message: 'Usuarios Obtenidos Correctamente',
            data: usuarios,
            total: usuarios.length
        });
    }catch(error){
        console.error('Error al obtener usuarios', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    obtenerUsuarios
};