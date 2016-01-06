var express = require('express');
var router = express.Router();
var passport = require('passport');
var isLoggedIn = require('../lib/common').isLoggedIn;
var util = require('util');

/**
 * 회원가입
 * @param req
 * @param res
 * @param next
 */
function join(req, res, next) {

  passport.authenticate('local-signup', function(err, user, info) {

    if (err) {
      global.logger.debug(err);
      return next(err);
    }

    if (!user) {
      global.logger.debug("passport.authenticate('local-signup') => 가입실패, 실패원인 : " + info);
      return next({message : '중복된 이메일입니다.'});
    }

    req.logIn(user, function(err) {

      if (err) {
        global.logger.debug(err);
        return next(err);
      }

      global.logger.debug("passport.authenticate('local-signup') => 가입성공");
      var result = {
        success : 1,
        result : {
          message : '가입이 정상적으로 처리되었습니다.'
        }
      };
      res.json(result);
    });
  })(req, res, next);
}

function authenticateLocalLogin(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) {
      global.logger.debug(err);
      return next(err);
    }

    global.logger.debug('passport.authenticate() user : ' + user);

    if (!user) {
      global.logger.debug("passport.authenticate('local-login') => 로그인실패");
      return next({message : '이메일이 중복되었거나 잘못된 비밀번호입니다.'});
    }

    req.logIn(user, function(err) {
      if (err) {
        global.logger.debug(err);
        return next(err);
      }
      global.logger.debug("passport.authenticate('local-signup') => 로그인성공");
      next();
    });
  })(req, res, next);
}


/**
 * 로그인
 * @param req
 * @param res
 * @param next
 */
function login(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '로그인이 정상적으로 되었습니다.',
      email : req.body.email
    }
  };
  res.json(result);
}

/**
 * 로그아웃
 * @param req
 * @param res
 * @param next
 */
function logout(req, res, next) {
  global.logger.debug("logout => " + util.inspect(req.user));
  req.logout();
  var result = {
    success : 1,
    result : {
      message : '로그아웃이 성공적으로 되었습니다.'
    }
  };
  res.json(result);
}

/**
 * 회원정보 수정
 * @param req
 * @param res
 * @param next
 */
function editUser(req, res, next) {


  var result = {
    success : 1,
    result : {
      message : '수정이 정상적으로 되었습니다.'
    }
  };
  res.json(result);
}

/**
 * 이메일 중복 확인
 * @param req
 * @param res
 * @param next
 */
function checkEmail(req, res, next) { // TODO : 구현예정
  var email = req.params.email;
  global.logger.debug('req.params로 입력된 email값 : ' + email);
  var result = {
    success : 1,
    result : {
      message : '사용할 수 있는 이메일입니다.'
    }
  };
  res.json(result);
}

/**
 * 회원탈퇴
 * @param req
 * @param res
 * @param next
 */
function deleteUser(req, res, next) {// TODO : 구현예정
  var result = {
    success : 1,
    result : {
      message : '회원 탈퇴가 되었습니다.'
    }
  };
  res.json(result);
}

/**
 * 참여했던 컨퍼런스 목록 보기(마이 페이지)
 * @param req
 * @param res
 * @param next
 */
function getMyConferenceList(req, res, next) {// TODO : 구현예정
  var result = {
    success : 1,
    result : [
      {
        conference_id : '1',
        title : 'DEVIEW 2016',
        start_time : '2016-01-01 08:00',
        end_time : '2016-01-02 17:00',
        description : '2016년도 네이버 개발자 컨퍼런스'
      }
    ]
  };
  res.json(result);
}

function getLoginForm(req, res, next) {
  global.logger.debug('entering the login form page');
  res.render('login');
}

router.post('/', join);
router.get('/login', getLoginForm);
router.post('/login', authenticateLocalLogin, login);
router.get('/logout', isLoggedIn, logout);
router.put('/change', isLoggedIn, editUser);
router.get('/mailCheck/:email', checkEmail);
router.delete('/delete', isLoggedIn, deleteUser);
router.get('/myconferencelist', isLoggedIn, getMyConferenceList);

module.exports = router;