/**
 * Created by jeongseunghyeon on 2015. 12. 22..
 */

(function() {
  'use strict';

  angular
    .module('myApp')
    .controller('ConferenceController', ConferenceController);

  ConferenceController.$inject = [];

  function ConferenceController() {
    var vm = this;

    // 컨퍼런스 정보
    vm.conferenceInfo = {
      confInfo: {
        name: 'DEVIEW 2015',
        description: '매년 2,000명 이상 참석하는 국내 최대 개발자 컨퍼런스 DEVIEW는 NAVER가 주최하고 글로벌 SW기업과 국내 기술 스타트업들이 함께 만드는 개발자 행사입니다.',
        start_time: '2015.12.07 13:00',
        end_time: '2015.12.09 18:00',
        address: 'COEX GRAND Ballroom, SEOUL',
        latitude: 37.513385,
        longitude: 127.058580
      },
      sessionCategory: [
        '웹', '모바일', '빅데이터', '오픈소스', '텍스트 마이닝'
      ],
      tracks: [
        {
          title: undefined,
          place: undefined,
          sessions: [
            {
              session_id: 1,
              title: '네이버 효과툰은 어떻게 만들어졌나?',
              description: '"고고고", "악의는없다", "소름"에 적용된 새로운 네이버 효과툰의 아키텍쳐와 동작원리에 대해 소개합니다. 효과툰 장르의 정의, 스크롤에 따른 모션, 비개발자인 작가가 쓰는 저작도구 등에 대한 고민과 그 결과물의 속사정을 모두 공개합니다. 프로젝트의 A-Z를 고민하는 하이브리드 개발자에게 도움이 되길 바랍니다. 본 세션에서는 스크롤 툰에서의 효과에 대해 효과의 종류와 구현 방법에 대해 고민한 내용을 공유하고, 효과툰 뷰어와 페이지, 레이어 구조에 대해 설명합니다.',
              start_time: '10:00',
              end_time: '10:50',
              ppt_url: undefined,
              speaker: {
                user_id: 1,
                name: '김효',
                job: 'NAVER LABS'
              }
            },
            {
              session_id: 1,
              title: 'React Everywhere',
              description: '최근에 리액트가 새로운 대세가 되어가고 있습니다. 페이스북은 웹 버전 일부, 애드 매니저(iOS, Android), 페이스북 그룹스(iOS), 인스타그램 웹 버전 등을 리액트로 만들었고 Airbnb, BBC, CodeCademy, ebay, Flipboard, Netflix, PayPal, reddit, Twitter, NYTimes, Salesforce, Yahoo등의 업체에서 리액트를 도입하고 있습니다. 한국에서도 리액트에 대한 관심은 늘어나고 있고 주변에서도 리액트에 대해 관심을 가지는 사람이 점차 많아지고 있습니다. 이 세션은 웹, PC (하이브리드), 모바일 (네이티브) 어디에서든 리액트를 쓸 수 있는 것을 목표로 합니다. 편리하게 리액트를 쓸 수 있는 조합 구성을 제시하고 리액트의 동작 원리를 설명함으로서 이 기술을 더 잘 활용할 수 있도록 합니다.',
              start_time: '11:00',
              end_time: '11:50',
              ppt_url: undefined,
              speaker: {
                user_id: 1,
                name: '김용욱',
                job: '필링선데이 CTO'
              }
            },
            {
              session_id: 1,
              title: '웹 브라우저 감옥에서 살아남기',
              description: '엔트리는 입문자를 위한 소프트웨어 교육 서비스로서, 순수 HTML5 기술만을 사용하여 구현되었습니다. 우리는 엔트리에서 다양한 기능을 제공하기 위해 HTML Canvas, SVG, Websocket 등 여러 웹기술을 총 동원하였습니다. 또한 독자 설계된 JS 기반 비주얼 프로그래밍 언어와 인터프리터, 하드웨어 장치 연결 솔루션 등 다양한 노하우를 공유합니다.',
              start_time: '13:00',
              end_time: '13:50',
              ppt_url: undefined,
              speaker: {
                user_id: 1,
                name: '김용욱',
                job: '필링선데이 CTO'
              }
            }
          ]
        }
      ],
      admins: [
        {
          email: undefined,
          participation_type: undefined,
          speaker_session: {
            session_id: undefined,
            title: undefined
          }
        }
      ]
    };



    /////////////
  }

})();