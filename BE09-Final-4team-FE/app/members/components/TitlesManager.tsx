"use client";

import { useMemo, useState, useEffect } from "react";
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
import { X, Plus, ArrowLeft } from "lucide-react";
import { titleApi, TitleDto } from "@/lib/services/title/api";
import { toast } from "sonner";

type TitleKind = "rank" | "position" | "duty" | "job";

interface TitlesState {
  rank: TitleDto[];
  position: TitleDto[];
  duty: TitleDto[];
  job: TitleDto[];
}

function useTitlesFromAPI(type: TitleKind) {
  const [state, setState] = useState<TitlesState>({
    rank: [],
    position: [],
    duty: [],
    job: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [ranks, positions, jobs] = await Promise.all([
          titleApi.getRanks(),
          titleApi.getPositions(),
          titleApi.getJobs(),
        ]);
        
        setState({
          rank: ranks,
          position: positions,
          duty: [], // duty는 현재 사용자 데이터에 없으므로 빈 배열
          job: jobs,
        });
      } catch (error) {
        console.error('Error loading titles:', error);
        toast.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const add = async (kind: TitleKind, name: string) => {
    try {
      let newTitle: TitleDto;
      
      if (kind === 'rank') {
        newTitle = await titleApi.createRank({ name });
      } else if (kind === 'position') {
        newTitle = await titleApi.createPosition({ name });
      } else if (kind === 'job') {
        newTitle = await titleApi.createJob({ name });
      } else {
        throw new Error('Invalid title kind');
      }
      
      setState((prev) => ({
        ...prev,
        [kind]: [...(prev[kind as keyof TitlesState] as TitleDto[]), newTitle],
      }));
      toast.success('추가되었습니다.');
    } catch (error) {
      console.error('Error adding title:', error);
      toast.error('추가에 실패했습니다.');
    }
  };

  const update = async (kind: TitleKind, index: number, name: string) => {
    try {
      const currentList = state[kind as keyof TitlesState] as TitleDto[];
      const titleToUpdate = currentList[index];
      
      if (!titleToUpdate) return;
      
      let updatedTitle: TitleDto;
      
      if (kind === 'rank') {
        updatedTitle = await titleApi.updateRank(titleToUpdate.id, { name });
      } else if (kind === 'position') {
        updatedTitle = await titleApi.updatePosition(titleToUpdate.id, { name });
      } else if (kind === 'job') {
        updatedTitle = await titleApi.updateJob(titleToUpdate.id, { name });
      } else {
        throw new Error('Invalid title kind');
      }
      
      setState((prev) => {
        const next = [...(prev[kind as keyof TitlesState] as TitleDto[])];
        next[index] = updatedTitle;
        return { ...prev, [kind]: next };
      });
      toast.success('수정되었습니다.');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('수정에 실패했습니다.');
    }
  };

  const remove = async (kind: TitleKind, index: number) => {
    try {
      const currentList = state[kind as keyof TitlesState] as TitleDto[];
      const titleToDelete = currentList[index];
      
      if (!titleToDelete) return;
      
      if (kind === 'rank') {
        await titleApi.deleteRank(titleToDelete.id);
      } else if (kind === 'position') {
        await titleApi.deletePosition(titleToDelete.id);
      } else if (kind === 'job') {
        await titleApi.deleteJob(titleToDelete.id);
      }
      
      setState((prev) => {
        const next = (prev[kind as keyof TitlesState] as TitleDto[]).filter(
          (_, i) => i !== index
        );
        return { ...prev, [kind]: next };
      });
      toast.success('삭제되었습니다.');
    } catch (error) {
      console.error('Error removing title:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  return { state, add, update, remove, loading };
}

interface TitlesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  type: TitleKind;
}

export default function TitlesManager({
  isOpen,
  onClose,
  type,
}: TitlesManagerProps) {
  const { state, add, update, remove, loading } = useTitlesFromAPI(type);
  const { rank, position, duty, job } = state;
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingText, setAddingText] = useState("");
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

  const titleMap: Record<TitleKind, { title: string; list: TitleDto[] }> =
    useMemo(
      () => ({
        rank: { title: "직급 설정", list: rank },
        position: { title: "직위 설정", list: position },
        duty: { title: "직무 설정", list: duty },
        job: { title: "직책 설정", list: job },
      }),
      [rank, position, duty, job]
    );

  const current = titleMap[type];

  const handleAdd = () => {
    const name = addingText.trim();
    if (!name) return;
    add(type, name);
    setAddingText("");
    setShowAddModal(false);
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          data-hide-default-close
          className={`max-w-md max-h-[80vh] overflow-y-auto ${modalStyles.membersModal}`}
        >
          <DialogHeader>
            <div className="relative flex items-center justify-center w-full">
              <button
                type="button"
                className="absolute left-0 p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer"
                onClick={onClose}
                aria-label="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <DialogTitle className="text-2xl font-bold text-gray-900 text-center transform -translate-x-1">
                {current.title}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
              </div>
            ) : (
              <div className="space-y-2">
                {current.list.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    등록된 {current.title.replace('설정', '')}이 없습니다.
                  </div>
                ) : (
                  current.list.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => update(type, idx, e.target.value)}
                        className="border-blue-300 focus-visible:ring-blue-400"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => setConfirmIndex(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full justify-center text-blue-600 border-blue-300 hover:bg-blue-50"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> 새 항목 추가
            </Button>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                저장하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent
          data-hide-default-close
          className={`max-w-sm ${modalStyles.membersModal}`}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {current.title.replace("설정", "추가")}
            </DialogTitle>
            <DialogDescription>새 항목을 입력하세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">이름</label>
              <Input
                value={addingText}
                onChange={(e) => setAddingText(e.target.value)}
                placeholder="항목을 입력하세요"
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                뒤로가기
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700"
              >
                저장하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmIndex !== null}
        onOpenChange={() => setConfirmIndex(null)}
      >
        <DialogContent
          data-hide-default-close
          className={`max-w-sm ${modalStyles.membersModal}`}
        >
          <DialogHeader>
            <DialogTitle>삭제하시겠습니까?</DialogTitle>
            <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmIndex(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmIndex !== null) remove(type, confirmIndex);
                setConfirmIndex(null);
              }}
            >
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
