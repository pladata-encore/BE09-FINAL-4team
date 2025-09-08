"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { User } from "lucide-react"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-gradient-to-r from-blue-400 to-indigo-500 flex size-full items-center justify-center rounded-full text-white font-medium",
        className
      )}
      {...props}
    >
      {children || <User className="w-1/2 h-1/2" />}
    </AvatarPrimitive.Fallback>
  )
}

// 편의를 위한 통합 Avatar 컴포넌트
interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  src?: string | null
  alt?: string
  fallback?: string | React.ReactNode
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

function UserAvatar({ 
  src, 
  alt = "프로필", 
  fallback,
  size = "md",
  className,
  ...props 
}: UserAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  const iconSizes = {
    xs: "w-2.75 h-2.75",
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6", 
    xl: "w-8 h-8"
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)} {...props}>
      <AvatarImage src={src || undefined} alt={alt} />
      <AvatarFallback>
        {fallback || <User className={iconSizes[size]} />}
      </AvatarFallback>
    </Avatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }
