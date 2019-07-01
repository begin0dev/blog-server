const moment = require('moment');

const User = require('datebase/models/user');
const { decodeAccessToken, generateAccessToken } = require('lib/token');

exports.checkAccessToken = async (req, res, next) => {
  // clear user
  req.user = null;
  let accessToken = req.get('authorization');
  if (!accessToken) ({ accessToken } = req.cookies);
  if (!accessToken) {
    return next();
  }

  try {
    if (accessToken.startsWith('Bearer ')) accessToken = accessToken.slice(7, accessToken.length);
    const decoded = await decodeAccessToken(accessToken);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.clearCookie('accessToken');
    next();
  }
};

exports.checkRefreshToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next();
  }

  try {
    const user = await User.findByLocalRefreshToken(refreshToken);
    if (!user) {
      res.clearCookie('refreshToken');
      return next();
    }

    const { expiredAt } = user.oAuth.local;
    if (moment() > moment(expiredAt)) {
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
    res.cookie('accessToken', accessToken);

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
    res.clearCookie('refreshToken');
    next();
  }
};
