import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import oAuthStrategies from '@app/middlewares/strategies';
import { ExpressError } from '@app/types/error';
import { connectDB } from '@app/database';
import { checkAccessToken, checkRefreshToken } from '@app/middlewares/jwt';

const controllers = require('./controllers');

const swaggerDocument = require('./swagger/index.json');

const { NODE_ENV, COOKIE_SECRET, MONGO_URI, MONGO_DB_NAME, MONGO_USER, MONGO_PWD } = process.env;
const isProduction = NODE_ENV === 'production';

class Server {
  public application: express.Application;

  constructor() {
    const app = express();

    /* ENABLE DEBUG WHEN DEV ENVIRONMENT */
    if (isProduction) {
      app.use(helmet());
      app.use(morgan('short'));
      app.use(cors({ origin: 'https://begin0devBlog.com', credentials: true }));
    } else {
      app.use(morgan('dev')); // server logger
    }

    /* SETUP MIDDLEWARE */
    app.use(express.json()); // parses json
    app.use(express.urlencoded({ extended: true }));
    app.use(hpp());
    app.use(cookieParser(COOKIE_SECRET));

    /* CUSTOM FUNCTION */
    app.response.jsend = function jsend({ message, data, meta }) {
      return this.json({ message, meta, data });
    };

    /* SETUP OAUTH STRATEGIES */
    oAuthStrategies();

    /* SETUP SWAGGER */
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    /* SETUP JWT TOKEN MIDDLEWARE */
    app.use(checkAccessToken, checkRefreshToken);
    /* SETUP ROUTER */
    app.use('/api', controllers);

    /* SETUP 404 ERROR MIDDLEWARE */
    app.use((req, res, next) => {
      const err = new ExpressError('Not Found!');
      err.status = 404;
      next(err);
    });

    /* RETURN ERROR */
    // eslint-disable-next-line no-unused-vars
    app.use((err: ExpressError, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err);
      res.status(err.status || 500).jsend({ message: err.message });
    });

    this.application = app;
  }

  async run(port: number) {
    /* CONNECT MONGO */
    await connectDB(MONGO_URI as string, {
      user: MONGO_USER,
      pass: MONGO_PWD,
      dbName: MONGO_DB_NAME,
    });

    this.application.listen(port, () => {
      console.log(`Express is running on port ${port}`);
    });

    return this.application;
  }
}

export default new Server();
