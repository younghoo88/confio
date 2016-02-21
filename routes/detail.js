var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');
var session = require('../config/session').sessionMiddleware;
var util = require('util');
var async = require('async');
/**
 * File Name : detail.js
 * Description : '/detail'로 들어오는 RESTful API를 받아서 처리한다
 * Function : 1. getSession
 *            2. getSessionQuestion
 *            3. addQuestion
 *            4. editQuestion
 *            5. deleteQuestion
 *            6. addAnswer
 *            7. deleteAnswer
 *            8. addQuestionLike
 *            9. addAnswerLike
 *
 * */
io.use(function(socket, next) {
  session(socket.request, socket.request.res, next);
});
 server.listen(8080); // 소켓 서버 구동

/**
 * MongoDB 구현부분
 *
 */
mongoose.connect('mongodb://localhost/test'); // test db에 접속

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Message Schema 정의
var savedMessageSchema = mongoose.Schema({
  id : ObjectId,
  name : String,
  email : String,
  conference_id : Number,
  track_id : Number,
  session_id : Number,
  message : String,
  create_time : String
});

var savedMessageModel = mongoose.model('savedMessageModel', savedMessageSchema);
var savedMessage = new savedMessageModel();

/**
 * Socket.io 구현부분
 * 각 세션을 socket.io의 room 기능을 통해 구현하였다.
 */
// TODO : 컨퍼런스 기간이 끝난 이후에는 해당 room을 들어가지 못하게 구현해야할듯
// TODO : 하나의 객체에 이 서비스의 모든 방정보를 담기보다는 다른 방법이 필요하다
var roomInfo = {};

io.on('connection', function(socket) {
  var session = socket.request.session;
  var user = session.passport.user; // session store에 저장된 user 객체(name, email, password 정보를 갖고 있다)
  var numOfMessages = 2; // client에서 message fetching할때마다 보여줄 message 갯수(DEFAULT = 5)

  // join event 처리
  socket.on('join', function(data) { // room 정보 받음
    if (!roomInfo.hasOwnProperty(data.room)) { // 최초 생성시
      roomInfo[data.room] = [];
    }
    roomInfo[data.room].push(user);

    socket.join(data.room);
    global.logger.debug('--------------------');
    global.logger.debug('room 정보 : ' + data.room);
    global.logger.debug('이용자 소켓정보 : ' + roomInfo[data.room]);
    global.logger.debug('이용자 정보 : ' + util.inspect(user));
    global.logger.debug('이용 인원 : ' + roomInfo[data.room].length);
    socket.room = data.room; // 해당 소켓이 room 정보를
    io.to(socket.room).emit('joinMessage', {user : user, time : new Date()});
    global.logger.debug('--------------------\n');
  });

  // message 처리
  socket.on('fromClient', function(data) {
    global.logger.debug('--------------------');
    global.logger.debug('[fromClient event 발생] ' + '[' + user.name + '] : ' + data.msg + ' 보낸 시간 : ' + data.time);
    global.logger.debug('--------------------\n');
    data.userName = user.name;

    io.to(socket.room).emit('fromServer', data); // 자신이 속한 room으로 data 전송

    if (data.save === true) { // save 옵션에 따라 DB에 저장 유무 판별
      // mongoDB에 저장
      var savedMessage = new savedMessageModel();
      savedMessage.name = user.name;
      savedMessage.email = user.email;
      savedMessage.conference_id = data.conference_id;
      savedMessage.track_id = data.track_id;
      savedMessage.session_id = data.session_id;
      savedMessage.message = data.msg;
      savedMessage.create_time = data.time;
      savedMessage.save(function(err, next) {
        if (err) {
          return next();
        }
        global.logger.debug('--------------------');
        global.logger.debug('DB에 메시지 내용을 저장하였습니다.');
        global.logger.debug('--------------------\n');
      });
    }
  });

  socket.on('showMessage', function(data) {
    savedMessageModel.find({
      conference_id : data.conference_id,
      track_id : data.track_id,
      session_id : data.session_id
    }).
    skip((data.pageNum - 1) * numOfMessages).
    limit(numOfMessages).
    sort({ create_time : -1 }).
    exec(function(err, savedMessage) {
      if (err) { // TODO : error 처리 추가해야함
        global.logger.debug('DB 접근중 오류가 발생하였습니다.');
      }
      global.logger.debug(util.inspect(savedMessage));
      socket.emit('messageList', {messageList : savedMessage.reverse(), pageNum : data.pageNum});
    });
  });

  // disconnect event 처리
  socket.on('disconnect', function(data) {
    global.logger.debug('--------------------');
    global.logger.debug('[disconnect event 발생]');
    global.logger.debug('socket.room : ' + socket.room);
    // TODO : undefined 처리
    if (roomInfo[socket.room] !== undefined) {
      var deleteIndex = roomInfo[socket.room].indexOf(socket.id);
      roomInfo[socket.room].splice(deleteIndex, 1);
    }
    io.to(socket.room).emit('fromServer', {msg : user.email + '님이 나가셨습니다.', time : new Date()});
    global.logger.debug('--------------------\n');
  });
});

