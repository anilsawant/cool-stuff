window.onload = function () {
  let dragContainer = document.querySelector('.drag-container'),
      txtNewTagName = document.querySelector('.txt-new-tag-name'),
      btnAddNewTag = document.querySelector('.btn-add-new-tag'),
      btnSearchLibrary = document.querySelector('.btn-search-library');

  dragContainer.searchQuery = '';
  dragContainer.addEventListener('dragstart', function (evt) {
    dragContainer.draggedTag = evt.target;
  });
  dragContainer.addEventListener('dragover', function (evt) {
    evt.preventDefault();//to allow drop
  });
  dragContainer.addEventListener('drop', function (evt) {
    if (evt.target.className.includes('search-query')) {
      let searchQueryTags = dragContainer.querySelectorAll('.search-query .tag');
      for (tag of searchQueryTags) {
        if (tag.textContent == dragContainer.draggedTag.textContent) {
          return;
        }
      }
      evt.target.appendChild(dragContainer.draggedTag.cloneNode(true));
    } else if (evt.target.className.includes('delete-tag') || evt.target.className.includes('glyphicon-trash')) {
      dragContainer.draggedTag.parentNode.removeChild(dragContainer.draggedTag);
    }
  });

  txtNewTagName.addEventListener('keypress', function (evt) {
    if (evt.which == 13) {
      addANewSearchTag(txtNewTagName.value.trim());
      txtNewTagName.value = '';
    }
  });
  btnAddNewTag.addEventListener('click', function () {
    addANewSearchTag(txtNewTagName.value.trim());
    txtNewTagName.value = '';
  });
  btnSearchLibrary.addEventListener('click', function () {
    let searchQuery = txtNewTagName.value.trim().toLowerCase();
    if (searchQuery) {

    }
  });
  initializeFirebase();
}
let addANewSearchTag = function (tagText) {
  if (tagText) {
    let searchQueryTags = document.querySelectorAll('.search-query .tag');
    for (tag of searchQueryTags) {
      if (tag.textContent.toLowerCase() == tagText.toLowerCase()) {
        return;
      }
    }
    let newTag = document.createElement('span');
    newTag.className = 'tag';
    newTag.setAttribute('draggable', true);
    newTag.textContent = tagText.toLowerCase();
    document.querySelector('.tags.search-query').appendChild(newTag);
  }
}
let initializeFirebase = function () {
  // var config = {
  //   apiKey: "AIzaSyDO46qVEVs9Q_IjTygBBMWIbLgxZ7xMeEc",
  //   authDomain: "gsmc-field-assist-d7998.firebaseapp.com",
  //   databaseURL: "https://gsmc-field-assist-d7998.firebaseio.com",
  //   storageBucket: "gsmc-field-assist-d7998.appspot.com",
  //   messagingSenderId: "516065559593"
  // };

  var config = {
    apiKey: "AIzaSyDF-66BiXEJQguw7vQJ7KT8MwJmRUOwWFI",
    authDomain: "demogsmc-fieldassist.firebaseapp.com",
    databaseURL: "https://demogsmc-fieldassist.firebaseio.com",
    storageBucket: "demogsmc-fieldassist.appspot.com",
    messagingSenderId: "829890022129"
  };

  if(!window.firebaseApp) {
    window.firebaseApp = firebase.initializeApp(config);
    window.fbDbResourcesRef = firebase.database().ref('resources');
    window.fbStResourcesRef = firebase.storage().ref('resources');
    window.fbDbResourcesRef.once('value', function (snapshot) {
      window.libraryIndex = snapshot.val();
      console.log("window.libraryIndex", window.libraryIndex);
    });
  }
};
