angular.module('gsmcApp')
.controller('LoginController', function($rootScope, $scope, $http, $location) {
  $rootScope.pageTitle = 'Login | GSMC';

  $scope.loginId = '';
  $scope.password = '';
  let loginCard = document.querySelector('.loginCard'),
      $msgRow = angular.element('.alert'),
      rememberMe = loginCard.querySelector('#rememberMe'),
      btnLogin = loginCard.querySelector('#btnLogin');

  if (window.localStorage.getItem('faAdminPortalId')) {
    $scope.loginId = window.localStorage.getItem('faAdminPortalId');
    rememberMe.className = "fa fa-check-square-o";
  }
  $scope.hideMsg = function () {
    $msgRow.slideUp(function () {
      $msgRow.find('.msg').html('');
    });
  }
  $scope.showMsg = function (msg) {
    if (msg) {
      $msgRow.find('.msg').html(msg)
      $msgRow.slideDown();
    }
  }
  $scope.login = function (evt) {
    if ($scope.loginId && $scope.password) {
      evt.target.style.pointerEvents = 'none';
      $scope.hideMsg();
      $http({
        "method": "POST",
        "url": "/GSMCServices/service/loginDetails/authenticateUser",
        "data": {
          "appVersion": "1.2",
          "loginId": $scope.loginId,
          "password": $scope.password,
          "role": "ADMIN"
        }
      }).then(function( resp ) {
        console.log(resp.data);
        evt.target.style.pointerEvents = 'all';
        if (resp.data && resp.data.result == "SUCCESS") {
          if (rememberMe.className.includes('fa-check-square-o')) {
            window.localStorage.setItem('faAdminPortalId', $scope.loginId);
          } else {
            window.localStorage.removeItem('faAdminPortalId');
          }
          //set user after authentication
          $rootScope.user = {
            "name": 'Admin',
            "loginId": data.loginId,
            "role": 'ADMIN',
          }
          $location.path('home');
        } else {
          $scope.password = ''
          $scope.showMsg("Invalid login id or password. Kindly Retry.");
        }
      }).catch(function (err) {
        console.error('Login request failed.', err);
        evt.target.style.pointerEvents = 'all';
        $scope.showMsg("We are currently unable to sign you in. Kindly try after some time.");
      });
    } else {
      $scope.showMsg("Kindly enter login id and password.");
    }
  };
  $scope.resetPassword = function () {
    if ($scope.loginId.trim()) {
      console.log('TODO: Reset password.');
    } else {
      $scope.showMsg("Enter login id to reset the password to default.");
    }
  }

  $scope.hideMsg();
});
