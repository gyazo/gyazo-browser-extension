import { JACKUP_MARGIN } from '../constants';

export default class JackupElement {
  constructor() {
    const jackup = document.createElement('div');
    jackup.classList.add('gyazo-jackup-element');
    document.body.appendChild(jackup);
    this.element = jackup;
    this.originalHeightValue = null;
  }
  set height(height) {
    if (!this.element) return;

    const html = document.querySelector('html');
    const body = document.querySelector('body');

    const cssVal = window.innerHeight + JACKUP_MARGIN + 'px';
    this.element.style.height = cssVal;
    this.element.style.maxHeight = cssVal;
    this.element.style.minHeight = cssVal;

    const htmlHeight = window.getComputedStyle(html).getPropertyValue('height');
    const bodyHeight = window.getComputedStyle(body).getPropertyValue('height');

    if (htmlHeight === bodyHeight) {
      this.originalHTMLHeightValue = html.style.height;
      this.originalBodyHeightValue = body.style.height;
      html.style.height = 'auto';
    }
  }
  remove() {
    const html = document.querySelector('html');
    const body = document.querySelector('body');
    if (this.originalHTMLHeightValue)
      html.style.height = this.originalHTMLHeightValue;
    if (this.originalBodyHeightValue)
      body.style.height = this.originalBodyHeightValue;
    body.removeChild(this.element);
    this.element = null;
  }
}
