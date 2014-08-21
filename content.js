(function() {
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  var actions = {
    gyazoCapture: function() {
      var startX, startY, data = {};
      var tempUserSelect = document.body.style.webkitUserSelect;
      var layer = document.createElement('div');
      layer.style.position = 'fixed';
      layer.style.left = document.body.clientLeft;
      layer.style.top = document.body.clientTop;
      layer.style.width = document.body.clientWidth + 'px';
      layer.style.height = document.body.clientHeight + 'px';
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
        position: 'fixed'
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
        startX = e.clientX;
        startY = e.clientY;
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
          width: (Math.abs(e.clientX - startX) - 1) + 'px',
          height: (Math.abs(e.clientY - startY) - 1) + 'px',
          left: Math.min(e.clientX, startX) + 'px',
          top: Math.min(e.clientY, startY) + 'px'
        });
      };
      var mouseupHandler = function(e) {
        document.body.style.webkitUserSelect = tempUserSelect;
        document.removeEventListener('keydown', keydownHandler);
        window.addEventListener('contextmenu', function(event){
          cancelGyazo();
          event.preventDefault();
        });
        data.w = Math.abs(e.clientX - startX);
        data.h = Math.abs(e.clientY - startY);
        if(data.h < 1 || data.w < 1){
          document.body.removeChild(layer);
          return false;
        }
        data.x = Math.min(e.clientX, startX);
        data.y = Math.min(e.clientY, startY);
        data.t = document.title;
        data.u = location.href;
        data.s = window.devicePixelRatio;
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
      layer.addEventListener('mousedown',mousedownHandler);
    },
    'gyazoWhole': function(){
      var captureTop = request.data.captureButtom || 0;
      var captureButtom = captureTop + window.innerHeight;
      var bodyHeight = request.data.height || document.body.clientHeight;
      window.scroll(0, captureTop);
      var data = {
        width: request.data.width || document.body.clientWidth,
        height: bodyHeight,
        windowInnerHeight: window.innerHeight,
        title: request.data.title || document.title,
        url: request.data.url || location.href,
        finish: (bodyHeight <= captureButtom),
        captureTop: captureTop,
        captureButtom: captureButtom
      };
      window.setTimeout(function(){
        chrome.runtime.sendMessage(chrome.runtime.id,{
          action: 'gyazoWholeCapture',
          data: data,
          context: request.context
        });
      }, 50);
    }
  };
  if(request.action in actions){
    actions[request.action]();
  }
});
})()