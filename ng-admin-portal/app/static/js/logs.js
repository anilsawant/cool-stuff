window.onload = function () {
  document.body.style.display = 'block';
  setupLogsRetrieval();
}
let setupLogsRetrieval = function () {
  let logsContainer = document.querySelector('.logs-container'),
      logsRow = logsContainer.querySelector('.logs.row'),
      txtStartDate = logsContainer.querySelector('.txt-start-date'),
      txtEndDate = logsContainer.querySelector('.txt-end-date'),
      startDate = '',
      endDate = '',
      btnViewLogs = logsContainer.querySelector('.btn-view-logs'),
      btnExportLogs = logsContainer.querySelector('.btn-export-logs'),
      lblLoginCount = logsContainer.querySelector('.login-count'),
      lblAppDownloadCount = logsContainer.querySelector('.app-download-count'),
      lblFilesDownloadCount = logsContainer.querySelector('.files-download-count'),
      lblVCallsCount = logsContainer.querySelector('.video-calls-count'),
      lblACallsCount = logsContainer.querySelector('.annotation-calls-count'),
      lblMsgsCount = logsContainer.querySelector('.messages-count');

  btnViewLogs.addEventListener('click', function () {
    startDate = txtStartDate.value.trim();
    endDate = txtEndDate.value.trim();
    if (startDate && endDate) {
      let dateRegex = /^\d\d\d\d-\d\d-\d\d$/;
      if (dateRegex.test(startDate) && dateRegex.test(endDate)) {
        displayLoading(document.body);
        getLogs(startDate, endDate, "Login In", function (err, logs) {
          doneLoading(document.body);
          logsRow.style.display = 'block';
          if (err) {
            console.log("ERROR: Failed to retrieve logs.", err);
            lblLoginCount.style.color = 'red';
            lblLoginCount.textContent = err;
            return;
          }
          btnExportLogs.className = btnExportLogs.className.replace(/ *disabled */g, '');
          lblLoginCount.style.color = 'black';
          lblLoginCount.textContent = logs.length;
        });
        getLogs(startDate, endDate, "App Download", function (err, logs) {
          doneLoading(document.body);
          logsRow.style.display = 'block';
          if (err) {
            console.log("ERROR: Failed to retrieve logs.", err);
            lblAppDownloadCount.style.color = 'red';
            lblAppDownloadCount.textContent = err;
            return;
          }
          btnExportLogs.className = btnExportLogs.className.replace(/ *disabled */g, '');
          lblAppDownloadCount.style.color = 'black';
          lblAppDownloadCount.textContent = logs.length;
        });
        getLogs(startDate, endDate, "File Download", function (err, logs) {
          doneLoading(document.body);
          logsRow.style.display = 'block';
          if (err) {
            console.log("ERROR: Failed to retrieve logs.", err);
            lblFilesDownloadCount.style.color = 'red';
            lblFilesDownloadCount.textContent = err;
            return;
          }
          btnExportLogs.className = btnExportLogs.className.replace(/ *disabled */g, '');
          lblFilesDownloadCount.style.color = 'black';
          lblFilesDownloadCount.textContent = logs.length;
        });
        getLogs(startDate, endDate, "Video", function (err, logs) {
          doneLoading(document.body);
          logsRow.style.display = 'block';
          if (err) {
            console.log("ERROR: Failed to retrieve logs.", err);
            lblVCallsCount.style.color = 'red';
            lblVCallsCount.textContent = err;
            return;
          }
          btnExportLogs.className = btnExportLogs.className.replace(/ *disabled */g, '');
          lblVCallsCount.style.color = 'black';
          lblVCallsCount.textContent = logs.length;
        });
        getLogs(startDate, endDate, "Annotation", function (err, logs) {
          doneLoading(document.body);
          logsRow.style.display = 'block';
          if (err) {
            console.log("ERROR: Failed to retrieve logs.", err);
            lblACallsCount.style.color = 'red';
            lblACallsCount.textContent = err;
            return;
          }
          btnExportLogs.className = btnExportLogs.className.replace(/ *disabled */g, '');
          lblACallsCount.style.color = 'black';
          lblACallsCount.textContent = logs.length;
        });
        getLogs(startDate, endDate, "Message", function (err, logs) {
          doneLoading(document.body);
          logsRow.style.display = 'block';
          if (err) {
            console.log("ERROR: Failed to retrieve logs.", err);
            lblMsgsCount.style.color = 'red';
            lblMsgsCount.textContent = err;
            return;
          }
          btnExportLogs.className = btnExportLogs.className.replace(/ *disabled */g, '');
          lblMsgsCount.style.color = 'black';
          lblMsgsCount.textContent = logs.length;
        });
      } else {
        alert("Enter start date and end date in correct format.");
      }
    } else {
      alert("Enter start date and end date to retrieve logs.");
    }
  });
  btnExportLogs.addEventListener('click', function () {
    let exportData = "Activity,Count\n";
    exportData += "Login," + lblLoginCount.textContent + "\n";
    exportData += "App Download," + lblAppDownloadCount.textContent + "\n";
    exportData += "Files Download," + lblFilesDownloadCount.textContent + "\n";
    exportData += "Video Call," + lblVCallsCount.textContent + "\n";
    exportData += "Annotation Call," + lblACallsCount.textContent + "\n";
    exportData += "Message," + lblMsgsCount.textContent + "\n";
    downloadData(exportData, "fa-usage-logs(" + startDate + " to " + endDate + ").csv");
  });
}

/**
 * Function to download data
 * @param event
 */
let downloadData = function(data, fileName) {
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

let getLogs = function (sd, ed, which, done) {
  $.ajax({
    "url": "/GSMCServices/service/loginDetails/fetchUserActivityDetails",
    "method": "POST",
    "contentType": "application/json",
    "data": JSON.stringify({
      "fromDate": sd,
      "toDate": ed ,
      "activityType": which
    }),
    "dataType": "json",
    "processData": false
  }).done(function (resp) {
    if (resp && resp.result.toUpperCase() == "SUCCESS") {
      if (done && typeof done == 'function') {
        done(null, resp.userActivityDetails);
      }
    } else {
      console.log("ERROR: Failed to retrieve " + which + " logs", resp);
      done('Failed');
    }
  }).fail(function (err) {
    console.log("ERROR: ", err);
    done('Failed');
  });
}
