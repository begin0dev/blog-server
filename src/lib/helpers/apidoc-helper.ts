import Joi, { ValidationError, ValidationErrorItem } from 'joi';
import { Request, Response, NextFunction } from 'express';

import { setPathParameters, ControllerSchema, ParamMap } from './swagger-handler';

interface ValidationErrorTypes {
  [key: string]: ((errorItem: ValidationErrorItem) => string) | null;
}

const validationErrorTypes: ValidationErrorTypes = {
  'any.required': (errorItem) => `"${errorItem?.context?.label}" 은 필수 값 입니다.`,
  'string.base': (errorItem) => `"${errorItem?.context?.label}" 은 문자 타입이어야 합니다.`,
  'number.base': (errorItem) => `"${errorItem?.context?.label}" 은 숫자 타입이어야 합니다.`,
};

const errorTypeTextMap = (err: ValidationError) => {
  if (!err.details) return err.message;
  const error = err.details[0];
  return validationErrorTypes[error.type]?.(error) || error.message;
};

export const apiDoc = (schema: ControllerSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV === 'test') await setPathParameters(req, schema);
    req.validParams = (
      await Promise.all(
        Object.keys(ParamMap).map((key) =>
          Joi.object(schema[key]).validateAsync(req[key as keyof typeof ParamMap], {
            stripUnknown: true,
          }),
        ),
      )
    ).reduce((acc, cur) => Object.assign(acc, cur), {});
    next();
  } catch (err) {
    console.error(err);
    res.status(400).jsend({ message: errorTypeTextMap(err) });
  }
};
