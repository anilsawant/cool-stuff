window.onload = function() {
  console.log('App Initialized.');
  fireHashChange();
}

/**
* listening to hashchange event and rendering views accordingly
* It also maintains the history of hash traversals
*/
let fireHashChange = function () {
  if (window.location.hash) {
    if (window.location.hash == '#login') {
      appRoutes[window.location.hash]();
    } else {
      if (window.sessionStorage.getItem('faAdmin')) {
        if( appRoutes[window.location.hash] ) {
          // if( !document.body.history )
          //   document.body.history = {};
          // document.body.history.previousHash = document.body.history.currentHash;
          // document.body.history.currentHash = window.location.hash;
          appRoutes[window.location.hash]();
          activateCorrespondingNavLink(window.location.hash);
        } else {
          appRoutes['#error']();
          activateCorrespondingNavLink(window.location.hash);
        }
      } else {
        showMsgBanner("You are not logged in. Kindly log in to proceed.", "error");
        window.location.hash = '#login';
      }
    }
  } else  {
    window.location.hash = '#login';
  }
}
//listen to the hashchange event of window
window.addEventListener('hashchange', fireHashChange);

// holds the various routes availabe in the app
let appRoutes = {
  "#login": function() {
    loadView({
      "html": "login.html",
      "css": "login.css",
      "controller": "loginController"
    });
  },
  "#home": function() {
    loadView({
      "html": "home.html",
      "css": "home.css",
      "controller": "homeController"
    });
  },
  "#error": function() {
    loadView({
      "html": "error.html",
      "css": "error.css",
      "controller": "errorController"
    });
  },
  "#devices": function() {
    loadSubView({
      "html": "devices.html",
      "css": "devices.css",
      "controller": "devicesController"
    });
  },
  "#staff": function() {
    loadSubView({
      "html": "staff.html",
      "css": "staff.css",
      "controller": "staffController"
    });
  },
  "#library": function() {
    loadSubView({
      "html": "library.html",
      "css": "library.css",
      "controller": "libraryController"
    });
  }
};

/**
* Loads the view and its corresponding controller based on props obj
* @param props object
*/
let loadView = function(props, done) {
  let htmlDir = 'includes/html/';
  let cssDir = 'includes/css/';
  let $overlay = $('#overlay');
  $overlay.fadeIn();
  if (props && document.body.controllers) {
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
        document.body.controllers[props.controller] ? document.body.controllers[props.controller]() : console.log(props.controller + ' is not loaded/defined.' );
      }
      setTimeout(function () {
        //container.style.display = 'block';
        $(container).fadeIn();
        $overlay.fadeOut();
        if (done && typeof done == 'function') {
          done();
        }
      }, 100);
    });
  } else {
    console.log("ERROR: Failed to load view");
  }
}

/**
* Loads the view and its corresponding controller based on props obj
* @param props object
*/
let loadSubView = function(props) {
  let htmlDir = 'includes/html/';
  let cssDir = 'includes/css/';
  if (props && document.body.controllers) {
    let $subView = $('#sub-view');
    if ($subView[0]) {
      $subView.removeClass('slide-fade-in').addClass('slide-fade-out');
      setTimeout(function () {
        $subView.html('');
        $.get(htmlDir + props.html, function(componentHtml) {
          $subView.html(componentHtml);
          if (props.css) {
            let subStylesheetToLoad = document.getElementById('subViewSheet');
            subStylesheetToLoad.href = cssDir + props.css;
          }
          if (props.controller) {
            document.body.controllers[props.controller] ? document.body.controllers[props.controller]() : console.log(props.controller + ' is not loaded/defined.' );
          }
          $subView.removeClass('slide-fade-out').addClass('slide-fade-in');
        });
      }, 300);
    } else {
      loadView({
        "html": "home.html",
        "css": "home.css",
        "controller": "homeController"
      }, function () {
        fireHashChange();
      });
    }
  } else {
    console.log("ERROR: Failed to load sub-view");
  }
}

let activateCorrespondingNavLink = function(hash) {
  let navLinks = document.getElementsByClassName('nav-link');
  for (var i = 0; i < navLinks.length; i++) {
    if (navLinks[i].getAttribute('href') == hash) {
      navLinks[i].className += ' active';
    } else {
      navLinks[i].className = navLinks[i].className.replace(/ *active */,'');
    }
  }
}
