'use strict'

module.exports = function adjacentStyle (element) {
  const rect = element.getBoundingClientRect()

  const offsetY = 20
  const centerY = Math.floor(window.innerHeight / 2)

  if (rect.top > centerY) {
    return {
      left: rect.left,
      bottom: Math.round((window.innerHeight - rect.top + offsetY)),
      maxHeight: Math.round(Math.min(rect.top - offsetY * 2, 500))
    }
  } else {
    const rectBottom = rect.top + rect.height
    return {
      left: rect.left,
      top: Math.round(rectBottom + offsetY),
      maxHeight: Math.round(Math.min(window.innerHeight - rectBottom - offsetY * 2, 500))
    }
  }
}
