const oAuth = require('lib/oauth');
const Strategy = require('lib/oauth/strategy');

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

const callbackUrl = name => `/api/v1/auth/social/${name}/callback`;

module.exports = () => {
  oAuth.use(
    new Strategy(
      {
        name: 'facebook',
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: callbackUrl('facebook'),
      },
      (accessToken, profile, done) => {
        const { id, name: displayName, email } = profile;
        return done(null, { provider: 'facebook', id, displayName, email });
      },
    ),
  );

  oAuth.use(
    new Strategy(
      {
        name: 'kakao',
        clientID: KAKAO_APP_ID,
        clientSecret: KAKAO_APP_SECRET,
        callbackURL: callbackUrl('kakao'),
        grantType: 'authorization_code',
      },
      (accessToken, profile, done) => {
        const { id, properties, kakao_account: kakaoAccount } = profile;
        const displayName = properties && properties.nickname;
        const email = kakaoAccount && kakaoAccount.email;
        return done(null, { provider: 'kakao', id, displayName, email });
      },
    ),
  );

  // oAuth.use(
  //   new Strategy({
  //     name: 'github',
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
  //     name: 'google',
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
