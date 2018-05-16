import postToGyazo from './postToGyazo'

export default (tab, srcUrl) => {
  if (srcUrl.match(/^data:/)) {
    postToGyazo(tab.id, {
      imageData: srcUrl,
      title: tab.title,
      url: tab.url
    })
  } else {
    const xhr = new window.XMLHttpRequest()
    xhr.open('GET', srcUrl, true)
    xhr.responseType = 'blob'
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        let mineType = ''
        if (/png$/.test(srcUrl)) {
          mineType = 'image/png'
        } else if (/jpe?g$/.test(srcUrl)) {
          mineType = 'image/jpeg'
        } else if (/gif$/.test(srcUrl)) {
          mineType = 'image/gif'
        }
        const blob = new Blob([xhr.response], {type: mineType})
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
