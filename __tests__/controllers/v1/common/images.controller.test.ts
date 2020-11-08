import { agent } from 'supertest';
import { NextFunction, Express } from 'express';

import Server from '@app/server';

interface MulterRequest extends Request {
  files: Express.Multer.File[];
}

jest.mock('multer', () => () => ({
  any: jest.fn(),
  array() {
    return (req: MulterRequest, res: Response, next: NextFunction) => {
      req.files = [];
      return next();
    };
  },
  fields: jest.fn(),
  single: jest.fn(),
  none: jest.fn(),
}));

describe('Test images controller', () => {
  test('/', async () => {
    await agent(Server.application).post('/api/v1/common/images').expect(200);
  });
});
