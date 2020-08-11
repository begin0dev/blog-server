const { setPathParameters } = require('lib/helpers/swagger-handler');

describe('Test setPathParameters function', () => {
  test('swagger json', async () => {

    await setPathParameters({}, {});
  });
});



// file a.js
const fs = require('fs');

const readJSON = async () => {
  await fs.readdirSync('...');
}

const func = async () => {
  try {
    await readJSON();
  } catch (err) {
    console.error(err);
  }
}

module.exports = { func };


// file a.test.js
const fs = require('fs');

jest.mock('fs');
fs.readdirSync.mockResolvedValue(Promise.resolve({}))


