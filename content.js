(function() {

if(/gyazo\.com/.test(location.hostname)){
  document.documentElement.setAttribute("data-extension-installed", true);
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  var actions = {
    gyazoSelectElm: function() {
      //XXX: prevent loading twice.
      if(document.getElementsByClassName('gyazo-crop-select-element').length > 0){
        return false;
      }
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
      var keydownHandler = function(event){
        if(event.keyCode === 27){
          cancel();
        }
      }
      var cancel = function(){
        document.body.removeChild(layer);
        window.removeEventListener('contextmenu', cancel);
        document.removeEventListener('keydown', keydownHandler);
        restorationFixedElement();
      }
      window.addEventListener('contextmenu', cancel);
      document.addEventListener('keydown', keydownHandler);
      var selectElement = function(event){
        event.stopPropagation();
        event.preventDefault();
        allElms.forEach(function(item){
          item.removeEventListener('mouseover', moveLayer);
          item.removeEventListener('click', selectElement);
        });
        var data = {};
        var zoom = Math.round(window.outerWidth / window.innerWidth * 100) / 100;
        var scale = window.devicePixelRatio / zoom;
        data.w = parseFloat(layer.style.width);
        data.h = parseFloat(layer.style.height);
        data.x = window.scrollX + layer.offsetLeft;
        data.y = window.scrollY + layer.offsetTop;
        data.t = document.title;
        data.u = location.href;
        data.s = scale;
        data.z = zoom;
        data.defaultPositon = window.scrollY;
        data.innerHeight = window.innerHeight;
        document.body.removeChild(layer);
        window.removeEventListener('contextmenu', cancel);
        window.removeEventListener('keydown', keydownHandler);
        changeFixedElementToAbsolute();
        window.setTimeout(function() {
          chrome.runtime.sendMessage(chrome.runtime.id,{
            action: 'gyazoCaptureSize',
            data: data
          }, function(){
            restorationFixedElement();
          });
        },100);
      }
      allElms.forEach(function(item){
        item.addEventListener('mouseover', moveLayer);
        item.addEventListener('click', selectElement)
      });
    },
    gyazoCapture: function() {
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
        document.body.style.webkitUserSelect = tempUserSelect;
        document.removeEventListener('keydown', keydownHandler);
        window.removeEventListener('contextmenu', cancelGyazo);
      }
      var keydownHandler = function(e){
        // If press Esc Key, cancel it
        if(e.keyCode === 27){
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
        var zoom = Math.round(window.outerWidth / window.innerWidth * 100) / 100;
        var scale = window.devicePixelRatio / zoom;
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
        data.s = scale;
        data.z = zoom;
        data.defaultPositon = window.scrollY;
        data.innerHeight = window.innerHeight;
        document.body.removeChild(layer);
        //wait for rewrite by removeChild
        window.setTimeout(function() {
          chrome.runtime.sendMessage(chrome.runtime.id,{
            action: 'gyazoCaptureSize',
            data: data
          }, function(){});
        },100);
      };
      layer.addEventListener('mousedown', mousedownHandler);
      document.addEventListener('keydown', keydownHandler);
      window.addEventListener('contextmenu', cancelGyazo);
    },
    wholeCaptureInit: function() {
      var context = request.context;
      context.scrollY = window.scrollY;
      context.overflow = document.documentElement.style.overflow;
      context.overflowY = document.documentElement.style.overflowY;
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overflowY = 'hidden';
      //I want some fixed element not to follow scrolling
      changeFixedElementToAbsolute();
      window.scroll(0, 0);
      var zoom = Math.round(window.outerWidth / window.innerWidth * 100) / 100;
	  var windowInnerHeight = window.innerHeight;
	  // XXX: on Windows, when window is not maximum, it should tweak zoom.(Chrome zoom level 1 is 1.10)
	  var isWindows = navigator.platform.match(/^win/i);
	  var isMaximum = (window.outerHeight === screen.availHeight && window.outerWidth === screen.availWidth);
	  if( isWindows && !isMaximum && 1.00 < zoom && zoom < 1.05){
	  	zoom = 1.00;
	  };
      var data = {
        width: window.outerWidth,
        height: Math.max(document.body.clientHeight, document.body.offsetHeight, document.body.scrollHeight),
        windowInnerHeight: window.innerHeight,
        title: document.title,
        url: location.href,
        captureTop: 0,
        captureButtom: window.innerHeight * zoom,
        scrollPositionY: 0,
        scale: window.devicePixelRatio / zoom,
        zoom: zoom
      };
      //waiting for repaint after scroll
      window.setTimeout(function(){
        chrome.runtime.sendMessage(chrome.runtime.id,{
          action: 'wholeCaptureManager',
          data: data,
          context: context
        });
      }, 50);
    },
    scrollNextPage: function(){
      var data = request.data;
      var captureTop = data.captureButtom;
      var captureButtom = captureTop + data.windowInnerHeight * data.zoom;
      var scrollPositionY = data.scrollPositionY + data.windowInnerHeight;
      window.scroll(0, scrollPositionY);
      data.captureTop = captureTop;
      data.captureButtom = captureButtom;
      data.scrollPositionY = scrollPositionY;
      //I want some fixed element not to follow scrolling
      window.setTimeout(function(){
        changeFixedElementToAbsolute();
        window.setTimeout(function(){
          chrome.runtime.sendMessage(chrome.runtime.id,{
            action: 'wholeCaptureManager',
            canvasData: request.canvasData,
            data: data,
            context: request.context
          });
        },0);
      }, 50);
    },
    wholeCaptureFinish: function(){
      document.documentElement.style.overflow = request.context.overflow;
      document.documentElement.style.overflowY = request.context.overflowY;
      restorationFixedElement();
      window.scroll(0, request.context.scrollY);
    }
  };
  if(request.action in actions){
    actions[request.action]();
  }
});
})()
