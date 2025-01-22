import { Op } from 'sequelize';
import { processRequestParams } from 'zod-express-middleware';
import { Router, Request, Response, NextFunction } from 'express';

import { models } from '../db';
import { USER_ROLE } from '../utils/enums';
import { HTTPError } from '../utils/errors';
import { verifyAuth } from '../middlewares/auth';
import { updateProgramExerciseSchema } from '../utils/schemas';

const router: Router = Router();

const { Program, Exercise } = models;

export default () => {
  router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
    const programs = await Program.findAll();

    return res.json({
      data: programs,
      message: res.__('messages.program.list'),
    });
  });

  router.patch(
    '/:programID/exercises/:exerciseID',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestParams(updateProgramExerciseSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { programID, exerciseID } = req.params;

      const program = await Program.findByPk(programID, {
        include: [{ model: Exercise, as: 'translations' }],
      });
      if (!program) {
        throw new HTTPError(404, res.__('errors.program.notFound'));
      }

      const exercise = await Exercise.findByPk(exerciseID);
      if (!exercise) {
        throw new HTTPError(404, res.__('errors.exercise.notFound'));
      }

      await exercise.update({ programID });
      await program.reload();

      return res.json({
        data: program,
        message: res.__('messages.program.updated'),
      });
    }
  );

  router.delete(
    '/:programID/exercises/:exerciseID',
    verifyAuth(USER_ROLE.ADMIN),
    processRequestParams(updateProgramExerciseSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { programID, exerciseID } = req.params;

      const program = await Program.findByPk(programID, {
        include: [{ model: Exercise, as: 'translations' }],
      });
      if (!program) {
        throw new HTTPError(404, res.__('errors.program.notFound'));
      }

      const nextProgram = await Program.findOne({
        where: { id: { [Op.not]: programID } },
      });
      if (!nextProgram) {
        throw new HTTPError(404, res.__('errors.program.single'));
      }

      const exercise = await Exercise.findByPk(exerciseID);
      if (!exercise) {
        throw new HTTPError(404, res.__('errors.exercise.notFound'));
      }

      await exercise.update({ programID: nextProgram.id });
      await program.reload();

      return res.json({
        data: program,
        message: res.__('messages.program.updated'),
      });
    }
  );

  return router;
};
