"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { colors, typography } from "@/lib/design-tokens";
import dynamic from "next/dynamic";
import { X, UploadCloud, ArrowLeft } from "lucide-react";
import { AttachmentsManager, Attachment } from "@/components/ui/attachments-manager";
import { communicationApi } from "@/lib/services/communication";
import { attachmentService } from "@/lib/services/attachment/api";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog";

const Editor = dynamic(() => import("./components/Editor"), {
  ssr: false,
  loading: () =>
    <div className="flex items-center justify-center p-8 gap-2">
      <div className="w-5 h-5 border-2 border-gray-100 border-t-blue-500 rounded-full animate-spin"></div>
      <span>에디터 로딩 중...</span>
    </div>
});

export default function NoticeWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  // AttachmentsManager가 이미 실제 업로드를 처리하므로 단순히 상태만 업데이트
  const handleAttachmentsChange = (newAttachments) => {
    setAttachments(newAttachments);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // AttachmentsManager가 이미 실제 fileId를 제공하므로 직접 사용
      const fileIds = attachments.map(attachment => attachment.id);

      const announcementData = {
        title: title.trim(),
        displayAuthor: author.trim(),
        content: content || "", // Lexical JSON 데이터 또는 빈 문자열
        fileIds: fileIds // AttachmentsManager에서 제공한 실제 fileId들
      };

      // API 호출
      const response = await communicationApi.announcements.createAnnouncement(announcementData);
      
      console.log("공지사항 생성 성공:", response);
      router.push("/announcements");
      
    } catch (error) {
      console.error("공지사항 생성 실패:", error);
      setError(error.message || "공지사항 게시에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className={`${typography.h1} text-gray-800`}>공지사항 작성</h1>
            <p className="text-gray-600">새로운 공지사항을 작성하고 게시하세요.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 text-gray-700 font-semibold">제목</label>
              <Input
                placeholder="공지사항 제목을 입력하세요"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-semibold">작성자</label>
              <Input
                placeholder="작성자를 입력하세요"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-gray-700 font-semibold">내용</label>
            <Editor json={null} onChange={setContent} />
          </div>

          {/* 파일 업로드 */}
          <div className="mb-8">
            <label className="block mb-2 text-gray-700 font-semibold">첨부파일</label>
            <AttachmentsManager
              attachments={attachments}
              onAttachmentsChange={handleAttachmentsChange}
              maxFiles={10}
              maxFileSize={50}
            />
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
              취소
            </button>
            <GradientButton 
              type="submit" 
              variant="primary" 
              className="px-6 py-3"
              disabled={isLoading || !title.trim() || !author.trim()}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="text-white mr-2" />
                  게시 중...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  게시하기
                </>
              )}
            </GradientButton>
          </div>
        </form>
      </div>
      
      {/* 파일 업로드 실패 다이얼로그 */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>업로드 실패</AlertDialogTitle>
            <AlertDialogDescription>
              {errorDialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
            확인
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
