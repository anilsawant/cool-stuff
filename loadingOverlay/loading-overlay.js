/**
 * Function to display the 'Loading... animation' in a HTML element(elm)
 * It accepts the parent element in which 'Loading... animation' is to be shown as an argument.
 * Creates and Appends the 'Loading... animation' to the parent 'elm'
 *
 * @param elm. The element on which 'loading...' has to be shown
 */
function displayLoading( elm , msg) {
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
