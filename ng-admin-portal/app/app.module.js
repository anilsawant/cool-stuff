'use strict';
try {
  (function() {
    angular.module('gsmcApp', ['ngRoute'])
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      $routeProvider
      .when('/login', {
        'templateUrl': 'login/login.html',
        'controller': 'LoginController'
      })
      .when('/library', {
        'templateUrl': 'library/library.html',
        'controller': 'LibraryController'
      })
      .when('/error', {
        'template': '<h1>ERROR: 404 Not Found :(</h1>'
      })
      .otherwise({redirectTo: '/error'});
    }]);
  }());
} catch (e) {
  console.log(e);
}
