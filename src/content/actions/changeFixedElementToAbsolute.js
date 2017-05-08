import changeFixedElementToAbsolute from '../../libs/changeFixedElementToAbsolute'

export default (request, sender, sendResponse) => {
  changeFixedElementToAbsolute()
  const waitScroll = function () {
    if (Math.abs(window.scrollX - request.scrollTo.x) < 1 &&
    Math.abs(window.scrollY - request.scrollTo.y) < 1) {
      window.requestAnimationFrame(sendResponse)
    } else {
      window.requestAnimationFrame(waitScroll)
    }
  }
  window.requestAnimationFrame(waitScroll)
}
