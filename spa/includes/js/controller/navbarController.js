document.body.navbarController = function() {
  if ( document.body.user ) {
    document.getElementById('loggedInUser').innerText = document.body.user.name;
    if (document.body.user.email) {
      document.getElementById('loggedInUser').parentNode.title = document.body.user.email;
    }
  }
}

let logout = function() {
  popupAlert('Logged out successfully. See you soon...!!','Logout');
  //reset global resources here
  document.body.user = undefined;
  document.body.history = undefined;
  window.location.hash = "#login";
}
