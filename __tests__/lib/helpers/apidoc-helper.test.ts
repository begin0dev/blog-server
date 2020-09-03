import Joi from 'joi';
import { Response } from 'express';
import { createRequest, createResponse } from 'node-mocks-http';

import { apiDoc } from '@app/lib/helpers/apidoc-helper';
import * as swaggerHandler from '@app/lib/helpers/swagger-handler';

interface MockResponse extends Response {
  status: jest.Mock;
  json: jest.Mock;
}

describe('Test apiDoc function', () => {
  const mockReq = {
    params: { id: '35' },
    query: { type: 'admin' },
    body: {
      title: 'test',
      content: '...',
    },
  };
  const schema = {
    summary: 'test',
    params: { id: Joi.string().required() },
    query: { type: Joi.string().required() },
    body: {
      title: Joi.string().required(),
      content: Joi.string(),
    },
  };
  const res = createResponse<MockResponse>();
  let next: jest.Mock;

  beforeEach(() => {
    jest.spyOn(swaggerHandler, 'setPathParameters').mockImplementation(jest.fn());

    next = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
  });

  test('passing exclude required', async () => {
    const { params, ...args } = mockReq;
    const req = createRequest(args);

    await apiDoc(schema)(req, res, next);

    expect(next.mock.calls.length).toBe(0);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe('"id" 은 필수 값 입니다.');
  });

  test('passing not match type', async () => {
    const { query, ...args } = mockReq;
    const req = createRequest({ ...args, query: { type: 1 } });

    await apiDoc(schema)(req, res, next);

    expect(next.mock.calls.length).toBe(0);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe('"type" 은 문자 타입이어야 합니다.');
  });

  test('passing not match position', async () => {
    const { params, query, body } = mockReq;
    const req = createRequest({
      body,
      params: { ...params, ...query },
    });

    await apiDoc(schema)(req, res, next);

    expect(next.mock.calls.length).toBe(0);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe('"type" 은 필수 값 입니다.');
  });

  test('passing all clear', async () => {
    const req = createRequest(mockReq);

    await apiDoc(schema)(req, res, next);

    expect(next.mock.calls.length).toBe(1);
  });
});
