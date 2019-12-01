const moment = require('moment');

const User = require('database/models/user');
const { decodeAccessToken, generateAccessToken } = require('lib/token');

exports.checkAccessToken = (req, res, next) => {
  // clear user
  req.user = null;
  let accessToken = req.get('authorization') || req.cookies.accessToken;
  if (!accessToken) return next();
  if (accessToken.startsWith('Bearer ')) accessToken = accessToken.slice(7, accessToken.length);

  try {
    const decoded = decodeAccessToken(accessToken);
    req.user = decoded.user;
    return next();
  } catch (err) {
    res.clearCookie('accessToken');
    return next();
  }
};

exports.checkRefreshToken = async (req, res, next) => {
  if (req.user) return next();
  const { refreshToken } = req.cookies;
  if (!refreshToken) return next();

  try {
    const user = await User.findByLocalRefreshToken(refreshToken);
    if (!user) {
      res.clearCookie('refreshToken');
      return next();
    }

    const { expiredAt } = user.oAuth.local;
    if (moment() > moment(expiredAt)) {
      await user.updateOne({ $unset: { 'oAuth.local': '' } });
      res.clearCookie('refreshToken');
      return next();
    }

    req.user = user.toJSON();
    const accessToken = generateAccessToken({ user: req.user });
    res.cookie('accessToken', accessToken);

    // extended your refresh token so they do not expire while using your site
    if (moment(expiredAt).diff(moment(), 'minute') <= 5) {
      await user.updateOne({
        $set: { 'oAuth.local.expiredAt': moment().add(1, 'hour') },
      });
    }
    return next();
  } catch (err) {
    res.clearCookie('refreshToken');
    return next(err);
  }
};
