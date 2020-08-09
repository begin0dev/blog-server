require('dotenv').config({ path: './config/.env' });

const hpp = require('hpp');
const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('./swagger/index.json');
const controllers = require('./controllers');
const connectDB = require('./database');
const oAuthConfig = require('./middlewares/strategies');
const { checkAccessToken, checkRefreshToken } = require('./middlewares/jwt');

const { NODE_ENV, PORT, COOKIE_SECRET, MONGO_URI, MONGO_DB_NAME, MONGO_USER, MONGO_PWD } = process.env;
const isProduction = NODE_ENV === 'production';

const app = express();
const port = PORT || 3000;

/* mongoose connected */
connectDB(MONGO_URI, {
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
    secret: COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: isProduction,
    },
  }),
);

/* custom function */
app.response.jsend = function ({ message, data, meta }) {
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
  err.status = 404;
  next(err);
});

/* handle error */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).jsend({ message: err.message });
});

app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});
