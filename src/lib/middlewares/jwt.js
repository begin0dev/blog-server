const moment = require('moment');

const User = require('datebase/models/user');
const { decodeAccessToken, generateAccessToken } = require('lib/token');

exports.checkedAccessToken = async (req, res, next) => {
  let accessToken = req.get('x-access-token') || req.get('authorization');
  if (!accessToken) {
    req.user = null;
    return next();
  }
  if (accessToken.startsWith('Bearer ')) accessToken = accessToken.slice(7, accessToken.length);

  try {
    const decoded = await decodeAccessToken(accessToken);
    req.user = decoded.user;
    next();
  } catch (err) {
    req.user = null;
    res.set('x-access-token', null);
    next();
  }
};

exports.checkedRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    req.user = null;
    return next();
  }

  try {
    const user = await User.findByLocalRefreshToken(refreshToken);
    if (!user) {
      req.user = null;
      res.clearCookie('refreshToken');
      return next();
    }

    const { expiredAt } = user.oAuth.local;
    if (moment() > moment(expiredAt)) {
      req.user = null;
      res.clearCookie('refreshToken');
      await user.updateOne({
        $set: {
          'oAuth.local.refreshToken': null,
          'oAuth.local.expiredAt': null,
        },
      });
      return next();
    }

    req.user = user.toJSON();
    const accessToken = await generateAccessToken({ user: req.user });
    res.set('x-access-token', accessToken);

    // extended your refresh token so they do not expire while using your site
    if (moment(expiredAt).diff(moment(), 'minute') <= 5) {
      await user.updateOne({
        $set: {
          'oAuth.local.expiredAt': moment().add(1, 'hour'),
        },
      });
    }
    next();
  } catch (err) {
    console.error(err);
    req.user = null;
    res.clearCookie('refreshToken');
    next();
  }
};
