import http from 'http';
import express from 'express';
import 'express-async-errors';
import * as bodyParser from 'body-parser';

import { sequelize } from './db';
import { i18nHandler } from './middlewares/i18n';
import { authHandler } from './middlewares/auth';
import { errorHandler, notFoundHandler } from './middlewares/error';

import AuthRouter from './routes/auth';
import UsersRouter from './routes/users';
import ProgramRouter from './routes/programs';
import ExerciseRouter from './routes/exercises';
import CompletionsRouter from './routes/completions';

const app = express();

app.use(i18nHandler);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(authHandler);

app.use('/auth', AuthRouter());
app.use('/users', UsersRouter());
app.use('/programs', ProgramRouter());
app.use('/exercises', ExerciseRouter());
app.use('/completions', CompletionsRouter());

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = http.createServer(app);

sequelize.sync();

console.log('Sync database', 'postgresql://localhost:5432/fitness_app');

httpServer
  .listen(8000)
  .on('listening', () => console.log(`Server started at port ${8000}`));

export default httpServer;
