const express = require('express');

const { isLoggedIn } = require('middlewares/auth');
const { asyncErrorHelper } = require('lib/helper/errorHelpers');
const User = require('database/models/user');

const router = express.Router();

router.get('/check', (req, res) => {
  const { user } = req;
  if (user) return res.status(200).json({ status: 'success', data: { user } });
  res.status(401).json({ status: 'error', message: 'Unauthorized' });
});

router.delete('/logout', isLoggedIn, asyncErrorHelper(async (req, res) => {
  const {
    user: { _id },
  } = req;

  await User.findByIdAndUpdate(_id, { $unset: { 'oAuth.local': '' } });
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  req.user = null;
  res.status(200).end();
}));

module.exports = router;