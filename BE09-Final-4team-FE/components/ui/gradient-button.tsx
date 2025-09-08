import { ReactNode, ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { colors, shadows, animations, borderRadius } from "@/lib/design-tokens"

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function GradientButton({ 
  children, 
  variant = "primary",
  size = "md",
  className,
  ...props 
}: GradientButtonProps) {
  const variants = {
    primary: `bg-gradient-to-r ${colors.primary.blue} hover:${colors.primary.blueHover} text-white ${shadows.primary}`,
    secondary: `bg-gray-50 hover:bg-gray-200 text-gray-700 border border-gray-200`,
    success: `bg-gradient-to-r ${colors.status.success.gradient} hover:from-emerald-500 hover:to-emerald-600 text-white`,
    warning: `bg-gradient-to-r ${colors.status.warning.gradient} hover:from-amber-500 hover:to-amber-600 text-white`,
    error: `bg-gradient-to-r ${colors.status.error.gradient} hover:from-red-500 hover:to-red-600 text-white`,
  }

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  return (
    <button
      className={cn(
        variants[variant],
        sizes[size],
        borderRadius.md,
        "font-medium",
        animations.transition,
        "flex items-center gap-2",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
} 