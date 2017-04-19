import thenChrome from 'then-chrome'
import browserInfo from 'bowser'
import {trimImage, appendImageToCanvas} from './canvasUtils'
import postToGyazo from './postToGyazo'
import waitForDelay from './waitForDelay'

export default (request, sender, sendResponse) => {
  // XXX: Firefox WebExtension returns real size image
  if (browserInfo.firefox) request.data.s = 1
  const c = document.createElement('canvas')
  c.height = request.data.h
  c.width = request.data.w * request.data.z * request.data.s
  let canvasData = c.toDataURL()
  const capture = function (scrollHeight, lastImageBottom, lastImageData) {
    const imagePositionTop = lastImageBottom || scrollHeight * request.data.z * request.data.s
    const offsetTop = request.data.y - request.data.positionY
    if (scrollHeight === 0 && offsetTop >= 0 && offsetTop + request.data.h <= request.data.innerHeight) {
      // Capture in window (not require scroll)
      thenChrome.tabs.captureVisibleTab(null, {format: 'png'})
      .then((data) => {
        if (lastImageData === data) {
          // retry
          return capture(scrollHeight, lastImageBottom, data)
        }
        trimImage({
          imageData: data,
          scale: request.data.s,
          zoom: request.data.z,
          startX: request.data.x - request.data.positionX,
          startY: offsetTop,
          width: request.data.w,
          height: Math.min(request.data.innerHeight, request.data.h - scrollHeight)
        })
        .then((_canvas) => {
          return appendImageToCanvas({
            canvasData: canvasData,
            imageSrc: _canvas.toDataURL(),
            pageHeight: request.data.h,
            imageHeight: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
            width: request.data.w,
            top: 0,
            scale: request.data.s,
            zoom: request.data.z
          })
        })
        .then((_canvas) => {
          canvasData = _canvas.toDataURL()
          scrollHeight += request.data.innerHeight
          capture(scrollHeight)
        })
      })
      return
    }
    if (scrollHeight >= request.data.h) {
      chrome.tabs.executeScript(request.tab.id, {
        code: 'window.scrollTo(' + request.data.positionX + ', ' + request.data.positionY + ' )'
      })
      postToGyazo(request.tab.id, {
        imageData: canvasData,
        title: request.data.t,
        url: request.data.u,
        width: request.data.w,
        height: request.data.h,
        scale: request.data.s,
        desc: request.data.desc
      })
      return sendResponse()
    }
    thenChrome.tabs.executeScript(request.tab.id, {
      code: 'window.scrollTo(' + request.data.positionX + ', ' + (scrollHeight + request.data.y) + ' )'
    })
      .then(() => {
        return thenChrome.tabs.sendMessage(request.tab.id, {
          target: 'content',
          action: 'changeFixedElementToAbsolute',
          scrollTo: {x: request.data.positionX, y: scrollHeight + request.data.y}
        })
      })
      .then(() => {
        return thenChrome.tabs.captureVisibleTab(null, {format: 'png'})
      })
      .then((data) => {
        if (lastImageData === data) {
          // retry
          return capture(scrollHeight, lastImageBottom, data)
        }
        trimImage({
          imageData: data,
          scale: request.data.s,
          zoom: request.data.z,
          startX: request.data.x - request.data.positionX,
          startY: 0,
          width: request.data.w,
          height: Math.min(request.data.innerHeight, request.data.h - scrollHeight)
        })
        .then((_canvas) => {
          return appendImageToCanvas({
            canvasData: canvasData,
            imageSrc: _canvas.toDataURL(),
            pageHeight: request.data.h,
            imageHeight: Math.min(request.data.innerHeight, request.data.h - scrollHeight),
            width: request.data.w,
            top: imagePositionTop,
            scale: request.data.s,
            zoom: request.data.z
          })
        })
        .then((_canvas, lastImageBottom) => {
          canvasData = _canvas.toDataURL()
          scrollHeight += request.data.innerHeight
          waitForDelay(function () {
            capture(scrollHeight, lastImageBottom, data)
          })
        })
      })
  }
  capture(0)
}
