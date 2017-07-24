import thenChrome from 'then-chrome'
import browserInfo from 'bowser'
import {trimImage, appendImageToCanvas} from './canvasUtils'
import postToGyazo from './postToGyazo'
import waitForDelay from './waitForDelay'
import toJpegDataURL from './convertAdjustmentJpegQuality'

export default (request, sender, sendResponse) => {
  // XXX: Firefox WebExtension returns real size image
  if (browserInfo.firefox) request.data.s = 1
  const baseCanvas = document.createElement('canvas')
  baseCanvas.height = request.data.h * request.data.z * request.data.s
  baseCanvas.width = request.data.w * request.data.z * request.data.s
  let lastLineWidth = null
  const capture = async (scrollHeight = 0, scrollWidth = 0, lastImageBottom, lastImageRight, lastImageData) => {
    // If capture is finished, upload captured image
    if (scrollHeight >= request.data.h && scrollWidth + request.tab.width >= request.data.w) {
      chrome.tabs.executeScript(request.tab.id, {
        code: 'window.scrollTo(' + request.data.positionX + ', ' + request.data.positionY + ' )'
      })
      let uploadImage = baseCanvas.toDataURL()
      if (uploadImage.length > 3 * 1024 * 1024 /* = 3 MB */) {
        uploadImage = toJpegDataURL(baseCanvas)
      }
      postToGyazo(request.tab.id, {
        imageData: uploadImage,
        title: request.data.t,
        url: request.data.u,
        width: request.data.w,
        height: request.data.h,
        scale: request.data.s,
        desc: request.data.desc
      })
      return sendResponse()
    }

    if (scrollHeight >= request.data.h) {
      scrollHeight = 0
      lastImageBottom = 0
      if (scrollWidth + (request.tab.width * 2) >= request.data.w) {
        lastLineWidth = request.data.w - scrollWidth - request.tab.width
        scrollWidth += lastLineWidth
      } else {
        scrollWidth += request.tab.width
      }
    }
    const imagePositionTop = lastImageBottom || scrollHeight * request.data.z * request.data.s
    const offsetTop = request.data.y - request.data.positionY
    const imagePositionLeft = lastImageRight || scrollWidth * request.data.z * request.data.s
    const offsetLeft = request.data.x - request.data.positionX
    if (
      scrollHeight === 0 && offsetTop >= 0 && offsetTop + request.data.h <= request.tab.height &&
      scrollWidth === 0 && offsetLeft >= 0 && offsetLeft + request.data.w <= request.tab.width
    ) {
      // Capture in window (not require scroll)
      const captureData = await thenChrome.tabs.captureVisibleTab(null, {format: 'png'})
      if (lastImageData === captureData) {
        // retry
        return capture(scrollHeight, scrollWidth, lastImageBottom, lastImageRight, captureData)
      }
      const trimedImageCanvas = await trimImage({
        imageData: captureData,
        scale: request.data.s,
        zoom: request.data.z,
        startX: request.data.x - request.data.positionX,
        startY: offsetTop,
        width: request.data.w,
        height: Math.min(request.tab.height, request.data.h - scrollHeight)
      })
      await appendImageToCanvas({
        canvas: baseCanvas,
        imageSrc: trimedImageCanvas.toDataURL(),
        height: Math.min(request.tab.height, request.data.h - scrollHeight),
        width: request.data.w,
        top: 0,
        left: 0,
        scale: request.data.s,
        zoom: request.data.z
      })
      scrollHeight += request.tab.height
      capture(scrollHeight, scrollWidth)
      return
    }
    await thenChrome.tabs.sendMessage(request.tab.id, {
      target: 'content',
      action: 'changeFixedElementToAbsolute'
    })

    let scrollToX = scrollWidth + request.data.x
    let scrollToY = scrollHeight + request.data.y

    if (scrollToX + request.tab.width > request.data.documentWidth) {
      if (request.tab.width === request.data.documentWidth) {
        scrollToX = 0
      } else {
        scrollToX = scrollWidth + (scrollToX + request.tab.width - request.data.documentWidth)
      }
    }

    await thenChrome.tabs.sendMessage(request.tab.id, {
      target: 'content',
      action: 'waitScroll',
      scrollToX,
      scrollToY
    })

    const data = await thenChrome.tabs.captureVisibleTab(null, {format: 'png'})
    if (lastImageData === data) {
      // retry
      return capture(scrollHeight, scrollWidth, lastImageBottom, lastImageRight, data)
    }
    let startX = 0
    let width = lastLineWidth || request.tab.width
    if (lastLineWidth) {
      startX = request.tab.width - lastLineWidth
    } else if (scrollToX === 0) {
      startX = request.data.x
      width -= request.data.x
    }

    const trimedImageCanvas = await trimImage({
      imageData: data,
      scale: request.data.s,
      zoom: request.data.z,
      startX,
      startY: 0,
      width,
      height: Math.min(request.tab.height, request.data.h - scrollHeight)
    })
    let [_lastImageBottom, _lastImageRight] = await appendImageToCanvas({
      canvas: baseCanvas,
      imageSrc: trimedImageCanvas.toDataURL(),
      height: Math.min(request.tab.height, request.data.h - scrollHeight),
      width,
      top: imagePositionTop,
      left: imagePositionLeft,
      scale: request.data.s,
      zoom: request.data.z
    })
    scrollHeight += request.tab.height

    if (_lastImageBottom < request.data.h * request.data.s * request.data.z) {
      _lastImageRight = lastImageRight
    }

    waitForDelay(function () {
      capture(scrollHeight, scrollWidth, _lastImageBottom, _lastImageRight, data)
    })
  }
  waitForDelay(capture)
}
