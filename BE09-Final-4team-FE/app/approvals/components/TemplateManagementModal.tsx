"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { TemplatesGrid } from "./common/TemplatesGrid"
import { TemplateEditorModal } from "./TemplateEditorModal"
import { CategoryFilterButtons } from "./common/CategoryFilterButtons"
import { colors, typography } from "@/lib/design-tokens"
import { 
  TemplateSummaryResponse, 
  CategoryResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BulkCategoryRequest,
  BulkCategoryOperationType
} from "@/lib/services/approval/types"
import {
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useUpdateTemplateVisibility,
  useBulkProcessCategories
} from "../hooks/useApproval"
import { useTemplateFiltering } from "../hooks/useTemplateFiltering"
import { MoreVertical, FolderPlus, Edit, Copy, Trash2, Settings, FileText, Plus, X, GripVertical, Search } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'


interface TemplateManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenFormEditor?: (form: TemplateSummaryResponse | null) => void // null: 새 양식
}

// 드래그 가능한 카테고리 아이템 컴포넌트
interface SortableCategoryItemProps {
  category: CategoryResponse
  onRename: (categoryId: number, newName: string) => void
  onRemove: (categoryId: number) => void
}

function SortableCategoryItem({ category, onRename, onRemove }: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 bg-gray-50 rounded-lg p-2 transition-all duration-200 ${
        isDragging 
          ? 'shadow-2xl border border-blue-200 bg-white scale-105' 
          : 'hover:bg-gray-100 border border-transparent'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-200 transition-colors"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>
      <Input
        className="text-sm w-20 h-7 px-2 bg-white"
        value={category.name}
        onChange={(e) => onRename(category.id, e.target.value)}
      />
      <Button
        variant="ghost"
        size="icon"
        className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => onRemove(category.id)}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}

