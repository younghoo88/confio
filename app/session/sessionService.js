/**
 * Created by seunggu on 2015. 12. 30..
 */

(function() {
  'use strict';

  angular
    .module('myApp')
    .factory('session', session);

  session.$inject = ['$http'];

  function session($http) {

    var service = {
      getConferenceIdWidthCode: getConferenceIdWidthCode,
      getConferenceInfo: getConferenceInfo
    };

    return service;

    ////////////

    // 컨퍼런스 id 가져오기
    function getConferenceIdWidthCode(code) {
      return $http.get('/api/conference/code/' + code)
        .then(getConferenceId);

      function getConferenceId(response) {
        return response.data.result;
      }
    }

    // 컨퍼런스 정보 가져오기
    function getConferenceInfo(confId) {
      return $http.get('/api/maa')
        .then(getAvengersComplete);

      function getAvengersComplete(response) {
        return response.data.result;
      }
    }
  }
})();