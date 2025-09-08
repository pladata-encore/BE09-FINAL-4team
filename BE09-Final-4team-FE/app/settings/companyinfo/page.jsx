"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colors, typography } from "@/lib/design-tokens";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  Save,
  Edit,
  X,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";

export default function CompanyInfoPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: "테크컴퍼니 주식회사",
    registrationNumber: "123-45-67890",
    address: "서울특별시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    email: "contact@techcompany.com",
    website: "https://www.techcompany.com",
    industry: "IT/소프트웨어",
    foundedYear: "2020",
    employeeCount: "50-100",
    description: "혁신적인 기술 솔루션을 제공하는 IT 기업입니다.",
  });

  const [originalInfo, setOriginalInfo] = useState({ ...companyInfo });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("/logo.png");

  const handleInputChange = (field, value) => {
    setCompanyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setOriginalInfo({ ...companyInfo });
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setCompanyInfo({ ...originalInfo });
    setLogoFile(null);
    setLogoPreview("/logo.png");
    setIsEditMode(false);
  };

  const handleSave = () => {
    // 여기에 저장 로직 추가
    console.log("회사 정보 저장:", companyInfo);
    console.log("로고 파일:", logoFile);
    setIsEditMode(false);
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = () => {
    setLogoFile(null);
    setLogoPreview("/logo.png");
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${typography.h1} text-gray-800 mb-2`}>
              회사 정보 설정
            </h1>
          </div>
          {!isEditMode ? (
            <GradientButton
              variant="primary"
              className="px-6"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              수정
            </GradientButton>
          ) : (
            <div className="flex gap-2">
              <GradientButton
                variant="secondary"
                className="px-6"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-2" />
                취소
              </GradientButton>
              <GradientButton
                variant="primary"
                className="px-6"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                저장
              </GradientButton>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Company Information */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${colors.primary.blue} rounded-lg flex items-center justify-center`}
            >
              <Building className="w-5 h-5 text-white" />
            </div>
            <h3 className={`${typography.h3} text-gray-800`}>기본 정보</h3>
          </div>
          {!isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록번호
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.registrationNumber}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.address}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명
                </label>
                <Input
                  value={companyInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록번호
                </label>
                <Input
                  value={companyInfo.registrationNumber}
                  onChange={(e) =>
                    handleInputChange("registrationNumber", e.target.value)
                  }
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주소
                </label>
                <Input
                  value={companyInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                />
              </div>
            </div>
          )}
        </GlassCard>

        {/* Contact Information */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${colors.status.info.gradient} rounded-lg flex items-center justify-center`}
            >
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h3 className={`${typography.h3} text-gray-800`}>연락처 정보</h3>
          </div>
          {!isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.phone}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.email}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.website}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <Input
                  value={companyInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <Input
                  value={companyInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트
                </label>
                <Input
                  value={companyInfo.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                />
              </div>
            </div>
          )}
        </GlassCard>

        {/* Company Details */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${colors.status.warning.gradient} rounded-lg flex items-center justify-center`}
            >
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className={`${typography.h3} text-gray-800`}>회사 상세 정보</h3>
          </div>
          {!isEditMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업종
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.industry}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설립년도
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.foundedYear}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직원 수
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                  {companyInfo.employeeCount}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사 소개
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 min-h-[100px]">
                  {companyInfo.description}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업종
                </label>
                <Select
                  value={companyInfo.industry}
                  onValueChange={(value) =>
                    handleInputChange("industry", value)
                  }
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT/소프트웨어">IT/소프트웨어</SelectItem>
                    <SelectItem value="제조업">제조업</SelectItem>
                    <SelectItem value="서비스업">서비스업</SelectItem>
                    <SelectItem value="금융업">금융업</SelectItem>
                    <SelectItem value="의료/제약">의료/제약</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설립년도
                </label>
                <Input
                  value={companyInfo.foundedYear}
                  onChange={(e) =>
                    handleInputChange("foundedYear", e.target.value)
                  }
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직원 수
                </label>
                <Select
                  value={companyInfo.employeeCount}
                  onValueChange={(value) =>
                    handleInputChange("employeeCount", value)
                  }
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10명</SelectItem>
                    <SelectItem value="11-50">11-50명</SelectItem>
                    <SelectItem value="50-100">50-100명</SelectItem>
                    <SelectItem value="100-500">100-500명</SelectItem>
                    <SelectItem value="500+">500명 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사 소개
                </label>
                <Textarea
                  value={companyInfo.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl min-h-[100px]"
                  placeholder="회사에 대한 간단한 소개를 입력하세요"
                />
              </div>
            </div>
          )}
        </GlassCard>

        {/* Company Logo */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${colors.status.info.gradient} rounded-lg flex items-center justify-center`}
            >
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className={`${typography.h3} text-gray-800`}>회사 로고</h3>
          </div>
          {!isEditMode ? (
            <div className="flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src={logoPreview}
                  alt="회사 로고"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  <Image
                    src={logoPreview}
                    alt="회사 로고"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    로고 변경
                  </div>
                </label>
                <button
                  onClick={handleLogoDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  로고 삭제
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </MainLayout>
  );
}
