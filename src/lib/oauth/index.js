const url = require('url');

class Oauth {
  constructor() {
    this.strategires = {};
  }

  use(name, strategy) {
    if (!name) throw new Error('Authentication strategies must have a name');
    if (!strategy) {
      /* eslint-disable */
      strategy = name;
      ({ name } = strategy);
      /* eslint-enable */
    }
    this.strategires[name] = strategy;
    return this;
  }

  authenticate(name, { failureUrl, successUrl, ...options } = {}) {
    return async (req, res, next) => {
      const strategy = this.strategires[name];
      const { callbackURL } = strategy;
      const { error, error_description: errorDescription, code } = req.query;
      const redirectURI = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: callbackURL,
      });

      const done = (err, profile) => {
        if (err) res.locals.message = err;
        if (profile) res.locals.profile = profile;
        return next();
      };

      if (error) return done({ message: errorDescription });
      if (!code) return res.redirect(strategy.authorizeEndPoint(redirectURI, options));
      try {
        const accessToken = await strategy.getOauthAccessToken(code, redirectURI);
        const { data } = await strategy.getUserProfile(accessToken);
        return strategy.verify(accessToken, data, done);
      } catch (err) {
        return done(err);
      }
    };
  }
}

module.exports = new Oauth();
