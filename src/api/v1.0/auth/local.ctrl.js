const express = require('express');
const moment = require('moment');
const Joi = require('@hapi/joi');

const User = require('datebase/models/user');
const { comparePassword } = require('lib/bcryptHelper');
const { generateAccessToken, generateRefreshToken } = require('lib/token');

const router = express.Router();

router.post('/register', async ({ body }, res, next) => {
  const { email, password, displayName } = body;

  // check validate user info
  const schema = Joi.object().keys({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .max(15)
      .required(),
    passwordConfirm: Joi.string()
      .valid(Joi.ref('password'))
      .required(),
    displayName: Joi.string()
      .min(3)
      .max(10)
      .required(),
  });
  const { error } = Joi.validate(body, schema);
  if (error) return res.status(409).json({ status: 'fail', message: error.details[0].message });

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
    const accessToken = generateAccessToken({ user: userJson });
    const refreshToken = await generateRefreshToken();
    await user.updateOne({
      $set: {
        'oAuth.local.refreshToken': refreshToken,
        'oAuth.local.expiredAt': moment().add(12, 'hour'),
      },
    });
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);
    return res.status(201).json({ status: 'success', data: null });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async ({ body }, res, next) => {
  const { email, password } = body;

  // check validate user info
  const schema = Joi.object().keys({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .max(15)
      .required(),
  });
  const { error } = Joi.validate(body, schema);
  if (error) return res.status(409).json({ status: 'fail', message: error.details[0].message });

  try {
    // find by username
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ status: 'error', message: '로그인에 실패하였습니다.' });

    // find one user compare password
    const result = await comparePassword(password, user.password);
    if (!result) return res.status(401).json({ status: 'error', message: '로그인에 실패하였습니다.' });

    const userJson = user.toJSON();
    // access token and refresh token set cookie
    const accessToken = generateAccessToken({ user: userJson });
    const refreshToken = await generateRefreshToken();
    await user.updateOne({
      $set: {
        'oAuth.local.refreshToken': refreshToken,
        'oAuth.local.expiredAt': moment().add(12, 'hour'),
      },
    });
    res.cookie('accessToken', accessToken);
    res.cookie('refreshToken', refreshToken);
    return res.status(200).json({ status: 'success', data: null });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
