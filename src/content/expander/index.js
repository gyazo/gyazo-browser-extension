import thenChrome from 'then-chrome';
import delegate from 'delegate';
import css from 'dom-css';
import gyazoIdFromUrl from './lib/gyazoIdFromUrl';
import adjacentStyle from './lib/adjacentStyle';
import waitFor from './lib/waitFor';

const fetchImage = async (url, callback) => {
  const response = await thenChrome.runtime.sendMessage(chrome.runtime.id, {
    target: 'main',
    action: 'gyazoGetImageBlob',
    gyazoUrl: url,
  });
  const xhr = new window.XMLHttpRequest();
  xhr.open('GET', response.imageBlobUrl, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = () => {
    const blob = new window.Blob([xhr.response], { type: 'image/png' });

    callback(null, blob);
  };
  xhr.onerror = (e) => {
    callback(e);
  };
  xhr.send();
};

function createLoader(style = {}) {
  const loader = document.createElement('div');
  const circleIcon = document.createElement('div');
  circleIcon.className = 'gz-circle-loader';
  loader.appendChild(circleIcon);

  css(loader, {
    position: 'fixed',
    boxShadow: '0 0 8px rgba(0,0,0,.6)',
    backgroundColor: '#fff',
    zIndex: 1000000,
    width: 40,
    height: 40,
    padding: 4,
    boxSizing: 'border-box',
    ...style,
  });

  return loader;
}

function createImagePreview({ url, boxStyle }) {
  const img = document.createElement('img');
  img.src = url;

  css(img, {
    display: 'inline-block',
    position: 'fixed',
    zIndex: 1000000,
    backgroundColor: '#fff',
    maxWidth: 500,
    boxShadow: '0 0 8px rgba(0,0,0,.6)',
    ...boxStyle,
  });

  return img;
}

export default () => {
  let previewIsShown = false;
  delegate(document, 'a', 'mouseover', (event) => {
    if (previewIsShown) return;

    const element = event.target;
    const href = element.getAttribute('href');

    if (element.querySelector('img')) return;

    const isGyazoUrl = !!gyazoIdFromUrl(href);
    if (isGyazoUrl) {
      previewIsShown = true;

      let container;

      let loader = createLoader(adjacentStyle(element));
      document.body.appendChild(loader);

      let leaved = false;

      const onLeave = (event = {}) => {
        leaved = true;

        if (event.target && element !== event.target) return;
        if (container) document.body.removeChild(container);
        if (loader) document.body.removeChild(loader);

        element.removeEventListener('mouseleave', onLeave);
        previewIsShown = false;
      };

      const cancel = waitFor(() => !element.offsetParent, onLeave);

      element.addEventListener('mouseleave', onLeave);
      element.addEventListener('mouseleave', cancel);

      fetchImage(href, (e, blob) => {
        if (leaved) return;

        document.body.removeChild(loader);
        loader = null;

        container = createImagePreview({
          url: window.URL.createObjectURL(blob),
          boxStyle: adjacentStyle(element),
        });

        document.body.appendChild(container);
      });
    }
  });
};
