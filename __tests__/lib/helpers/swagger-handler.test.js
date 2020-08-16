jest.mock('fs');
const fs = require('fs');
const Joi = require('@hapi/joi');
const { createRequest } = require('node-mocks-http');

const { setPathParameters } = require('lib/helpers/swagger-handler');

describe('Test setPathParameters function', () => {
  test('swagger json', async () => {
    const bufferJson = Buffer.from(
      JSON.stringify({
        paths: {},
      }),
    );
    fs.readFileSync.mockResolvedValue(bufferJson);
    const writeMock = jest.fn((x, y) => y);
    fs.writeFileSync.mockImplementation(writeMock);

    const req = createRequest({
      method: 'PUT',
      baseUrl: '/api/v1/users',
      route: { path: '/:id' },
    });

    await setPathParameters(req, {
      summary: 'test 용',
      params: { id: Joi.string().required().description('테스트용 아이디') },
      query: { type: Joi.string().valid('admin', 'member').required().description('유저 타입') },
      body: { image: Joi.binary() },
    });

    console.log(writeMock.mock.results[0].value);
    const swaggerJson = JSON.parse(writeMock.mock.results[0].value);
    expect(swaggerJson.paths['/api/v1/users/{id}']).not.toBeNull();
    expect(swaggerJson.paths['/api/v1/users/{id}'].put).not.toBeNull();
  });
});
