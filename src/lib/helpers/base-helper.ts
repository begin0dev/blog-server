import { Request, Response, NextFunction } from 'express';

export const asyncErrorHelper = (func: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise.resolve(func(req, res, next)).catch(next);
