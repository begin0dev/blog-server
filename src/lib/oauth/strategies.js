const oAuth = require('lib/oauth');
const Strategy = require('lib/oauth/strategy');
const User = require('datebase/models/user');

const {
  FACEBOOK_APP_ID,
  FACEBOOK_SECRET,
  KAKAO_APP_ID,
  KAKAO_SECRET,
  GITHUB_APP_ID,
  GITHUB_SECRET,
  GOOGLE_APP_ID,
  GOOGLE_SECRET,
} = process.env;

const socialLogin = async (provider, id, email, displayName, done) => {
  try {
    let user = await User.findBySocialId(provider, id);
    if (!user) {
      try {
        user = await User.socialRegister({ provider, id, email, displayName });
      } catch (err) {
        return done({ message: '중복된 이메일이 존재합니다. 해당 이메일로 로그인하여 SNS를 통합하세요.' });
      }
    }
    done(null, user.toJSON());
  } catch (err) {
    done(err);
  }
};

oAuth.use(
  new Strategy({
    name: 'facebook',
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_SECRET,
    callbackURL: '/api/v1.0/auth/social/facebook',
  },
  (accessToken, profile, done) => {
    const { id, name, email } = profile;
    return socialLogin('facebook', id, email, name, done);
  }),
);

oAuth.use(
  new Strategy({
    name: 'kakao',
    clientID: KAKAO_APP_ID,
    clientSecret: KAKAO_SECRET,
    callbackURL: '/api/v1.0/auth/social/kakao',
    grantType: 'authorization_code',
  },
  (accessToken, profile, done) => {
    const { id, properties, kakao_account: kakaoAccount } = profile;
    const nickname = properties && properties.nickname;
    const email = kakaoAccount && kakaoAccount.email;
    return socialLogin('kakao', id, accessToken, email, nickname, done);
  }),
);

// oAuth.use(
//   new Strategy({
//     name: 'github',
//     clientID: GITHUB_APP_ID,
//     clientSecret: GITHUB_SECRET,
//     callbackURL: '/api/v1.0/auth/social/github',
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
//     clientSecret: GOOGLE_SECRET,
//     callbackURL: '/api/v1.0/auth/social/google',
//     grantType: 'authorization_code',
//   },
//   (accessToken, profile) => {
//
//   }),
// );
