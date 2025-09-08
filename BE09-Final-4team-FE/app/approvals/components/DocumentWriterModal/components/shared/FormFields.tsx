"use client"

import { memo, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { FormFieldRenderer } from "../FormFieldRenderer"

interface FormFieldsProps {
  formTemplate: any
  templateLoading: boolean
  formFieldValues: Record<string, any>
  setFormFieldValues: (values: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void
  isMobile?: boolean
}

const FormFieldsComponent = ({
  formTemplate,
  templateLoading,
  formFieldValues,
  setFormFieldValues,
  isMobile = false
}: FormFieldsProps) => {
  // onChange 핸들러를 메모이제이션
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setFormFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }, [setFormFieldValues])

  if (templateLoading || !formTemplate) {
    const skeletonCount = 2
    return (
      <div className="space-y-4">
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
          {[...Array(skeletonCount)].map((_, index) => (
            <div key={`skeleton-field-${index}`} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!formTemplate.fields || formTemplate.fields.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-4`}>
        {formTemplate.fields.map((field: any, index: number) => (
          <div key={field.id || `field-${index}-${field.name}`} className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <FormFieldRenderer
              field={field}
              value={formFieldValues[field.name]}
              onChange={(value) => handleFieldChange(field.name, value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const FormFields = memo(FormFieldsComponent)