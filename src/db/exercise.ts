/* eslint import/no-cycle: 0 */

import { Sequelize, DataTypes } from 'sequelize';

import { ProgramModel } from './program';
import { DatabaseModel } from '../types/db';
import { CompletionModel } from './completion';
import { EXERCISE_DIFFICULTY } from '../utils/enums';

export class ExerciseModel extends DatabaseModel {
  id: number;
  difficulty: EXERCISE_DIFFICULTY;
  name: String;

  program: ProgramModel;
  completions: CompletionModel[];
}

export default (sequelize: Sequelize) => {
  ExerciseModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      difficulty: {
        type: DataTypes.ENUM(...Object.values(EXERCISE_DIFFICULTY)),
      },
      name: {
        type: DataTypes.STRING(200),
      },
    },
    {
      paranoid: true,
      timestamps: true,
      sequelize,
      modelName: 'exercise',
    }
  );

  ExerciseModel.associate = (models) => {
    (ExerciseModel as any).belongsTo(models.Program, {
      foreignKey: {
        name: 'programID',
        allowNull: false,
      },
    });

    (ExerciseModel as any).hasMany(models.Completion, {
      foreignKey: {
        name: 'exerciseID',
        allowNull: false,
      },
      as: 'completions',
    });
  };

  return ExerciseModel;
};
