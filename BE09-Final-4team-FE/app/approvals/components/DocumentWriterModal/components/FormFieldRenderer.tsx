"use client"

import { memo, useCallback, useMemo, useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CalendarDays } from "lucide-react"
import { TemplateFieldResponse, FieldType } from "@/lib/services/approval/types"

const formatMoney = (value: string): string => {
  const number = value.replace(/[^\d]/g, '')
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const parseOptions = (optionsString?: string): string[] => {
  if (!optionsString) return []
  try {
    return JSON.parse(optionsString)
  } catch {
    return optionsString.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0)
  }
}

interface FormFieldRendererProps {
  field: TemplateFieldResponse
  value: any
  onChange: (value: any) => void
}

const FormFieldRendererComponent = ({
  field,
  value,
  onChange
}: FormFieldRendererProps) => {
  // 로컬 상태로 입력값 관리
  const [localValue, setLocalValue] = useState(value || '')
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // props value가 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    setLocalValue(value || '')
  }, [value])
  
  // setLocalValue와 debouncedOnChange를 합친 함수
  const updateValue = useCallback((newValue: any) => {
    setLocalValue(newValue)
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(newValue)
    }, 500) // 500ms 지연
  }, [onChange])
  
  // blur 시점에 즉시 업데이트
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }
    onChange(e.target.value)
  }, [onChange])
  
  // cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])
  const handleMultiSelectChange = useCallback((optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : []
    if (checked) {
      onChange([...currentValues, optionValue])
    } else {
      onChange(currentValues.filter((v: string) => v !== optionValue))
    }
  }, [value, onChange])

  const handleMoneyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMoney(e.target.value)
    updateValue(formatted)
  }, [updateValue])

  const options = useMemo(() => parseOptions(field.options), [field.options])

  switch (field.fieldType) {
    case FieldType.TEXT:
      return (
        <Input
          type="text"
          placeholder={`${field.name}를 입력하세요`}
          value={localValue}
          onChange={(e) => updateValue(e.target.value)}
          onBlur={handleBlur}
          className="w-full"
        />
      )

    case FieldType.NUMBER:
      return (
        <Input
          type="number"
          placeholder={`${field.name}를 입력하세요`}
          value={localValue}
          onChange={(e) => updateValue(e.target.value)}
          onBlur={handleBlur}
          className="w-full"
        />
      )

    case FieldType.MONEY:
      return (
        <div className="relative">
          <Input
            type="text"
            placeholder={`${field.name}를 입력하세요`}
            value={localValue}
            onChange={handleMoneyChange}
            onBlur={handleBlur}
            className="w-full pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            원
          </span>
        </div>
      )

    case FieldType.DATE:
      return (
        <div className="relative">
          <Input
            type="date"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            className="w-full"
          />
          <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      )

    case FieldType.SELECT:
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="옵션을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case FieldType.MULTISELECT:
      const selectedValues = Array.isArray(value) ? value : []
      return (
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.name}-${option}`}
                checked={selectedValues.includes(option)}
                onCheckedChange={(checked) => handleMultiSelectChange(option, !!checked)}
              />
              <Label
                htmlFor={`${field.name}-${option}`}
                className="text-sm font-normal"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}

// React.memo로 컴포넌트 최적화
export const FormFieldRenderer = memo(FormFieldRendererComponent, (prevProps, nextProps) => {
  return (
    prevProps.field === nextProps.field &&
    prevProps.value === nextProps.value &&
    prevProps.onChange === nextProps.onChange
  )
})