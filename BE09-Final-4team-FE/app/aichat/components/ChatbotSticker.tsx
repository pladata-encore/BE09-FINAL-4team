"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Type definitions
interface ChatbotStickerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatbotSticker({
  isOpen,
  onToggle,
}: ChatbotStickerProps): JSX.Element {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
          "border-2 border-white/20 backdrop-blur-sm",
          isOpen &&
            "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        )}
        size="icon"
      >
        {/* 로봇 아이콘 */}
        <div className="relative">
          {/* 로봇 머리 */}
          <div className="w-6 h-6 bg-white/90 rounded-md relative">
            {/* 눈 */}
            <div className="absolute top-1 left-1 w-1 h-1 bg-blue-600 rounded-full"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-blue-600 rounded-full"></div>
            {/* 입 */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-blue-600 rounded-full"></div>
          </div>

          {/* 안테나 */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-white/90"></div>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
        </div>
      </Button>

      {/* 툴팁 */}
      {isHovered && (
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          {isOpen ? "챗봇 닫기" : "AI 챗봇 열기"}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
