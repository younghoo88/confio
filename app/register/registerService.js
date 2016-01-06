/**
 * Created by seunggu on 2016. 1. 6..
 */


(function() {
  'use strict';

  angular
    .module('myApp')
    .factory('register', register);

  conference.$inject = ['$http'];

  function register($http) {

    var service = {
      saveConferenceDefaultInfo: saveConferenceDefaultInfo,
      getConferenceInfo: getConferenceInfo
    };

    return service;

    ////////////

    // 컨퍼런스 기본정보 저장하기
    function saveConferenceDefaultInfo(confInfo) {
      return $http.post('/conference', {
        title: confInfo.title,
        start_time: confInfo.start_time,
        end_time: confInfo.end_time,
        description: confInfo.description,
        address: confInfo.address
      }).then(getConferenceId);

      function getConferenceId(response) {
        return response.data;
      }
    }

    // 컨퍼런스 정보 가져오기
    function getConferenceInfo(confId) {
      return $http.get('/api/maa')
        .then(getAvengersComplete);

      function getAvengersComplete(response) {
        return response.data;
      }
    }
  }
})();

