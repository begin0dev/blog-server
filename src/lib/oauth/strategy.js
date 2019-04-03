const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');
const url = require('url');

const SOCIAL_BASE_URL = {
  facebook: {
    authorizationURL: 'https://www.facebook.com/dialog/oauth',
    tokenURL: 'https://graph.facebook.com/v3.2/oauth/access_token',
    profileURL: 'https://graph.facebook.com/v3.2/me',
    defaultScope: ['name', 'email'],
  },
  kakao: {
    authorizationURL: 'https://kauth.kakao.com/oauth/authorize',
    tokenURL: 'https://kauth.kakao.com/oauth/token',
    profileURL: 'https://kapi.kakao.com/v2/user/me',
    defaultScope: [],
  },
  github: {
    authorizationURL: '',
    tokenURL: '',
    profileURL: '',
    defaultScope: [],
  },
  google: {
    authorizationURL: '',
    tokenURL: '',
    profileURL: '',
    defaultScope: [],
  },
};

/**
 * options
 * {
 *   name: '',
 *   clientID: '',
 *   clientSecret: '',
 *   callbackURL: '',
 *   grantType: '',
 * }
 */

class Strategy {
  constructor(options, scope, verify) {
    if (typeof scope === 'function') {
      /* eslint-disable */
      verify = scope;
      scope = [];
      /* eslint-enable */
    }
    if (!verify) throw new Error('Strategy requires a verify callback!');
    if (!Array.isArray(scope)) throw new Error('Scope type must be array!');
    ['name', 'clientID', 'clientSecret', 'callbackURL'].forEach((key) => {
      if (!options[key]) throw new Error(`You must provide options the ${key} configuration value`);
      this[key] = options[key];
    });
    const { name, grantType } = options;
    ['authorizationURL', 'tokenURL', 'profileURL'].forEach((key) => {
      this[key] = SOCIAL_BASE_URL[name][key];
    });

    this.scope = _.chain(SOCIAL_BASE_URL[name].defaultScope)
      .concat(scope)
      .uniq()
      .join(',')
      .value();
    this.verify = verify;
    if (grantType) {
      this.grantType = grantType;
    }
  }

  authorizeEndPoint(redirectURI) {
    const { clientID, authorizationURL } = this;
    const query = {
      client_id: clientID,
      redirect_uri: redirectURI,
      response_type: 'code',
    };
    const parsed = url.parse(authorizationURL);
    parsed.query = query;
    return url.format(parsed);
  }

  getOauthAccessToken(code, redirectURI) {
    return new Promise(async (resolve, reject) => {
      try {
        const { clientID, clientSecret, tokenURL } = this;
        const params = {
          client_id: clientID,
          client_secret: clientSecret,
          redirect_uri: redirectURI,
          code,
        };
        if (this.grantType) {
          params.grant_type = this.grantType;
        }
        const payload = await axios({
          method: 'post',
          url: tokenURL,
          data: querystring.stringify(params),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        const accessToken = payload.data.access_token;
        resolve(accessToken);
      } catch (err) {
        reject(err);
      }
    });
  }

  getUserProfile(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const { profileURL, scope } = this;
        const params = {
          access_token: accessToken,
          fields: scope,
        };
        const payload = await axios.get(profileURL, { params });
        resolve(payload.data);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = Strategy;
