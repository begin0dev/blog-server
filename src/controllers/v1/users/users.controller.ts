import express from 'express';

import User from '@app/database/models/user';
import { isLoggedIn } from '@app/middlewares/auth';
import { asyncErrorHelper } from '@app/lib/helpers/base-helper';
import { ResponseStatus } from '@app/types/base';
import apiHelper from '@app/lib/helpers/api-helper';

const router = express.Router();

router.get('/check', apiHelper.apiDoc({ summary: '유저 정보 확인 api' }), (req, res) => {
  const { user } = req;
  if (user) return res.status(200).json({ status: ResponseStatus.SUCCESS, data: { user } });
  res.status(401).json({ status: ResponseStatus.FAIL, message: 'Unauthorized' });
});

router.delete(
  '/logout',
  apiHelper.apiDoc({ summary: '유저 로그아웃 api' }),
  isLoggedIn,
  asyncErrorHelper(async (req, res) => {
    const { _id } = req.user;

    await User.findByIdAndUpdate(_id, { $unset: { 'oAuth.local': 1 } });
    req.user = null;
    res.deleteCookie('accessToken');
    res.deleteCookie('refreshToken');
    res.status(204).end();
  }),
);

export default router;
