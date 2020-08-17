const fs = require('fs');
const path = require('path');
const pathToRegexp = require('path-to-regexp');
const Joi = require('joi');
const { set, get } = require('lodash');
const { convert } = require('@yeongjet/joi-to-json-schema');

const { name: title, version, description } = require('../../../package.json');

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

const readJSON = async () => {
  const data = await fs.readFileSync(swaggerPath, 'utf8');
  return JSON.parse(data);
};

const writeJSON = async (json) => {
  await fs.writeFileSync(swaggerPath, JSON.stringify(json));
  return null;
};

const initSwaggerJson = () => writeJSON(swaggerJson);

const swaggerPathGenerator = (routePath) => {
  const tokens = pathToRegexp.parse(routePath);
  return tokens
    .map((token) => {
      if (typeof token === 'string') return token;
      if (token.pattern === '[^\\/#\\?]+?') return `${token.prefix}{${token.name}}${token.suffix}`;
      return `${token.prefix}${token.name}${token.suffix}`;
    })
    .join('');
};

const paramMap = {
  params: 'path',
  query: 'query',
  body: 'body',
};

const setPathParameters = async (req, schema) => {
  try {
    const {
      method,
      baseUrl,
      route: { path: routePath },
    } = req;
    const json = await readJSON();

    const urlPath = `paths[${swaggerPathGenerator(`${baseUrl}${routePath}`)}].${method.toLowerCase()}`;
    const parameters = [];

    ['params', 'query', 'body'].forEach((paramKey) => {
      if (!schema[paramKey]) return;

      const { properties, required } = convert(Joi.object(schema[paramKey]));
      const paramType = paramMap[paramKey];

      Object.entries(properties).forEach(([name, property]) => {
        const param = {
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

module.exports = { initSwaggerJson, setPathParameters };
