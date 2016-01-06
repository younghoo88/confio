var express = require('express');
var router = express.Router();
var cuid = require('cuid');
var async = require('async');
var util = require('util');
var nodemailer = require('nodemailer');
var smtpPool = require('nodemailer-smtp-pool');
var authConfig = require('../config/auth');

/**
 * File Name : conference.js
 * Description : '/conference'로 들어오는 RESTful API를 받아서 처리한다
 * Function : 1. createConference
 *            2. editConference
 *            3. deleteConference
 *            4. createParticipation
 *            5. editParticipation
 *            6. createTrack
 *            7. editTrack
 *            8. deleteTrack
 *            9. createSession
 *            10. editSession
 *            11. deleteSession
 *            12. getConferenceInfo
 * */

/**
 * Name : createConference
 * URL : POST /conference
 * Description : 컨퍼런스 기본정보 입력
 *              conference 테이블에 제목, 시작시간, 종료시간, 설명,
 *              주소, 위도, 경도, 컨퍼런스 코드, 컨퍼런스 진행여부 값을 insert
 * Params : title, start_time, end_time, description, address, longitude, latitude
 * HTTP Message Body :
 * Session : 필요함
 **/
function createConference(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {

    // TODO : 삭제예정(처음엔 null 처리)
    // 컨퍼런스 입장 코드 생성
    var conferenceCode = cuid.slug();

    // conference table에 insert 될 객체
    var placeHolder = [
      req.body.title,
      req.body.start_time,
      req.body.end_time,
      req.body.description,
      req.body.address,
      req.body.latitude,
      req.body.longitude,
      conferenceCode,
      1
    ];

    /* Table : conference (컨퍼런스)
     * Columns : title(제목), start_time(시작시간), end_time(끝나는 시간), description(설명),
     *           address(주소), latitude(위도), longitude(경도), code(컨퍼런스 고유 코드), is_open(현재 진행 유무)
     * Query 설명 : conference 정보를 최초 insert하는 query
      *  */
    var insertQuery = 'INSERT INTO conference ' +
                      '(title, start_time, end_time, description, address, latitude, longitude, code, is_open) ' +
                      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    connection.query(insertQuery, placeHolder, function(err, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        return next(err);
      }

      var result = {
        success : 1,
        result : {
          message : '컨퍼런스가 정상적으로 등록되었습니다.',
          conference_id : info.insertId // 생성된 컨퍼런스의 conference_id를 응답으로 보낸다.
        }
      };
      res.json(result);
      global.logger.debug('데이터베이스 연결을 종료합니다.');
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
} // end of createConference

/* DOESN'T COMPLETE YET */
function editConference(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '컨퍼런스 정보 수정이 정상적으로 되었습니다.'
    }
  };
  res.json(result);
}

/* DOESN'T COMPLETE YET */
function deleteConference(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '컨퍼런스 정보 삭제가 정상적으로 되었습니다.'
    }
  };
  res.json(result);
}

/**
 * Name : createParticipation
 * URL : POST /confernece/participation
 * Description : 컨퍼런스에 속하게 될 운영진, 발표자, 참가자를 등록한다.
 * Params :
 * HTTP Body : email, conference_id, participation_type
 * Session : 필요함
 **/
