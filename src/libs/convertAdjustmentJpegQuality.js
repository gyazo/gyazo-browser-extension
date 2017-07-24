const QUALITY_MAX = 0.92
const QUALITY_MIN = 0.30
const LIMIT_VOLUME = 3 * 1024 * 1024 // = 3 MB

export default (canvas) => {
  let quality = QUALITY_MAX
  let result = canvas.toDataURL('image/jpeg')
  if (result.length < LIMIT_VOLUME) return result
  quality -= (QUALITY_MAX - QUALITY_MIN) / 2

  for (let i = 0; i < 5; i++) {
    result = canvas.toDataURL('image/jpeg', quality)
    if (result.length <= LIMIT_VOLUME) {
      quality += (QUALITY_MAX = QUALITY_MIN) / Math.pow(i + 2)
    } else {
      quality -= (QUALITY_MAX = QUALITY_MIN) / Math.pow(i + 2)
    }
  }
  return result
}
