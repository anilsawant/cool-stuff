
let setupUploadVideoFeature = function () {
  let addVideoCard = window.fa.dom.addVideoCard = document.querySelector('.card.add-video'),
      iconAddVideo = document.querySelector('.icon-add-resource');

  iconAddVideo.addEventListener('click', function () {
    document.querySelector('.card.add-video').parentNode.style.display = 'flex';
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
      let txtIssueDescription = addVideoCard.querySelector('.txt-file-description');
      if (inputFile.value) {
        if (txtIssueDescription.value.trim().length) {
          let onlyWordAndDigitsRegExp = /[^ \w]/gi,
              escapedDesc = txtIssueDescription.value.trim().replace(onlyWordAndDigitsRegExp,'_'),
              escapedFileName = inputFile.files[0].name.trim(),
              fileSize = (inputFile.files[0].size/1000000).toFixed(0),
              allowUpload = true;
          if (window.location.hostname == '52.1.59.26' && (fileSize > 10)) {//restrict file upload size on dev server
            allowUpload = false;
          }
          // if (inputFile.files[0].type.toLowerCase().match(/mp4|webm|ogg/)) {//HTML5 supported video formats only
          if (allowUpload) {
            let uploadedFileURL = window.fa.dom.selectDeviceType.value + '/' + window.fa.dom.selectDeviceBrand.value + '/' + window.fa.dom.selectDeviceModel.value + '/' + escapedDesc + '/' + escapedFileName;
            console.log('Upload to '+ uploadedFileURL + ' in progress.');
            window.fa.firebaseDatabase.child(window.fa.dom.selectDeviceType.value).child(window.fa.dom.selectDeviceBrand.value).child(window.fa.dom.selectDeviceModel.value).once('value', function (snapshot) {
              let savedVideos = snapshot.val();
              if (savedVideos[txtIssueDescription.value]) {
                alert('WARNING: File with this description already exists! Change the description or delete the old file to continue.');
              } else {
                addVideoCard.startUpload();
                uploadTask = window.fa.firebaseStorage.child(uploadedFileURL).put(inputFile.files[0]);
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
                  window.fa.firebaseDatabase.child(window.fa.dom.selectDeviceType.value).child(window.fa.dom.selectDeviceBrand.value).child(window.fa.dom.selectDeviceModel.value).child(escapedDesc).set('videos/' + uploadedFileURL);
                  inputFile.value = '';
                  txtIssueDescription.value = '';
                  addVideoCard.finishUpload();
                  if (document.createEvent) {
                    let evt = document.createEvent("HTMLEvents");
                    evt.initEvent("change", true, true);
                    evt.eventName = "change";
                    window.fa.dom.selectDeviceModel.dispatchEvent(evt);
                  }
                  // alert('SUCCESS: Video upload completed. Ready to upload a new video.')
                });
              }
            });
          } else {
            alert('Cannot upload large files on Dev Env. File size is : ' + fileSize + 'Mb. Choose a smaller file upto 10Mb.')
          }
          // } else {
          //   alert('Only video files can be uploaded. Kindly choose a video file.')
          // }
        } else {
          alert('Kindly enter file description.');
        }
      } else {
        alert('Kindly select a file to upload');
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
          addVideoCard.querySelector('.txt-file-description').value = '';
          addVideoCard.parentNode.style.display='none';
        }
      } else {
        addVideoCard.querySelector('.input-file').value = '';
        addVideoCard.querySelector('.txt-file-description').value = '';
        addVideoCard.parentNode.style.display='none';
      }
      addVideoCard.finishUpload();
    }
  });
}

