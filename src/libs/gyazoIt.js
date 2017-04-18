import $ from 'jquery'

export default (tab, srcUrl) => {
  if (srcUrl.match(/^data:/)) {
    postToGyazo(tab.id, {
      imageData: srcUrl,
      title: tab.title,
      url: tab.url
    })
  } else {
    const xhr = $.ajaxSettings.xhr()
    xhr.open('GET', srcUrl, true)
    xhr.responseType = 'blob'
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        const blob = xhr.response
        const fileReader = new FileReader()
        fileReader.onload = function (e) {
          postToGyazo(tab.id, {
            imageData: fileReader.result,
            title: tab.title,
            url: tab.url
          })
        }
        fileReader.readAsDataURL(blob)
      }
    }
    xhr.send()
  }
}
