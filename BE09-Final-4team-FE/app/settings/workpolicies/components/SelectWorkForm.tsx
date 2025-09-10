"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { AnnualLeaveRequestDto } from "@/lib/services/attendance";

// Type definitions
interface AnnualLeavePolicy {
  id?: string;
  name: string;
  minYears: number;
  maxYears: number;
  leaveDays: number;
  holidayDays: number;
}

interface FormData {
  [key: string]: any;
  annualLeaves?: AnnualLeavePolicy[];
}

interface SelectWorkFormProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

export function SelectWorkForm({
  formData,
  setFormData,
}: SelectWorkFormProps): React.ReactElement {
  const updateFormData = (field: string, value: any): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 기본값 설정
  useEffect(() => {
    if (!formData.coreTimeStart) {
      updateFormData("coreTimeStart", "10:00");
    }
    if (!formData.coreTimeEnd) {
      updateFormData("coreTimeEnd", "16:00");
    }
  }, []);

  // 연차 정책 관리 함수들
  const addAnnualLeave = (): void => {
    const newPolicy: AnnualLeavePolicy = {
      id: Date.now().toString(),
      name: `정책 ${(formData.annualLeaves || []).length + 1}`,
      minYears: 0,
      maxYears: 1,
      leaveDays: 15,
      holidayDays: 0,
    };

    const currentPolicies = formData.annualLeaves || [];
    updateFormData("annualLeaves", [...currentPolicies, newPolicy]);
  };

  const removeAnnualLeave = (index: number): void => {
    const currentPolicies = formData.annualLeaves || [];
    const updatedPolicies = currentPolicies.filter((_, i) => i !== index);
    updateFormData("annualLeaves", updatedPolicies);
  };

  const updateAnnualLeave = (
    index: number,
    field: keyof AnnualLeavePolicy,
    value: string | number
  ): void => {
    const currentPolicies = formData.annualLeaves || [];
    const updatedPolicies = currentPolicies.map((policy, i) =>
      i === index ? { ...policy, [field]: value } : policy
    );
    updateFormData("annualLeaves", updatedPolicies);
  };

  return (
    <div className="space-y-6">
      {/* 근무유형 이름 */}
      <div>
        <p className="text-sm text-gray-500 mb-2">근무 유형 이름</p>
        <Input
          value={formData.workName || ""}
          onChange={(e) => updateFormData("workName", e.target.value)}
          className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
          placeholder="선택 근무"
        />
      </div>

      {/* 선택 근무 설정 */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">선택 근무 설정</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선택 유형
            </label>
            <Select
              value={formData.selectType || "1week"}
              onValueChange={(value) => updateFormData("selectType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">1주</SelectItem>
                <SelectItem value="2weeks">2주</SelectItem>
                <SelectItem value="3weeks">3주</SelectItem>
                <SelectItem value="4weeks">4주</SelectItem>
                <SelectItem value="1month">1개월</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 근무 시간
            </label>
            <Input
              type="number"
              placeholder="8"
              value={formData.minWorkHours || ""}
              onChange={(e) =>
                updateFormData("minWorkHours", parseInt(e.target.value) || 0)
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 코어 타임 설정 */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">코어 타임 설정</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              코어타임 시작
            </label>
            <Select
              value={formData.coreTimeStart || "10:00"}
              onValueChange={(value) => updateFormData("coreTimeStart", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="06:00">06:00</SelectItem>
                <SelectItem value="07:00">07:00</SelectItem>
                <SelectItem value="08:00">08:00</SelectItem>
                <SelectItem value="09:00">09:00</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료 시간
            </label>
            <Select
              value={formData.coreTimeEnd || "16:00"}
              onValueChange={(value) => updateFormData("coreTimeEnd", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14:00">14:00</SelectItem>
                <SelectItem value="15:00">15:00</SelectItem>
                <SelectItem value="16:00">16:00</SelectItem>
                <SelectItem value="17:00">17:00</SelectItem>
                <SelectItem value="18:00">18:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 추가 설정 */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">추가 설정</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사전 신고
            </label>
            <Select
              value={formData.advanceNotice ? "yes" : "no"}
              onValueChange={(value) =>
                updateFormData("advanceNotice", value === "yes")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">필요</SelectItem>
                <SelectItem value="no">불필요</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고 기간
            </label>
            <Select
              value={formData.noticePeriod || "1day"}
              onValueChange={(value) => updateFormData("noticePeriod", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">1일 전</SelectItem>
                <SelectItem value="3days">3일 전</SelectItem>
                <SelectItem value="1week">1주 전</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 연차 정책 설정 */}
      <div className="space-y-4 bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연차 설정
          </label>
          {(formData.annualLeaves || []).map((policy, index) => (
            <div
              key={policy.id || index}
              className="grid grid-cols-10 gap-2 mb-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* 최소 근무년수 */}
              <div className="col-span-3">
                <label className="block text-xs text-gray-600 mb-1">
                  최소 년수
                </label>
                <Input
                  type="number"
                  value={policy.minYears}
                  onChange={(e) =>
                    updateAnnualLeave(
                      index,
                      "minYears",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="text-sm"
                />
              </div>

              {/* 최대 근무년수 */}
              <div className="col-span-3">
                <label className="block text-xs text-gray-600 mb-1">
                  최대 년수
                </label>
                <Input
                  type="number"
                  value={policy.maxYears}
                  onChange={(e) =>
                    updateAnnualLeave(
                      index,
                      "maxYears",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="text-sm"
                />
              </div>

              {/* 연차 일수 */}
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">
                  연차 일수
                </label>
                <Input
                  type="number"
                  value={policy.leaveDays}
                  onChange={(e) =>
                    updateAnnualLeave(
                      index,
                      "leaveDays",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  max="365"
                  className="text-sm"
                />
              </div>

              {/* 휴일 일수 */}
              <div className="col-span-1">
                <label className="block text-xs text-gray-600 mb-1">휴일</label>
                <Input
                  type="number"
                  value={policy.holidayDays}
                  onChange={(e) =>
                    updateAnnualLeave(
                      index,
                      "holidayDays",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="text-sm"
                />
              </div>

              {/* 삭제 버튼 */}
              <div className="col-span-1 flex items-end">
                {(formData.annualLeaves || []).length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAnnualLeave(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ×
                  </Button>
                )}
              </div>

              {/* 표시 텍스트 */}
              <div className="col-span-10 mt-2">
                <p className="text-xs text-gray-600">
                  근무 {policy.minYears}년 ~ {policy.maxYears}년: 연차{" "}
                  {policy.leaveDays}일
                  {policy.holidayDays > 0 && `, 휴일 ${policy.holidayDays}일`}
                </p>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addAnnualLeave}
            className="flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            연차 정책 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
