var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');
var session = require('../config/session').sessionMiddleware;
var util = require('util');
var async = require('async');

//io.use(function(socket, next) {
//  session(socket.request, socket.request.res, next);
//});
// server.listen(8080); // 소켓 서버 구동

/**
 * MongoDB 구현부분
 *
 */
// mongoose.connect('mongodb://localhost/test'); // test db에 접속

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
//var roomInfo = {};
//
//io.on('connection', function(socket) {
//  var session = socket.request.session;
//  var user = session.passport.user; // session store에 저장된 user 객체(name, email, password 정보를 갖고 있다)
//  var numOfMessages = 2; // client에서 message fetching할때마다 보여줄 message 갯수(DEFAULT = 5)
//
//  // join event 처리
//  socket.on('join', function(data) { // room 정보 받음
//    if (!roomInfo.hasOwnProperty(data.room)) { // 최초 생성시
//      roomInfo[data.room] = [];
//    }
//    roomInfo[data.room].push(user);
//
//    socket.join(data.room);
//    global.logger.debug('--------------------');
//    global.logger.debug('room 정보 : ' + data.room);
//    global.logger.debug('이용자 소켓정보 : ' + roomInfo[data.room]);
//    global.logger.debug('이용자 정보 : ' + util.inspect(user));
//    global.logger.debug('이용 인원 : ' + roomInfo[data.room].length);
//    socket.room = data.room; // 해당 소켓이 room 정보를
//    io.to(socket.room).emit('joinMessage', {user : user, time : new Date()});
//    global.logger.debug('--------------------\n');
//  });
//
//  // message 처리
//  socket.on('fromClient', function(data) {
//    global.logger.debug('--------------------');
//    global.logger.debug('[fromClient event 발생] ' + '[' + user.name + '] : ' + data.msg + ' 보낸 시간 : ' + data.time);
//    global.logger.debug('--------------------\n');
//    data.userName = user.name;
//
//    io.to(socket.room).emit('fromServer', data); // 자신이 속한 room으로 data 전송
//
//    if (data.save === true) { // save 옵션에 따라 DB에 저장 유무 판별
//      // mongoDB에 저장
//      var savedMessage = new savedMessageModel();
//      savedMessage.name = user.name;
//      savedMessage.email = user.email;
//      savedMessage.conference_id = data.conference_id;
//      savedMessage.track_id = data.track_id;
//      savedMessage.session_id = data.session_id;
//      savedMessage.message = data.msg;
//      savedMessage.create_time = data.time;
//      savedMessage.save(function(err, next) {
//        if (err) {
//          return next();
//        }
//        global.logger.debug('--------------------');
//        global.logger.debug('DB에 메시지 내용을 저장하였습니다.');
//        global.logger.debug('--------------------\n');
//      });
//    }
//  });
//
//  socket.on('showMessage', function(data) {
//    savedMessageModel.find({
//      conference_id : data.conference_id,
//      track_id : data.track_id,
//      session_id : data.session_id
//    }).
//    skip((data.pageNum - 1) * numOfMessages).
//    limit(numOfMessages).
//    sort({ create_time : -1 }).
//    exec(function(err, savedMessage) {
//      if (err) { // TODO : error 처리 추가해야함
//        global.logger.debug('DB 접근중 오류가 발생하였습니다.');
//      }
//      global.logger.debug(util.inspect(savedMessage));
//      socket.emit('messageList', {messageList : savedMessage.reverse(), pageNum : data.pageNum});
//    });
//  });
//
//  // disconnect event 처리
//  socket.on('disconnect', function(data) {
//    global.logger.debug('--------------------');
//    global.logger.debug('[disconnect event 발생]');
//    global.logger.debug('socket.room : ' + socket.room);
//    // TODO : undefined 처리
//    if (roomInfo[socket.room] !== undefined) {
//      var deleteIndex = roomInfo[socket.room].indexOf(socket.id);
//      roomInfo[socket.room].splice(deleteIndex, 1);
//    }
//    io.to(socket.room).emit('fromServer', {msg : user.email + '님이 나가셨습니다.', time : new Date()});
//    global.logger.debug('--------------------\n');
//  });
//});
/* NOT COMPLETE YET**/
function getSession(req, res, next) {
  var conference_id = req.params.conference_id;
  var track_id = req.params.track_id;
  var session_id = req.params.session_id;

  // 페이지 렌더링
  // client event 처리용이고 angular와 합칠때 제거 예정
  res.render('index', {conference_id : conference_id, track_id : track_id, session_id : session_id});

  // TODO : Database 연동부분 구현
  /*
  var result = {
    success : 1,
    result : {
      conference : {
        id : 1,
        title : 'NaverD2FEST',
        start_time : '2016-01-06 08:00',
        end_time : '2016-01-06 18:00',
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
  */
}

