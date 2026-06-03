import mongoose from 'mongoose';
import 'dotenv/config';
import logger from '../src/utils/logger.js';

before(async () => {

    const connectionString = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/adoptme_test';
    
    try {
        await mongoose.connect(connectionString);
        logger.info('Conectado a la base de datos de pruebas');
    } catch (error) {
        logger.fatal(`Error al conectar a la base de datos de pruebas: ${error.message}`);
        process.exit(1);
    }
});

after(async () => {
    try {
        await mongoose.connection.close();
        logger.info('Conexión de pruebas cerrada');
    } catch (error) {
        logger.error(`Error al cerrar la conexión de Mongoose: ${error.message}`);
    }
});