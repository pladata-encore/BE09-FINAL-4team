"use client"

import { memo } from "react"
import { Separator } from "@/components/ui/separator"

interface LoadingSkeletonsProps {
  isMobile?: boolean
}

const LoadingSkeletonsComponent = ({ isMobile = false }: LoadingSkeletonsProps) => {
  if (isMobile) {
    return (
      <>
        {/* 참고파일 스켈레톤 */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* 승인 단계 스켈레톤 */}
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">로드 중...</span>
          </div>
        </div>

        {/* 참조자 스켈레톤 */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">로드 중...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* 참고파일 스켈레톤 */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      <Separator />
    </>
  )
}

const LoadingContent = memo(({ templateLoading, usersLoading }: {
  templateLoading: boolean
  usersLoading: boolean
}) => (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm text-gray-600">
        {templateLoading ? "템플릿 로드 중..." : "사용자 목록 로드 중..."}
      </span>
    </div>
  </div>
))

const ReferencesLoadingContent = memo(({ templateLoading }: {
  templateLoading: boolean
}) => (
  <div className="flex items-center justify-center py-4">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm text-gray-600">
        {templateLoading ? "템플릿 로드 중..." : "로드 중..."}
      </span>
    </div>
  </div>
))

export const LoadingSkeletons = memo(LoadingSkeletonsComponent)
export { LoadingContent, ReferencesLoadingContent }