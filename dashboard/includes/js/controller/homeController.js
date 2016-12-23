if(!document.body.controllers)
  document.body.controllers = {};

document.body.controllers.homeController = function() {
  let faAdmin = JSON.parse(window.sessionStorage.getItem('faAdmin'));
  if (!faAdmin) {
    showMsgBanner("You are not logged in. kindly log in to proceed.", "error");
    window.location.hash = "#login";
  } else {
    console.log("Hola!! Admin", faAdmin.name);
    document.querySelector('.user-details .name').textContent = faAdmin.name ? faAdmin.name : "Admin";
    window.fa = {
      "user": faAdmin,
      "data": {
        "currentSelection": {
          "type": "",
          "brand": "",
          "series": "",
          "model": ""
        },
        "availableDevicesTree": undefined
      },
      "dom": {}
    }
    initializeFirebase();

    let spanLogout = document.querySelector('.sign-out');
    spanLogout.addEventListener('click', function (evt) {
      evt.preventDefault();
      //reset global resources here
      window.sessionStorage.removeItem('faAdmin');
      document.body.user = undefined;
      document.body.history = undefined;
      window.location.hash = "#login";
      // showMsgBanner('Logged out successfully. See you soon...!!','success');
    });
  }
};

let initializeFirebase = function () {
  // var config = {
  //   apiKey: "AIzaSyDO46qVEVs9Q_IjTygBBMWIbLgxZ7xMeEc",
  //   authDomain: "gsmc-field-assist-d7998.firebaseapp.com",
  //   databaseURL: "https://gsmc-field-assist-d7998.firebaseio.com",
  //   storageBucket: "gsmc-field-assist-d7998.appspot.com",
  //   messagingSenderId: "516065559593"
  // };

  var config = {
    apiKey: "AIzaSyDF-66BiXEJQguw7vQJ7KT8MwJmRUOwWFI",
    authDomain: "demogsmc-fieldassist.firebaseapp.com",
    databaseURL: "https://demogsmc-fieldassist.firebaseio.com",
    storageBucket: "demogsmc-fieldassist.appspot.com",
    messagingSenderId: "829890022129"
  };

  if(!window.firebaseApp) {
    window.firebaseApp = firebase.initializeApp(config);
    window.firebaseDatabase = firebase.database().ref('videos/');
    window.firebaseStorage = firebase.storage().ref();
  }
};
