/**
@author Anil Sawant <anilsawant241191@gmail.com>
*/
let popupAlert = function(msg, about, done) {
  let popupOverlay = document.createElement('div');
  popupOverlay.className = 'popupOverlay';
  popupOverlay.id = 'popupOverlay';
  let flexContainer = '<div class="flex-container-center"><div class="popup-box">'
                      +  '<p class="popup-title">Alert Title</p><p class="popup-body">Alert body</p>'
                      +  '<div class="popup-footer">'
                      +  '</div></div></div>';
  popupOverlay.innerHTML = flexContainer;
  popupOverlay.tabIndex = 1;
  popupOverlay.addEventListener('keydown', function(evt) {
    evt.preventDefault();
    if (evt.which === 13) {
      if (typeof done === 'function')
        done(true);
      donePopup();
    } else if (evt.which === 27) {
      if (typeof done === 'function')
        done(false);
      donePopup();
    }
  });

  let btnOk = document.createElement('button');
  btnOk.className = 'btn btn-success btnOk';
  btnOk.innerText = 'Ok';
  btnOk.addEventListener('click', function(evt) {
    if (typeof done === 'function')
      done(true);
    donePopup();
  });
  popupOverlay.querySelector('.popup-footer').appendChild(btnOk);
  document.body.appendChild( popupOverlay );
  popupOverlay.querySelector('.popup-title').innerText = 'Alert';
  if (about)
    popupOverlay.querySelector('.popup-title').innerText = about;
  if (!msg)
    msg = 'Click Ok to dismiss the alert.';
  popupOverlay.querySelector('.popup-body').innerText = msg;
  popupOverlay.style.display = 'block';
  setTimeout(function () {
    popupOverlay.style.opacity = '1';
    popupOverlay.querySelector('.popup-box').style.transform = 'scale(1)';
    btnOk.focus();
  }, 10);

  let donePopup = function() {
    popupOverlay.querySelector('.popup-box').style.transform = 'scale(0)';
    popupOverlay.style.opacity = '0';
    setTimeout(function () {
      if (document.getElementById('popupOverlay'))
        document.body.removeChild(popupOverlay);
    }, 500);
  }
}

let popupConfirm = function(msg, about, done) {
  let popupOverlay = document.createElement('div');
  popupOverlay.className = 'popupOverlay';
  popupOverlay.id = 'popupOverlay';
  let flexContainer = '<div class="flex-container-center"><div class="popup-box">'
                      +  '<p class="popup-title">Alert Title</p><p class="popup-body">Alert body</p>'
                      +  '<div class="popup-footer">'
                      +  '</div></div></div>';
  popupOverlay.innerHTML = flexContainer;
  popupOverlay.tabIndex = 1;
  popupOverlay.addEventListener('keydown', function(evt) {
    evt.preventDefault();
    if (evt.which === 13) {
      if (typeof done === 'function')
        done(true);
      donePopup();
    } else if (evt.which === 27) {
      if (typeof done === 'function')
        done(false);
      donePopup();
    }
  });

  let btnOk = document.createElement('button');
  btnOk.className = 'btn btn-success btnOk';
  btnOk.innerText = 'Ok';
  btnOk.addEventListener('click', function() {
    if (typeof done === 'function')
      done(true);
    donePopup();
  });
  let btnCancel = document.createElement('button');
  btnCancel.className = 'btn btn-danger btnCancel';
  btnCancel.innerText = 'Cancel';
  btnCancel.addEventListener('click', function() {
    if (typeof done === 'function')
      done(false);
    donePopup();
  });
  popupOverlay.querySelector('.popup-footer').appendChild(btnOk);
  popupOverlay.querySelector('.popup-footer').appendChild(btnCancel);
  document.body.appendChild( popupOverlay );
  popupOverlay.querySelector('.popup-title').innerText = 'Confirm';
  if (about)
    popupOverlay.querySelector('.popup-title').innerText = about;
  if (msg){
    if ( !msg.endsWith('?'))
      msg += '?';
  } else {
    msg = 'Click Ok to dismiss the Confirm.';
  }
  popupOverlay.querySelector('.popup-body').innerText = msg;
  popupOverlay.style.display = 'block';
  setTimeout(function () {
    popupOverlay.style.opacity = '1';
    popupOverlay.querySelector('.popup-box').style.transform = 'scale(1)';
    btnOk.focus();
  }, 10);

  let donePopup = function() {
    popupOverlay.querySelector('.popup-box').style.transform = 'scale(0)';
    popupOverlay.style.opacity = '0';
    setTimeout(function () {
      if (document.getElementById('popupOverlay'))
        document.body.removeChild(popupOverlay);
    }, 500);
  }
}

let popupPrompt = function(msg, about, done) {
  let popupOverlay = document.createElement('div');
  popupOverlay.className = 'popupOverlay';
  popupOverlay.id = 'popupOverlay';
  let flexContainer = '<div class="flex-container-center"><div class="popup-box">'
                      +  '<p class="popup-title">Alert Title</p>'
                      +  '<p class="popup-body">Alert body</p>'
                      +  '<div class="popup-footer">'
                      +  '</div></div></div>';
  popupOverlay.innerHTML = flexContainer;
  popupOverlay.tabIndex = 1;

  let txtInput = document.createElement('input');
  txtInput.className = 'form-control';

  popupOverlay.addEventListener('keydown', function(evt) {
    evt.preventDefault();
    if (evt.which === 13) {
      if (typeof done === 'function')
        done(txtInput.value);
      donePopup();
    } else if (evt.which === 27) {
      if (typeof done === 'function')
        done(false);
      donePopup();
    }
  });

  let btnOk = document.createElement('button');
  btnOk.className = 'btn btn-success btnOk';
  btnOk.innerText = 'Ok';
  btnOk.addEventListener('click', function() {
    if (typeof done === 'function')
      done(txtInput.value);
    donePopup();
  });
  popupOverlay.querySelector('.popup-footer').appendChild(btnOk);

  let btnCancel = document.createElement('button');
  btnCancel.className = 'btn btn-danger btnCancel';
  btnCancel.innerText = 'Cancel';
  btnCancel.addEventListener('click', function() {
    if (typeof done === 'function')
      done(false);
    donePopup();
  });

  popupOverlay.querySelector('.popup-footer').appendChild(btnCancel);
  document.body.appendChild( popupOverlay );
  popupOverlay.querySelector('.popup-title').innerText = 'Prompt';
  if (about)
    popupOverlay.querySelector('.popup-title').innerText = about;
  if (!msg)
    msg = 'Click Ok to dismiss the Prompt.';
  popupOverlay.querySelector('.popup-body').innerText = msg;

  popupOverlay.querySelector('.popup-body').appendChild(txtInput);
  popupOverlay.style.display = 'block';
  setTimeout(function () {
    popupOverlay.style.opacity = '1';
    popupOverlay.querySelector('.popup-box').style.transform = 'scale(1)';
    txtInput.focus();
  }, 10);

  let donePopup = function() {
    popupOverlay.querySelector('.popup-box').style.transform = 'scale(0)';
    popupOverlay.style.opacity = '0';
    setTimeout(function () {
      if (document.getElementById('popupOverlay'))
        document.body.removeChild(popupOverlay);
    }, 500);
  }
}
