import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';

import errorHandler from './middlewares/errors/index.js';
import logger from './utils/logger.js';
import { addLogger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT||8080;
const connection = mongoose.connect(process.env.MONGODB_URI)

app.use(express.json());
app.use(cookieParser());
app.use(addLogger);

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);

app.get('/loggerTest', (req, res) => {
    req.logger.fatal("Prueba de log nivel FATAL");
    req.logger.error("Prueba de log nivel ERROR");
    req.logger.warning("Prueba de log nivel WARNING");
    req.logger.info("Prueba de log nivel INFO");
    req.logger.http("Prueba de log nivel HTTP");
    req.logger.debug("Prueba de log nivel DEBUG");
    res.send({ status: "success", message: "¡Logs generados! Revisa tu consola y el archivo errors.log" });
});

app.use(errorHandler);

app.listen(PORT,()=>logger.info(`Server running on: http://localhost:${PORT} - Entorno: ${process.env.NODE_ENV}`))
