'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { User, Calendar, Eye, Edit, Trash2, MessageSquare, Send, MoreHorizontal } from "lucide-react";
import { AttachmentsSection } from "@/components/ui/attachments-section";
import { UserAvatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { communicationApi } from "@/lib/services/communication";
import { formatDateTime } from "@/lib/utils/date-format";
import { useAuth } from "@/contexts/auth-context";
import { attachmentService } from "@/lib/services/attachment/api";
import { toast } from "sonner";

// Lexical Editor Viewer (읽기 전용)
const Editor = dynamic(() => import("../write/components/Editor"), { ssr: false });

export default function AnnouncementsDetailModal({
  isOpen,
  announcement,
  onClose,
  onEdit,
  onDelete
}) {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const loadAnnouncementData = async () => {
      if (!announcement) return;

      setLoading(true);
      setError("");

      try {
        // 공지사항 상세 정보 조회
        const detailResponse = await communicationApi.announcements.getAnnouncement(announcement.id);
        setData(detailResponse.data);

        // 첨부파일 정보 조회
        if (detailResponse.data.fileIds && detailResponse.data.fileIds.length > 0) {
          const attachmentPromises = detailResponse.data.fileIds.map(async (fileId) => {
            try {
              const fileInfo = await attachmentService.getFileInfo(fileId);
              return {
                id: fileId,
                name: fileInfo.fileName,
                size: `${(fileInfo.fileSize / 1024 / 1024).toFixed(2)} MB`,
                // URL은 제거하고 다운로드 시에만 처리
              };
            } catch (error) {
              console.error(`파일 정보 조회 실패: ${fileId}`, error);
              return null;
            }
          });
          
          const attachmentResults = await Promise.all(attachmentPromises);
          setAttachments(attachmentResults.filter(att => att !== null));
        }

        // 댓글 목록 조회
        const commentsResponse = await communicationApi.comments.getCommentsByAnnouncementId(announcement.id);
        setComments(commentsResponse);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        setError(error.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncementData();
  }, [announcement]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // API를 통해 댓글 생성
      const createdComment = await communicationApi.comments.createComment(announcement.id, {
        content: newComment
      });
      
      // 댓글 목록에 추가
      setComments(prev => [createdComment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      toast.error('댓글 작성에 실패했습니다.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await communicationApi.comments.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setOpenDropdownId(null);
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      toast.error('댓글 삭제에 실패했습니다.');
    }
  };

  const toggleDropdown = (commentId) => {
    setOpenDropdownId(openDropdownId === commentId ? null : commentId);
  };

  // 첨부파일 다운로드 핸들러
  const handleDownloadAttachment = async (attachment) => {
    try {
      await attachmentService.downloadFile(attachment.id, attachment.name);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      toast.error('파일 다운로드에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>공지사항 불러오는 중</DialogTitle>
          </DialogHeader>
          <div className="text-center text-gray-500 text-lg py-8">불러오는 중...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !data) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>오류 발생</DialogTitle>
          </DialogHeader>
          <div className="text-center text-red-500 text-lg py-8">{error || "데이터가 없습니다."}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left text-2xl font-bold text-gray-800 mb-3">
            {data.title}
          </DialogTitle>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {data.displayAuthor}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDateTime(data.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {data.views}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {comments.length}
            </span>
          </div>
        </DialogHeader>

        {/* 본문 내용 */}
        <div className="mb-6">
          <Editor
            jsonData={typeof data.content === 'object' ? JSON.stringify(data.content) : data.content}
            onChange={() => { }}
            readOnly={true}
            showToolbar={false}
          />
        </div>

        {/* 첨부파일 */}
        {attachments.length > 0 && (
          <div className="pt-4 border-t border-gray-200 mb-6">
            <h3 className="font-semibold mb-3 text-gray-700">첨부파일</h3>
            <AttachmentsSection
              attachments={attachments}
              onDownload={handleDownloadAttachment}
            />
          </div>
        )}

        {/* 댓글 섹션 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            댓글 ({comments.length})
          </h3>

          {/* 댓글 작성 */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <Input
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="mb-2"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    댓글 작성
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 relative">
                <UserAvatar 
                  src={comment.userInfo?.profileImageUrl}
                  alt={comment.userInfo?.name || '사용자'}
                  fallback={comment.userInfo?.name?.charAt(0)}
                  size="md"
                  className="flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{comment.userInfo?.name || '사용자'}</span>
                      <span className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {comment.canDelete && (
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(comment.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                        {openDropdownId === comment.id && (
                          <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <DialogFooter className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-semibold shadow cursor-pointer"
          >
            닫기
          </button>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="px-6 py-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition font-semibold shadow cursor-pointer flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                수정
              </button>
              <button
                onClick={onDelete}
                className="px-6 py-2 rounded bg-red-100 text-red-600 hover:bg-red-200 transition font-semibold shadow cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}