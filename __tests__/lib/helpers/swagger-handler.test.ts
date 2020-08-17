import fs from 'fs';
import Joi from 'joi';
import { createRequest } from 'node-mocks-http';

const { setPathParameters } = require('lib/helpers/swagger-handler');

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Test setPathParameters function', () => {
  test('swagger json', async () => {
    const bufferJson = Buffer.from(JSON.stringify({ paths: {} }));
    mockFs.readFileSync.mockImplementation(() => bufferJson);
    const writeMock = jest.fn((x, y) => y);
    mockFs.writeFileSync.mockImplementation(writeMock);

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

    const swaggerJson = JSON.parse(writeMock.mock.results[0].value);
    expect(swaggerJson.paths['/api/v1/users/{id}']).not.toBeNull();
    expect(swaggerJson.paths['/api/v1/users/{id}'].put).not.toBeNull();
    expect(swaggerJson.paths['/api/v1/users/{id}'].put.parameters.length).toBe(3);
  });
});
