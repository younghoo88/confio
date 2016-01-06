(function () {
  'use strict';

  angular.module('dateTimePicker', [])
    .directive('dateTimePicker', dateTimePicker);

  dateTimePicker.$inject = ['$timeout'];

  function dateTimePicker($timeout) {
    return {
      require: '?ngModel',
      restrict: 'EA',
      scope: {
        dateTimePickerOptions: '@',
        onDateChangeFunction: '&',
        onDateClickFunction: '&',
        onDateHideFunction: '&'
      },
      link: function($scope, $element, $attrs, controller) {
        $element.on('dp.change', function() {
          $timeout(function() {
            var dtp = $element.data('DateTimePicker');
            controller.$setViewValue(dtp.date());
            $scope.onDateChangeFunction();
          });
        });

        $element.on('dp.hide', function() {
          $scope.onDateHideFunction();
        });

        $element.blur(function() {

        });

        $element.on('click', function() {
          console.log('onClick');
          $scope.onDateClickFunction();
        });

        controller.$render = function() {
          if (!!controller && !!controller.$viewValue) {
            var result = controller.$viewValue;
            $element.data('DateTimePicker').date(result);
          }
        };

        $element.datetimepicker($scope.$eval($attrs.dateTimePickerOptions));
      }
    };
  }
})();