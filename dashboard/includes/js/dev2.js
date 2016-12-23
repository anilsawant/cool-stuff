window.onload = function () {
  let subView = document.getElementById('sub-view'),
      txtSearchQuery = subView.querySelector('.txt-search-query'),
      btnSearchLibrary = subView.querySelector('.btn-search-library'),
      searchTagsDiv = subView.querySelector('.search-tags'),
      serchTagsRow = subView.querySelector('.search-tags-row'),
      searchResultsRow = subView.querySelector('.search-results-row'),
      searchMsgRow = subView.querySelector('.search-msg-row'),
      searchResultTable = subView.querySelector('table.table'),
      searchResultMsg = subView.querySelector('.search-result-msg'),
      btnAddFileToLibrary = subView.querySelector('#btnAddFileToLibrary'),
      $addResourceCardOverlay = $('.add.sub-overlay');

  btnSearchLibrary.addEventListener('click', function () {
    let searchQuery = txtSearchQuery.value.trim().toLowerCase();
    if (searchQuery) {
      let searchVideoFlag = subView.querySelector('#checkSearchVideos').className.includes('unchecked') ? false : true ;
      let searchImagesFlag = subView.querySelector('#checkSearchImages').className.includes('unchecked') ? false : true ;
      let searchDocumentFlag = subView.querySelector('#checkSearchDocs').className.includes('unchecked') ? false : true ;
      if (searchVideoFlag || searchImagesFlag || searchDocumentFlag) {
        txtSearchQuery.value = '';
        cleanupSearchResults(subView);
        let filteredTags = getFilteredTags(searchQuery);
        if(filteredTags && filteredTags.length) {
          for (var i = 0; i < filteredTags.length; i++) {
            let tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.innerHTML = '<span class="text">' + filteredTags[i] + "</span><span class='delete'>&times;</span>";
            searchTagsDiv.appendChild(tagSpan);
          }
          $(serchTagsRow).fadeIn();
          let searchResult = getSearchResult(filteredTags, searchVideoFlag, searchImagesFlag, searchDocumentFlag);
          if (searchResult.error) {
            $(searchMsgRow).slideUp(function () {
              this.querySelector('.text').textContent = searchResult.error;
              $(this).slideDown();
            });
          } else {
            let matchedResults = [];
            if (searchResult.videos && searchResult.videos.length)
              matchedResults = matchedResults.concat(searchResult.videos);
            if (searchResult.documents && searchResult.documents.length)
              matchedResults = matchedResults.concat(searchResult.documents);
            if (searchResult.images && searchResult.images.length)
              matchedResults = matchedResults.concat(searchResult.images);
            if (matchedResults.length) {
              getMetadataOfMatchedResults(matchedResults, function (err, matchedResultsMetadata) {
                if (matchedResultsMetadata && matchedResultsMetadata.length) {
                  populateMatchedResults(matchedResultsMetadata);
                  searchResultTable.style.display = 'table';
                  searchResultMsg.style.display = 'none';
                } else {
                  searchResultTable.style.display = 'none';
                  searchResultMsg.style.display = 'block';
                  $(searchMsgRow).slideUp(function () {
                    this.querySelector('.text').textContent = "No metadata found for the index.";
                    $(this).slideDown();
                  });
                }
              });
            } else {
              searchResultTable.style.display = 'none';
              searchResultMsg.style.display = 'block';
            }
            $(searchResultsRow).fadeIn();
          }
        } else {
          $(searchMsgRow).slideUp(function () {
            this.querySelector('.text').textContent = "No tags to search for. Note: Minimum length for search tag is 2.";
            $(this).slideDown();
          });
        }
      } else {
        $(searchMsgRow).slideUp(function () {
          this.querySelector('.text').textContent = "No search flag selected.";
          $(this).slideDown();
        });
      }
    } else {
      $(searchMsgRow).slideUp(function () {
        this.querySelector('.text').textContent = "Enter a search query.";
        $(this).slideDown();
      });
    }
  });
  txtSearchQuery.addEventListener('keypress', function (evt) {
    if (evt.which == 13 ) {
      btnSearchLibrary.click();
    }
  })
  searchTagsDiv.addEventListener('click', function (evt) {
    if (evt.target.className.includes('delete')) {
      evt.target.parentNode.parentNode.removeChild(evt.target.parentNode);
      if (searchTagsDiv.childElementCount == 0) {
        cleanupSearchResults(subView);
      }
    }
  });
  btnAddFileToLibrary.addEventListener('click', function () {
    $addResourceCardOverlay.fadeIn(function () {
      $addResourceCardOverlay.find('.resource-card').addClass('open');
    });
  });

  disableSearchRow();
  $.ajax({
    "method": "GET",
    "url": "/dashboard/libraryIndex.json",
    "contentType": "application/json",
    "dataType": "json",
    "processData": false
  })
  .done(function( data ) {
    window.localLibraryIndex = data;
    enableSearchRow();
  }).fail(function (err) {
    console.error(err);
  });

  cleanupSearchResults(subView);
  setupResultsTable();
  setupAddResourceCard();
  setupShowResourceCard();
  // initializeFirebase();
}
let getFileSizeStr = function (sizeInBytes) {
  if (sizeInBytes) {
    let kb = 1024,
        mb = kb*1024,
        gb = mb*1024,
        sizeInGB = (sizeInBytes/gb).toFixed(1);
    if(sizeInGB >= 1) {
      return sizeInGB + "GB";
    }
    let sizeInMB = (sizeInBytes/mb).toFixed(1);
    if(sizeInMB >= 1) {
      return sizeInMB + "MB";
    }
    let sizeInKB = (sizeInBytes/kb).toFixed(1);
    if(sizeInKB >= 1) {
      return sizeInKB + "KB";
    }
  }
  return "00.00KB";
}
let getMonthStr = function (monthNumber) {
  let mon = "Mon";
  if (monthNumber) {
    switch (monthNumber) {
      case 0: mon = 'Jan';break;case 1: mon = 'Feb';break;
      case 2: mon = 'Mar';break;case 3: mon = 'Apr';break;
      case 4: mon = 'May';break;case 5: mon = 'Jun';break;
      case 6: mon = 'Jul';break;case 7: mon = 'Aug';break;
      case 8: mon = 'Sep';break;case 9: mon = 'Oct';break;
      case 10: mon = 'Nov';break;case 11: mon = 'Dec';break;
    }
  }
  return mon;

}
let getFilteredTags = function (searchQuery) {
  if (searchQuery) {
    let searchTags = searchQuery.split(/ *,+ *|,* +,*/g);
    let filteredTags = [];
    for (var i = 0; i < searchTags.length; i++) {
      let tag = searchTags[i].trim();
      if (tag && tag.length > 1) {//minimum length of search tag is 2
        let found = false;
        for (var j = 0; j < filteredTags.length; j++) {
          if (tag == filteredTags[j]) {
            found = true;
            break;
          }
        }
        if (!found)
          filteredTags.push(tag);
      }
    }
    return filteredTags;
  }
  return;
}

