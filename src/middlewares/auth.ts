import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../utils';
import { USER_ROLE } from '../utils/enums';
import { HTTPError } from '../utils/errors';
import { tokenSchema } from '../utils/schemas';

export const authHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.user = null;

  const token = req.headers.authorization?.split(' ')[1];
  if (token) res.locals.user = verifyToken(token, tokenSchema);

  next();
};

export const verifyAuth = (...roles: USER_ROLE[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.user) {
      throw new HTTPError(401, 'Unauthorized');
    }

    if (roles.length && !roles.includes(res.locals.user.role)) {
      throw new HTTPError(403, 'Forbidden');
    }

    return next();
  };
};
