const qs = require('qs');
const url = require('url');
const moment = require('moment');
const express = require('express');

const oAuth = require('lib/oauth');
const User = require('datebase/models/user');
const { generateAccessToken, generateRefreshToken } = require('lib/token');

const router = express.Router();

const socialCallback = async (req, res) => {
  const failureRedirectUrlParser = (referrer, message) => {
    const { query } = url.parse(referrer);
    const queryString = {
      form: 'logIn',
      message,
    };
    return `${referrer}${query ? '&' : '?'}${qs.stringify(queryString)}`;
  };
  const referrer = req.get('Referrer');
  if (res.locals.message) {
    return res.redirect(failureRedirectUrlParser(referrer, res.locals.message));
  }
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
    return res.redirect(referrer);
  } catch (err) {
    console.error(err);
    return res.redirect(failureRedirectUrlParser(referrer, err.message));
  }
};

router.get('/facebook', oAuth.authenticate('facebook', {}), socialCallback);

router.get('/kakao', oAuth.authenticate('kakao', {}), socialCallback);

module.exports = router;
