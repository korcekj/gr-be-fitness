import {
  processRequestBody,
  processRequestParams,
} from 'zod-express-middleware';
import { ForeignKeyConstraintError } from 'sequelize';
import { Router, Request, Response, NextFunction } from 'express';

import { models } from '../db';
import { HTTPError } from '../utils/errors';
import { verifyAuth } from '../middlewares/auth';
import { getModelSchema, createCompletionSchema } from '../utils/schemas';

const router: Router = Router();

const { Completion } = models;

export default () => {
  router.post(
    '/',
    verifyAuth(),
    processRequestBody(createCompletionSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id: userID } = res.locals.user!;

      try {
        const completion = await Completion.create({
          ...req.body,
          userID,
        });

        return res.json({
          data: completion,
          message: res.__('messages.completion.created'),
        });
      } catch (e) {
        if (e instanceof ForeignKeyConstraintError) {
          throw new HTTPError(400, res.__('errors.exercise.notFound'));
        }

        throw e;
      }
    }
  );

  router.delete(
    '/:id',
    verifyAuth(),
    processRequestParams(getModelSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { id: userID } = res.locals.user!;

      const completion = await Completion.findOne({
        where: { id, userID },
      });
      if (!completion) {
        throw new HTTPError(404, res.__('errors.completion.notFound'));
      }

      await completion.destroy();

      return res.json({
        message: res.__('messages.completion.deleted'),
      });
    }
  );

  return router;
};
