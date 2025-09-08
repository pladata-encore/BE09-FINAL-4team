// 날짜 포맷팅 유틸리티 함수

/**
 * 항상 날짜와 시간을 함께 표시 (yyyy-mm-dd HH:mm)
 * @param {string} dateString - ISO 날짜 문자열
 * @returns {string} 포맷된 날짜/시간 문자열
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\./g, '-').replace(', ', ' ') // "2025-01-15 14:30"
}

/**
 * 항상 yyyy-mm-dd 형식으로 표시 (기존 방식)
 * @param {string} dateString - ISO 날짜 문자열
 * @returns {string} yyyy-mm-dd 형식 문자열
 */
export const formatDateOnly = (dateString) => {
  return new Date(dateString).toISOString().split('T')[0]
}