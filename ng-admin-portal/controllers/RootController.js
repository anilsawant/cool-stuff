angular.module('gsmcApp')
.controller('RootController', function ($rootScope, $scope) {
  $rootScope.pageTitle = 'Welcome | GSMC';
  console.log('Root Controller loaded');
});