function getChat(req, res, next) {
  var conference_id = req.params.conference_id;
  var track_id = req.params.track_id;
  var session_id = req.params.session_id;

  res.render('index', {conference_id : conference_id, track_id : track_id, session_id : session_id});
}

/** NOT COMPLETE & NEED TO CODE NEITHER **/
function getSession(req, res, next) {
  var conference_id = req.params.conference_id;
  var track_id = req.params.track_id;
  var session_id = req.params.session_id;

  // 페이지 렌더링
  // client event 처리용이고 angular와 합칠때 제거 예정
  // res.render('index', {conference_id : conference_id, track_id : track_id, session_id : session_id});

  global.connectionPool.getConnection(function(err, connection) {

    if (err) {
      global.logger.debug(err);
      connection.release();
      return next(err);
    }

    var selectQuery = 'SELECT c.conference_id, c.title, c.description, c.address, c.code, ' +
                      't.track_id, t.title track_title, t.place, t.sequnece, ' +
                      's.session_id, s.title session_title, s.description, s.presentation_url, ' +
                      's.start_time, s.end_time ' +
                      'FROM conference c ' +
                      'JOIN track t ' +
                      'ON c.conference_id = t.conference_id ' +
                      'JOIN session s ' +
                      'ON t.track_id = s.track_id ' +
                      'WHERE session_id = ?';

    connection.query(selectQuery, [session_id], function(err, rows, fields) {

      if (err) {
        global.logger.debug(err);
        connection.release();
        return next(err);
      }

      res.status(200).json({
        success : 1,
        result : rows[0]
      });

      global.logger.debug('세션 정보 조회 완료');
      connection.release();

    });
  });
}

/**
 * Name : getSessionQuestion
 * URL : GET /detail/:conference_id/:track_id/:session_id/info
 * Description : 컨퍼런스의 특정 트랙의 특정 세션의 question list를 볼 수 있는 뷰
 * Params : conference_id(컨퍼런스 아이디), track_id(트랙 아이디), session_id(세션 아이디)
 * HTTP Body :
 * Session : 필요함
 **/
function getSessionQuestion(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {
    global.logger.debug('here i am ');
    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }

    /*
     * Table     : question
     * Columns   : question_id, user_id, content, like_count
     * Query 설명 : is_valid = 1(자료가 유효한 값)이고 session_id에 해당하는 question 을 인기도 순서로 조회
     * */
    var select = 'SELECT question_id, user_id, content, like_count ' +
                'FROM question ' +
                'WHERE session_id = ? and is_valid =1 ' +
                'ORDER BY like_count desc';
    var placeHolders =[req.params.session_id];
    global.logger.debug('req.params.session_id ' + req.params.session_id);
    connection.query(select, placeHolders, function(err, rows, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }
      //will be the result of SELECT, not insert the result of select yet
      var result = {
        success : 1,
        questionList : []
      };

      async.each(rows, function(row, cb) {
       result.questionList.push(row);
        cb();
     }, function(err) {
       if(err) {
         global.logger.error('에러발생');
         connection.release();
         return next(err);
       }
       global.logger.debug('successful done!!!!!');

       res.json(result);
       connection.release();
     });
    }); //end of connection
  }); // end of global.connectionPool
}

