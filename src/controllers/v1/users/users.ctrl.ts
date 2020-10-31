import express from 'express';

import User from '@app/database/models/user';
import { isLoggedIn } from '@app/middlewares/auth';
import { apiDoc } from '@app/lib/helpers/apidoc-helper';
import { asyncErrorHelper } from '@app/lib/helpers/base-helper';
import { Status } from '@app/types/base';

const router = express.Router();

router.get('/check', apiDoc({ summary: '유저 정보 확인 api' }), (req, res) => {
  const { user } = req;
  if (user) return res.status(200).json({ status: Status.SUCCESS, data: { user } });
  res.status(401).json({ status: Status.FAIL, message: 'Unauthorized' });
});

router.delete(
  '/logout',
  apiDoc({ summary: '유저 로그아웃 api' }),
  isLoggedIn,
  asyncErrorHelper(async (req, res) => {
    const {
      user: { _id },
    } = req;

    await User.findByIdAndUpdate(_id, { $unset: { 'oAuth.local': 1 } });
    req.user = null;
    const cookieOptions = { sameSite: 'none', secure: true, httpOnly: true }
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.status(204).end();
  }),
);

export default router;
