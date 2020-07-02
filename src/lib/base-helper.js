const Joi = require('@hapi/joi');

exports.asyncErrorHelper = (func) => (req, res, next) => Promise.resolve(func(req, res, next)).catch(next);

exports.paramsValidation = (schema) => async (req, res, next) => {
  try {
    const params = { ...req.query, ...req.body };
    req.params = await Joi.object(schema).validateAsync(params, { stripUnknown: true });
    next();
  } catch (err) {
    res.status(400).jsend({ message: err.message });
  }
};
