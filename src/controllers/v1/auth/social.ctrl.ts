import qs from 'qs';
import url from 'url';
import moment from 'moment';
import express, { Request, Response } from 'express';

import oAuth from '@app/lib/oauth';
import User from '@app/database/models/user';
import { StrategiesNames } from '@app/lib/oauth/types';
import { generateAccessToken, generateRefreshToken } from '@app/lib/helpers/token-helper';

const router = express.Router();

const redirectUrl = 'http://localhost:3000';

const socialCallback = async (req: Request, res: Response) => {
  const failureRedirect = (message: string) => {
    const { query } = url.parse(redirectUrl);
    const queryString = qs.stringify({ message });
    return res.redirect(`${redirectUrl}${query ? '&' : '?'}${queryString}`);
  };

  if (res.locals.message) return failureRedirect(res.locals.message);

  try {
    const { provider, id, displayName } = res.locals.profile;

    let user = await User.findBySocialId(provider, id);
    if (!user) user = await User.socialRegister({ provider, id, displayName });

    const userJson = user.toJSON();
    // access token and refresh token set cookie
    const accessToken = generateAccessToken({ user: userJson });
    const refreshToken = await generateRefreshToken();
    await User.findByIdAndUpdate(userJson._id, {
      $set: {
        'oAuth.local.refreshToken': refreshToken,
        'oAuth.local.expiredAt': moment().add(12, 'hour'),
      },
    });
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    failureRedirect(err.message);
  }
};

router.get('/facebook', oAuth.authenticate(StrategiesNames.FACEBOOK, { auth_type: 'rerequest' }));
router.get('/facebook/callback', oAuth.authenticate(StrategiesNames.FACEBOOK), socialCallback);

router.get('/kakao', oAuth.authenticate(StrategiesNames.KAKAO));
router.get('/kakao/callback', oAuth.authenticate(StrategiesNames.KAKAO), socialCallback);

export = router;
