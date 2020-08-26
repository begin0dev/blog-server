import _ from 'lodash';
import qs from 'qs';
import url from 'url';
import axios from 'axios';

import {
  StrategiesNames,
  SocialBaseUrlTypes,
  Options,
  RequiredOptionsTypes,
  RequiredUrlTypes,
  GetOAuthParams,
  VerifyFunction,
} from './types';

const SOCIAL_BASE_URL: SocialBaseUrlTypes = {
  [StrategiesNames.FACEBOOK]: {
    authorizationURL: 'https://www.facebook.com/dialog/oauth',
    tokenURL: 'https://graph.facebook.com/v3.2/oauth/access_token',
    profileURL: 'https://graph.facebook.com/v3.2/me',
    defaultScope: ['name', 'email'],
  },
  [StrategiesNames.KAKAO]: {
    authorizationURL: 'https://kauth.kakao.com/oauth/authorize',
    tokenURL: 'https://kauth.kakao.com/oauth/token',
    profileURL: 'https://kapi.kakao.com/v2/user/me',
    defaultScope: [],
  },
  [StrategiesNames.GITHUB]: {
    authorizationURL: '',
    tokenURL: '',
    profileURL: '',
    defaultScope: [],
  },
  [StrategiesNames.GOOGLE]: {
    authorizationURL: '',
    tokenURL: '',
    profileURL: '',
    defaultScope: [],
  },
};

class OAuthStrategy {
  name: StrategiesNames;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  authorizationURL: string;
  tokenURL: string;
  profileURL: string;
  scope: string;
  verify: VerifyFunction;
  grantType?: string;

  constructor(options: Options, scope: string[] | VerifyFunction, verify?: VerifyFunction) {
    if (typeof scope === 'function') {
      /* eslint-disable */
      verify = scope;
      scope = [];
      /* eslint-enable */
    }
    if (!(verify as undefined)) throw new Error('Strategy requires a verify callback!');
    if (!Array.isArray(scope)) throw new Error('Scope type must be array!');

    (<RequiredOptionsTypes[]>['name', 'clientID', 'clientSecret', 'callbackURL']).forEach((key) => {
      if (!options[key]) throw new Error(`You must provide options the ${key} configuration value`);
      this[key] = options[key];
    });

    const { name, grantType } = options;
    (<RequiredUrlTypes[]>['authorizationURL', 'tokenURL', 'profileURL']).forEach((key) => {
      this[key] = SOCIAL_BASE_URL[name][key];
    });

    this.scope = _.chain(SOCIAL_BASE_URL[name].defaultScope).concat(scope).uniq().join(',').value();
    this.verify = verify;
    if (grantType) this.grantType = grantType;
  }

  authorizeEndPoint(redirectURI: string, options = {}): string {
    const { clientID, authorizationURL } = this;
    const query = {
      client_id: clientID,
      redirect_uri: redirectURI,
      response_type: 'code',
      ...options,
    };
    const parseUrl = url.parse(authorizationURL, true);
    parseUrl.query = query;
    return url.format(parseUrl);
  }

  async getOauthAccessToken(code: string, redirectURI: string): Promise<string> {
    try {
      const { clientID, clientSecret, tokenURL } = this;
      const params: GetOAuthParams = {
        code,
        client_id: clientID,
        client_secret: clientSecret,
        redirect_uri: redirectURI,
      };
      if (this.grantType) params.grant_type = this.grantType;
      const {
        data: { access_token: accessToken },
      } = await axios.post(tokenURL, qs.stringify(params), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return accessToken;
    } catch (err) {
      throw new Error(err);
    }
  }

  getUserProfile<R>(accessToken: string): Promise<R> {
    const { profileURL, scope } = this;
    const params = { access_token: accessToken, fields: scope };
    return axios.get(profileURL, { params });
  }
}

export default OAuthStrategy;
