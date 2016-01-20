const delegate = require('delegate')
const css = require('dom-css')
const extend = require('xtend')
const gyazoIdFromUrl = require('./lib/gyazoIdFromUrl')
const adjacentStyle = require('./lib/adjacentStyle')
const waitFor = require('./lib/waitFor')

function fetchImage (url, callback) {
  chrome.runtime.sendMessage(chrome.runtime.id, {
    action: 'gyazoGetImageBlob',
    gyazoUrl: url
  }, (response) => {
    const xhr = new window.XMLHttpRequest()
    xhr.open('GET', response.imageBlobUrl, true)
    xhr.responseType = 'arraybuffer'
    xhr.onload = () => {
      const blob = new window.Blob([xhr.response], { type: 'image/png' })

      callback(null, blob)
    }
    xhr.onerror = (e) => {
      callback(e)
    }
    xhr.send()
  })
}

function createLoader (position = {}) {
  const loader = document.createElement('div')
  loader.innerHTML = `<div class='gz-circle-loader'></div>`

  css(loader, extend({
    position: 'fixed',
    boxShadow: '0 0 8px rgba(0,0,0,.6)',
    backgroundColor: '#fff',
    zIndex: 1000000,
    width: 40,
    height: 40,
    padding: 4,
    boxSizing: 'border-box'
  }, position))

  return loader
}

function createImagePreview ({ url, boxStyle }) {
  const img = document.createElement('img')
  img.src = url

  css(img, extend({
    display: 'inline-block',
    position: 'fixed',
    zIndex: 1000000,
    backgroundColor: '#fff',
    maxWidth: 500,
    boxShadow: '0 0 8px rgba(0,0,0,.6)'
  }, boxStyle))

  return img
}

delegate(document.body, 'a', 'mouseover', (event) => {
  const element = event.target
  const href = element.getAttribute('href')

  if (element.querySelector('img')) return

  const isGyazoUrl = !!gyazoIdFromUrl(href)
  if (isGyazoUrl) {
    let container

    let loader = createLoader(adjacentStyle(element))
    document.body.appendChild(loader)

    let leaved = false

    const onLeave = (event = {}) => {
      leaved = true

      if (event.target && element !== event.target) return
      if (container) document.body.removeChild(container)
      if (loader) document.body.removeChild(loader)

      element.removeEventListener('mouseleave', onLeave)
    }

    const cancel = waitFor(() => !element.offsetParent, onLeave)

    element.addEventListener('mouseleave', onLeave)
    element.addEventListener('mouseleave', cancel)

    fetchImage(href, (e, blob) => {
      if (leaved) return

      document.body.removeChild(loader)
      loader = null

      container = createImagePreview({
        url: window.URL.createObjectURL(blob),
        boxStyle: adjacentStyle(element)
      })

      document.body.appendChild(container)
    })
  }
})
