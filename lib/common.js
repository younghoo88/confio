function isLoggedIn(req, res, next) {

  if (req.isAuthenticated()) {
    global.logger.debug("req.isAuthenticated() => true");
    return next();
  }

  global.logger.debug("req.isAuthenticated() => false");
  return next({ message : '로그인되어있지 않습니다.' });
}

module.exports.isLoggedIn = isLoggedIn;