import qs from 'qs';
import url from 'url';
import moment from 'moment';
import express, { Request, Response } from 'express';

import oAuth from '@app/lib/oauth';
import { StrategiesNames } from '@app/lib/oauth/types';
import User from '@app/database/models/user';
import { generateAccessToken, generateRefreshToken } from '@app/lib/helpers/token-helper';

const router = express.Router();

const socialCallback = async (req: Request, res: Response) => {
  const redirectUrl = req.session.redirectUrl || 'http://localhost:3000';
  req.session.redirectUrl = null;

  const failureRedirect = (formName, qsObject) => {
    const { query } = url.parse(redirectUrl);
    const queryString = qs.stringify({ formName, ...qsObject });
    return res.redirect(`${redirectUrl}${query ? '&' : '?'}${queryString}`);
  };

  if (res.locals.message) return failureRedirect('logIn', res.locals.message);

  try {
    const {
      profile: { provider, id, displayName },
    } = res.locals;
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
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    failureRedirect('logIn', err.message);
  }
};

router.use((req, res, next) => {
  if (!req.session.redirectUrl) req.session.redirectUrl = req.get('Referrer') || req.originalUrl;
  next();
});

router.get('/facebook', oAuth.authenticate(StrategiesNames.FACEBOOK, { auth_type: 'rerequest' }));
router.get('/facebook/callback', oAuth.authenticate(StrategiesNames.FACEBOOK), socialCallback);

router.get('/kakao', oAuth.authenticate(StrategiesNames.KAKAO));
router.get('/kakao/callback', oAuth.authenticate(StrategiesNames.KAKAO), socialCallback);

module.exports = router;
