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

  setupInitiators(receiversReference, initiatorsReference, exchangeReference);
  window.currentCall = {
    "callTo": '',
    "callFrom": '',
    "timeout": '',
    "initiator": false
  }
};

let setupInitiators = function (receiversReference, initiatorsReference, exchangeReference) {
  let initiatorContainer = document.querySelector('.initiator-container'),
      $initiatorContainer = $(initiatorContainer),
      $user = window.$user = $initiatorContainer.find('.user'),
      userOperations = initiatorContainer.querySelector('.operations'),
      btnEndCall = initiatorContainer.querySelector('.btn-end-call');

  userOperations.addEventListener('click', function (evt) {
    if (evt.target.className.includes('btn-login')) {
      let userId = userOperations.querySelector('.txt-login-id').value;
      if (userId) {
        let initiatorsRegEx = /^2\d{4}$/;
        if (initiatorsRegEx.test(userId)) {
          initiatorsReference.child(userId).once('value', function (snapshot) {
            let user = snapshot.val();
            if (user) {
              initiatorsReference.child(userId).child("status").set("online").then(function () {
                window.$user.attr('data-loginid', userId);
                window.$user.find('.login-id').text(userId);
                addInitiatorsListeners(receiversReference, initiatorsReference, exchangeReference, userId);
              });
            } else {
              let user = {
                "name": "New User",
                "userId": userId,
                "status": "online"
              };
              initiatorsReference.child(userId).set(user).then(function () {
                window.$user.attr('data-loginid', userId);
                window.$user.find('.login-id').text(userId);
                addInitiatorsListeners(receiversReference, initiatorsReference, exchangeReference, userId);
              });
            }
          });
        } else {
          alert("Initiator's id should start with 2 and contain 5 digits.")
        }
      } else {
        alert("login ID missing");
      }
    } else if (evt.target.className.includes('btn-logout')) {
      let userId = window.$user.attr('data-loginid');
      initiatorsReference.child(userId).child("status").set("offline");
    } else if (evt.target.className.includes('btn-make-call')) {
      let receiverId = window.$user.find('.txt-receiver-id').val();
      if (receiverId) {
        let userId = window.$user.attr('data-loginid');
        if (userId == receiverId) {
          alert('Cannot call yourself.');
        } else {
          let newCallRef = exchangeReference.push({
            "from": userId,
            "timeStamp": Date.now(),
            "turn": receiverId
          });
          let callKey = newCallRef.key;
          console.log('callKey', callKey);
          window.currentCall.callTo = receiverId;
          window.currentCall.callKey = callKey;
          window.currentCall.initiator = true;
          receiversReference.child(receiverId).transaction(function(currentReceiversStats) {
            if (currentReceiversStats) {
              if (currentReceiversStats.status == 'online' && !currentReceiversStats.call) {
                currentReceiversStats.call = callKey;
                return currentReceiversStats;
              }
              return;
            }
            return currentReceiversStats;
          }, function (err, committed, snapshot) {
            if (err) {
              console.log("ERROR: Transaction aborted.");
              //cleanup the timed-out call
              window.currentCall = {};
              exchangeReference.child(callKey).remove();
              receiversReference.child(receiverId).child('call').remove();
            } else {
              let updatedReceiversStats = snapshot ? snapshot.val() : null;
              if (updatedReceiversStats) {
                if (committed == true ) {
                  console.log("SUCCESS: " + userId + "'s call registered @exchange.");

                  //start a timeout of 10s till you wait for acknowledgement
                  window.currentCall.timeout = setTimeout(function () {
                    window.currentCall.isTimedOut = true;
                    console.log('Ack wait timeout called:');
                    exchangeReference.child(callKey).transaction(function(currentCallProps) {
                      if (currentCallProps) {
                        if (currentCallProps.turn == receiverId) {//since ack was not received, turn will be of 'to'
                          currentCallProps.turn = currentCallProps.from;
                          return currentCallProps;
                        }
                        return;
                      }
                      return currentCallProps;
                    }, function (err, committed, snapshot) {
                      if (err) {
                        console.log("ERROR: Transaction aborted.");
                        //cleanup the timed-out call
                        window.currentCall = {};
                        exchangeReference.child(callKey).remove();
                        receiversReference.child(receiverId).child('call').remove();
                      } else {
                        let updatedCallProps = snapshot ? snapshot.val() : null;
                        if (updatedCallProps) {
                          if (committed == true ) {
                            console.log("SUCCESS: Ack timeout will do the cleanup.");
                            //cleanup the timed-out call
                            window.currentCall = {};
                            exchangeReference.child(callKey).remove();
                            receiversReference.child(receiverId).child('call').remove();
                          } else if (committed == false) {
                            //Extreme case: received acknowledgement exactly @timeout
                            console.log("ERROR: Ack timeout failed. Not my turn.");
                            if (window.currentCall.ackFrom) {
                              let fromSDP = "This is a FromSDP of " + userId;
                              exchangeReference.child(callKey).child("fromSDP").set(fromSDP);
                            } else {
                              console.log("FATAL: Transaction failed.", window.currentCall);
                            }
                          }
                        } else {
                          console.log("ERROR in Call Transaction. Call " + callKey + " does not exist.");
                        }
                      }
                    });;
                  }, 10*1000);//waiting for acknowledgement

                  //on success start listening for the acknowledgement from 'to'
                  newCallRef.child('to').on('value', function (snap) {
                    let ackFrom = snap.val();
                    if (ackFrom && ackFrom == receiverId) {
                      console.log("Acknowledgement received from ", ackFrom);
                      window.currentCall.ackFrom = ackFrom;
                      if (!window.currentCall.isTimedOut) {
                        clearTimeout(window.currentCall.timeout);//clear ack wait timeout
                        let fromSDP = "This is a FromSDP of " + userId;
                        exchangeReference.child(callKey).child("fromSDP").set(fromSDP);
                      }
                    }
                  });
                  //on success start listening for toSDP
                  exchangeReference.child(callKey).child('toSDP').on('value', function (snap) {
                    let toSDP = snap.val();
                    if (toSDP) {
                      console.log("Received:toSDP=", toSDP);
                      window.$user.find('.operations').hide();
                      window.$user.find('.call-to').text(window.currentCall.ackFrom).parent().fadeIn();
                    }
                  });
                  //on success start listening for toSDP
                  exchangeReference.child(callKey).child('toCandidate').on('value', function (snap) {
                    let toCandidate = snap.val();
                    if (toCandidate) {
                      console.log("Received:toCandidate=", toCandidate);
                    }
                  });
                  //on success start listening for toSDP
                  exchangeReference.child(callKey).child('toEndCall').on('value', function (snap) {
                    let endCallMsg = snap.val();
                    if (endCallMsg == true) {
                      console.log("Received:toEndCall=", endCallMsg);
                      endCall(false);
                    }
                  });
                } else if (committed == false) {
                  console.log("ERROR: " + userId + "'s call failed.");
                  window.currentCall = {};
                  newCallRef.remove();
                }
              } else {
                console.log("ERROR in Call Transaction. Expert " + receiverId + " does not exist.");
                newCallRef.remove();
              }
            }
          });
        }
      }
    }
  });
  btnEndCall.addEventListener('click', function (evt) {
    evt.stopPropagation();
    endCall(true);
  });
}// end setupInitiators()

