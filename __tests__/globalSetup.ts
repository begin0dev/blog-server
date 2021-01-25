import apiHelper from '../src/lib/helpers/api-helper';

require('dotenv').config({ path: './__tests__/.env.test' });

module.exports = (): null => {
  apiHelper.initJSON();
  return null;
};
