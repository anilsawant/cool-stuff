window.notification = {
  /**
   * Function to display a 'Win10 style notification' in the HTML body-element
   * Creates and Appends the 'Notification' to the body. The notification slides in/out from the right-bottom corner.
   * Important Note: Multiple notifications are queued and displayed one after another.
   * @param msg as String. It is the message to be displayed
   */
  "showWin10Style": function (msg) {
    if (msg) {
      window.notification.showWin10Style.msgQueue.push(msg);
      if (window.notification.showWin10Style.msgQueue.length == 1) {
        window.notification.showWin10Style.show(window.notification.showWin10Style.msgQueue[0]);
      }
    }
  },
  /**
   * Function to display a 'Material Design style notification' in the HTML body-element
   * Creates and Appends the 'Notification' to the body. The notification floats down from the right-top corner.
   * @param msg as String. It is the message to be displayed
   * @param time as Number. It is the msg timeout
   */
  "showMDStyle": function (msg, time) {
    if (msg) {
      let mdlMsg = document.createElement('span');
      mdlMsg.style.backgroundColor='#333';mdlMsg.style.borderRadius='2px';mdlMsg.style.color='#fff';mdlMsg.style.display='inline-block';
      mdlMsg.style.fontFamily='verdana';mdlMsg.style.padding='8px 20px 10px';mdlMsg.style.position='fixed';mdlMsg.style.marginTop=0;
      mdlMsg.style.opacity=0;mdlMsg.style.right='20px';mdlMsg.style.top=0;mdlMsg.style.transition='margin-top 300ms linear, opacity 200ms linear';
      mdlMsg.innerHTML = `<span style="color:#0af;margin-right:15px;">&#9993;</span><span>${msg}</span>`;
      document.body.appendChild(mdlMsg);
      setTimeout(function () {
        mdlMsg.style.marginTop='50px';mdlMsg.style.opacity=1;
      }, 10);
      setTimeout(function () {
        mdlMsg.style.marginTop=0;mdlMsg.style.opacity=0;
        setTimeout(function () {
          document.body.removeChild(mdlMsg)
        }, 300);
      }, time || 2000);
    }
  },
  /**
   * Function to display a 'Message Banner' in the HTML body-element
   * Creates and Appends the 'Msg Banner' to the body
   * @param msg as String. It is the message to be displayed
   * @param type as String. It can be 'success', 'warning', or 'error'
   */
  "showMsgBanner": function (msg, type) {
  	if (msg) {
      let msgContainer = document.createElement('div');
    	msgContainer.className = 'msg-container';;
    	msgContainer.innerHTML = '<span class="msg">' + msg + '</span><span class="close-msg">&times;</span>';
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
    		default:
          msgContainer.className += ' default';
          break;
      }
    	setTimeout(function () {
    		msgContainer.style.opacity = 1;
    	}, 10);
  	}
  }
}
window.notification.showWin10Style.msgQueue = [];
window.notification.showWin10Style.show = function (msg) {
  let notfContainer = document.createElement('div');
  notfContainer.style.backgroundColor =  '#555';notfContainer.style.bottom =  '100px';notfContainer.style.border =  '1px solid #555';
  notfContainer.style.borderRight =  'none';notfContainer.style.boxShadow =  '0 0 5px #555, inset 1px 1px 0 #777, inset -1px 0 0 #777';
  notfContainer.style.cursor =  'pointer';notfContainer.style.padding =  '5px 10px 5px 5px';notfContainer.style.position =  'fixed';
  notfContainer.style.right =  '-220px';notfContainer.style.transition = 'right 0.5s cubic-bezier(0, 0.73, 0.24, 1.2)';
  notfContainer.style.width =  '200px';notfContainer.style.zIndex =  100;
  let notificationSound = document.createElement('audio');
  notificationSound.style.display = 'none';notificationSound.setAttribute('autoplay', true);notificationSound.src = 'notify.wav';
  notfContainer.appendChild(notificationSound);
  let notfBody = document.createElement('div');
  notfBody.style.border = '1px solid #666';notfBody.style.boxShadow = 'inset 0 0 3px #666';notfBody.style.display = 'flex';
  notfBody.style.minHeight = '60px';notfBody.style.padding = '5px';notfBody.style.width = '200px';
  let notification = document.createElement('div');
  notification.style.backgroundColor = '#575757';notification.style.color = '#f2f2f2';notification.style.fontFamily = 'monospace';
  notification.style.margin = 'auto';notification.style.padding = '3px';notification.style.textAlign = 'center';
  notification.innerText = msg;

  notfBody.appendChild(notification);
  notfContainer.appendChild(notfBody)
  document.body.appendChild(notfContainer);
  setTimeout(function () {
    notfContainer.style.right = '-10px';
  }, 10);//show the notification
  setTimeout(function () {
    notfContainer.style.transition =  'right .5s ease';
    notfContainer.style.right = '-220px';
    setTimeout(function () {
      document.body.removeChild(notfContainer);
      if (window.notification.showWin10Style.msgQueue.length) {
        window.notification.showWin10Style.msgQueue.splice(0,1);
        if (window.notification.showWin10Style.msgQueue.length) {
          window.notification.showWin10Style.show(window.notification.showWin10Style.msgQueue[0]);
        }
      };
    }, 500);//remove after the transition completes
  }, 5000);//hide after 5s
}
