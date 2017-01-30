window.onload = function () {
  // Initialize Firebase
  initializeFirebase();
}

let initializeFirebase = function (reinitialize) {
  let config = {
    apiKey: "AIzaSyDGGFYyPbrX6YtNGHIKzdUtAEpD4bnMM8o",
    authDomain: "myfirebaseproject-c1059.firebaseapp.com",
    databaseURL: "https://myfirebaseproject-c1059.firebaseio.com",
    storageBucket: "myfirebaseproject-c1059.appspot.com",
    messagingSenderId: "367980625448"
  };
  let app = window.app = firebase.initializeApp(config);
  let fdb = window.fdb = firebase.database();
  let receiversReference = window.receiversReference = window.fdb.ref("receivers");
  let initiatorsReference = window.initiatorsReference = window.fdb.ref("initiators");
  let exchangeReference = window.exchangeReference = window.fdb.ref("exchange");
  setupReceivers(receiversReference, initiatorsReference, exchangeReference);
  window.currentCall = {
    "callTo": '',
    "callFrom": '',
    "timeout": '',
    "initiator": false
  }
};
let setupReceivers = function (receiversReference, initiatorsReference, exchangeReference) {
  let receiverContainer = document.querySelector('.receiver-container'),
      $receiverContainer = $(receiverContainer),
      $user = window.$user = $receiverContainer.find('.user'),
      userOperations = receiverContainer.querySelector('.operations'),
      btnEndCall = receiverContainer.querySelector('.btn-end-call');

  userOperations.addEventListener('click', function (evt) {
    if (evt.target.className.includes('btn-login')) {
      let loginId = userOperations.querySelector('.txt-login-id').value;
      if (loginId) {
        let receiversRegEx = /^1\d{4}$/;
        if (receiversRegEx.test(loginId)) {
          receiversReference.child(loginId).transaction(function(currentUserStats) {
            console.log("Login Transaction stats: ", currentUserStats);
            if (currentUserStats) {
              currentUserStats.status = "online";
              console.log("Login INFO: User " + loginId + " is " + currentUserStats.status + ".");
              return currentUserStats;
            }
            return currentUserStats;
          }, function (err, committed, snapshot) {
            if (err) {
              console.error(err);
            } else {
              let updatedUserStats = snapshot ? snapshot.val() : null;
              console.log("Login Transaction complete : " , err, committed, updatedUserStats);
              if (updatedUserStats) {
                if (committed == true ) {
                  console.log("Login successfully");
                  $user.attr('data-loginid', loginId);
                  $user.find('.login-id').text(loginId);
                  addReceiversListeners(receiversReference, initiatorsReference, exchangeReference, loginId);
                } else if (committed == false) {
                  console.log("WARN: Login failed.");
                }
              } else {
                console.log("Login Transaction: User " + loginId + " does not exist.");
                let user = {
                  "name": "New user",
                  "loginId": loginId,
                  "status": "online"
                };
                receiversReference.child(loginId).set(user).then(function () {
                  $user.attr('data-loginid', loginId);
                  $user.find('.login-id').text(loginId);
                  addReceiversListeners(receiversReference, initiatorsReference, exchangeReference, loginId);
                });
              }
            }
          });//receiversReference.child(expertId).transacrion
        } else {
          alert("Initiator's id should start with 1 and contain 5 digits.")
        }
      } else {
        alert("login ID missing");
      }
    } else if (evt.target.className.includes('btn-take-break')) {
      let loginId = $user.attr('data-loginid');
      if (evt.target.textContent == 'Take Break') {
        receiversReference.child(loginId).transaction(function(currentUserStats) {
          console.log("INFO: Take Break Transaction stats: ", currentUserStats);
          if (currentUserStats) {
            if (currentUserStats.status == 'online') {
              currentUserStats.status = "busy";
              return currentUserStats;
            }
            console.log("WARN: Take Break user " + loginId + " is " + currentUserStats.status + ".");
            return;
          }
          return currentUserStats;
        }, function (err, committed, snapshot) {
          if (err) {
            console.error(err);
          } else {
            let updatedUserStats = snapshot ? snapshot.val() : null;
            console.log("INFO: Take Break Transaction complete : " , err, committed, updatedUserStats);
            if (updatedUserStats) {
              if (committed == true ) {
                console.log("SUCCESS: Take Break successful.");
                evt.target.textContent = 'End Break';
              } else if (committed == false) {
                console.log("WARN: Take Break failed.");
              }
            } else {
              console.log("ERROR: Take Break Transaction: User " + loginId + " does not exist.");
            }
          }
        });//receiversReference.child(expertId).transacrion
      } else {
        receiversReference.child(loginId).transaction(function(currentUserStats) {
          console.log("INFO: End Break Transaction stats: ", currentUserStats);
          if (currentUserStats) {
            if (currentUserStats.status == 'busy') {
              currentUserStats.status = "online";
              return currentUserStats;
            }
            console.log("WARN: End Break Expert " + loginId + " is " + currentUserStats.status + ".");
            return;
          }
          return currentUserStats;
        }, function (err, committed, snapshot) {
          if (err) {
            console.error(err);
          } else {
            let updatedUserStats = snapshot ? snapshot.val() : null;
            console.log("INFO: End Break Transaction complete : " , err, committed, updatedUserStats);
            if (updatedUserStats) {
              if (committed == true ) {
                console.log("SUCCESS: End Break successful.");
                evt.target.textContent = 'Take Break';
              } else if (committed == false) {
                console.log("WARN: End Break failed.");
              }
            } else {
              console.log("ERROR: End Break Transaction: User " + loginId + " does not exist.");
            }
          }
        });//receiversReference.child(expertId).transacrion
      }
    } else if (evt.target.className.includes('btn-logout')) {
      let loginId = $user.attr('data-loginid');
      receiversReference.child(loginId).transaction(function(currentUserStats) {
        console.log("INFO: Logout Transaction stats: ", currentUserStats);
        if (currentUserStats) {
          if (currentUserStats.status == 'online') {
            currentUserStats.status = "offline";
            return currentUserStats;
          } else if (currentUserStats.status == 'busy') {
            showNotification("User " + loginId + " is busy. Cannot logout.");
          }
          console.log("WARN: Logout User " + loginId + " is " + currentUserStats.status + ".");
          return;
        }
        return currentUserStats;
      }, function (err, committed, snapshot) {
        if (err) {
          console.error(err);
        } else {
          let updatedUserStats = snapshot ? snapshot.val() : null;
          console.log("INFO: Logout Transaction complete : " , err, committed, updatedUserStats);
          if (updatedUserStats) {
            if (committed == true ) {
              console.log("SUCCESS: Logout successful.");
            } else if (committed == false) {
              console.log("WARN: Logout failed.");
            }
          } else {
            console.log("ERROR: Logout Transaction: User " + loginId + " does not exist.");
          }
        }
      });//receiversReference.child(expertId).transacrion
    }
  });

  btnEndCall.addEventListener('click', function (evt) {
    evt.stopPropagation();
    endCall(true)
  });
}// end setupReceivers()

