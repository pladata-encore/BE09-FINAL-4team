"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SimpleDropdownProps {
  options: (string | { id: number; name: string; sortOrder?: number })[]
  value?: string | { id: number; name: string; sortOrder?: number }
  placeholder?: string
  onChange: (value: string | { id: number; name: string; sortOrder?: number }) => void
  triggerClassName?: string
  menuClassName?: string
  disabled?: boolean
}

export default function SimpleDropdown({
  options,
  value,
  placeholder = "선택",
  onChange,
  triggerClassName,
  menuClassName,
  disabled = false,
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerWrapRef = useRef<HTMLDivElement | null>(null)
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const update = () => {
      const w = triggerWrapRef.current?.offsetWidth
      if (w && w !== contentWidth) setContentWidth(w)
    }
    update()
    const ro = new ResizeObserver(update)
    if (triggerWrapRef.current) ro.observe(triggerWrapRef.current)
    return () => ro.disconnect()
  }, [contentWidth])

  const selectedLabel = typeof value === 'object' ? value?.name : value ?? ""

  return (
    <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
      <div ref={triggerWrapRef} className="w-full">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              disabled && "opacity-60 cursor-not-allowed",
              triggerClassName,
            )}
          >
            <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
              {selectedLabel || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
      </div>
      {!disabled && (
        <PopoverContent align="start" side="bottom" className={cn("p-0 max-h-[60vh] overflow-y-auto overscroll-contain bg-white border border-gray-200", menuClassName)} style={{ width: contentWidth }}>
          <div role="listbox" aria-activedescendant={selectedLabel || undefined}>
            {options.map((opt) => {
              const isSelected = opt === value
              const key = typeof opt === 'object' ? opt.id || opt.name : opt;
              return (
                <button
                  type="button"
                  key={key}
                  className={cn(
                    "w-full flex items-center p-3 hover:bg-gray-50 text-left",
                    isSelected && "bg-blue-50 text-blue-700",
                  )}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                  }}
                >
                  {typeof opt === 'object' ? opt.name : opt}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}


