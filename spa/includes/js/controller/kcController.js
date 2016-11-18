document.body.kcController = function() {
  let selectInputType = document.getElementById('selectInputType');
  let selectFileType = document.getElementById('selectFileType');
  let selectCategoryType = document.getElementById('selectCategoryType');

  //reset/clear on controller load
  resetSelectBox(selectInputType);
  resetSelectBox(selectFileType);
  resetSelectBox(selectCategoryType);

  let btnUploadFile = document.getElementById('btnUploadFile');
  btnUploadFile.addEventListener('click', function() {
    let url = 'http://localhost:8080/FAScriptService/service/solution/inputDetails';
    let query = "";
    let formElements = document.getElementById('searchForm').elements;
    for (let i=0;i <formElements.length;i++) {
      console.dir(formElements[i]);
      if (i == 0) {
        query += "?";
      }
      if(formElements[i].name){
        query += formElements[i].name + '=' + formElements[i].value + "&";
      }
    }
    if ( query.endsWith('&'))
      query = query.substring(0,query.length-1);
    url += query;
    console.log('url', url);
  });


  let inputTpyes = ['File','URL'];
  setupSelectInputType(inputTpyes, 'Select Input Type');
}

let submitFormTo = function(url) {
  let jqxhr = $.get( url, function(data) {
    alert( "success" );
  })
  .done(function() {
    alert( "second success" );
  })
  .fail(function() {
    alert( "error" );
  })
  .always(function() {
    alert( "finished" );
  });
}

let populateSelectBox = function(selectElement, options, title) {
  selectElement.innerHTML = '';
  let selectOptions = '<option value="">Select</option>';
  if (title)
    selectOptions = `<option value="">${title}</option>`;
  for (option of options) {
    selectOptions += `<option value="${option}">${option}</option>`;
  }
  selectElement.innerHTML = selectOptions;
  selectElement.style.display = 'block';
}
let resetSelectBox = function(selectElement) {
  selectElement.innerHTML = '';
  selectElement.innerHTML = '<option value="">Select</option>';
  selectElement.style.display = 'none';
}

let setupSelectInputType = function(inputTpyes, title) {
  let selectInputType = document.getElementById('selectInputType');
  populateSelectBox(selectInputType, inputTpyes, title);
  selectInputType.addEventListener('change', function() {
    if(this.value.toUpperCase() == 'FILE') {
      let fileTypes = ['PDF','CSV'];
      setupSelectFileType(fileTypes,'Select File Type');
    } else {
      resetSelectBox(document.getElementById('selectFileType'));
      resetSelectBox(document.getElementById('selectCategoryType'));
    }
  });
}

let setupSelectFileType = function(fileTypes,title) {
  let selectFileType = document.getElementById('selectFileType');
  populateSelectBox(selectFileType, fileTypes, title);
  selectFileType.addEventListener('change', function() {
    if (this.value.toUpperCase() == 'PDF') {
      let categoryTypes = ['Q&A','Flat','Header Heirarchy'];
      setupSelectCategoryType(categoryTypes, 'Select PDF Category');
    } else {
      resetSelectBox(document.getElementById('selectCategoryType'));
    }
  });
}

let setupSelectCategoryType = function(categoryTypes, title) {
  let selectCategoryType = document.getElementById('selectCategoryType');
  populateSelectBox(selectCategoryType, categoryTypes, title);

  selectCategoryType.addEventListener('change', function() {
    console.log(this.value);
  });
}
