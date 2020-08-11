const fs = require('fs');
const path = require('path');
const pathToRegexp = require('path-to-regexp');

const { name: title, version, description } = require('../../../package.json');

const swaggerPath = path.resolve(process.cwd(), './src/swagger/index.json');

const swaggerJson = {
  swagger: '2.0',
  info: {
    title,
    version,
    description,
  },
  host: '',
  schemes: ['https', 'http'],
  paths: {},
  definitions: {},
};

const readJSON = async () => {
  console.log('readJSON')
  const data = await fs.readFileSync(swaggerPath);
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

const setPathParameters = async (req, schema) => {
  try {
    // const {
    //   method,
    //   headers,
    //   baseUrl,
    //   route: { path: routePath },
    // } = req;
    const json = await readJSON();
    console.log(json);
    // const swaggerPath = swaggerPathGenerator(`${baseUrl}${routePath}`);
    // await writeJSON(json);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { initSwaggerJson, setPathParameters, readJSON };
