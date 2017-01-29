window.onload = function () {
  // Initialize Firebase
  initializeFirebase();
  let expertsReference = window.expertsReference = window.fdb.ref("experts");
  let engineersReference = window.engineersReference = window.fdb.ref("engineers");
  let exchangeReference = window.exchangeReference = window.fdb.ref("exchange");

  setupExperts(expertsReference, engineersReference, exchangeReference);
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
let addExpertsListeners = function (expertsReference, engineersReference, exchangeReference, userId) {
  expertsReference.child(userId).off('value');
  expertsReference.child(userId).child('status').on('value', function (snapshot) {
    let status = snapshot.val();
    if (status) {
      $experts.each(function (i) {
        let $expert = $(this);
        if ($expert.attr('data-loginid') == userId) {
          let $expertStats = $expert.find('.stats');
          switch (status) {
            case "online":
              $expertStats.find('.status').text("Online");
              $expert.find('.operations').fadeIn();
              $expert.find('.btn-login').hide();
              $expert.find('.btn-take-break').fadeIn();
              $expert.find('.btn-logout').fadeIn();
              break;
            case "offline":
              $expertStats.find('.status').text("Offline");
              $expert.find('.operations').fadeIn();
              $expert.find('.btn-take-break').hide();
              $expert.find('.btn-logout').hide();
              $expert.find('.btn-login').fadeIn();
              break;
            case "busy":
              $expertStats.find('.status').text("Busy");
              break;
          }
        }
      });
    }
  });


  //lisetn to incoming calls
  expertsReference.child(userId).child('call').on('value', function (snapshot) {
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
          console.error(err);
          // expertsReference.child(userId).child('call').remove();
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

                  window.$experts.each(function (i) {
                    let $expert = $(this);
                    if ($expert.attr('data-loginid') == userId) {
                      $expert.find('.operations').hide();
                      $expert.attr('data-callFrom', window.currentCall.callFrom)
                        .find('.call-from').text(window.currentCall.callFrom).parent().fadeIn();
                    }
                  });

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
                let endCall = snap.val();
                if (endCall == true) {
                  console.log("Received:fromEndCall=", endCall);
                  window.$experts.each(function (i) {
                    let $expert = $(this),
                        loginId = $expert.attr('data-loginid');
                    if (true) {

                    }
                    $expert.attr('data-callFrom','')
                              .find('.call-from').text('NA').parent().hide();
                    $expert.find('.operations').show();

                    let callKey = window.currentCall.callKey;
                    if (window.currentCall.initiator) {
                      window.exchangeReference.child(callKey).remove();
                    } else {
                      window.expertsReference.child(loginId).child('call').remove();
                    }
                    window.currentCall = {};
                  });
                }
              });
            } else if (committed == false) {
              console.log("ERROR: acknowledgement failed. Not my turn/already acknowledged.");
              //cleanup if acknowledgement fails
              // TODO: Exchange cleanup
              expertsReference.child(userId).child('call').remove();
              exchangeReference.child(newCallKey).remove();
            }
          } else {
            console.log("ERROR in Call Transaction. Call " + newCallKey + " does not exist.");
            expertsReference.child(userId).child('call').remove();
          }
        }
      });
    }
  });
};// end addExpertsListeners()

