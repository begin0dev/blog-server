require('dotenv').config({ path: './__tests__/.env.test' });

global.apiHelper = require('../src/lib/helpers/apiHelper');

module.exports = function () {
  return null;
};
