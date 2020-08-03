function imageLoader(imgSrc, callback) {
  const img = new window.Image();
  img.onload = function () {
    callback(img);
  };
  img.src = imgSrc;
}

export const appendImageToCanvas = (argObj) =>
  new Promise((resolve) => {
    const scale = argObj.scale || 1.0;
    const zoom = argObj.zoom || 1.0;
    const { canvas, width, top, left, height, imageSrc } = argObj;
    const ctx = canvas.getContext('2d');
    imageLoader(imageSrc, function (img) {
      ctx.drawImage(
        img,
        0,
        0,
        width * scale * zoom,
        height * scale * zoom,
        left,
        top,
        img.width,
        img.height
      );
      const lastImageBottom = top + img.height;
      const lastImageRight = left + img.width;
      resolve([lastImageBottom, lastImageRight]);
    });
  });

export const trimImage = (argObj) =>
  new Promise((resolve) => {
    const scale = argObj.scale || 1.0;
    const zoom = argObj.zoom || 1.0;
    const { imageData } = argObj;
    let startX = argObj.startX * zoom * scale;
    let startY = argObj.startY * zoom * scale;
    let width = argObj.width * zoom * scale;
    let height = argObj.height * zoom * scale;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (typeof imageData === 'string' && imageData.substr(0, 5) === 'data:') {
      imageLoader(imageData, function (img) {
        ctx.drawImage(img, startX, startY, width, height, 0, 0, width, height);
        resolve(canvas);
      });
    } else if (typeof imageData === 'object') {
      // maybe <canvas>
      const originalWidth = width;
      const originalHeight = height;
      startX *= scale;
      startY *= scale;
      height *= scale * zoom;
      width *= scale * zoom;
      ctx.drawImage(
        imageData,
        startX,
        startY,
        width,
        height,
        0,
        0,
        originalWidth,
        originalHeight
      );
      resolve(canvas);
    }
  });
