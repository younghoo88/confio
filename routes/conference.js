var express = require('express');
var router = express.Router();
var  cuid = require('cuid');
var  async = require('async');

/**
 * File Name : conference.js
 * Description : '/conference/'로 들어오는 RESTful API를 받아서 처리한다
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
 * URL : post /conference
 * Description : conference 테이블에 제목, 시작시간, 종료시간, 설명,
 *              주소, 위도, 경도, 컨퍼런스 코드, 컨퍼런스 진행여부 값을 insert
 * Params :
 * Session : 필요함
 **/
function createConference(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {

    // 컨퍼런스 입장 코드 생성
    var conferenceCode = cuid.slug();
    // conference table에 insert 될 객체
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

    /* Table : conference (컨퍼런스)
     * Columns : title(제목), start_time(시작시간), end_time(끝나는 시간), description(설명),
     *           address(주소), latitude(위도), longitude(경도), code(컨퍼런스 고유 코드), is_open(현재 진행 유무)
     * Query 설명 : conference 정보를 최초 insert하는 query
      *  */
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

      // insert가 성공적으로 되었을경우
      res.json(result);
      global.logger.debug('데이터베이스 연결을 종료합니다.');
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
} // end of createConference
/** NOT COMPLETE & NEED TO CODE NEITHER **/
function editConference(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '컨퍼런스 정보 수정이 정상적으로 되었습니다.'
    }
  };
  res.json(result);
}
/** NOT COMPLETE & NEED TO CODE NEITHER **/
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
 * Description :  confernece와 user 테이블 사이의 관계 정의 하는
 * Params :
 * Session : 필요함
 **/
function createParticipation(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {

    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }
    /* Table     : participation
     * Columns   : user_id(user의 테이블의 PK),
     *              participation_type_id (참여 타입 아이디), conference_id (PK of conference)
     * Query 설명 : 회원(user)와 conference 관의 관계 정의(참여자, 주최자, 운영자, 발표자)*/
    var insertQuery = 'INSERT INTO participation ' +
                      '(user_id, participation_type_id, conference_id) ' +
                      ' VALUES (?, ? ,?)';
    var placeHolders =[];
    connection.query(insertQuery, [req.body.user_id, req.body.participation_type_id, req.body.conference_id], function(err, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }
      //competed insert
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
/** NOT COMPLETE & NEED TO CODE NEITHER **/
function editParticipation(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '회원 타입이 정상적으로 변경되었습니다.'
    }
  };
  res.json(result);
}
/**DONE **/
function searchEmail(req, res, next) {  //이메일 ~로 시작하는 LIST 5개씩 보냄
  global.connectionPool.getConnection(function(err, connection) {
    global.logger.debug('HERE I AM FROM searchEmail');
    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }

    var headQuery = 'SELECT email ' +
                      'FROM user ' + //
                       'WHERE email like \'';
    var selectQuery = headQuery + req.params.emailLetter + '%\' ' +'limit 5';//

    connection.query(selectQuery, [], function(err, rows, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }
    // 결과값을 담을 Result
    var result = {
      success : 1,
      emailList : []
    };
     async.each(rows, function(row, cb) {
       result.emailList.push(row);
       cb();
     }, function(err){
       if(err){
         global.logger.error('에러발생');
         connection.release();
         return next(err);
       }
       res.json(result);
       connection.release();

     }); //end of async


    }); //end of connection
  }); // end of global.connectionPool
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
/** NOT COMPLETE & NEED TO CODE NEITHER **/
function editTrack(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '트랙 정보가 정상적으로 수정되었습니다.'
    }
  };
  res.json(result);
}
/** NOT COMPLETE & NEED TO CODE NEITHER **/
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
/** NOT COMPLETE & NEED TO CODE NEITHER **/
function editSession(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '세션정보가 정상적으로 수정되었습니다.'
    }
  };
  res.json(result);
}
/** NOT COMPLETE & NEED TO CODE NEITHER **/
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
 * Name : createParticipation
 * URL : POST /confernece/participation
 * Description :  confernece와 user 테이블 사이의 관계 정의 하는
 * Params :
 * Session : 필요함
 **/
