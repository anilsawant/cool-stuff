angular.module('gsmcApp')
.controller('UsersController', function ($rootScope, $scope, $http, util, $timeout) {
  $rootScope.pageTitle = 'Users | GSMC';

  $scope.init = function () {
    $scope.gsmcPrograms = [{'programName':'Select Program Name'}];
    $scope.gsmcTeams = [{'teamName':'Select Team Name'}];
    $scope.gsmcPartners = [{'partnerName':'Select Partner Name'}];
    $scope.selectedExpertProgram = $scope.gsmcPrograms[0];
    $scope.selectedExpertTeam = $scope.gsmcTeams[0];
    $scope.selectedEngineerPartner = $scope.gsmcPartners[0];
    $scope.loadDevData(); //look for "NOTE:" lines and use them in dev env
    // $scope.loadSetupData();
  }

  $scope.isExpertRowSelected = false;
  $scope.isEngineerRowSelected = false;
  $scope.selectAllRows = function (evt) {
    let $parentTabPane = $(evt.target).parents('.tab-pane'),
        userRole = $parentTabPane.attr('id').toLowerCase(),
        $parentTable = $parentTabPane.find('table'),
        $allCheckboxes = $parentTable.find('tbody .checkbox');
    if (evt.target.className.includes('unchecked')) {
      evt.target.className = 'checkbox glyphicon glyphicon-check';
      for (var i = 0; i < $allCheckboxes.length; i++) {
        $allCheckboxes[i].className = 'checkbox glyphicon glyphicon-check';
      }
      if (userRole == 'expert') {
        $scope.isExpertRowSelected = true;
      } else if (userRole == 'engineer') {
        $scope.isEngineerRowSelected = true;
      }
    } else {
      evt.target.className = 'checkbox glyphicon glyphicon-unchecked';
      for (var i = 0; i < $allCheckboxes.length; i++) {
        $allCheckboxes[i].className = 'checkbox glyphicon glyphicon-unchecked';
      }
      if (userRole == 'expert') {
        $scope.isExpertRowSelected = false;
      } else if (userRole == 'engineer') {
        $scope.isEngineerRowSelected = false;
      }
    }
  }
  $scope.tableBodyClick = function (evt) {
    if (evt.target.className.includes('checkbox')) {
      let $parentTabPane = $(evt.target).parents('.tab-pane'),
          userRole = $parentTabPane.attr('id').toLowerCase(),
          $parentTable = $parentTabPane.find('table'),
          $allCheckboxes = $parentTable.find('tbody .checkbox');
      if (evt.target.className.includes('unchecked')) {
        evt.target.className = 'checkbox glyphicon glyphicon-check';
      } else {
        evt.target.className = 'checkbox glyphicon glyphicon-unchecked';
      }
      let noOfCheckedRows = 0;
      for (var i = 0; i < $allCheckboxes.length; i++) {
        if ($allCheckboxes[i].className.includes('-check')) {
          noOfCheckedRows++;
        }
      }
      if(noOfCheckedRows){
        if (userRole == 'expert') {
          $scope.isExpertRowSelected = true;
        } else if (userRole == 'engineer') {
          $scope.isEngineerRowSelected = true;
        }
        let selectAllCheckbox = $parentTable.find('thead .checkbox')[0];
        selectAllCheckbox.className = "checkbox glyphicon glyphicon-unchecked";
        if (noOfCheckedRows == $allCheckboxes.length)
          selectAllCheckbox.className = "checkbox glyphicon glyphicon-check";
      } else {
        if (userRole == 'expert') {
          $scope.isExpertRowSelected = false;
        } else if (userRole == 'engineer') {
          $scope.isEngineerRowSelected = false;
        }
      }
    }
  };
  $scope.setExpertsOrderBy = function (evt) {
    let $target = $(evt.target),
        $parentTh = $target;
    if (evt.target.className.includes('caret'))
      $parentTh = $(evt.target).parents('th');
    let orderBy = $parentTh.attr('data-orderby');
    $scope.orderExpertsBy = orderBy;

    $parentTh.parent().find('.caret').removeClass('up');
    $parentTh.find('.caret')[0].className = 'caret up';
  }
  $scope.setEngineersOrderBy = function (evt) {
    let $target = $(evt.target),
        $parentTh = $target;
    if (evt.target.className.includes('caret'))
      $parentTh = $(evt.target).parents('th');
    let orderBy = $parentTh.attr('data-orderby');
    $scope.orderEngineersBy = orderBy;

    $parentTh.parent().find('.caret').removeClass('up');
    $parentTh.find('.caret')[0].className = 'caret up';
  }
  $scope.showAddUserCard = function (evt) {
    let $parentTabPane = $(evt.target).parents('.tab-pane'),
        $addResourceCardOverlay = $parentTabPane.find('.add.sub-overlay');
    $addResourceCardOverlay.fadeIn(function () {
      $addResourceCardOverlay.find('.resource-card').addClass('open');
    });
  }
  $scope.closeAddUserCard = function (evt) {
    if (evt.target.className.includes('close') || evt.target.className.includes('overlay-dismiss')) {
      let $parentTabPane = $(evt.target).parents('.tab-pane'),
          $addResourceCardOverlay = $parentTabPane.find('.add.sub-overlay');
      $addResourceCardOverlay.find('.resource-card').removeClass('open');
      $addResourceCardOverlay.fadeOut('slow');
    }
  }
  $scope.loadSetupData = function () {
    $http({
      "url": "/GSMCServices/service/masterData/fetchAllProgramDetail",
      "method": "POST",
    }).then(function (resp) {
      if (resp.data && resp.data.length) {
        resp.data.unshift({'programName':'Select Program Name'});
        $scope.gsmcPrograms = resp.data;
        $scope.selectedExpertProgram = $scope.gsmcPrograms[0];
      }
    }).catch(function (err) {
      console.log("ERROR: ", err);
    });
    $http({
      "url": "/GSMCServices/service/masterData/fetchAllPartnerDetail",
      "method": "POST",
    }).then(function (resp) {
      if (resp.data && resp.data.length) {
        resp.data.unshift({'partnerName':'Select Partner Name'});
        $scope.gsmcPartners = resp.data;
        $scope.selectedEngineerPartner = $scope.gsmcPartners[0];
      }
    }).catch(function (err) {
      console.log("ERROR: ", err);
    });
  }
  $scope.loadDevData = function () {
    $http({
      "url": "dev-data.json",
      "method": "GET",
    }).then(function (resp) {
        if (resp.data) {
          $scope.devData = resp.data;
          $scope.devData.programs.unshift({'programName':'Select Program Name'});
          $scope.devData.partners.unshift({'partnerName':'Select Partner Name'});
          $scope.gsmcPrograms = $scope.devData.programs;
          $scope.gsmcPartners = $scope.devData.partners;
          $scope.selectedExpertProgram = $scope.gsmcPrograms[0];
          $scope.selectedEngineerPartner = $scope.gsmcPartners[0];
        }
    }).catch(function (err) {
      console.log("ERROR: ", err);
    });
  }
  $scope.loadExpertsList = function () {
    let $parentTabPane = $('#expert'),
        $searchResultRow = $parentTabPane.find('.row.search-result'),
        $alertMsgRow = $parentTabPane.find('.row.alert-msg');
    $alertMsgRow.slideUp();
    util.displayLoading($parentTabPane[0]);
    $http({
      "url": "/GSMCServices/service/loginDetails/listOfExpert",
      "method": "POST",
      "timeout": 30000
    }).then(function (resp) {
      util.doneLoading($parentTabPane[0]);
      if (resp.data && resp.data.length) {
        let experts = [];
        for (var i = 0; i < resp.data.length; i++) {
          experts.push(resp.data[i].expertDetail);
        }
        $scope.experts = experts;
        $searchResultRow.slideDown();
      }
    }).catch(function (resp) {
      util.doneLoading($parentTabPane[0]);
      console.log("ERROR: ", resp);
    });

    //NOTE: Use the following mock AJAX in dev env
    $timeout(function () {
      let experts = [];
      for (var i = 0; i < $scope.devData.experts.length; i++) {
        experts.push($scope.devData.experts[i].expertDetail);
      }
      $scope.experts = experts;
      $searchResultRow.slideDown();
    }, 1000);
  };
  $scope.loadEngineersList = function () {
    let $parentTabPane = $('#engineer'),
        $searchResultRow = $parentTabPane.find('.row.search-result'),
        $alertMsgRow = $parentTabPane.find('.row.alert-msg');
    $alertMsgRow.slideUp();
    util.displayLoading($parentTabPane[0]);
    $http({
      "url": "/GSMCServices/service/loginDetails/listOfEngineer",
      "method": "POST"
    }).then(function (resp) {
      util.doneLoading($parentTabPane[0]);
      if (resp.data && resp.data.length) {
        let engineers = [];
        for (var i = 0; i < resp.data.length; i++) {
          engineers.push(resp.data[i].engineerDetail);
        }
        $scope.engineers = engineers;
        $searchResultRow.slideDown();
      }
    }).catch(function (resp) {
      util.doneLoading($parentTabPane[0]);
      console.log("ERROR: ", resp);
    });

    //NOTE: Use the following mock AJAX in dev env
    $timeout(function () {
      let engineers = [];
      for (var i = 0; i < $scope.devData.engineers.length; i++) {
        engineers.push($scope.devData.engineers[i].engineerDetail);
      }
      $scope.engineers = engineers;
      $searchResultRow.slideDown();
    }, 1000);
  };
  $scope.getTeamsInProgram = function (programId) {
    if (programId) {
      $http({
        "url": "/GSMCServices/service/masterData/fetchTeamDetailsByProgramId",
        "method": "POST",
        "data": {
          "programId": programId
        }
      }).then(function (resp) {
        if (resp.data) {
          resp.data.unshift({"teamName": "Select Team Name"});
          $scope.gsmcTeams = resp.data;
          $scope.selectedExpertTeam = $scope.gsmcTeams[0];
        }
      }).catch(function (err) {
        console.log(err);
      });

      // NOTE: used along with loadDevData();
      let teams = $scope.devData.teams[(programId-1)];
      teams.unshift({"teamName": "Select Team Name"})
      $scope.gsmcTeams = teams;
      $scope.selectedExpertTeam = $scope.gsmcTeams[0];
    } else {
      $scope.gsmcTeams = [{"teamName": "Select Team Name"}];
      $scope.selectedExpertTeam = $scope.gsmcTeams[0];
    }
  }
  $scope.searchUsers = function (q) {
    let query = q ? q.trim() : null;
    if (query) {
      let loginIds = query.split(/,+/g);
      if (loginIds.length) {
        let filteredLoginIds = loginIds.filter(function (a) {
          if (a)
            return true;
          return false;
        });
        console.log('filteredLoginIds', filteredLoginIds);
      }
    } else {
      alert('Error: No search query.');
    }
  }
  $scope.createNewEngineer = function (evt) {
    let errMsgs = [],
        finalErrMsg = "";
    if (!$scope.engLoginId)
      errMsgs.push("Login id");
    if (!$scope.engName)
      errMsgs.push("User name");
    if (!$scope.engLocation)
      errMsgs.push("Location");
    if (!$scope.selectedEngineerPartner.partnerId)
      errMsgs.push("Partner name");
    for (var i = 0; i < errMsgs.length; i++) {
      if (i == 0)
        finalErrMsg = "Kindly enter/select "
      finalErrMsg += errMsgs[i];
      i == errMsgs.length-1 ? finalErrMsg += "." : finalErrMsg += ", " ;
    }
    if (finalErrMsg) {
      alert(finalErrMsg);
    } else {
      let registerData = {
        "loginId": $scope.engLoginId.trim(),
        "active": 1 ,
        "role": "ENGINEER",
        "engineerDetail": {
          "loginId": $scope.engLoginId.trim(),
          "engineerName": $scope.engName.trim(),
          "location": $scope.engLocation.trim(),
          "partnerName": $scope.selectedEngineerPartner.partnerName
        }
      }
      console.log("AJAX: Register User ", registerData);
      evt.target.style.pointerEvents = 'none';
      $http({
        "method": "POST",
        "url": "/GSMCServices/service/loginDetails/createNewUser",
        "data": registerData,
      }).then(function( resp ) {
        evt.target.style.pointerEvents = 'all';
        if (resp.data && resp.data.result == 'SUCCESS') {
          alert("User registered successfully.");
          $scope.engLoginId = '';
          $scope.engName = '';
          $scope.engLocation = '';
          $scope.selectedEngineerPartner = $scope.gsmcPartners[0];
        } else {
          alert("ERROR : " + resp.data.responseMessage);
        }
      }).catch(function (err) {
        console.error('Login request failed.', err);
        evt.target.style.pointerEvents = 'all';
        alert("We are currently unable to add an Engineer. Kindly try after some time.");
      });
    }
  }
  $scope.createNewExpert = function (evt) {
    let errMsgs = [],
        finalErrMsg = "";
    if (!$scope.expLoginId)
      errMsgs.push("Login id");
    if (!$scope.expName)
      errMsgs.push("User name");
    if (!$scope.expLocation)
      errMsgs.push("Location");
    if (!$scope.selectedExpertProgram.programId)
      errMsgs.push("Program name");
    if (!$scope.selectedExpertTeam.teamId)
      errMsgs.push("Team name");
    if (!$scope.expSkills)
      errMsgs.push("Skills");
    for (var i = 0; i < errMsgs.length; i++) {
      if (i == 0)
        finalErrMsg = "Kindly enter/select "
      finalErrMsg += errMsgs[i];
      i == errMsgs.length-1 ? finalErrMsg += "." : finalErrMsg += ", " ;
    }
    if (finalErrMsg) {
      alert(finalErrMsg);
    } else {
      let skills = $scope.expSkills.trim().split(/ *, *|,* ,*/gi);
      let registerData = {
        "loginId": $scope.expLoginId.trim(),
        "active": 1 ,
        "role": "EXPERT",
        "expertDetail": {
          "loginId": $scope.expLoginId.trim(),
          "expertName": $scope.expName.trim(),
          "location": $scope.expLocation.trim(),
          "skillNames": skills,
          "programId": $scope.selectedExpertProgram.programId,
          "programName": $scope.selectedExpertProgram.programName,
          "teamId": $scope.selectedExpertTeam.teamId,
          "teamName": $scope.selectedExpertTeam.teamName,
        }
      }
      console.log("AJAX: Register User ", registerData);
      evt.target.style.pointerEvents = 'none';
      $http({
        "method": "POST",
        "url": "/GSMCServices/service/loginDetails/createNewUser",
        "data": registerData,
      }).then(function( resp ) {
        evt.target.style.pointerEvents = 'all';
        if (resp.data && resp.data.result == 'SUCCESS') {
          alert("User registered successfully.");
          $scope.expLoginId = '';
          $scope.expName = '';
          $scope.expLocation = '';
          $scope.selectedExpertProgram = $scope.gsmcPrograms[0];
          $scope.selectedExpertTeam = $scope.gsmcTeams[0];
          $scope.expSkills = '';
        } else {
          alert("ERROR : " + resp.data.responseMessage);
        }
      }).catch(function (err) {
        console.error('Login request failed.', err);
        evt.target.style.pointerEvents = 'all';
        alert("We are currently unable to add an Expert. Kindly try after some time.");
      });
    }
  };
  $scope.deleteUsers = function (evt) {
    let loginIds = $scope.getSelectedLoginIds(evt.target),
        $parentTabPane = $(evt.target).parents('.tab-pane'),
        userRole = $parentTabPane.attr('id').toUpperCase(),
        confirmStr = "Delete the selected " + userRole + "s?";
    console.log('Login Ids', loginIds);
    if (loginIds && loginIds.length && confirm(confirmStr)) {
      evt.target.setAttribute('disabled', true);
      $http({
        "url": "/GSMCServices/service/loginDetails/deleteUserDetail",
        "method": "POST",
        "data": {
          "loginIds": loginIds,
          "role": userRole
        }
      }).then(function (resp) {
        evt.target.removeAttribute('disabled');
        if (resp.data && resp.data.result == "SUCCESS") {
          if (userRole == 'EXPERT') {
            $scope.loadExpertsList();
          } else if (userRole == 'ENGINEER') {
            $scope.loadEngineersList();
          }
          alert(resp.responseMessage);
        } else {
          alert("ERROR: Failed to delete");
          console.log('ERROR: AJAX Delete User failed.');
        }
      }).catch(function (err) {
        evt.target.removeAttribute('disabled');
        console.log("ERROR: ", err);
      });
    }
  }
  $scope.resetUsers = function (evt) {
    let loginIds = $scope.getSelectedLoginIds(evt.target),
        $parentTabPane = $(evt.target).parents('.tab-pane'),
        userRole = $parentTabPane.attr('id').toLowerCase(),
        confirmStr = "Reset passwords of the selected " + userRole + "s?";
    console.log('Login Ids', loginIds);
    if (loginIds && loginIds.length && confirm(confirmStr)) {
      evt.target.setAttribute('disabled', true);
      $http({
        "url": "/GSMCServices/service/loginDetails/resetUserPassword",
        "method": "POST",
        "data": {
          "loginIds": loginIds,
          "role": userRole.toUpperCase()
        }
      }).then(function (resp) {
        evt.target.removeAttribute('disabled');
        if (resp.data && resp.data.result == "SUCCESS") {
          if (userRole == 'expert') {
            $scope.loadExpertsList();
          } else if (userRole == 'engineer') {
            $scope.loadEngineersList();
          }
          alert(resp.responseMessage);
        } else {
          alert("ERROR: Failed to reset password");
          console.log('ERROR: AJAX Reset User password failed.');
        }
      }).catch(function (err) {
        evt.target.removeAttribute('disabled');
        console.log("ERROR: ", err);
      });
    }
  };
  $scope.exportUsersList = function (evt) {
    let $parentTabPane = $(evt.target).parents('.tab-pane'),
        userRole = $parentTabPane.attr('id').toLowerCase(),
        today = new Date(),
        td = today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear(),
        exportData = '';
    if (userRole == 'expert') {
      exportData = "Login Id,Name,Location,Program,Team,Skills\n";
      for (var i = 0; i < $scope.experts.length; i++) {
        exportData += $scope.experts[i].loginId + ","
                      + $scope.experts[i].expertName + ","
                      + $scope.experts[i].location + ","
                      + $scope.experts[i].programName + ","
                      + $scope.experts[i].teamName + ","
                      + $scope.experts[i].skillNames.join('-');
        if (i != ($scope.experts.length-1)) {
          exportData += '\n';
        }
      }
    } else if (userRole == 'engineer') {
      exportData = "Login Id,Name,Location,Partner\n";
      for (var i = 0; i < $scope.engineers.length; i++) {
        exportData += $scope.engineers[i].loginId + ","
                      + $scope.engineers[i].engineerName + ","
                      + $scope.engineers[i].location + ","
                      + $scope.engineers[i].partnerName;
        if (i != ($scope.engineers.length-1)) {
          exportData += '\n';
        }
      }
    }
    $scope.downloadData(exportData, "gsmc-fa-" + userRole + "s (" + td + ").csv");
  }
  $scope.downloadData = function(data, fileName) {
    var textFileAsBlob = new Blob([data], {type:'text/csv'});
    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.innerHTML = "The Save Link";
    window.URL = window.URL || window.webkitURL;
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = function(event) {
      document.body.removeChild(event.target);
    };
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }
  $scope.getSelectedLoginIds = function (evtTarget) {
    if (evtTarget) {
      let $parentTabPane = $(evtTarget).parents('.tab-pane'),
          $reslutsTableBody = $parentTabPane.find('tbody');
      let $allCheckboxes = $reslutsTableBody.find('.checkbox'),
         loginIds = [];
      for (var i = 0; i < $allCheckboxes.length; i++) {
       if ($allCheckboxes[i].className.includes('-check')) {
         let $parentTr = $($allCheckboxes[i]).parents('tr');
         if ($parentTr[0]) {
           let loginId = $parentTr.attr('data-loginid');
           if (loginId) {
             loginIds.push(loginId);
           } else {
             console.log('Failed to retrieve Login Id for ' + loginId);
           }
         }
       }
      }
      return loginIds;
    }
  }
  $scope.init();
});
