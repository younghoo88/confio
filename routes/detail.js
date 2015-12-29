var express = require('express');
var router = express.Router();
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

function getSession(req, res, next) {
  var conference_id = req.params.conference_id;
  var track_id = req.params.track_id;
  var session_id = req.params.session_id;

  global.logger.debug('conference_id : ' + conference_id);
  global.logger.debug('track_id : ' + track_id);
  global.logger.debug('session_id : ' + session_id);

  // 컨퍼런스 기간이 끝났는지 확인(소켓 서버에 접속하지 못하게 해야하므로)
  var name = '/' + conference_id + '/' + track_id + '/' + session_id;
  var nameSpace = io.of(name);
  nameSpace.on('connection', function(socket) {
    global.logger.debug('connected namespace : ' + name);
    socket.on('fromClientMessage', function(data) {
      global.logger.debug('received from client [id]: ' + data.id);
      global.logger.debug('received from client [content]: ' + data.content);
      socket.emit('fromServerMessage', data);
    });
  });

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
}

function putMessage(req, res, next) {
  // var userId = req.body.user_id;
  // var content = req.body.content;

  global.logger.debug('user_id : ' + req.body.user_id);
  global.logger.debug('content : ' + req.body.content);

  global.logger.debug('conference_id : ' + req.params.conference_id);
  global.logger.debug('track_id : ' + req.params.track_id);
  global.logger.debug('session_id : ' + req.params.session_id);

  var result = {
    success : 1,
    result : {
      message : '채팅 내용 입력'
    }
  };
  res.json(result);
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