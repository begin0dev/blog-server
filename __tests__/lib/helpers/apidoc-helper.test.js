require('../../test-helper');

const Joi = require('@hapi/joi');
const { createRequest, createResponse } = require('node-mocks-http');

jest.mock('lib/helpers/swagger-handler');
const { setPathParameters } = require('lib/helpers/swagger-handler');
const { apiDoc } = require('lib/helpers/apidoc-helper');

describe('Test apiDoc function', () => {
  let schema;
  let next;
  let res;
  const mockReq = {
    params: {
      id: '35',
    },
    query: {
      type: 'admin',
    },
    body: {
      title: 'test',
      content: '...',
    },
  };

  beforeEach(() => {
    setPathParameters.mockImplementation(() => Promise.resolve());
    schema = {
      params: {
        id: Joi.string().required(),
      },
      query: {
        type: Joi.string().required(),
      },
      body: {
        title: Joi.string().required(),
        content: Joi.string(),
      },
    };

    next = jest.fn();
    res = createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.jsend = jest.fn().mockReturnValue(res);
  });

  test('passing exclude required', async () => {
    const { params, ...args } = mockReq;
    const req = createRequest(args);

    await apiDoc(schema)(req, res, next);

    expect(next.mock.calls.length).toBe(0);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.jsend.mock.calls[0][0].message).toBe('"id" 은 필수 값 입니다.');
  });

  test('passing not match type', async () => {
    const { query, ...args } = mockReq;
    const req = createRequest({ ...args, query: { type: 1 } });

    await apiDoc(schema)(req, res, next);

    expect(next.mock.calls.length).toBe(0);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.jsend.mock.calls[0][0].message).toBe('"type" 은 문자 타입이어야 합니다.');
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
    expect(res.jsend.mock.calls[0][0].message).toBe('"type" 은 필수 값 입니다.');
  });

  test('passing all clear', async () => {
    const req = createRequest(mockReq);

    await apiDoc(schema)(req, res, next);

    expect(next.mock.calls.length).toBe(1);
  });
});
