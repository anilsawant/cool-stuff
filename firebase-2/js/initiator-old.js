window.onload = function () {
  // Initialize Firebase
  initializeFirebase();
  let expertsReference = window.expertsReference = window.fdb.ref("experts");
  let engineersReference = window.engineersReference = window.fdb.ref("engineers");
  let exchangeReference = window.exchangeReference = window.fdb.ref("exchange");

  setupEngineers(expertsReference, engineersReference, exchangeReference);
  window.currentCall = {
    "callTo": '',
    "callFrom": '',
    "timeout": '',
    "initiator": false
  }
}

let initializeFirebase = function (reinitialize) {
  let config = {
    apiKey: "AIzaSyDGGFYyPbrX6YtNGHIKzdUtAEpD4bnMM8o",
    authDomain: "myfirebaseproject-c1059.firebaseapp.com",
    databaseURL: "https://myfirebaseproject-c1059.firebaseio.com",
    storageBucket: "myfirebaseproject-c1059.appspot.com",
    messagingSenderId: "367980625448"
  };
  if (reinitialize) {
    console.log("reinitializing app");
    firebase.app().delete().then(function() {
      window.app = firebase.initializeApp(config);
      window.fdb = null;
      window.fdb = firebase.database();
  });
  } else {
    let app = window.app = firebase.initializeApp(config);
    let fdb = window.fdb = firebase.database();
  }
};

