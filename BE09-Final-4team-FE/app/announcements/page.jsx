"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { colors, typography } from "@/lib/design-tokens"
import { Search, Plus, Megaphone, Calendar, User, Eye, MessageSquare } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import StyledPaging from "@/components/paging/styled-paging"
import AnnouncementsDetailModal from "./components/AnnouncementsDetailModal"
import { communicationApi } from "@/lib/services/communication"
import { useAuth } from "@/hooks/use-auth"
import { formatDateTime } from "@/lib/utils/date-format"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// 공지사항 목록 조회 함수
async function fetchAnnouncements({ page, search }) {
  try {
    // 실제 API 호출
    const announcements = await communicationApi.announcements.getAllAnnouncements()
    
    // 검색 필터링 (프론트엔드에서 처리)
    let filtered = announcements
    if (search) {
      const s = search.toLowerCase()
      filtered = announcements.filter(
        (item) => item.title.toLowerCase().includes(s) || (item.displayAuthor && item.displayAuthor.toLowerCase().includes(s))
      )
    }
    
    // 페이지네이션 처리 (프론트엔드에서 처리)
    const totalLength = filtered.length
    const itemsPerPage = 10
    const start = (page - 1) * itemsPerPage
    const data = filtered.slice(start, start + itemsPerPage)
    
    return { data, totalLength }
  } catch (error) {
    console.error('공지사항 조회 실패:', error)
    throw new Error(error.message || '공지사항을 불러오는데 실패했습니다.')
  }
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 10;
  const [page, setPage] = useState(1);
  const [announcements, setAnnouncements] = useState([])
  const [total, setTotal] = useState(0)
  const totalPages = Math.ceil(total / itemsPerPage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 모달 상태 추가
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 삭제 확인 다이얼로그 상태
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // URL fragment 로딩 상태
  const [fragmentLoading, setFragmentLoading] = useState(false);

  // 데이터 요청 함수
  const loadData = async (page, search) => {
    setLoading(true)
    setError("")
    try {
      const result = await fetchAnnouncements({ page, search })
      setAnnouncements(result.data)
      setTotal(result.totalLength)
    } catch (e) {
      console.error(e);
      setError("공지사항을 불러오는 데에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 데이터 로드
  useEffect(() => {
    loadData(page, searchTerm)
  }, [page, searchTerm])
  
  // URL fragment에서 id를 감지하여 모달 자동 열기
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash.slice(1); // # 제거
      
      if (hash && !isNaN(hash)) {
        const announcementId = parseInt(hash);
        console.log('URL fragment 감지:', hash, '-> ID:', announcementId);
        
        // 현재 로드된 공지사항 목록에서 먼저 찾기
        let targetAnnouncement = announcements.find(
          announcement => announcement.id === announcementId
        );
        
        // 목록에서 찾지 못했으면 API에서 직접 가져오기
        if (!targetAnnouncement) {
          setFragmentLoading(true); // 로딩 시작
          console.log('🔄 API에서 직접 조회 시작:', announcementId);
          
          try {
            const response = await communicationApi.announcements.getAnnouncement(announcementId);
            targetAnnouncement = response.data; // ApiResult에서 data 추출
            console.log('✅ API에서 가져온 공지사항:', targetAnnouncement);
          } catch (error) {
            console.error('❌ 공지사항 조회 실패:', error);
            toast.error('존재하지 않는 공지사항입니다.');
            setFragmentLoading(false);
            // 존재하지 않는 공지사항인 경우 hash 제거
            window.history.replaceState(null, null, '/announcements');
            return;
          } finally {
            setFragmentLoading(false); // 로딩 종료
          }
        }
        
        if (targetAnnouncement) {
          console.log('🎯 공지사항 모달 열기 시도:', targetAnnouncement);
          
          // 강제로 이전 모달 상태 초기화
          setSelectedAnnouncement(null);
          setIsModalOpen(false);
          
          // 짧은 딜레이 후 새 모달 열기 (React 상태 업데이트 보장)
          setTimeout(() => {
            setSelectedAnnouncement(targetAnnouncement);
            setIsModalOpen(true);
            console.log('✅ 모달 열림 완료');
          }, 100); // 딜레이를 좀 더 길게 설정
        } else {
          console.log('❌ 해당 ID의 공지사항을 찾을 수 없음:', announcementId);
        }
      }
    };
    
    // 페이지가 로딩 중이 아닐 때만 해시 체크
    if (!loading && !authLoading) {
      handleHashChange();
    }
    
    // hashchange 이벤트 리스너 추가
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [announcements, loading, authLoading]); // loading, authLoading 의존성 추가

  // 검색 아이콘 클릭 핸들러
  const handleSearchClick = () => {
    if (inputText == null || inputText.trim() === "") {
      console.log(inputText + " 빈검색");
      setSearchTerm(inputText);
      setPage(1);
    } else {
      console.log(inputText + " 검색");
      setSearchTerm(inputText);
      setPage(1);
    }
  }

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  // 공지사항 클릭 핸들러 - 직접 모달 열기 및 URL 업데이트
  const handleGlassCardClick = (announcement) => {
    console.log('공지사항 클릭됨:', announcement);
    // 모달 직접 열기
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
    // URL fragment도 업데이트 (브라우저 히스토리에 추가하지 않음)
    window.history.replaceState(null, null, `#${announcement.id}`);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    console.log('모달 닫기');
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
    
    // URL에서 fragment 제거 (브라우저 히스토리에 추가하지 않음)
    if (window.location.hash) {
      window.history.replaceState(null, null, '/announcements');
    }
  };

  // 수정 핸들러 - 공지사항 ID를 URL 파라미터로 전달
  const handleEdit = () => {
    if (selectedAnnouncement) {
      handleCloseModal(); // 모달 닫기
      router.push(`/announcements/edit?id=${selectedAnnouncement.id}`);
    }
  };

  // 삭제 핸들러
  const handleDelete = () => {
    if (!selectedAnnouncement) return;
    setDeleteDialogOpen(true);
  };

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      // 삭제 API 호출
      await communicationApi.announcements.deleteAnnouncement(selectedAnnouncement.id);
      
      toast.success('삭제가 완료되었습니다.');
      setDeleteDialogOpen(false);
      handleCloseModal();
      
      // 목록 새로고침
      loadData(page, searchTerm);
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  // 글쓰기 클릭 핸들러
  const handleWriteAnnouncement = () => {
    router.push("/announcements/write")
  }


  return (
    <MainLayout requireAuth={true}>
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <h1 className={`${typography.h1} text-gray-800`}>공지사항</h1>
        </div>
        <p className="text-gray-600">회사의 중요한 소식을 확인하세요</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 h-10">
          <Input
            placeholder="제목으로 검색"
            value={inputText}
            className="pr-10 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl h-10"
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchClick();
              }
            }}
          />
          {/* 검색버튼 */}
          <button
            type="button"
            className="
            absolute right-3 top-1/2 transform -translate-y-1/2
            h-10 w-10 flex items-center justify-center
            text-gray-400 hover:text-gray-600
            bg-transparent rounded-full
            active:bg-gray-100 active:ring-2 
            transition cursor-pointer
          "
            onClick={handleSearchClick}
            tabIndex={0}
            aria-label="검색"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
        <GradientButton
          variant="primary"
          onClick={handleWriteAnnouncement}
        >
          <Plus className="w-4 h-4 mr-2" />
          공지 작성
        </GradientButton>
      </div>

      {/* Announcements List */}
      <div className="space-y-4 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3">
              <Spinner size="lg" />
              <span className="text-gray-500">공지사항을 불러오는 중...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-gray-400 py-12">공지사항이 없습니다.</div>
        ) : (
          announcements.map((announcement) => (
            <GlassCard
              key={announcement.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
              onClick={() => handleGlassCardClick(announcement)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${colors.primary.blue} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`${typography.h4} text-gray-800`}>{announcement.title}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {announcement.displayAuthor}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(announcement.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {announcement.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {announcement.commentCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8">
          <StyledPaging
            currentPage={page}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* 공지사항 상세보기 모달 */}
      <AnnouncementsDetailModal
        isOpen={isModalOpen}
        announcement={selectedAnnouncement}
        onClose={handleCloseModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Fragment 로딩 오버레이 */}
      {fragmentLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Spinner size="lg" />
            <span className="text-gray-700">공지사항을 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-red-600" />
              공지사항 삭제
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-gray-900">"{selectedAnnouncement?.title}"</span> 공지사항을 삭제하시겠습니까?
              <br />
              <span className="text-red-600 font-medium">삭제된 공지사항은 복구할 수 없습니다.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
} 