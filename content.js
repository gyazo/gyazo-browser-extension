(function() {

if(/gyazo\.com/.test(location.hostname)){
  document.documentElement.setAttribute("data-extension-installed", true);
}

function pressCommandKey(event){
  // Return true when
  // Press CommandKey on MacOSX or CtrlKey on Windows or Linux
  if( !(event instanceof MouseEvent || event instanceof KeyboardEvent) ){
    return false
  }
  if(navigator.platform.match(/mac/i).length > 0){
    return event.metaKey || event.keyIdentifier === 'Meta';
  }else{
    return event.ctrlKey || event.keyIdentifier === 'Ctrl';
  }
}

function changeFixedElementToAbsolute(){
  Array.prototype.slice.apply(document.querySelectorAll('*')).filter(function(item){
    return (window.getComputedStyle(item).position === 'fixed')
  }).forEach(function(item){
    item.classList.add('gyazo-whole-capture-onetime-absolute');
      item.style.position = 'absolute';
  });
}

function restorationFixedElement(){
  var fixedElms = document.getElementsByClassName('gyazo-whole-capture-onetime-absolute');
  Array.prototype.slice.apply(fixedElms).forEach(function(item){
    item.classList.remove('gyazo-whole-capture-onetime-absolute');
    item.style.position = 'fixed';
  })
}

function getZoomAndScale(){
  var zoom = Math.round(window.outerWidth / window.innerWidth * 100) / 100;
  var scale = window.devicePixelRatio / zoom;
  // XXX: on Windows, when window is not maximum, it should tweak zoom.(Chrome zoom level 1 is 1.10)
  var isWindows = navigator.platform.match(/^win/i);
  var isMaximum = (window.outerHeight === screen.availHeight && window.outerWidth === screen.availWidth);
  if( isWindows && !isMaximum && 1.00 < zoom && zoom < 1.05){
    zoom = 1.00;
  };
  return {
    zoom: zoom,
    scale: scale
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  var actions = {
    changeFixedElementToAbsolute: function(){
      changeFixedElementToAbsolute();
      sendResponse();
      return true;
    },
    gyazoCaptureVisibleArea: function(_request) {
      var request = request || _request;
      var data = {};
      var scaleObj = getZoomAndScale();
      data.w = window.innerWidth;
      data.h = window.innerHeight;
      data.x = window.scrollX;
      data.y = window.scrollY;
      data.t = document.title;
      data.u = location.href;
      data.s = scaleObj.scale;
      data.z = scaleObj.zoom;
      data.defaultPositon = window.scrollY;
      data.innerHeight = window.innerHeight;
      chrome.runtime.sendMessage(chrome.runtime.id,{
        action: 'gyazoCaptureSize',
        data: data,
        tab: request.tab
      }, function(){});
    },
    gyazoSelectElm: function() {
      //XXX: prevent loading twice.
      if(document.getElementsByClassName('gyazo-crop-select-element').length > 0){
        return false;
      }
      var jackup = document.createElement('div');
      document.body.appendChild(jackup);
      var layer = document.createElement('div');
      layer.className='gyazo-crop-select-element';
      document.body.appendChild(layer);
      layer.style.background = 'rgba(92, 92, 92, 0.3)';
      layer.style.position = 'fixed';
      layer.style.pointerEvents = 'none';
      layer.style.zIndex = 2147483647; //Maximun number of 32bit Int
      var allElms = Array.prototype.slice.apply(document.body.querySelectorAll('*')).filter(function(item){
        return !item.classList.contains('gyazo-crop-select-element')
      });
      var moveLayer = function(event){
        var item = event.target;
        event.stopPropagation();
        var rect = item.getBoundingClientRect();
        layer.style.width = rect.width + 'px';
        layer.style.height = rect.height + 'px';
        layer.style.left = rect.left + 'px';
        layer.style.top = rect.top + 'px';
      };
      var takeMargin = function(){
        layer.style.width = parseInt(getComputedStyle(layer).width) + 6 + 'px';
        layer.style.height = parseInt(getComputedStyle(layer).height) + 6 + 'px';
        layer.style.left = parseInt(getComputedStyle(layer).left) -3 + 'px'; + 'px';
        layer.style.top = parseInt(getComputedStyle(layer).top) -3 + 'px'; + 'px';
      }
      var keydownHandler = function(event){
        if(event.keyCode === 27){
          cancel();
        }else if(pressCommandKey(event)){
          takeMargin();
        }
      }
      var keyUpHandler = function(event){
        if(pressCommandKey(event)){
          layer.style.width = parseInt(getComputedStyle(layer).width) - 6 + 'px';
          layer.style.height = parseInt(getComputedStyle(layer).height) - 6 + 'px';
          layer.style.left = parseInt(getComputedStyle(layer).left) + 3 + 'px'; + 'px';
          layer.style.top = parseInt(getComputedStyle(layer).top) + 3 + 'px'; + 'px';
        }
      }
      var cancel = function(){
        document.body.removeChild(jackup);
        document.body.removeChild(layer);
        window.removeEventListener('contextmenu', cancel);
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('keyup', keyUpHandler);
        restorationFixedElement();
      }
      window.addEventListener('contextmenu', cancel);
      document.addEventListener('keydown', keydownHandler);
      document.addEventListener('keyup', keyUpHandler);
      var selectElement = function(event){
        event.stopPropagation();
        event.preventDefault();
        allElms.forEach(function(item){
          item.removeEventListener('mouseover', moveLayer);
          item.removeEventListener('click', selectElement);
        });
        var data = {};
        var scaleObj = getZoomAndScale();
        data.w = parseFloat(layer.style.width);
        data.h = parseFloat(layer.style.height);
        data.x = window.scrollX + layer.offsetLeft;
        data.y = window.scrollY + layer.offsetTop;
        data.t = document.title;
        data.u = location.href;
        data.s = scaleObj.scale;
        data.z = scaleObj.zoom;
        data.defaultPositon = window.scrollY;
        data.innerHeight = window.innerHeight;
        document.body.removeChild(layer);
        jackup.style.height = (window.innerHeight + 30) + 'px';
        window.removeEventListener('contextmenu', cancel);
        window.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('keyup', keyUpHandler);
        if(window.innerHeight < data.h){
          //Only when required scroll
          changeFixedElementToAbsolute();
        }
        window.setTimeout(function() {
          chrome.runtime.sendMessage(chrome.runtime.id,{
            action: 'gyazoCaptureSize',
            data: data,
            tab: request.tab
          }, function(){
            restorationFixedElement();
            document.body.removeChild(jackup);
          });
        },100);
      }
      allElms.forEach(function(item){
        item.addEventListener('mouseover', moveLayer);
        item.addEventListener('click', selectElement)
      });
    },
    gyazoCapture: function() {
      var jackup = document.createElement('div');
      document.body.appendChild(jackup);
      var startX, startY, data = {};
      var tempUserSelect = document.body.style.webkitUserSelect;
      var layer = document.createElement('div');
      var pageHeight = Math.max(document.body.clientHeight, document.body.offsetHeight, document.body.scrollHeight);
      layer.style.position = 'absolute';
      layer.style.left = document.body.clientLeft + 'px';
      layer.style.top = document.body.clientTop + 'px';
      layer.style.width = document.body.clientWidth + 'px';
      layer.style.height = pageHeight + 'px';
      layer.style.zIndex = 2147483647; //Maximun number of 32bit Int
      layer.style.cursor = 'crosshair';
      document.body.style.webkitUserSelect = 'none';
      var selectionElm = document.createElement('div');
      layer.appendChild(selectionElm);
      document.body.appendChild(layer);
      selectionElm.styleUpdate = function(styles) {
        Object.keys(styles).forEach(function(key) {
          selectionElm.style[key] = styles[key];
        });
      };
      selectionElm.styleUpdate({
        background: 'rgba(92, 92, 92, 0.3)',
        position: 'absolute'
      });
      var cancelGyazo = function(){
        document.body.removeChild(layer);
        document.body.removeChild(jackup);
        document.body.style.webkitUserSelect = tempUserSelect;
        document.removeEventListener('keydown', keydownHandler);
        window.removeEventListener('contextmenu', cancelGyazo);
      }
      var keydownHandler = function(e){
        if(event.keyCode === 32){
          // If press Space bar, capture visible area
          event.preventDefault();
          cancelGyazo();
          actions.gyazoCaptureVisibleArea(request);
        }else if(e.keyCode === 27){
          // If press Esc Key, cancel it
          cancelGyazo();
        }
      };
      var mousedownHandler = function(e) {
        startX = e.pageX;
        startY = e.pageY;
        selectionElm.styleUpdate({
          border: '1px solid rgba(255, 255, 255, 0.8)',
          left: startX + 'px',
          top: startY + 'px'
        });
        layer.removeEventListener('mousedown', mousedownHandler);
        layer.addEventListener('mousemove', mousemoveHandler);
        layer.addEventListener('mouseup', mouseupHandler);
      };
      var mousemoveHandler = function(e) {
        selectionElm.styleUpdate({
          width: (Math.abs(e.pageX - startX) - 1) + 'px',
          height: (Math.abs(e.pageY - startY) - 1) + 'px',
          left: Math.min(e.pageX, startX) + 'px',
          top: Math.min(e.pageY, startY) + 'px'
        });
      };
      var mouseupHandler = function(e) {
        document.body.style.webkitUserSelect = tempUserSelect;
        document.removeEventListener('keydown', keydownHandler);
        window.addEventListener('contextmenu', function(event){
          cancelGyazo();
          event.preventDefault();
        });
        var scaleObj = getZoomAndScale();
        data.w = Math.abs(e.pageX - startX);
        data.h = Math.abs(e.pageY - startY);
        if(data.h < 1 || data.w < 1){
          document.body.removeChild(layer);
          return false;
        }
        data.x = Math.min(e.pageX, startX);
        data.y = Math.min(e.pageY, startY);
        data.t = document.title;
        data.u = location.href;
        data.s = scaleObj.scale;
        data.z = scaleObj.zoom;
        data.defaultPositon = window.scrollY;
        data.innerHeight = window.innerHeight;
        document.body.removeChild(layer);
        jackup.style.height = (window.innerHeight + 30) + 'px';
        //wait for rewrite by removeChild
        window.setTimeout(function() {
          chrome.runtime.sendMessage(chrome.runtime.id,{
            action: 'gyazoCaptureSize',
            data: data,
            tab: request.tab
          }, function(){
            document.body.removeChild(jackup);
          });
        },100);
      };
      layer.addEventListener('mousedown', mousedownHandler);
      document.addEventListener('keydown', keydownHandler);
      window.addEventListener('contextmenu', cancelGyazo);
    },
    gyazoWholeCapture: function(){
      //XXX: prevent loading twice.
      if(document.getElementsByClassName('gyazo-jackup-element').length > 0){
        return false;
      }
      var overflow = document.documentElement.style.overflow;
      var overflowY = document.documentElement.style.overflowY;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overflowY = 'hidden';
      var data = {};
      var scaleObj = getZoomAndScale();
      data.w = window.innerWidth;
      data.h = Math.max(document.body.clientHeight, document.body.offsetHeight, document.body.scrollHeight);
      data.x = 0;
      data.y = 0;
      data.t = document.title;
      data.u = location.href;
      data.s = scaleObj.scale;
      data.z = scaleObj.zoom;
      data.defaultPositon = window.scrollY;
      data.innerHeight = window.innerHeight;
      var jackup = document.createElement('div');
      jackup.classList.add('gyazo-jackup-element');
      document.body.appendChild(jackup);
      jackup.style.height = (data.h + 30) + 'px';
      chrome.runtime.sendMessage(chrome.runtime.id,{
        action: 'gyazoCaptureSize',
        data: data,
        tab: request.tab,
        notificationId: request.notificationId
      }, function(){
        console.log(jackup)
        document.body.removeChild(jackup);
        document.documentElement.style.overflow = overflow;
        document.documentElement.style.overflowY = overflowY;
      });
    }
  };
  if(request.action in actions){
    actions[request.action]();
  }
});
})()
