function popupMsg( evt ) {
  console.dir( evt );
  var popupMsg = document.getElementById('popupMsg');
  console.log(evt.clientX, evt.clientY);
  popupMsg.style.top = (evt.target.offsetHeight + evt.target.offsetTop) + 'px';
  popupMsg.style.left = evt.target.offsetLeft + 'px';
  popupMsg.style.display = 'block';
}
