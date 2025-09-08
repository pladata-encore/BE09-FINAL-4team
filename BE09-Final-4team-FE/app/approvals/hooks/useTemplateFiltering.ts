import { useState, useMemo } from 'react'
import { TemplateSummaryResponse, CategoryResponse } from '@/lib/services/approval/types'
import { useTemplates, useCategories } from './useApproval'

export interface UseTemplateFilteringReturn {
  // 상태
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: number | null
  setSelectedCategory: (id: number | null) => void
  
  // 데이터
  allTemplates: TemplateSummaryResponse[]
  filteredTemplates: TemplateSummaryResponse[]
  categoriesData: CategoryResponse[]
  
  // 로딩/에러 상태
  isLoading: boolean
  error: any
}

export function useTemplateFiltering(): UseTemplateFilteringReturn {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  
  // API 데이터 가져오기
  const { data: allTemplates = [], isLoading, error } = useTemplates()
  const { data: categoriesData = [] } = useCategories()
  
  // 템플릿 필터링
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((form) => {
      const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (form.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === null ||  // null이면 전체 선택
        form.category?.id === selectedCategory ||
        (selectedCategory === -1 && !form.category)  // -1이면 분류 미지정
      
      return matchesSearch && matchesCategory
    })
  }, [allTemplates, searchTerm, selectedCategory])
  
  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    allTemplates,
    filteredTemplates,
    categoriesData,
    isLoading,
    error
  }
}