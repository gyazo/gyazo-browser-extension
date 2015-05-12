var host = 'https://upload.gyazo.com/api/upload/easy_auth';
var clientId = 'df9edab530e84b4c56f9fcfa209aff1131c7d358a91d85cc20b9229e515d67dd';
var UploadNotification = function(callback) {
  this.progress = 3;
  this.limitValues = [30, 80];
  this.limitLevel = 0;
  this.limit = this.limitValues[this.limitLevel];
  this.nextLimit = function() {
    if(this.limitLevel + 1 < this.limitValues.length) {
      this.limitLevel += 1;
    }
    this.limit = this.limitValues[this.limitLevel]
  };
  this.id = 'gyazo_notification_' + Date.now();
  this.newTabId = null;
  this.progressIncrement = function(callback) {
    const INCREMENT_SIZE = 5;
    this.progress = Math.min(this.progress + INCREMENT_SIZE, this.limit);
    this.update({progress: this.progress},callback);
  };
  this.update = function(opt, callback) {
    callback = callback || function(){};
    chrome.notifications.update(this.id, opt, callback);
  };
  this.finish = function(callback) {
    var self = this;
    this.update({
      title: chrome.i18n.getMessage('uploadingFinishTitle'),
      message: chrome.i18n.getMessage('uploadingFinishMessage'),
      progress: 100
    },function(){
      window.setTimeout(function() {
        chrome.notifications.clear(self.id, function(){});
      },1200);
    });
  };
  callback = callback || function(){};
  chrome.notifications.create(this.id, {
    type: 'progress',
    title: chrome.i18n.getMessage('uploadingTitle'),
    message: chrome.i18n.getMessage('uploadingMessage'),
    progress: this.progress,
    iconUrl: '/icons/gyazo-bg-256.png',
    priority: 2
  }, callback);
};

function postToGyazo(data) {
  var notification =  new UploadNotification();
  var timerId = window.setInterval(function() {
    notification.progressIncrement();
  },500);
  $.ajax({
    type: 'POST',
    url: host,
    data: {
      client_id: clientId,
      image_url: data.imageData,
      title: data.title,
      referer_url: data.url,
      width: data.width || '',
      height: data.height || '',
      scale: data.scale || ''
    },
    crossDomain: true
  })
    .done(function(data) {
      chrome.tabs.create({url:data.get_image_url, active:false}, function(newTab){
        notification.nextLimit();
        notification.newTabId = newTab.id;
        var handler = function (tabId, changeInfo) {
          if (newTab.id === tabId && changeInfo.url) {
            notification.finish();
            window.clearInterval(timerId);
            saveToClipboard(changeInfo.url);
            chrome.tabs.onUpdated.removeListener(handler);
            notification.newTabId = tabId;
          }
        };
        chrome.tabs.onUpdated.addListener(handler);
      });
    })
    .fail(function(XMLHttpRequest, textStatus, errorThrown) {
      window.alert('Status: ' + XMLHttpRequest.status + '\n Error: ' + textStatus + '\n Message: '+ errorThrown.message);
    });
}