/**
 * Name : getQuestion
 * URL : POST /detail/:conference_id/:track_id/:session_id/question/:question_id
 * Description :
 * Params : conference_id(컨퍼런스 아이디), track_id(트랙 아이디), session_id(세션 아이디)
 *          question_id(질문 아이디)
 * HTTP Body :
 * Session : 필요함
 **/
function getQuestion(req, res, next) { //상세페이지
  process.nextTick(function() {
    async.waterfall([
      function(callback) { //question 갖고오기
        global.connectionPool.getConnection(function(err, connection) {
          if (err) {
            // 에러처리
            err.message = '요청 에러';
            connection.release();
            callback(err);
          }
          /*
           * Table     : question
           * Columns   : question_id, session_id, user_id, content, create_time, like_count
           * Query 설명 : session_id에 해당하는 결과값 조회
           * */
          var query = "SELECT question_id, session_id, user_id, content, create_time, like_count " +
                      "FROM question " +
                      "WHERE session_id = ? and is_valid = 1"; // question_id를 session_id로 수정함.
          var placeHolders = [req.params.session_id];

          connection.query(query, placeHolders, function(err, row, fields) {
            if (err) {
              // 에러처리
              connection.release();
              err.message='question 조회 중 에러 ';
            }

            global.logger.debug('question 조회 완료!');
            callback(null, row);
          }); // end of connection.query
        }); // end of  global.connectionPool.getConnection
      },
      function(questionList, callback) { //answer
        global.connectionPool.getConnection(function(err, connection) {
          if (err) {
            // 에러처리
            err.message = '요청 에러';
            connection.release();
            callback(err);
          }
          /*
           * Table     : answer
           * Columns   : answer_id, question_id, user_id, content answer_content, like_count
           * Query 설명 : qustion_id 해당하는 answer 정보 조회
           * */
          var query = "SELECT answer_id, question_id, user_id, content answer_content, like_count " +
                      "FROM answer " +
                      "WHERE is_valid = 1 and question_id = ? " +
                      "ORDER BY like_count desc";
          var placeHolders = [req.params.question_id];

          connection.query(query, placeHolders, function(err, rows, fields) {
            if (err) {
              // 에러처리
              connection.release();
              err.message=' 조회 중 에러 ';
              // 로그찍고
              // 콜백을 하든 넥스트를 하든
            }
            global.logger.debug(' 조회 완료!');
            callback(null, questionList, rows);
          }); // end of connection.query
        }); // end of  global.connectionPool.getConnection
      },
      function(questionList, answerList, callback) {
        var result = {
          question: questionList,
          answerList: []
        }; //need to process
        async.each(answerList, function(row, cb) {
          result.answerList.push(row);
          cb();
        });
        callback(null, result);
      }
    ], function(err, result) {
      if (err) {
        global.logger.debug('waterfall 에러발생');
        global.logger.error(err);
        err.message = '조회 중 오류 발생';
        return next(err);
      } //if
      res.json(result);
    }); // end of async.waterfall
  }); // end of process.nextTick
}

