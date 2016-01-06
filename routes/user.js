var express = require('express');
var router = express.Router();
var passport = require('passport');
var isLoggedIn = require('../lib/common').isLoggedIn;
var util = require('util');
var async = require('async');
/**
 * File Name : user.js
 * Description : '/user'로 들어오는 RESTful API를 받아서 처리한다
 * Function : 1. join
 *            2. getLoginForm
 *            3. login
 *            4. logout
 *            5. editUser
 *            6. checkEmail
 *            7. deleteUser
 *            8. getMyConferenceList
 *
 */
/** DONE**/
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
 * Name : login
 * URL : POST /user/login
 * Description :. 로그인
 * Params :
 * HTTP Body : email
 * Session : 필요하지않음
 **/
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
 * Name :logout
 * URL : POST /user/logout
 * Description : 로그아웃
 * Params :
 * HTTP Body :
 * Session : 필요함
 **/
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
/** NOT COMPLETE & NEED TO CODE NEITHER **/
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
 * Name : checkEmail
 * URL : POST /user/mailCheck/:email'
 * Description : email에 해당 하는 user_id
 * Params : email
 * HTTP Body :
 * Session : 필요함
 **/
function checkEmail(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {
    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }
    /*
     * Table     : user
     * Columns   : user_id
     * Query 설명 : email에 해당하는 user_id조회
     * */
    var selectEmail = 'SELECT user_id '+
                      'FROM user ' +
                      'WHERE email = ? and is_valid =1';
    var placeHolders =[req.params.email];

    connection.query(selectEmail, placeHolders, function(err, rows, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }

      var result = {
        success : 1,
        result : (rows.length > 0) ? '사용 중인 이메일입니다' : '사용이 가능한 이메일 입니다.'
      };
       res.json(result);
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
}

/**
 * 회원탈퇴
 * @param req
 * @param res
 * @param next
 */
/** NOT COMPLETE & NEED TO CODE NEITHER **/
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
 * Name : getMyConferenceList
 * URL : GET /user/myconferencelist
 * Description : 내가 참여한 컨퍼런스 리스트 들 조회
 * Params :
 * HTTP Body : 
 * Session : 필요함
 **/
function getMyConferenceList(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {
    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }

    var selectConference = 'SELECT p.participation_id, p.user_id, p.participation_type_id, ' +
                           'p.is_valid par_valid, c.conference_id, c.title, c.start_time, c.end_time, ' +
                           'c.description, c.address, c.latitude, c.longitude, c.is_vaild conf_valid ' +
                            'FROM participation p join conference c on c.conference_id = p.conference_id ' +
                            'WHERE p.user_id= ?';
    var placeHolders =[req.user.user_id];

    connection.query(selectConference, placeHolders, function(err, rows, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }

      var myConferenceList = {
        success : 1,
        result : []
      };

      async.each(rows, function(row, cb) {
        myConferenceList.result.push(row);
        cb();
      }, function(err) {
        if (err) {
          global.logger.error('에러발생');
          connection.release();
          return next(err);
        }
        res.json(myConferenceList);
        global.logger.debug('데이터베이스 연결을 종료합니다. from getMyConferenceList');
        connection.release();
      });
    }); //end of connection
  }); // end of global.connectionPool
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