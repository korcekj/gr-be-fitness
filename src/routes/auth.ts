import { UniqueConstraintError } from 'sequelize';
import { processRequest } from 'zod-express-middleware';
import { Router, Request, Response, NextFunction } from 'express';

import { models } from '../db';
import { signUpSchema } from '../utils/schemas';

const router: Router = Router();

const { User } = models;

export default () => {
  router.post(
    '/sign-up',
    processRequest({
      body: signUpSchema,
    }),
    async (req: Request, res: Response, _next: NextFunction) => {
      const user = req.body;

      try {
        await User.create(user);

        return res.json({
          message: 'User created successfully',
        });
      } catch (e) {
        if (e instanceof UniqueConstraintError) {
          return res.status(400).json({
            data: {},
            message: 'User already exists',
          });
        }

        throw e;
      }
    }
  );

  return router;
};
