/**
 * 16진수 색상 코드를 RGB 값으로 변환하는 함수
 * @param hex 16진수 색상 코드 (예: "#ffffff")
 * @returns RGB 객체 {r, g, b} (0-1 범위)
 */
export const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  return { r, g, b }
}

/**
 * W3C WCAG Relative Luminance 기준으로 색상 밝기를 계산하는 함수
 * @param r 빨간색 값 (0-1)
 * @param g 초록색 값 (0-1)
 * @param b 파란색 값 (0-1)
 * @returns 상대 휘도 값 (0-1)
 */
export const getBrightness = (r: number, g: number, b: number): number => {
  // Gamma correction
  const gammaCorrect = (c: number) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  // Calculate relative luminance
  return 0.2126 * gammaCorrect(r) + 0.7152 * gammaCorrect(g) + 0.0722 * gammaCorrect(b)
}

/**
 * W3C WCAG Relative Luminance 기준으로 색상 밝기를 판단하는 함수
 * @param hex 16진수 색상 코드 (예: "#ffffff")
 * @param threshold 밝기 판단 기준값 (기본값: 0.5)
 * @returns 밝은 색상인지 여부
 */
export const isLightColor = (hex: string, threshold: number = 0.5): boolean => {
  const { r, g, b } = hexToRgb(hex)
  const luminance = getBrightness(r, g, b)
  
  return luminance > threshold
}
