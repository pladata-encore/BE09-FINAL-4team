"use client"

import { Button } from "@/components/ui/button"
import { CategoryResponse } from "@/lib/services/approval/types"

interface CategoryFilterButtonsProps {
  categories: CategoryResponse[]
  selectedCategory: number | null
  onSelectCategory: (id: number | null) => void
  showUncategorized?: boolean
  hasUncategorizedItems?: boolean
  className?: string
}

export function CategoryFilterButtons({
  categories,
  selectedCategory,
  onSelectCategory,
  showUncategorized = false,
  hasUncategorizedItems = false,
  className = ""
}: CategoryFilterButtonsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* 전체 버튼 */}
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory(null)}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        전체
      </Button>
      
      {/* 카테고리 버튼들 */}
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.id)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {category.name}
        </Button>
      ))}
      
      {/* 분류 미지정 버튼 */}
      {showUncategorized && hasUncategorizedItems && (
        <Button
          variant={selectedCategory === -1 ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(-1)}
          className="flex items-center gap-2 whitespace-nowrap text-gray-500"
        >
          분류 미지정
        </Button>
      )}
    </div>
  )
}