let getSearchResult = function (searchTags, searchVideoFlag, searchImagesFlag, searchDocumentFlag) {
  if (searchTags.length) {
    if (searchVideoFlag || searchImagesFlag || searchDocumentFlag) {
      let searchResultObject = {};
      if (searchVideoFlag) {
        searchResultObject.videos = [];
        let videosIndex = Object.keys(window.localLibraryIndex.videos);//global / online library index
        for (var i = 0; i < videosIndex.length; i++) {
          for (var j = 0; j < searchTags.length; j++) {
            if (!videosIndex[i].includes(searchTags[j])) {
              break;
            }
            if ( j == (searchTags.length - 1)) {
              searchResultObject.videos.push({'tagsStr':videosIndex[i],'paths':window.localLibraryIndex.videos[videosIndex[i]]});
            }
          }
        }
      }
      if (searchDocumentFlag) {
        searchResultObject.documents = [];
        let documentsIndex = Object.keys(window.localLibraryIndex.documents);//global / online library index
        for (var i = 0; i < documentsIndex.length; i++) {
          for (var j = 0; j < searchTags.length; j++) {
            if (!documentsIndex[i].includes(searchTags[j])) {
              break;
            }
            if (j == (searchTags.length - 1)) {
              searchResultObject.documents.push({'tagsStr':documentsIndex[i],'paths':window.localLibraryIndex.documents[documentsIndex[i]]});
            }
          }
        }
      }
      if (searchImagesFlag) {
        searchResultObject.images = [];
        let imagesIndex = Object.keys(window.localLibraryIndex.images);//global / online library index
        for (var i = 0; i < imagesIndex.length; i++) {
          for (var j = 0; j < searchTags.length; j++) {
            if (!imagesIndex[i].includes(searchTags[j])) {
              break;
            }
            if (j == (searchTags.length - 1)) {
              searchResultObject.images.push({'tagsStr':imagesIndex[i],'paths':window.localLibraryIndex.images[imagesIndex[i]]});
            }
          }
        }
      }
      return searchResultObject;
    }
    return {"error": "No search flag selected"}
  }
  return {"error": "No tags to search for"}
};

