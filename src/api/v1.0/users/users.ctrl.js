const express = require('express');

const { isLoggedIn } = require('lib/middlewares/auth');
const User = require('datebase/models/user');

const router = express.Router();

router.get('/check', (req, res) => {
  const { user } = req;
  if (user) return res.status(200).json({ status: 'success', data: { user } });
  return res.status(401).json({ status: 'error', message: 'Unauthorized' });
});

router.use(isLoggedIn);

router.delete('/logout', async (req, res, next) => {
  try {
    const {
      user: { _id },
    } = req;

    await User.findByIdAndUpdate(_id, { $unset: { 'oAuth.local': '' } });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    req.user = null;
    return res.status(200).end();
  } catch (err) {
    return next(err);
  }
});

router.delete('/', (req, res) => {
  return res.status(204).send();
});

module.exports = router;
