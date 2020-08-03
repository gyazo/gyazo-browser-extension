import storage from '../../libs/storageSwitcher';
import getTeams from '../../libs/getTeams';
import {
  toggle as permissionToggle,
  check as permissionCheck,
  permissions,
} from '../../libs/permissions';

const DELAY_WORDING = chrome.i18n.getMessage('pageScrollDelayWords').split(',');

let selector = document.getElementById('defaultActionSelector');
let fileSizeLimit = document.getElementById('fileSizeLimitRange');
let fileSizeLimitCurrentSetting = document.getElementById(
  'fileSizeLimitCurrentSetting'
);
let delaySelector = document.getElementById('pageScrollDelayRange');
let delayCurrentSetting = document.getElementById('delayCurrentSetting');
let contextMenuSetting = document.getElementById('contextMenuSetting');
let copyUrlSupportSetting = document.getElementById('copyUrlSupportSetting');

storage.get().then(async (item) => {
  selector.value = item.behavior;
  delaySelector.value = item.delay;
  delayCurrentSetting.textContent = DELAY_WORDING[item.delay];
  copyUrlSupportSetting.checked = await permissionCheck(
    permissions.copyUrlToClipboard
  );
  contextMenuSetting.checked = item.contextMenu;
  fileSizeLimit.value = item.fileSizeLimit;
  fileSizeLimitCurrentSetting.textContent = item.fileSizeLimit + ' MB';
});
[
  'defaultActionLabel',
  'selectElement',
  'selectArea',
  'contextMenuSettingLabel',
  'copyUrlSupportSettingLabel',
  'fileSizeLimitLabel',
  'fileSizeLimitHelpText',
  'pageScrollDelayLabel',
  'pageScrollDelayHelpText',
  'currentTeamLabel',
  'loginToTeamsLink',
].forEach((id) => {
  document.getElementById(id).textContent = chrome.i18n.getMessage(id);
});

if (process.env.BUILD_EXTENSION_TYPE === 'teams') {
  getTeams()
    .then(async () => {
      const { team } = await storage.get();
      document.getElementById('currentTeamName').textContent = team.name;
    })
    .catch((error) => {
      if (error.status === 403) {
        window.alert(error.message);
        chrome.tabs.create({ url: 'https://gyazo.com/teams/login' });
      }
    });
} else {
  document.getElementById('currentTeam').style.display = 'none';
}

contextMenuSetting.addEventListener('change', (event) => {
  storage.set({ contextMenu: event.target.checked });
});

selector.addEventListener('change', function (event) {
  storage.set({ behavior: event.target.value });
});

fileSizeLimit.addEventListener('change', function (event) {
  storage.set({ fileSizeLimit: event.target.value }).then(() => {
    fileSizeLimitCurrentSetting.textContent = event.target.value + ' MB';
  });
});

delaySelector.addEventListener('change', function (event) {
  storage.set({ delay: event.target.value }).then(() => {
    delayCurrentSetting.textContent = DELAY_WORDING[event.target.value];
  });
});

copyUrlSupportSetting.addEventListener('change', async () => {
  permissionToggle(
    permissions.copyUrlToClipboard,
    copyUrlSupportSetting.checked
  );
});