function putMessage(req, res, next) {
  // TODO : 삭제 예정(Socket.io를 이용해 메시지를 주고받기 때문에 putMessage가 필요없어졌다.)
  res.json({});
}

function getQuestion(req, res, next) {
  global.logger.debug('req.session.user : ' + util.inspect(req.user)); // session 유지가 되므로 user정보를 읽어올 수 있다.

  var result = {
    success : 1,
    result : {
      question_id : 1,
      content : 'React.js에 대적할 다른 기술은 무엇이 있을까요?',
      like_count : 50,
      answer : [
        {
          answer_id : 3,
          content : 'angular.js 정도가 있는것 같네요.',
          like_count : 10
        }
      ]
    }
  };
  res.json(result);
}

function addQuestion(req, res, next) {

  global.connectionPool.getConnection(function(err, connection) {
    if (err) {
      global.logger.error(err);
      connection.release();
      next(err);
      return;
    }

    var insertQuestion = "INSERT INTO question(session_id, user_id, content, create_time, like_count, is_valid) " +
                        "VALUES (?, ?, ?, now(), 0, 1)";

    connection.query(insertQuestion, [req.params.session_id, req.user.user_id, req.body.content], function(err, rows, info) {
      if (err) {
        global.logger.error(err);
        connection.release();
        next(err);
        return;
      }

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


/*
  var userId = req.body.user_id;
  var content = req.body.content;
  var result = {
    success : 1,
    result : {
      message : '질문이 등록되었습니다.'
    }
  };
  res.json(result);
*/



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
      global.logger.debug('요기');
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

function deleteAnswer(req, res, next) {
  var userId = req.body.user_id;
  var answerId = req.body.answer_id;
}
//TODO HERE3
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
            var query = "UPDATE question SET like_count = like_count + 1 WHERE question_id= ?";
            connection.query(query, [req.body.question_id], function (err, result) {
              if (err) {
                return callback(err);
              }
              global.logger.debug('!!!!!!!!!question_id' + req.body.question_id);

              callback(null);
            }); // end of connection.query
          }, function(callback) {
            global.logger.debug('commit error???');
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



//TODO HERE4
function addAnswerLike(req, res, next) {
  var userId = req.body.user_id;
  var answerId = req.body.answer_id;
  var result = {
    success : 1,
    result : {
      message : '질문 답변에 대해 좋아요를 하였습니다.'
    }
  };
  res.json(result);
}

router.get('/:conference_id/:track_id/:session_id', getSession);
// router.post('/:conference_id/:track_id/:session_id/chat', putMessage);
router.get('/:conference_id/:track_id/:session_id/question/:question_id', getQuestion);
router.route('/:conference_id/:track_id/:session_id/question')
  .post(addQuestion)
  .put(editQuestion)
  .delete(deleteQuestion);
router.route('/:conference_id/:track_id/:session_id/question/answer')
  .post(addAnswer)
  .delete(deleteAnswer);
router.post('/:conference_id/:track_id/:session_id/question/like', addQuestionLike);
router.post('/:conference_id/:track_id/:session_id/question/answer/like', addAnswerLike);

module.exports = router;