require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./models');

// importar rutas
const usuarioRouter = require('./routes/usuarios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// RUTA de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'Api funcionando correctamente :)',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Verificar conexión a BD
app.get('/cabecerabd', async (req, res) => {
    try {
        await db.sequelize.authenticate();
        res.json({
            status: 'OK',
            database: 'Conexión Exitosa',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'Error de conexión a la bd',
            error: error.message
        });
    }
});

// RUTAS de usuarios
app.use('/api/usuario', usuarioRouter);

// 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe en esta API`
    });
});

async function iniciarServidor() {
    try {
        console.log('Conectando a la base de datos...');
        await db.sequelize.authenticate();
        console.log('Conexión a MySQL exitosa...');

        await db.sequelize.sync({ force: false });
        console.log('Modelos sincronizados a la base de datos...');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
            console.log(`Base de datos: ${process.env.DB_NAME}`);
        });

    } catch (error) {
        console.log('Error al iniciar el servidor', error.message);
        process.exit(1);
    }
}

iniciarServidor();
