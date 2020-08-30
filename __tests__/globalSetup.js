const { initSwaggerJson } = require('../src/lib/helpers/swagger-handler');

module.exports = async function () {
  await initSwaggerJson();
  return null;
};
