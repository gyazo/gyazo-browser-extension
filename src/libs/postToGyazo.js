import UploadNotification from './UploadNotification'
import saveToClipboard from './saveToClipboard'

const apiEndpoint = 'https://upload.gyazo.com/api/upload/easy_auth'
const clientId = 'df9edab530e84b4c56f9fcfa209aff1131c7d358a91d85cc20b9229e515d67dd'

const errorAlert = (status, message) => {
  window.alert('Status: ' + status + '\n Error: ' + message)
}

export default async (tabId, data) => {
  const notification = new UploadNotification(tabId)
  notification.update({message: ''})
  const formdata = new FormData()
  formdata.append('client_id', clientId)
  formdata.append('image_url', data.imageData)
  formdata.append('title', data.title)
  formdata.append('referer_url', data.url)
  formdata.append('scale', data.scale || '')
  formdata.append('desc', data.desc ? data.desc.replace(/\t/, ' ').replace(/(^\s+| +$)/gm, '') : '')


  const response = await window.fetch(apiEndpoint, {
    method: 'POST',
    body: formdata,
    credentials: 'include'
  })

  if (response.status >= 400) {
    errorAlert(response.status, response.statusText)
  }

  const _data = await response.json()
  // Use pure XHR for get XHR.responseURL
  const xhr = new window.XMLHttpRequest()
  xhr.open('GET', _data.get_image_url)
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return
    if (xhr.status >= 400) {
      errorAlert(xhr.status, xhr.statusText)
    }
    if (xhr.responseURL) {
      saveToClipboard(xhr.responseURL)
      notification.finish(xhr.responseURL, data.imageData)
    }
  }
  xhr.send()
}
