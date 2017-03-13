window.onload = function() {

  let btnLogin = document.getElementById('btnLogin'),
      txtLoginId = document.getElementById('txtLoginId'),
      txtPassword = document.getElementById('txtPassword'),
      rememberMe = document.getElementById('rememberMe'),
      loginCard = document.querySelector('.login-card');

  if (window.localStorage.getItem('faAdminPortalId')) {
    txtLoginId.value = window.localStorage.getItem('faAdminPortalId');
    rememberMe.className = "fa fa-check-square-o";
  }

  btnLogin.addEventListener('click', function() {
    let validEntries = 0;
    if (txtLoginId.value && txtLoginId.value.trim()) {
      validEntries++;
    }
    if (txtPassword.value) {
      validEntries++;
    }

    if ( validEntries === 2 ) {
      btnLogin.style.pointerEvents = 'none';
      $.ajax({
        "method": "POST",
        "url": "/GSMCServices/service/loginDetails/authenticateUser",
        "contentType": "application/json",
        "dataType": "json",
        "data": JSON.stringify({
          "appVersion": "1.01",
          "loginId": txtLoginId.value,
          "password": txtPassword.value,
          "role": "ADMIN"
        }),
        "processData": false
      })
      .done(function( data ) {
        console.log(data);
        btnLogin.style.pointerEvents = 'all';
        if (data.result.toUpperCase() == "SUCCESS") {
          if (rememberMe.className.includes('fa-check-square-o')) {
            window.localStorage.setItem('faAdminPortalId', txtLoginId.value);
          } else {
            window.localStorage.removeItem('faAdminPortalId');
          }
          //set user after authentication
          let user = {
            "name": 'ADMIN',
            "loginId": data.loginId,
            "role": 'ADMIN',
          }
          window.sessionStorage.setItem('faAdmin', JSON.stringify(user));
          window.location.href = 'library.html';
        } else {
          console.log(data);
          txtPassword.value = '';
          alert("Invalid Admin ID or Password. Kindly Retry.");
        }
      })
      .fail(function (err) {
        console.error('Login request failed.', err);
        btnLogin.style.pointerEvents = 'all';
        alert("We are currently unable to Log you in. Kindly try after some time.");
      });
    } else {
      alert('Kindly enter Admin Id and Password.');
    }
  });

  loginCard.addEventListener('keypress', function (evt) {
    if (evt.which == 13) {
      btnLogin.click();
    }
  });
}
