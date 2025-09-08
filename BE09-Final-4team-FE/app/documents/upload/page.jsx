'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GradientButton } from '@/components/ui/gradient-button';
import { FileText, ArrowLeft, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AttachmentsManager } from '@/components/ui/attachments-manager';
import { useAuth } from '@/hooks/use-auth';
import { communicationApi } from '@/lib/services/communication/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DocumentUploadPage() {
  const router = useRouter();
  const { isAdmin, isLoggedIn } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin) {
      toast.error('관리자만 문서를 업로드할 수 있습니다.');
      router.push('/documents');
      return;
    }
  }, [isLoggedIn, isAdmin, router]);

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error('문서 제목을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      toast.error('문서 설명을 입력해주세요.');
      return;
    }
    if (attachments.length === 0) {
      toast.error('첨부문서를 하나 이상 업로드해주세요.');
      return;
    }

    try {
      setUploading(true);
      
      // attachments에서 fileIds 추출
      const fileIds = attachments.map(att => att.id);
      
      const createData = {
        title: title.trim(),
        description: description.trim(),
        fileIds: fileIds
      };

      await communicationApi.archives.createArchive(createData);
      toast.success('문서가 성공적으로 업로드되었습니다.');
      router.push('/documents');
    } catch (err) {
      console.error('문서 업로드 실패:', err);
      toast.error('문서 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.push('/documents');
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">문서 업로드</h1>
            <p className="text-gray-600">새로운 문서를 업로드하세요</p>
          </div>
        </div>

        {/* 업로드 폼 */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 relative">
          {/* 로딩 오버레이 */}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">문서를 업로드하는 중입니다...</p>
                <p className="text-gray-400 text-sm">잠시만 기다려주세요.</p>
              </div>
            </div>
          )}
          {/* 제목 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              문서 제목
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문서 제목을 입력하세요"
              className="h-12 text-lg"
              disabled={uploading}
            />
          </div>

          {/* 설명 입력 */}
          <div className="mb-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                문서 설명
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="문서에 대한 상세한 설명을 입력하세요"
                className="min-h-32 text-base resize-none"
                disabled={uploading}
              />
            </div>
          </div>

          {/* 첨부파일 관리 */}
          <div className="mb-8">
            <AttachmentsManager
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxFiles={10}
              maxFileSize={50}
            />
          </div>

          {/* 취소/업로드 버튼 */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              취소
            </button>
            <GradientButton
              onClick={handleUpload}
              variant="primary"
              className="px-6 py-3"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  업로드
                </>
              )}
            </GradientButton>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
