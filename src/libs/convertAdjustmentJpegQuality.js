import {UPLOAD_LIMIT_VOLUME} from '../constants'

const QUALITY_MAX = 0.92
const QUALITY_MIN = 0.30

export default (canvas) => {
  let quality = QUALITY_MAX
  let result = canvas.toDataURL('image/jpeg')
  if (result.length < UPLOAD_LIMIT_VOLUME) return result
  quality -= (QUALITY_MAX - QUALITY_MIN) / 2

  for (let i = 0; i < 5; i++) {
    result = canvas.toDataURL('image/jpeg', quality)
    if (result.length <= UPLOAD_LIMIT_VOLUME) {
      quality += (QUALITY_MAX - QUALITY_MIN) / Math.pow(2, i + 2)
    } else {
      quality -= (QUALITY_MAX - QUALITY_MIN) / Math.pow(2, i + 2)
    }
  }
  return result
}
