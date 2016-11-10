/**
 * Function to display a 'Message Banner' in the HTML body-element
 * It accepts a 'msg' and its 'type' as arguments.
 * Creates and Appends the 'Msg Banner' to the body
 *
 * @param msg as String. It is the message to be displayed
 * @param type as String. It can be 'success', 'warning', or 'error'
 */
let showMsgBanner = function (msg, type) {
	let msgContainer = document.createElement('div');
	msgContainer.className = 'msg-container';;
	msgContainer.innerHTML = '<span class="close-msg">&times;</span><span class="msg">' + msg + '</span>';
	document.body.appendChild(msgContainer);
	let timeoutHandle = setTimeout(function () {
		document.body.removeChild(msgContainer)
	}, 5000);// clear the banner after 5s
	msgContainer.addEventListener('click', function (evt) {
		if (evt.target.className.includes('close-msg')) {
			clearTimeout(timeoutHandle);
			document.body.removeChild(msgContainer)
		}
	});
	type = type ? type.toUpperCase() : 'DEFAULT';
  switch (type) {
    case "DEFAULT":
      msgContainer.className += ' default';
      break;
    case "PRIMARY":
			msgContainer.className += ' primary';
      break;
    case "SUCCESS":
			msgContainer.className += ' success';
			break;
		case "INFO":
			msgContainer.className += ' info';
      break;
    case "WARNING":
			msgContainer.className += ' warning';
      break;
    case "ERROR":
			msgContainer.className += ' error';
      break;
  }
	setTimeout(function () {
		msgContainer.style.opacity = 1;
	}, 10);
};


/**
 * Function to display a 'Win10 style notification' in the HTML body-element
 * It accepts a 'msg' as an argument.
 * Creates and Appends the 'Notification' to the body. The notification slides in/out from the right-bottom corner.
 * Important Note: Multiple notifications are queued and displayed one after other.
 * @param msg as String. It is the message to be displayed
 */
window.showNotification = function (msg) {
  window.showNotification.msgQueue.push(msg);
  if (window.showNotification.msgQueue.length == 1) {
    window.showNotification.show(window.showNotification.msgQueue[0]);
  }
};
window.showNotification.msgQueue = [];
window.showNotification.show = function (msg) {
  let notfContainer = document.createElement('div');
  notfContainer.style.backgroundColor =  '#555';notfContainer.style.bottom =  '100px';notfContainer.style.border =  '1px solid #555';
  notfContainer.style.borderRight =  'none';notfContainer.style.boxShadow =  '0 0 5px #555, inset 1px 1px 0 #777, inset -1px 0 0 #777';
  notfContainer.style.cursor =  'pointer';notfContainer.style.padding =  '5px 10px 5px 5px';notfContainer.style.position =  'fixed';
  notfContainer.style.right =  '-320px';notfContainer.style.transition = 'right 0.5s cubic-bezier(0, 0.73, 0.24, 1.2)';
  notfContainer.style.width =  '300px';notfContainer.style.zIndex =  100;
  let notificationSound = document.createElement('audio');
  notificationSound.style.display = 'none';notificationSound.setAttribute('autoplay', true);notificationSound.src = 'notify.wav';
  notfContainer.appendChild(notificationSound);
  let notfBody = document.createElement('div');
  notfBody.style.border = '1px solid #666';notfBody.style.boxShadow = 'inset 0 0 3px #666';notfBody.style.display = 'flex';
  notfBody.style.minHeight = '60px';notfBody.style.padding = '5px';notfBody.style.width = '300px';
  let notification = document.createElement('div');
  notification.style.backgroundColor = '#575757';notification.style.color = '#f2f2f2';notification.style.fontFamily = 'monospace';
  notification.style.margin = 'auto';notification.style.padding = '3px 12px 3px 3px';notification.style.textAlign = 'center';
  notification.innerText = msg;

  notfBody.appendChild(notification);
  notfContainer.appendChild(notfBody)
  document.body.appendChild(notfContainer);
  setTimeout(function () {
    notfContainer.style.right = '-10px';
  }, 10);//show the notification
  setTimeout(function () {
    notfContainer.style.transition =  'right .5s ease';
    notfContainer.style.right = '-320px';
    setTimeout(function () {
      document.body.removeChild(notfContainer);
      if (window.showNotification.msgQueue.length) {
        window.showNotification.msgQueue.splice(0,1);
        if (window.showNotification.msgQueue.length) {
          window.showNotification.show(window.showNotification.msgQueue[0]);
        }
      };
    }, 500);//remove after the transition completes
  }, 5000);//hide after 5s
}
