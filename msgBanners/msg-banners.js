
/* ************** Messages scriptlet *************** */
let showMsgBanner = function (msg, type) {
	let $msgContainer = $('<div class="msg-container" style="display:none;"> \
							            <span class="close-msg">&times;</span> \
							            <span class="msg">This is a msg</span> \
							          </div>');
	$(document.body).append($msgContainer);
	$msgContainer.on('click', function (evt) {
		if (evt.target.className.includes('close-msg')) {
			$msgContainer.remove();
		}
	});
  $msgContainer.find('.msg').text(msg);
  switch (type.toUpperCase()) {
    case "SUCCESS":
      $msgContainer.removeClass('error warning').addClass('success').fadeIn(function () {
        setTimeout(function () {
          $msgContainer.remove();
        }, 5000);
      });
      break;
    case "ERROR":
      $msgContainer.removeClass('success warning').addClass('error').fadeIn(function () {
        setTimeout(function () {
          $msgContainer.remove();
        }, 10000);
      });
      break;
    case "WARNING":
      $msgContainer.removeClass('error success').addClass('warning').fadeIn(function () {
        setTimeout(function () {
          $msgContainer.remove();
        }, 10000);
      });
      break;
  }
};
