import {
  processRequestBody,
  processRequestParams,
} from 'zod-express-middleware';
import { Router, Request, Response, NextFunction } from 'express';

import { models } from '../db';
import { USER_ROLE } from '../utils/enums';
import { HTTPError } from '../utils/errors';
import { verifyAuth } from '../middlewares/auth';
import { getUserSchema, updateUserSchema } from '../utils/schemas';

const { User } = models;

const router: Router = Router();

export default () => {
  router.get(
    '/',
    verifyAuth(),
    async (_req: Request, res: Response, _next: NextFunction) => {
      const { role } = res.locals.user!;

      const users = await User.findAll({
        attributes:
          role === USER_ROLE.ADMIN
            ? { exclude: ['password'] }
            : ['id', 'nickName'],
      });

      return res.json({
        data: users,
        message: 'List of users',
      });
    }
  );

  router.get(
    '/me',
    verifyAuth(),
    async (_req: Request, res: Response, _next: NextFunction) => {
      const { name, surname, age, nickName } = res.locals.user!;

      return res.json({
        data: { name, surname, age, nickName },
        message: 'User details',
      });
    }
  );

  router.get(
    '/:id',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestParams(getUserSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) throw new HTTPError(404, 'User not found');

      return res.json({
        data: user,
        message: 'User details',
      });
    }
  );

  router.patch(
    '/:id',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestParams(getUserSchema),
    processRequestBody(updateUserSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const body = req.body;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) throw new HTTPError(404, 'User not found');

      await user.update(body);

      return res.json({
        data: user,
        message: 'User successfully updated',
      });
    }
  );

  return router;
};
