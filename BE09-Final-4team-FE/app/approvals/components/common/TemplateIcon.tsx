"use client"

import { isLightColor } from "@/lib/utils/color"
import { cn } from "@/lib/utils"
import {
  Calendar,
  User,
  CreditCard,
  Car,
  Home,
  Briefcase,
  FileText,
  Settings,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building,
  ShoppingCart,
  DollarSign,
  Award,
  Target,
  Zap,
  Heart,
  Star,
  Bookmark
} from "lucide-react"

// 아이콘 매핑 유틸리티
export const iconMap = {
  Calendar,
  User,
  CreditCard,
  Car,
  Home,
  Briefcase,
  FileText,
  Settings,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building,
  ShoppingCart,
  DollarSign,
  Award,
  Target,
  Zap,
  Heart,
  Star,
  Bookmark
}

const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || FileText
}

interface TemplateIconProps {
  /** 아이콘 이름 */
  icon?: string
  /** 배경 색상 (hex) */
  color?: string
  /** 추가 CSS 클래스 */
  className?: string
  /** 아이콘 크기 클래스 (기본: w-6 h-6) */
  iconSize?: string
}

export function TemplateIcon({
  icon = 'FileText',
  color = '#6b7280',
  className,
  iconSize = 'w-6 h-6'
}: TemplateIconProps) {
  const IconComponent = getIconComponent(icon)
  const textColor = isLightColor(color) ? 'text-gray-800' : 'text-white'

  return (
    <div
      className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0",
        className
      )}
      style={{ backgroundColor: color }}
    >
      <IconComponent className={`${iconSize} ${textColor}`} />
    </div>
  )
}