function addQuestion(req, res, next) {
  global.connectionPool.getConnection(function(err, connection) {
    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }
    /*
     * Table     : question
     * Columns   : session_id, user_id, content, create_time, like_count, is_valid
     * Query 설명 : param으로 넘어 오는 값을 insert
     * */
    var insertQuestion = "INSERT INTO question(session_id, user_id, content, create_time, like_count, is_valid) " +
                         "VALUES (?, ?, ?, now(), 0, 1)";

    connection.query(insertQuestion, [req.params.session_id, req.user.user_id, req.body.content], function(err, rows, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }
      //the result of inserts message
      var result = {
        success : 1,
        result : {
          message : '질문이 정상적으로 등록되었습니다.'
        }
      };
      res.json(result);
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
}
/** NOT COMPLETE & NEED TO CODE NEITHER **/
function editQuestion(req, res, next) {
  var userId = req.body.user_id;
  var questionId = req.body.question_id;
  var content = req.body.content;
  var result = {
    success : 1,
    result : {
      message : '질문이 수정되었습니다.'
    }
  };
  res.json(result);
}
/** NOT COMPLETE & NEED TO CODE NEITHER **/
function deleteQuestion(req, res, next) {
  var userId = req.body.user_id;
  var questionId = req.body.question_id;
  var result = {
    success : 1,
    result : {
      message : '질문이 삭제되었습니다.'
    }
  };
  res.json(result);
}
/**
 * Name : addAnswer
 * URL : POST /detail/:conference_id/:track_id/:session_id/question/answer
 * Description : 답변을 다는 메소드
 * Params :
 * HTTP Body : question_id, content
 * Session : 필요함
 **/

function addAnswer(req, res, next) {
  ///:conference_id/:track_id/:session_id/question/answer'
  global.connectionPool.getConnection(function(err, connection) {
    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }

    var insertAnswer = "INSERT INTO answer(question_id, user_id, content, create_time, like_count, is_valid) " +
                        "VALUES (?, ?, ?, now(), 0, 1)";
    connection.query(insertAnswer, [req.body.question_id, req.user.user_id, req.body.content], function(err, rows, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }
      var result = {
        success : 1,
        result : {
          message : '답변이 정상으로 등록되었습니다.'
        }
      };
      res.json(result);
      connection.release();
    }); //end of connection
  }); // end of global.connectionPool
}

/** NOT COMPLETE & NEED TO CODE NEITHER **/
function deleteAnswer(req, res, next) {
  var userId = req.body.user_id;
  var answerId = req.body.answer_id;
}
/**
 * Name : addQuestionLike
 * URL : POST /conference/:conference_id/:track_id/:session_id/question/like
 * Description : question에 '좋아요'를 등록할 수 있다.
 *               question_like table이 insert되고 question의 like_count가 업데이트된다.
 * Params :
 * HTTP Body : question_id
 * Session : 필요함
 **/
function addQuestionLike(req, res, next) {
  process.nextTick(function () {
    global.connectionPool.getConnection(function (err, connection) {
      connection.beginTransaction(function (err) {
        if (err) {
          err.message = '연결이 원활하지 않습니다. 다시 시도해주시기 바랍니다.';
          return next(err);
        }
        async.series([
          function(callback) {

            /*
             * Table     : question_like
             * Columns   : user_id, question_id, create_time
             * Query 설명 : 현재 세션의 user_id와 question_id, 현재 시간을 입력
             * */
            var query = "INSERT INTO question_like (user_id, question_id, create_time) VALUES (?, ?, now())";
            global.logger.debug('user:  ' + req.user.user_id);
            global.logger.debug('req.body.question ' + req.body.question_id);

            connection.query(query, [req.user.user_id, req.body.question_id], function (err, info) {
              if (err) {
                return callback(err);
              }
              callback(null);
            }); // end of connection.query
          },
          function(callback) {
            /*
             * Table     : question
             * Columns   : like_count (좋아요 갯수)
             * Query 설명 : like_count 를 업데이트
             * */
            var query = "UPDATE question SET like_count = like_count + 1 WHERE question_id= ?";
            connection.query(query, [req.body.question_id], function (err, result) {
              if (err) {
                return callback(err);
              }
              global.logger.debug('!!!!!!!!!question_id' + req.body.question_id);

              callback(null);
            }); // end of connection.query
          }, function(callback) {
            connection.commit(function (err) {
              if (err) {
                global.logger.debug('commit error');
                return callback(err);
              }
            }); // end of connection.commit();
            global.logger.debug('commit!!!!!!!!!');
            callback(null);
          }
        ], function(err, result) {
          if (err) {
            connection.rollback(function () {
              connection.release();
              err.message = '질문 좋아요에 에러가 발생했습니다.';
              return next(err);
            }); // end of connection.rollback();
          }
          connection.release();
          res.status(200);
          res.json({
            "success": 1,
            "result": {
              "message": "질문 좋아요가 정상적으로 등록되었습니다."
            }
          }); // end of res.json();
        }); // end of async.waterfall();
      }); //end of global.pool.getConnection();
    }); // end of process.nextTick();
  });
}
/**
 * Name : addAnswerLike
 * URL : POST /conference/:conference_id/:track_id/:session_id/question/answer/like
 * Description : question의 해당 answer의 좋아요 등록
 * Params :
 * HTTP Body : answer_id
 * Session : 필요함
 **/
