window.onload = function() {
  init();
}

/**
* listening to hashchange event and rendering views accordingly
* It also maintains the history of hash traversals
*/
window.addEventListener('hashchange', function() {
  console.log("In hashchange ", window.location.hash);
  if( appRoutes[window.location.hash] ){
    if( !document.body.history )
      document.body.history = {};
    document.body.history.previousHash = document.body.history.currentHash;
    document.body.history.currentHash = window.location.hash;

    if ( window.location.hash !== '' && !document.body.user ) {
      popupAlert('You are not authenticated. Kindly Login to continue.','Authentication Failure');
      window.location.hash = '#login';
    }
    appRoutes[window.location.hash]();
    activateCorrespondingNavLink(window.location.hash);
  } else {
    appRoutes['#error']();
    activateCorrespondingNavLink(window.location.hash);
  }
});

// holds the various routes availabe in the app
let appRoutes = {
  "": function() {
    document.getElementById('app-navbar').innerHTML = '';//clear the navbar in login page
    loadView({
      "html": "login.html",
      "css": "login.css",
      "controller": "loginController"
    });
  },
  "#login": function() {
    document.getElementById('app-navbar').innerHTML = '';//clear the navbar in login page
    loadView({
      "html": "login.html",
      "css": "login.css",
      "controller": "loginController"
    });
  },
  "#home": function() {
    loadView({
      "html": "admin-home.html",
      "css": "admin-home.css",
      "controller": "adminHomeController"
    });
  },
  "#knowledge-creation": function() {
    loadView({
      "html": "user-kc.html",
      "css": "user-kc.css",
      "controller": "kcController"
    });
  },
  "#search-qa": function() {
    loadView({
      "html": "user-search.html",
      "css": "user-search.css",
      "controller": "searchController"
    });
  },
  "#data-service": function() {
    loadView({
      "html": "admin-ds.html",
      "css": "admin-ds.css",
      "controller": "dsController"
    });
  },
  // "#settings": function() {
  //   loadView({
  //     "html": "settings.html",
  //     "css": "settings.css",
  //     "controller": "settingsController"
  //   });
  // },
  "#error": function() {
    loadView({
      "html": "error.html",
      "css": "error.css",
      "controller": "errorController"
    });
  }
};

/**
* Loads the view and its corresponding controller based on props obj
* @param props object
*/
let loadView = function(props) {
  let htmlDir = 'includes/html/';
  let cssDir = 'includes/css/';
  let $overlay = $('#overlay');
  $overlay.fadeIn();
  let container = document.getElementById('app-view');
  container.style.display = 'none';
  container.innerHTML = '';
  $.get(htmlDir + props.html, function(componentHtml) {
    container.innerHTML = componentHtml;
    if (props.css) {
      let stylesheetToLoad = document.getElementById('pageStylesheet');
      stylesheetToLoad.href = cssDir + props.css;
    }
    if (props.controller) {
      document.body[props.controller] ? document.body[props.controller]() : console.log(props.controller + ' is not loaded/defined.' );
    }
    setTimeout(function () {
      //container.style.display = 'block';
      $(container).fadeIn();
      $overlay.fadeOut();
    }, 100);
  });
}

/**
* loads the navbar
* @param props object
*/
let loadNavbar = function(props, done) {
  let htmlDir = 'includes/html/';
  let cssDir = 'includes/css/';
  $.get(htmlDir + props.html, function(navbarHtml) {
    let container = document.getElementById('app-navbar');
    container.style.display = 'none';
    container.innerHTML = navbarHtml;
    if (props.controller ){
      document.body[props.controller] ? document.body[props.controller]() : console.log(props.controller + ' is not loaded/defined.' );
    }
    if (typeof done == 'function') {
      done();
    }
    setTimeout(function () {
      //container.style.display = 'block';
      $(container).fadeIn();
    }, 100);
  });
}

let activateCorrespondingNavLink = function(hash) {
  let navLinks = document.getElementsByClassName('genie-nav-link');
  for (navLink of navLinks) {
    if (navLink.getAttribute('href') == hash) {
      navLink.className += ' active';
    } else {
      navLink.className = navLink.className.replace('active','');
    }
  }
}

let init = function() {
  console.log('App Initialized.');
  //to fix hashchange event firing issue
  if( window.location.hash.includes('login') ) {
    window.location.hash = '';
  } else {
    window.location.hash = '#login';
  }
}
