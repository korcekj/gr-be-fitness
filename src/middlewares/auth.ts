import { NextFunction, Request, Response } from 'express';

import { models } from '../db';
import { USER_ROLE } from '../utils/enums';
import { HTTPError } from '../utils/errors';
import { verifyToken } from '../utils/crypto';
import { tokenSchema } from '../utils/schemas';

const { User } = models;

export const authHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.user = null;

  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const payload = verifyToken(token, tokenSchema);
    res.locals.user = await User.findByPk(payload?.id);
  }

  next();
};

export const verifyAuth = (...roles: USER_ROLE[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.user) {
      throw new HTTPError(401, res.__('errors.user.unauthorized'));
    }

    const role = res.locals.user.role;
    if (roles.length && !Object.values(roles).includes(role)) {
      throw new HTTPError(403, res.__('errors.user.forbidden'));
    }

    return next();
  };
};
