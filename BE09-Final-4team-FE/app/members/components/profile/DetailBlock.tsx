import React from "react";
import { Calendar, MapPin } from "lucide-react";

interface DetailBlockProps {
  joinDate?: string;
  address?: string;
}

export default function DetailBlock({ 
  joinDate, 
  address
}: DetailBlockProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
        <div className="flex-1">
          <span className="text-sm text-gray-500 block mb-1">입사일</span>
          <div className="text-gray-900 font-medium">
            {joinDate || "입사일 정보가 없습니다."}
          </div>
        </div>
      </div>
      
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
        <div className="flex-1">
          <span className="text-sm text-gray-500 block mb-1">주소</span>
          <div className="text-gray-900 font-medium break-words">
            {address || "주소 정보가 없습니다."}
          </div>
        </div>
      </div>
    </div>
  );
}
