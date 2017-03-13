'use strict';
angular.module('gsmcApp')
.controller('LoginController', function($scope, $http, $location) {
  $scope.loginId = '';
  $scope.password = '';
  let loginCard = document.querySelector('.login-card'),
      rememberMe = loginCard.querySelector('#rememberMe'),
      btnLogin = loginCard.querySelector('#btnLogin');

  if (window.localStorage.getItem('faAdminPortalId')) {
    $scope.loginId = window.localStorage.getItem('faAdminPortalId');
    rememberMe.className = "fa fa-check-square-o";
  }
  $scope.login = function (evt) {
    if ($scope.loginId && $scope.password) {
      evt.target.style.pointerEvents = 'none';
      $http({
        "method": "POST",
        "url": "/GSMCServices/service/loginDetails/authenticateUser",
        "data": {
          "appVersion": "1.01",
          "loginId": $scope.loginId,
          "password": $scope.password,
          "role": "ADMIN"
        }
      }).then(function( data ) {
        console.log(data);
        evt.target.style.pointerEvents = 'all';
        if (data.result.toUpperCase() == "SUCCESS") {
          if (rememberMe.className.includes('fa-check-square-o')) {
            window.localStorage.setItem('faAdminPortalId', $scope.loginId);
          } else {
            window.localStorage.removeItem('faAdminPortalId');
          }
          //set user after authentication
          let user = {
            "name": 'ADMIN',
            "loginId": data.loginId,
            "role": 'ADMIN',
          }
          window.sessionStorage.setItem('faAdmin', JSON.stringify(user));
          $location.path('library');
        } else {
          console.log(data);
          $scope.password = ''
          bootbox.alert({
            title: "Alert",
            message: "Invalid Admin ID or Password. Kindly Retry."
          });
        }
      }).catch(function (err) {
        console.error('Login request failed.', err);
        evt.target.style.pointerEvents = 'all';
        bootbox.alert({
          title: "Alert",
          message: "We are currently unable to Log you in. Kindly try after some time."
        });
      });
    } else {
      bootbox.alert({
        title: "Alert",
        message: "Kindly enter Admin Id and Password."
      });
    }
  };
});