export function TemplateManagementModal({ isOpen, onClose, onOpenFormEditor }: TemplateManagementModalProps) {
  // 공통 필터링 로직 사용
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    allTemplates,
    filteredTemplates: filteredForms,
    categoriesData,
  } = useTemplateFiltering()
  
  // FormManagementModal 고유 상태
  const [isEditingCategories, setIsEditingCategories] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isFormEditorOpen, setIsFormEditorOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<TemplateSummaryResponse | null>(null)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false)
  
  // 카테고리 편집 상태 관리
  const [localCategories, setLocalCategories] = useState<CategoryResponse[]>([])
  const [originalCategories, setOriginalCategories] = useState<CategoryResponse[]>([])
  const [categoryOperations, setCategoryOperations] = useState<any[]>([])
  
  // 카테고리 벌크 작업 mutation
  const bulkProcessMutation = useBulkProcessCategories()
  
  // 템플릿 관련 mutations
  const createTemplateMutation = useCreateTemplate()
  const updateTemplateMutation = useUpdateTemplate()
  const deleteTemplateMutation = useDeleteTemplate()
  const updateVisibilityMutation = useUpdateTemplateVisibility()
  
  // 카테고리 목록 (순수 API 데이터만)
  const categories = isEditingCategories ? localCategories : categoriesData
  
  // 로컬 카테고리 상태 초기화 (카테고리 편집 모드 진입 시)
  useEffect(() => {
    if (isEditingCategories && localCategories.length === 0) {
      setLocalCategories([...categoriesData])
      setOriginalCategories([...categoriesData])
    }
  }, [isEditingCategories, categoriesData, localCategories.length])

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 드래그 중 실시간 순서 변경 핸들러
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      setLocalCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // 드래그 완료 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    // 드래그가 완료되면 sortOrder 업데이트
    setLocalCategories(prev => 
      prev.map((cat, index) => ({ ...cat, sortOrder: index + 1 }))
    )
  }


  const handleNewForm = () => {
    setEditingForm(null)
    setIsFormEditorOpen(true)
  }

  const handleEditForm = (form: TemplateSummaryResponse) => {
    setEditingForm(form)
    setIsFormEditorOpen(true)
  }

  const handleFormSave = async (request: CreateTemplateRequest | UpdateTemplateRequest) => {
    try {
      if (editingForm) {
        // 수정 모드
        await updateTemplateMutation.mutateAsync({ id: editingForm.id, request: request as UpdateTemplateRequest })
      } else {
        // 생성 모드
        await createTemplateMutation.mutateAsync(request as CreateTemplateRequest)
      }
      setIsFormEditorOpen(false)
      setEditingForm(null)
    } catch (error) {
      console.error('Template save failed:', error)
    }
  }

  const handleDuplicate = async (form: TemplateSummaryResponse) => {
    try {
      const duplicateRequest: CreateTemplateRequest = {
        title: `${form.title} (복제)`,
        icon: form.icon,
        color: form.color,
        description: form.description,
        useBody: form.useBody,
        useAttachment: form.useAttachment,
        allowTargetChange: form.allowTargetChange,
        categoryId: form.category?.id
      }
      await createTemplateMutation.mutateAsync(duplicateRequest)
    } catch (error) {
      console.error('템플릿 복제 실패:', error)
    }
  }

  const handleDelete = async (form: TemplateSummaryResponse) => {
    try {
      await deleteTemplateMutation.mutateAsync(form.id)
    } catch (error) {
      console.error('템플릿 삭제 실패:', error)
    }
  }

  const handleToggleHidden = async (form: TemplateSummaryResponse, hidden: boolean) => {
    try {
      await updateVisibilityMutation.mutateAsync({ id: form.id, isHidden: hidden })
    } catch (error) {
      console.error('템플릿 공개 설정 실패:', error)
    }
  }

  const handleChangeCategory = async (form: TemplateSummaryResponse, categoryId: number) => {
    try {
      const updateRequest: UpdateTemplateRequest = {
        title: form.title,
        icon: form.icon,
        color: form.color,
        description: form.description,
        useBody: form.useBody,
        useAttachment: form.useAttachment,
        allowTargetChange: form.allowTargetChange,
        categoryId
      }
      await updateTemplateMutation.mutateAsync({ id: form.id, request: updateRequest })
    } catch (error) {
      console.error('템플릿 카테고리 변경 실패:', error)
    }
  }

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (!name) return
    
    // 임시 ID 생성 (음수로 새로운 카테고리 구분)
    const tempId = -(Date.now())
    const newCategory = {
      id: tempId,
      name,
      sortOrder: localCategories.length + 1
    }
    
    setLocalCategories(prev => [...prev, newCategory])
    setNewCategoryName("")
  }

  const handleRemoveCategory = (categoryId: number) => {
    setDeletingCategoryId(categoryId)
  }

  const handleConfirmRemoveCategory = () => {
    if (!deletingCategoryId) return
    
    setLocalCategories(prev => prev.filter(c => c.id !== deletingCategoryId))
    
    if (selectedCategory === deletingCategoryId) {
      setSelectedCategory(null)
    }
    
    setDeletingCategoryId(null)
  }

  const handleDiscardCategoryEditing = () => {
    setIsEditingCategories(false)
    setLocalCategories([])
    setOriginalCategories([])
    setDeletingCategoryId(null)
    setNewCategoryName("")
    setIsAddCategoryModalOpen(false)
  }

  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (isEditingCategories) {
        // 편집 중이면 확인 창을 띄운다
        setIsCloseConfirmOpen(true)
      } else {
        // 편집 중이 아니면 바로 닫는다
        onClose()
      }
    }
  }

  const handleConfirmClose = () => {
    handleDiscardCategoryEditing()
    setIsCloseConfirmOpen(false)
    onClose()
  }

  const handleRenameCategoryInline = (categoryId: number, newName: string) => {
    setLocalCategories(prev => 
      prev.map(c => c.id === categoryId ? { ...c, name: newName } : c)
    )
  }
  
  // 카테고리 편집 완료 처리
  const handleFinishCategoryEditing = async () => {
    const operations: any[] = []
    
    // 기존 카테고리와 비교하여 작업 생성
    localCategories.forEach((localCat, index) => {
      const originalCat = originalCategories.find(c => c.id === localCat.id)
      
      if (localCat.id < 0) {
        // 새로운 카테고리 (CREATE)
        operations.push({
          type: BulkCategoryOperationType.CREATE,
          createRequest: {
            name: localCat.name,
            sortOrder: index + 1
          }
        })
      } else if (originalCat) {
        // 기존 카테고리 변경사항 체크 (UPDATE)
        const hasNameChanged = originalCat.name !== localCat.name
        const hasSortOrderChanged = originalCat.sortOrder !== (index + 1)
        
        if (hasNameChanged || hasSortOrderChanged) {
          operations.push({
            type: BulkCategoryOperationType.UPDATE,
            id: originalCat.id,
            updateRequest: {
              name: localCat.name,
              sortOrder: index + 1
            }
          })
        }
      }
    })
    
    // 삭제된 카테고리 처리 (DELETE)
    originalCategories.forEach(originalCat => {
      const exists = localCategories.find(c => c.id === originalCat.id)
      if (!exists) {
        operations.push({
          type: BulkCategoryOperationType.DELETE,
          id: originalCat.id
        })
      }
    })
    
    // 변경사항이 있을 때만 벌크 작업 실행
    if (operations.length > 0) {
      await bulkProcessMutation.mutateAsync({ operations })
    }
    
    // 편집 모드 종료
    setIsEditingCategories(false)
    setLocalCategories([])
    setOriginalCategories([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="!max-w-5xl !w-[95vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="pb-4 px-6 pt-6 flex-shrink-0">
          <DialogTitle className={`${typography.h2} text-gray-800`}>문서 양식 관리</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="px-6 pb-4 flex-shrink-0 flex items-center gap-2">
            <Input
              placeholder="검색어 입력"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-5 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
            />

            <Button 
              variant="outline"
              onClick={isEditingCategories ? handleFinishCategoryEditing : () => setIsEditingCategories(true)} 
              className={`flex items-center gap-2 ${isEditingCategories ? "border-green-500 text-green-600 hover:bg-green-50" : ""}`}
            >
              <Settings className="w-4 h-4" /> {isEditingCategories ? "편집 완료" : "분류 수정"}
            </Button>

            <Button onClick={handleNewForm} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <FolderPlus className="w-4 h-4" /> 새 양식 만들기
            </Button>
          </div>

          <div className="px-6 pb-4 flex-shrink-0">
            {isEditingCategories ? (
              <div className="space-y-3">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                          onRename={handleRenameCategoryInline}
                          onRemove={handleRemoveCategory}
                        />
                      ))}
                      <Button
                        variant="outline"
                        className="flex items-center gap-1 bg-gray-50 rounded-lg h-10 px-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
                        onClick={() => setIsAddCategoryModalOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                        새 분류 추가
                      </Button>
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <CategoryFilterButtons
                categories={categoriesData}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                showUncategorized={true}
                hasUncategorizedItems={allTemplates.some(t => !t.category)}
                className="pb-2"
              />
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
            <TemplatesGrid
              forms={filteredForms}
              onCardClick={handleEditForm}
              renderOverlay={(form) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[180px]">
                    <DropdownMenuItem onClick={() => handleEditForm(form)}>
                      <Edit className="w-4 h-4" /> 양식 편집
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>양식 분류 변경</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {categoriesData.map((c) => (
                          <DropdownMenuItem key={c.id} onClick={() => handleChangeCategory(form, c.id)}>
                            {c.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      숨기기
                      <Switch
                        className="ml-auto"
                        checked={form.isHidden}
                        onCheckedChange={(v) => handleToggleHidden(form, v)}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(form)}>
                      <Copy className="w-4 h-4" /> 양식 복제
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => handleDelete(form)}>
                      <Trash2 className="w-4 h-4" /> 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </div>
        </div>
      </DialogContent>

      {/* 양식 편집기 모달 */}
      <TemplateEditorModal
        isOpen={isFormEditorOpen}
        onClose={() => setIsFormEditorOpen(false)}
        templateId={editingForm?.id || null}
        onSave={handleFormSave}
      />

      {/* 새 분류 추가 모달 */}
      <Dialog open={isAddCategoryModalOpen} onOpenChange={setIsAddCategoryModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">새 분류 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="분류 이름을 입력하세요"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full"
              onKeyPress={(e) => {
                if (e.key === "Enter" && newCategoryName.trim()) {
                  handleAddCategory()
                  setIsAddCategoryModalOpen(false)
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddCategoryModalOpen(false)
                  setNewCategoryName("")
                }}
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  if (newCategoryName.trim()) {
                    handleAddCategory()
                    setIsAddCategoryModalOpen(false)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newCategoryName.trim()}
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 분류 삭제 확인 AlertDialog */}
      <AlertDialog open={deletingCategoryId !== null} onOpenChange={() => setDeletingCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>분류 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const deletingCategory = localCategories.find(c => c.id === deletingCategoryId)
                const formsInCategory = allTemplates.filter(template => template.category?.id === deletingCategoryId).length
                
                return (
                  <div className="space-y-2">
                    <p>
                      '<strong>{deletingCategory?.name}</strong>' 분류를 삭제하시겠습니까?
                    </p>
                    {formsInCategory > 0 ? (
                      <p className="text-amber-600 bg-amber-50 p-3 rounded-md">
                        ⚠️ 이 분류에 속한 <strong>{formsInCategory}개</strong>의 양식이 '분류 미지정'으로 변경됩니다.
                      </p>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        이 분류에 속한 양식이 없습니다.
                      </p>
                    )}
                  </div>
                )
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCategoryId(null)}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRemoveCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 편집 중 모달 닫기 확인 AlertDialog */}
      <AlertDialog open={isCloseConfirmOpen} onOpenChange={setIsCloseConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>편집 중인 변경사항이 있습니다</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  편집 중인 분류 변경사항이 저장되지 않습니다.
                </p>
                <p className="text-amber-600 bg-amber-50 p-3 rounded-md">
                  ⚠️ 변경사항을 저장하지 않고 닫으시겠습니까?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCloseConfirmOpen(false)}>
              계속 편집
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmClose}
              className="bg-red-600 hover:bg-red-700"
            >
              저장하지 않고 닫기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
