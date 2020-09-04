const { writeJSON } = require('../src/lib/helpers/swagger-handler');

const { description, name: title, version } = require('../package.json');

module.exports = async function () {
  // initialize swagger base
  await writeJSON({
    openapi: '3.0.0',
    info: {
      title,
      version,
      description,
    },
    host: 'localhost:3001',
    schemes: ['https', 'http'],
    paths: {},
    definitions: {},
  });

  return null;
};
