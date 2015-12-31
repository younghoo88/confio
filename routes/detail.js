var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080); // 소켓 서버 구동

/**
 * Socket.io 구현부분
 * 각 세션을 socket.io의 room 기능을 통해 구현하였다.
 */
// TODO : 컨퍼런스 기간이 끝난 이후에는 해당 room을 들어가지 못하게 구현해야할듯
var count = 0;
var rooms = [];
io.on('connection', function(socket) {
  // join event 처리
  socket.on('join', function(data) { // room 정보 받음
    rooms[data.room] = true;
    socket.join(data.room);
    global.logger.debug('전체 방 갯수 : ' + rooms.length);
    global.logger.debug('room 정보 : ' + data.room);
    socket.room = data.room; // 해당 소켓이 room 정보를
    io.to(socket.room).emit('fromServer', {msg : socket.id + ' 이 방에 입장하였습니다.', time : new Date()});
  });

  // message 처리
  socket.on('fromClient', function(data) {
    global.logger.debug('received from client message : ' + data.msg + ' at ' + data.time);
    io.to(socket.room).emit('fromServer', data); // 자신이 속한 room으로 data 전송
  });

  // disconnect event 처리
  socket.on('disconnect', function(data) {
    global.logger.debug('disconnect event 발생');
    io.to(socket.room).emit('fromServer', {msg : socket.id + '님이 나가셨습니다.', time : new Date()});
  });
});

function getSession(req, res, next) {
  var conference_id = req.params.conference_id;
  var track_id = req.params.track_id;
  var session_id = req.params.session_id;

  global.logger.debug('/' + conference_id + '/' + track_id + '/' + session_id + ' 방에 입장하였습니다.');

  // 페이지 렌더링
  res.render('index', {conference_id : conference_id, track_id : track_id, session_id : session_id}); // client event용

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
  var userId = req.body.user_id;
  var content = req.body.content;
  var result = {
    success : 1,
    result : {
      message : '질문이 등록되었습니다.'
    }
  };
  res.json(result);
}

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
  var userId = req.body.user_id;
  var questionId = req.body.question_id;
  var content = req.body.content;
  var result = {
    success : 1,
    result : {
      message : '질문에 대한 답변이 등록되었습니다.'
    }
  };
  res.json(result);
}

function deleteAnswer(req, res, next) {
  var userId = req.body.user_id;
  var answerId = req.body.answer_id;
}

function addQuestionLike(req, res, next) {
  var userId = req.body.user_id;
  var questionId = req.body.question_id;
  var result = {
    success : 1,
    result : {
      message : '질문에 대해 좋아요를 하였습니다.'
    }
  };
  res.json(result);
}

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
router.post('/:conference_id/:track_id/:session_id/chat', putMessage);
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