let setupEngineers = function (expertsReference, engineersReference, exchangeReference) {
  let engineersContainer = document.querySelector('.engineers-container');
  let $engineers = window.$engineers = $('.engineer');//used later
  $engineers.each(function (i) {
    let $engineer = $(this);
    let loginId = $engineer.attr('data-loginid');
    if (loginId) {
      addEngineersListeners(engineersReference, loginId);
    } else {
      console.log("ERROR: Engineer's LoginId not found.");
    }
  });
  engineersContainer.addEventListener('click', function (evt) {
    if (evt.target.tagName.toUpperCase() == 'BUTTON') {
      let $engineer = $(evt.target).parents('.engineer');
      let userId = $engineer.attr('data-loginid');
      if (evt.target.className.includes('btn-login')) {
        if (userId) {
          engineersReference.child(userId).once('value', function (snapshot) {
            let user = snapshot.val();
            if (user) {
              engineersReference.child(userId).child("status").set("online");
            } else {
              engineersReference.child(userId).set({
                "name": "New User",
                "userId": userId,
                "status": "online"
              });
            }
          });
        } else {
          alert("login ID missing");
        }
      } else if (evt.target.className.includes('btn-logout')) {
        engineersReference.child(userId).child("status").set("offline");
      } else if (evt.target.className.includes('btn-make-call')) {
        let expertId = $engineer.find('.txt-expert-id').val();
        if (expertId) {
          let newCallRef = exchangeReference.push({
            "from": userId,
            "timeStamp": Date.now(),
            "turn": expertId
          });
          let callKey = newCallRef.key;
          console.log('callKey', callKey);
          window.currentCall.callTo = expertId;
          window.currentCall.callKey = callKey;
          window.currentCall.initiator = true;
          expertsReference.child(expertId).transaction(function(currentExpertStats) {
            if (currentExpertStats) {
              if (currentExpertStats.status == 'online' && !currentExpertStats.call) {
                currentExpertStats.call = callKey;
                return currentExpertStats;
              }
              return;
            }
            return currentExpertStats;
          }, function (err, committed, snapshot) {
            if (err) {
              console.error(err);
              //cleanup the timed-out call
              window.currentCall = {};
              exchangeReference.child(callKey).remove();
              expertsReference.child(expertId).child('call').remove();
            } else {
              let updatedExpertsStats = snapshot ? snapshot.val() : null;
              if (updatedExpertsStats) {
                if (committed == true ) {
                  console.log("SUCCESS: " + userId + "'s call registered @exchange.");

                  //start a timeout of 10s till you wait for acknowledgement
                  window.currentCall.timeout = setTimeout(function () {
                    window.currentCall.isTimedOut = true;
                    console.log('Ack wait timeout called:');
                    exchangeReference.child(callKey).transaction(function(currentCallProps) {
                      if (currentCallProps) {
                        if (currentCallProps.turn == expertId) {//since ack was not received, turn will be of 'to'
                          currentCallProps.turn = currentCallProps.from;
                          return currentCallProps;
                        }
                        return;
                      }
                      return currentCallProps;
                    }, function (err, committed, snapshot) {
                      if (err) {
                        console.error(err);
                        //cleanup the timed-out call
                        window.currentCall = {};
                        exchangeReference.child(callKey).remove();
                        expertsReference.child(expertId).child('call').remove();
                      } else {
                        let updatedCallProps = snapshot ? snapshot.val() : null;
                        if (updatedCallProps) {
                          if (committed == true ) {
                            console.log("SUCCESS: Ack timeout will do the cleanup.");
                            //cleanup the timed-out call
                            window.currentCall = {};
                            exchangeReference.child(callKey).remove();
                            expertsReference.child(expertId).child('call').remove();
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
                          console.log("ERROR in Call Transaction. Call " + newCallKey + " does not exist.");
                        }
                      }
                    });;
                  }, 10*1000);//waiting for acknowledgement

                  //on success start listening for the acknowledgement from 'to'
                  newCallRef.child('to').on('value', function (snap) {
                    let ackFrom = snap.val();
                    if (ackFrom && ackFrom == expertId) {
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
                      window.$engineers.each(function (i) {
                        let $engineer = $(this);
                        if ($engineer.attr('data-loginid') == userId) {
                          $engineer.find('.operations').hide();
                          $engineer.attr('data-callTo', window.currentCall.ackFrom)
                            .find('.call-to').text(window.currentCall.ackFrom).parent().fadeIn();
                        }
                      });
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
                    let endCall = snap.val();
                    if (endCall == true) {
                      console.log("Received:toEndCall=", endCall);
                      window.$engineers.each(function (i) {
                        let $engineer = $(this),
                            loginId = $engineer.attr('data-loginid');
                        if (loginId == userId) {
                          $engineer.attr('data-callTo','')
                              .find('.call-to').text('NA').parent().hide();
                          $engineer.find('.operations').show();
                          if (window.currentCall.initiator) {
                            window.exchangeReference.child(callKey).remove();
                          } else {
                            window.expertsReference.child(loginId).child('call').remove();
                          }
                          window.currentCall = {};
                        }
                      });
                    }
                  });
                } else if (committed == false) {
                  console.log("ERROR: " + userId + "'s call failed.");
                  window.currentCall = {};
                  newCallRef.remove();
                }
              } else {
                console.log("ERROR in Call Transaction. Expert " + expertId + " does not exist.");
                newCallRef.remove();
              }
            }
          });
        }
      }
    }
  });
}// end setupEngineers()

let addEngineersListeners = function (engineersReference, userId) {
  engineersReference.child(userId).off('value');
  engineersReference.child(userId).child('status').on('value', function (snapshot) {
    let status = snapshot.val();
    if (status) {
      $engineers.each(function (i) {
        let $engineer = $(this);
        if ($engineer.attr('data-loginid') == userId) {
          let $engineerStats = $engineer.find('.stats');
          switch (status) {
            case "online":
              $engineerStats.find('.status').text("Online");
              $engineer.find('.operations').fadeIn();
              $engineer.find('.btn-login').hide();
              $engineer.find('.txt-expert-id').fadeIn();
              $engineer.find('.btn-make-call').fadeIn();
              $engineer.find('.btn-logout').fadeIn();
              break;
            case "offline":
              $engineerStats.find('.status').text("Offline");
              $engineer.find('.operations').fadeIn();
              $engineer.find('.txt-expert-id').hide();
              $engineer.find('.btn-make-call').hide();
              $engineer.find('.btn-logout').hide();
              $engineer.find('.btn-login').fadeIn();
              break;
            case "busy":
              $engineerStats.find('.status').text("Busy");
              break;
          }
        }
      });
    }
  });

  $engineers.on('click', '.btn-end-call', function (evt) {
    evt.stopPropagation();
    let $engineer = $(evt.target).parents('.engineer');
    let loginId = $engineer.attr('data-loginid');
    let callTo = $engineer.attr('data-callTo');
    $engineer.attr('data-callTo','')
        .find('.call-to').text('NA').parent().hide();
    $engineer.find('.operations').show();
    window.exchangeReference.child(window.currentCall.callKey).child('fromEndCall').set(true).then(function () {
      let callKey = window.currentCall.callKey;
      if (callKey)
        window.exchangeReference.child(callKey).remove();

      if (!window.currentCall.initiator)
        window.expertsReference.child(loginId).child('call').remove();
      window.currentCall = {};
    });
  });
};// end addEngineersListeners()
