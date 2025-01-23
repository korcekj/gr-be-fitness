/* eslint import/no-cycle: 0 */

import { Sequelize, DataTypes } from 'sequelize';

import { UserModel } from './user';
import { ExerciseModel } from './exercise';
import { DatabaseModel } from '../types/db';

export class CompletionModel extends DatabaseModel {
  id: number;
  duration: number;
  completedAt: Date;

  user: UserModel;
  exercise: ExerciseModel;
}

export default (sequelize: Sequelize) => {
  CompletionModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      paranoid: true,
      timestamps: true,
      sequelize,
      modelName: 'completion',
    }
  );

  CompletionModel.associate = (models) => {
    (CompletionModel as any).belongsTo(models.Exercise, {
      foreignKey: {
        name: 'exerciseID',
        allowNull: false,
      },
    });

    (CompletionModel as any).belongsTo(models.User, {
      foreignKey: {
        name: 'userID',
        allowNull: false,
      },
    });
  };

  return CompletionModel;
};
