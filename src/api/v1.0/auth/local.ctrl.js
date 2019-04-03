const express = require('express');
const moment = require('moment');
const Joi = require('joi');

const User = require('datebase/models/user');
const { comparePassword } = require('lib/bcryptHelper');
const { generateAccessToken, generateRefreshToken } = require('lib/token');

const router = express.Router();

router.get('/', (req, res) => {
  const { user } = req;
  if (user) {
    res.status(200).json({ status: 'success', data: { user } });
  } else {
    res.status(401).end();
  }
});

router.post('/register', async (req, res, next) => {
  const { body } = req;
  const {
    email,
    password,
    displayName,
  } = body;

  // check validate user info
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(15).required(),
    displayName: Joi.string().min(3).max(10).required(),
  });
  const validate = Joi.validate(body, schema);
  if (validate.error) return res.status(409).json({ status: 'fail', message: validate.error.details[0].message });

  try {
    // check email
    const emailExists = await User.findByEmail(email);
    if (emailExists) return res.status(409).json({ status: 'fail', message: 'Email is already exists' });

    // create user
    const user = await User.localRegister({
      email,
      displayName,
      password,
    });

    const userJson = user.toJSON();
    // access token and refresh token set cookie
    const accessToken = await generateAccessToken({ user: userJson });
    const refreshToken = await generateRefreshToken();
    await user.updateOne({
      $set: {
        'oAuth.local.refreshToken': refreshToken,
        'oAuth.local.expiredAt': moment().add(12, 'hour'),
      },
    });
    res.set('x-access-token', accessToken);
    res.cookie('refreshToken', refreshToken);
    res.status(201).json({ status: 'success', data: { user: userJson } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { body } = req;
  const { email, password } = body;

  // check validate user info
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(15).required(),
  });
  const validate = Joi.validate(body, schema);
  if (validate.error) return res.status(409).json({ status: 'fail', message: validate.error.details[0].message });

  try {
    // find by username
    const user = await User.findByEmail(email);
    if (!user) return res.status(409).json({ status: 'fail', message: 'user is incorrect!' });

    // find one user compare password
    const result = await comparePassword(password, user.password);
    if (!result) return res.status(409).json({ status: 'fail', message: 'user is incorrect!' });

    const userJson = user.toJSON();
    // access token and refresh token set cookie
    const accessToken = await generateAccessToken({ user: userJson });
    const refreshToken = await generateRefreshToken();
    await user.updateOne({
      $set: {
        'oAuth.local.refreshToken': refreshToken,
        'oAuth.local.expiredAt': moment().add(12, 'hour'),
      },
    });
    res.set('x-access-token', accessToken);
    res.cookie('refreshToken', refreshToken);
    res.status(200).json({ status: 'success', data: { user: userJson } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
