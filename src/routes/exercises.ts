import { Op } from 'sequelize';
import { Router, Request, Response, NextFunction } from 'express';
import { processRequestQuery, TypedRequestQuery } from 'zod-express-middleware';

import { models } from '../db';
import { getExercisesSchema } from '../utils/schemas';

const router: Router = Router();

const { Exercise, Program } = models;

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

  return router;
};
