export default () => {
  const fixedElms = document.getElementsByClassName(
    'gyazo-whole-capture-onetime-absolute'
  );
  Array.from(fixedElms).forEach((item) => {
    item.classList.remove('gyazo-whole-capture-onetime-absolute');
    item.style.position = 'fixed';
  });
};
