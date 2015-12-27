var express = require('express');
var router = express.Router();

function createConference(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '컨퍼런스 등록이 정상적으로 되었습니다.'
    }
  };
  res.json(result);
}

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

function addStaff(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '회원 타입이 정상적으로 등록되었습니다.'
    }
  };
  res.json(result);
}

function editStaff(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '회원 타입이 정상적으로 변경되었습니다.'
    }
  };
  res.json(result);
}

function createTrack(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '트랙 정보가 정상적으로 등록되었습니다.'
    }
  };
  res.json(result);
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

function createSession(req, res, next) {
  var result = {
    success : 1,
    result : {
      message : '세션이 정상적으로 등록되었습니다.'
    }
  };
  res.json(result);
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
        latitude : '127.1052208',
        longitude : '37.3595122',
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
router.route('/staff')
  .post(addStaff)
  .put(editStaff)
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