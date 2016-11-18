document.body.dsController = function() {
  setupGenieCheckBoxes();
}

let setupGenieCheckBoxes = function() {
  let genieCheckBoxes = document.getElementsByClassName('genie-checkbox');
  if ( genieCheckBoxes && genieCheckBoxes.length ) {
    for (genieCheckBox of genieCheckBoxes) {
      genieCheckBox.addEventListener('click', function() {
        if(this.className.includes('checked')) {
          this.className = this.className.replace('checked','');
        } else {
          this.className += ' checked';
        }
      });
    }
  }
}//end setupGenieCheckBoxes()

let deleteFiles = function() {
  let genieCheckBoxes = document.getElementsByName('selectedDoc');
  if ( genieCheckBoxes && genieCheckBoxes.length ) {
    let count = 0;
    for (genieCheckBox of genieCheckBoxes) {
      if (genieCheckBox.className.includes('checked')) {
        let value = genieCheckBox.getAttribute('data-value');
        console.log('Selected row: ', value);
        count++;
      }
    }
    if ( !count ) {
      popupAlert('No document selected for deletion.');
    }
  }
}
