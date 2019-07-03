require('dotenv').config(); // LOAD CONFIG

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const api = require('api');
const connectDB = require('datebase');
const { checkAccessToken, checkRefreshToken } = require('lib/middlewares/jwt');
require('lib/oauth/strategies'); // Set Oauth strategies

const { NODE_ENV, PORT, COOKIE_SECRET } = process.env;

/* mongoose connected */
connectDB();

const app = express();
const port = PORT || 3000;
app.use(cors({ origin: true }));

/* ENABLE DEBUG WHEN DEV ENVIRONMENT */
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev')); // server logger
}

/* SETUP MIDDLEWARE */
// Allows express to read `x-www-form-urlencoded` data:
app.use(express.json()); // parses json
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));
app.use(
  session({
    resave: false,
    secret: COOKIE_SECRET,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === 'production',
    },
  }),
);
app.use(flash());

/* SETUP ROUTER */
app.use(checkAccessToken);
app.use(checkRefreshToken);
app.use('/api', api);

/* 404 error */
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* handle error */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});
