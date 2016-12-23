if(!document.body.controllers)
  document.body.controllers = {};

document.body.controllers.libraryController = function () {
  let self = this;
  this.libraryController.dom = {
    "selectDeviceType": document.getElementById('selectDeviceType'),
    "selectDeviceBrand": document.getElementById('selectDeviceBrand'),
    "selectDeviceSeries": document.getElementById('selectDeviceSeries'),
    "selectDeviceModel": document.getElementById('selectDeviceModel'),
    "$videoGrid": $('.video-grid'),
    "$videosContainerMsg": $('.videos-container-msg'),
    "videoContainer": document.querySelector('.videos-container')
  }
  this.libraryController.defaultVideoContainerMsg = 'Start by selecting the device details above';
  this.libraryController.noResourcesMsg = 'No resources for the selected device!!';

  let isInitializing = true;
  window.firebaseDatabase.on('value', function (snapshot) {
    self.libraryController.devices = snapshot.val();
    if (isInitializing) {
      self.libraryController.populateSelectBox(self.libraryController.dom.selectDeviceType, Object.keys(self.libraryController.devices), "Select Type");
      isInitializing = undefined;
    }
  });

  this.libraryController.resetView();
  this.libraryController.attachEventListeners();
  this.libraryController.setupUploadVideoFeature();
}
document.body.controllers.libraryController.resetSelectBox = function (selectElement, title) {
  if (selectElement && title) {
    selectElement.className += ' disabled';
    selectElement.innerHTML = "";
    let firstOption = document.createElement('option');
    firstOption.textContent = title;
    firstOption.setAttribute('value','');
    selectElement.appendChild(firstOption);
  } else {
    console.error('resetSelectBox failed.');
  }
};
document.body.controllers.libraryController.populateSelectBox = function (selectElement, dataAsArray, title) {
  if (dataAsArray instanceof Array && selectElement) {
    selectElement.innerHTML = "";
    if (title) {
      let firstOption = document.createElement('option');
      firstOption.textContent = title;
      firstOption.setAttribute('value','');
      selectElement.appendChild(firstOption);
    }
    for (let dataPoint of dataAsArray) {
      let option = document.createElement('option');
      option.textContent = dataPoint;
      option.setAttribute('value', dataPoint);
      selectElement.appendChild(option);
    }
    selectElement.className = selectElement.className.replace(/ *disabled */g, '');
  } else {
    console.error('populateSelectBox failed.');
  }
};
document.body.controllers.libraryController.resetView = function () {
  let self = this;
  self.resetSelectBox(self.dom.selectDeviceBrand, 'Select Type');
  self.resetSelectBox(self.dom.selectDeviceBrand, 'Select Brand');
  self.resetSelectBox(self.dom.selectDeviceSeries, 'Select Series');
  self.resetSelectBox(self.dom.selectDeviceModel, 'Select Model');
  self.dom.$videoGrid.empty();
  self.dom.$videoGrid.hide(function () {
    self.dom.$videosContainerMsg.show().text(self.defaultVideoContainerMsg);
  });
};
document.body.controllers.libraryController.attachEventListeners = function () {
  let self = this;
  this.dom.selectDeviceType.addEventListener('change', function () {
    self.resetSelectBox(self.dom.selectDeviceBrand, 'Select Brand');
    self.resetSelectBox(self.dom.selectDeviceSeries, 'Select Series');
    self.resetSelectBox(self.dom.selectDeviceModel, 'Select Model');
    self.dom.$videoGrid.empty();
    if (self.dom.selectDeviceType.value) {
      let brandTypes = Object.keys(self.devices[self.dom.selectDeviceType.value]);
      self.populateSelectBox(self.dom.selectDeviceBrand, brandTypes, 'Select Brand');
    }
    self.dom.$videoGrid.hide(function () {
      self.dom.$videosContainerMsg.show().text(self.defaultVideoContainerMsg);
    });
  });
  this.dom.selectDeviceBrand.addEventListener('change', function () {
    self.resetSelectBox(self.dom.selectDeviceSeries, 'Select Series');
    self.resetSelectBox(self.dom.selectDeviceModel, 'Select Model');
    self.dom.$videoGrid.empty();
    if (self.dom.selectDeviceBrand.value) {
      let seriesTypes = Object.keys(self.devices[self.dom.selectDeviceType.value][self.dom.selectDeviceBrand.value]);
      self.populateSelectBox(self.dom.selectDeviceSeries, seriesTypes, 'Select Series');
    }
    self.dom.$videoGrid.hide(function () {
      self.dom.$videosContainerMsg.show().text(self.defaultVideoContainerMsg);
    });
  });
  this.dom.selectDeviceSeries.addEventListener('change', function () {
    self.resetSelectBox(self.dom.selectDeviceModel, 'Select Model');
    self.dom.$videoGrid.empty();
    if (self.dom.selectDeviceSeries.value) {
      let modelTypes = Object.keys(self.devices[self.dom.selectDeviceType.value][self.dom.selectDeviceBrand.value][self.dom.selectDeviceSeries.value]);
      self.populateSelectBox(self.dom.selectDeviceModel, modelTypes, 'Select Model');
    }
    self.dom.$videoGrid.hide(function () {
      self.dom.$videosContainerMsg.show().text(self.defaultVideoContainerMsg);
    });
  });

  this.dom.selectDeviceModel.addEventListener('change', function () {
    self.dom.$videoGrid.empty();
    if (self.dom.selectDeviceModel.value) {
      let issueData = self.devices[self.dom.selectDeviceType.value][self.dom.selectDeviceBrand.value][self.dom.selectDeviceSeries.value][self.dom.selectDeviceModel.value];
      let issues = Object.keys(issueData);
      if (issues.length) {
        displayLoading(document.getElementById('sub-view'));
        let videosMetadataList = [];
        let counter = 0;
        issues.forEach(function (issue, index) {
          window.firebaseStorage.child(issueData[issue]).getMetadata().then(function(metadata) {
            counter++;
            let videoMetadata = {
              "timeCreated": new Date(metadata.timeCreated),
              "downloadURL": metadata.downloadURLs[0],
              "fullPath": metadata.fullPath,
              "issue": issue
            }
            videosMetadataList.push(videoMetadata);
            if (counter == issues.length) {
              self.populateVideoGrid(videosMetadataList);
              doneLoading(document.getElementById('sub-view'));
            }
          }).catch(function(error) {
            counter++;
            console.log('ERROR: Metatdata retrieval failed');
            console.error(error);
            if (counter == issues.length) {
              doneLoading(document.getElementById('sub-view'));
              self.populateVideoGrid(videosMetadataList);
            }
          });
        });
      } else {
        self.dom.$videoGrid.hide(function () {
          self.dom.$videosContainerMsg.show().text(self.noResourcesMsg);
        });
      }
    } else {
      self.dom.$videoGrid.hide(function () {
        self.dom.$videosContainerMsg.show().text(self.defaultVideoContainerMsg);
      });
    }
  });

  this.dom.$videoGrid.on('click', function (evt) {
    if (evt.target.className.includes('glyphicon-play')) {
      let $videoTile = $(evt.target).closest('.video-tile');
      if ($videoTile[0]) {
        $videoTile.find('.video-overlay').fadeOut();
        $videoTile.find('video').attr('controls','true')[0].play();
      }
    } else if (evt.target.className.includes('delete')) {
      let $videoTile = $(evt.target).closest('.video-tile');
      if ($videoTile[0]) {
        if (confirm('Delete this video?')) {
          evt.target.style.pointerEvents = 'none';
          let videoURL = evt.target.getAttribute('data-fullpath').replace('videos/','');
          window.firebaseStorage.child('videos').child(videoURL).delete().then(function() {
            $videoTile.parent().remove();
            if (!self.dom.$videoGrid.find('.video-tile')[0]) {
              window.firebaseDatabase.child(self.dom.selectDeviceType.value).child(self.dom.selectDeviceBrand.value)
                        .child(self.dom.selectDeviceSeries.value).child(self.dom.selectDeviceModel.value).set('');
              self.dom.$videoGrid.hide(function () {
                self.dom.$videosContainerMsg.show().text(self.noResourcesMsg);
              });
            } else {
              window.firebaseDatabase.child(self.dom.selectDeviceType.value).child(self.dom.selectDeviceBrand.value)
                        .child(self.dom.selectDeviceSeries.value).child(self.dom.selectDeviceModel.value)
                        .child($videoTile.find('.video-desc').text()).remove();
            }
            alert('Video deleted successfully!');
          }).catch(function(error) {
            alert('Failed to delete the video!');
          });
        }
      }
    } else if (evt.target.className.includes('full-screen')) {
      let $videoTile = $(evt.target).closest('.video-tile');
      if ($videoTile[0]) {
        let video = $videoTile.find('video')[0];
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen(); // Firefox
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen(); // Chrome and Safari
        }
      }
    }
  });
};
document.body.controllers.libraryController.populateVideoGrid = function (videosMetadataList) {
  let self = this;
  videosMetadataList.sort(function (a,b) {
    return b.timeCreated.getTime() - a.timeCreated.getTime();
  });// show videos in chronological order, latest shown first

  for (videoMetadata of videosMetadataList) {
    let timeString = videoMetadata.timeCreated.getDate() + '-' + (videoMetadata.timeCreated.getMonth()+1) + '-' + videoMetadata.timeCreated.getFullYear();
    timeString += ' ' + (videoMetadata.timeCreated.getHours() < 10 ? '0' + videoMetadata.timeCreated.getHours(): videoMetadata.timeCreated.getHours()) + ":" + (videoMetadata.timeCreated.getMinutes()<10?'0'+videoMetadata.timeCreated.getMinutes():videoMetadata.timeCreated.getMinutes());
    let videoItem =  `<div class="col-xs-6 col-sm-4">
                        <div class="video-tile" title="${videoMetadata.issue}">
                          <span class="full-screen" title="Full screen">[&nbsp;&nbsp;]</span>
                          <span class="delete" data-fullpath="${videoMetadata.fullPath}" title="Delete video">&times;</span>
                          <video src="${videoMetadata.downloadURL}" preload="metadata"></video>
                          <div class="video-overlay">
                            <span class="glyphicon glyphicon-play"></span>
                            <div class="video-metadata">
                              <p class="video-desc overflow-ellipsis">${videoMetadata.issue}</p>
                              <span class="time-created" title="Time Created ${timeString}">${timeString}</span>
                            </div>
                          </div>
                        </div>
                      </div>`;
    self.dom.$videoGrid.append(videoItem);
  }
  if (videosMetadataList.length) {
    self.dom.$videosContainerMsg.hide(function () {
      self.dom.$videoGrid.fadeIn('slow');
    });
  } else {
    self.dom.$videoGrid.hide(function () {
      self.dom.$videosContainerMsg.show().text(self.noResourcesMsg);
    });
  }
}
document.body.controllers.libraryController.setupUploadVideoFeature = function () {
  let self = this;
  let addVideoCard = this.addVideoCard = document.querySelector('.card.add-video');
  this.iconAddVideo = this.dom.videoContainer.querySelector('.header .glyphicon-plus');

  this.iconAddVideo.addEventListener('click', function () {
    if (self.dom.selectDeviceType.value && self.dom.selectDeviceBrand.value && self.dom.selectDeviceSeries.value && self.dom.selectDeviceModel.value) {
      addVideoCard.parentNode.style.display = 'flex';
    } else {
      alert("Kindly select the device details till Model.");
    }
  });

  addVideoCard.isUploading = false;
  addVideoCard.startUpload = function () {
    addVideoCard.isUploading = true;
    addVideoCard.querySelector('.close-card').style.pointerEvents = 'none';
    addVideoCard.querySelector('.btn-start-upload').style.display = 'none';
    $(addVideoCard).find('input').attr('disabled', true);
  }
  addVideoCard.finishUpload = function () {
    addVideoCard.querySelector('.progress-bar').style.width = '0';
    addVideoCard.querySelector('.uploading-div').style.display = 'none';
    addVideoCard.querySelector('.btn-start-upload').style.display = 'block';
    addVideoCard.querySelector('span.status').textContent = '';
    addVideoCard.isUploading = false;
    $(addVideoCard).find('input').removeAttr('disabled');
  }
  addVideoCard.addEventListener('click', function (evt) {
    if (evt.target.className.includes('btn-start-upload')) {
      let inputFile = addVideoCard.querySelector('.input-file');
      let txtIssueDescription = addVideoCard.querySelector('.txt-video-description');
      if (inputFile.value) {
        if (txtIssueDescription.value.trim().length) {
          if (inputFile.files[0].type.toLowerCase().match(/mp4|webm|ogg/)) {//HTML5 supported video formats only
            let uploadedFileURL = self.dom.selectDeviceType.value + '/' + self.dom.selectDeviceBrand.value + '/' + self.dom.selectDeviceSeries.value + '/' + self.dom.selectDeviceModel.value + '/' + txtIssueDescription.value + '/' + inputFile.files[0].name;
            console.log('Upload to '+ uploadedFileURL + ' in progress.');
            window.firebaseDatabase.child(self.dom.selectDeviceType.value)
            .child(self.dom.selectDeviceBrand.value).child(self.dom.selectDeviceSeries.value)
            .child(self.dom.selectDeviceModel.value).once('value', function (snapshot) {
              let savedVideos = snapshot.val();
              if (savedVideos[txtIssueDescription.value]) {
                alert('WARNING: Video with this description already exists! Change the description or delete the old video to continue.');
              } else {
                addVideoCard.startUpload();
                uploadTask = window.firebaseStorage.child('videos').child(uploadedFileURL).put(inputFile.files[0]);
                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    addVideoCard.querySelector('.progress-bar').textContent = addVideoCard.querySelector('.progress-bar').style.width = progress.toFixed(0) + '%';
                    addVideoCard.querySelector('.btn-start-upload').style.display = 'none';
                    addVideoCard.querySelector('.close-card').style.pointerEvents = 'all';
                    addVideoCard.querySelector('.uploading-div').style.display = 'block';
                    switch (snapshot.state) {
                      case firebase.storage.TaskState.PAUSED: // or 'paused'
                        addVideoCard.querySelector('span.status').textContent = 'Upload Paused';
                        break;
                      case firebase.storage.TaskState.RUNNING: // or 'running'
                        addVideoCard.querySelector('span.status').textContent = 'Uploading...';
                        break;
                    }
                  }, function(error) {
                  switch (error.code) {
                    case 'storage/unauthorized':
                      break;

                    case 'storage/canceled':
                      console.log('Upload canceled by the user.');
                      addVideoCard.finishUpload();
                      break;
                    case 'storage/unknown':
                      break;
                  }
                }, function() {
                  var downloadURL = uploadTask.snapshot.downloadURL;
                  console.log('Uplaod complete', downloadURL);
                  window.firebaseDatabase.child(self.dom.selectDeviceType.value)
                    .child(self.dom.selectDeviceBrand.value).child(self.dom.selectDeviceSeries.value)
                    .child(self.dom.selectDeviceModel.value).child(txtIssueDescription.value).set('videos/' + uploadedFileURL);
                  inputFile.value = '';
                  txtIssueDescription.value = '';
                  addVideoCard.finishUpload();
                  // alert('SUCCESS: Video upload completed. Ready to upload a new video.')
                });
              }
            });
          } else {
            alert('Only video files can be uploaded. Kindly choose a video file.')
          }
        } else {
          alert('Kindly enter video description.');
        }
      } else {
        alert('Kindly select a video to upload');
      }
    } else if (evt.target.className.includes('btn-pause-resume-upload')) {
      if (addVideoCard.isUploading) {
        if (evt.target.textContent == 'Pause') {
          addVideoCard.querySelector('span.status').textContent = 'Pausing...';
          uploadTask.pause();
          evt.target.textContent = 'Resume';
        } else if (evt.target.textContent == 'Resume') {
          addVideoCard.querySelector('span.status').textContent = 'Resuming...';
          uploadTask.resume();
          evt.target.textContent = 'Pause';
        }
      }
    } else if (evt.target.className.includes('btn-cancel-upload')) {
      if (addVideoCard.isUploading) {
        if (confirm('Cancel the video upload?')) {
          uploadTask.resume();// firebase doesn't allow paused upload to be cancelled
          uploadTask.cancel();
        }
      }
    } else if (evt.target.className.includes('close-card')) {
      if (addVideoCard.isUploading) {
        if (confirm('This will cancel the upload. Continue?')) {
          uploadTask.resume();// firebase doesn't allow paused upload to be cancelled
          uploadTask.cancel();
          addVideoCard.querySelector('.input-file').value = '';
          addVideoCard.querySelector('.txt-video-description').value = '';
          addVideoCard.parentNode.style.display='none';
        }
      } else {
        addVideoCard.querySelector('.input-file').value = '';
        addVideoCard.querySelector('.txt-video-description').value = '';
        addVideoCard.parentNode.style.display='none';
      }
    }
  });
}
