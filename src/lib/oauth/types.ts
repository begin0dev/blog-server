import { Request } from 'express';

export const enum StrategiesNames {
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  GOOGLE = 'google',
  KAKAO = 'kakao',
}

export type RequiredOptionsTypes = keyof RequiredOptions<StrategiesNames>;
export type RequiredUrlTypes = 'authorizationURL' | 'tokenURL' | 'profileURL';

interface RequiredOptions<N extends StrategiesNames> {
  name: N;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export interface Options<N extends StrategiesNames> extends RequiredOptions<N> {
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

export type ProfileResponses = {
  [StrategiesNames.FACEBOOK]: {
    id: string;
    name: string;
    email: string;
  };
  [StrategiesNames.GITHUB]: {};
  [StrategiesNames.GOOGLE]: {};
  [StrategiesNames.KAKAO]: {
    id: string;
    properties?: { nickname: string };
    kakao_account?: { email: string };
  };
};

export interface DoneProfile {
  provider: StrategiesNames;
  id: string;
  displayName: string;
  email: string;
}

export type VerifyFunction<N extends StrategiesNames> = (
  accessToken: string,
  profile: ProfileResponses[N],
  done: (err: Error, profile?: DoneProfile) => void,
) => void;
