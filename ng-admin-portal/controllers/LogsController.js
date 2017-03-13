angular.module('gsmcApp')
.controller('LogsController', function ($rootScope, $scope, $http, $timeout, util) {
  $rootScope.pageTitle = 'Logs | GSMC';

  let logsContainer = document.querySelector('.logs-container'),
      $msgRow = angular.element('.msg-row'),
      $resultRow = angular.element('.result-row'),
      lblLoginCount = logsContainer.querySelector('.login-count'),
      lblAppDownloadCount = logsContainer.querySelector('.app-download-count'),
      lblFilesDownloadCount = logsContainer.querySelector('.files-download-count'),
      lblVCallsCount = logsContainer.querySelector('.video-calls-count'),
      lblACallsCount = logsContainer.querySelector('.annotation-calls-count'),
      lblMsgsCount = logsContainer.querySelector('.messages-count');

  $scope.hideMsg = function () {
    $msgRow.slideUp();
  }
  $scope.showMsg = function (msg) {
    if (msg) {
      $msgRow.find('.msg').html(msg)
      $msgRow.slideDown();
    }
  }
  $scope.showResultRow = function () {
    $resultRow.slideDown();
  }
  $scope.hideResultRow = function () {
    $resultRow.slideUp();
  }
  $scope.loadAppLogStats = function () {
    let errMsgs = [],
        finalErrMsg = "";
    if (!$scope.startDate)
      errMsgs.push("<b>start date</b>");
    if (!$scope.endDate)
      errMsgs.push("<b>end date</b>");
    for (var i = 0; i < errMsgs.length; i++) {
      if (i == 0)
        finalErrMsg = "Kindly enter/select "
      finalErrMsg += errMsgs[i];
      i == errMsgs.length-1 ? finalErrMsg += "." : finalErrMsg += ", " ;
    }
    if (finalErrMsg) {
      $scope.showMsg(finalErrMsg);
    } else {
      if ($scope.startDate > $scope.endDate) {
        $scope.showMsg("<strong>Invalid period: </strong>Start date cannot be greater than end date.");
      } else {
        let sd = $scope.startDate.getFullYear() + '-' + ($scope.startDate.getMonth()+1) + '-' + $scope.startDate.getDate(),
            ed = $scope.endDate.getFullYear() + '-' + ($scope.endDate.getMonth()+1) + '-' + $scope.endDate.getDate();
        $scope.hideMsg();
        util.displayLoading(logsContainer);
        $timeout(function () { // forced delay to show loading overlay
          $scope.getLogs(sd, ed, "Login In", function (err, logs) {
            util.doneLoading(logsContainer);
            $scope.showResultRow();
            if (err) {
              console.log("ERROR: Failed to retrieve logs.", err);
              lblLoginCount.style.color = 'red';
              lblLoginCount.textContent = err;
              return;
            }
            lblLoginCount.style.color = 'white';
            lblLoginCount.textContent = logs.length;
          });
          $scope.getLogs(sd, ed, "App Download", function (err, logs) {
            util.doneLoading(logsContainer);
            $scope.showResultRow();
            if (err) {
              console.log("ERROR: Failed to retrieve logs.", err);
              lblAppDownloadCount.style.color = 'red';
              lblAppDownloadCount.textContent = err;
              return;
            }
            lblAppDownloadCount.style.color = 'white';
            lblAppDownloadCount.textContent = logs.length;
          });
          $scope.getLogs(sd, ed, "File Download", function (err, logs) {
            util.doneLoading(logsContainer);
            $scope.showResultRow();
            if (err) {
              console.log("ERROR: Failed to retrieve logs.", err);
              lblFilesDownloadCount.style.color = 'red';
              lblFilesDownloadCount.textContent = err;
              return;
            }
            lblFilesDownloadCount.style.color = 'white';
            lblFilesDownloadCount.textContent = logs.length;
          });
          $scope.getLogs(sd, ed, "Video", function (err, logs) {
            util.doneLoading(logsContainer);
            $scope.showResultRow();
            if (err) {
              console.log("ERROR: Failed to retrieve logs.", err);
              lblVCallsCount.style.color = 'red';
              lblVCallsCount.textContent = err;
              return;
            }
            lblVCallsCount.style.color = 'white';
            lblVCallsCount.textContent = logs.length;
          });
          $scope.getLogs(sd, ed, "Annotation", function (err, logs) {
            util.doneLoading(logsContainer);
            $scope.showResultRow();
            if (err) {
              console.log("ERROR: Failed to retrieve logs.", err);
              lblACallsCount.style.color = 'red';
              lblACallsCount.textContent = err;
              return;
            }
            lblACallsCount.style.color = 'white';
            lblACallsCount.textContent = logs.length;
          });
          $scope.getLogs(sd, ed, "Message", function (err, logs) {
            util.doneLoading(logsContainer);
            $scope.showResultRow();
            if (err) {
              console.log("ERROR: Failed to retrieve logs.", err);
              lblMsgsCount.style.color = 'red';
              lblMsgsCount.textContent = err;
              return;
            }
            lblMsgsCount.style.color = 'white';
            lblMsgsCount.textContent = logs.length;
          });
        }, 1000);
      }
    }
  };
  $scope.exportStats = function () {
    let exportData = "Activity,Count\n",
        sd = $scope.startDate.getDate() + '-' + ($scope.startDate.getMonth()+1) + '-' + $scope.startDate.getFullYear(),
        ed = $scope.endDate.getDate() + '-' + ($scope.endDate.getMonth()+1) + '-' + $scope.endDate.getFullYear();
    exportData += "Login," + lblLoginCount.textContent + "\n";
    exportData += "App Download," + lblAppDownloadCount.textContent + "\n";
    exportData += "Files Download," + lblFilesDownloadCount.textContent + "\n";
    exportData += "Video Call," + lblVCallsCount.textContent + "\n";
    exportData += "Annotation Call," + lblACallsCount.textContent + "\n";
    exportData += "Message," + lblMsgsCount.textContent + "\n";
    $scope.downloadData(exportData, "fa-usage-logs(" + sd + " to " + ed + ").csv");
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
  $scope.getLogs = function (sd, ed, which, done) {
    $http({
      "url": "/GSMCServices/service/loginDetails/fetchUserActivityDetails",
      "method": "POST",
      "data": {
        "fromDate": sd,
        "toDate": ed ,
        "activityType": which
      }
    }).then(function (resp) {
      if (resp.data && resp.data.result.toUpperCase() == "SUCCESS") {
        if (done && typeof done == 'function') {
          done(null, resp.data.userActivityDetails);
        }
      } else {
        console.log("ERROR: Failed to retrieve " + which + " logs", resp);
        done('Failed');
      }
    }).catch(function (err) {
      console.log("ERROR: ", err);
      done('Failed');
    });
  };

  $scope.hideMsg();
  $scope.hideResultRow();
});
