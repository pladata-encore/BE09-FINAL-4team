import React from "react";
import { User, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberProfile } from "./types";

interface BasicInfoBlockProps {
  user: MemberProfile;
  isEditing: boolean;
  formValues: Partial<MemberProfile>;
  onChange: (values: Partial<MemberProfile>) => void;
}

export default function BasicInfoBlock({ user, isEditing, formValues, onChange }: BasicInfoBlockProps) {
  return (
    <div>

      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-300 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-gray-300 block mb-1">이름</span>
              <div className="text-white font-medium">
                {user.name}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-300 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-gray-300 block mb-1">이메일</span>
              <div className="text-white font-medium break-words">
                {user.email}
              </div>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-300 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-gray-300 block mb-1">전화번호</span>
                <div className="text-white font-medium">
                  {user.phone}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300 mb-2 block">
              <User className="w-4 h-4 inline mr-1" />
              이름 *
            </Label>
            <Input
              value={formValues.name ?? user.name ?? ''}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="이름을 입력하세요"
              className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">
              <Mail className="w-4 h-4 inline mr-1" />
              이메일 *
            </Label>
            <Input
              type="email"
              value={formValues.email ?? user.email ?? ''}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="이메일을 입력하세요"
              className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">
              <Phone className="w-4 h-4 inline mr-1" />
              전화번호
            </Label>
            <Input
              value={formValues.phone ?? user.phone ?? ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="전화번호를 입력하세요"
              className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
