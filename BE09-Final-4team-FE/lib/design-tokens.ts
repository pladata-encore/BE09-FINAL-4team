// 색상 팔레트
export const colors = {
  primary: {
    blue: "from-blue-500 to-indigo-600",
    blueHover: "from-blue-600 to-indigo-700",
    blueLight: "from-blue-50 to-blue-100",
    blueText: "text-blue-700",
  },
  secondary: {
    gray: "from-gray-50 to-gray-100",
    grayText: "text-gray-700",
    grayBorder: "border-gray-200/50",
  },
  status: {
    success: {
      bg: "from-emerald-50 to-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
      gradient: "from-emerald-400 to-emerald-500",
    },
    warning: {
      bg: "from-amber-50 to-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      gradient: "from-amber-400 to-amber-500",
    },
    error: {
      bg: "from-red-50 to-red-100",
      text: "text-red-700",
      border: "border-red-200",
      gradient: "from-red-400 to-red-500",
    },
    info: {
      bg: "from-blue-50 to-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      gradient: "from-blue-400 to-blue-500",
    },
  },
  schedule: {
    meeting: "#3b82f6", // 블루
    project: "#10b981", // 에메랄드
    education: "#f59e0b", // 앰버
    customer: "#8b5cf6", // 퍼플
    report: "#14b8a6", // 틸
    vacation: "#f43f5e", // 로즈
    return: "#6366f1", // 인디고
    work: "#3b82f6", // 근무 시간 - 블루
    break: "#22c55e", // 휴게시간 - 초록색
  },
  employee: {
    ceo: "from-purple-500 to-pink-500",
    developer: "from-blue-500 to-cyan-500",
    senior: "from-green-500 to-teal-500",
    designer: "from-orange-500 to-red-500",
  },
} as const;

// 간격 (Spacing)
export const spacing = {
  xs: "0.5rem", // 8px
  sm: "0.75rem", // 12px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const;

// 타이포그래피
export const typography = {
  h1: "text-3xl font-bold",
  h2: "text-2xl font-bold",
  h3: "text-xl font-semibold",
  h4: "text-lg font-semibold",
  body: "text-base",
  bodySmall: "text-sm",
  caption: "text-xs",
} as const;

// 그림자 (Shadows)
export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  primary: "shadow-lg shadow-blue-500/25",
} as const;

// 애니메이션 (Animations)
export const animations = {
  transition: "transition-all duration-200",
  hover: "hover:scale-101",
  hoverUp: "hover:-translate-y-0.5",
} as const;

// 테두리 반경 (Border Radius)
export const borderRadius = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
} as const;

// 배경 (Backgrounds)
export const backgrounds = {
  glass: "bg-white/60 backdrop-blur-sm",
  glassStrong: "bg-white/80 backdrop-blur-xl",
  gradient: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
} as const;
