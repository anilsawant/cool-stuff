
function showInModal( clickedImg ) {
  var modal = document.getElementById('modal');
  modal.style.display = 'block';
  setTimeout(function() {
    modal.style.opacity = '1';
  },20);

  var modalChildren = modal.children;
  for (var i = 0; i < modalChildren.length; i++) {
    if (modalChildren[i].tagName.toUpperCase() == 'IMG' ) {
      modalChildren[i].src = clickedImg.src;
    } else if ( modalChildren[i].tagName.toUpperCase() == 'P' ) {
       modalChildren[i].innerHTML = clickedImg.nextElementSibling.innerHTML;
    }
  }
}
function fadeOutModal( evt ) {
  var modal = evt.target.parentElement;
  modal.style.opacity = '0';
  setTimeout( function() {
    modal.style.display = 'none';
  },1000);

}
