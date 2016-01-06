
/**
 * Created by jeongseunghyeon on 2015. 12. 21..
 */

(function () {
  'use strict';

  angular.module('emailFinder', [])
    .directive('emailFinder', emailFinder);

  emailFinder.$inject = ['$compile'];

  function emailFinder($compile) {
    return {
      restrict: 'EA',
      scope: {
      },
      link: function(scope, element, attrs, controller) {
        element.on('keyup', function() {
          var searchEmail = element.val();

          removeResultEmailList(element);

          // 검색어 없을시 끝내기
          if (searchEmail.length === 0) {
            return;
          }

          // 1. 서버에서 결과를 가져온다

          var results = [
            'imaster020@naver.com',
            'imaster0209@naver.com',
            'imaster0209@nate.com',
            'imaster0209@gmail.com',
            'imaster0209@google.com'
          ];


          // element 추가하기
          createResultEmailList(scope, element, results);

        });
      }
    };



    ////////////

    function createResultEmailList(scope, element, results) {
      // ul 리스트 만들기
      var resultEmailList = $('<ul class="result-email-list list-group"></ul>');
      resultEmailList.css({'position': 'absolute', 'width': element.css('width'), 'z-index': '99'});

      // li 추가하기
      for (var i = 0; i < results.length; i += 1) {
        var resultEmail = $('<li class="list-group-item"></li>'),
          resultEmailBtn = $('<button type="button" ng-click="console.log({})">' + results[i] + '</button>');
        resultEmail.css({'padding': '0'});
        resultEmailBtn.css({'padding': '10px', 'text-align': 'left', 'width': '100%'});
        resultEmailBtn.hover(function() {
          $(this).css('background-color', '#eee');
        }, function() {
          $(this).css('background-color', '#fff');
        });
        resultEmail.append(resultEmailBtn);
        resultEmailList.append(resultEmail);
      }

      // li 해당 이메일로 회원 초대하기 만들기
      var inviteToEmail = $('<li class="list-group-item"></li>'),
        inviteToEmailBtn = $('<button type="button">"' + element.val() + '" 초대하기' + '</button>');
      inviteToEmailBtn.css({'text-align': 'left', 'width': '100%', 'padding': '10px'});
      inviteToEmail.css({'color': '#5cb85c', 'padding': '0'});
      inviteToEmail.append(inviteToEmailBtn);
      resultEmailList.append(inviteToEmail);


      console.log(resultEmailList.prop('outerHTML'));
      angular.element(document).injector().invoke(function($compile) {
        var compiledHtml = $compile(resultEmailList.prop('outerHTML'))(scope);
        element.after(compiledHtml);
        scope.$apply();
      });
    }

    function removeResultEmailList(element) {
      element.nextAll('.result-email-list').remove();
    }
  }
})();