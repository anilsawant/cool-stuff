angular.module('gsmcApp')
.controller('HomeController', function ($rootScope, $scope) {
  console.log('Home Controller loaded');
  $rootScope.pageTitle = 'Home | GSMC';
});
