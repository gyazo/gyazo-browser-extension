export default (request, sender, sendResponse) => {
  let notificationContainer =
    document.querySelector(
      '.gyazo-menu.gyazo-menu-element.gyazo-notification'
    ) || document.querySelector('.gyazo-menu.gyazo-notification');
  if (notificationContainer) {
    notificationContainer.classList.add('gyazo-notification');
  } else {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'gyazo-menu gyazo-notification';
    document.body.appendChild(notificationContainer);
  }
  let title = document.createTextNode('');
  let message = document.createTextNode('');
  if (request.title) {
    title = document.createElement('div');
    title.className = 'gyazo-notification-title';
    title.textContent = request.title;
  }
  if (request.message) {
    message = document.createElement('div');
    message.className = 'gyazo-notification-message';
    message.textContent = request.message;
  }
  let showImage = document.createElement('div');
  if (request.imagePageUrl) {
    const imageContainer = document.createElement('a');
    imageContainer.href = request.imagePageUrl;
    imageContainer.target = '_blank';
    showImage.appendChild(imageContainer);
    const imageElem = document.createElement('img');
    imageElem.className = 'image';
    imageElem.src = request.imageUrl;
    imageElem.addEventListener('load', () => {
      const { naturalWidth, naturalHeight } = imageElem;
      imageElem.style.maxWidth = naturalWidth / request.scale;
      imageElem.style.maxHeight = naturalHeight / request.scale;
    });
    imageContainer.appendChild(imageElem);
    showImage.appendChild(document.createElement('br'));
    const imageInfo = document.createElement('div');
    imageInfo.className = 'gyazo-notification-image-info';
    showImage.appendChild(imageInfo);
    const infoSpan = document.createElement('span');
    infoSpan.textContent = document.title;
    imageInfo.appendChild(infoSpan);
    const imageHost = document.createElement('div');
    imageHost.className = 'gyazo-notification-image-host';
    showImage.appendChild(imageHost);
    imageHost.textContent = location.host;
  } else {
    const loadingElm = document.createElement('span');
    loadingElm.className = 'gyazo-spin';
    try {
      window
        .fetch(chrome.runtime.getURL('imgs/spinner.svg'))
        .then((res) => res.text())
        .then((text) => {
          loadingElm.innerHTML = text;
        });
    } catch (e) {
      loadingElm.innerHTML = `<img src='${chrome.runtime.getURL(
        'imgs/spinner.svg'
      )}' />`;
    }
    showImage.appendChild(loadingElm);
  }
  notificationContainer.innerHTML = '';
  notificationContainer.appendChild(title);
  notificationContainer.appendChild(message);
  notificationContainer.appendChild(showImage);
  if (request.isFinish) {
    notificationContainer
      .querySelector('.image')
      .addEventListener('load', function () {
        window.setTimeout(function () {
          if (document.body.contains(notificationContainer)) {
            document.body.removeChild(notificationContainer);
          }
        }, 5000);
      });
  }
  sendResponse();
};
