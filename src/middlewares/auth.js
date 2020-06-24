exports.isLoggedIn = (req, res, next) => {
  if (req.user) return next();
  res.status(401).jsend({ message: '로그인이 필요합니다.' });
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.user) return next();
  res.status(401).jsend({ message: '로그인 된 사용자는 접근할 수 없습니다.' });
};