let getMetadataOfMatchedResults = function (matchedResults, done) {
  $.ajax({
    "method": "GET",
    "url": "/dashboard/libraryResources.json",
    "contentType": "application/json",
    "dataType": "json",
    "processData": false
  }).done(function( data ) {
    let matchedResultsMetadata = [];
    if (matchedResults && matchedResults.length) {
      for (var i = 0; i < matchedResults.length; i++) {
        let tags = matchedResults[i].tagsStr.split('_'),
            paths = matchedResults[i].paths;
        for (var j = 0; j < paths.length; j++) {
          let metadata = data[paths[j]];
          if (metadata) {
            metadata.tags = tags;
            metadata.fullPath = paths[j];
            matchedResultsMetadata.push(metadata);
          }
        }
      }
    }
    if(done && typeof done == 'function')
      done(null, matchedResultsMetadata);
  }).fail(function (err) {
    console.error(err);
    if(done && typeof done == 'function')
      done(err);
  });
}
let cleanupSearchResults = function (subView) {
  if (subView) {
    let searchTagsDiv = subView.querySelector('.search-tags'),
        serchTagsRow = subView.querySelector('.search-tags-row'),
        searchResultsRow = subView.querySelector('.search-results-row'),
        searchMsgRow = subView.querySelector('.search-msg-row');

    serchTagsRow.style.display = 'none';
    searchResultsRow.style.display = 'none';
    searchTagsDiv.innerHTML = '';
    searchMsgRow.querySelector('.text').textContent = '';
    $(searchMsgRow).slideUp();
  }
}
let disableSearchRow = function () {
  let txtSearchQuery = document.querySelector('.txt-search-query');
  let btnSearchLibrary = document.querySelector('.btn-search-library');
  txtSearchQuery.setAttribute("disabled", true);
  btnSearchLibrary.setAttribute("disabled", true);
}
let enableSearchRow = function () {
  let txtSearchQuery = document.querySelector('.txt-search-query');
  let btnSearchLibrary = document.querySelector('.btn-search-library');
  txtSearchQuery.removeAttribute("disabled");
  btnSearchLibrary.removeAttribute("disabled");
}

