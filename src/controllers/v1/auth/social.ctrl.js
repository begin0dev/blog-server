const qs = require('qs');
const url = require('url');
const moment = require('moment');
const express = require('express');

const oAuth = require('lib/oauth');
const User = require('database/models/user');
const { generateAccessToken, generateRefreshToken } = require('lib/helpers/token-helper');

const router = express.Router();

const socialCallback = async (req, res) => {
  const redirectUrl = req.session.redirectUrl || 'http://localhost:3000';
  req.session.redirectUrl = null;

  const failureRedirect = (formName, qsObject) => {
    const { query } = url.parse(redirectUrl);
    const queryString = qs.stringify({ formName, ...qsObject });
    return res.redirect(`${redirectUrl}${query ? '&' : '?'}${queryString}`);
  };

  if (res.locals.message) return failureRedirect('logIn', res.locals.message);
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

router.get('/facebook', oAuth.authenticate('facebook', { auth_type: 'rerequest' }));
router.get('/facebook/callback', oAuth.authenticate('facebook'), socialCallback);

router.get('/kakao', oAuth.authenticate('kakao'));
router.get('/kakao/callback', oAuth.authenticate('kakao'), socialCallback);

module.exports = router;
