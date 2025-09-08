import { useState, useEffect, useCallback } from 'react';
import { organizationApi } from "@/lib/services/organization";
import { OrganizationDto } from "@/lib/services/organization/types";
import { toast } from "sonner";

// Organization 인터페이스 정의
export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  members: any[];
  leader?: any;
  children?: Organization[];
}

export const useOrganizations = (isOpen: boolean) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const convertToOrganization = (org: OrganizationDto): Organization => {
    const converted: Organization = {
      id: org.organizationId.toString(),
      name: org.name,
      parentId: org.parentId?.toString(),
      members: [], // API에서 멤버 정보는 별도로 가져와야 함
      leader: undefined, // API에서 리더 정보는 별도로 가져와야 함
      children: undefined
    };
    
    if (org.children && org.children.length > 0) {
      converted.children = org.children.map(convertToOrganization);
    }
    
    return converted;
  };

  const fetchOrganizations = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      console.log('조직도 데이터 로딩 시작...');
      const orgData: OrganizationDto[] = await organizationApi.getAllOrganizations();
      const convertedOrgs = orgData.map(convertToOrganization);
      setOrganizations(convertedOrgs);
      toast.success('조직도 데이터를 성공적으로 불러왔습니다.');
    } catch (e) {
      console.error('조직도 데이터 로딩 실패:', e);
      setOrganizations([]);
      toast.error('조직도 데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [isOpen]);

  // 모달이 열릴 때만 데이터 로딩
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const saveOrganization = useCallback(async (org: Organization) => {
    try {
      if (org.id && organizations.find(o => o.id === org.id)) {
        // 조직 수정
        const updateData = {
          name: org.name,
          parentId: org.parentId ? parseInt(org.parentId) : undefined
        };
        await organizationApi.updateOrganization(parseInt(org.id), updateData);
        toast.success("조직이 성공적으로 수정되었습니다.");
      } else {
        // 조직 추가
        const createData = {
          name: org.name,
          parentId: org.parentId ? parseInt(org.parentId) : undefined
        };
        await organizationApi.createOrganization(createData);
        toast.success("조직이 성공적으로 추가되었습니다.");
      }
      
      // 저장 후 데이터 새로고침
      await fetchOrganizations();
      
    } catch (error) {
      console.error('조직 저장 실패:', error);
      toast.error("조직 저장에 실패했습니다.");
    }
  }, [fetchOrganizations, organizations]);

  const deleteOrganization = useCallback(async (id: string) => {
    try {
      await organizationApi.deleteOrganization(parseInt(id));
      toast.success("조직이 삭제되었습니다.");
      
      // 삭제 후 데이터 새로고침
      await fetchOrganizations();
      
    } catch (error) {
      console.error('조직 삭제 실패:', error);
      toast.error("조직 삭제에 실패했습니다.");
    }
  }, [fetchOrganizations]);

  return { 
    organizations, 
    isLoading, 
    saveOrganization, 
    deleteOrganization 
  };
};
