window.onload = function () {
  // Initialize Firebase
  initializeFirebase();
  let expertsReference = window.expertsReference = window.fdb.ref("experts");
  let engineersReference = window.engineersReference = window.fdb.ref("engineers");
  let exchangeReference = window.exchangeReference = window.fdb.ref("exchange");

  setupExchange(expertsReference, engineersReference, exchangeReference);
  setupExperts(expertsReference, engineersReference, exchangeReference);
  setupEngineers(expertsReference, engineersReference, exchangeReference);
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
  exchangeReference.child('10001').child('from').on('value', function (snapshot) {
    let callFrom = window.callFrom = snapshot.val();
    if (callFrom) {
      console.log("INFO: Call setup request from ", callFrom , '@', new Date());
      window.$experts.each(function (i) {
        let $expert = $(this);
        if ($expert.attr('data-loginId') == 10001) {
          $expert.find('.operations').hide();
          $expert.attr('data-callFrom', callFrom)
            .find('.call-from').text(callFrom).parent().fadeIn();
        }
      });
      //Call setup acknowledgement sent back to callFrom
      exchangeReference.child(callFrom).child('from').set('10001').then(function () {
        exchangeReference.child(callFrom).child('sdp').set("Dummy SDP of Expert 10001");
      });
    }
  });
  exchangeReference.child('10001').child('sdp').on('value', function (snapshot) {
    let remoteSDP = snapshot.val();
    if (remoteSDP) {
      console.log("INFO: remoteSDP received @", new Date(), remoteSDP);
    }
  });
  exchangeReference.child('10001').child('msg').on('value', function (snapshot) {
    let remoteMsg = snapshot.val();
    if (remoteMsg) {
      console.log("INFO: remoteMsg:" + remoteMsg + " received @", new Date());
      if (remoteMsg == 'endcall') {
        window.$experts.each(function (i) {
          let $expert = $(this);
          if ($expert.attr('data-loginId') == 10001) {
            exchangeReference.child(10001).remove().then(function () {
              expertsReference.child(10001).transaction(function(currentExpertStats) {
                console.log("INFO: Transaction End Call stats: ", currentExpertStats);
                if (currentExpertStats) {
                  if (currentExpertStats.status == 'busy') {
                    currentExpertStats.status = "online";
                    return currentExpertStats;
                  }
                  console.log("WARN: Transaction End Call Expert " + 10001 + " is " + currentExpertStats.status + ".");
                  return;
                }
                return currentExpertStats;
              }, function (err, committed, snapshot) {
                if (err) {
                  console.error(err);
                } else {
                  let updatedExpertsStats = snapshot ? snapshot.val() : null;
                  console.log("INFO: Transaction End Call complete : " , err, committed, updatedExpertsStats);
                  if (updatedExpertsStats) {
                    if (committed == true ) {
                      console.log("SUCCESS: Transaction End Call successful.");
                        $expert.attr('data-callFrom','')
                          .find('.call-from').text('NA').parent().hide();
                    } else if (committed == false) {
                      console.log("WARN: Transaction End Call failed.");
                    }
                  } else {
                    console.log("ERROR: Transaction End Call Expert " + 10001 + " does not exist.");
                  }
                }
              });//expertsReference.child(expertId).transaction
            });
          }
        });
      }
    }
  });

  //listen to notifications from the Telephone-Exchange
  exchangeReference.child('10002').child('from').on('value', function (snapshot) {
    let callFrom = window.callFrom = snapshot.val();
    if (callFrom) {
      console.log("INFO: Call setup request from ", callFrom , '@', new Date());
      window.$experts.each(function (i) {
        let $expert = $(this);
        if ($expert.attr('data-loginId') == 10002) {
          $expert.find('.operations').hide();
          $expert.attr('data-callFrom', callFrom)
            .find('.call-from').text(callFrom).parent().fadeIn();
        }
      });
      //Call setup acknowledgement sent back to callFrom
      exchangeReference.child(callFrom).child('from').set('10002').then(function () {
        exchangeReference.child(callFrom).child('sdp').set("Dummy SDP of Expert 10002");
      });
    }
  });
  exchangeReference.child('10002').child('sdp').on('value', function (snapshot) {
    let remoteSDP = snapshot.val();
    if (remoteSDP) {
      console.log("INFO: remoteSDP received @", new Date(), remoteSDP);
    }
  });
  exchangeReference.child('10002').child('msg').on('value', function (snapshot) {
    let remoteMsg = snapshot.val();
    if (remoteMsg) {
      console.log("INFO: remoteMsg:" + remoteMsg + " received @", new Date());
      if (remoteMsg == 'endcall') {
        window.$experts.each(function (i) {
          let $expert = $(this);
          if ($expert.attr('data-loginId') == 10002) {
            exchangeReference.child(10002).remove().then(function () {
              expertsReference.child(10002).transaction(function(currentExpertStats) {
                console.log("Transaction Called Expert stats END: ", currentExpertStats);
                if (currentExpertStats) {
                  if (currentExpertStats.status == 'busy') {
                    currentExpertStats.status = "online";
                    return currentExpertStats;
                  }
                  console.log("INFO: Expert " + 10002 + " is " + currentExpertStats.status + ".");
                  return;
                }
                return currentExpertStats;
              }, function (err, committed, snapshot) {
                if (err) {
                  console.error(err);
                } else {
                  let updatedExpertsStats = snapshot ? snapshot.val() : null;
                  console.log("Transaction complete : " , err, committed, updatedExpertsStats);
                  if (updatedExpertsStats) {
                    if (committed == true ) {
                      console.log("Ended call successfully");
                        $expert.attr('data-callFrom','')
                          .find('.call-from').text('NA').parent().hide();
                    } else if (committed == false) {
                      console.log("WARN: Call end failed.");
                    }
                  } else {
                    console.log("Expert " + 10002 + " does not exist.");
                  }
                }
              });//expertsReference.child(expertId).transacrion
            });
          }
        });
      }
    }
  });

  //listen to notifications from the Telephone-Exchange
  exchangeReference.child('20001').child('from').on('value', function (snapshot) {
    let ackFrom = snapshot.val();
    if (ackFrom) {
      console.log("Setup acknowledgement received from ", ackFrom);
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
          let $engineer = $(this);
          if ($engineer.attr('data-loginId') == 20001) {
            exchangeReference.child(20001).remove().then(function () {
              engineersReference.child(20001)
              .child("status").set("online")
              .then(function () {
                $engineer.attr('data-callTo','')
                  .find('.call-to').text('NA').parent().hide();
              });
            });
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
            exchangeReference.child(20002).remove().then(function () {
              engineersReference.child(20002)
              .child("status").set("online")
              .then(function () {
                $engineer.attr('data-callTo','')
                  .find('.call-to').text('NA').parent().hide();
              });
            });
          }
        });
      }
    }
  });
}

