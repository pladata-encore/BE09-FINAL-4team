"use client";

import { colors } from "@/lib/design-tokens";
import { Clock, RotateCcw, Calendar, Target } from "lucide-react";

// Type definitions
interface WorkType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface WorkTypeSelectorProps {
  selectedType: string;
  onTypeChange: (typeId: string) => void;
}

export function WorkTypeSelector({
  selectedType,
  onTypeChange,
}: WorkTypeSelectorProps): JSX.Element {
  const workTypes: WorkType[] = [
    { id: "fixed", name: "고정", icon: Clock, color: colors.primary.blue },
    {
      id: "shift",
      name: "교대",
      icon: RotateCcw,
      color: colors.status.info.gradient,
    },
    {
      id: "time",
      name: "시차",
      icon: Calendar,
      color: colors.status.warning.gradient,
    },
    {
      id: "select",
      name: "선택",
      icon: Target,
      color: colors.status.success.gradient,
    },
  ];

  return (
    <div className="space-y-3">
      {workTypes.map((type) => {
        const IconComponent = type.icon;
        const isSelected = selectedType === type.id;
        return (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 group ${
              isSelected
                ? `border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 shadow-lg shadow-blue-500/20`
                : `border-gray-200 bg-white/80 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow-md`
            }`}
          >
            <div
              className={`p-2 rounded-lg transition-all duration-300 ${
                isSelected
                  ? `bg-blue-500 text-white`
                  : `bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600`
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-sm font-semibold block">{type.name}</span>
              <span className="text-xs text-gray-500 group-hover:text-blue-500">
                {type.id === "fixed" && "정해진 시간에 고정 근무"}
                {type.id === "shift" && "교대 근무 시간대 설정"}
                {type.id === "time" && "시차 근무 및 통신 설정"}
                {type.id === "select" && "유연한 근무 시간 선택"}
              </span>
            </div>
            {isSelected && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