let setupResultsTable = function () {
  let reslutsTable = document.querySelector('table.table'),
      reslutsTableHead = reslutsTable.querySelector('thead'),
      reslutsTableBody = reslutsTable.querySelector('tbody'),
      $rowOperations = $('#rowOperations'),
      selectAllCheckbox = reslutsTable.querySelector('thead .checkbox'),
      $showResourceCardOverlay = $('.show-resource.sub-overlay');

  $rowOperations.on('click', function (evt) {
    if (evt.target.className.includes('trash')) {
      let allCheckboxes = reslutsTableBody.getElementsByClassName('checkbox');
      for (var i = 0; i < allCheckboxes.length; i++) {
        if (allCheckboxes[i].className.includes('-check')) {
          console.log("Delete : ", allCheckboxes[i].getAttribute('data-fullpath'));
        }
      }
    } else if (evt.target.className.includes('save')) {
      let allCheckboxes = reslutsTableBody.getElementsByClassName('checkbox');
      for (var i = 0; i < allCheckboxes.length; i++) {
        if (allCheckboxes[i].className.includes('-check')) {
          console.log("Save : ", allCheckboxes[i].getAttribute('data-downloadurl'));
        }
      }
    }
  });
  reslutsTableHead.addEventListener('click', function (evt) {
    if (evt.target.className.includes('checkbox')) {
      let allCheckboxes = reslutsTableBody.getElementsByClassName('checkbox');
      if (evt.target.className.includes('unchecked')) {
        evt.target.className = 'checkbox glyphicon glyphicon-check';
        for (var i = 0; i < allCheckboxes.length; i++) {
          allCheckboxes[i].className = 'checkbox glyphicon glyphicon-check';
        }
        $rowOperations.fadeIn();
      } else {
        evt.target.className = 'checkbox glyphicon glyphicon-unchecked';
        for (var i = 0; i < allCheckboxes.length; i++) {
          allCheckboxes[i].className = 'checkbox glyphicon glyphicon-unchecked';
        }
        $rowOperations.fadeOut();
      }
    }
  });

  reslutsTableBody.addEventListener('click', function (evt) {
    if (evt.target.className.includes('checkbox')) {
      let allCheckboxes = reslutsTableBody.getElementsByClassName('checkbox');
      if (evt.target.className.includes('unchecked')) {
        evt.target.className = 'checkbox glyphicon glyphicon-check';
      } else {
        evt.target.className = 'checkbox glyphicon glyphicon-unchecked';
      }
      let noOfCheckedRows = 0;
      for (var i = 0; i < allCheckboxes.length; i++) {
        if (allCheckboxes[i].className.includes('-check')) {
          noOfCheckedRows++;
        }
      }
      if(noOfCheckedRows){
        $rowOperations.fadeIn();
        selectAllCheckbox.className = "checkbox glyphicon glyphicon-unchecked";
        if (noOfCheckedRows == allCheckboxes.length)
          selectAllCheckbox.className = "checkbox glyphicon glyphicon-check";
      } else {
        $rowOperations.fadeOut();
      }
    } else if (evt.target.className.includes('file-name')) {
      let $parentRow = $(evt.target).parents('tr');
      if ($parentRow[0]) {
        let fullPath = $parentRow.attr('data-fullpath');
        let tagStr = $parentRow.attr('data-tagstr');
        $.ajax({
          "method": "GET",
          "url": "/dashboard/libraryResources.json",
          "contentType": "application/json",
          "dataType": "json",
          "processData": false
        }).done(function( data ) {
          if (data && data[fullPath]) {
            let metadata = data[fullPath];
            if (metadata) {
              metadata.tags = tagStr.split('_');
              metadata.fullPath = fullPath;
              showResourceCard(metadata);
            }
          }
        }).fail(function (err) {
          console.error(err);
        });
      }
    }
  });
};
let setupAddResourceCard = function () {
  let $addResourceCard = $('.add.resource-card'),
      $addResourceCardOverlay = $('.add.sub-overlay'),
      $inputResourceFile = $addResourceCard.find('.input-resource-file'),
      $spanFileName = $addResourceCard.find('.span-file-name'),
      $addTagsRow = $addResourceCard.find('.add-tags-row'),
      $uploadingRow = $addResourceCard.find('.uploading-row'),
      $addResourceTags = $addResourceCard.find('.resource-tags'),
      $addResourceMsg = $addResourceCard.find('.add-resource-msg'),
      $txtTag = $addResourceCard.find('.txt-tag'),
      $btnAttachTag = $addResourceCard.find('.btn-attach-tag'),
      $btnAddResource = $addResourceCard.find('.btn-add-resource');

  $spanFileName.text('').hide();
  $addTagsRow.hide();
  $addResourceMsg.hide();
  $uploadingRow.hide();
  $addResourceTags.empty();

  $addResourceCardOverlay.on('click', function (evt) {
    if (evt.target.className.includes('close') || evt.target.className.includes('overlay-dismiss') ) {
      $addResourceCard.removeClass('open');
      $addResourceCardOverlay.fadeOut('slow');
    }
  });

  $inputResourceFile.on('change', function (evt) {
    let selectedFile = $inputResourceFile[0].files[0];
    if (selectedFile) {
      $spanFileName.text(selectedFile.name).fadeIn()
      $addTagsRow.slideDown('slow');
    } else {
      $spanFileName.text('').fadeOut();
      $addTagsRow.slideUp();
      $addResourceMsg.hide();
      $addResourceTags.empty();
    }
  });
  $btnAttachTag.on('click', function () {
    let tagsString = $txtTag.val().trim().toLowerCase();
    if (tagsString) {
        $txtTag.val('');
        let filteredTagsString = tagsString.replace(/[^a-z0-9 ,]/gi, '');
            filteredTags = getFilteredTags(filteredTagsString);
        if(filteredTags && filteredTags.length) {
          let $existingTags = $addResourceTags.find('.tag');
          for (var i = 0; i < filteredTags.length; i++) {
            let tagPresent = false;
            $existingTags.each(function (index, tag) {
              if (tag.querySelector('.text').textContent == filteredTags[i]) {
                tagPresent = true;
                return false;
              }
            });
            if (!tagPresent) {
              let tagSpan = document.createElement('span');
              tagSpan.className = 'tag';
              tagSpan.innerHTML = '<span class="text">' + filteredTags[i] + "</span><span class='delete'>&times;</span>";
              $addResourceTags.append(tagSpan);
            }
          }
        } else {
          $addResourceMsg.slideUp(function () {
            this.querySelector('.text').textContent = "No tags to attach. Note: Minimum length for resource-tag is 2.";
            $(this).slideDown();
          });
        }
    } else {
      $addResourceMsg.slideUp(function () {
        this.querySelector('.text').textContent = "Enter tag(s) to attach.";
        $(this).slideDown();
      });
    }
  });
  $txtTag.on('keypress', function (evt) {
    if (evt.which == 13 ) {
      $btnAttachTag[0].click();
    }
  });
  $addTagsRow.on('click', function (evt) {
    evt.stopPropagation();
    if (evt.target.className.includes('delete')) {
      evt.target.parentNode.parentNode.removeChild(evt.target.parentNode);
    }
  });
  $btnAddResource.on('click', function () {
    let $existingTags = $addResourceTags.find('.tag');
    if ($existingTags.length) {
      let tags = [];
      $existingTags.each(function (i,tag) {
        tags.push(tag.querySelector('.text').textContent);
      });
      let keyStr = tags.sort().join('_');
      let selectedFile = $inputResourceFile[0].files[0]
      if (selectedFile) {
        let saveFileToLocation = "path_to_file_" + Date.now(),
            libraryCategory = '';
        if (selectedFile.type.match(/pdf|doc|text|word/i)) {
          libraryCategory = 'documents';
        } else if (selectedFile.type.match(/video/i)) {
          libraryCategory = 'videos';
        } else if (selectedFile.type.match(/image/i)) {
          libraryCategory = 'images';
        }
        if (libraryCategory) {
          $.ajax({
            "method": "GET",
            "url": "/dashboard/libraryResources.json",
            "contentType": "application/json",
            "dataType": "json",
            "processData": false
          }).done(function( data ) {
            if (data) {
              data[saveFileToLocation] = {
                "name": selectedFile.name,
                "size": selectedFile.size,
                "type": selectedFile.type,
                "lastModified": selectedFile.lastModified,
                "downloadUrl": "firebase-download-url-xyz"
              };
              var jsonFile = null,
              makeJSONFile = function (json) {
                var rawData = new Blob([json], {type: 'application/json'});
                if (jsonFile !== null) {
                  window.URL.revokeObjectURL(jsonFile);
                }
                jsonFile = window.URL.createObjectURL(rawData);
                return jsonFile;
              };
              var link = document.createElement('a');
              link.setAttribute('download', 'libraryResources.json');
              link.href = makeJSONFile(JSON.stringify(data));
              document.body.appendChild(link);

              // wait for the link to be added to the document
              window.requestAnimationFrame(function () {
                var event = new MouseEvent('click');
                link.dispatchEvent(event);
                document.body.removeChild(link);
              });

              if (window.localLibraryIndex[libraryCategory][keyStr]) {
                window.localLibraryIndex[libraryCategory][keyStr].push(saveFileToLocation);
              } else {
                window.localLibraryIndex[libraryCategory][keyStr] = [saveFileToLocation];
              }
              addResourceSucccess();
            }
          }).fail(function (err) {
            console.error(err);
            if(done && typeof done == 'function')
              done(err);
          });
        } else {
          $addResourceMsg.slideUp(function () {
            this.querySelector('.text').textContent = "File type : " + selectedFile.type + " is not supported.";
            $(this).slideDown();
          });
        }
      } else {
        $addResourceMsg.slideUp(function () {
          this.querySelector('.text').textContent = "Select a resource to add.";
          $(this).slideDown();
        });
      }
    } else {
      $addResourceMsg.slideUp(function () {
        this.querySelector('.text').textContent = "Cannot add a resource without a tag.";
        $(this).slideDown();
      });
    }
  });

  let addResourceSucccess = function () {
    $spanFileName.text('').fadeOut();
    $addTagsRow.slideUp();
    $addResourceMsg.hide();
    $addResourceTags.empty();
    $inputResourceFile.val('');
    window.showNotification("Resource added :)");
  }
}
let setupShowResourceCard = function () {
  let $showResourceCard = $('.show-resource.resource-card'),
      $showResourceCardOverlay = $('.show-resource.sub-overlay'),
      $spanFileName = $showResourceCard.find('.span-file-name'),
      $addTagsRow = $showResourceCard.find('.add-tags-row'),
      $addResourceTags = $showResourceCard.find('.resource-tags'),
      $addResourceMsg = $showResourceCard.find('.add-resource-msg'),
      $txtTag = $showResourceCard.find('.txt-tag'),
      $btnAddTag = $showResourceCard.find('.btn-add-tag'),
      $btnDeleteResource = $showResourceCard.find('.btn-delete-resource'),
      $btnUpdateResource = $showResourceCard.find('.btn-update-resource');

  $showResourceCardOverlay.on('click', function (evt) {
    if (evt.target.className.includes('close') || evt.target.className.includes('overlay-dismiss') ) {
      $showResourceCardOverlay.fadeOut('slow');
    }
  });
  $btnAddTag.on('click', function () {
    let tagsString = $txtTag.val().trim().toLowerCase();
    if (tagsString) {
        $txtTag.val('');
        let filteredTagsString = tagsString.replace(/[^a-z0-9 ,]/gi, '');
            filteredTags = getFilteredTags(filteredTagsString);
        if(filteredTags && filteredTags.length) {
          let $existingTags = $addResourceTags.find('.tag');
          for (var i = 0; i < filteredTags.length; i++) {
            let tagPresent = false;
            $existingTags.each(function (index, tag) {
              if (tag.querySelector('.text').textContent == filteredTags[i]) {
                tagPresent = true;
                return false;
              }
            });
            if (!tagPresent) {
              let tagSpan = document.createElement('span');
              tagSpan.className = 'tag';
              tagSpan.innerHTML = '<span class="text">' + filteredTags[i] + "</span><span class='delete'>&times;</span>";
              $addResourceTags.append(tagSpan);
            }
          }
        } else {
          $addResourceMsg.slideUp(function () {
            this.querySelector('.text').textContent = "No tags to attach. Note: Minimum length for resource-tag is 2.";
            $(this).slideDown();
          });
        }
    } else {
      $addResourceMsg.slideUp(function () {
        this.querySelector('.text').textContent = "Enter tag(s) to attach.";
        $(this).slideDown();
      });
    }
  });
  $txtTag.on('keypress', function (evt) {
    if (evt.which == 13 ) {
      $btnAddTag[0].click();
    }
  });
  $addTagsRow.on('click', function (evt) {
    evt.stopPropagation();
    if (evt.target.className.includes('delete')) {
      evt.target.parentNode.parentNode.removeChild(evt.target.parentNode);
    }
  });
  $btnUpdateResource.on('click', function () {
    let $existingTags = $addResourceTags.find('.tag');
    if ($existingTags.length) {
      let tags = [];
      $existingTags.each(function (i,tag) {
        tags.push(tag.querySelector('.text').textContent);
      });
      let keyStr = tags.sort().join('_');

      if (window.localLibraryIndex.videos[keyStr]) {
        window.localLibraryIndex.videos[keyStr].push("new_path");
      } else {
        window.localLibraryIndex.videos[keyStr] = ["new_path"];
      }
      $spanFileName.text('').fadeOut();
      $addTagsRow.slideUp();
      $addResourceMsg.hide();
      $addResourceTags.empty();
      $inputResourceFile.val('');
      window.showNotification("Resource added :)");
    } else {
      $addResourceMsg.slideUp(function () {
        this.querySelector('.text').textContent = "Cannot add a resource without a tag.";
        $(this).slideDown();
      });
    }
  });
}

