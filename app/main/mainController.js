/**
 * Created by jeongseunghyeon on 2015. 12. 22..
 */

(function() {
  'use strict';

  angular
    .module('myApp')
    .controller('MainController', MainController);

  MainController.$inject = ['$state', 'conference'];

  function MainController($state, conference) {
    var vm = this;

    // variable
    vm.conferenceCode = null;

    // function
    vm.goConference = goConference;


    ////////

    function goConference() {
      var conferenceCode = vm.conferenceCode;

      // 서버로 코드를 보내고 컨퍼런스 정보를 받는다
      /* 실서버 될시
      conference.getConferenceIdWidthCode(conferenceCode).then(function(conferenceId) {
        $state.go(conference, {conference_id: conferenceId});
      });
      */
      $state.go('conference', {conference_id: '123'});
    }
  }
})();