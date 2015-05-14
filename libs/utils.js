function imageLoader(imgSrc ,callback){
  var img = new Image();
  img.onload = function(){
    callback(img);
  }
  img.src = imgSrc;
}

function saveToClipboard(str) {
    var textArea = document.createElement('textarea');
    textArea.style.cssText = 'position:absolute;left:-100%';

    document.body.appendChild(textArea);

    textArea.value = str;
    textArea.select();
    document.execCommand('copy');

    document.body.removeChild(textArea);
}


var canvasUtils = {
  appendImageToCanvas: function(argObj) {
    var scale = argObj.scale || 1.0;
    var zoom = argObj.zoom || 1.0;
    var canvasData = argObj.canvasData;
    var imageSrc = argObj.imageSrc;
    var pageHeight = argObj.pageHeight * zoom;
    var imageHeight = argObj.imageHeight;
    var width = argObj.width;
    var top = argObj.top;
    var callback = argObj.callback;
    // If 1st argument is Object (maybe <canvas>), convert to dataURL.
    if(typeof canvasData === 'object'){
      canvasData = canvasData.toDataURL();
    }
    var canvas = document.createElement('canvas');
    canvas.width = width * zoom * scale;
    canvas.height = pageHeight * scale;
    var ctx = canvas.getContext('2d');
    imageLoader(canvasData, function(img) {
      ctx.drawImage(img, 0, 0);
      imageLoader(imageSrc, function(img) {
        ctx.drawImage(img, 0, 0, width * scale * zoom, imageHeight * scale * zoom, 0, top, img.width, img.height);
        lastImageBottom = top + img.height;
        callback(canvas, lastImageBottom);
      })
    });
  },
  trimImage: function(argObj) {
    var scale = argObj.scale  || 1.0;
    var zoom = argObj.zoom || 1.0;
    var imageData = argObj.imageData;
    var startX = argObj.startX * zoom * scale;
    var startY = argObj.startY * zoom * scale;
    var width = argObj.width * zoom * scale;
    var height = argObj.height * zoom * scale;
    var callback = argObj.callback || function(){};
    if(typeof imageData === 'string' && imageData.substr(0,5) === 'data:'){
      imageLoader(imageData, function(img){
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, startX, startY, width, height, 0, 0, width, height);
        callback(canvas);
      })
    }else if(typeof imageData === 'object'){
      //maybe <canvas>
      this.appendImageToCanvas({
        canvasData: document.createElement('canvas'),
        imageSrc: imageData,
        pageHeight: height,
        imageHeight: height,
        width: width,
        top: 0,
        scale: scale,
        zoom: zoom,
        callback: function(canvas){
          var ctx = canvas.getContext('2d');
          var originalWidth = width;
          var originalHeight = height;
          startX *= scale;
          startY *= scale;
          height *= scale * zoom;
          width *= scale * zoom;
          imageLoader(canvas.toDataURL('image/png'), function(img){
            ctx.drawImage(img, startX, startY, width, height, 0, 0, originalWidth, originalHeight);
            callback(canvas);
          })
      }})
    }
  }
}
