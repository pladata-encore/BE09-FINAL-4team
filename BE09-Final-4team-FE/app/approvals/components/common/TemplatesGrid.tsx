"use client"

import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { typography } from "@/lib/design-tokens"
import { TemplateSummaryResponse } from "@/lib/services/approval/types"
import { EyeOff } from "lucide-react"
import { ReactNode } from "react"
import { TemplateIcon } from "./TemplateIcon"

export interface TemplatesGridProps<T extends TemplateSummaryResponse = TemplateSummaryResponse> {
  forms: T[]
  onCardClick?: (form: T) => void
  renderOverlay?: (form: T) => ReactNode
}

export function TemplatesGrid<T extends TemplateSummaryResponse = TemplateSummaryResponse>({
  forms,
  onCardClick,
  renderOverlay,
}: TemplatesGridProps<T>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {forms.map((form) => {
        return (
          <GlassCard
            key={form.id}
            hover={false}
            className="relative p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-200"
            onClick={() => onCardClick?.(form)}
          >
            {renderOverlay ? (
              <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                {renderOverlay(form)}
              </div>
            ) : null}
            <div className="flex items-start gap-4">
              <TemplateIcon
                icon={form.icon}
                color={form.color}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`${typography.h4} text-gray-800 truncate`}>{form.title}</h3>
                  {form.category ? (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-100">
                      {form.category.name}
                    </Badge>
                  ) : null}
                  {form.isHidden ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : null}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{form.description || ''}</p>
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}


