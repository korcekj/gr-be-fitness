import { NextFunction, Request, Response } from 'express';

import { HTTPError } from '../utils/errors';

export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  throw new HTTPError(404, res.__('errors.server.notFound'));
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof HTTPError) {
    return res.status(err.status).send({ data: {}, message: err.message });
  }

  console.error(err);
  res.status(500).send({ data: {}, message: res.__('errors.server.internal') });
};
