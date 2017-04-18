import $ from 'jquery'
import UploadNotification from './UploadNotification'
import saveToClipboard from './saveToClipboard'

const host = 'https://upload.gyazo.com/api/upload/easy_auth'
const clientId = 'df9edab530e84b4c56f9fcfa209aff1131c7d358a91d85cc20b9229e515d67dd'

export default function postToGyazo (tabId, data) {
  const notification = new UploadNotification(tabId)
  notification.update({message: ''})
  $.ajax({
    type: 'POST',
    url: host,
    data: {
      client_id: clientId,
      image_url: data.imageData,
      title: data.title,
      referer_url: data.url,
      scale: data.scale || '',
      desc: data.desc ? data.desc.replace(/\t/, ' ').replace(/(^\s+| +$)/gm, '') : ''
    },
    xhrFields: {
      withCredentials: true
    },
    crossDomain: true
  })
    .done(function (_data) {
      // Use pure XHR for get XHR.responseURL
      let xhr = new window.XMLHttpRequest()
      xhr.open('GET', _data.get_image_url)
      xhr.onreadystatechange = function () {
        if (xhr.responseURL) {
          saveToClipboard(xhr.responseURL)
          notification.finish(xhr.responseURL, data.imageData)
        }
      }
      xhr.send()
    })
    .fail(function (XMLHttpRequest, textStatus, errorThrown) {
      window.alert('Status: ' + XMLHttpRequest.status + '\n Error: ' + textStatus + '\n Message: ' + errorThrown.message)
    })
}
