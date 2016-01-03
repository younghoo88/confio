/*
* class name : conferenece.js
* function   : 컨퍼런스 정보 관리
* methods    : 1. createConference (Insert Database into conference table)
*
* */
var express = require('express'),
  router = express.Router(),
  cuid = require('cuid'),
  async = require('async');


// conference 정보를 최초 insert
function createConference(req, res, next) {

  global.connectionPool.getConnection(function(err, connection) {

    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }
    // 컨퍼런스 입장 코드 생성
    var conferenceCode = cuid.slug();

    var valuesToBeInserted = [
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

    var insertQuery = 'INSERT INTO conference ' +
                      '(title, start_time, end_time, description, address, latitude, longitude, code, is_open) ' +
                      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    connection.query(insertQuery, valuesToBeInserted, function(err, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }

      var result = {
        success : 1,
        result : {
          message : '컨퍼런스가 정상적으로 등록되었습니다.'
        }
      };

      res.json(result);
      global.logger.debug('데이터베이스 연결을 종료합니다.');
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
} // end of createConference

function editConference(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '컨퍼런스 정보 수정이 정상적으로 되었습니다.'
    }
  };
  res.json(result);
}

function deleteConference(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '컨퍼런스 정보 삭제가 정상적으로 되었습니다.'
    }
  };
  res.json(result);
}
// conference에 참여하는 user의 participation 관계 정의
function createParticipation(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {

    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }

    var insertQuery = 'INSERT INTO participation ' +
                      '(user_id, participation_type_id, conference_id) ' +
                      ' VALUES (?, ? ,?)';

    connection.query(insertQuery, [req.body.user_id, req.body.participation_type_id, req.body.conference_id], function(err, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }

      var result = {
        success: 1,
        result: {
          message: '회원 타입이 정상적으로 등록되었습니다.'
        }
      };

      res.json(result);
      global.logger.debug('데이터베이스 연결을 종료합니다.');
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
} // end of addParticipation

function editParticipation(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '회원 타입이 정상적으로 변경되었습니다.'
    }
  };
  res.json(result);
}

// track 테이블에 정보 입력
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
function editTrack(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '트랙 정보가 정상적으로 수정되었습니다.'
    }
  };
  res.json(result);
}

function deleteTrack(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '트랙 정보가 정상적으로 삭제되었습니다.'
    }
  };
  res.json(result);
}
/*
  descrption : session 테이블에 정보 입력
  variables :

 */
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
    var insertValues =
      [
        req.body.participation_id,
        req.body.category_id,
        req.body.category_conference_id,
        req.body.track_id,
        req.body.title,
        req.body.description,
        req.body.start_time,
        req.body.end_time
      ];

    connection.query(insertQuery, insertValues, function(err, info) {
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

function editSession(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '세션정보가 정상적으로 수정되었습니다.'
    }
  };
  res.json(result);
}

function deleteSession(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '세션이 정상적으로 삭제되었습니다.'
    }
  };
  res.json(result);
}

