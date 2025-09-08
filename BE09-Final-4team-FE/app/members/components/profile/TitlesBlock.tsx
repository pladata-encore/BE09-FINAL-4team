import React from "react";
import { Award, Shield, Briefcase, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberProfile } from "./types";
import SimpleDropdown from "../SimpleDropdown";

interface TitlesBlockProps {
  user: MemberProfile;
  isEditing: boolean;
  formValues: Partial<MemberProfile>;
  onChange: (values: Partial<MemberProfile>) => void;
  ranks: string[];
  positions: string[];
  jobs: string[];
  roles: string[];
  loading: boolean;
}

export default function TitlesBlock({
  user,
  isEditing,
  formValues,
  onChange,
  ranks,
  positions,
  jobs,
  roles,
  loading
}: TitlesBlockProps) {
  const titleItems = [
    { key: 'rank', label: '직급', value: user?.rank || '', icon: Award },
    { key: 'position', label: '직위', value: user?.position || '', icon: Shield },
    { key: 'job', label: '직책', value: user?.job || '', icon: Briefcase },
    { key: 'role', label: '직무', value: user?.role || '', icon: ListChecks },
  ].filter((item) => Boolean(item.value));

  return (
    <div>

      {!isEditing ? (
        <div className="space-y-4">
          {titleItems.length > 0 ? (
            titleItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-gray-300 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-300 block mb-1">{item.label}</span>
                    <div className="text-white font-medium">
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-sm">직급/직위/직책 정보가 없습니다.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 mb-2 block">
              <Award className="w-4 h-4 inline mr-1" />
              직급
            </Label>
            <SimpleDropdown
              options={ranks}
              value={formValues.rank ?? user.rank ?? ''}
              onChange={(value) => onChange({ rank: value })}
              placeholder="직급을 선택하세요"
              loading={loading}
              triggerClassName="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              menuClassName="bg-white border border-gray-200"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block">
              <Shield className="w-4 h-4 inline mr-1" />
              직위
            </Label>
            <SimpleDropdown
              options={positions}
              value={formValues.position ?? user.position ?? ''}
              onChange={(value) => onChange({ position: value })}
              placeholder="직위를 선택하세요"
              loading={loading}
              triggerClassName="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              menuClassName="bg-white border border-gray-200"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block">
              <Briefcase className="w-4 h-4 inline mr-1" />
              직책
            </Label>
            <SimpleDropdown
              options={jobs}
              value={formValues.job ?? user.job ?? ''}
              onChange={(value) => onChange({ job: value })}
              placeholder="직책을 선택하세요"
              loading={loading}
              triggerClassName="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              menuClassName="bg-white border border-gray-200"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2 block">
              <ListChecks className="w-4 h-4 inline mr-1" />
              직무
            </Label>
            <Input
              value={formValues.role ?? user.role ?? ''}
              onChange={(e) => onChange({ role: e.target.value })}
              placeholder="직무를 입력하세요"
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