function createParticipation(req, res, next) {

  /**
   * async.series
   *
   * task 순서
   *
   * 회원의 타입이 등록
   *
   *
   */
  async.waterfall([
    function insertToParticipation(callback) {
      global.connectionPool.getConnection(function(err, connection) {
        if (err) {
          global.logger.debug('async.waterfall() insertToParticipation() db connection 중 에러 발생');
          connection.release();
          return callback(err);
        }

        /*
         * Table     : participation
         * Columns   : user_id(user의 테이블의 PK),
         *              participation_type_id (참여 타입 아이디), conference_id (PK of conference)
         * Query 설명 : 회원(user)와 conference 관의 관계 정의(참여자, 주최자, 운영자, 발표자)
         * */
        var insertQuery = 'INSERT INTO participation ' +
                          '(user_id, participation_type_id, conference_id) ' +
                          'VALUES (?, ? ,?)';

        var placeHolder =[
          req.body.user_id,
          req.body.participation_type_id,
          req.body.conference_id
        ];

        connection.query(insertQuery, placeHolder, function(err, info) {
          if (err) {
            global.logger.debug('insert query 수행 중 에러 발생');
            connection.release();
            return callback(err);
          }

          global.logger.debug('회원이 컨퍼런스에 등록되었습니다.');
          global.logger.debug('데이터베이스 연결을 종료합니다.');
          connection.release();
          callback(null, req.body.user_id);
        }); //end of connection
      });
    },

    function getUserMailAndCode(userId, callback) {

      async.parallel({
        email : function getUserMail(cb) {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.debug('async.parallel() getUserMail() db connection 중 에러 발생');
              connection.release();
              return cb(err);
            }

            var selectQuery = 'SELECT email ' +
                              'FROM user ' +
                              'WHERE user_id = ?';

            connection.query(selectQuery, [userId], function(err, rows, fields) {
              if (err) {
                global.logger.debug('email 조회 중 에러 발생');
                connection.release();
                return cb(err);
              }

              global.logger.debug('email 조회 성공');
              cb(null, rows[0].email);
            }); // end of connection.query()
          }); // end of global.connectionPool.getConnection()
        },
        code : function getCode(cb) {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              global.logger.debug('async.parallel() getCode() db connection 중 에러 발생');
              connection.release();
              return cb(err);
            }

            var selectQuery = 'SELECT code ' +
                              'FROM conference ' +
                              'WHERE conference_id = ?';

            connection.query(selectQuery, [req.body.conference_id], function(err, rows, fields) {
              if (err) {
                global.logger.debug('conference code 조회 중 에러 발생');
                connection.release();
                return cb(err);
              }

              global.logger.debug('conference code 조회 성공');
              cb(null, rows[0].code);
            });
          });
        }
      }, function(err, result) {
        if (err) {
          global.logger.debug(err);
          return callback(err);
        }
        global.logger.debug('email 및 code 조회 task 성공');
        callback(null, result.email, result.code);
      });
    }, // end of getUserMail() task

    function sendMailToUser(email, code, callback) {

      var transporter = nodemailer.createTransport(smtpPool({
        service: authConfig.gmailAuth.service,
        auth : {
          user : authConfig.gmailAuth.user,
          pass : authConfig.gmailAuth.pass
        },
        maxConnections : 5,
        maxMessages : 10
      }));

      global.logger.debug('조회된 email : ' + util.inspect(email));
      global.logger.debug('조회된 code : ' + util.inspect(code));

      var mailOption = {
        from : 'confio.d2fest@gmail.com',
        to : [email],
        subject : '안녕하세요! Conf.io 입니다.',
        text : 'hello world, code는 다음과 같습니다.' + code,
        html : '<h1>환영합니다!</h1><p>아래 코드를 입력하여 컨퍼런스에 참여하세요!</p><p>' + code + '</p>'
      };

      transporter.sendMail(mailOption, function(err, info) {
        if (err) {
          global.logger.debug('sendMail메소드 수행중 에러 발생');
          global.logger.debug(err);
          transporter.close();
          return callback(err);
        }

        transporter.close();
        global.logger.debug('메일이 정상적으로 전송되었습니다.');
        callback(null);
      });
    } // end of sendMailToUser() task
  ], function(err, result) {
    if (err) {
      global.logger.debug(err);
      global.logger.debug('회원 타입 등록 중 에러 발생');
      return next(err);
    }
    global.logger.debug('회원 타입 등록 및 컨퍼런스 코드 이메일 전송이 완료되었습니다.');
    res.status(200).json({
      success : 1,
      result : {
        message : '회원 타입 등록 및 컨퍼런스 코드 이메일 전송이 완료되었습니다.'
      }
    });
  });
} // end of addParticipation