let addReceiversListeners = function (receiversReference, initiatorsReference, exchangeReference, userId) {
  receiversReference.child(userId).off('value');
  receiversReference.child(userId).child('status').off('value');
  receiversReference.child(userId).child('status').on('value', function (snapshot) {
    let status = snapshot.val();
    let $expertStats = window.$user.find('.stats');
    switch (status) {
      case "online":
        $expertStats.find('.status').text("Online");
        $user.find('.operations').fadeIn();
        $user.find('.btn-login').hide();
        $user.find('.txt-login-id').hide();
        $user.find('.btn-take-break').fadeIn();
        $user.find('.btn-logout').fadeIn();
        break;
      case "offline":
        $expertStats.find('.status').text("Offline");
        $user.find('.operations').fadeIn();
        $user.find('.btn-take-break').hide();
        $user.find('.btn-logout').hide();
        $user.find('.btn-login').fadeIn();
        $user.find('.txt-login-id').fadeIn();
        break;
      case "busy":
        $expertStats.find('.status').text("Busy");
        break;
    }
  });

  //lisetn to incoming calls
  receiversReference.child(userId).child('call').off('value');
  receiversReference.child(userId).child('call').on('value', function (snapshot) {
    let newCallKey = snapshot.val();
    if (newCallKey) {
      console.log("Received: callKey=", newCallKey);
      window.currentCall.callKey = newCallKey;
      exchangeReference.child(newCallKey).transaction(function(currentCallProps) {
        if (currentCallProps) {
          //acknowledgement succeeds only if it's "my turn to acknowledge" and "the acknowledgement has not been done before".
          if (currentCallProps.turn == userId && !currentCallProps.to) {
            currentCallProps.to = userId;
            currentCallProps.turn = currentCallProps.from;
            window.currentCall.callFrom = currentCallProps.from;
            return currentCallProps;
          }
          return;
        }
        return currentCallProps;
      }, function (err, committed, snapshot) {
        if (err) {
          console.log("ERROR: Transaction aborted.");
          // receiversReference.child(userId).child('call').remove();
        } else {
          let updatedCallProps = snapshot ? snapshot.val() : null;
          if (updatedCallProps) {
            if (committed == true ) {
              console.log("Sent:ack=", userId);
              // on success start listening for remote sdp
              exchangeReference.child(newCallKey).child('fromSDP').on('value', function (snap) {
                let fromSDP = snap.val();
                if (fromSDP) {
                  console.log("Received:fromSDP=", fromSDP);
                  window.$user.find('.operations').hide();
                  window.$user.find('.call-from').text(window.currentCall.callFrom).parent().fadeIn();

                  let toSDP = "This is a toSDP of " + userId;
                  exchangeReference.child(newCallKey).child("toSDP").set(toSDP);
                }
              });
              //on success start listening for toSDP
              exchangeReference.child(newCallKey).child('fromCandidate').on('value', function (snap) {
                let toCandidate = snap.val();
                if (toCandidate) {
                  console.log("Received:toCandidate=", toCandidate);
                }
              });
              //on success start listening for toSDP
              exchangeReference.child(newCallKey).child('fromEndCall').on('value', function (snap) {
                let endCallMsg = snap.val();
                if (endCallMsg == true) {
                  console.log("Received:fromEndCall=", endCallMsg);
                  endCall(false);
                }
              });
            } else if (committed == false) {
              console.log("ERROR: acknowledgement failed. Not my turn/already acknowledged.");
              //cleanup if acknowledgement fails
              // TODO: Exchange cleanup
              receiversReference.child(userId).child('call').remove();
              exchangeReference.child(newCallKey).remove();
            }
          } else {
            console.log("ERROR in Call Transaction. Call " + newCallKey + " does not exist.");
            receiversReference.child(userId).child('call').remove();
          }
        }
      });
    }
  });
};// end addReceiversListeners()

let endCall = function (sendEndCallMsg) {
  let loginId = window.$user.attr('data-loginid');
  window.$user.find('.call-from').text('NA').parent().hide();
  window.$user.find('.operations').show();
  let callKey = window.currentCall.callKey;
  if (sendEndCallMsg == true) {
    window.exchangeReference.child(callKey).child('toEndCall').set(true).then(function () {
      window.exchangeReference.child(callKey).remove();
    });
  }
  window.receiversReference.child(loginId).child('call').remove();
  window.currentCall = {};
}
