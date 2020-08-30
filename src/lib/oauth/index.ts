import url from 'url';
import { Response, NextFunction } from 'express';

import OAuthStrategy from './strategy';
import { StrategiesNames, OAuthRequest, DoneProfile } from './types';

class Oauth {
  strategies: Partial<Record<StrategiesNames, OAuthStrategy>>;

  constructor() {
    this.strategies = {};
  }

  use(name: StrategiesNames[keyof StrategiesNames] | OAuthStrategy, strategy?: OAuthStrategy): this {
    if (!name) throw new Error('Authentication strategies must have a name');
    if (!strategy) {
      /* eslint-disable */
      strategy = name as OAuthStrategy;
      ({ name } = strategy);
      /* eslint-enable */
    }
    this.strategies[name as StrategiesNames] = strategy;
    return this;
  }

  authenticate(
    name: StrategiesNames,
    { failureUrl, successUrl, ...options }: { failureUrl?: string; successUrl?: string; [key: string]: string } = {},
  ) {
    return async (req: OAuthRequest, res: Response, next: NextFunction) => {
      const strategy = this.strategies[name];
      const { callbackURL } = strategy;
      const { code, error, error_description: errorDescription } = req.query;

      const redirectURI = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: callbackURL,
      });

      const done = (err: Error, profile?: DoneProfile) => {
        if (err) {
          res.locals.message = err.message;
          if (failureUrl) return res.redirect(failureUrl);
        }
        if (profile) res.locals.profile = profile;
        if (successUrl) return res.redirect(successUrl);
        return next();
      };

      if (error) return done(new Error(errorDescription));
      if (!code) return res.redirect(strategy.authorizeEndPoint(redirectURI, options));

      try {
        const accessToken = await strategy.getOauthAccessToken(code, redirectURI);
        const { data: profile } = await strategy.getUserProfile(accessToken);
        return strategy.verify(accessToken, profile, done);
      } catch (err) {
        return done(err);
      }
    };
  }
}

export default new Oauth();
