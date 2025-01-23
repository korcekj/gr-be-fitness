import {
  TypedRequestQuery,
  processRequestBody,
  processRequestQuery,
  processRequestParams,
} from 'zod-express-middleware';
import { ForeignKeyConstraintError, Op } from 'sequelize';
import { Router, Request, Response, NextFunction } from 'express';

import {
  getModelSchema,
  getExercisesSchema,
  createExerciseSchema,
  updateExerciseSchema,
  createCompletionSchema,
} from '../utils/schemas';
import { models } from '../db';
import { USER_ROLE } from '../utils/enums';
import { HTTPError } from '../utils/errors';
import { verifyAuth } from '../middlewares/auth';

const router: Router = Router();

const { Exercise, Program, Completion } = models;

export default () => {
  router.get(
    '/',
    processRequestQuery(getExercisesSchema),
    async (
      req: TypedRequestQuery<typeof getExercisesSchema>,
      res: Response,
      _next: NextFunction
    ) => {
      const { page, limit, programID, search } = req.query;

      const where = {
        ...(programID && { programID }),
        ...(search && { name: { [Op.iLike]: `%${search}%` } }),
      };

      const exercises = await Exercise.findAll({
        where,
        limit,
        offset: page ? (page - 1) * limit! : undefined,
        include: [
          {
            model: Program,
            as: 'program',
          },
        ],
      });

      return res.json({
        data: exercises,
        message: res.__('messages.exercise.list'),
      });
    }
  );

  router.post(
    '/',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestBody(createExerciseSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const body = req.body;

      try {
        const exercise = await Exercise.create(body);

        return res.json({
          data: exercise,
          message: res.__('messages.exercise.created'),
        });
      } catch (e) {
        if (e instanceof ForeignKeyConstraintError) {
          throw new HTTPError(404, res.__('errors.program.notFound'));
        }

        throw e;
      }
    }
  );

  router.patch(
    '/:id',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestParams(getModelSchema),
    processRequestBody(updateExerciseSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const body = req.body;
      const { id } = req.params;

      const exercise = await Exercise.findByPk(id);
      if (!exercise) {
        throw new HTTPError(404, res.__('errors.exercise.notFound'));
      }

      try {
        await exercise.update(body);
      } catch (e) {
        if (e instanceof ForeignKeyConstraintError) {
          throw new HTTPError(404, res.__('errors.program.notFound'));
        }

        throw e;
      }

      return res.json({
        data: exercise,
        message: res.__('messages.exercise.updated'),
      });
    }
  );

  router.delete(
    '/:id',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestParams(getModelSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;

      const exercise = await Exercise.findByPk(id);
      if (!exercise) {
        throw new HTTPError(404, res.__('errors.exercise.notFound'));
      }

      await exercise.destroy();

      return res.json({
        message: res.__('messages.exercise.deleted'),
      });
    }
  );

  router.post(
    '/:id/completions',
    verifyAuth(),
    processRequestParams(getModelSchema),
    processRequestBody(createCompletionSchema.omit({ exerciseID: true })),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { id: userID } = res.locals.user!;

      try {
        const completion = await Completion.create({
          ...req.body,
          userID,
          exerciseID: id,
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

  return router;
};