function getConferenceInfo(req, res, next) {

  var conferenceId = req.params.conference_id;
  // var trackId = req.body.track_id;

  process.nextTick(function() {
    async.waterfall([

      // 컨퍼런스 정보 가져오기 & 컨퍼런스 정보 유효한지 확인
      function(callback) {
        process.nextTick(function() {
          global.connectionPool.getConnection(function(err, connection) {
            if (err) {
              // 에러처리
              err.message= '요청 에러';
              connection.release();
              callback(err);
            }
            // conference 정보
            //TODO : Conference column is_vaild--> is_valid
            var query = "SELECT conference_id, title, start_time, end_time, description, address, " +
              "latitude, longitude, code, is_open, is_vaild " +
              "FROM conference " +
              "WHERE conference_id = ?";
            var placeHolders = [conferenceId];

            connection.query(query, placeHolders, function(err, rows, fields) {
               if (err) {
                    // 에러처리
                    connection.release();
                    err.message=' 컨퍼런스 정보 조회 중 에러 ';

                    // 로그찍고
                    // 콜백을 하든 넥스트를 하든
               }
              // check if data exists
               if (rows.length === 0) {
                  res.status(200).json({
                    success: 0,
                    message: '조회한 컨퍼런스는 정보가 없습니다'
                  });
                  return;
               }
              // check if data is valid
              if (rows[0].is_vaild === 0) {
                res.status(200).json({
                  success: 0,
                  message: '조회한 컨퍼런스는 삭제되었습니다'
                });
                return;
              }
              global.logger.debug('컨퍼런스 조회 완료!');
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
              //TODO : 나중에 sequnece -> sequence로 변경
              var selectTrackQuery = "SELECT track_id, conference_id, sequnece, title, place, is_valid " +
                                      "FROM track " +
                                      "WHERE conference_id= ?";
              var placeHolders = [conferenceId];

              connection.query(selectTrackQuery, placeHolders, function(err, rows, fileds) {
                if (err) {
                  connection.release();
                  return parallelCallback(err);
                }
                global.logger.debug('selectTrackQuery 데이터베이스 연결 종료');
                connection.release();
                parallelCallback(null, rows);
              });//end of connection query
            }); // end of global.pool.getconnection
          }, // end of function
          // 세션 정보 가져오기
          sessions : function(parallelCallback) {
            global.connectionPool.getConnection(function(err, connection) {

              var selectSessionQuery = "SELECT session_id, participation_id, category_id, track_id, title, description, " +
                                        "presentation_url, start_time, end_time, is_valid " +
                                        "FROM session " +
                                        "WHERE track_id = ? and is_valid=1";
              var placeHolders = [confInfo.conference_id]; //TODO where 동적 조건으로
              connection.query(selectSessionQuery, placeHolders, function(err, rows, fileds) {
                if (err) {
                  connection.release();
                  return parallelCallback(err);
                  //TODO: get to clean error stuff
                }
                global.logger.debug('session 조건 조회완료!');
                global.logger.debug('Result of sessionInfo : ' + rows + rows[0]);
                parallelCallback(null, rows);
              }); //end of connection query
              global.logger.debug('selectSessionQuery 데이터베이스 연결 종료');
              connection.release();
            });
          }
        }, function(err, results) {
          if (err) {
              callback(err);
          }
          // console.log(results);
          //global.logger.debug('results[track] : ' + results['tracks']);
          //global.logger.debug('results[session] : ' + results['sessions']);
          callback(null, confInfo, results['tracks'], results['sessions']);
        }); // async.parallel
      },
      // 가져온 정보 가공하기
      function(confInfo, trackInfo, sessionInfo, callback) {
        global.logger.debug('trackInfo : ' + trackInfo);

        var processedConferenceInfo = {
            "conferenceId" : confInfo.conference_id,
            "title" : confInfo.title,
            "startTime" : confInfo.start_time,
            "endTime" : confInfo.end_time,
            "description" : confInfo.description,
            "address" : confInfo.address,
            "latitude" : confInfo.latitude,
            "longitude" : confInfo.longitude,
            "code" : confInfo.code,
            "isOpen" :  confInfo.is_open,
            "isValid" : confInfo.is_vaild,
            "track" : []
        }; // finished processing confInfo

        //started processing trackInfo
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
        global.logger.debug('here i am! finished processing trackInfo');

        console.log(processedConferenceInfo.track);

      //  console.log(processedConferenceInfo.track.session);
        global.logger.debug('printed processedConferenceInfo.track.session');
        global.logger.debug(processedConferenceInfo.track[0].title);
        global.logger.debug(processedConferenceInfo.track[0].session);

        //started processing sessionInfo
        if(sessionInfo === null) {
          processedConferenceInfo.track.session = null;
        } else {
          async.each(sessionInfo, function(element, cb) {
            global.logger.debug('from 417 :' + element.session_id);
            processedConferenceInfo.track[0].session.push(element);
            global.logger.debug('!!!!processing sessionInfo complete!!!!!!!');
            cb();
          }, function(err) {
            if (err) {
              return next(err);
            }
          });
          global.logger.debug('here i am! finished processing sessionInfo');

        } //finished processing sessionInfo
        callback(null, processedConferenceInfo);
      }
    ], function(err, result) {
        if (err) {
          global.logger.debug('waterfall 에러발생');
          global.logger.error(err);
          err.message = '컨퍼런스 정보 조회 중 오류 발생';
          return next(err);
        }

        global.logger.debug('정보 조회 성공');
        res.json(result);
    }); // end of async.waterfall
  }); // end of process.nextTick();
}

router.route('/')
  .post(createConference)
  .put(editConference)
  .delete(deleteConference);

router.route('/participation/:emailLetter')
  .post(createParticipation)
  .put(editParticipation)
  .get(searchEmail);
router.route('/track')
  .post(createTrack)
  .put(editTrack)
  .delete(deleteTrack);
router.route('/track/session')
  .post(createSession)
  .put(editSession)
  .delete(deleteSession);
router.get('/:conference_id', getConferenceInfo);

module.exports = router;