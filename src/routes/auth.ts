import { UniqueConstraintError } from 'sequelize';
import { processRequestBody } from 'zod-express-middleware';
import { Router, Request, Response, NextFunction } from 'express';

import { models } from '../db';
import { HTTPError } from '../utils/errors';
import { createToken, verifyPassword } from '../utils/crypto';
import { signUpSchema, signInSchema } from '../utils/schemas';

const router: Router = Router();

const { User } = models;

export default () => {
  router.post(
    '/sign-up',
    processRequestBody(signUpSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const body = req.body;

      try {
        const { id } = await User.create(body);
        const token = createToken({ id });

        return res.json({
          data: { token },
          message: res.__('messages.user.signedUp'),
        });
      } catch (e) {
        if (e instanceof UniqueConstraintError) {
          throw new HTTPError(400, res.__('errors.user.exists'));
        }

        throw e;
      }
    }
  );

  router.post(
    '/sign-in',
    processRequestBody(signInSchema),
    async (req: Request, res: Response, _next: NextFunction) => {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user || !verifyPassword(password, user.password)) {
        throw new HTTPError(400, res.__('errors.user.invalid'));
      }

      const token = createToken({ id: user.id });

      return res.json({
        data: { token },
        message: res.__('messages.user.signedIn'),
      });
    }
  );

  return router;
};
