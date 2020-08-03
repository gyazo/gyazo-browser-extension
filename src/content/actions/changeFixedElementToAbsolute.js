import changeFixedElementToAbsolute from '../../libs/changeFixedElementToAbsolute';

export default (request, sender, sendResponse) => {
  changeFixedElementToAbsolute();
  sendResponse();
};
