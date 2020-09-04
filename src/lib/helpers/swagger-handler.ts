import fs from 'fs';
import Joi from 'joi';
import path from 'path';
import * as pathToRegexp from 'path-to-regexp';
import { set, get } from 'lodash';
import { convert } from '@yeongjet/joi-to-json-schema';
import { NextFunction, Request, Response } from 'express';

const swaggerJsonPath = path.resolve(process.cwd(), './src/swagger/index.json');

const readJSON = async (): Promise<object> => {
  const data: string = await fs.readFileSync(swaggerJsonPath, 'utf8');
  return JSON.parse(data);
};

export const writeJSON = (json: object) => fs.writeFileSync(swaggerJsonPath, JSON.stringify(json));

const swaggerPathGenerator = (req: Request): string => {
  const {
    method,
    baseUrl,
    route: { path: routePath },
  } = req;

  const swaggerUrl = pathToRegexp
    .parse(`${baseUrl}${routePath}`)
    .map((token) => {
      if (typeof token === 'string') return token;
      if (token.pattern === '[^\\/#\\?]+?') return `${token.prefix}{${token.name}}${token.suffix}`;
      return `${token.prefix}${token.name}${token.suffix}`;
    })
    .join('');

  return `paths[${swaggerUrl}].${method.toLowerCase()}`;
};

export const paramMap = {
  params: 'path',
  query: 'query',
  body: 'body',
};

type ParamKeyTypes = keyof typeof paramMap;
type PathSchema = Record<string, Joi.Schema>;
export type ValidationSchema = { [K in ParamKeyTypes]?: PathSchema };
export type ControllerSchema = ValidationSchema & {
  summary: string;
  description?: string;
};

interface Params {
  name: string;
  in: string;
  required?: boolean;
  schema?: any;
}

const isJsonString = (str: string) => {
  try {
    return !!JSON.parse(str);
  } catch (err) {
    return false;
  }
};

const setResponse = async (urlPath: string, example: any) => {
  if (typeof example === 'object') {
    const json = await readJSON();
    set(json, urlPath, {
      description: example.status,
      content: {
        'application/json': {
          example,
        },
      },
    });
    await writeJSON(json);
  }
};

function setSwaggerResponse(req: Request, res: Response, next: NextFunction) {
  const originEnd = res.end;
  res.end = async function (...chunk: any) {
    let example = Buffer.from(chunk[0]).toString('utf8');
    if (isJsonString(example)) example = JSON.parse(example);
    // await setResponse(`${urlPath}.responses[${res.statusCode}]`, example);
    originEnd.apply(res, chunk);
  };

  next();
}

export const setPathParameters = async (req: Request, res: Response, schema: ControllerSchema) => {
  try {
    const { baseUrl } = req;

    const json = await readJSON();

    const urlPath = swaggerPathGenerator(req);
    const parameters: any[] = [];

    (<ParamKeyTypes[]>Object.keys(paramMap)).forEach((paramKey) => {
      if (!schema[paramKey]) return;

      const { properties, required } = convert(Joi.object(schema[paramKey]));
      const paramType = paramMap[paramKey];

      Object.entries(properties).forEach(([name, property]) => {
        const param: Params = {
          name,
          in: paramType,
          required: required && required.indexOf(name) >= 0,
        };
        if (paramType === 'body') {
          param.schema = property;
        } else {
          Object.assign(param, property);
        }
        parameters.push(param);
      });
    });

    if (!get(json, urlPath)) {
      set(json, urlPath, {
        tags: [baseUrl.split('/')[3]],
        summary: schema.summary,
        description: schema.description,
        parameters,
        responses: {},
      });
      await writeJSON(json);
    }
  } catch (err) {
    console.error(err);
  }
};
