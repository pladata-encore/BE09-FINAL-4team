"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building2, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { organizationApi } from "@/lib/services/organization";
import { OrganizationDto } from "@/lib/services/organization/types";

interface Organization {
  id: string;
  name: string;
  parentId?: string;
  children?: Organization[];
}

interface SimpleOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleOrganizationModal({
  isOpen,
  onClose,
}: SimpleOrganizationModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // 데이터 로드
  useEffect(() => {
    if (!isOpen) return;
    
    const loadData = async () => {
      try {
        const data: OrganizationDto[] = await organizationApi.getAllOrganizations();
        const convert = (org: OrganizationDto): Organization => ({
          id: org.organizationId.toString(),
          name: org.name,
          parentId: org.parentId?.toString(),
          children: org.children?.map(convert)
        });
        setOrganizations(data.map(convert));
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        toast.error('데이터를 불러올 수 없습니다.');
      }
    };
    
    loadData();
  }, [isOpen]);

  // 조직 클릭
  const handleOrgClick = (org: Organization) => {
    setEditingOrg(org);
    setShowEditModal(true);
  };

  // 확장/축소
  const toggleExpanded = (orgId: string) => {
    setExpandedOrgs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  };

  // 조직 수정
  const handleUpdate = async (name: string) => {
    if (!editingOrg) return;
    
    try {
      await organizationApi.updateOrganization(parseInt(editingOrg.id), { name });
      toast.success('조직이 수정되었습니다.');
      
      // 데이터 새로고침
      const data: OrganizationDto[] = await organizationApi.getAllOrganizations();
      const convert = (org: OrganizationDto): Organization => ({
        id: org.organizationId.toString(),
        name: org.name,
        parentId: org.parentId?.toString(),
        children: org.children?.map(convert)
      });
      setOrganizations(data.map(convert));
      
      setShowEditModal(false);
      setEditingOrg(null);
    } catch (error) {
      console.error('수정 실패:', error);
      toast.error('수정에 실패했습니다.');
    }
  };

  // 조직 삭제
  const handleDelete = async () => {
    if (!editingOrg) return;
    
    try {
      await organizationApi.deleteOrganization(parseInt(editingOrg.id));
      toast.success('조직이 삭제되었습니다.');
      
      // 데이터 새로고침
      const data: OrganizationDto[] = await organizationApi.getAllOrganizations();
      const convert = (org: OrganizationDto): Organization => ({
        id: org.organizationId.toString(),
        name: org.name,
        parentId: org.parentId?.toString(),
        children: org.children?.map(convert)
      });
      setOrganizations(data.map(convert));
      
      setShowEditModal(false);
      setEditingOrg(null);
    } catch (error) {
      console.error('삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  // 조직 트리 렌더링
  const renderTree = (orgs: Organization[], level = 0) => {
    return orgs.map(org => {
      const isExpanded = expandedOrgs.has(org.id);
      const hasChildren = org.children && org.children.length > 0;
      
      return (
        <div key={org.id}>
          <div
            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b ${
              level > 0 ? "ml-6" : ""
            }`}
            onClick={() => handleOrgClick(org)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(org.id);
                }}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            <Building2 className="w-4 h-4 text-gray-500 mr-2" />
            <span className="font-medium">{org.name}</span>
          </div>
          {hasChildren && isExpanded && (
            <div className="border-l border-gray-200 ml-3">
              {renderTree(org.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // 검색 필터링
  const filteredOrgs = searchTerm
    ? organizations.filter(org => org.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : organizations;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>조직 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="조직 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 조직 트리 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {renderTree(filteredOrgs)}
          </div>

          {/* 추가 버튼 */}
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setEditingOrg(null);
                setShowEditModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              조직 추가
            </Button>
          </div>
        </div>

        {/* 수정 모달 */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">
                {editingOrg ? '조직 수정' : '조직 추가'}
              </h3>
              
              {editingOrg && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">현재 이름: {editingOrg.name}</p>
                  <Input
                    placeholder="새 이름 입력"
                    id="orgName"
                    className="mb-4"
                  />
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                {editingOrg && (
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                  >
                    삭제
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (editingOrg) {
                      const input = document.getElementById('orgName') as HTMLInputElement;
                      if (input?.value) {
                        handleUpdate(input.value);
                      }
                    }
                    setShowEditModal(false);
                    setEditingOrg(null);
                  }}
                >
                  {editingOrg ? '수정' : '추가'}
                </Button>
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingOrg(null);
                  }}
                  variant="outline"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
