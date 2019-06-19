const dataURLtoBlob = (dataurl) => {
// from https://stackoverflow.com/a/30407959
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  const n = bstr.length
  let u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}


module.exports = async function (str, imageData) {
  if (imageData && navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
    const imgBlob = dataURLtoBlob(imageData)
    let items = {
      'text/plain': new Blob([str], { type: 'text/plain' })
    }
    items[imgBlob.type] = imgBlob
    const item = new ClipboardItem(items)
    try {
      // 現在ではChromiumの実装の問題でimage/png以外の画像がやってくるとDOMExceptionになるので回避する
      return await navigator.clipboard.write([item])
    } catch (e) {}
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      return await navigator.clipboard.writeText(str)
    } catch (e) {}
  }
  const textArea = document.createElement('textarea')
  textArea.style.cssText = 'position:absolute;left:-100%'

  document.body.appendChild(textArea)

  textArea.value = str
  textArea.select()
  document.execCommand('copy')

  document.body.removeChild(textArea)
}
