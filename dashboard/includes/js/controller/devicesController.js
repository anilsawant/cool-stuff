if(!document.body.controllers)
  document.body.controllers = {};

document.body.controllers.devicesController = function () {
  let addDeviceCard = document.querySelector('.card.manage-devices'),
      selectDeviceType = addDeviceCard.querySelector('.select-device.type'),
      selectDeviceBrand = addDeviceCard.querySelector('.select-device.brand'),
      selectDeviceSeries = addDeviceCard.querySelector('.select-device.series'),
      selectDeviceModel = addDeviceCard.querySelector('.select-device.model');


  addDeviceCard.addEventListener('click', function (evt) {
    if (evt.target.className.includes('add-slider-toggle')) {
      $(evt.target).closest('.device-selection').find('.add-slider').slideToggle();
    } else if (evt.target.className.includes('btn-add')) {
      let txtBoxNewDeviceDetail = evt.target.parentNode.querySelector('input');
      if (txtBoxNewDeviceDetail.value) {
        let newDeviceDetail = txtBoxNewDeviceDetail.value.toUpperCase();
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
          window.fa.firebaseDatabase.child(selectDeviceType.value).child(newDeviceDetail).once('value', function (snapshot) {
            if ((snapshot.val() === null)) {
              window.fa.firebaseDatabase.child(selectDeviceType.value).child(newDeviceDetail).set('', function (err) {
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

        } else if ($closestParent.hasClass('series')) {
          window.fa.firebaseDatabase.child(selectDeviceType.value).child(selectDeviceBrand .value).child(newDeviceDetail).once('value', function (snapshot) {
            if ((snapshot.val() === null)) {
              window.fa.firebaseDatabase.child(selectDeviceType.value).child(selectDeviceBrand .value).child(newDeviceDetail).set('', function (err) {
                if (err) {
                  console.error(err);
                } else {
                  addDeviceDetailSuccess($closestParent.find('.select-device'), newDeviceDetail);
                  alert('Device series added successfully.');
                  txtBoxNewDeviceDetail.value = '';
                  $('.add-slider').slideUp();
                }
              });
            } else {
              alert('ERROR: Series already exists.');
            }
          });

        } else if ($closestParent.hasClass('model')) {
          window.fa.firebaseDatabase.child(selectDeviceType.value).child(selectDeviceBrand .value).child(selectDeviceSeries.value).child(newDeviceDetail).once('value', function (snapshot) {
            if ((snapshot.val() === null)) {
              window.fa.firebaseDatabase.child(selectDeviceType.value).child(selectDeviceBrand.value).child(selectDeviceSeries.value).child(newDeviceDetail).set('', function (err) {
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
        if (confirm("Delete device type: " + selectDeviceType.value + "?")) {
          window.fa.firebaseDatabase.once('value', function (snapshot) {
            let deviceTypes = Object.keys(snapshot.val());
            if (deviceTypes.length == 1) {
              window.fa.firebaseDatabase.set('').then(function (snapshot) {
                deleteDeviceDetailSuccess($selectElement, $selectElement.val());
              });
            } else {
              window.fa.firebaseDatabase.child(selectDeviceType.value).remove().then(function (snapshot) {
                deleteDeviceDetailSuccess($selectElement, $selectElement.val());
              });
            }
          });
        }
      } else if ($closestParent.hasClass('brand')) {
        if (confirm("Delete brand: " + selectDeviceBrand.value + "?")) {
          window.fa.firebaseDatabase
              .child(selectDeviceType.value).once('value', function (snapshot) {
                let deviceBrands = Object.keys(snapshot.val());
                if (deviceBrands.length == 1) {
                  window.fa.firebaseDatabase
                      .child(selectDeviceType.value).set('').then(function (snapshot) {
                    deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                  });
                } else {
                  window.fa.firebaseDatabase
                      .child(selectDeviceType.value)
                        .child(selectDeviceBrand.value).remove().then(function (snapshot) {
                    deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                  });
                }
              });
        }
      } else if ($closestParent.hasClass('series')) {
        if (confirm("Delete series: " + selectDeviceSeries.value + "?")) {
          window.fa.firebaseDatabase
              .child(selectDeviceType.value)
                .child(selectDeviceBrand.value).once('value', function (snapshot) {
                  let deviceSeries = Object.keys(snapshot.val());
                  if (deviceSeries.length == 1) {
                    window.fa.firebaseDatabase
                        .child(selectDeviceType.value)
                          .child(selectDeviceBrand.value).set('').then(function (snapshot) {
                      deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                    });
                  } else {
                    window.fa.firebaseDatabase
                        .child(selectDeviceType.value)
                          .child(selectDeviceBrand.value)
                            .child(selectDeviceSeries.value).remove().then(function (snapshot) {
                      deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                    });
                  }
                });
        }
      } else if ($closestParent.hasClass('model')) {
        if (confirm("Delete model: " + selectDeviceModel.value + "?")) {
          window.fa.firebaseDatabase
              .child(selectDeviceType.value)
                .child(selectDeviceBrand.value)
                  .child(selectDeviceSeries.value).once('value', function (snapshot) {
                    let deviceSeries = Object.keys(snapshot.val());
                    if (deviceSeries.length == 1) {
                      window.fa.firebaseDatabase
                          .child(selectDeviceType.value)
                            .child(selectDeviceBrand.value)
                              .child(selectDeviceSeries.value).set('').then(function (snapshot) {
                        deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                      });
                    } else {
                      window.fa.firebaseDatabase
                          .child(selectDeviceType.value)
                            .child(selectDeviceBrand.value)
                              .child(selectDeviceSeries.value)
                                .child(selectDeviceModel.value).remove().then(function (snapshot) {
                        deleteDeviceDetailSuccess($selectElement, $selectElement.val());
                      });
                    }
                  });
        }
      }
    }
  });

  selectDeviceType.addEventListener('change', function (evt) {
    resetSelectBox(selectDeviceBrand , 'Select Brand');
    $(selectDeviceBrand ).closest('.input-group').addClass('disabled');
    resetSelectBox(selectDeviceSeries, 'Select Series');
    $(selectDeviceSeries).closest('.input-group').addClass('disabled');
    resetSelectBox(selectDeviceModel, 'Select Model');
    $(selectDeviceModel).closest('.input-group').addClass('disabled');
    if (evt.target.value) {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').removeClass('disabled');
      let brandTypes = Object.keys(window.fa.data.availableDevicesTree[evt.target.value]);
      window.fa.data.currentSelection.type = evt.target.value;
      window.populateSelectBox(selectDeviceBrand , brandTypes, 'Select Brand');
      $(selectDeviceBrand)
                  .closest('.input-group').removeClass('disabled')
                    .find('.glyphicon-remove').addClass('disabled');
    } else {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').addClass('disabled');
    }
  });
  selectDeviceBrand.addEventListener('change', function (evt) {
    resetSelectBox(selectDeviceSeries, 'Select Series');
    $(selectDeviceSeries).closest('.input-group').addClass('disabled');
    resetSelectBox(selectDeviceModel, 'Select Model');
    $(selectDeviceModel).closest('.input-group').addClass('disabled');
    if (evt.target.value) {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').removeClass('disabled');
      let arrSeries = Object.keys(window.fa.data.availableDevicesTree[selectDeviceType.value][evt.target.value]);
      window.fa.data.currentSelection.brand = evt.target.value;
      window.populateSelectBox(selectDeviceSeries, arrSeries, 'Select Series');
      $(selectDeviceSeries)
                  .closest('.input-group').removeClass('disabled')
                    .find('.glyphicon-remove').addClass('disabled');
    } else {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').addClass('disabled');
    }
  });
  selectDeviceSeries.addEventListener('change', function (evt) {
    resetSelectBox(selectDeviceModel, 'Select Model');
    $(selectDeviceModel).closest('.input-group').addClass('disabled');
    if (evt.target.value) {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').removeClass('disabled');
      let arrModel = Object.keys(window.fa.data.availableDevicesTree[selectDeviceType.value][selectDeviceBrand .value][evt.target.value]);
      window.fa.data.currentSelection.series = evt.target.value;
      window.populateSelectBox(selectDeviceModel, arrModel, 'Select Model');
      $(selectDeviceModel)
                  .closest('.input-group').removeClass('disabled')
                    .find('.glyphicon-remove').addClass('disabled');
    } else {
      $(evt.target).closest('.input-group').find('.glyphicon-remove').addClass('disabled');
    }
  });
  selectDeviceModel.addEventListener('change', function (evt) {
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
}