let showResourceCard = function (metadata) {
  if (metadata) {
    let $showResourceCardOverlay = $('.show-resource.sub-overlay'),
        $resourceCard = $showResourceCardOverlay.find('.resource-card'),
        $spanFileName = $showResourceCardOverlay.find('.span-file-name'),
        $addTagsRow = $showResourceCardOverlay.find('.add-tags-row'),
        $addResourceTags = $showResourceCardOverlay.find('.resource-tags'),
        $addResourceMsg = $showResourceCardOverlay.find('.add-resource-msg'),
        $txtTag = $showResourceCardOverlay.find('.txt-tag'),
        $btnAddTag = $showResourceCardOverlay.find('.btn-add-tag'),
        $btnUpdateResource = $showResourceCardOverlay.find('.btn-update-resource');

    $spanFileName.text('');
    $addResourceTags.empty();
    $addResourceMsg.slideUp();
    $txtTag.val('');
    $btnUpdateResource.hide();
    for (var i = 0; i < metadata.tags.length; i++) {
      $addResourceTags.append(`<span class="tag"><span class="text">${metadata.tags[i]}</span><span class="delete">&times;</span></span>`)
    }
    $spanFileName.text(metadata.name);
    $showResourceCardOverlay.fadeIn();
  } else {
    alert('cannot show the resource. metadata = ', metadata);
  }
}

