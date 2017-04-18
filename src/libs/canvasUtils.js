function imageLoader (imgSrc, callback) {
  const img = new Image()
  img.onload = function () {
    callback(img)
  }
  img.src = imgSrc
}

export const appendImageToCanvas = function (argObj) {
  const scale = argObj.scale || 1.0
  const zoom = argObj.zoom || 1.0
  const pageHeight = argObj.pageHeight * zoom
  const {width, top, callback, imageHeight, imageSrc} = argObj
  let canvasData = {argObj}
  // If 1st argument is Object (maybe <canvas>), convert to dataURL.
  if (typeof canvasData === 'object') {
    canvasData = canvasData.toDataURL()
  }
  const canvas = document.createElement('canvas')
  canvas.width = width * zoom * scale
  canvas.height = pageHeight * scale
  const ctx = canvas.getContext('2d')
  imageLoader(canvasData, function (img) {
    ctx.drawImage(img, 0, 0)
    imageLoader(imageSrc, function (img) {
      ctx.drawImage(img, 0, 0, width * scale * zoom, imageHeight * scale * zoom, 0, top, img.width, img.height)
      const lastImageBottom = top + img.height
      callback(canvas, lastImageBottom)
    })
  })
}

export const trimImage = function (argObj) {
  const scale = argObj.scale || 1.0
  const zoom = argObj.zoom || 1.0
  const {imageData} = argObj
  let startX = argObj.startX * zoom * scale
  let startY = argObj.startY * zoom * scale
  let width = argObj.width * zoom * scale
  let height = argObj.height * zoom * scale
  const callback = argObj.callback || function () {}
  if (typeof imageData === 'string' && imageData.substr(0, 5) === 'data:') {
    imageLoader(imageData, function (img) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, startX, startY, width, height, 0, 0, width, height)
      callback(canvas)
    })
  } else if (typeof imageData === 'object') {
    // maybe <canvas>
    this.appendImageToCanvas({
      canvasData: document.createElement('canvas'),
      imageSrc: imageData,
      pageHeight: height,
      imageHeight: height,
      width,
      top: 0,
      scale,
      zoom,
      callback: function (canvas) {
        const ctx = canvas.getContext('2d')
        const originalWidth = width
        const originalHeight = height
        startX *= scale
        startY *= scale
        height *= scale * zoom
        width *= scale * zoom
        imageLoader(canvas.toDataURL('image/png'), function (img) {
          ctx.drawImage(img, startX, startY, width, height, 0, 0, originalWidth, originalHeight)
          callback(canvas)
        })
      }
    })
  }
}
