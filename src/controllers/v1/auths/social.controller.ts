import qs from 'qs';
import url from 'url';
import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { Router } from 'express-swagger-validator';

import oAuth from '@app/lib/oauth';
import User, { UserJson } from '@app/database/models/user';
import { StrategiesNames } from '@app/lib/oauth/types';
import { generateAccessToken, generateRefreshToken } from '@app/lib/helpers/token-helper';

const { CLIENT_URI: redirectUrl } = process.env;

const router = Router();

const socialCallback = async (req: Request, res: Response) => {
  const failureRedirect = (message: string) => {
    const { query } = url.parse(redirectUrl);
    const queryString = qs.stringify({ message });
    return res.redirect(`${redirectUrl}${query ? '&' : '?'}${queryString}`);
  };

  if (res.locals.message) return failureRedirect(res.locals.message);

  try {
    const { provider, id } = res.locals.profile;

    let user = await User.findBySocialId(provider, id);
    if (!user) user = await User.socialRegister(res.locals.profile);

    const userJson = user.toJSON() as UserJson;
    // access token and refresh token set cookie
    const accessToken = generateAccessToken({ user: userJson });
    const refreshToken = await generateRefreshToken();
    await User.findByIdAndUpdate(userJson._id, {
      $set: { 'oAuth.local.refreshToken': refreshToken, 'oAuth.local.expiredAt': dayjs().add(12, 'hour') },
    });
    res.setCookie('accessToken', accessToken);
    res.setCookie('refreshToken', refreshToken);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    failureRedirect(err.message);
  }
};

router.get(
  '/facebook',
  { summary: '폐이스북 소셜 로그인', tags: ['social'] },
  oAuth.authenticate(StrategiesNames.FACEBOOK, { auth_type: 'rerequest' }),
);
router.get(
  '/facebook/callback',
  { summary: '폐이스북 소셜 로그인 콜백', tags: ['social'] },
  oAuth.authenticate(StrategiesNames.FACEBOOK),
  socialCallback,
);

router.get(
  '/kakao',
  { summary: '카카오 소셜 로그인', tags: ['social'] },
  oAuth.authenticate(StrategiesNames.KAKAO, { auth_type: 'reauthenticate' }),
);
router.get(
  '/kakao/callback',
  { summary: '카카오 소셜 로그인 콜백', tags: ['social'] },
  oAuth.authenticate(StrategiesNames.KAKAO),
  socialCallback,
);

export default router;
