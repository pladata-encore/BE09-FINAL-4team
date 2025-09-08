import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { backgrounds, borderRadius, animations } from "@/lib/design-tokens"

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabGroupProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function TabGroup({ tabs, activeTab, onTabChange, className }: TabGroupProps) {
  return (
    <div className={cn(
      "flex gap-2 p-1",
      backgrounds.glass,
      borderRadius.lg,
      "border border-gray-200/50 w-fit",
      className
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-medium",
            animations.transition,
            activeTab === tab.id
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
} 