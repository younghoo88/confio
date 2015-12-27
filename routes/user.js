var express = require('express');
var router = express.Router();

/**
 * 회원가입
 * @param req
 * @param res
 * @param next
 */
function join(req, res, next) {
  global.logger.debug('name : ' + req.body.name);
  global.logger.debug('email : ' + req.body.email);

  var result = {
    success : 1,
    result : {
      message : '가입이 정상적으로 처리되었습니다.'
    }
  };
  res.json(result);
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
function checkEmail(req, res, next) {
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
function deleteUser(req, res, next) {
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
function getMyConferenceList(req, res, next) {
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

router.post('/', join);
router.post('/login', login);
router.get('/logout', logout);
router.put('/change', editUser);
router.get('/mailCheck/:email', checkEmail);
router.delete('/delete', deleteUser);
router.get('/myconferencelist', getMyConferenceList);

module.exports = router;