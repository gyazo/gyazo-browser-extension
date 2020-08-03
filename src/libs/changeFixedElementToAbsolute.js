export default () => {
  Array.from(document.querySelectorAll('*'))
    .filter((item) => {
      return window.getComputedStyle(item).position === 'fixed';
    })
    .forEach((item) => {
      item.classList.add('gyazo-whole-capture-onetime-absolute');
      item.style.setProperty('position', 'absolute', 'important');
    });
};