/* DOESN'T COMPLETE YET */
function editParticipation(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '회원 타입이 정상적으로 변경되었습니다.'
    }
  };
  res.json(result);
}
/**
* Name : createTrack
* URL :
* Description :
* Params :
* Session :
**/
function createTrack(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {

    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }

    var insertQuery = 'INSERT INTO track ' +
                      '(conference_id, sequnece, title, place) ' +
                      'VALUES (?, ?, ?, ?)';

    connection.query(insertQuery, [req.body.conference_id, req.body.sequnece, req.body.title, req.body.place], function(err, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }

      var result = {
        success : 1,
        result : {
          message : '트랙 정보가 정상적으로 등록되었습니다.'
        }
      };

      res.json(result);
      global.logger.debug('데이터베이스 연결을 종료합니다.');
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
}

/* DOESN'T COMPLETE YET */
function editTrack(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '트랙 정보가 정상적으로 수정되었습니다.'
    }
  };
  res.json(result);
}

/* DOESN'T COMPLETE YET */
function deleteTrack(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '트랙 정보가 정상적으로 삭제되었습니다.'
    }
  };
  res.json(result);
}

/**
 * Name : createParticipation
 * URL : POST /confernece/participation
 * Description :  confernece와 user 테이블 사이의 관계 정의 하는
 * Params :
 * Session : 필요함
 **/
function createSession(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {
    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }

    var insertQuery = 'INSERT INTO session ' +
      '(participation_id, category_id, category_conference_id, track_id, title, description, start_time, end_time) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var placeHolder = [
        req.body.participation_id,
        req.body.category_id,
        req.body.category_conference_id,
        req.body.track_id,
        req.body.title,
        req.body.description,
        req.body.start_time,
        req.body.end_time
      ];

    connection.query(insertQuery, placeHolder, function(err, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }

      var result = {
        success : 1,
        result : {
          message : '세션 정보가 정상적으로 등록되었습니다.'
        }
      };

      res.json(result);
      global.logger.debug('데이터베이스 연결을 종료합니다. from createSession');
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
}

/* DOESN'T COMPLETE YET */
function editSession(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '세션정보가 정상적으로 수정되었습니다.'
    }
  };
  res.json(result);
}

/* DOESN'T COMPLETE YET */
function deleteSession(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '세션이 정상적으로 삭제되었습니다.'
    }
  };
  res.json(result);
}

/**
 * Name : getConferenceInfo
 * URL : POST /confernece/:conference_id
 * Description :  컨퍼런스 정보 조회
 * Params : conference_id
 * Session : 필요없음
 **/
