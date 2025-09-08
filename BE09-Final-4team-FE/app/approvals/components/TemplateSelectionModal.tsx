"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { typography } from "@/lib/design-tokens"
import { FileText } from "lucide-react"
import { TemplateSummaryResponse, DocumentSummaryResponse, DocumentStatus } from "@/lib/services/approval/types"
import { TemplatesGrid } from "./common/TemplatesGrid"
import { CategoryFilterButtons } from "./common/CategoryFilterButtons"
import { useTemplateFiltering } from "../hooks/useTemplateFiltering"
import { useDocuments } from "../hooks/useApproval"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Clock, Trash2 } from "lucide-react"
import { getRelativeTime } from "@/lib/utils/datetime"
import { TemplateIcon } from "./common/TemplateIcon"

interface TemplateSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectForm: (form: TemplateSummaryResponse) => void
  onSelectDraftDocument: (document: DocumentSummaryResponse) => void
}

export function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelectForm,
  onSelectDraftDocument,
}: TemplateSelectionModalProps) {
  const router = useRouter()
  
  // 커스텀 훅 사용
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredTemplates: filteredForms,
    categoriesData,
    isLoading,
    error
  } = useTemplateFiltering()

  // 작성중인 문서 데이터 가져오기
  const { data: draftDocumentsResponse } = useDocuments({
    status: [DocumentStatus.DRAFT],
    pageable: { page: 0, size: 5 }
  })

  const draftDocuments = draftDocumentsResponse?.content || []

  const handleFormSelect = (form: TemplateSummaryResponse) => {
    onSelectForm(form)
    onClose()
  }

  const handleDraftDocumentClick = (document: DocumentSummaryResponse) => {
    onSelectDraftDocument(document)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl !w-[95vw] h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 flex-shrink-0">
          <DialogTitle className={`${typography.h2} text-gray-800`}>문서 작성하기</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* 로딩 및 에러 처리 */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500">템플릿을 불러오고 있습니다...</div>
            </div>
          )}
          
          {error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-red-500">템플릿을 불러오는 중 오류가 발생했습니다.</div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* 작성중인 문서 */}
              {draftDocuments.length > 0 && (
                <div className="px-6 pb-6 flex-shrink-0">
                  <h3 className={`${typography.h4} text-gray-700 mb-2 flex items-center gap-2`}>
                    <Clock className="w-4 h-4 text-gray-500" />
                    이어서 작성하기
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {draftDocuments.map((document) => (
                      <div
                        key={document.id}
                        className="min-w-0 flex-shrink-0 w-64"
                      >
                        <GlassCard
                          className="p-3 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300"
                          onClick={() => handleDraftDocumentClick(document)}
                        >
                          <div className="flex items-start gap-3">
                            <TemplateIcon
                              icon={document.template.icon}
                              color={document.template.color}
                              className="w-10 h-10"
                              iconSize="w-5 h-5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-800 truncate flex-1">
                                  {document.template.title}
                                </h4>
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  임시저장
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500">
                                {getRelativeTime(document.updatedAt)}
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 검색바 */}
              <div className="px-6 pb-4 flex-shrink-0">
                <h3 className={`${typography.h4} text-gray-700 mb-2 flex items-center gap-2`}>
                  <FileText className="w-4 h-4 text-gray-500" />
                  문서 양식 선택
                </h3>
                <Input
                  placeholder="검색어 입력"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-5 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                />
              </div>

              {/* 카테고리 필터 */}
              <div className="px-6 pb-4 flex-shrink-0">
                <CategoryFilterButtons
                  categories={categoriesData}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  className="overflow-x-auto pb-2"
                />
              </div>

              {/* 양식 목록 */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
                {filteredForms.length > 0 ? (
                  <TemplatesGrid
                    forms={filteredForms}
                    onCardClick={handleFormSelect}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || selectedCategory !== null 
                        ? "검색 조건에 맞는 양식이 없습니다." 
                        : "사용 가능한 양식이 없습니다."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
