/**
 * Function to display the 'Loading... animation' in a HTML element(elm)
 * It accepts the parent element in which 'Loading... animation' is to be shown as an argument.
 * Creates and Appends the 'Loading... animation' to the parent 'elm'
 *
 * @param elm. The element on which 'loading...' has to be shown
 */
function displayLoading(elm, msg) {
	if (elm) {
		if( !elm.querySelector('.loading-outer') ) {
			var loadingOuter = document.createElement('div');
			loadingOuter.setAttribute( 'class',"loading-outer" );
			var loading = document.createElement('div');
			loading.setAttribute( 'class', "loading spin-acw" );//add class spin-acw or spin-cw
			loadingOuter.appendChild( loading );
			if (msg) {
				let msgP = document.createElement('p');
				msgP.setAttribute( 'class',"loading-text" );
				msgP.textContent = msg;
				loadingOuter.appendChild( msgP );
			}
			elm.appendChild( loadingOuter );
			let computedStyles = window.getComputedStyle( elm );
			elm.style.originalPosition = computedStyles['position'] || computedStyles.getPropertyValue('position' );
			if(elm.style.originalPosition !== 'absolute' && elm.style.originalPosition !== 'fixed')
				elm.style.position = 'relative';
  			setTimeout(function () {
  				loadingOuter.style.opacity = 1;
  			}, 10);
		} else {
			var loadingOuter = elm.querySelector('.loading-outer');
			setTimeout(function () {
				loadingOuter.style.opacity = 1;
			}, 10);
		}
	} else {
		console.log('Incorrect Usage: pass the parent element as argument to displayLoading(elm)');
	}
}
/**
 * Function to hide the 'Loading... animation'
 * It also removes the 'Loading... animation' elements from the DOM
 *
 * @param elm
 */
function doneLoading( elm ) {
	var loadingOuter;
	if (elm) {
		loadingOuter = elm.querySelector('.loading-outer');
		if( loadingOuter ) {
			loadingOuter.style.opacity = 0;
			setTimeout(function () {
				loadingOuter = elm.querySelector('.loading-outer');
				elm.style.position = '';
				if( loadingOuter )
					elm.removeChild( loadingOuter );
			}, 1000);
		}
	}
}

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
	}, 5000);// clear the msg banner after 5s
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
};
