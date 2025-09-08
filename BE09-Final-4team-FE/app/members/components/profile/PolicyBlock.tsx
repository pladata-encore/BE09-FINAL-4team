import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { WorkPolicy } from "./types";
import { WorkPolicyResponseDto } from "@/lib/services/attendance/types";

interface PolicyBlockProps {
  workPolicies?: string[];
  availablePolicies?: WorkPolicyResponseDto[];
  workPolicy?: WorkPolicyResponseDto;
}

export default function PolicyBlock({ 
  workPolicies = [], 
  availablePolicies = [],
  workPolicy
}: PolicyBlockProps) {

  // 단일 근무정책 객체가 있고 유효한 경우 우선 표시
  if (workPolicy && workPolicy.id && workPolicy.name) {
    return (
      <div className="flex flex-wrap gap-2">
        <Badge 
          className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all px-3 py-1"
        >
          {workPolicy.name}
        </Badge>
      </div>
    );
  }

  // workPolicy 객체가 존재하지만 필드가 null인 경우, availablePolicies에서 찾기
  if (workPolicy && workPolicies.length > 0) {
    const firstPolicyId = workPolicies[0];
    const policy = availablePolicies.find(p => p.id.toString() === firstPolicyId);
    if (policy) {
      return (
        <div className="flex flex-wrap gap-2">
          <Badge 
            className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all px-3 py-1"
          >
            {policy.name}
          </Badge>
        </div>
      );
    }
  }

  // 기존 배열 방식 지원 (하위 호환성)
  return (
    <div className="flex flex-wrap gap-2">
      {workPolicies.length > 0 ? (
        (() => {
          const firstPolicyId = workPolicies[0];
          const policy = availablePolicies.find(p => p.id.toString() === firstPolicyId);
          return policy ? (
            <Badge 
              className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all px-3 py-1"
            >
              {policy.name}
            </Badge>
          ) : null;
        })()
      ) : (
        <p className="text-gray-500 text-sm">설정된 근무 정책이 없습니다.</p>
      )}
    </div>
  );
}
