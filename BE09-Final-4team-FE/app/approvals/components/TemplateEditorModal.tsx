"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { typography } from "@/lib/design-tokens"
import { 
  TemplateFieldRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  FieldType,
  AttachmentInfoResponse,
  AttachmentUsageType 
} from "@/lib/services/approval/types"
import { useTemplate, useCategories } from "../hooks/useApproval"
import { TemplateIcon } from "./common/TemplateIcon"
import { AttachmentsManager, Attachment } from "@/components/ui/attachments-manager"
import {
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
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

// 사용 가능한 아이콘 목록
const availableIcons = [
  { name: "Calendar", icon: Calendar, value: "Calendar" },
  { name: "User", icon: User, value: "User" },
  { name: "CreditCard", icon: CreditCard, value: "CreditCard" },
  { name: "Car", icon: Car, value: "Car" },
  { name: "Home", icon: Home, value: "Home" },
  { name: "Briefcase", icon: Briefcase, value: "Briefcase" },
  { name: "FileText", icon: FileText, value: "FileText" },
  { name: "Settings", icon: Settings, value: "Settings" },
  { name: "Clock", icon: Clock, value: "Clock" },
  { name: "Mail", icon: Mail, value: "Mail" },
  { name: "Phone", icon: Phone, value: "Phone" },
  { name: "MapPin", icon: MapPin, value: "MapPin" },
  { name: "Building", icon: Building, value: "Building" },
  { name: "ShoppingCart", icon: ShoppingCart, value: "ShoppingCart" },
  { name: "DollarSign", icon: DollarSign, value: "DollarSign" },
  { name: "Award", icon: Award, value: "Award" },
  { name: "Target", icon: Target, value: "Target" },
  { name: "Zap", icon: Zap, value: "Zap" },
  { name: "Heart", icon: Heart, value: "Heart" },
  { name: "Star", icon: Star, value: "Star" },
  { name: "Bookmark", icon: Bookmark, value: "Bookmark" }
]

// 사용 가능한 색상 목록 (8x2 그리드: 진한색/연한색)
const availableColors = [
  // 첫 번째 줄 - 진한색
  { name: "빨강", value: "#b60205" },
  { name: "주황", value: "#d93f0b" },
  { name: "노랑", value: "#fbca04" },
  { name: "초록", value: "#0e8a16" },
  { name: "청록", value: "#006b75" },
  { name: "파랑", value: "#1d76db" },
  { name: "남색", value: "#0052cc" },
  { name: "보라", value: "#5319e7" },
  // 두 번째 줄 - 연한색
  { name: "연빨강", value: "#e99695" },
  { name: "연주황", value: "#f9d0c4" },
  { name: "연노랑", value: "#fef2c0" },
  { name: "연초록", value: "#c2e0c6" },
  { name: "연청록", value: "#bfdadc" },
  { name: "연파랑", value: "#c5def5" },
  { name: "연남색", value: "#bfd4f2" },
  { name: "연보라", value: "#d4c5f9" }
]

// 아이콘과 색상 선택 팔레트 컴포넌트
interface IconColorPaletteProps {
  selectedIcon: string
  selectedColor: string
  onIconSelect: (icon: string) => void
  onColorSelect: (color: string) => void
  children: React.ReactNode
}

function IconColorPalette({
  selectedIcon,
  selectedColor,
  onIconSelect,
  onColorSelect,
  children
}: IconColorPaletteProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* 아이콘 팔레트 */}
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2">
              {availableIcons.map((iconData) => {
                const Icon = iconData.icon
                const isSelected = selectedIcon === iconData.value
                return (
                  <button
                    key={iconData.value}
                    onClick={() => onIconSelect(iconData.value)}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center hover:bg-gray-50 transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* 색상 팔레트 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">색상</div>
            <div className="grid grid-cols-8 gap-2">
              {availableColors.map((colorData) => {
                const isSelected = selectedColor === colorData.value
                return (
                  <button
                    key={colorData.value}
                    onClick={() => onColorSelect(colorData.value)}
                    className={`w-7 h-7 rounded-sm flex items-center justify-center hover:scale-105 transition-transform ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: colorData.value }}
                    title={colorData.name}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TemplateEditorModalProps {
  isOpen: boolean
  onClose: () => void
  templateId?: number | null // null이면 새 양식, 있으면 수정
  onSave: (request: CreateTemplateRequest | UpdateTemplateRequest) => void
}

// 필드 타입별 기본 설정
const getFieldDefaults = (type: FieldType): Partial<TemplateFieldRequest> => {
  switch (type) {
    case FieldType.SELECT:
    case FieldType.MULTISELECT:
      return { options: JSON.stringify(["옵션 1", "옵션 2", "옵션 3"]) }
    default:
      return {}
  }
}

// 필드 구성 컴포넌트
function FieldConfigurationManager({
  fields,
  onFieldsChange
}: {
  fields: TemplateFieldRequest[]
  onFieldsChange: (fields: TemplateFieldRequest[]) => void
}) {
  const [expandedField, setExpandedField] = useState<number | null>(null)

  const addField = () => {
    const newField: TemplateFieldRequest = {
      name: `새 필드 ${fields.length + 1}`,
      fieldType: FieldType.TEXT,
      required: false,
      fieldOrder: fields.length + 1
    }
    onFieldsChange([...fields, newField])
    setExpandedField(fields.length) // 새로 추가된 필드를 펼쳐서 보여줌
  }

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, i) => i !== index))
    if (expandedField === index) {
      setExpandedField(null)
    }
  }

  const updateField = (index: number, updates: Partial<TemplateFieldRequest>) => {
    onFieldsChange(fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ))
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
      onFieldsChange(newFields)
    }
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          {/* 필드 헤더 */}
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setExpandedField(expandedField === index ? null : index)}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveField(index, 'up')
                  }}
                  disabled={index === 0}
                  className="h-4 w-4 p-0"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    moveField(index, 'down')
                  }}
                  disabled={index === fields.length - 1}
                  className="h-4 w-4 p-0"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
              <GripVertical className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium text-sm">{field.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{field.fieldType}</Badge>
                  {field.required && <Badge variant="destructive" className="text-xs">필수</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeField(index)
                }}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {expandedField === index ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>

          {/* 필드 설정 */}
          {expandedField === index && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 필드 이름 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">필드 이름</Label>
                  <Input
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    placeholder="필드 이름을 입력하세요"
                  />
                </div>

                {/* 필드 타입 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">필드 타입</Label>
                  <Select
                    value={field.fieldType}
                    onValueChange={(value: FieldType) => {
                      const defaults = getFieldDefaults(value)
                      updateField(index, { fieldType: value, ...defaults })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FieldType.TEXT}>텍스트</SelectItem>
                      <SelectItem value={FieldType.NUMBER}>숫자</SelectItem>
                      <SelectItem value={FieldType.MONEY}>금액</SelectItem>
                      <SelectItem value={FieldType.DATE}>날짜</SelectItem>
                      <SelectItem value={FieldType.SELECT}>단일 선택</SelectItem>
                      <SelectItem value={FieldType.MULTISELECT}>다중 선택</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


              {/* 필수 여부 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${index}`}
                  checked={field.required || false}
                  onCheckedChange={(checked) => updateField(index, { required: !!checked })}
                />
                <Label htmlFor={`required-${index}`} className="text-sm font-medium">
                  필수 입력 항목
                </Label>
              </div>

              {/* 옵션 설정 (select, multiselect인 경우) */}
              {(field.fieldType === FieldType.SELECT || field.fieldType === FieldType.MULTISELECT) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">선택 옵션</Label>
                  <div className="space-y-2">
                    {(() => {
                      let options: string[] = []
                      try {
                        options = field.options ? JSON.parse(field.options) : []
                      } catch {
                        options = []
                      }
                      return options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...options]
                              newOptions[optionIndex] = e.target.value
                              updateField(index, { options: JSON.stringify(newOptions) })
                            }}
                            placeholder={`옵션 ${optionIndex + 1}`}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOptions = options.filter((_, i) => i !== optionIndex)
                              updateField(index, { options: JSON.stringify(newOptions) })
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    })()}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        let options: string[] = []
                        try {
                          options = field.options ? JSON.parse(field.options) : []
                        } catch {
                          options = []
                        }
                        const newOptions = [...options, ""]
                        updateField(index, { options: JSON.stringify(newOptions) })
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      옵션 추가
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addField}
        className="w-full flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        필드 추가
      </Button>
    </div>
  )
}

// 참고 파일 관리 컴포넌트
function ReferenceFilesManager({
  referenceFiles,
  onReferenceFilesChange
}: {
  referenceFiles: AttachmentInfoResponse[]
  onReferenceFilesChange: (files: AttachmentInfoResponse[]) => void
}) {
  // AttachmentInfoResponse를 Attachment 형태로 변환
  const attachments: Attachment[] = referenceFiles.map(file => ({
    id: file.fileId,
    name: file.fileName,
    size: file.fileSize.toString(),
    url: '' // API에서는 url 필드 없음
  }))

  // Attachment를 AttachmentInfoResponse 형태로 변환하여 저장
  const handleAttachmentsChange = (newAttachments: Attachment[]) => {
    const newReferenceFiles: AttachmentInfoResponse[] = newAttachments.map(attachment => {
      // 기존 참고파일에서 정보 찾기
      const existingFile = referenceFiles.find(f => f.fileId === attachment.id)
      return {
        fileId: attachment.id,
        fileName: attachment.name,
        fileSize: parseInt(attachment.size || '0') || 0,
        contentType: existingFile?.contentType || 'application/octet-stream'
      }
    })
    onReferenceFilesChange(newReferenceFiles)
  }

  return (
    <div className="space-y-4">
      <AttachmentsManager
        attachments={attachments}
        onAttachmentsChange={handleAttachmentsChange}
        maxFiles={5}
        maxFileSize={50}
      />
      
      {/* 참고파일 목록 표시 */}
      {referenceFiles.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">첨부된 참고 파일</Label>
          {referenceFiles.map((file, index) => (
            <div key={file.fileId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 truncate">{file.fileName}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {(file.fileSize / 1024 / 1024).toFixed(2)}MB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TemplateEditorModal({ 
  isOpen, 
  onClose, 
  templateId = null, 
  onSave 
}: TemplateEditorModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [selectedIcon, setSelectedIcon] = useState("FileText")
  const [selectedColor, setSelectedColor] = useState("#3b82f6")
  const [fields, setFields] = useState<TemplateFieldRequest[]>([])
  const [bodyTemplate, setBodyTemplate] = useState("")
  const [referenceFiles, setReferenceFiles] = useState<AttachmentInfoResponse[]>([])
  const [useAttachment, setUseAttachment] = useState<AttachmentUsageType>(AttachmentUsageType.OPTIONAL)
  const [useBody, setUseBody] = useState(true)

  const isEditing = !!templateId

  // API 훅 사용
  const { data: template, isLoading: templateLoading } = useTemplate(templateId)
  const { data: categories = [] } = useCategories()

  // 모달이 열릴 때 기존 양식 데이터로 초기화 또는 기본값 설정
  useEffect(() => {
    if (isOpen) {
      if (template && templateId) {
        // 수정 모드: API 데이터로 초기화
        setTitle(template.title)
        setDescription(template.description || "")
        setCategoryId(template.category?.id)
        setSelectedIcon(template.icon || "FileText")
        setSelectedColor(template.color || "#3b82f6")
        
        // 필드 데이터 변환 (TemplateFieldResponse → TemplateFieldRequest)
        const convertedFields: TemplateFieldRequest[] = template.fields.map(field => ({
          name: field.name,
          fieldType: field.fieldType,
          required: field.required,
          fieldOrder: field.fieldOrder,
          options: field.options
        }))
        setFields(convertedFields)
        
        setBodyTemplate(template.bodyTemplate || "")
        setReferenceFiles(template.referenceFiles || [])
        setUseAttachment(template.useAttachment)
        setUseBody(template.useBody)
      } else if (!templateId) {
        // 새 양식 모드: 기본값으로 초기화
        setTitle("")
        setDescription("")
        setCategoryId(undefined)
        setSelectedIcon("FileText")
        setSelectedColor("#3b82f6")
        setFields([])
        setBodyTemplate("")
        setReferenceFiles([])
        setUseAttachment(AttachmentUsageType.OPTIONAL)
        setUseBody(true)
      }
    }
  }, [isOpen, template, templateId])

  const handleSave = () => {
    if (!title.trim()) {
      alert("양식 제목을 입력해주세요.")
      return
    }
    if (!description.trim()) {
      alert("양식 설명을 입력해주세요.")
      return
    }

    const selectedIconData = availableIcons.find(icon => icon.value === selectedIcon)
    if (!selectedIconData) {
      alert("아이콘을 선택해주세요.")
      return
    }

    // 필드 데이터에 fieldOrder 업데이트
    const fieldsWithOrder = fields.map((field, index) => ({
      ...field,
      fieldOrder: index + 1
    }))

    const requestData = {
      title: title.trim(),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor,
      bodyTemplate: bodyTemplate,
      useBody: useBody,
      useAttachment: useAttachment,
      allowTargetChange: true, // 기본값
      categoryId: categoryId,
      fields: fieldsWithOrder,
      referenceFiles: referenceFiles.map(file => file.fileId)
    }

    if (isEditing) {
      onSave(requestData as UpdateTemplateRequest)
    } else {
      onSave(requestData as CreateTemplateRequest)
    }
    onClose()
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl !w-[95vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="pb-4 px-6 pt-6 flex-shrink-0">
          <DialogTitle className={`${typography.h2} text-gray-800`}>
            {isEditing ? "양식 수정" : "새 양식 만들기"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className={`${typography.h3} text-gray-800`}>기본 정보</h3>
              
              {/* 양식 미리보기 */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <IconColorPalette
                  selectedIcon={selectedIcon}
                  selectedColor={selectedColor}
                  onIconSelect={setSelectedIcon}
                  onColorSelect={setSelectedColor}
                >
                  <div className="border border-gray-200 rounded-lg p-2 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <TemplateIcon
                        icon={selectedIcon}
                        color={selectedColor}
                        className="group-hover:shadow-md transition-shadow"
                        iconSize="w-6 h-6 group-hover:scale-110 transition-transform"
                      />
                    </div>
                  </div>
                </IconColorPalette>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {title || "양식 제목"}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {description || "양식 설명"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">양식 제목</Label>
                  <Input
                    placeholder="양식 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">카테고리</Label>
                  <Select 
                    value={categoryId?.toString() || "none"} 
                    onValueChange={(value) => setCategoryId(value === "none" ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">카테고리 없음</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">양식 설명</Label>
                <Textarea
                  placeholder="양식에 대한 설명을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>

            <Separator />

            {/* 양식 필드 구성 */}
            <div className="space-y-4">
              <h3 className={`${typography.h3} text-gray-800`}>양식 필드</h3>
              <FieldConfigurationManager
                fields={fields}
                onFieldsChange={setFields}
              />
            </div>

            <Separator />

            {/* 기본 콘텐츠 - 내용 작성란이 활성화된 경우에만 표시 */}
            {useBody && (
              <div className="space-y-4">
                <h3 className={`${typography.h3} text-gray-800`}>내용</h3>
                <div className="space-y-2">
                  <Textarea
                    placeholder="양식 작성 시 기본으로 표시될 내용을 입력하세요"
                    value={bodyTemplate}
                    onChange={(e) => setBodyTemplate(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500">
                    사용자가 양식을 작성할 때 본문에 미리 채워질 내용입니다.
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* 설정 */}
            <div className="space-y-4">
              <h3 className={`${typography.h3} text-gray-800`}>설정</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">첨부파일 설정</Label>
                  <Select 
                    value={useAttachment} 
                    onValueChange={(value: AttachmentUsageType) => setUseAttachment(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AttachmentUsageType.DISABLED}>사용 안함</SelectItem>
                      <SelectItem value={AttachmentUsageType.OPTIONAL}>사용</SelectItem>
                      <SelectItem value={AttachmentUsageType.REQUIRED}>필수</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">내용 작성란</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="use-body"
                      checked={useBody}
                      onCheckedChange={setUseBody}
                    />
                    <Label htmlFor="use-body" className="text-sm">
                      {useBody ? "사용" : "사용 안함"}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 참고 파일 */}
            <div className="space-y-4">
              <h3 className={`${typography.h3} text-gray-800`}>참고 파일</h3>
              <ReferenceFilesManager
                referenceFiles={referenceFiles}
                onReferenceFilesChange={setReferenceFiles}
              />
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? "수정" : "생성"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
