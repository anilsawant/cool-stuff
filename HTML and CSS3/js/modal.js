
function fadeInModal() {
  var modal = document.getElementById('modal');
  modal.style.display = 'block';
  setTimeout(function() {
    modal.style.opacity = '.9';
  },20);

}
function fadeOutModal( evt ) {
  var modal = evt.target.parentElement;
  modal.style.opacity = '0';
  setTimeout( function() {
    modal.style.display = 'none';
  },1000);

}

function dropDownModal() {
  var droppingModal = document.getElementById('droppingModal');
  droppingModal.style.display = 'block';
  setTimeout(function() {
    droppingModal.style.marginTop = '0';
  },20);
}
function dropOutModal( evt ) {
  var modal = evt.target.parentElement;
  modal.style.marginTop = '-100%';
  setTimeout( function() {
    modal.style.display = 'none';
  },600);

}

function bouncingDropModal() {
  var bouncingDropModal = document.getElementById('bouncingDropModal');
  var modalContainer = document.getElementById('modalContainer');
  modalContainer.style.display = "block";
  bouncingDropModal.style.display = 'block';
  setTimeout(function() {
    bouncingDropModal.style.marginTop = '0';
  },20);
}
function bouncingDropOutModal( evt ) {
  var modal = evt.target.parentElement;
  modal.style.marginTop = '-100%';
  setTimeout( function() {
    modal.style.display = 'none';
    modal.parentElement.style.display = "none";
  },600);

}


function growInModal() {
  var modal = document.getElementById('growingModal');
  modal.style.display = 'block';
  setTimeout(function() {
    modal.style.transform = 'scale(1)';
  },20);

}
function growOutModal( evt ) {
  var modal = evt.target.parentElement;
  modal.style.transform = 'scale(0)';
  setTimeout( function() {
    modal.style.display = 'none';
  },1000);

}
