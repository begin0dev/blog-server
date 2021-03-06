import _ from 'lodash';
import qs from 'qs';
import url from 'url';
import axios, { AxiosResponse } from 'axios';

import {
  StrategiesNames,
  SocialBaseUrlTypes,
  Options,
  RequiredOptionsTypes,
  RequiredUrlTypes,
  GetOAuthParams,
  VerifyFunction,
  ProfileResponses,
} from './types';

const SOCIAL_BASE_URL: SocialBaseUrlTypes = {
  [StrategiesNames.FACEBOOK]: {
    authorizationURL: 'https://www.facebook.com/v8.0/dialog/oauth',
    tokenURL: 'https://graph.facebook.com/v8.0/oauth/access_token',
    profileURL: 'https://graph.facebook.com/v8.0/me',
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

class OAuthStrategy<N extends StrategiesNames> {
  name: N;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  authorizationURL: string;
  tokenURL: string;
  profileURL: string;
  scope: string;
  verify: VerifyFunction<N>;
  grantType?: string;

  constructor(options: Options<N>, scope: string[] | VerifyFunction<N>, verify?: VerifyFunction<N>) {
    if (typeof scope === 'function') {
      /* eslint-disable */
      verify = scope;
      scope = [];
      /* eslint-enable */
    }
    if (!verify) throw new Error('Strategy requires a verify callback!');
    if (!Array.isArray(scope)) throw new Error('Scope type must be array!');

    (<RequiredOptionsTypes[]>['name', 'clientID', 'clientSecret', 'callbackURL']).forEach((key) => {
      if (!options[key]) throw new Error(`You must provide options the ${key} configuration value`);
      this[key] = options[key] as N & string;
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
      response_type: 'code',
      client_id: clientID,
      redirect_uri: redirectURI,
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

  getUserProfile(accessToken: string): Promise<AxiosResponse<ProfileResponses[N]>> {
    const { profileURL, scope } = this;
    const params = { access_token: accessToken, fields: scope };
    return axios.get(profileURL, { params });
  }
}

export default OAuthStrategy;
