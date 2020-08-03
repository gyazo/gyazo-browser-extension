import uploadLimitFileSize from './uploadLimitFileSize';

const QUALITY_MAX = 0.92;
const QUALITY_MIN = 0.3;

export default async (canvas) => {
  const uploadLimitVolume = await uploadLimitFileSize();
  let quality = QUALITY_MAX;
  let result = canvas.toDataURL('image/jpeg');
  if (result.length < uploadLimitVolume) return result;
  quality -= (QUALITY_MAX - QUALITY_MIN) / 2;

  for (let i = 0; i < 5; i++) {
    result = canvas.toDataURL('image/jpeg', quality);
    if (result.length <= uploadLimitVolume) {
      quality += (QUALITY_MAX - QUALITY_MIN) / Math.pow(2, i + 2);
    } else {
      quality -= (QUALITY_MAX - QUALITY_MIN) / Math.pow(2, i + 2);
    }
  }
  return result;
};