function getConferenceInfo(req, res, next) {

  var conferenceId = req.params.conference_id;
  /**
   * 전체 정보 가져오기
   *
   * async 모듈을 사용하여 컨퍼런스 정보를 조회한다. 정보를 조회하는 순서는 아래와 같다.
   *
   * [async.waterfall] -- task 1 : getConferenceInfo (컨퍼런스 id로 컨퍼런스 정보 조회)
   *                   |           다음 task로 조회된 컨퍼런스 객체(conferenceInfo)를 넘긴다.
   *                   |
   *                   |- task 2 : getTrackInfo (컨퍼런스 id로 트랙 정보 조회)
   *                   |           다음 task로 컨퍼런스 객체와 조회된 트랙 배열(trackArrInfo)을 넘긴다.
   *                   |
   *                   |- task 3 : getSessionInfo (세션 정보 조회)
   *                               |
   *                               |- [async.each] - track 배열 요소(트랙 객체)를 한개씩 뽑아 트랙 객체의 track_id로 세션정보를 조회,
   *                                               | track.session 배열 프로퍼티에 추가한다. 이 과정을 waterfall을 사용하여 단계별로 진행한다.
   *                                               |
   *                                               |- [async.waterfall] -- task 1 : pushTrackToConferenceInfo
   *                                                                    |           conferenceInfo객체의 track 배열 property에 한개의 track 객체를 push함.
   *                                                                    |- task 2 : getSession
   *                                                                    |           track_id에 해당하는 session 배열을 조회한다.
   *                                                                    |- task 3 : pushToTrack
   *                                                                    |           해당하는 track객체에 session 배열 프로퍼티를 추가하고,
   *                                                                    |           조회된 session 배열을 저장한다.
   */
  async.waterfall([

    function getConferenceInfo(callback) {
      global.connectionPool.getConnection(function(err, connection) {
        if (err) {
          global.logger.debug('getConferenceInfo() db connection 중 에러 발생');
          global.logger.debug(err);
          return callback(err);
        }

        var selectQuery = "SELECT conference_id, title, start_time, end_time, description, address, " +
          "latitude, longitude, code, is_open, is_valid " +
          "FROM conference " +
          "WHERE conference_id = ?";
        var placeHolders = [conferenceId];
        connection.query(selectQuery, placeHolders, function(err, rows, fields) {
          if (err) {
            global.logger.debug('컨퍼런스 정보 조회 중 에러 발생');
            connection.release();
            return callback(err);
          }

          if (rows.length === 0) {
            res.status(200).json({
              success : 0,
              message : '조회한 컨퍼런스는 정보가 없습니다.'
            });
            connection.release();
            return;
          }

          if (rows.is_valid === 0) {
            res.status(200).json({
              success : 0,
              message : '조회한 컨퍼런스는 삭제되었습니다.'
            });
            connection.release();
            return;
          }

          global.logger.debug('컨퍼런스 조회 완료');
          global.logger.debug('데이터베이스 연결을 종료합니다.');
          connection.release();
          callback(null, rows[0]); // 조회된 컨퍼런스 정보(객체)를 다음 task 함수로 넘긴다.
        });
      });
    },
    function getTrackInfo(conferenceInfo, callback) {

      global.connectionPool.getConnection(function(err, connection) {

        if (err) {
          global.logger.debug('getTrackInfo() db connection 중 에러 발생');
          connection.release();
          return callback(err);
        }

        // 트랙정보 가져오기
        var selectTrackQuery = "SELECT track_id, conference_id, sequnece, title, place, is_valid " +
          "FROM track " +
          "WHERE conference_id= ?";
        var placeHolders = [conferenceId];

        connection.query(selectTrackQuery, placeHolders, function(err, rows, fields) {
          if (err) {
            global.logger.debug('트랙 정보 조회 중 에러 발생');
            connection.release();
            return callback(err);
          }

          global.logger.debug('트랙 정보 조회 완료');
          connection.release();
          global.logger.debug('track 정보 : ' + util.inspect(rows));
          callback(null, conferenceInfo, rows); // 컨퍼런스 정보(객체)와 트랙 정보(배열)를 다음 task함수로 넘긴다.
        });
      });
    },
    function getSessionInfo(conferenceInfo, trackArrInfo, callback) {

      global.logger.debug('getSessionInfo task 진입');
      global.logger.debug('conferenceInfo : ' + util.inspect(conferenceInfo));
      global.logger.debug('trackInfo : ' + util.inspect(trackArrInfo));

      conferenceInfo.track = [];

      global.logger.debug('async.each 시작');
      async.each(trackArrInfo, function(track, cb) {

        global.logger.debug('async.waterfall 시작');
        async.waterfall([

          function pushTrackToConferenceInfo(sessionCallback) {
            global.logger.debug('track : ' + util.inspect(track));
            conferenceInfo.track.push(track); // conferenceInfo객체의 track 배열 property에 한개의 track 객체를 push함
            sessionCallback(null, conferenceInfo.track.length-1);
          },

          function getSession(trackIndex, sessionCallback) {
            global.connectionPool.getConnection(function(err, connection) {
              if (err) {
                global.logger.debug('getSessionInfo() db connection 중 에러 발생');
                connection.release();
                return sessionCallback(err);
              }

              global.logger.debug('track index : ' + trackIndex);
              global.logger.debug('track id : ' + track.track_id);

              var selectSessionQuery = "SELECT session_id, participation_id, category_id, track_id, title, description, " +
                "presentation_url, start_time, end_time, is_valid " +
                "FROM session " +
                "WHERE track_id = ? and is_valid = 1";

              var placeHolder = [track.track_id];

              connection.query(selectSessionQuery, placeHolder, function(err, rows, fields) {

                if (err) {
                  global.logger.debug('세션 정보 조회 중 에러 발생');
                  connection.release();
                  return sessionCallback(err);
                }
                connection.release();
                global.logger.debug('데이터베이스 연결을 종료합니다.');
                sessionCallback(null, trackIndex, rows);
              });
            });
          },

          function pushToTrack(trackIndex, sessionInfo, sessionCallback) {
            global.logger.debug('session property 추가 : ' + util.inspect(conferenceInfo.track[trackIndex]));
            try {
              conferenceInfo.track[trackIndex].session = sessionInfo;
            } catch (e) {
              global.logger.debug('session push 중 에러 발생 : ' + e);
            }
            sessionCallback(null);
          }
        ], function(err, result) {
          if (err) {
            return cb(err);
          }
          cb();
        });
      }, function(err) {
        if (err) {
          return callback(err);
        }
        global.logger.debug('iteration 완료');
        callback(null, conferenceInfo);
      });
    }
  ], function(err, result) {
    if (err) {
      global.logger.debug('에러 발생(async.waterfall error callback)');
      return next(err);
    }
    global.logger.debug('컨퍼런스 정보 조회 완료');
    res.json({
      success : 1,
      result : result
    });
  });
}

