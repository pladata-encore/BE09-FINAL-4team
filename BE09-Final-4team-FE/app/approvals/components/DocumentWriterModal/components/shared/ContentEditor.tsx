"use client"

import { forwardRef, useImperativeHandle, useRef, memo } from "react"
import { Textarea } from "@/components/ui/textarea"

interface ContentEditorProps {
  initialContent?: string
  setContent: (content: string) => void
  isMobile?: boolean
  placeholder?: string
}

export interface ContentEditorRef {
  setValue: (content: string) => void
  getValue: () => string
}

const ContentEditorComponent = forwardRef<ContentEditorRef, ContentEditorProps>((
  {
    initialContent = "",
    setContent,
    isMobile = false,
    placeholder = "내용을 입력하세요"
  },
  ref
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    setValue: (content: string) => {
      if (textareaRef.current) {
        textareaRef.current.value = content
      }
    },
    getValue: () => {
      return textareaRef.current?.value || ""
    }
  }), [])

  return (
    <div className="space-y-2 flex-1 flex flex-col min-h-0">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        defaultValue={initialContent}
        onChange={(e) => setContent(e.target.value)}
        className={
          isMobile 
            ? "min-h-[200px] resize-none"
            : "flex-1 min-h-0 resize-none overflow-y-auto"
        }
      />
    </div>
  )
})

ContentEditorComponent.displayName = 'ContentEditor'

export const ContentEditor = memo(ContentEditorComponent)