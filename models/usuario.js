'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Aquí irían las relaciones si las necesitas
      // Usuario.hasMany(models.Algo, { foreignKey: 'usuarioId' });
    }
  }

  Usuario.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',   // 🔑 opcional, si tu tabla en MySQL se llama así
    timestamps: true         // createdAt / updatedAt automáticos
  });

  return Usuario;
};
