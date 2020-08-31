import oAuth from '@app/lib/oauth';
import Strategy from '@app/lib/oauth/strategy';
import { StrategiesNames } from '@app/lib/oauth/types';

const {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  KAKAO_APP_ID,
  KAKAO_APP_SECRET,
  // GITHUB_APP_ID,
  // GITHUB_APP_SECRET,
  // GOOGLE_APP_ID,
  // GOOGLE_APP_SECRET,
} = process.env;

const callbackUrl = (name: StrategiesNames) => `/api/v1/auth/social/${name}/callback`;

const strategies = () => {
  oAuth.use(
    new Strategy(
      {
        name: StrategiesNames.FACEBOOK,
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: callbackUrl(StrategiesNames.FACEBOOK),
      },
      (accessToken, { id, name: displayName, email }, done) => {
        return done(null, { provider: StrategiesNames.FACEBOOK, id, displayName, email });
      },
    ),
  );

  oAuth.use(
    new Strategy(
      {
        name: StrategiesNames.KAKAO,
        clientID: KAKAO_APP_ID,
        clientSecret: KAKAO_APP_SECRET,
        callbackURL: callbackUrl(StrategiesNames.KAKAO),
        grantType: 'authorization_code',
      },
      (accessToken, { id, properties, kakao_account: kakaoAccount }, done) => {
        const displayName = properties?.nickname;
        const email = kakaoAccount?.email;
        return done(null, { provider: StrategiesNames.KAKAO, id, displayName, email });
      },
    ),
  );

  // oAuth.use(
  //   new Strategy({
  //     clientID: GITHUB_APP_ID,
  //     clientSecret: GITHUB_APP_SECRET,
  //     callbackURL: callbackUrl('github'),
  //     grantType: 'authorization_code',
  //   },
  //   (accessToken, profile) => {
  //
  //   }),
  // );

  // oAuth.use(
  //   new Strategy({
  //     clientID: GOOGLE_APP_ID,
  //     clientSecret: GOOGLE_APP_SECRET,
  //     callbackURL: callbackUrl('google'),
  //     grantType: 'authorization_code',
  //   },
  //   (accessToken, profile) => {
  //
  //   }),
  // );
};

export default strategies;
