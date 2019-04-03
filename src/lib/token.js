const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;
const refreshTokenSize = 24;

exports.generateAccessToken = (payload, expiresIn = '1h') => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await jwt.sign(
        payload,
        JWT_SECRET,
        { issuer: 'beginner', expiresIn },
      );
      resolve(token);
    } catch (err) {
      reject(err);
    }
  });
};

exports.decodeAccessToken = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const decoded = await jwt.verify(token, JWT_SECRET);
      resolve(decoded);
    } catch (err) {
      reject(err.name);
    }
  });
};

exports.generateRefreshToken = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await crypto.randomBytes(refreshTokenSize).toString('hex');
      resolve(token);
    } catch (err) {
      reject(err);
    }
  });
};
