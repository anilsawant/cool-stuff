window.onload = function () {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDGGFYyPbrX6YtNGHIKzdUtAEpD4bnMM8o",
    authDomain: "myfirebaseproject-c1059.firebaseapp.com",
    databaseURL: "https://myfirebaseproject-c1059.firebaseio.com",
    storageBucket: "myfirebaseproject-c1059.appspot.com",
    messagingSenderId: "367980625448"
  };
  let app = firebase.initializeApp(config);
  let fdb = firebase.database();
  let expertsReference = fdb.ref("experts");
  let btnTestTransaction = document.getElementById('btnTestTransaction');
  btnTestTransaction.addEventListener('click', function () {
    expertsReference.child(10001).transaction(function(currentExpertStats) {
      console.log("Transaction Called Expert stats: ", currentExpertStats);
      if (currentExpertStats) {
        if (currentExpertStats.status == 'online') {
          currentExpertStats.status = "busy";
          currentExpertStats.caller = 1;
          return currentExpertStats;
        }
        console.log("INFO: Expert is " + currentExpertStats.status);
        return;
      }
      return currentExpertStats;
    }, function (err, committed, snapshot) {
      console.log("Transaction complete : " , err, committed, snapshot.val());
    });

    expertsReference.child(10001).transaction(function(currentExpertStats) {
      console.log("Transaction Called Expert stats: ", currentExpertStats);
      if (currentExpertStats) {
        if (currentExpertStats.status == 'online') {
          currentExpertStats.status = "busy";
          currentExpertStats.caller = 2;
          return currentExpertStats;
        }
        console.log("INFO: Expert is " + currentExpertStats.status);
        return;
      }
      return currentExpertStats;
    }, function (err, committed, snapshot) {
      console.log("Transaction complete : " , err, committed, snapshot.val());
    });

    expertsReference.child(10001).transaction(function(currentExpertStats) {
      console.log("Transaction Called Expert stats: ", currentExpertStats);
      if (currentExpertStats) {
        if (currentExpertStats.status == 'online') {
          currentExpertStats.status = "busy";
          currentExpertStats.caller = 3;
          return currentExpertStats;
        }
        console.log("INFO: Expert is " + currentExpertStats.status);
        return;
      }
      return currentExpertStats;
    }, function (err, committed, snapshot) {
      console.log("Transaction complete : " , err, committed, snapshot.val());
    });
  });
}
