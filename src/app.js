import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';

import errorHandler from './middlewares/errors/index.js';
import { addLogger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT||8080;
const connection = mongoose.connect(`mongodb+srv://luciarodg28_db_user:Ot5pGWtzrf6qNlvz@clusterpets.gzw2m2a.mongodb.net/?appName=ClusterPETS`)

app.use(express.json());
app.use(cookieParser());
app.use(addLogger);

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);

app.use(errorHandler);

app.listen(PORT,()=>console.log(`Server running on: http://localhost:${PORT}`))
