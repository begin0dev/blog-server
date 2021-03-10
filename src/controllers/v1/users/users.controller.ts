import { Request, Response } from 'express';
import { Router } from 'express-swagger-validator';

import User from '@app/database/models/user';
import { isLoggedIn } from '@app/middlewares/auth';
import { ResponseStatus } from '@app/types/base';

const router = Router();

router.get('/check', { summary: '유저 정보 확인 api', tags: ['users'] }, (req: Request, res: Response) => {
  const { user } = req;
  if (user) return res.status(200).json({ status: ResponseStatus.SUCCESS, data: { user } });
  res.status(401).json({ status: ResponseStatus.FAIL, message: 'Unauthorized' });
});

router.delete(
  '/logout',
  { summary: '유저 로그아웃 api', tags: ['users'] },
  isLoggedIn,
  async (req: Request, res: Response) => {
    const { _id } = req.user;

    await User.findByIdAndUpdate(_id, { $unset: { 'oAuth.local': 1 } });
    req.user = null;
    res.deleteCookie('accessToken');
    res.deleteCookie('refreshToken');
    res.status(204).end();
  },
);

export default router;
