/**
 * Created by jeongseunghyeon on 2015. 12. 19..
 */

angular
  .module('myApp')
  .config(config);

  config.$inject = ['$stateProvider', '$urlRouterProvider'];

  function config($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to /main
    $urlRouterProvider.otherwise('/main');

    $stateProvider
      .state('main', {
        url: '/main',
        templateUrl: 'main/mainView.html',
        controller: 'MainController',
        controllerAs: 'vm',
        data: {
          css: '../assets/css/main-override.css'
        }
      })

      .state('register', {
        url: '/register',
        templateUrl: 'register/registerView.html',
        controller: 'RegisterController',
        controllerAs: 'vm'
      })

      .state('conference', {
        url: '/conference/:conference_id',
        templateUrl: 'conference/conferenceView.html',
        controller: 'ConferenceController',
        controllerAs: 'vm'
      })

      .state('session', {
        url: '/conference/:conference_id/session/:session_id',
        templateUrl: 'session/sessionView.html',
        controller: 'SessionController',
        controllerAs: 'vm'
      })
  }