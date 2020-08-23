import fs from 'fs';
import Joi from 'joi';
import path from 'path';
import * as pathToRegexp from 'path-to-regexp';
import { set, get } from 'lodash';
import { convert } from '@yeongjet/joi-to-json-schema';
import { Request } from 'express';

import { name as title, version, description } from '../../../package.json';

const swaggerPath = path.resolve(process.cwd(), './src/swagger/index.json');

const swaggerJson = {
  swagger: '2.0',
  info: {
    title,
    version,
    description,
  },
  host: 'localhost:3001',
  schemes: ['https', 'http'],
  paths: {},
  definitions: {},
};

const readJSON = async (): Promise<object> => {
  const data: string = await fs.readFileSync(swaggerPath, 'utf8');
  return JSON.parse(data);
};

const writeJSON = (json: object): void => fs.writeFileSync(swaggerPath, JSON.stringify(json));

const swaggerPathGenerator = (routePath: string): string =>
  pathToRegexp
    .parse(routePath)
    .map((token) => {
      if (typeof token === 'string') return token;
      if (token.pattern === '[^\\/#\\?]+?') return `${token.prefix}{${token.name}}${token.suffix}`;
      return `${token.prefix}${token.name}${token.suffix}`;
    })
    .join('');

export const paramMap = {
  params: 'path',
  query: 'query',
  body: 'body',
};

export type ParamMap = keyof typeof paramMap;

type PathSchema<T extends Joi.Schema> = Record<string, T>;
export type ValidationSchema<T extends Record<ParamMap | string, Joi.Schema>> = {
  [K in keyof T]: PathSchema<T[K]>;
};
export type ControllerSchema<T extends Record<ParamMap, Joi.Schema>> = ValidationSchema<T> & {
  summary: string;
  description?: string;
};

interface Params {
  name: string;
  in: string;
  required?: boolean;
  schema?: any;
}

export const setPathParameters = async <T extends Record<ParamMap, Joi.Schema>>(
  req: Request,
  schema: ControllerSchema<T>,
) => {
  try {
    const {
      method,
      baseUrl,
      route: { path: routePath },
    } = req;

    const json = await readJSON();

    const urlPath = `paths[${swaggerPathGenerator(`${baseUrl}${routePath}`)}].${method.toLowerCase()}`;
    const parameters: any[] = [];

    (<(keyof typeof paramMap)[]>Object.keys(paramMap)).forEach((paramKey) => {
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
      });
      await writeJSON(json);
    }
  } catch (err) {
    console.error(err);
  }
};

export const initSwaggerJson = (): void => writeJSON(swaggerJson);
