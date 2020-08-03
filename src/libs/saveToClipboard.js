import { check, permissions } from './permissions';

export default async function (str) {
  const permissionCheck = await check(permissions.copyUrlToClipboard);
  if (!permissionCheck) return;
  const textArea = document.createElement('textarea');
  textArea.style.cssText = 'position:absolute;left:-100%';

  document.body.appendChild(textArea);

  textArea.value = str;
  textArea.select();
  document.execCommand('copy');

  document.body.removeChild(textArea);
}
