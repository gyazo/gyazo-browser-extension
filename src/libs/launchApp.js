import thenChrome from 'then-chrome'

const GYAZO_APP_ID = 'com.notainc.gyazo'
const GYAZO_GIF_APP_ID = 'com.notainc.gyazo_gif'
const launchApp = async (appId) => {
  try {
    const res = await thenChrome.runtime.sendNativeMessage(appId, {})
    return res
  } catch (e) {
    if (/exited\.$/.test(e.message)) return
    if (confirm('Please install Gyazo.app')) chrome.tabs.create({url: 'https://gyazo.com/download'})
  }
}

export const launchGyazo = async () => await launchApp(GYAZO_APP_ID)
export const launchGyazoGif = async () => await launchApp(GYAZO_GIF_APP_ID)
