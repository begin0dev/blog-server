import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import controllers from '@app/controllers';
import oAuthStrategies from '@app/middlewares/strategies';
import swaggerDocument from '@app/swagger/index.json';
import { connectDB } from '@app/database';
import { setSwaggerResponse } from '@app/lib/helpers/swagger-handler';
import { ExpressError, Status } from '@app/types/base';
import { checkAccessToken, checkRefreshToken } from '@app/middlewares/jwt';

const { NODE_ENV, COOKIE_SECRET, MONGO_URI, MONGO_DB_NAME, MONGO_USER, MONGO_PWD } = process.env;
const isProduction = NODE_ENV === 'production';

class Server {
  public application: express.Application;

  constructor() {
    const app = express();

    app.response.setCookie = function (key: string, value: string) {
      return this.cookie(key, value, {
        // httpOnly: true,
        // secure: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 3600 * 1000 * 24),
      });
    };

    /* ENABLE DEBUG WHEN DEV ENVIRONMENT */
    if (isProduction) {
      app.enable('trust proxy');
      app.use(helmet());
      app.use(morgan('tiny'));
      app.use(
        cors({
          origin: ['https://stoic-torvalds-3ca74f.netlify.app', 'https://begin0dev.ml', 'https://localhost:3000'],
          credentials: true,
        }),
      );
    } else {
      app.use(morgan('dev')); // server logger
      app.use(cors({ origin: true, credentials: true }));
    }

    /* SETUP MIDDLEWARE */
    app.use(express.json()); // parses json
    app.use(express.urlencoded({ extended: true }));
    app.use(hpp());
    app.use(cookieParser(COOKIE_SECRET));

    /* SETUP OAUTH STRATEGIES */
    oAuthStrategies();

    /* SETUP SWAGGER */
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    if (process.env.NODE_ENV === 'test') app.use(setSwaggerResponse);

    /* SETUP JWT TOKEN MIDDLEWARE */
    app.use(checkAccessToken, checkRefreshToken);
    /* SETUP ROUTER */
    app.use('/api', controllers);

    /* SETUP 404 ERROR MIDDLEWARE */
    app.use((req: Request, res: Response, next: NextFunction) => {
      const err = new ExpressError('Not Found!');
      err.status = 404;
      next(err);
    });

    /* RETURN ERROR */
    // eslint-disable-next-line no-unused-vars
    app.use((err: ExpressError, req: Request, res: Response, next: NextFunction) => {
      console.error(err);
      res.status(err.status || 500).json({ status: Status.ERROR, message: err.message });
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
      console.log(`Express is running on port ${port} - ${NODE_ENV}`);
    });

    return this.application;
  }
}

export default new Server();
