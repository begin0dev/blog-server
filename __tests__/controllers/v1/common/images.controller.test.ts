import { agent } from 'supertest';
import { NextFunction } from 'express';
import faker from 'faker';

import Server from '@app/server';

interface MulterFile {
  filename: string;
  fieldname: string;
  encoding: string;
  mimetype: string;
  originalname: string;
  size: number;
  path: string;
}

interface MulterRequest extends Request {
  files: MulterFile[];
}

jest.mock('multer', () => () => ({
  any: jest.fn(),
  array() {
    return (req: MulterRequest, res: Response, next: NextFunction) => {
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
      ];
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
