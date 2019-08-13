const qs = require('qs');
const url = require('url');
const moment = require('moment');
const express = require('express');

const oAuth = require('lib/oauth');
const User = require('datebase/models/user');
const { generateAccessToken, generateRefreshToken } = require('lib/token');

const router = express.Router();

const socialCallback = async (req, res) => {
  const failureRedirectUrlParser = (redirectUrl, message) => {
    const { query } = url.parse(redirectUrl);
    const queryString = qs.stringify({
      form: 'logIn',
      message,
    });
    return `${redirectUrl}${query ? '&' : '?'}${queryString}`;
  };
  const redirectUrl = req.session.redirectUrl || 'http://localhost:3000';
  req.session.redirectUrl = null;
  if (res.locals.message) return res.redirect(failureRedirectUrlParser(redirectUrl, res.locals.message));
  try {
    const { user: userJson } = req;
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
    return res.redirect(failureRedirectUrlParser(redirectUrl, err.message));
  }
};

router.use((req, res, next) => {
  if (req.session && !req.session.redirectUrl) req.session.redirectUrl = req.get('Referrer') || req.originalUrl;
  return next();
});

router.get('/facebook', oAuth.authenticate('facebook', { auth_type: 'rerequest' }));
router.get('/facebook/callback', oAuth.authenticate('facebook'), socialCallback);

router.get('/kakao', oAuth.authenticate('kakao'));
router.get('/kakao/callback', oAuth.authenticate('kakao'), socialCallback);

module.exports = router;