let populateMatchedResults = function (matchedResults) {
  if (matchedResults && matchedResults.length) {
    let reslutsTable = document.querySelector('table.table'),
        reslutsTableBody = reslutsTable.querySelector('tbody'),
        reslutsTableHead = reslutsTable.querySelector('thead');

    reslutsTableBody.innerHTML = '';
    reslutsTableHead.querySelector('.checkbox').className = 'checkbox glyphicon glyphicon-unchecked';
    reslutsTableHead.querySelector('#rowOperations').style.display = 'none';
    for (var i = 0; i < matchedResults.length; i++) {
      let newResultRow = document.createElement('tr'),
          lastModified = new Date(matchedResults[i].lastModified),
          lastModifiedStr = getMonthStr(lastModified.getMonth()) + " " + lastModified.getDate() + ", " + lastModified.getFullYear(),
          innerHTMLStr = `<td><span class="checkbox glyphicon glyphicon-unchecked" data-downloadurl="${matchedResults[i].downloadUrl}" data-fullpath="${matchedResults[i].fullPath}" title="Select file"></span></td>
                                <td><span class="fa fa-file-o file-icon"></span><span class="file-name">${matchedResults[i].name}</span></td>
                                <td>${getFileSizeStr(matchedResults[i].size)}</td>
                                <td>${matchedResults[i].type}</td>
                                <td>${lastModifiedStr}</td>`;
      let tagsLine = '<td>';
      for (var j = 0; j < matchedResults[i].tags.length; j++) {
        tagsLine += '<span class="label label-default">' + matchedResults[i].tags[j] + '</span>';
      }
      tagsLine += '</td>';
      newResultRow.innerHTML = innerHTMLStr + tagsLine;
      newResultRow.setAttribute('data-downloadurl', matchedResults[i].downloadUrl);
      newResultRow.setAttribute('data-fullpath', matchedResults[i].fullPath);
      newResultRow.setAttribute('data-tagstr', matchedResults[i].tags.join('_'));
      reslutsTableBody.appendChild(newResultRow);
    }
  } else {
    console.log("INFO: No matched results");
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
    window.fbDbResourcesRef = firebase.database().ref('anil_dev').child('resources');
    window.fbStResourcesRef = firebase.storage().ref('anil_dev').child('resources');
    window.fbDbResourcesRef.once('value', function (snapshot) {
      let libraryResources = snapshot.val()
      if (libraryResources.videos) {
        window.libraryIndex = Object.keys(libraryResources.videos);
        window.libraryResources = libraryResources.videos;
        enableSearchRow();
      }
    });
  }
};
