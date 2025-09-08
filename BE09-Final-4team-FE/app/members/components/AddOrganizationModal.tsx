"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import modalStyles from "./members-modal.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import LeaderSelectionModal from "./LeaderSelectionModal";
import MemberSelectionModal from "./MemberSelectionModal";

interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  currentMainOrg?: string;
  currentMainOrgName?: string;
  isPrimary?: boolean;
}

interface SelectedMember {
  member: Member;
  assignmentType: "main" | "concurrent";
}

interface SelectedLeader {
  member: Member;
  assignmentType: "main" | "concurrent";
}

interface Organization {
  id: string;
  name: string;
  parentId?: string;
  members: SelectedMember[];
  leader?: Member;
  children?: Organization[];
}

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization | null;
  onSave: (org: Organization) => void;
  onDelete?: (id: string) => void;
  organizations: Organization[];
}

export default function AddOrganizationModal({
  isOpen,
  onClose,
  organization,
  onSave,
  onDelete,
  organizations,
}: AddOrganizationModalProps) {
  const [orgName, setOrgName] = useState("");
  const [parentOrg, setParentOrg] = useState("");
  const [selectedLeader, setSelectedLeader] = useState<SelectedLeader | null>(
    null
  );
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteWarn, setShowDeleteWarn] = useState(false);
  const [deleteWarnMessage, setDeleteWarnMessage] = useState("");

  const [showMainOrgWarning, setShowMainOrgWarning] = useState(false);
  const [mainOrgWarningMembers, setMainOrgWarningMembers] = useState<
    SelectedMember[]
  >([]);

  const flattenOrgs = (
    orgs: Organization[],
    depth = 0
  ): Array<{ id: string; name: string; depth: number }> => {
    const list: Array<{ id: string; name: string; depth: number }> = [];
    orgs.forEach((o) => {
      list.push({ id: o.id, name: o.name, depth });
      if (o.children && o.children.length > 0) {
        list.push(...flattenOrgs(o.children, depth + 1));
      }
    });
    return list;
  };

  const excludedIds = useMemo(() => {
    const set = new Set<string>();
    if (organization) set.add(organization.id);
    return set;
  }, [organization]);

  const parentOptions = useMemo(() => {
    const flat = flattenOrgs(organizations);
    return flat.filter((opt) => !excludedIds.has(opt.id));
  }, [organizations, excludedIds]);

  const memoizedSelectedLeader = useMemo(() => {
    if (organization?.leader?.id) {
      const assignmentType = organization.leader.isPrimary ? "main" : "concurrent";
      
      return { member: organization.leader, assignmentType };
    }
    return null;
  }, [organization?.leader?.id, organization?.leader?.name, organization?.leader?.role, organization?.leader?.email, organization?.leader?.isPrimary]);


  useEffect(() => {
    if (isOpen && !isDirty) {
      if (organization) {
        setOrgName(organization.name);
        setParentOrg(organization.parentId || "");
        setSelectedLeader(memoizedSelectedLeader);
        setSelectedMembers(organization.members || []);
        setIsDirty(false);
      } else {
        setOrgName("");
        setParentOrg("");
        setSelectedLeader(null);
        setSelectedMembers([]);
        setIsDirty(false);
      }
    } else if (!isOpen) {
      setOrgName("");
      setParentOrg("");
      setSelectedLeader(null);
      setSelectedMembers([]);
      setIsDirty(false);
      setShowLeaderModal(false);
      setShowMemberModal(false);
    }
  }, [isOpen, isDirty, organization, memoizedSelectedLeader]);

  const checkMainOrgChanges = (members: SelectedMember[]) => {
    const currentOrgId = organization?.id;
    
    const mainOrgChanges = members.filter((item) => {
      if (item.assignmentType === "main" && item.member.currentMainOrg) {
        return item.member.currentMainOrg !== currentOrgId;
      }
      return false;
    });

    if (mainOrgChanges.length > 0) {
      setMainOrgWarningMembers(mainOrgChanges);
      setShowMainOrgWarning(true);
      return true;
    }
    return false;
  };

  const handleSave = () => {
    if (!orgName.trim()) {
      toast.error("조직 이름을 입력해주세요.");
      return;
    }

    let finalMembers = [...selectedMembers];
    
    if (selectedLeader && selectedLeader.assignmentType === "concurrent") {
      const leaderAlreadyInMembers = finalMembers.some(
        member => member.member.id === selectedLeader.member.id
      );
      
      if (!leaderAlreadyInMembers) {
        finalMembers.push({
          member: selectedLeader.member,
          assignmentType: "concurrent" as const
        });
      } else {
        const memberIndex = finalMembers.findIndex(
          member => member.member.id === selectedLeader.member.id
        );
        if (memberIndex !== -1) {
          finalMembers[memberIndex] = {
            ...finalMembers[memberIndex],
            assignmentType: "concurrent" as const
          };
        }
      }
    }

    if (checkMainOrgChanges(finalMembers)) {
      return;
    }

    const newOrg: Organization = {
      id: organization?.id || Date.now().toString(),
      name: orgName,
      parentId: parentOrg || undefined,
      members: finalMembers,
      leader: selectedLeader?.member || undefined,
    };

    onSave(newOrg);

    resetForm();
    onClose();
  };

  const handleDeleteClick = () => {
    if (!organization) return;
    if (organization.members.length > 0) {
      setDeleteWarnMessage("조직원을 모두 제거해야 삭제할 수 있습니다.");
      setShowDeleteWarn(true);
      return;
    }
    if (organization.children && organization.children.length > 0) {
      setDeleteWarnMessage("하위 조직을 모두 삭제한 후 삭제할 수 있습니다.");
      setShowDeleteWarn(true);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setOrgName("");
    setParentOrg("");
    setSelectedLeader(null);
    setSelectedMembers([]);
    setIsDirty(false);
    setShowCloseConfirm(false);
    setShowDeleteConfirm(false);
    setShowDeleteWarn(false);
    setDeleteWarnMessage("");
    setShowMainOrgWarning(false);
    setMainOrgWarningMembers([]);
  };

  const handleClose = () => {
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const performDelete = () => {
    if (!organization) return;
    toast.success("조직이 성공적으로 삭제되었습니다.");
    setShowDeleteConfirm(false);
    onDelete?.(organization.id);
    resetForm();
    onClose();
  };

  const handleLeaderSelect = (leaders: SelectedLeader[]) => {
    setSelectedLeader(leaders.length > 0 ? leaders[0] : null);
    setShowLeaderModal(false);
  };

  const handleMemberSelect = (members: SelectedMember[]) => {
    setSelectedMembers(members);
    setShowMemberModal(false);
  };

  const removeLeader = () => {
    setSelectedLeader(null);
  };

  const removeMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.filter((item) => item.member.id !== memberId)
    );
  };

  const canDelete =
    organization &&
    organization.members.length === 0 &&
    (!organization.children || organization.children.length === 0);

  const canSave = Boolean(orgName.trim()) && isDirty;

  useEffect(() => {
    const initial = organization
      ? {
          orgName: organization.name,
          parent: organization.parentId || "",
          leaderId: organization.leader?.id || null,
          leaderAssignmentType: (() => {
            if (organization.leader?.id) {
              return organization.leader.isPrimary ? "main" : "concurrent";
            }
            return "main";
          })(),
          memberIds: (organization.members || [])
            .map((m) => m.member.id)
            .join(","),
        }
      : { orgName: "", parent: "", leaderId: null, leaderAssignmentType: "main", memberIds: "" };

    const current = {
      orgName,
      parent: parentOrg,
      leaderId: selectedLeader?.member.id || null,
      leaderAssignmentType: selectedLeader?.assignmentType || "main",
      memberIds: selectedMembers.map((m) => m.member.id).join(","),
    };
    setIsDirty(JSON.stringify(initial) !== JSON.stringify(current));
  }, [organization, orgName, parentOrg, selectedLeader, selectedMembers]);

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      if (isDirty) {
        setShowCloseConfirm(true);
        return;
      }
      resetForm();
      onClose();
      return;
    }
  };

  const requestClose = () => {
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const confirmDiscardAndClose = () => {
    setShowCloseConfirm(false);
    resetForm();
    onClose();
  };

  const confirmMainOrgChange = () => {
    setShowMainOrgWarning(false);
    const newOrg: Organization = {
      id: organization?.id || Date.now().toString(),
      name: orgName,
      parentId: parentOrg || undefined,
      members: selectedMembers,
      leader: selectedLeader?.member || undefined,
    };
    onSave(newOrg);
    resetForm();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          data-hide-default-close
          className={`max-w-2xl max-h-[90vh] overflow-y-auto ${modalStyles.membersModal}`}
        >
          <DialogHeader>
            <div className="relative flex items-center justify-center w-full">
              <button
                type="button"
                className="absolute left-0 p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer"
                onClick={requestClose}
                aria-label="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <DialogTitle className="text-2xl font-bold text-gray-900 text-center transform -translate-x-1">
                {organization ? "조직 수정" : "조직 추가"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">조직 이름</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="조직 이름을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentOrg">상위 조직</Label>
              <Select
                value={parentOrg || "none"}
                onValueChange={(v) => setParentOrg(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상위 조직 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">없음</SelectItem>
                  {parentOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {`${"\u00A0".repeat(opt.depth * 2)}${opt.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>조직장 선택</Label>
              <Button
                variant="outline"
                onClick={() => setShowLeaderModal(true)}
                className="w-full justify-start"
              >
                {selectedLeader
                  ? `${selectedLeader.member.name} ${
                      selectedLeader.member.role
                    } (${
                      selectedLeader.assignmentType === "main" ? "메인" : "겸직"
                    })`
                  : "조직장 선택"}
              </Button>
              {selectedLeader && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className={`cursor-pointer hover:bg-red-100 ${
                      selectedLeader.assignmentType === "main"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                    onClick={removeLeader}
                  >
                    {selectedLeader.member.name}
                    <span className="ml-1 text-xs">
                      (
                      {selectedLeader.assignmentType === "main"
                        ? "메인"
                        : "겸직"}
                      )
                    </span>
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                      aria-label="조직장 제거"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLeader();
                      }}
                    />
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>조직원</Label>
              <Button
                variant="outline"
                onClick={() => setShowMemberModal(true)}
                className="w-full justify-start"
              >
                조직원 추가
              </Button>
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMembers.map((item) => (
                    <Badge
                      key={item.member.id}
                      variant="secondary"
                      className={`cursor-pointer hover:bg-red-100 ${
                        item.assignmentType === "main"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                      onClick={() => removeMember(item.member.id)}
                    >
                      {item.member.name}
                      <span className="ml-1 text-xs">
                        ({item.assignmentType === "main" ? "메인" : "겸직"})
                      </span>
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                        aria-label={`${item.member.name} 제거`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMember(item.member.id);
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <div className="flex gap-2">
                {organization && (
                  <Button variant="destructive" onClick={handleDeleteClick}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                )}
              </div>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
              >
                저장하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMainOrgWarning} onOpenChange={setShowMainOrgWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              메인 조직 변경 경고
            </DialogTitle>
            <DialogDescription>
              다음 구성원의 기존 메인 조직이 겸직으로 변경됩니다:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mb-4">
            {mainOrgWarningMembers.map((item) => (
              <div
                key={item.member.id}
                className="p-2 bg-orange-50 rounded border border-orange-200"
              >
                <div className="font-medium">{item.member.name}</div>
                <div className="text-sm text-orange-600">
                  기존 메인: {item.member.currentMainOrgName}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowMainOrgWarning(false)}
            >
              취소
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={confirmMainOrgChange}
            >
              계속 진행
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              변경 사항이 저장되지 않았습니다
            </DialogTitle>
            <DialogDescription>
              저장하지 않은 변경 사항이 있습니다. 닫으시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCloseConfirm(false)}
            >
              취소
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDiscardAndClose}
            >
              변경사항 저장하지 않고 닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteWarn} onOpenChange={setShowDeleteWarn}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              삭제할 수 없습니다
            </DialogTitle>
            <DialogDescription>{deleteWarnMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setShowDeleteWarn(false)}>
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              조직 삭제
            </DialogTitle>
            <DialogDescription>
              정말로 이 조직을 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={performDelete}>
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LeaderSelectionModal
        isOpen={showLeaderModal}
        onClose={() => setShowLeaderModal(false)}
        onSelect={handleLeaderSelect}
        selectedLeader={memoizedSelectedLeader}
        excludeMemberIds={selectedMembers.map((item) => item.member.id)}
      />

      <MemberSelectionModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onSelect={handleMemberSelect}
        selectedMembers={selectedMembers}
        excludeMemberIds={memoizedSelectedLeader ? [memoizedSelectedLeader.member.id] : []}
      />
    </>
  );
}