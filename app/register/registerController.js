/**
 * Created by jeongseunghyeon on 2015. 12. 20..
 */
(function() {
  'use strict';

  angular
    .module('myApp')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = [];

  function RegisterController() {
    var vm = this;

    vm.datetime = new Date(), // date-time-picker 옵션 설정
      vm.options = '{ dayViewHeaderFormat: "YYYY년 MM월", format: "YYYY년 MM월 DD일 / HH시 mm분", locale: "ko" }',
      vm.selectedTrackIndex = undefined,
      vm.selectedDay = undefined,
      // 컨퍼런스 정보
      vm.registerInfo = {
        confInfo: {
          name: undefined,
          description: undefined,
          start_time: undefined,
          end_time: undefined,
          address: undefined
        },

        tracks: [
          /*
          {
            title: undefined,
            place: undefined,
            sessions: [
              {
                title: undefined,
                description: undefined,
                start_time: undefined,
                end_time: undefined,
                ppt_url: undefined
              }
            ]
          }
          */
        ],
        admins: [
          /*
          {
            email: undefined,
            participation_type: undefined,
            speaker_session: {
              session_id: undefined,
              title: undefined
            }
          }
          */
        ]
      },
      vm.step = { // Step 정보
        currentStep: 1
      };

    vm.goPreviousStep = goPreviousStep;
    vm.goNextStep = goNextStep;
    vm.addTrack = addTrack;
    vm.addSession = addSession;
    vm.addAdmin = addAdmin;
    vm.dateToDayInfo = dateToDayInfo;
    vm.isEndLaterThanStart = isEndLaterThanStart;

    ////////

    /**
     * 이전 Step으로 이동
     */
    function goPreviousStep() {
      if (vm.step.currentStep > 1) {
        vm.step.currentStep -= 1;
      }
    }

    /**
     * 다음 Step으로 이동
     */
    function goNextStep() {
      if (vm.step.currentStep < 3) {
        vm.step.currentStep += 1;
      }
    }


    /**
     * 트랙 추가
     */
    function addTrack(addingTrackObject) {
      vm.registerInfo.tracks.push({
        title: addingTrackObject.title,
        place: addingTrackObject.place,
        sessions: []
      });

      addingTrackObject.title = null;
      addingTrackObject.place = null;

      $('#add-track-modal').modal('hide');
    }

    /**
     * 세션 추가
     */
    function addSession(addingSessionObject) {
      vm.registerInfo.tracks[vm.selectedTrackIndex].sessions.push({
        title: addingSessionObject.title,
        description: addingSessionObject.description,
        start_time: addingSessionObject.start_time,
        end_time: addingSessionObject.end_time,
        ppt_url: addingSessionObject.ppt_url
      });
    }

    /**
     * 운영진 추가
     */
    function addAdmin(addingAdminObject) {
      vm.registerInfo.admins.push({
        email: addingAdminObject.email,
        participation_type: addingAdminObject.participation_type
      });

      addingAdminObject.email = null;
      addingAdminObject.participation_type = null;

      $('#add-admin-modal').modal('hide');
    }

    /**
     * 컨퍼런스 진행 날짜로 날짜 정보 만들기
     */
    function dateToDayInfo() {
      var startDate = vm.registerInfo.confInfo.start_time && vm.registerInfo.confInfo.start_time._d,
        endDate = vm.registerInfo.confInfo.end_time && vm.registerInfo.confInfo.end_time._d,
        MILI_SECOND_UNIT = 1000,
        SECOND_UNIT = 60,
        MINUITE_UNIT = 60,
        HOUR_UNIT = 24,
        DAY_UNIT = MILI_SECOND_UNIT * SECOND_UNIT * MINUITE_UNIT * HOUR_UNIT,
        diffDays =  Math.round((endDate - startDate)/ DAY_UNIT),
        days = [];

      if (startDate && startDate instanceof Date && endDate && endDate instanceof  Date) {
        for (var i = 1; i <= diffDays; i += 1) {
          days.push(i);
        }
        return days;
      }
    }

    /**
     * 종료 날짜가 시작 날짜보다 뒤인지 아닌지 유효성 검사
     */
    function isEndLaterThanStart() {
      var startTime = vm.registerInfo.confInfo.start_time,
        endTime = vm.registerInfo.confInfo.end_time;

      if (startTime && endTime && startTime > endTime) {
        swal('종료 날짜는 시작 날짜보다 늦어야합니다', '', 'warning');
      }
    }
  }

})();