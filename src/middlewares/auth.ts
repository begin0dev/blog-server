import { Request, Response, NextFunction } from 'express';

import { Status } from '@app/types/base';

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) return next();
  res.status(401).json({ status: Status.ERROR, message: '로그인이 필요합니다.' });
};

export const isNotLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next();
  res.status(401).json({ status: Status.ERROR, message: '로그인 된 사용자는 접근할 수 없습니다.' });
};