function addAnswerLike(req, res, next) {
  process.nextTick(function () {
    global.connectionPool.getConnection(function (err, connection) {
      connection.beginTransaction(function (err) {
        if (err) {
          err.message = '연결이 원활하지 않습니다. 다시 시도해주시기 바랍니다.';
          return next(err);
        }
        async.series([
          function(callback) {
            /*
             * Table     : answer_like
             * Columns   : user_id, answer_id, create_time
             * Query 설명 : answer_like 값 insert
             * */
            var query = "INSERT INTO answer_like (user_id, answer_id, create_time) VALUES (?, ?, now());";
            global.logger.debug('req.body.question ' + req.body.answer_id);
            global.logger.debug('req.body.user_id ' + req.user.user_id);
            connection.query(query, [req.user.user_id, req.body.answer_id], function (err, info) {
              if (err) {
                return callback(err);
              }
              callback(null);
            }); // end of connection.query
          },
          function(callback) {
            /*
             * Table     : answer
             * Columns   : like_count
             * Query 설명 : is_valid = 1(값이 유효함 의미), 해당 answer_id에 해당하는 answer의 like_count 업데이트
             * */
            var query = "UPDATE answer SET like_count = like_count + 1 WHERE answer_id = ? and is_valid = 1";
            global.logger.debug('callback 2 :   ' + req.user.user_id);
            connection.query(query, [req.body.answer_id], function (err, result) {
              if (err) {
                return callback(err);
              }
              global.logger.debug('end of callback2   ');
              callback(null);
            }); // end of connection.query
          }, function(callback) {
            connection.commit(function (err) {
              if (err) {
                return callback(err);
              }
              global.logger.debug('call back 3 ');
            }); // end of connection.commit();
            global.logger.debug('commit!!!!!!!!!');
            callback(null);
          }
        ], function(err, result) {
          if (err) {
            connection.rollback(function () {
              connection.release();
              err.message = '답글 좋아요에 에러가 발생했습니다.';
              return next(err);
            }); // end of connection.rollback();
          }
          connection.release();
          res.status(200);
          res.json({
            "success": 1,
            "result": {
              "message": "답글 좋아요가 정상적으로 등록되었습니다."
            }
          }); // end of res.json();
        }); // end of async.waterfall();
      }); //end of global.pool.getConnection();
    }); // end of process.nextTick();
  });
}

router.get('/:conference_id/:track_id/:session_id', getSession);
router.get('/:conference_id/:track_id/:session_id/info', getSessionQuestion);
router.get('/:conference_id/:track_id/:session_id/question/:question_id', getQuestion);
router.route('/:conference_idㅅ/:track_id/:session_id/question')
  .post(addQuestion)
  .put(editQuestion)
  .delete(deleteQuestion);
router.route('/:conference_id/:track_id/:session_id/question/answer')
  .post(addAnswer)
  .delete(deleteAnswer);
router.post('/:conference_id/:track_id/:session_id/question/like', addQuestionLike);
router.post('/:conference_id/:track_id/:session_id/question/answer/like', addAnswerLike);
router.get('/getChat/:conference_id/:track_id/:session_id', getChat);

module.exports = router;