function onClickHandler(info, tab) {

  var GyazoFuncs = {gyazoIt: function() {
    var xhr = jQuery.ajaxSettings.xhr();
    xhr.open('GET', info.srcUrl, true);
    xhr.responseType = 'blob';
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        var blob = xhr.response;
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
          postToGyazo({
            imageData: fileReader.result,
            title: tab.title,
            url: tab.url
          });
        };
        fileReader.readAsDataURL(blob);
      }
    };
    xhr.send();
  },
  gyazoSelectElm: function() {
    chrome.tabs.sendMessage(tab.id, {action: 'gyazoSelectElm', tab: tab}, function(){})
  },
  gyazoCapture: function() {
    chrome.tabs.sendMessage(tab.id, {action: 'gyazoCapture', tab: tab}, function(mes){});
  },
  gyazoWhole: function(){
    var notificationId = 'gyazoCapturing_' + Date.now();
    chrome.notifications.create(notificationId, {
      type: 'basic',
      title: chrome.i18n.getMessage('captureTitle'),
      message: chrome.i18n.getMessage('captureMessage'),
      iconUrl: '/icons/gyazo-bg-256.png',
      priority: 2
    }, function(){});
    chrome.tabs.sendMessage(tab.id, {
      action: 'gyazoWholeCapture',
      tab: tab,
      notificationId: notificationId
    },function(){})
  }
};
if(info.menuItemId in GyazoFuncs) {
  chrome.tabs.executeScript(null, {
    file: './content.js'
  }, function(){
    GyazoFuncs[info.menuItemId]();
  })
}
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("contextMenuImage"),
  id: 'gyazoIt',
  contexts: ['image']
});
chrome.contextMenus.create({
  title: chrome.i18n.getMessage("contextMenuSelect"),
  id: 'gyazoCapture',
  contexts: ['all']
});
chrome.contextMenus.create({
  'title': chrome.i18n.getMessage("contextMenuWhole"),
  'id': 'gyazoWhole',
  contexts: ['all']
});
chrome.contextMenus.create({
  'title': chrome.i18n.getMessage("contextMenuSelectElement"),
  'id': 'gyazoSelectElm',
  contexts: ['all']
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var messageHandlers = {
    gyazoCapture: function() {
      onClickHandler({menuItemId: 'gyazoCapture'}, request.tab)
    },
    gyazoSelectElmFromPopup: function() {
      onClickHandler({menuItemId: 'gyazoSelectElm'}, request.tab)
    },
    gyazoWholeCaptureFromPopup: function() {
      onClickHandler({menuItemId: 'gyazoWhole'}, request.tab);
    },
    gyazoCaptureSize: function(){
      var c = document.createElement('canvas');
      c.height = request.data.h;
      c.width = request.data.w * request.data.z * request.data.s;
      var ctx = c.getContext('2d');
      var canvasData = c.toDataURL();
      var capture = function(scrollHeight){
        var imagePositionTop = scrollHeight * request.data.z * request.data.s;
        var offsetTop = request.data.y - request.data.positionY;
        if(scrollHeight === 0 && offsetTop >= 0 && offsetTop + request.data.h <= request.data.innerHeight){
          // Capture in window (not require scroll)
          chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(data){
            canvasUtils.trimImage({
              imageData: data,
              scale: request.data.s,
              zoom: request.data.z,
              startX: request.data.x,
              startY: offsetTop,
              width: request.data.w,
              height: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
              callback: function(_canvas){
                canvasUtils.appendImageToCanvas({
                  canvasData: canvasData,
                  imageSrc: _canvas.toDataURL(),
                  pageHeight: request.data.h,
                  imageHeight: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
                  width: request.data.w,
                  top: 0,
                  scale: request.data.s,
                  zoom: request.data.z,
                  callback: function(_canvas){
                    canvasData = _canvas.toDataURL();
                    scrollHeight += request.data.innerHeight;
                    capture(scrollHeight);
                  }
                })
              }
            })
          })
          return true;
        }
        if(scrollHeight >= request.data.h){
          chrome.tabs.executeScript(null, {
            code: "window.scrollTo("+ request.data.positionX +", "+ request.data.positionY +" )"
          });
          if(request.notificationId){
            chrome.notifications.clear(request.notificationId,function(){});
          }
          postToGyazo({
            imageData: canvasData,
            title: request.data.t,
            url: request.data.u,
            width: request.data.w,
            height: request.data.h,
            scale: request.data.s
          });
          return sendResponse();
        }
        chrome.tabs.executeScript(null, {
          code: "window.scrollTo(" + request.data.positionX + ", "+ (scrollHeight + request.data.y) +" )"
        },function(){
          chrome.tabs.sendMessage(request.tab.id, {
            action: 'changeFixedElementToAbsolute',
            scrollTo: {x: request.data.positionX, y: scrollHeight + request.data.y}
          }, function(){
            chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(data){
              canvasUtils.trimImage({
                imageData: data,
                scale: request.data.s,
                zoom: request.data.z,
                startX: request.data.x,
                startY: 0,
                width: request.data.w,
                height: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
                callback: function(_canvas){
                  canvasUtils.appendImageToCanvas({
                    canvasData: canvasData,
                    imageSrc: _canvas.toDataURL(),
                    pageHeight: request.data.h,
                    imageHeight: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
                    width: request.data.w,
                    top: imagePositionTop,
                    scale: request.data.s,
                    zoom: request.data.z,
                    callback: function(_canvas){
                      canvasData = _canvas.toDataURL();
                      scrollHeight += request.data.innerHeight;
                      capture(scrollHeight);
                    }
                  })
                }
              })
            })
          });
        })
      }
      capture(0)
    }
  }
  if(request.action in messageHandlers){
    messageHandlers[request.action]();
    return true;
  }
})

function tabUpdateListener(tabId, changeInfo, tab) {
  saveToClipboard(changeInfo.url);
}
