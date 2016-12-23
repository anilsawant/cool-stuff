if(!document.body.controllers)
  document.body.controllers = {};

document.body.controllers.loginController = function() {
  let btnLogin = document.getElementById('btnLogin'),
      txtLoginId = document.getElementById('txtLoginId'),
      txtPassword = document.getElementById('txtPassword'),
      rememberMe = document.getElementById('rememberMe'),
      loginCard = document.querySelector('.login-card');

  if (window.localStorage.getItem('faVideoLibraryUserId')) {
    txtLoginId.value = window.localStorage.getItem('faVideoLibraryUserId');
    rememberMe.className = "fa fa-check-square-o";
  }

  btnLogin.addEventListener('click', function() {
    let errMsgs = [],
        finalErrMsg = "";
    if (!txtLoginId.value.trim())
      errMsgs.push("Admin ID");
    if (!txtPassword.value.trim())
      errMsgs.push("Password");

    for (var i = 0; i < errMsgs.length; i++) {
      if (i == 0)
        finalErrMsg = "Kindly enter "
      finalErrMsg += errMsgs[i];
      i == errMsgs.length-1 ? finalErrMsg += "." : finalErrMsg += ", " ;
    }
    if (finalErrMsg) {
      showMsgBanner(finalErrMsg, "error");
    } else {
      btnLogin.style.pointerEvents = 'none';
      // $.ajax({
      //   "method": "POST",
      //   "url": "/faservicewi/service/loginDetails/authenticateUser",
      //   "contentType": "application/json",
      //   "dataType": "json",
      //   "data": JSON.stringify({
      //     "loginid": txtLoginId.value,
      //     "password": txtPassword.value,
      //     "usertype": "Admin"
      //   }),
      //   "processData": false
      // })
      // .done(function( data ) {
      //   btnLogin.style.pointerEvents = 'all';
      //   if (data.result.toUpperCase() == "SUCCESS") {
      //     if (rememberMe.className.includes('fa-check-square-o')) {
      //       window.localStorage.setItem('faVideoLibraryUserId', txtLoginId.value);
      //     } else {
      //       window.localStorage.removeItem('faVideoLibraryUserId');
      //     }
      //     //set user after authentication
      //     let user = {
      //       "name": data.displayname,
      //       "loginId": data.loginid,
      //       "role": data.role,
      //       "skill": data.skill
      //     }
      //     window.sessionStorage.setItem('faVideoLibraryUser', JSON.stringify(user));
      //     loadNavbar({
      //       "html": "navbar.html",
      //       "controller": "navbarController"
      //     }, function() {
      //       if( document.body.history && document.body.history.previousHash ){
      //         window.location.hash = document.body.history.previousHash;
      //       }else {
      //         window.location.hash = "#home";
      //       }
      //     });
      //   } else if (data.result.toUpperCase() == "NOTFOUND" || data.result.toUpperCase() == "FAILURE") {
      //     console.log(data);
      //     txtPassword.value = '';
      //     alert("Invalid Admin ID or Password. Kindly Retry.");
      //   }
      // })
      // .fail(function (err) {
      //   console.error('Login request failed.', err);
      //   btnLogin.style.pointerEvents = 'all';
      //   alert("We are currently unable to Log you in. Kindly try after some time.");
      // });


      //Dev code
      window.location.hash = "#home";
      window.sessionStorage.setItem('faAdmin', JSON.stringify({"name":"Anil Sawant"}));
      // End Dev code

    }
  });

  loginCard.addEventListener('keypress', function (evt) {
    if (evt.which == 13) {
      btnLogin.click();
    }
  });
}
