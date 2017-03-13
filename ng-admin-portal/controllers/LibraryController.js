angular.module('gsmcApp')
.controller('LibraryController', function ($rootScope,$scope,$http,$firebaseObject,$firebaseArray,util) {
  $rootScope.pageTitle = 'Library | GSMC';
  $scope.libraryContainer = document.querySelector('.library-container');
  $scope.searchRow = angular.element('.row.search-library');
  $scope.resultsRow = angular.element('.results-row');
  $scope.searchBtnChevron = angular.element('span.search-chevron');
  $scope.manageDevicesRow = angular.element('.row.manage-devices');
  $scope.manageBtnChevron = angular.element('span.manage-chevron');

  // variable declarations
  $scope.deviceTypes = [{"name":'Select Type'}];
  $scope.deviceBrands = [{"name":'Select Brand'}];
  $scope.deviceModels = [{"name":'Select Model'}];
  $scope.selectedType = $scope.deviceTypes[0];
  $scope.selectedBrand = $scope.deviceBrands[0];
  $scope.selectedModel = $scope.deviceModels[0];
  $scope.resources = [];

  $scope.initializeFirebase = function () {
    util.displayLoading($scope.libraryContainer);
    let isInitializing = true;// to show loading only once while initializing
    $scope.ngFireDBVideosRef = $rootScope.firebaseApp.database().ref('videos');
    $scope.ngFireStorageRef = $rootScope.firebaseApp.storage().ref();

    $scope.devices = $firebaseObject($scope.ngFireDBVideosRef);
    $scope.devices.$loaded(function (data) {
      util.doneLoading($scope.libraryContainer);
      $scope.availableDevicesTree = data
      if($scope.availableDevicesTree) {
        let deviceTypesTemp = [{"name":'Select Type'}];
        // To iterate the key/value pairs of the object, use angular.forEach()
        angular.forEach(data, function(value, key) {
          deviceTypesTemp.push({
            "name": key,
            "value": key
          });
        });
        $scope.deviceTypes = deviceTypesTemp;
        $scope.selectedType = $scope.deviceTypes[0];
      }
    });
  };
  $scope.initializeFirebase();
  $scope.toggleSearchRow = function (evt) {
    if ($scope.searchBtnChevron.hasClass('glyphicon-chevron-up')) {
      $scope.searchRow.slideUp();
      $scope.searchBtnChevron.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    } else {
      $scope.searchRow.slideDown();
      $scope.searchBtnChevron.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    }
    $scope.manageDevicesRow.slideUp();
    $scope.manageBtnChevron.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
  };
  $scope.toggleManageDevicesRow = function (evt) {
    if ($scope.manageBtnChevron.hasClass('glyphicon-chevron-up')) {
      $scope.manageDevicesRow.slideUp();
      $scope.manageBtnChevron.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    } else {
      $scope.manageDevicesRow.find('.slider').slideUp();
      $scope.manageDevicesRow.find('.glyphicon-minus').removeClass('glyphicon-minus').addClass('glyphicon-plus');
      $scope.manageDevicesRow.slideDown();
      $scope.manageBtnChevron.removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    }
    $scope.searchRow.slideUp();
    $scope.searchBtnChevron.removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
  };
  $scope.showAddResourceCard = function () {
    angular.element('.overlay.add-video').fadeIn();
  }

  $scope.elmSelectType = angular.element('.search-library select.type');
  $scope.elmSelectBrand = angular.element('.search-library select.brand');
  $scope.elmSelectModel = angular.element('.search-library select.model');
  $scope.selectSearchChange = function (which) {
    $scope.resultsRow.slideUp();
    switch (which) {
      case "type":
        $scope.deviceBrands = [{"name":'Select Brand'}];
        $scope.selectedBrand = $scope.deviceBrands[0];
        $scope.deviceModels = [{"name":'Select Model'}];
        $scope.selectedModel = $scope.deviceModels[0];
        if ($scope.selectedType.value) {
          if($scope.availableDevicesTree) {
            let brandsObj = $scope.availableDevicesTree[$scope.selectedType.value];
            let deviceBrandsTemp = [{"name":'Select Brand'}];
            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(brandsObj, function(value, key) {
              deviceBrandsTemp.push({
                "name": key,
                "value": key
              });
            });
            $scope.deviceBrands = deviceBrandsTemp;
            $scope.selectedBrand = $scope.deviceBrands[0];
          }
        }
        break;
      case "brand":
        $scope.deviceModels = [{"name":'Select Model'}];
        $scope.selectedModel = $scope.deviceModels[0];
        if ($scope.selectedBrand.value) {
          if($scope.availableDevicesTree) {
            let modelsObj = $scope.availableDevicesTree[$scope.selectedType.value][$scope.selectedBrand.value];
            let deviceModelsTemp = [{"name":'Select Model'}];
            // To iterate the key/value pairs of the object, use angular.forEach()
            angular.forEach(modelsObj, function(value, key) {
              deviceModelsTemp.push({
                "name": key,
                "value": key
              });
            });
            $scope.deviceModels = deviceModelsTemp;
            $scope.selectedModel = $scope.deviceModels[0];
          }
        }
        break;
      case "model":
        if ($scope.selectedModel.value) {
          let resourceData = $scope.availableDevicesTree[$scope.selectedType.value][$scope.selectedBrand.value][$scope.selectedModel.value];
          util.displayLoading($scope.libraryContainer);
          $scope.resources = []; //reset the resources array
          $scope.resultsRow.slideUp();
          let tempArr = [],
              counter = 0;
          angular.forEach(resourceData, function (value, key) {
            tempArr.push(value)
          });
          if (tempArr.length) {
            for (var i = 0; i < tempArr.length; i++) {
              $scope.ngFireStorageRef.child(tempArr[i]).getMetadata().then(function(metadata) {
                $scope.resources.push(metadata);
                counter++;
                if (counter == tempArr.length) {
                  $scope.populateResources($scope.resources);
                }
                util.doneLoading($scope.libraryContainer)
              }).catch(function (err) {
                counter++;
                if (counter == tempArr.length) {
                  $scope.populateResources($scope.resources);
                }
                util.doneLoading($scope.libraryContainer)
              });
            }
          } else {
            $scope.populateResources($scope.resources);
          }
        }
        break;
    }
  };
  $scope.getMonthStr = function (monthNumber) {
    let mon = "Mon";
    if (monthNumber) {
      switch (monthNumber) {
        case 0: mon = 'Jan';break;case 1: mon = 'Feb';break;
        case 2: mon = 'Mar';break;case 3: mon = 'Apr';break;
        case 4: mon = 'May';break;case 5: mon = 'Jun';break;
        case 6: mon = 'Jul';break;case 7: mon = 'Aug';break;
        case 8: mon = 'Sep';break;case 9: mon = 'Oct';break;
        case 10: mon = 'Nov';break;case 11: mon = 'Dec';break;
      }
    }
    return mon;
  };
  $scope.getFileSizeStr = function (sizeInBytes) {
    if (sizeInBytes) {
      let kb = 1024,
          mb = kb*1024,
          gb = mb*1024,
          sizeInGB = (sizeInBytes/gb).toFixed(1);
      if(sizeInGB >= 1) {
        return sizeInGB + "GB";
      }
      let sizeInMB = (sizeInBytes/mb).toFixed(1);
      if(sizeInMB >= 1) {
        return sizeInMB + "MB";
      }
      let sizeInKB = (sizeInBytes/kb).toFixed(1);
      if(sizeInKB >= 1) {
        return sizeInKB + "KB";
      }
    }
    return "00.00KB";
  }
  $scope.populateResources = function (resources) {
    if (resources && resources.length) {
      $scope.resultsRow.slideUp();
      let $resrchResultBody = angular.element('.search-library tbody');
      $resrchResultBody.empty();
      for (var i = 0; i < resources.length; i++) {
        let lastModified = new Date(resources[i].updated),
            lastModifiedStr = $scope.getMonthStr(lastModified.getMonth()) + " " + lastModified.getDate() + ", " + lastModified.getFullYear(),
            newTr = `<tr>
              <td>${resources[i].name}</td>
              <td>${$scope.getFileSizeStr(resources[i].size)}</td>
              <td>${resources[i].type}</td>
              <td>${lastModifiedStr}</td>
            </tr>`;
        $resrchResultBody.append(newTr);
      }
      $scope.resultsRow.find('.panel').show();
      $scope.resultsRow.find('.alert').hide();
      $scope.resultsRow.slideDown();
    } else {
      $scope.resultsRow.find('.panel').hide();
      $scope.resultsRow.find('.alert msg').html('No resources found for the selected device.')
                        .parent().show();
      $scope.resultsRow.slideDown();
    }
  }
  $scope.setupUploadVideoFeature = function () {
    let addVideoCard = document.querySelector('.overlay.add-video'),
        $msgRow = angular.element(addVideoCard).find('.alert');

    $scope.hideAddMsg = function () {
      $msgRow.slideUp(function () {
        $msgRow.find('.msg').html('');
      });
    }
    $scope.showAddMsg = function (msg) {
      if (msg) {
        $msgRow.find('.msg').html(msg)
        $msgRow.slideDown();
      }
    }
    addVideoCard.isUploading = false;
    addVideoCard.startUpload = function () {
      addVideoCard.isUploading = true;
      addVideoCard.querySelector('.close').style.pointerEvents = 'none';
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
                      addVideoCard.querySelector('.close').style.pointerEvents = 'all';
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
            $scope.showAddMsg('Kindly enter file description.');
          }
        } else {
          $scope.showAddMsg('Kindly select a file to upload.');
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
      } else if (evt.target.className.includes('close')) {
        if (addVideoCard.isUploading) {
          if (confirm('This will cancel the upload. Continue?')) {
            uploadTask.resume();// firebase doesn't allow paused upload to be cancelled
            uploadTask.cancel();
            addVideoCard.querySelector('.input-file').value = '';
            addVideoCard.querySelector('.txt-file-description').value = '';
            angular.element(addVideoCard).fadeOut();
          }
        } else {
          addVideoCard.querySelector('.input-file').value = '';
          addVideoCard.querySelector('.txt-file-description').value = '';
          angular.element(addVideoCard).fadeOut();
        }
        addVideoCard.finishUpload();
      }
    });
  };


  $scope.setupUploadVideoFeature();
});
angular.module('gsmcApp')
.controller('ManageDevicesController', function ($scope) {
  //controller scoped DOM
  $scope.manageDevicesRow = angular.element('.row.manage-devices');
  $scope.elmControlType = $scope.manageDevicesRow.find('.control.type');
  $scope.elmControlBrand = $scope.manageDevicesRow.find('.control.brand');
  $scope.elmControlModel = $scope.manageDevicesRow.find('.control.model');
  // variable declarations
  $scope.deviceTypes = [{"name":'Select Type'}];
  $scope.deviceBrands = [{"name":'Select Brand'}];
  $scope.deviceModels = [{"name":'Select Model'}];
  $scope.selectedType = $scope.deviceTypes[0];
  $scope.selectedBrand = $scope.deviceBrands[0];
  $scope.selectedModel = $scope.deviceModels[0];

  $scope.toggleSlider = function (evt) {
    let $target = angular.element(evt.target);
    if (!$target.hasClass('glyphicon'))
      $target = $target.find('.glyphicon');
    if ($target.hasClass('glyphicon-plus')) {
      $target.parents('.input-group').siblings('.slider').slideDown();
      $target.removeClass('glyphicon-plus').addClass('glyphicon-minus');
    } else if ($target.hasClass('glyphicon-minus')) {
      $target.parents('.input-group').siblings('.slider').slideUp();
      $target.removeClass('glyphicon-minus').addClass('glyphicon-plus');
    }
  };
  $scope.selectChange = function (detail) {
    switch (detail) {
      case "type":
        if ($scope.selectedType.value) {
          $scope.elmControlBrand.find('.input-group').removeClass('disabled');
        }
        break;
      case "brand":
        if ($scope.selectedBrand.value) {
          $scope.elmControlModel.find('.input-group').removeClass('disabled');
        }
        break;
      case "model":
        if ($scope.selectedModel.value) {
          console.log("Enable resource add");
          angular.element('.btn-start-upload').attr('title','Start upload');
        }
        break;

    }
  };
  $scope.deleteDeviceDetail = function (detail) {
    switch (detail) {
      case "type":
        if ($scope.selectedType.value) {
          console.log('Delete Type: ', $scope.selectedType.value);
        }
        break;
      case "brand":
        if ($scope.selectedBrand.value) {
          console.log('Delete Brand: ', $scope.selectedBrand.value);
        }
        break;
      case "model":
        if ($scope.selectedModel.value) {
          console.log('Delete Model: ', $scope.selectedModel.value);
        }
        break;
    }
  };
  $scope.addNewDeviceDetail = function (evt, detail) {
    let $parent = angular.element(evt.target).parents('.control'),
        $input = $parent.find('input.form-control'),
        $select = $parent.find('select.form-control'),
        newVal = $input.val();
    if (newVal) {
      // $scope.deviceTypes.push($input.val());
      let newItem = {
        "name": newVal.toUpperCase(),
        "value": newVal.toUpperCase()
      }
      switch (detail) {
        case "type":
          $scope.deviceTypes.push(newItem);
          // $scope.selectedType = newItem;
          break;
        case "brand":
          $scope.deviceBrands.push(newItem);
          // $scope.selectedBrand = newItem;
          break;
        case "model":
          $scope.deviceModels.push(newItem);
          // $scope.selectedModel = newItem;
          break;

      }
      $parent.find('.slider').slideUp();
      $parent.find('.glyphicon-minus').removeClass('glyphicon-minus').addClass('glyphicon-plus');
      $input.val('');
    }
  }
});
