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
            console.log("INFO: Call Transaction stats: ", currentExpertStats);
            if (currentExpertStats) {
              if (currentExpertStats.status == 'online') {
                currentExpertStats.status = "busy";
                return currentExpertStats;
              }
              showNotification("Expert " + expertId + " is " + currentExpertStats.status + ".");
              console.log("WARN: Call Transaction Expert " + expertId + " is " + currentExpertStats.status + ".");
              return;
            }
            return currentExpertStats;
          }, function (err, committed, snapshot) {
            if (err) {
              console.error(err);
              showNotification("Call to " + expertId + " failed. Try later.");
            } else {
              let updatedExpertsStats = snapshot ? snapshot.val() : null;
              console.log("INFO: Call Transaction complete : " , err, committed, updatedExpertsStats);
              if (updatedExpertsStats) {
                if (committed == true ) {
                  engineersReference.child(engineerId).child('status').set('busy')
                  .then(function () {
                    $engineer.find('.operations').fadeOut();
                    exchangeReference.child(expertId).child('from').set(engineerId);//Call setup request sent to expert:10001
                    console.log("INFO: Call setup request sent to ", expertId, " @", new Date());
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
    let loginId = $engineer.attr('data-loginId');
    let callTo = $engineer.attr('data-callTo');
    exchangeReference.child(callTo).child('msg').set("endcall");
    exchangeReference.child(loginId).remove().then(function () {
      $engineer.attr('data-callTo','')
        .find('.call-to').text('NA').parent().hide();
      engineersReference.child(loginId).child('status').set('online');
    });
  });
};// end addEngineersListeners()