let main = function () {
  let selectDeviceType = window.fa.dom.selectDeviceType = document.getElementById('selectDeviceType'),
      selectDeviceBrand = window.fa.dom.selectDeviceBrand = document.getElementById('selectDeviceBrand'),
      selectDeviceModel = window.fa.dom.selectDeviceModel = document.getElementById('selectDeviceModel'),
      loggedInUser = document.getElementById('loggedInUser'),
      $videoGrid = window.fa.dom.$videoGrid = $('.video-grid'),
      $resourcesContainerMsg = window.fa.dom.$resourcesContainerMsg = $('.resource-container-msg'),
      $foundDocumentsList = window.fa.dom.$foundDocumentsList = $('ul.documents-list'),
      $foundImagesGrid = window.fa.dom.$foundImagesGrid = $('.images-grid'),
      $resourcesBody = window.fa.dom.$resourcesBody = $('.resources-body'),
      btnManageDevices = document.getElementById('btnManageDevices'),
      addDeviceCard = window.fa.deviceManager.dom.addDeviceCard = document.querySelector('.card.manage-devices');

  window.fa.deviceManager.dom.selectDeviceType = addDeviceCard.querySelector('.select-device.type');
  window.fa.deviceManager.dom.selectDeviceBrand = addDeviceCard.querySelector('.select-device.brand');
  window.fa.deviceManager.dom.selectDeviceModel = addDeviceCard.querySelector('.select-device.model');

  loggedInUser.textContent = window.fa.user.name || 'ADMIN';
  loggedInUser.parentNode.title = window.fa.user.role || window.fa.user.name || 'ADMIN';
  setupUploadVideoFeature();
  window.fa.dom.$resourcesBody.hide(function () {
    window.fa.dom.$resourcesContainerMsg.show().text('Please select Device Details above to see resources');
  });

  addDeviceCard.addEventListener('click', function (evt) {
    if (evt.target.className.includes('add-slider-toggle')) {
      $(evt.target).closest('.device-selection').find('.add-slider').slideToggle();
    } else if (evt.target.className.includes('close-card')) {
      resetSelectBox(window.fa.deviceManager.dom.selectDeviceType , 'Select Type');
      resetSelectBox(window.fa.deviceManager.dom.selectDeviceBrand , 'Select Brand');
      resetSelectBox(window.fa.deviceManager.dom.selectDeviceModel, 'Select Model');
      $(addDeviceCard).find('.input-group').addClass('disabled')
                        .find('.glyphicon-remove').addClass('disabled');
      addDeviceCard.parentNode.style.display='none';
    } else if (evt.target.className.includes('btn-add')) {
      let txtBoxNewDeviceDetail = evt.target.parentNode.querySelector('input');
      let onlyWordAndDigitsRegExp = /[^\w]/gi;
      if (txtBoxNewDeviceDetail.value) {
        let newDeviceDetail = txtBoxNewDeviceDetail.value.toUpperCase().replace(onlyWordAndDigitsRegExp,'_');
        let $closestParent = $(evt.target).closest('.device-selection');
        if ($closestParent.hasClass('type')) {
          window.fa.firebaseDatabase.child(newDeviceDetail).once('value', function (snapshot) {
            if ((snapshot.val() === null)) {
              window.fa.firebaseDatabase.child(newDeviceDetail).set('', function (err) {
                if (err) {
                  console.error(err);
                } else {
                  addDeviceDetailSuccess($closestParent.find('.select-device'), newDeviceDetail);
                    let optElm = document.createElement('option');
                    optElm.textContent = optElm.value = newDeviceDetail;
                    selectDeviceType.appendChild(optElm);
                  alert('Device type added successfully.');
                  txtBoxNewDeviceDetail.value = '';
                  $('.add-slider').slideUp();
                }
              });
            } else {
              alert('ERROR: Type already exists.');
            }
          });

        } else if ($closestParent.hasClass('brand')) {
          window.fa.firebaseDatabase.child(window.fa.deviceManager.dom.selectDeviceType.value).child(newDeviceDetail).once('value', function (snapshot) {
            if ((snapshot.val() === null)) {
              window.fa.firebaseDatabase.child(window.fa.deviceManager.dom.selectDeviceType.value).child(newDeviceDetail).set('', function (err) {
                if (err) {
                  console.error(err);
                } else {
                  addDeviceDetailSuccess($closestParent.find('.select-device'), newDeviceDetail);
                  alert('Device brand added successfully.');
                  txtBoxNewDeviceDetail.value = '';
                  $('.add-slider').slideUp();
                }
              });
            } else {
              alert('ERROR: Brand already exists.');
            }
          });

        } else if ($closestParent.hasClass('model')) {
          window.fa.firebaseDatabase.child(window.fa.deviceManager.dom.selectDeviceType.value).child(window.fa.deviceManager.dom.selectDeviceBrand.value).child(newDeviceDetail).once('value', function (snapshot) {
            if ((snapshot.val() === null)) {
              window.fa.firebaseDatabase.child(window.fa.deviceManager.dom.selectDeviceType.value).child(window.fa.deviceManager.dom.selectDeviceBrand.value).child(newDeviceDetail).set('', function (err) {
                if (err) {
                  console.error(err);
                } else {
                  addDeviceDetailSuccess($closestParent.find('.select-device'), newDeviceDetail);
                  alert('Device model added successfully.');
                  txtBoxNewDeviceDetail.value = '';
                  $('.add-slider').slideUp();
                }
              });
            } else {
              alert('ERROR: Model already exists.');
            }
          });
        }
      } else {
        alert('Device detail cannot be empty.');
      }
    } else if (evt.target.className.includes('glyphicon-remove')) {
      let $closestParent = $(evt.target).closest('.device-selection');
      let $selectElement = $closestParent.find('.select-device');
      if ($closestParent.hasClass('type')) {
        if (confirm("Delete device type: " + window.fa.deviceManager.dom.selectDeviceType.value + "?")) {
          window.fa.firebaseDatabase.once('value', function (snapshot) {
            let deviceTypes = Object.keys(snapshot.val());
            if (deviceTypes.length == 1) {
              window.fa.firebaseDatabase.set('').then(function (snapshot) {
                deleteDeviceDetailSuccess($selectElement, $selectElement.val());
              });
            } else {
              window.fa.firebaseDatabase.child(window.fa.deviceManager.dom.selectDeviceType.value).remove().then(function (snapshot) {
                deleteDeviceDetailSuccess($selectElement, $selectElement.val());
              });
            }
          });
        }
      } else if ($closestParent.hasClass('brand')) {
        if (confirm("Delete brand: " + window.fa.deviceManager.dom.selectDeviceBrand.value + "?")) {
          window.fa.firebaseDatabase
              .child(window.fa.deviceManager.dom.selectDeviceType.value).once('value', function (snapshot) {
                let deviceBrands = Object.keys(snapshot.val());
                if (deviceBrands.length == 1) {
                  window.fa.firebaseDatabase
                      .child(window.fa.deviceManager.dom.selectDeviceType.value).set('').then(function (snapshot) {
                    deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                  });
                } else {
                  window.fa.firebaseDatabase
                      .child(window.fa.deviceManager.dom.selectDeviceType.value)
                        .child(window.fa.deviceManager.dom.selectDeviceBrand.value).remove().then(function (snapshot) {
                    deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                  });
                }
              });
        }
      } else if ($closestParent.hasClass('model')) {
        if (confirm("Delete model: " + window.fa.deviceManager.dom.selectDeviceModel.value + "?")) {
          window.fa.firebaseDatabase
              .child(window.fa.deviceManager.dom.selectDeviceType.value)
                .child(window.fa.deviceManager.dom.selectDeviceBrand.value).once('value', function (snapshot) {
                    let deviceSeries = Object.keys(snapshot.val());
                    if (deviceSeries.length == 1) {
                      window.fa.firebaseDatabase
                          .child(window.fa.deviceManager.dom.selectDeviceType.value)
                            .child(window.fa.deviceManager.dom.selectDeviceBrand.value).set('').then(function (snapshot) {
                        deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                      });
                    } else {
                      window.fa.firebaseDatabase
                          .child(window.fa.deviceManager.dom.selectDeviceType.value)
                            .child(window.fa.deviceManager.dom.selectDeviceBrand.value)
                                .child(window.fa.deviceManager.dom.selectDeviceModel.value).remove().then(function (snapshot) {
                        deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                      });
                    }
                  });
        }
      }
    }
  });
  window.fa.deviceManager.dom.selectDeviceType.addEventListener('change', function (evt) {
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceBrand , 'Select Brand');
    $(window.fa.deviceManager.dom.selectDeviceBrand ).closest('.input-group').addClass('disabled');
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceModel, 'Select Model');
    $(window.fa.deviceManager.dom.selectDeviceModel).closest('.input-group').addClass('disabled');
    if (evt.target.value) {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').removeClass('disabled');
      let brandTypes = Object.keys(window.fa.data.availableDevicesTree[evt.target.value]);
      window.fa.data.currentSelection.type = evt.target.value;
      window.populateSelectBox(window.fa.deviceManager.dom.selectDeviceBrand , brandTypes, 'Select Brand');
      $(window.fa.deviceManager.dom.selectDeviceBrand)
                  .closest('.input-group').removeClass('disabled')
                    .find('.glyphicon-remove').addClass('disabled');
    } else {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').addClass('disabled');
    }
  });
  window.fa.deviceManager.dom.selectDeviceBrand.addEventListener('change', function (evt) {
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceModel, 'Select Model');
    $(window.fa.deviceManager.dom.selectDeviceModel).closest('.input-group').addClass('disabled');
    if (evt.target.value) {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').removeClass('disabled');
      let arrModel = Object.keys(window.fa.data.availableDevicesTree[window.fa.deviceManager.dom.selectDeviceType.value][evt.target.value]);
      window.fa.data.currentSelection.series = evt.target.value;
      window.populateSelectBox(window.fa.deviceManager.dom.selectDeviceModel, arrModel, 'Select Model');
      $(window.fa.deviceManager.dom.selectDeviceModel)
                  .closest('.input-group').removeClass('disabled')
                    .find('.glyphicon-remove').addClass('disabled');
    } else {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').addClass('disabled');
    }
  });
  window.fa.deviceManager.dom.selectDeviceModel.addEventListener('change', function (evt) {
    if (evt.target.value) {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').removeClass('disabled');
      window.fa.data.currentSelection.model = evt.target.value;
    } else {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').addClass('disabled');
    }
  });

  let addDeviceDetailSuccess = function ($selectElement, newDeviceDetail) {
    let option = '<option value="' + newDeviceDetail + '">' + newDeviceDetail + '</option>';
    $selectElement.append(option).val(newDeviceDetail);
    if (document.createEvent) {
      let newEvt = document.createEvent("HTMLEvents");
      newEvt.initEvent("change", true, true);
      newEvt.eventName = "change";
      $selectElement[0].dispatchEvent(newEvt);
    }
  }

  let deleteDeviceDetailSuccess = function ($selectElement, deletedDeviceDetail) {
    $selectElement.find("option[value='"+ deletedDeviceDetail +"']").remove();
    if (document.createEvent) {
      let newEvt = document.createEvent("HTMLEvents");
      newEvt.initEvent("change", true, true);
      newEvt.eventName = "change";
      $selectElement[0].dispatchEvent(newEvt);
      resetVideoViewSelection();
      populateSelectBox(window.fa.dom.selectDeviceType, Object.keys(window.fa.data.availableDevicesTree), "Select Type");
      $('.device-details .row-label').removeClass('disabled');
    }
  }

  selectDeviceType.addEventListener('change', function () {
    resetSelectBox(selectDeviceBrand, 'Select Brand');
    resetSelectBox(selectDeviceModel, 'Select Model');
    $('.resource-container-header').addClass('disabled');
    window.fa.dom.$videoGrid.empty();
    if (selectDeviceType.value) {
      let brandTypes = Object.keys(window.fa.data.availableDevicesTree[selectDeviceType.value]);
      window.populateSelectBox(selectDeviceBrand, brandTypes, 'Select Brand');
    }
    window.fa.dom.$resourcesBody.hide(function () {
      window.fa.dom.$resourcesContainerMsg.show().text('Please select Device Details above to see resources');
    });
  });
  selectDeviceBrand.addEventListener('change', function () {
    resetSelectBox(selectDeviceModel, 'Select Model');
    $('.resource-container-header').addClass('disabled');
    window.fa.dom.$videoGrid.empty();
    if (selectDeviceBrand.value) {
      let modelTypes = Object.keys(window.fa.data.availableDevicesTree[selectDeviceType.value][selectDeviceBrand.value]);
      window.populateSelectBox(selectDeviceModel, modelTypes, 'Select Model');
    }
    window.fa.dom.$resourcesBody.hide(function () {
      window.fa.dom.$resourcesContainerMsg.show().text('Please select Device Details above to see resources');
    });
  });
  selectDeviceModel.addEventListener('change', function () {
    $('.resource-container-header').addClass('disabled');
    if (selectDeviceModel.value) {
      $('.resource-container-header').removeClass('disabled');
      refreshResources();
    }
  });
  $videoGrid.on('click', function (evt) {
    if (evt.target.className.includes('icon-play-video')) {
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
          window.fa.firebaseStorage.child(videoURL).delete().then(function() {
            $videoTile.parent().remove();
            if (!$videoGrid.find('.video-tile')[0] && !$foundDocumentsList.find('.list-group-item')[0] && !$foundImagesGrid.find('img')[0]) {
              window.fa.firebaseDatabase.child(selectDeviceType.value)
              .child(selectDeviceBrand.value).child(selectDeviceModel.value).set('');
              window.fa.dom.$resourcesBody.hide(function () {
                window.fa.dom.$resourcesContainerMsg.show().text('No resources for the selected device!!');
              });
            } else {
              window.fa.firebaseDatabase.child(selectDeviceType.value)
              .child(selectDeviceBrand.value).child(selectDeviceModel.value)
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
  $foundDocumentsList.on('click', function (evt) {
     if (evt.target.className.includes('close')) {
      let fileToDelete = evt.target.parentNode;
      if (confirm('Delete this file?')) {
        evt.target.style.pointerEvents = 'none';
        let filePath = evt.target.getAttribute('data-fullpath').replace('videos/','');
        window.fa.firebaseStorage.child(filePath).delete().then(function() {
          evt.target.parentNode.parentNode.removeChild(evt.target.parentNode);
          if (!$videoGrid.find('.video-tile')[0] && !$foundDocumentsList.find('.list-group-item')[0] && !$foundImagesGrid.find('img')[0]) {
            window.fa.firebaseDatabase.child(selectDeviceType.value)
            .child(selectDeviceBrand.value).child(selectDeviceModel.value).set('');
            window.fa.dom.$resourcesBody.hide(function () {
              window.fa.dom.$resourcesContainerMsg.show().text('No resources for the selected device!!');
            });
          } else {
            window.fa.firebaseDatabase.child(selectDeviceType.value)
            .child(selectDeviceBrand.value).child(selectDeviceModel.value)
                      .child(fileToDelete.querySelector('.file-desc').textContent).remove();
          }
          alert('File deleted successfully!');
        }).catch(function(error) {
          alert('Failed to delete the file!');
        });
      }
    }
  });

  $foundImagesGrid.on('click', function (evt) {
     if (evt.target.className.includes('close')) {
      let fileToDelete = evt.target.parentNode.parentNode;
      if (confirm('Delete this Image?')) {
        evt.target.style.pointerEvents = 'none';
        let filePath = evt.target.getAttribute('data-fullpath').replace('videos/','');
        window.fa.firebaseStorage.child(filePath).delete().then(function() {
          fileToDelete.parentNode.removeChild(fileToDelete);
          if (!$videoGrid.find('.video-tile')[0] && !$foundDocumentsList.find('.list-group-item')[0] && !$foundImagesGrid.find('img')[0]) {
            window.fa.firebaseDatabase.child(selectDeviceType.value)
            .child(selectDeviceBrand.value).child(selectDeviceModel.value).set('');
            window.fa.dom.$resourcesBody.hide(function () {
              window.fa.dom.$resourcesContainerMsg.show().text('No resources for the selected device!!');
            });
          } else {
            window.fa.firebaseDatabase.child(selectDeviceType.value)
            .child(selectDeviceBrand.value).child(selectDeviceModel.value)
                      .child(evt.target.getAttribute('data-desc')).remove();
          }
          alert('Image deleted successfully!');
        }).catch(function(error) {
          alert('Failed to delete the Image!');
        });
      }
    }
  });

  btnManageDevices.addEventListener('click', function (evt) {
    evt.preventDefault();
    populateSelectBox(window.fa.deviceManager.dom.selectDeviceType, Object.keys(window.fa.data.availableDevicesTree), "Select Type");
    $(window.fa.deviceManager.dom.selectDeviceType).closest('.input-group').removeClass('disabled');
    document.querySelector('.card.manage-devices').parentNode.style.display = 'flex';
  });

  resetVideoViewSelection();
  resetDeviceManager();
}

let refreshResources = function () {
  window.fa.dom.$videoGrid.empty();
  window.fa.dom.$foundDocumentsList.empty();
  window.fa.dom.$foundImagesGrid.empty();
  if (window.fa.dom.selectDeviceModel.value) {
    let issueData = window.fa.data.availableDevicesTree[window.fa.dom.selectDeviceType.value][window.fa.dom.selectDeviceBrand.value][window.fa.dom.selectDeviceModel.value];
    let issues = Object.keys(issueData);
    if (issues.length) {
      displayLoading(document.body);
      let videosMetadataList = [];
      let foundDocumentsList = [];
      let foundImagesList = [];
      let counter = 0;
      issues.forEach(function (issue, index) {
        firebase.storage().ref().child(issueData[issue]).getMetadata().then(function(metadata) {
          console.log("metadata", metadata);
          counter++;
          if (metadata.contentType.includes("video")) {
            let videoMetadata = {
              "timeCreated": new Date(metadata.timeCreated),
              "downloadURL": metadata.downloadURLs[0],
              "fullPath": metadata.fullPath,
              "issue": issue
            }
            videosMetadataList.push(videoMetadata);
          } else if (metadata.contentType.match(/pdf|text|doc/)) {
            let docMetadata = {
              "timeCreated": new Date(metadata.timeCreated),
              "downloadURL": metadata.downloadURLs[0],
              "fullPath": metadata.fullPath,
              "issue": issue,
              "size": metadata.size
            }
            foundDocumentsList.push(docMetadata);
          } else if (metadata.contentType.match(/image/)) {
            let imageMetadata = {
              "timeCreated": new Date(metadata.timeCreated),
              "downloadURL": metadata.downloadURLs[0],
              "fullPath": metadata.fullPath,
              "issue": issue
            }
            foundImagesList.push(imageMetadata);
          }
          if (counter == issues.length) {
            populateVideoGrid(videosMetadataList);
            populateDocumentsList(foundDocumentsList);
            populateImagesGrid(foundImagesList);
            doneLoading(document.body);
            window.fa.dom.$resourcesContainerMsg.hide(function () {
              window.fa.dom.$resourcesBody.fadeIn('slow');
            });
          }
        }).catch(function(error) {
          counter++;
          console.log('ERROR: Metatdata retrieval failed');
          console.error(error);
          if (counter == issues.length) {
            populateVideoGrid(videosMetadataList);
            populateDocumentsList(foundDocumentsList);
            populateImagesGrid(foundImagesList);
            doneLoading(document.body);
            window.fa.dom.$resourcesContainerMsg.hide(function () {
              window.fa.dom.$resourcesBody.fadeIn('slow');
            });
          }
        });
      });
    } else {
      window.fa.dom.$resourcesBody.hide(function () {
        window.fa.dom.$resourcesContainerMsg.show().text('No resources for the selected device!!');
      });
    }
  } else {
    window.fa.dom.$resourcesBody.hide(function () {
      window.fa.dom.$resourcesContainerMsg.show().text('Please select Device Details above to see resources');
    });
  }
}
let resetVideoViewSelection = function () {
  resetSelectBox(window.fa.dom.selectDeviceType, 'Select Type');
  resetSelectBox(window.fa.dom.selectDeviceBrand, 'Select Brand');
  resetSelectBox(window.fa.dom.selectDeviceModel, 'Select Model');
  window.fa.dom.$videoGrid.empty();
  window.fa.dom.$resourcesBody.hide(function () {
    window.fa.dom.$resourcesContainerMsg.show().text('Please select Device Details above to see resources');
  });
  $('.device-details .row-label').addClass('disabled');
  $('.resource-container-header').addClass('disabled');
}

let resetDeviceManager = function () {
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceType, 'Select Type');
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceBrand , 'Select Brand');
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceModel, 'Select Model');
    $(window.fa.deviceManager.dom.addDeviceCard)
            .find('.input-group').addClass('disabled')
              .find('.glyphicon-remove').addClass('disabled');;
}

let populateDocumentsList = function (documentsList) {
  let foundDocumentsList = document.querySelector('ul.documents-list');
  for (var i = 0; i < documentsList.length; i++) {
    let fileSize = (documentsList[i].size/1000).toFixed(2);
    let resourceLi = document.createElement('li');
    resourceLi.className = 'list-group-item';
    resourceLi.innerHTML = `<span class="file-desc">${documentsList[i].issue}</span>
                            <span class="file-size">${fileSize}kb</span>
                            <span class="close" title="Delete file" data-src="${documentsList[i].downloadURL}" data-fullpath="${documentsList[i].fullPath}">&times;</span>`;
    window.fa.dom.$foundDocumentsList.append(resourceLi);
  }
}
let populateImagesGrid = function (imagesMetadataList) {
  imagesMetadataList.sort(function (a,b) {
    return b.timeCreated.getTime() - a.timeCreated.getTime();
  });// show videos in chronological order, latest shown first

  for (imageMetadata of imagesMetadataList) {
    let timeString = imageMetadata.timeCreated.getDate() + '-' + (imageMetadata.timeCreated.getMonth()+1) + '-' + imageMetadata.timeCreated.getFullYear();
    timeString += ' ' + (imageMetadata.timeCreated.getHours() < 10 ? '0' + imageMetadata.timeCreated.getHours(): imageMetadata.timeCreated.getHours()) + ":" + (imageMetadata.timeCreated.getMinutes()<10?'0'+imageMetadata.timeCreated.getMinutes():imageMetadata.timeCreated.getMinutes());
    let imageItem =  `<div class="col-xs-6">
                          <img src="${imageMetadata.downloadURL}" data-fullpath="${imageMetadata.fullPath}">
                          <div class="metadata">
                            <span class="file-desc">${imageMetadata.issue}</span>
                            <span class="close" title="Delete image" data-fullpath="${imageMetadata.fullPath}" data-desc="${imageMetadata.issue}">&times;</span>
                          </div>
                      </div>`;
    window.fa.dom.$foundImagesGrid.append(imageItem);
  }
}
let populateVideoGrid = function (videosMetadataList) {
  videosMetadataList.sort(function (a,b) {
    return b.timeCreated.getTime() - a.timeCreated.getTime();
  });// show videos in chronological order, latest shown first

  for (videoMetadata of videosMetadataList) {
    let timeString = videoMetadata.timeCreated.getDate() + '-' + (videoMetadata.timeCreated.getMonth()+1) + '-' + videoMetadata.timeCreated.getFullYear();
    timeString += ' ' + (videoMetadata.timeCreated.getHours() < 10 ? '0' + videoMetadata.timeCreated.getHours(): videoMetadata.timeCreated.getHours()) + ":" + (videoMetadata.timeCreated.getMinutes()<10?'0'+videoMetadata.timeCreated.getMinutes():videoMetadata.timeCreated.getMinutes());
    let videoItem =  `<div class="col-xs-6">
                        <div class="video-tile" title="${videoMetadata.issue}">
                          <span class="full-screen" title="Full screen">[&nbsp;&nbsp;]</span>
                          <span class="delete" data-fullpath="${videoMetadata.fullPath}" title="Delete video">&times;</span>
                          <video src="${videoMetadata.downloadURL}" preload="metadata"></video>
                          <div class="video-overlay">
                            <span class="icon-play-video"></span>
                            <div class="video-metadata">
                              <p class="video-desc overflow-ellipsis">${videoMetadata.issue}</p>
                              <span class="time-created" title="Time Created ${timeString}">${timeString}</span>
                            </div>
                          </div>
                        </div>
                      </div>`;
    window.fa.dom.$videoGrid.append(videoItem);
  }
}

window.populateSelectBox = function (selectElement, dataAsArray, title) {
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

window.resetSelectBox = function (selectElement, title) {
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

let logout = function () {
  window.sessionStorage.removeItem('faAdmin');
  window.location.href = 'index.html';
}
