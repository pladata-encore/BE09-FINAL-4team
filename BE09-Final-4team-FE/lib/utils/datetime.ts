export const KST_TZ = "Asia/Seoul";

export function formatKstTime(
  instantIso?: string | Date,
  fallback: string = ""
): string {
  if (!instantIso) return fallback;
  const d = instantIso instanceof Date ? instantIso : new Date(instantIso);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: undefined,
    hour12: false,
    timeZone: KST_TZ,
  });
}

export function formatKstDate(
  instantIso?: string | Date,
  fallback: string = ""
): string {
  if (!instantIso) return fallback;
  const d = instantIso instanceof Date ? instantIso : new Date(instantIso);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("ko-KR", { timeZone: KST_TZ });
}

export function formatKstDateTime(
  instantIso?: string | Date,
  fallback: string = ""
): string {
  if (!instantIso) return fallback;
  const d = instantIso instanceof Date ? instantIso : new Date(instantIso);
  if (Number.isNaN(d.getTime())) return fallback;
  const date = d.toLocaleDateString("ko-KR", { timeZone: KST_TZ });
  const time = d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: KST_TZ,
  });
  return `${date} ${time}`;
}

export function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) {
    return '방금 전'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`
  }

  const currentYear = now.getFullYear()
  const dateYear = date.getFullYear()
  if (currentYear === dateYear) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }
  
  return date.toLocaleDateString()
}