function getConferenceInfo(req, res, next) {

  var conferenceId = req.params.conference_id;
  var trackId = req.params.track_id;

  process.nextTick(function() {
    async.waterfall([
      // 컨퍼런스 정보 가져오기 & 컨퍼런스 정보 유효한지 확인
      function(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              // 에러처리
              err.message= '요청 에러';
              callback(err);
            }
            // conference 정보
            var query = "SELECT conference_id, title, start_time, end_time, description, address, " +
              "latitude, longitude, code, is_open, is_vaild " +
              "FROM conference " +
              "WHERE conference_id = ?",
              placeHolders = [conferenceId];

              connection.query(query, placeHolders, function(err, rows, fields) {
              if (err) {
                // 에러처리
                connection.release();
                err.message=' 컨퍼런스 정보 조회 중 에러 ';
                // 로그찍고
                // 콜백을 하든 넥스트를 하든
              }

              if (rows.length() === 0) {
                res.status(200).json({
                  success: 0,
                  message: '조회한 컨퍼런스는 삭제되었거나 정보가 없습니다'
                });
                return;
              }
              callback(null, rows[0]);
            }); // end of connection.query
          }); // end of  global.connectionPool.getConnection
        }); // end of process.nextTick
      },
      // 트랙정보 & 세션 정보
      function(confInfo, callback) {
        async.parallel({
          // 트랙정보 가져오기
          tracks : function(parallelCallback) {
            global.connectionPool.getConnection(function(err, connection) {
              var selectTrackQuery = "SELECT track_id, conference_id, sequence, title, place, is_valid " +
                                      "FROM track " +
                                      "WHERE conference_id= ?",
                placeHolders = [conferenceId];

              connection.query(selectTrackQuery, placeHolders, function(err, rows, fileds) {
                if (err) {
                  connection.release();
                  return callback(err);
                }

                callback(null, rows);
              });//end of connection query
            }); // end of global.pool.getconnection
          }, // end of function
          // 세션 정보 가져오기
          sessions : function(parallelCallback) {
            global.connectionPool.getConnection(function(err, connection) {
              var selectSessionQuery = "SELECT session_id, participation_id, category_id, track_id, title, description, " +
                                        "presentation_url, start_time, end_time, is_valid " +
                                        "FROM session " +
                                        "WHERE session_id = ? and is_valid=1";
              var placeHolders = [trackId];
              connection.query(selectSessionQuery, placeHolders, function(err, rows, fileds) {
                if (err) {
                  connection.release();
                  return callback(err);
                  // more clean error stuff
                }

                callback(null, rows);
              }); //end of connection query
            });
            connection.release();
          }
        }, function(err, results) {
          if (err) {
              callback(err);
          }
          callback(null, confInfo, results['track'], results['session']);
        }); // async.parallel
      },
      // 가져온 정보 가공하기
      function(confInfo, trackInfo, sessionInfo, callback) {
        var processedConferenceInfo ={}; // confio 총 정리할 객체
        // if confInfo doesn't exist
        if (confInfo === null)
          processedConferenceInfo.confInfo = null;
        processedConferenceInfo.confInfo = {
            "conferenceId" : confInfo.conference_id,
            "title" : confInfo.title,
            "startTime" : confInfo.start_time,
            "endTime" : confInfo.end_time,
            "description" : confInfo.description,
            "address" : confInfo.address,
            "latitude" : confInfo.latitude,
            "longtitude" : confInfo.longtitude,
            "code" : confInfo.code,
            "isOpen" :  confInfo.is_open,
            "isValid" : confInfo.is_vaild,
            "track" : []
        }; // finished processing confInfo
        //started procesing trackInfo
        if(trackInfo === null) {
          processedConferenceInfo.track = null;
        } else {
          async.each(trackInfo, function(element, cb) {
            element.session = [];
            processedConferenceInfo.track.push(element);
            cb();
          }, function(err) {
            if (err) {
              return next(err);
            }
          });
        } // end of else, which means ending of processing trackInfo

        //started processing sessionInfo
        if(sessionInfo === null) {
          processedConferenceInfo.track.session = null;
        } else {
          async.each(sessionInfo, function(element, cb) {
            processedConferenceInfo.track.session.push(element);
            cb();
          }, function(err) {
            if (err) {
              return next(err);
            }
          });
        }
        //finished processing sessionInfo
      }
    ], function(err, result) {
        if (err) {
          connection.rollback(function() {
            global.logger.error('from near line 352');
            global.logger.error(err);
            err.message = '정보 조회 중 오류 발생'
            connection.release();
            return next(err);
          }); // end of connection.rollback
        } //if

      global.logger.debug('정보 조회 성공');
      connection.release();
    }); // end of async.waterfall


    global.connectionPool.getConnection(function(err, connection) {
      if (err) {
        // 에러처리
      }


    }); // end of global.connectionPool.getConnection()
  }); // end of process.nextTick();
  var result = {
    success : 1,
    result : {
      message : '컨퍼런스 정보를 정상적으로 가져왔습니다.',
      conference : {
        id : 1,
        title : 'NaverD2FEST',
        start_time : '2015-01-06 08:00',
        end_time : '2015-01-06 18:00',
        description : '네이버 대학생 오픈소스 경진대회',
        address : '경기도 성남시 분당구 네이버 그린팩토리',
        latitude : '37.3595122',
        longitude : '127.1052208',
        track : [
          {
            id : 1,
            order : 1,
            title : '웹프로그래밍',
            place : 'A홀',
            session : [
              {
                id : 1,
                title : 'Facebook React.js',
                description : 'Facebook React.js에 대해서 알아봅니다.',
                start_time : '2015-01-06 10:00',
                end_time : '2015-01-06 12:00'
              },
              {
                id : 2,
                title : 'Angular.js',
                description : 'Typescript와 함께 시작하는 Angular 2',
                start_time : '2015-01-06 13:00',
                end_time : '2015-01-06 15:00'
              }
            ]
          },
          {
            id : 2,
            order : 2,
            title : '안드로이드 프로그래밍',
            place : 'B홀',
            session : [
              {
                id : 3,
                title : 'Material Design',
                description : '구글의 새로운 디자인 기준, Material Design에 대해 알아봅니다.',
                start_time : '2015-01-06 10:00',
                end_time : '2015-01-06 12:00'
              }
            ]
          }
        ]
      }
    }
  };
  res.json(result);
}

router.route('/')
  .post(createConference)
  .put(editConference)
  .delete(deleteConference)
router.route('/participation')
  .post(createParticipation)
  .put(editParticipation)
router.route('/track')
  .post(createTrack)
  .put(editTrack)
  .delete(deleteTrack)
router.route('/track/session')
  .post(createSession)
  .put(editSession)
  .delete(deleteSession)
router.get('/:conference_id', getConferenceInfo);

module.exports = router;