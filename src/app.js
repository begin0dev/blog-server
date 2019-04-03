require('dotenv').config(); // LOAD CONFIG

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const api = require('api/index');
const db = require('datebase/index');
const { checkedAccessToken, checkedRefreshToken } = require('lib/middlewares/jwt');
require('lib/oauth/strategies'); // Set Oauth strategies

const { NODE_ENV, PORT, COOKIE_SECRET } = process.env;

const app = express();
const port = PORT || 3000;

/* mongoose connected */
db.connect();

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
app.use(session({
  resave: false,
  secret: COOKIE_SECRET,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
  },
}));
app.use(flash());

/* SETUP ROUTER */
app.use(checkedAccessToken, checkedRefreshToken);
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
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});
