const Joi = require('@hapi/joi');

const errorTypeTextMap = (err) => {
  if (!err.details) return err.message;
  const types = {
    'any.required': (context) => `"${context.label}" 은 필수 값 입니다.`,
    'string.base': (context) => `"${context.label}" 은 문자 타입이어야 합니다.`,
    'number.base': (context) => `"${context.label}" 은 숫자 타입이어야 합니다.`,
  };
  const error = err.details[0];
  return types[error.type] ? types[error.type](error.context) : error.message;
};

exports.apiDoc = (schema = {}) => async (req, res, next) => {
  try {
    req.validParams = (
      await Promise.all(
        ['params', 'query', 'body'].map((key) =>
          Joi.object(schema[key]).validateAsync(req[key], { stripUnknown: true }),
        ),
      )
    ).reduce((acc, cur) => Object.assign(acc, cur), {});
    next();
  } catch (err) {
    console.error(err);
    res.status(400).jsend({ message: errorTypeTextMap(err) });
  }
};
