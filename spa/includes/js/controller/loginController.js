document.body.loginController = function() {
  let btnLogin = document.getElementById('btnLogin');
  let emailId = document.getElementById('txtEmailId');
  let password = document.getElementById('txtPassword');
  let error = document.getElementById('error');

  btnLogin.addEventListener('click', function() {
    let validEntries = 0;
    if (!emailId.value) {
      emailId.style.boxShadow = '0 0 20px red';
      emailId.style.border = '1px solid red';
    } else {
      emailId.style.boxShadow = '0 0 20px limegreen';
      validEntries++;
    }
    if (!password.value) {
      password.style.boxShadow = '0 0 20px red';
      password.style.border = '1px solid red';
    } else {
      password.style.boxShadow = '0 0 20px limegreen';
      validEntries++;
    }

    if ( validEntries === 2 ) {
      error.querySelector('#error-msg').innerText = '';
      $(error).fadeOut();

      //set user after authentication
      document.body.user = {
        "name": "User ",
        "email": "username@org.com"
      }
      loadNavbar({
        "html": "navbar.html",
        "controller": "navbarController"
      }, function() {
        if( document.body.history && document.body.history.previousHash ){
          window.location.hash = document.body.history.previousHash;
        }else {
          window.location.hash = "#home";
        }
      });
    } else {
      error.querySelector('#error-msg').innerText = 'Kindly fill the highlighted field(s).'
      $(error).fadeIn();
    }
  });
}
