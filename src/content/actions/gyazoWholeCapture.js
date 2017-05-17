import thenChrome from 'then-chrome'
import getZoomAndScale from '../../libs/getZoomAndScale'
import {lockScroll, unlockScroll} from '../../libs/scroll'

export default async (request) => {
  const overflow = lockScroll()
  const data = {}
  const scaleObj = getZoomAndScale()
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
  const jackup = document.createElement('div')
  jackup.classList.add('gyazo-jackup-element')
  document.body.appendChild(jackup)
  jackup.style.height = (data.h + 30) + 'px'
  await thenChrome.runtime.sendMessage(chrome.runtime.id, {
    target: 'main',
    action: 'gyazoCaptureWithSize',
    data: data,
    tab: request.tab
  })
  document.body.removeChild(jackup)
  unlockScroll(overflow)
}
