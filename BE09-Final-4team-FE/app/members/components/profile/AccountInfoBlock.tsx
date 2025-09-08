import React from "react";
import { Shield, RefreshCw, Copy, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MemberProfile } from "./types";

interface AccountInfoBlockProps {
  user: MemberProfile;
  isEditing: boolean;
  formValues: Partial<MemberProfile>;
  onChange: (values: Partial<MemberProfile>) => void;
  canResetPassword: boolean;
  canDelete: boolean;
  tempPassword: string;
  isGeneratingPassword: boolean;
  onGeneratePassword: () => void;
  onCopyPassword: () => void;
  onDelete: () => void;
}

export default function AccountInfoBlock({
  user,
  isEditing,
  formValues,
  onChange,
  canResetPassword,
  canDelete,
  tempPassword,
  isGeneratingPassword,
  onGeneratePassword,
  onCopyPassword,
  onDelete
}: AccountInfoBlockProps) {
  return (
    <div>

      {!isEditing ? (
        <div className="space-y-4">
          {/* 관리자 권한 표시 제거 */}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 관리자 권한 편집 제거 */}

          {canResetPassword && (
            <div>
              <Label className="text-gray-300 mb-2 block">임시 비밀번호 재설정</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tempPassword}
                  placeholder="임시 비밀번호가 여기에 표시됩니다"
                  readOnly
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={onGeneratePassword}
                  disabled={isGeneratingPassword}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                >
                  {isGeneratingPassword ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={onCopyPassword}
                  disabled={!tempPassword}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-400">
                생성된 임시 비밀번호는 구성원에게 전달해주세요.
              </p>
            </div>
          )}

          {canDelete && (
            <div className="pt-4 border-t border-gray-700/50">
              <Label className="text-gray-300 mb-2 block">위험한 작업</Label>
              <Button 
                variant="destructive" 
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                구성원 삭제
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
