import thenChrome from 'then-chrome';
import storage from './storageSwitcher';
const DELAY_TIMES = [0, 200, 700, 700];

export default async (callback) => {
  // Force reflow on browser content
  // c.f. https://stackoverflow.com/questions/21664940
  const currentTab = (
    await thenChrome.tabs.query({ currentWindow: true, active: true })
  )[0];
  await thenChrome.tabs.executeScript(currentTab.id, {
    code: 'console.log(document.body.offsetHeight)',
  });
  storage.get({ delay: 1 }).then((item) => {
    let delay = DELAY_TIMES[item.delay];
    if (delay === 0) {
      window.requestAnimationFrame(callback);
    }
    window.setTimeout(callback, delay);
  });
};
