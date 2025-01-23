import {
  processRequestBody,
  processRequestParams,
} from 'zod-express-middleware';
import { Router, Request, Response, NextFunction } from 'express';

import { models } from '../db';
import { USER_ROLE } from '../utils/enums';
import { HTTPError } from '../utils/errors';
import { verifyAuth } from '../middlewares/auth';
import { getModelSchema, updateUserSchema } from '../utils/schemas';

const { User, Completion, Exercise } = models;

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
        message: res.__('messages.user.list'),
      });
    }
  );

  router.get(
    '/me',
    verifyAuth(),
    async (_req: Request, res: Response, _next: NextFunction) => {
      const { id } = res.locals.user!;

      const user = await User.findByPk(id, {
        attributes: ['name', 'surname', 'age', 'nickName'],
        include: [
          {
            model: Completion,
            as: 'completions',
            include: [
              {
                model: Exercise,
                attributes: ['id', 'name', 'difficulty'],
              },
            ],
            attributes: ['id', 'duration', 'completedAt'],
          },
        ],
      });

      return res.json({
        data: user,
        message: res.__('messages.user.details'),
      });
    }
  );

  router.get(
    '/:id',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestParams(getModelSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) throw new HTTPError(404, res.__('errors.user.notFound'));

      return res.json({
        data: user,
        message: res.__('messages.user.details'),
      });
    }
  );

  router.patch(
    '/:id',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestParams(getModelSchema),
    processRequestBody(updateUserSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const body = req.body;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) throw new HTTPError(404, res.__('errors.user.notFound'));

      await user.update(body);

      return res.json({
        data: user,
        message: res.__('messages.user.updated'),
      });
    }
  );

  return router;
};