function sendEmail(req, res, next) {

  var email = req.body.email;
  var subject = req.body.subject;
  var content = req.body.content;
  var htmlContent = req.body.htmlContent;

  var transporter = nodemailer.createTransport(smtpPool({
    service: authConfig.gmailAuth.service,
    auth : {
      user : authConfig.gmailAuth.user,
      pass : authConfig.gmailAuth.pass
    },
    maxConnections : 5,
    maxMessages : 10
  }));

  var mailOption = {
    from : 'confio.d2fest@gmail.com',
    to : [email],
    subject : subject || '안녕하세요! Conf.io 입니다.',
    text : content || 'hello world',
    html : htmlContent || '<h1>hello world</h1>'
  };

  transporter.sendMail(mailOption, function(err, info) {
    if (err) {
      global.logger.debug('sendMail메소드 수행중 에러 발생');
      transporter.close();
      return next(err);
    }

    transporter.close();
    global.logger.debug('메일이 정상적으로 전송되었습니다.');
    res.json({
      success : 1,
      result : {
        message : '메일이 정상적으로 전송되었습니다.'
      }
    });
  });
}

function getConferenceId(req, res, next) {
  var conferenceCode = req.body.code;

  global.connectionPool.getConnection(function(err, connection) {
    if (err) {
      global.logger.debug('getConferenceId() db connection 중 에러 발생');
      connection.release();
      return next(err);
    }

    var selectQuery = 'SELECT conference_id ' +
                      'FROM conference ' +
                      'WHERE code = ?';

    connection.query(selectQuery, [conferenceCode], function(err, rows, fields) {
      if (err) {
        global.logger.debug('컨퍼런스 id 조회 중 에러 발생');
        connection.release();
        return next(err);
      }

      if (rows.length === 0) {
        return next({message : '존재하지 않는 컨퍼런스입니다. 코드를 다시 확인해보세요.'});
      }

      res.status(200).json({
        success : 1,
        result : {
          message : '컨퍼런스 id 조회가 성공적으로 이뤄졌습니다.',
          conference_id : rows[0].conference_id
        }
      });
    });
  });
}

router.route('/')
  .post(createConference)
  .put(editConference)
  .delete(deleteConference);
router.route('/participation')
  .post(createParticipation)
  .put(editParticipation);
router.route('/track')
  .post(createTrack)
  .put(editTrack)
  .delete(deleteTrack);
router.route('/track/session')
  .post(createSession)
  .put(editSession)
  .delete(deleteSession);
router.get('/sendEmail', sendEmail);
router.get('/:conference_id', getConferenceInfo);
router.post('/getConferenceId', getConferenceId);

module.exports = router;