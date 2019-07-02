const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;
const refreshTokenSize = 24;

exports.generateAccessToken = (payload, expiresIn = '1h') =>
  jwt.sign(payload, JWT_SECRET, { issuer: 'beginner', expiresIn });

exports.decodeAccessToken = token => jwt.verify(token, JWT_SECRET);

exports.generateRefreshToken = () => crypto.randomBytes(refreshTokenSize).toString('hex');