let setupExperts = function (expertsReference, engineersReference, exchangeReference) {
  let expertContainer = document.querySelector('.experts-container');
  let $experts = window.$experts = $('.expert');//used later
  $experts.each(function (i) {
    let $expert = $(this);
    let loginId = $expert.attr('data-loginid');
    if (loginId) {
      addExpertsListeners(expertsReference, engineersReference, exchangeReference, loginId);
    } else {
      console.log("ERROR: Experts LoginId not found.");
    }
  });
  expertContainer.addEventListener('click', function (evt) {
    if (evt.target.tagName.toUpperCase() == 'BUTTON') {
      let $expert = $(evt.target).parents('.expert');
      let loginId = $expert.attr('data-loginid');
      if (evt.target.className.includes('btn-login')) {
        if (loginId) {
          expertsReference.child(loginId).transaction(function(currentExpertStats) {
            console.log("Login Transaction stats: ", currentExpertStats);
            if (currentExpertStats) {
              currentExpertStats.status = "online";
              console.log("Login INFO: Expert " + loginId + " is " + currentExpertStats.status + ".");
              return currentExpertStats;
            }
            return currentExpertStats;
          }, function (err, committed, snapshot) {
            if (err) {
              console.error(err);
            } else {
              let updatedExpertsStats = snapshot ? snapshot.val() : null;
              console.log("Login Transaction complete : " , err, committed, updatedExpertsStats);
              if (updatedExpertsStats) {
                if (committed == true ) {
                  console.log("Login successfully");
                } else if (committed == false) {
                  console.log("WARN: Login failed.");
                }
              } else {
                console.log("Login Transaction: Expert " + loginId + " does not exist.");
                expertsReference.child(loginId).set({
                      "name": "New user",
                      "loginId": loginId,
                      "status": "online"
                    });
              }
            }
          });//expertsReference.child(expertId).transacrion

        } else {
          alert("login ID missing");
        }
      } else if (evt.target.className.includes('btn-take-break')) {
        if (evt.target.textContent == 'Take Break') {
          expertsReference.child(loginId).transaction(function(currentExpertStats) {
            console.log("INFO: Take Break Transaction stats: ", currentExpertStats);
            if (currentExpertStats) {
              if (currentExpertStats.status == 'online') {
                currentExpertStats.status = "busy";
                return currentExpertStats;
              }
              console.log("WARN: Take Break Expert " + loginId + " is " + currentExpertStats.status + ".");
              return;
            }
            return currentExpertStats;
          }, function (err, committed, snapshot) {
            if (err) {
              console.error(err);
            } else {
              let updatedExpertsStats = snapshot ? snapshot.val() : null;
              console.log("INFO: Take Break Transaction complete : " , err, committed, updatedExpertsStats);
              if (updatedExpertsStats) {
                if (committed == true ) {
                  console.log("SUCCESS: Take Break successful.");
                  evt.target.textContent = 'End Break';
                } else if (committed == false) {
                  console.log("WARN: Take Break failed.");
                }
              } else {
                console.log("ERROR: Take Break Transaction: Expert " + loginId + " does not exist.");
              }
            }
          });//expertsReference.child(expertId).transacrion
        } else {
          expertsReference.child(loginId).transaction(function(currentExpertStats) {
            console.log("INFO: End Break Transaction stats: ", currentExpertStats);
            if (currentExpertStats) {
              if (currentExpertStats.status == 'busy') {
                currentExpertStats.status = "online";
                return currentExpertStats;
              }
              console.log("WARN: End Break Expert " + loginId + " is " + currentExpertStats.status + ".");
              return;
            }
            return currentExpertStats;
          }, function (err, committed, snapshot) {
            if (err) {
              console.error(err);
            } else {
              let updatedExpertsStats = snapshot ? snapshot.val() : null;
              console.log("INFO: End Break Transaction complete : " , err, committed, updatedExpertsStats);
              if (updatedExpertsStats) {
                if (committed == true ) {
                  console.log("SUCCESS: End Break successful.");
                  evt.target.textContent = 'Take Break';
                } else if (committed == false) {
                  console.log("WARN: End Break failed.");
                }
              } else {
                console.log("ERROR: End Break Transaction: Expert " + loginId + " does not exist.");
              }
            }
          });//expertsReference.child(expertId).transacrion
        }
      } else if (evt.target.className.includes('btn-logout')) {
        expertsReference.child(loginId).transaction(function(currentExpertStats) {
          console.log("INFO: Logout Transaction stats: ", currentExpertStats);
          if (currentExpertStats) {
            if (currentExpertStats.status == 'online') {
              currentExpertStats.status = "offline";
              return currentExpertStats;
            } else if (currentExpertStats.status == 'busy') {
              showNotification("Expert " + loginId + " is busy. Cannot logout.");
            }
            console.log("WARN: Logout Expert " + loginId + " is " + currentExpertStats.status + ".");
            return;
          }
          return currentExpertStats;
        }, function (err, committed, snapshot) {
          if (err) {
            console.error(err);
          } else {
            let updatedExpertsStats = snapshot ? snapshot.val() : null;
            console.log("INFO: Logout Transaction complete : " , err, committed, updatedExpertsStats);
            if (updatedExpertsStats) {
              if (committed == true ) {
                console.log("SUCCESS: Logout successful.");
              } else if (committed == false) {
                console.log("WARN: Logout failed.");
              }
            } else {
              console.log("ERROR: Logout Transaction: Expert " + loginId + " does not exist.");
            }
          }
        });//expertsReference.child(expertId).transacrion
      }
    }
  });

  $experts.on('click', '.btn-end-call', function (evt) {
    evt.stopPropagation();
    let $expert = $(evt.target).parents('.expert');
    let loginId = $expert.attr('data-loginid');
    let callFrom = $expert.attr('data-callFrom');
    $expert.attr('data-callFrom','')
              .find('.call-from').text('NA').parent().hide();
    $expert.find('.operations').show();

    window.exchangeReference.child(window.currentCall.callKey).child('toEndCall').set(true).then(function () {
      let callKey = window.currentCall.callKey;
      if (window.currentCall.initiator) {
        window.exchangeReference.child(callKey).remove();
      } else {
        window.expertsReference.child(loginId).child('call').remove();
      }
      window.currentCall = {};
    });
  });
}// end setupExperts()
