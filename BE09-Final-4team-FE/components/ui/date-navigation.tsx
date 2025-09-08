import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { backgrounds, borderRadius, animations } from "@/lib/design-tokens"

interface DateNavigationProps {
  currentPeriod: string
  onPrevious: () => void
  onNext: () => void
  className?: string
}

export function DateNavigation({ 
  currentPeriod, 
  onPrevious, 
  onNext, 
  className 
}: DateNavigationProps) {
  return (
    <div className={cn("flex items-center justify-center gap-6", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        className="w-10 h-10 rounded-full hover:bg-white/80 hover:shadow-md transition-all duration-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <div className={cn(
        "px-6 py-3",
        backgrounds.glass,
        borderRadius.lg,
        "border border-gray-200/50"
      )}>
        <span className="text-lg font-semibold text-gray-800">{currentPeriod}</span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        className="w-10 h-10 rounded-full hover:bg-white/80 hover:shadow-md transition-all duration-200"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  )
} 