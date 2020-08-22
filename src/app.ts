import '../config';

import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';

import { ExpressError } from '@app/types/error.d';
import { connectDB } from '@app/database';
import { checkAccessToken, checkRefreshToken } from '@app/middlewares/jwt';

const controllers = require('./controllers');
const oAuthConfig = require('./middlewares/strategies');

const swaggerDocument = require('./swagger/index.json');

const { NODE_ENV, PORT, COOKIE_SECRET, MONGO_URI, MONGO_DB_NAME, MONGO_USER, MONGO_PWD } = process.env;
const isProduction = NODE_ENV === 'production';

const app = express();
const port = PORT || 3000;

/* mongoose connected */
connectDB(MONGO_URI as string, {
  user: MONGO_USER,
  pass: MONGO_PWD,
  dbName: MONGO_DB_NAME,
});

/* ENABLE DEBUG WHEN DEV ENVIRONMENT */
if (isProduction) {
  app.use(helmet());
  app.use(morgan('short'));
  app.use(cors({ origin: 'https://begin0devBlog.com', credentials: true }));
} else {
  app.use(morgan('dev')); // server logger
  app.use(cors({ origin: true, credentials: true }));
}

/* SETUP MIDDLEWARE */
// Allows express to read `x-www-form-urlencoded` data:
app.use(express.json()); // parses json
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(cookieParser(COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: COOKIE_SECRET as string,
    cookie: {
      httpOnly: true,
      secure: isProduction,
    },
  }),
);

/* custom function */
app.response.jsend = function jsend({ message, data, meta }) {
  return this.json({ message, meta, data });
};

/* oAuth strategies */
oAuthConfig();

/* SETUP JWT TOKEN MIDDLEWARE */
app.use(checkAccessToken, checkRefreshToken);
/* SETUP ROUTER */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', controllers);

/* 404 error */
app.use((req, res, next) => {
  const err = new Error('Not Found');
  // err.status = 404;
  next(err);
});

/* handle error */
// eslint-disable-next-line no-unused-vars
app.use((err: ExpressError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).jsend({ message: err.message });
});

app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});