let addInitiatorsListeners = function (receiversReference, initiatorsReference, exchangeReference, userId) {
  initiatorsReference.child(userId).off('value');
  initiatorsReference.child(userId).child('status').on('value', function (snapshot) {
    let status = snapshot.val();
    if (status) {
      let $userStats = window.$user.find('.stats');
      switch (status) {
        case "online":
          $userStats.find('.status').text("Online");
          window.$user.find('.operations').fadeIn();
          window.$user.find('.txt-receiver-id').fadeIn();
          window.$user.find('.btn-make-call').fadeIn();
          window.$user.find('.btn-logout').fadeIn();
          window.$user.find('.btn-login').hide();
          window.$user.find('.txt-login-id').hide();
          break;
        case "offline":
          $userStats.find('.status').text("Offline");
          window.$user.find('.operations').fadeIn();
          window.$user.find('.txt-login-id').fadeIn();
          window.$user.find('.btn-login').fadeIn();
          window.$user.find('.txt-receiver-id').hide();
          window.$user.find('.btn-make-call').hide();
          window.$user.find('.btn-logout').hide();
          break;
        case "busy":
          $userStats.find('.status').text("Busy");
          break;
      }
    }
  });
};// end addInitiatorsListeners()

let endCall = function (sendEndCallMsg) {
  let loginId = window.$user.attr('data-loginid');
  window.$user.find('.call-to').text('NA').parent().hide();
  window.$user.find('.operations').show();
  if (sendEndCallMsg == true) {
    let callKey = window.currentCall.callKey;
    window.exchangeReference.child(callKey).child('fromEndCall').set(true).then(function () {
      window.exchangeReference.child(callKey).remove();
      window.receiversReference.child(loginId).child('call').remove();
    });
  }
  window.currentCall = {};
}
