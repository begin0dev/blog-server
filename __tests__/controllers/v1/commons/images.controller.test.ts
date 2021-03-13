import faker from 'faker';
import { agent } from 'supertest';
import { Express, NextFunction, Request, Response } from 'express';

import Server from '@app/server';

jest.mock('multer', () => () => ({
  any: jest.fn(),
  array() {
    return (req: Request, res: Response, next: NextFunction) => {
      const filename = faker.system.commonFileName('png');
      req.files = [
        {
          filename,
          fieldname: 'images',
          encoding: '7bit',
          mimetype: 'image/png',
          originalname: 'asda',
          size: 12311,
          path: faker.image.imageUrl(),
        },
      ] as Express.Multer.File[];
      return next();
    };
  },
  fields: jest.fn(),
  single: jest.fn(),
  none: jest.fn(),
}));

describe('Test images controller', () => {
  test('/', async () => {
    await agent(Server.application).post('/api/v1/commons/images').expect(200);
  });
});
