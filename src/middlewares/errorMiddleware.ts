import type { NextFunction, Request, Response } from 'express';
import { RestError } from 'utils/restError';

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' }).end();
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof RestError) {
    res
      .status(err.status)
      .json({
        error: err.message,
        details: err.details,
      })
      .end();
  } else {
    res.status(500).json({ error: err.message }).end();
  }
}
