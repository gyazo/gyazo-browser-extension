import thenChrome from 'then-chrome'
import getZoomAndScale from '../../libs/getZoomAndScale'
import {lockScroll, unlockScroll} from '../../libs/scroll'
import {JACKUP_MARGIN} from '../../constants'

export default async (request) => {
  const overflow = lockScroll()
  const data = {}
  const scaleObj = getZoomAndScale()
  data.w = Math.max(document.body.clientWidth, document.body.offsetWidth, document.body.scrollWidth)
  data.h = Math.max(document.body.clientHeight, document.body.offsetHeight, document.body.scrollHeight)
  data.x = 0
  data.y = 0
  data.t = document.title
  data.u = location.href
  data.s = scaleObj.scale
  data.z = scaleObj.zoom
  data.positionX = window.scrollX
  data.positionY = window.scrollY
  const jackup = document.createElement('div')
  jackup.classList.add('gyazo-jackup-element')
  document.body.appendChild(jackup)
  jackup.setAttribute('style', `height: ${window.innerHeight + JACKUP_MARGIN}px`)
  await thenChrome.runtime.sendMessage(chrome.runtime.id, {
    target: 'main',
    action: 'gyazoCaptureWithSize',
    data: data,
    tab: Object.assign({width: window.innerWidth, height: window.innerHeight}, request.tab)
  })
  document.body.removeChild(jackup)
  unlockScroll(overflow)
}