let addExpertsListeners = function (expertsReference, userId) {
  expertsReference.child(userId).off('value');
  expertsReference.child(userId).child('status').on('value', function (snapshot) {
    let status = snapshot.val();
    if (status) {
      $experts.each(function (i) {
        let $expert = $(this);
        if ($expert.attr('data-loginId') == userId) {
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
};// end addExpertsListeners()

let setupExperts = function (expertsReference, engineersReference, exchangeReference) {
  let expertContainer = document.querySelector('.experts-container');
  let $experts = window.$experts = $('.expert');//used later
  $experts.each(function (i) {
    let $expert = $(this);
    let loginId = $expert.attr('data-loginId');
    if (loginId) {
      addExpertsListeners(expertsReference, loginId);
    } else {
      console.log("ERROR: Experts LoginId not found.");
    }
  });
  expertContainer.addEventListener('click', function (evt) {
    if (evt.target.tagName.toUpperCase() == 'BUTTON') {
      let $expert = $(evt.target).parents('.expert');
      let loginId = $expert.attr('data-loginId');
      if (evt.target.className.includes('btn-login')) {
        if (loginId) {
          expertsReference.child(loginId).transaction(function(currentExpertStats) {
            console.log("Login Transaction stats: ", currentExpertStats);
            if (currentExpertStats) {
              if (currentExpertStats.status == 'offline') {
                currentExpertStats.status = "online";
                return currentExpertStats;
              }
              console.log("Login INFO: Expert " + loginId + " is " + currentExpertStats.status + ".");
              return;
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
    let loginId = $expert.attr('data-loginId');
    let callFrom = $expert.attr('data-callFrom');
    exchangeReference.child(loginId).remove().then(function () {
      exchangeReference.child(callFrom).child('msg').set("endcall");
      expertsReference.child(loginId).transaction(function(currentExpertStats) {
        console.log("INFO: Transaction End Call stats: ", currentExpertStats);
        if (currentExpertStats) {
          if (currentExpertStats.status == 'busy') {
            currentExpertStats.status = "online";
            return currentExpertStats;
          }
          console.log("WARN: Transaction End Call Expert " + loginId + " is " + currentExpertStats.status + ".");
          return;
        }
        return currentExpertStats;
      }, function (err, committed, snapshot) {
        if (err) {
          console.error(err);
        } else {
          let updatedExpertsStats = snapshot ? snapshot.val() : null;
          console.log("INFO: Transaction End Call complete : " , err, committed, updatedExpertsStats);
          if (updatedExpertsStats) {
            if (committed == true ) {
              console.log("SUCCESS: Transaction End Call successful.");
                $expert.attr('data-callFrom','')
                  .find('.call-from').text('NA').parent().hide();
            } else if (committed == false) {
              console.log("WARN: Transaction End Call failed.");
            }
          } else {
            console.log("ERROR: Transaction End Call Expert " + loginId + " does not exist.");
          }
        }
      });//expertsReference.child(expertId).transaction
    });
  });
}// end setupExperts()
