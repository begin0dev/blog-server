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

  authenticate<P>(
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
        if (err) res.locals.message = err.message;
        if (profile) res.locals.profile = profile;
        return next();
      };

      if (error) return done(new Error(errorDescription));
      if (!code) return res.redirect(strategy.authorizeEndPoint(redirectURI, options));

      try {
        const accessToken = await strategy.getOauthAccessToken(code, redirectURI);
        const { data } = await strategy.getUserProfile<P>(accessToken);
        return strategy.verify(accessToken, data, done);
      } catch (err) {
        return done(err);
      }
    };
  }
}

export default new Oauth();
