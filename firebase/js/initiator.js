window.onload = function () {
  // Initialize Firebase
  initializeFirebase();
  let expertsReference = window.expertsReference = window.fdb.ref("experts");
  let engineersReference = window.engineersReference = window.fdb.ref("engineers");
  let exchangeReference = window.exchangeReference = window.fdb.ref("exchange");

  setupExchange(expertsReference, engineersReference, exchangeReference);
  setupEngineers(expertsReference, engineersReference, exchangeReference);
  window.currentCall = {
    "ackFrom": "",
    "callTo": ""
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

let setupExchange = function (expertsReference, engineersReference, exchangeReference) {
  //listen to notifications from the Telephone-Exchange
  exchangeReference.child('20001').child('from').on('value', function (snapshot) {
    let ackFrom = snapshot.val();
    if (ackFrom) {
      console.log("Setup acknowledgement received from ", ackFrom);
      window.currentCall.ackFrom = ackFrom;
      console.log("Offer @", new Date());
      window.$engineers.each(function (i) {
        let $engineer = $(this);
        if ($engineer.attr('data-loginId') == 20001) {
          $engineer.find('.operations').hide();
          $engineer.attr('data-callTo', ackFrom)
            .find('.call-to').text(ackFrom).parent().fadeIn();
        }
      });
      exchangeReference.child(ackFrom).child('sdp').set("Dummy SDP of Engineer 20001")
      .then(function () {
        console.log('SDP shared from Engineer side');
      });
    }
  });
  exchangeReference.child('20001').child('icecandidate').on('value', function (snapshot) {
    let remoteCandidate = snapshot.val();
    if (remoteCandidate) {
      console.log('remoteCandidate', remoteCandidate);
    }
  });
  exchangeReference.child('20001').child('sdp').on('value', function (snapshot) {
    let remoteSDP = snapshot.val();
    if (remoteSDP) {
      console.log("INFO: remoteSDP received @", new Date(), remoteSDP);
    }
  });
  exchangeReference.child('20001').child('msg').on('value', function (snapshot) {
    let remoteMsg = snapshot.val();
    if (remoteMsg) {
      console.log("INFO: remoteMsg:" + remoteMsg + " received @", new Date());
      if (remoteMsg == 'endcall') {
        window.$engineers.each(function (i) {
          let $engineer = $(this),
              loginId = $engineer.attr('data-loginId');
          if (loginId == 20001) {
            engineersReference.child(loginId).child("status").set("online").then(function () {
              $engineer.attr('data-callTo','')
                .find('.call-to').text('NA').parent().hide();
            });
            clearTimeout(window.currentCall.timeout);
            window.currentCall = {};
          }
        });
      }
    }
  });

  //listen to notifications from the Telephone-Exchange
  exchangeReference.child('20002').child('from').on('value', function (snapshot) {
    let ackFrom = snapshot.val();
    if (ackFrom) {
      console.log("Setup acknowledgement received from ", ackFrom);
      window.currentCall.ackFrom = ackFrom;
      console.log("Offer @", new Date());
      window.$engineers.each(function (i) {
        let $engineer = $(this);
        if ($engineer.attr('data-loginId') == 20002) {
          $engineer.find('.operations').hide();
          $engineer.attr('data-callTo', ackFrom)
            .find('.call-to').text(ackFrom).parent().fadeIn();
        }
      });
      exchangeReference.child(ackFrom).child('sdp').set("Dummy SDP of Engineer 20002")
      .then(function () {
        console.log('SDP shared from Engineer side');
      });
    }
  });
  exchangeReference.child('20002').child('icecandidate').on('value', function (snapshot) {
    let remoteCandidate = snapshot.val();
    if (remoteCandidate) {
      console.log('remoteCandidate', remoteCandidate);
    }
  });
  exchangeReference.child('20002').child('sdp').on('value', function (snapshot) {
    let remoteSDP = snapshot.val();
    if (remoteSDP) {
      console.log("INFO: remoteSDP received @", new Date(), remoteSDP);
    }
  });
  exchangeReference.child('20002').child('msg').on('value', function (snapshot) {
    let remoteMsg = snapshot.val();
    if (remoteMsg) {
      console.log("INFO: remoteMsg:" + remoteMsg + " received @", new Date());
      if (remoteMsg == 'endcall') {
        window.$engineers.each(function (i) {
          let $engineer = $(this);
          if ($engineer.attr('data-loginId') == 20002) {
            engineersReference.child(20002).child("status").set("online").then(function () {
              $engineer.attr('data-callTo','')
                .find('.call-to').text('NA').parent().hide();
            });
            clearTimeout(window.currentCall.timeout);
            window.currentCall = {};
          }
        });
      }
    }
  });
} // .end setupExchange()

let setupEngineers = function (expertsReference, engineersReference, exchangeReference) {
  let engineersContainer = document.querySelector('.engineers-container');
  let $engineers = window.$engineers = $('.engineer');//used later
  $engineers.each(function (i) {
    let $engineer = $(this);
    let loginId = $engineer.attr('data-loginId');
    if (loginId) {
      addEngineersListeners(engineersReference, loginId);
    } else {
      console.log("ERROR: Engineer's LoginId not found.");
    }
  });
  engineersContainer.addEventListener('click', function (evt) {
    if (evt.target.tagName.toUpperCase() == 'BUTTON') {
      let $engineer = $(evt.target).parents('.engineer');
      let engineerId = $engineer.attr('data-loginId');
      if (evt.target.className.includes('btn-login')) {
        if (engineerId) {
          engineersReference.child(engineerId).once('value', function (snapshot) {
            let user = snapshot.val();
            if (user) {
              engineersReference.child(engineerId).child("status").set("online");
            } else {
              engineersReference.child(engineerId).set({
                "name": "New Engineer",
                "engineerId": engineerId,
                "status": "online"
              });
            }
          });
        } else {
          alert("login ID missing");
        }
      } else if (evt.target.className.includes('btn-logout')) {
        engineersReference.child(engineerId).child("status").set("offline");
      } else if (evt.target.className.includes('btn-make-call')) {
        let expertId = $engineer.find('.txt-expert-id').val();
        if (expertId) {
          expertsReference.child(expertId).transaction(function(currentExpertStats) {
            if (currentExpertStats) {
              if (currentExpertStats.status == 'online') {
                currentExpertStats.status = "locked";
                return currentExpertStats;
              }
              return;
            }
            return currentExpertStats;
          }, function (err, committed, snapshot) {
            if (err) {
              console.error(err);
            } else {
              let updatedExpertsStats = snapshot ? snapshot.val() : null;
              if (updatedExpertsStats) {
                if (committed == true ) {
                  engineersReference.child(engineerId).child('status').set('busy')
                  .then(function () {
                    $engineer.find('.operations').fadeOut();
                    window.currentCall.callTo = expertId;
                    exchangeReference.child(expertId).child('from').set(engineerId);//Call setup request sent to expert:10001
                    console.log("INFO: Call setup request sent to ", expertId, " @", new Date());
                    window.currentCall.timeout = setTimeout(function () {
                      console.log(window.currentCall);
                      if (window.currentCall.ackFrom && (window.currentCall.callTo == window.currentCall.ackFrom)) {
                        // call acknowledgement received. Hence assuming call will be made
                      } else {
                        showNotification(engineerId + ":Expert " + expertId + " did not send acknowledgement.");
                        window.currentCall.callTo = "";
                        window.currentCall.ackFrom = "";
                        removeCallFromEcxhange(expertId);
                        // removeCallFromEcxhange(engineerId);

                        expertsReference.child(expertId).transaction(function(currentExpertStats) {
                          if (currentExpertStats) {
                            if (currentExpertStats.status != 'online') {
                              currentExpertStats.status = "online";
                              return currentExpertStats;
                            }
                            return;
                          }
                          return currentExpertStats;
                        }, function (err, committed, snapshot) {
                          if (err) {
                            console.error(err);
                          } else {
                            let updatedExpertsStats = snapshot ? snapshot.val() : null;
                            console.log('updatedExpertsStats', updatedExpertsStats);
                          }
                        });

                        engineersReference.child(engineerId).child('status').set('online');
                      }
                    }, 10*1000);
                    // let i = 0
                    // setInterval(function () {
                    //   console.log(++i);
                    // }, 1000);
                  });
                } else if (committed == false) {
                  // engineersReference.child(engineerId).child('status').set('online')
                  // .then(function () {
                  //   $engineer.find('.operations').fadeIn();
                  // });
                }
              } else {
                console.log("ERROR: Call Transaction Expert " + expertId + " does not exist.");
                showNotification("Expert " + expertId + " does not exist.");
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
        if ($engineer.attr('data-loginId') == userId) {
          let $engineerStats = $engineer.find('.stats');
          switch (status) {
            case "online":
              $engineerStats.find('.status').text("Online");
              console.log('Engineer is online');
              $engineer.find('.operations').fadeIn();
              $engineer.find('.btn-login').hide();
              $engineer.find('.txt-expert-id').fadeIn();
              $engineer.find('.btn-make-call').fadeIn(function () {
                console.log('Done fadein');
              });
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
    let loginId = $engineer.attr('data-loginId');
    let callTo = $engineer.attr('data-callTo');
    exchangeReference.child(callTo).child('msg').set("endcall").then(function () {
      removeCallFromEcxhange(callTo);
    });
    removeCallFromEcxhange(loginId);
    engineersReference.child(loginId).child('status').set('online').then(function () {
      $engineer.attr('data-callTo','')
        .find('.call-to').text('NA').parent().hide();
    });
    clearTimeout(window.currentCall.timeout);
    window.currentCall = {};
  });
};// end addEngineersListeners()

let removeCallFromEcxhange = function (callerId) {
  if (callerId) {
    window.exchangeReference.child(callerId).transaction(function(currentExchangeStats) {
      console.log("INFO: currentExchangeStats: ", currentExchangeStats);
      if (currentExchangeStats) {
        currentExchangeStats.isRemoving = true;
        return currentExchangeStats;
      }
      return currentExchangeStats;
    }, function (err, committed, snapshot) {
      if (err) {
        console.log("Removing call failed. Try later.");
      } else {
        if (committed == true ) {
          console.log("Removing call");
          exchangeReference.child(callerId).remove();
        } else if (committed == false) {
          console.log('Call can be established');
        }
      }
    });
  }
}
