/* eslint import/no-cycle: 0 */

import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

import defineUser from './user';
import defineProgram from './program';
import defineExercise from './exercise';
import defineCompletion from './completion';

const sequelize: Sequelize = new Sequelize(
  'postgresql://localhost:5432/fitness_app',
  {
    logging: false,
  }
);

sequelize
  .authenticate()
  .catch((e: any) => console.error(`Unable to connect to the database${e}.`));

const modelsBuilder = (instance: Sequelize) => ({
  // Import models to sequelize
  User: instance.import(path.join(__dirname, 'user'), defineUser),
  Program: instance.import(path.join(__dirname, 'program'), defineProgram),
  Exercise: instance.import(path.join(__dirname, 'exercise'), defineExercise),
  Completion: instance.import(
    path.join(__dirname, 'completion'),
    defineCompletion
  ),
});

const models = modelsBuilder(sequelize);

// check if every model is imported
const modelsFiles = fs.readdirSync(__dirname);
// -1 because index.ts can not be counted
if (Object.keys(models).length !== modelsFiles.length - 1) {
  throw new Error('You probably forgot import database model!');
}

Object.values(models).forEach((value: any) => {
  if (value.associate) {
    value.associate(models);
  }
});

export { models, modelsBuilder, sequelize };
