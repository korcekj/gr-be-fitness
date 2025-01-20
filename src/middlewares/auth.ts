import { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../utils';
import { USER_ROLE } from '../utils/enums';

export const authHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.user = null;

  const token = req.headers.authorization?.split(' ')[1];
  if (token) res.locals.user = verifyToken(token);

  next();
};

export const verifyAuth = (roles?: (keyof typeof USER_ROLE)[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.user) {
      return res.status(401).json({ data: {}, message: 'Unauthorized' });
    }

    if (roles && !roles.includes(res.locals.user.role)) {
      return res.status(403).json({ data: {}, message: 'Forbidden' });
    }

    return next();
  };
};
