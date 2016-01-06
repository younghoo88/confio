/**
 * Created by seunggu on 2015. 12. 30..
 */

(function() {
  'use strict';

  angular
    .module('myApp')
    .controller('SessionController', SessionController);

  SessionController.$inject = [];

  function SessionController() {
    var vm = this;

    vm.sessionInfo = {
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
    };

    ////////


  }

})();