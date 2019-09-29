const oAuth = require('lib/oauth');
const Strategy = require('lib/oauth/strategy');
const User = require('datebase/models/user');

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

const socialLogin = async (provider, id, email, displayName, done) => {
  try {
    let user = await User.findBySocialId(provider, id);
    if (user) return done(null, user.toJSON());
    if (email) {
      user = await User.findByEmail(email);
      if (user) return done({ message: '중복된 이메일이 존재합니다. 해당 이메일로 로그인하여 SNS를 통합해주세요.' });
    }
    user = await User.socialRegister({ provider, id, email, displayName });
    return done(null, user.toJSON());
  } catch (err) {
    return done(err);
  }
};

module.exports = () => {
  oAuth.use(
    new Strategy(
      {
        name: 'facebook',
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: '/api/v1/auth/social/facebook/callback',
      },
      (accessToken, profile, done) => {
        const { id, name, email } = profile;
        return socialLogin('facebook', id, email, name, done);
      },
    ),
  );

  oAuth.use(
    new Strategy(
      {
        name: 'kakao',
        clientID: KAKAO_APP_ID,
        clientSecret: KAKAO_APP_SECRET,
        callbackURL: '/api/v1/auth/social/kakao/callback',
        grantType: 'authorization_code',
      },
      (accessToken, profile, done) => {
        const { id, properties, kakao_account: kakaoAccount } = profile;
        const nickname = properties && properties.nickname;
        const email = kakaoAccount && kakaoAccount.email;
        return socialLogin('kakao', id, email, nickname, done);
      },
    ),
  );

  // oAuth.use(
  //   new Strategy({
  //     name: 'github',
  //     clientID: GITHUB_APP_ID,
  //     clientSecret: GITHUB_APP_SECRET,
  //     callbackURL: '/api/v1/auth/social/github',
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
  //     callbackURL: '/api/v1/auth/social/google',
  //     grantType: 'authorization_code',
  //   },
  //   (accessToken, profile) => {
  //
  //   }),
  // );
};
