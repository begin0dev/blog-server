import dotenv from 'dotenv';

module.exports = (): null => {
  dotenv.config({ path: './__tests__/.env.test' });
  return null;
};
