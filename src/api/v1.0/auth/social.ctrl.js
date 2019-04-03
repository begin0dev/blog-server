const express = require('express');
const moment = require('moment');

const oAuth = require('lib/oauth');
const User = require('datebase/models/user');
const { generateAccessToken, generateRefreshToken } = require('lib/token');

const router = express.Router();

const socialCallback = async (req, res) => {
  try {
    const { user: userJson } = req;
    // access token and refresh token set cookie
    const accessToken = await generateAccessToken({ user: userJson });
    const refreshToken = await generateRefreshToken();
    await User.findByIdAndUpdate(userJson._id, {
      $set: {
        'oAuth.local.refreshToken': refreshToken,
        'oAuth.local.expiredAt': moment().add(12, 'hour'),
      },
    });
    res.set('x-access-token', accessToken);
    res.cookie('refreshToken', refreshToken);
    res.redirect('');
  } catch (err) {
    req.flash('message', '소셜 로그인에 실패하였습니다. 다시 시도해주세요.');
    res.redirect('');
  }
};

router.get('/facebook', oAuth.authenticate('facebook', {}), socialCallback);

router.get('/kakao', oAuth.authenticate('kakao', {}), socialCallback);

module.exports = router;
