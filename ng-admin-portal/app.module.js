const gsmcApp = angular.module('gsmcApp',['ngRoute','firebase']);
gsmcApp.config(function ($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');// to distinguish b/w bookmarks and routes
  $routeProvider
  .when('/', {
    'templateUrl': 'templates/root.html',
    'controller': 'RootController'
  })
  .when('/home', {
    'templateUrl': 'templates/home.html',
    'controller': 'HomeController'
  })
  .when('/library', {
    'templateUrl': 'templates/library.html',
    'controller': 'LibraryController'
  })
  .when('/login', {
    'templateUrl': 'templates/login.html',
    'controller': 'LoginController'
  })
  .when('/logs', {
    'templateUrl': 'templates/logs.html',
    'controller': 'LogsController'
  })
  .when('/org-structure', {
    'templateUrl': 'templates/org-structure.html',
    'controller': 'OrgController'
  })
  .when('/users', {
    'templateUrl': 'templates/users.html',
    'controller': 'UsersController'
  })
  .otherwise({
    'templateUrl': 'templates/404.html'
  });
}).run(function ($rootScope, $location) {
  $rootScope.loadStyleSheet = function (styleSheet) {
    if(angular.isString(styleSheet))
      document.getElementById('ngViewStylesheet').href = 'static/css/' + styleSheet + '.css';
  };
  $rootScope.redirectRouteTo = function (route) {
    $location.path(route);
  };
  $rootScope.logout = function () {
    bootbox.alert({
      title: "Logout",
      message: "See you soon..."
    });
    $location.path('/');
  }

  let firebaseConfig = {
      "apiKey": "AIzaSyDF-66BiXEJQguw7vQJ7KT8MwJmRUOwWFI",
      "authDomain": "demogsmc-fieldassist.firebaseapp.com",
      "databaseURL": "https://demogsmc-fieldassist.firebaseio.com",
      "storageBucket": "demogsmc-fieldassist.appspot.com",
      "messagingSenderId": "829890022129"
  }
  $rootScope.firebaseApp = firebase.initializeApp(firebaseConfig);
});
