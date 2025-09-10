import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Edit3 } from "lucide-react";
import { MemberProfile } from "./types";
import { attachmentApi } from "@/lib/services/attachment/api";

interface HeaderProps {
  user: MemberProfile;
  isEditing: boolean;
  onEditToggle: () => void;
  canEditProfileImage?: boolean;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({ 
  user, 
  isEditing, 
  onEditToggle,
  canEditProfileImage = false,
  onImageChange
}: HeaderProps) {
  const [authenticatedImageUrl, setAuthenticatedImageUrl] = useState<string | null>(null);

  const getAuthenticatedImageUrl = async (fileId: string) => {
    return await attachmentApi.viewFile(fileId)
    return null
  }

  useEffect(() => {
    if (user.profileImage && !user.profileImage.startsWith('http')) {
      getAuthenticatedImageUrl(user.profileImage).then(url => {
        setAuthenticatedImageUrl(url);
      });
    } else {
      setAuthenticatedImageUrl(user.profileImage || user.avatarUrl || null);
    }
  }, [user.profileImage, user.avatarUrl]);
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="rounded-full ring-2 ring-white/30 shadow-xl">
            <Avatar className="w-24 h-24 bg-transparent">
              <AvatarImage 
                src={authenticatedImageUrl || user.avatarUrl}
                alt={user.name} 
                className="bg-transparent" 
              />
              <AvatarFallback className="bg-white/20 text-white text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
          </div>
          {canEditProfileImage && (
            <label className="absolute -bottom-1 -right-1 bg-blue-500/80 backdrop-blur-sm text-white p-2 rounded-full cursor-pointer hover:bg-blue-600/80 transition-all shadow-lg">
              <Edit3 className="w-4 h-4" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={onImageChange} 
                className="hidden" 
              />
            </label>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>

          </div>
          

        </div>
      </div>

              <div className="flex items-center gap-3">
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-all backdrop-blur-sm border border-gray-600/50"
            onClick={onEditToggle}
          >
            {isEditing ? "취소" : "편집"}
          </button>
        </div>
    </div>
  );
}
