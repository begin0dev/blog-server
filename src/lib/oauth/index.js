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
      name = strategy.name;
      /* eslint-enable */
    }
    this.strategires[name] = strategy;
    return this;
  }

  authenticate(name, { failureRedirect, successRedirect }) {
    return async (req, res, next) => {
      const strategy = this.strategires[name];
      const { callbackURL } = strategy;
      const { error, code } = req.query;
      const originalURL = url.format({
        protocol: req.protocol,
        host: req.get('host'),
      });
      const redirectURI = url.resolve(originalURL, callbackURL);

      const verified = (err, user) => {
        if (err && failureRedirect) {
          req.flash('message', err.message);
          return res.redirect(failureRedirect);
        }
        if (user && successRedirect) {
          return res.redirect(successRedirect);
        }
        if (err) {
          res.locals.message = err.message;
        }
        req.user = user;
        next();
      };

      if (error) {
        verified({ message: req.query.error_description });
      }
      if (code) {
        try {
          const accessToken = await strategy.getOauthAccessToken(code, redirectURI);
          const profile = await strategy.getUserProfile(accessToken);
          strategy.verify(accessToken, profile, verified);
        } catch (err) {
          verified(err);
        }
      } else {
        const authorizeEndPoint = strategy.authorizeEndPoint(redirectURI);
        res.redirect(authorizeEndPoint);
      }
    };
  }
}

module.exports = new Oauth();
