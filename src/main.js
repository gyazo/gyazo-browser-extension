import thenChrome from 'then-chrome';
import MessageListener from './libs/MessageListener';
import gyazoIt from './libs/gyazoIt';
import { disableButton } from './libs/changeTabEvents';
import gyazoCaptureWithSize from './libs/gyazoCaptureWithSize';
import getTeams from './libs/getTeams';
import storage from './libs/storageSwitcher';
import './libs/contextMenu';

const onMessageListener = new MessageListener('main');

chrome.browserAction.onClicked.addListener(async (tab) => {
  if (tab.url.match(/chrome\.google\.com\/webstore\//)) {
    window.alert(chrome.i18n.getMessage('welcomeMessage'));
    return disableButton(tab.id);
  }
  await thenChrome.tabs.insertCSS(tab.id, {
    file: '/menu.css',
  });
  if (
    chrome.runtime.lastError &&
    chrome.runtime.lastError.message.match(/cannot be scripted/)
  ) {
    window.alert('It is not allowed to use Gyazo extension in this page.');
    return disableButton(tab.id);
  }
  try {
    await thenChrome.tabs.sendMessage(tab.id, {
      target: 'content',
      action: 'insertMenu',
      tab: tab,
    });
  } catch (e) {
    e.message.match(/Could not establish connection/) &&
      window.confirm(chrome.i18n.getMessage('confirmReload')) &&
      chrome.tabs.reload(tab.id);
  }
  chrome &&
    chrome.runtime &&
    chrome.runtime.lastError &&
    chrome.runtime.lastError.number !== -2147467259 &&
    !chrome.runtime.lastError.message.match(/message port closed/) &&
    window.confirm(chrome.i18n.getMessage('confirmReload')) &&
    chrome.tabs.reload(tab.id);
});

onMessageListener.add('getTeam', async (request, sender, sendResponse) => {
  const { teams, error } = await getTeams();
  if (error) return sendResponse({ error });
  let team = teams[0];

  const savedTeam = await storage.get({ team: null });
  // Return team info if saved default team
  if (savedTeam.team) {
    team = teams.find((t) => t.name === savedTeam.team.name) || team; // prevent undefined
  } else if (teams.length > 1) {
    // if haven't saved team info and logged in to more than 2 teams
    window.alert(chrome.i18n.getMessage('selectTeamToLogin'));
    chrome.tabs.create({ url: chrome.runtime.getURL('option/options.html') });
    team = {};
  }
  storage.set({ team });
  sendResponse({ team });
});

onMessageListener.add('gyazoGetImageBlob', (request, sender, sendResponse) => {
  const xhr = new window.XMLHttpRequest();
  xhr.open('GET', request.gyazoUrl + '/raw', true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = () => {
    const blob = new window.Blob([xhr.response], { type: 'image/png' });
    sendResponse({ imageBlobUrl: window.URL.createObjectURL(blob) });
  };
  xhr.send();
});

onMessageListener.add('gyazoSendRawImage', (request) => {
  let data = request.data;
  gyazoIt(request.tab, data.srcUrl);
});

onMessageListener.add('gyazoCaptureWithSize', gyazoCaptureWithSize);

chrome.runtime.onMessage.addListener(
  onMessageListener.listen.bind(onMessageListener)
);
