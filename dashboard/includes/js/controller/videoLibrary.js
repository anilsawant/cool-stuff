
let init = function () {
  main();
};



let main = function () {

  window.fa.deviceManager.dom.selectDeviceType = addDeviceCard.querySelector('.select-device.type');
  window.fa.deviceManager.dom.selectDeviceBrand = addDeviceCard.querySelector('.select-device.brand');
  window.fa.deviceManager.dom.selectDeviceSeries = addDeviceCard.querySelector('.select-device.series');
  window.fa.deviceManager.dom.selectDeviceModel = addDeviceCard.querySelector('.select-device.model');

  setupUploadVideoFeature();
  resetVideoViewSelection();
  resetDeviceManager();
}

let resetDeviceManager = function () {
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceType, 'Select Type');
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceBrand , 'Select Brand');
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceSeries, 'Select Series');
    resetSelectBox(window.fa.deviceManager.dom.selectDeviceModel, 'Select Model');
    $(window.fa.deviceManager.dom.addDeviceCard)
            .find('.input-group').addClass('disabled')
              .find('.glyphicon-remove').addClass('disabled');;
}
