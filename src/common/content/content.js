(function () {
  if (window.__embededGyazoContentJS) {
    return
  }
  window.__embededGyazoContentJS = true
  const browser = require('bowser')
  const storage = require('../libs/storageSwitcher')
  const ESC_KEY_CODE = 27
  const JACKUP_HEIGHT = 30
  const REMOVE_GYAZOMENU_EVENT = new window.Event('removeGyazoMenu')

  if (/gyazo\.com/.test(location.hostname)) {
    document.documentElement.setAttribute('data-extension-installed', true)
  }

  function isPressCommandKey (event) {
    //  Return true when
    //  Press CommandKey on MacOSX or CtrlKey on Windows or Linux
    if (!(event instanceof MouseEvent || event instanceof KeyboardEvent)) {
      return false
    }
    if (navigator.platform.match(/mac/i)) {
      return event.metaKey || event.keyIdentifier === 'Meta'
    } else {
      return event.ctrlKey || event.keyIdentifier === 'Control'
    }
  }

  function changeFixedElementToAbsolute () {
    Array.prototype.slice.apply(document.querySelectorAll('*')).filter(function (item) {
      return (window.getComputedStyle(item).position === 'fixed')
    }).forEach(function (item) {
      item.classList.add('gyazo-whole-capture-onetime-absolute')
      item.style.setProperty('position', 'absolute', 'important')
    })
  }

  function restoreFixedElement () {
    var fixedElms = document.getElementsByClassName('gyazo-whole-capture-onetime-absolute')
    Array.prototype.slice.apply(fixedElms).forEach(function (item) {
      item.classList.remove('gyazo-whole-capture-onetime-absolute')
      item.style.position = 'fixed'
    })
  }

  function lockScroll () {
    var overflow = document.documentElement.style.overflow
    var overflowY = document.documentElement.style.overflowY
    var marginRight = document.documentElement.style.marginRight
    var _w = document.documentElement.getBoundingClientRect().width
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overflowY = 'hidden'
    var w = document.documentElement.getBoundingClientRect().width
    var scrollBarWidth = w - _w
    return {overflow: overflow, overflowY: overflowY, marginRight: marginRight, scrollBarWidth: scrollBarWidth}
  }

  function unlockScroll (old) {
    old = old || {overflow: 'auto', overflowY: 'auto'}
    document.documentElement.style.overflow = old.overflow
    document.documentElement.style.overflowY = old.overflowY
    document.documentElement.style.marginRight = old.marginRight
  }

  function packScrollBar (old) {
    document.documentElement.style.marginRight = `${old.scrollBarWidth}px`
  }

  function getZoomAndScale () {
    var zoom = Math.round(window.outerWidth / window.innerWidth * 100) / 100
    // XXX: on Windows, when window is not maximum, it should tweak zoom.(Chrome zoom level 1 is 1.10)
    var isWindows = navigator.platform.match(/^win/i)
    var isMaximum = (window.outerHeight === screen.availHeight && window.outerWidth === screen.availWidth)
    if (isWindows && !isMaximum && zoom > 1.00 && zoom < 1.05) {
      zoom = 1.00
    }
    var scale = window.devicePixelRatio / zoom
    return {
      zoom: zoom,
      scale: scale
    }
  }

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var actions = {
      notification: function () {
        let notificationContainer = document.querySelector('.gyazo-menu.gyazo-menu-element.gyazo-notification') || document.querySelector('.gyazo-menu.gyazo-notification')
        if (notificationContainer) {
          notificationContainer.classList.add('gyazo-notification')
        } else {
          notificationContainer = document.createElement('div')
          notificationContainer.className = 'gyazo-menu gyazo-notification'
          document.body.appendChild(notificationContainer)
        }
        let title = document.createTextNode('')
        let message = document.createTextNode('')
        if (request.title) {
          title = document.createElement('div')
          title.className = 'gyazo-notification-title'
          title.textContent = request.title
        }
        if (request.message) {
          message = document.createElement('div')
          message.className = 'gyazo-notification-message'
          message.textContent = request.message
        }
        let showImage = document.createElement('div')
        if (request.imagePageUrl) {
          const imageContainer = document.createElement('a')
          imageContainer.href = request.imagePageUrl
          imageContainer.target = '_blank'
          showImage.appendChild(imageContainer)
          const imageElem = document.createElement('img')
          imageElem.className = 'image'
          imageElem.src = request.imageUrl
          imageContainer.appendChild(imageElem)
          showImage.appendChild(document.createElement('br'))
          const imageInfo = document.createElement('div')
          imageInfo.className = 'gyazo-notification-image-info'
          showImage.appendChild(imageInfo)
          const infoSpan = document.createElement('span')
          infoSpan.textContent = document.title
          imageInfo.appendChild(infoSpan)
          const imageHost = document.createElement('div')
          imageHost.className = 'gyazo-notification-image-host'
          showImage.appendChild(imageHost)
          imageHost.textContent = location.host
        } else {
          const loadingElm = document.createElement('span')
          loadingElm.className = 'gyazo-spin'
          window.fetch(chrome.runtime.getURL('imgs/spinner.svg'))
            .then((res) => res.text())
            .then((text) => {
              loadingElm.innerHTML = text
            })
          showImage.appendChild(loadingElm)
        }
        notificationContainer.innerHTML = ''
        notificationContainer.appendChild(title)
        notificationContainer.appendChild(message)
        notificationContainer.appendChild(showImage)
        if (request.isFinish) {
          notificationContainer.querySelector('.image').addEventListener('load', function () {
            window.setTimeout(function () {
              if (document.body.contains(notificationContainer)) {
                document.body.removeChild(notificationContainer)
              }
            }, 5000)
          })
        }
        sendResponse()
      },
      insertMenu: function () {
        let gyazoMenu = document.querySelector('.gyazo-menu:not(.gyazo-notification)')
        if (gyazoMenu) {
          document.body.removeChild(gyazoMenu)
          window.dispatchEvent(REMOVE_GYAZOMENU_EVENT)
          return true
        }
        let hideMenu = function () {
          if (document.body.contains(gyazoMenu)) {
            document.body.removeChild(gyazoMenu)
          }
          window.dispatchEvent(REMOVE_GYAZOMENU_EVENT)
        }
        gyazoMenu = document.createElement('div')
        gyazoMenu.className = 'gyazo-menu gyazo-menu-element'

        let createButton = function (loadSvgName, text, shortcutKey) {
          let btn = document.createElement('div')
          btn.className = 'gyazo-big-button gyazo-button gyazo-menu-element'

          if (shortcutKey) {
            btn.setAttribute('title', 'Press: ' + shortcutKey)
          }

          let iconElm = document.createElement('div')
          iconElm.classList.add('gyazo-button-icon')

          window.fetch(chrome.runtime.getURL(`imgs/${loadSvgName}.svg`))
            .then((res) => res.text())
            .then((text) => iconElm.innerHTML = text)

          let textElm = document.createElement('div')
          textElm.className = 'gyazo-button-text'
          textElm.textContent = text

          btn.appendChild(iconElm)
          btn.appendChild(textElm)

          return btn
        }

        let selectElementBtn = createButton('selection', chrome.i18n.getMessage('selectElement'), 'E')
        let selectAreaBtn = createButton('crop', chrome.i18n.getMessage('selectArea'), 'S')
        let windowCaptureBtn = createButton('window', chrome.i18n.getMessage('captureWindow'), 'P')
        let wholeCaptureBtn = createButton('window-scroll', chrome.i18n.getMessage('topToBottom'), 'W')
        let myImageBtn = createButton('grid', chrome.i18n.getMessage('myImage'))
        myImageBtn.classList.add('gyazo-menu-myimage')
        let closeBtn = document.createElement('div')
        closeBtn.className = 'gyazo-close-button gyazo-menu-element'
        const closeBtnIcon = document.createElement('div')
        closeBtnIcon.className = 'gyazo-menu-element gyazo-icon gyazo-icon-cross'
        closeBtn.appendChild(closeBtnIcon)
        window.fetch(chrome.runtime.getURL('imgs/cross.svg'))
          .then((res) => res.text())
          .then((text) => closeBtnIcon.innerHTML = text)
        closeBtn.setAttribute('title', 'Press: Escape')

        window.addEventListener('contextmenu', function (event) {
          hideMenu()
        })
        document.body.appendChild(gyazoMenu)
        gyazoMenu.appendChild(selectElementBtn)
        gyazoMenu.appendChild(selectAreaBtn)
        gyazoMenu.appendChild(windowCaptureBtn)
        gyazoMenu.appendChild(wholeCaptureBtn)
        gyazoMenu.appendChild(myImageBtn)
        gyazoMenu.appendChild(closeBtn)

        let hotKey = function (event) {
          window.removeEventListener('keydown', hotKey)
          if (event.keyCode === ESC_KEY_CODE) {
            hideMenu()
          }
          switch (String.fromCharCode(event.keyCode)) {
            case 'E':
              selectElementBtn.click()
              break
            case 'S':
              selectAreaBtn.click()
              break
            case 'P':
              windowCaptureBtn.click()
              break
            case 'W':
              wholeCaptureBtn.click()
              break
          }
        }
        window.addEventListener('keydown', hotKey)
        try {
          // Provide access to chrome.storage at content script https://bugzilla.mozilla.org/show_bug.cgi?id=1197346
          storage.get({behavior: 'element'}, function (item) {
            if (item.behavior === 'element') {
              // Default behavior is select element
              selectElementBtn.classList.add('gyazo-button-active')
              window.requestAnimationFrame(actions.gyazoSelectElm)
            } else if (item.behavior === 'area') {
              // Default behavior is select area
              selectAreaBtn.classList.add('gyazo-button-active')
              actions.gyazoCaptureSelectedArea()
            }
          })
        } catch (e) {
          selectAreaBtn.classList.add('gyazo-button-active')
          actions.gyazoCaptureSelectedArea()
        }
        selectAreaBtn.addEventListener('click', function () {
          hideMenu()
          window.requestAnimationFrame(function () {
            actions.gyazoCaptureSelectedArea()
          })
        })
        selectElementBtn.addEventListener('click', function () {
          hideMenu()
          window.requestAnimationFrame(function () {
            actions.gyazoSelectElm()
          })
        })
        windowCaptureBtn.addEventListener('click', function () {
          hideMenu()
          window.requestAnimationFrame(function () {
            actions.gyazocaptureWindow()
          })
        })
        wholeCaptureBtn.addEventListener('click', function () {
          hideMenu()
          window.requestAnimationFrame(function () {
            actions.gyazoWholeCapture()
          })
        })
        closeBtn.addEventListener('click', function () {
          hideMenu()
        })
        myImageBtn.addEventListener('click', function () {
          hideMenu()
          window.open('https://gyazo.com/')
        })
      },
      changeFixedElementToAbsolute: function () {
        changeFixedElementToAbsolute()
        var waitScroll = function () {
          if (Math.abs(window.scrollX - request.scrollTo.x) < 1 &&
              Math.abs(window.scrollY - request.scrollTo.y) < 1) {
            window.requestAnimationFrame(sendResponse)
          } else {
            window.requestAnimationFrame(waitScroll)
          }
        }
        window.requestAnimationFrame(waitScroll)
      },
      gyazocaptureWindow: function () {
        var overflow = lockScroll()
        var data = {}
        var scaleObj = getZoomAndScale()
        data.w = window.innerWidth
        data.h = window.innerHeight
        data.x = window.scrollX
        data.y = window.scrollY
        data.t = document.title
        data.u = location.href
        data.s = scaleObj.scale
        data.z = scaleObj.zoom
        data.positionX = window.scrollX
        data.positionY = window.scrollY
        data.defaultPositon = window.scrollY
        data.innerHeight = window.innerHeight
        window.requestAnimationFrame(() => chrome.runtime.sendMessage(chrome.runtime.id, {
          action: 'gyazoCaptureWithSize',
          data: data,
          tab: request.tab
        }, function () {
          unlockScroll(overflow)
        }))
      },
      gyazoSelectElm: function () {
        if (document.querySelector('.gyazo-crop-select-element')) {
          return false
        }
        const MARGIN = 3
        document.body.classList.add('gyazo-select-element-mode')
        var jackup = document.createElement('div')
        jackup.classList.add('gyazo-jackup-element')
        document.body.appendChild(jackup)
        var layer = document.createElement('div')
        layer.className = 'gyazo-crop-select-element'
        document.body.appendChild(layer)
        layer.style.background = 'rgba(9, 132, 222, 0.35)'
        layer.style.margin = '0px'
        layer.style.border = '1px solid rgb(9, 132, 222)'
        layer.style.position = 'fixed'
        layer.style.pointerEvents = 'none'
        layer.style.zIndex = 2147483646 // Maximun number of 32bit Int - 1
        var allElms = Array.prototype.slice.apply(document.body.querySelectorAll('*')).filter(function (item) {
          return !item.classList.contains('gyazo-crop-select-element') &&
                 !item.classList.contains('gyazo-menu-element')
        })
        allElms.forEach(function (item) {
          item.classList.add('gyazo-select-element-cursor-overwrite')
        })
        var moveLayer = function (event) {
          var item = event.target
          event.stopPropagation()
          if (item.tagName === 'IMG') {
            layer.setAttribute('data-img-url', item.src)
          } else {
            layer.setAttribute('data-img-url', '')
          }
          var rect = item.getBoundingClientRect()
          layer.style.width = rect.width + 'px'
          layer.style.height = rect.height + 'px'
          layer.style.left = rect.left + 'px'
          layer.style.top = rect.top + 'px'
        }
        let hasMargin = false
        var takeMargin = function () {
          if (hasMargin) return
          hasMargin = true
          layer.style.width = parseInt(window.getComputedStyle(layer).width, 10) + MARGIN * 2 + 'px'
          layer.style.height = parseInt(window.getComputedStyle(layer).height, 10) + MARGIN * 2 + 'px'
          layer.style.left = parseInt(window.getComputedStyle(layer).left, 10) - MARGIN + 'px'
          layer.style.top = parseInt(window.getComputedStyle(layer).top, 10) - MARGIN + 'px'
        }
        var keydownHandler = function (event) {
          if (event.keyCode === ESC_KEY_CODE) {
            cancel()
          }else if (isPressCommandKey(event)) {
            takeMargin()
          }
        }
        var keyUpHandler = function (event) {
          if (isPressCommandKey(event)) {
            hasMargin = false
            layer.style.width = parseInt(window.getComputedStyle(layer).width, 10) - MARGIN * 2 + 'px'
            layer.style.height = parseInt(window.getComputedStyle(layer).height, 10) - MARGIN * 2 + 'px'
            layer.style.left = parseInt(window.getComputedStyle(layer).left, 10) + MARGIN + 'px'
            layer.style.top = parseInt(window.getComputedStyle(layer).top, 10) + MARGIN + 'px'
          }
        }
        var clickElement = function (event) {
          event.stopPropagation()
          event.preventDefault()
          document.body.classList.remove('gyazo-select-element-mode')
          allElms.forEach(function (item) {
            if (item.classList.contains('gyazo-select-element-cursor-overwrite')) {
              item.classList.remove('gyazo-select-element-cursor-overwrite')
            }
            item.removeEventListener('mouseover', moveLayer)
            item.removeEventListener('click', clickElement)
          })
          var data = {}
          var scaleObj = getZoomAndScale()

          // Sanitize gyazo desc for ivy-search
          Array.from(document.querySelectorAll('*')).forEach(function (elm) {
            if (window.getComputedStyle(elm).display === 'none' || window.getComputedStyle(elm).visibility === 'hidden') {
              elm.classList.add('gyazo-hidden')
            }
          })
          var dupTarget = event.target.cloneNode(true)
          Array.from(dupTarget.querySelectorAll('*')).forEach(function (elm) {
            switch (elm.tagName) {
              case 'SCRIPT':
              case 'STYLE':
                return elm.remove()
            }
            if (elm.classList.contains('gyazo-hidden')) {
              elm.remove()
            }
          })
          Array.from(document.getElementsByClassName('gyazo-hidden')).forEach(function (elm) {
            elm.classList.remove('gyazo-hidden')
          })

          data.w = parseFloat(layer.style.width)
          data.h = parseFloat(layer.style.height)
          data.x = window.scrollX + layer.offsetLeft
          data.y = window.scrollY + layer.offsetTop
          data.t = document.title
          data.u = location.href
          data.s = scaleObj.scale
          data.z = scaleObj.zoom
          data.positionX = window.scrollX
          data.positionY = window.scrollY
          data.innerHeight = window.innerHeight
          data.desc = dupTarget.textContent
          if (document.body.contains(layer)) {
            document.body.removeChild(layer)
          }
          if (document.querySelector('.gyazo-menu')) {
            document.body.removeChild(document.querySelector('.gyazo-menu'))
          }
          jackup.style.height = (window.innerHeight + JACKUP_HEIGHT) + 'px'
          window.removeEventListener('contextmenu', cancel)
          window.removeEventListener('keydown', keydownHandler)
          document.removeEventListener('keyup', keyUpHandler)
          if (layer.offsetTop >= 0 && layer.offsetTop + layer.offsetHeight <= window.innerHeight) {
            // Only when required scroll
            changeFixedElementToAbsolute()
          }
          if (layer.getAttribute('data-img-url')) {
            restoreFixedElement()
            return chrome.runtime.sendMessage(chrome.runtime.id, {
              action: 'gyazoSendRawImage',
              data: {srcUrl: layer.getAttribute('data-img-url')},
              tab: request.tab
            }, function () {})
          }
          var overflow = {}
          if (data.y + data.h > data.innerHeight + data.positionY) {
            overflow = lockScroll()
            packScrollBar(overflow)
          }
          var finish = function () {
            if (document.getElementsByClassName('gyazo-crop-select-element').length > 0) {
              return window.requestAnimationFrame(finish)
            }
            window.requestAnimationFrame(function () {
              chrome.runtime.sendMessage(chrome.runtime.id, {
                action: 'gyazoCaptureWithSize',
                data: data,
                tab: request.tab
              }, null, function () {
                restoreFixedElement()
                document.body.removeChild(jackup)
                unlockScroll(overflow)
              })
            })
          }
          window.requestAnimationFrame(finish)
        }
        var cancel = function () {
          if (document.body.contains(jackup)) {
            document.body.removeChild(jackup)
          }
          if (document.body.contains(layer)) {
            document.body.removeChild(layer)
          }
          document.body.classList.remove('gyazo-select-element-mode')
          window.removeEventListener('contextmenu', cancel)
          document.removeEventListener('keydown', keydownHandler)
          document.removeEventListener('keyup', keyUpHandler)
          Array.prototype.slice.apply(document.querySelectorAll('.gyazo-select-element-cursor-overwrite')).forEach(function (item) {
            item.classList.remove('gyazo-select-element-cursor-overwrite')
            item.removeEventListener('mouseover', moveLayer)
            item.removeEventListener('click', clickElement)
          })
          restoreFixedElement()
        }
        let removedGyazoMenu = function () {
          window.removeEventListener('removeGyazoMenu', removedGyazoMenu)
          cancel()
        }
        window.addEventListener('removeGyazoMenu', removedGyazoMenu)
        window.addEventListener('contextmenu', cancel)
        document.addEventListener('keydown', keydownHandler)
        document.addEventListener('keyup', keyUpHandler)
        window.requestAnimationFrame(function () {
          allElms.forEach(function (item) {
            item.addEventListener('mouseover', moveLayer)
            item.addEventListener('click', clickElement)
          })
        })
      },
      gyazoCaptureSelectedArea: function () {
        if (document.querySelector('.gyazo-jackup-element')) {
          return false
        }
        var startX
        var startY
        var data = {}
        var tempUserSelect = document.body.style.webkitUserSelect
        var layer = document.createElement('div')
        var jackup = document.createElement('div')
        jackup.classList.add('gyazo-jackup-element')
        document.body.appendChild(jackup)
        var pageHeight = Math.max(document.body.clientHeight, document.body.offsetHeight, document.body.scrollHeight)
        layer.style.position = 'absolute'
        layer.style.left = document.body.clientLeft + 'px'
        layer.style.top = document.body.clientTop + 'px'
        layer.style.width = Math.max(
          document.body.clientWidth, document.body.offsetWidth, document.body.scrollWidth,
          document.documentElement.clientWidth, document.documentElement.offsetWidth, document.documentElement.scrollWidth
        ) + 'px'
        layer.style.height = pageHeight + 'px'
        layer.style.zIndex = 2147483646 // Maximun number of 32bit Int - 1
        layer.style.cursor = 'crosshair'
        layer.className = 'gyazo-select-layer'
        document.body.style.webkitUserSelect = 'none'
        var selectionElm = document.createElement('div')
        layer.appendChild(selectionElm)
        document.body.appendChild(layer)
        selectionElm.styleUpdate = function (styles) {
          Object.keys(styles).forEach(function (key) {
            selectionElm.style[key] = styles[key]
          })
        }
        selectionElm.styleUpdate({
          background: 'rgba(92, 92, 92, 0.3)',
          position: 'absolute'
        })
        var cancelGyazo = function () {
          document.body.removeChild(layer)
          document.body.removeChild(jackup)
          document.body.style.webkitUserSelect = tempUserSelect
          document.removeEventListener('keydown', keydownHandler)
          window.removeEventListener('contextmenu', cancelGyazo)
          restoreFixedElement()
          if (document.querySelector('.gyazo-menu')) {
            document.body.removeChild(document.querySelector('.gyazo-menu'))
          }
        }
        let removedGyazoMenu = function () {
          cancelGyazo()
          window.removeEventListener('removeGyazoMenu', removedGyazoMenu)
        }
        window.addEventListener('removeGyazoMenu', removedGyazoMenu)
        var keydownHandler = function (event) {
          if (event.keyCode === ESC_KEY_CODE) {
            //  If press Esc Key, cancel it
            cancelGyazo()
          }
        }
        var mousedownHandler = function (e) {
          let gyazoMenu = document.querySelector('.gyazo-menu')
          if (gyazoMenu) {
            document.body.removeChild(gyazoMenu)
          }
          startX = e.pageX
          startY = e.pageY
          selectionElm.styleUpdate({
            border: '1px solid rgba(255, 255, 255, 0.8)',
            left: startX + 'px',
            top: startY + 'px'
          })
          layer.removeEventListener('mousedown', mousedownHandler)
          layer.addEventListener('mousemove', mousemoveHandler)
          layer.addEventListener('mouseup', mouseupHandler)
        }
        var mousemoveHandler = function (e) {
          selectionElm.styleUpdate({
            width: (Math.abs(e.pageX - startX) - 1) + 'px',
            height: (Math.abs(e.pageY - startY) - 1) + 'px',
            left: Math.min(e.pageX, startX) + 'px',
            top: Math.min(e.pageY, startY) + 'px'
          })
        }
        var mouseupHandler = function (e) {
          document.body.style.webkitUserSelect = tempUserSelect
          document.removeEventListener('keydown', keydownHandler)
          window.addEventListener('contextmenu', function (event) {
            cancelGyazo()
            event.preventDefault()
          })
          var scaleObj = getZoomAndScale()
          var rect = selectionElm.getBoundingClientRect()
          data.w = rect.width
          data.h = rect.height
          if (data.h <= 3 || data.w <= 3) {
            cancelGyazo()
            return false
          }
          data.x = rect.left + window.scrollX
          data.y = rect.top + window.scrollY
          data.t = document.title
          data.u = location.href
          data.s = scaleObj.scale
          data.z = scaleObj.zoom
          data.positionX = window.scrollX
          data.positionY = window.scrollY
          data.innerHeight = window.innerHeight
          document.body.removeChild(layer)
          if (document.querySelector('.gyazo-menu')) {
            document.body.removeChild(document.querySelector('.gyazo-menu'))
          }
          var overflow = {}
          if (data.h > data.innerHeight) {
            overflow = lockScroll()
            packScrollBar(overflow)
          }
          jackup.style.height = (window.innerHeight + JACKUP_HEIGHT) + 'px'
          // wait for rewrite by removeChild
          let finish = function () {
            if (document.getElementsByClassName('gyazo-select-layer').length > 0) {
              return window.requestAnimationFrame(finish)
            }
            window.setTimeout(function () {
              chrome.runtime.sendMessage(chrome.runtime.id, {
                action: 'gyazoCaptureWithSize',
                data: data,
                tab: request.tab
              }, null, function () {
                document.body.removeChild(jackup)
                unlockScroll(overflow)
                restoreFixedElement()
              })
            }, 100)
          }
          window.requestAnimationFrame(finish)
        }
        layer.addEventListener('mousedown', mousedownHandler)
        document.addEventListener('keydown', keydownHandler)
        window.addEventListener('contextmenu', cancelGyazo)
      },
      gyazoWholeCapture: function () {
        var overflow = lockScroll()
        var data = {}
        var scaleObj = getZoomAndScale()
        data.w = window.innerWidth
        data.h = Math.max(document.body.clientHeight, document.body.offsetHeight, document.body.scrollHeight)
        data.x = 0
        data.y = 0
        data.t = document.title
        data.u = location.href
        data.s = scaleObj.scale
        data.z = scaleObj.zoom
        data.positionX = window.scrollX
        data.positionY = window.scrollY
        data.innerHeight = window.innerHeight
        var jackup = document.createElement('div')
        jackup.classList.add('gyazo-jackup-element')
        document.body.appendChild(jackup)
        jackup.style.height = (data.h + 30) + 'px'
        chrome.runtime.sendMessage(chrome.runtime.id, {
          action: 'gyazoCaptureWithSize',
          data: data,
          tab: request.tab
        }, null, function () {
          document.body.removeChild(jackup)
          unlockScroll(overflow)
        })
      }
    }
    if (request.action in actions) {
      actions[request.action]()
    }
    return true
  })
  // XXX: Firefox can't embed moz-extension:// file in content
  if (browser.firefox) return
  require('./expander')
})()
