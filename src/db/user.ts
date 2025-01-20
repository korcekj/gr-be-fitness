/* eslint import/no-cycle: 0 */

import { Sequelize, DataTypes } from 'sequelize';
import { DatabaseModel } from '../types/db';
import { USER_ROLE } from '../utils/enums';

export class UserModel extends DatabaseModel {
  id: number;
  email: string;
  password: string;
  name: string;
  surname: string;
  nickName: string;
  age: number;
  role: USER_ROLE;
}

export default (sequelize: Sequelize) => {
  UserModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(200),
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(200),
      },
      surname: {
        type: DataTypes.STRING(200),
      },
      nickName: {
        type: DataTypes.STRING(200),
      },
      age: {
        type: DataTypes.INTEGER,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLE)),
        defaultValue: USER_ROLE.USER,
      },
    },
    {
      paranoid: true,
      timestamps: true,
      sequelize,
      modelName: 'user',
    }
  );

  return UserModel;
};
