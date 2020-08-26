import { Request } from 'express';

export const enum StrategiesNames {
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  GOOGLE = 'google',
  KAKAO = 'kakao',
}

export type RequiredOptionsTypes = keyof RequiredOptions;
export type RequiredUrlTypes = 'authorizationURL' | 'tokenURL' | 'profileURL';

interface RequiredOptions {
  name: StrategiesNames;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export interface Options extends RequiredOptions {
  grantType?: string;
}

type BaseTypes = Record<RequiredUrlTypes, string> & { defaultScope: string[] };

export type SocialBaseUrlTypes = Record<StrategiesNames, BaseTypes>;

export interface GetOAuthParams {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  grant_type?: string;
}

export interface OAuthRequest extends Request {
  query: {
    code: string;
    error: string;
    error_description: string;
  };
}
