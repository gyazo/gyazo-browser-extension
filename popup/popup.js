(function() {
  var captureBtn = document.getElementById('capture');
  captureBtn.appendChild(document.createTextNode(chrome.i18n.getMessage("contextMenuSelect")));
  var wholeBtn = document.getElementById('whole');
  wholeBtn.appendChild(document.createTextNode(chrome.i18n.getMessage("contextMenuWhole")));
  var selectElm = document.getElementById('selectElm');
  selectElm.appendChild(document.createTextNode(chrome.i18n.getMessage("contextMenuSelectElement")));
  var visibleArea = document.getElementById('visibleArea');
  visibleArea.appendChild(document.createTextNode(chrome.i18n.getMessage("captureVisibleArea")));

  captureBtn.addEventListener('click', function() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      chrome.runtime.sendMessage(chrome.runtime.id, {
        tab: tabs[0],
        action: 'gyazoCapture'
      }, function(mes){});
      window.close();
    });
  });
  wholeBtn.addEventListener('click', function() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      chrome.runtime.sendMessage(chrome.runtime.id, {
        tab: tabs[0],
        action: 'gyazoWholeCaptureFromPopup'
      }, function(){});
      window.close();
    });
  });
  selectElm.addEventListener('click', function() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      chrome.runtime.sendMessage(chrome.runtime.id, {
        tab: tabs[0],
        action: 'gyazoSelectElmFromPopup'
      }, function(){});
      window.close();
    });
  })

  visibleArea.addEventListener('click', function() {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      chrome.runtime.sendMessage(chrome.runtime.id, {
        tab: tabs[0],
        action: 'gyazoCaptureVisibleArea'
      }, function(){});
      window.close();
    });
  })
})()
