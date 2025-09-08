'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GradientButton } from '@/components/ui/gradient-button';
import { FileText, ArrowLeft, Save, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AttachmentsManager } from '@/components/ui/attachments-manager';
import { communicationApi } from '@/lib/services/communication/api';
import { attachmentApi } from '@/lib/services/attachment/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DocumentEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 문서 ID가 없으면 목록으로 돌아가기
    if (!documentId) {
      toast.error('문서 ID가 필요합니다.');
      router.push('/documents');
      return;
    }

    // 문서 데이터 로드
    loadDocumentData();
  }, [router, documentId]);

  const loadDocumentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await communicationApi.archives.getArchive(parseInt(documentId));
      const document = response.data;
      
      setTitle(document.title || '');
      setDescription(document.description || '');
      
      // fileIds를 이용해 실제 첨부파일 정보 로드
      if (document.fileIds && document.fileIds.length > 0) {
        try {
          const fileInfos = await Promise.all(
            document.fileIds.map(fileId => attachmentApi.getFileInfo(fileId))
          );
          const attachmentList = fileInfos.map(info => {
            let sizeDisplay = '';
            if (info.fileSize) {
              const bytes = info.fileSize;
              if (bytes >= 1024 * 1024) {
                sizeDisplay = `${(bytes / 1024 / 1024).toFixed(1)} MB`;
              } else if (bytes >= 1024) {
                sizeDisplay = `${(bytes / 1024).toFixed(0)} KB`;
              } else {
                sizeDisplay = `${bytes} bytes`;
              }
            }
            return {
              id: info.fileId,
              name: info.fileName,
              size: sizeDisplay,
              url: attachmentApi.getDownloadUrl(info.fileId)
            };
          });
          setAttachments(attachmentList);
        } catch (fileErr) {
          console.error('첨부파일 정보 로드 실패:', fileErr);
          // 파일 정보를 가져올 수 없는 경우 기본 정보만 표시
          const attachmentList = document.fileIds.map((fileId, index) => ({
            id: fileId,
            name: `첨부파일_${index + 1}`,
            size: 'Unknown',
            url: attachmentApi.getDownloadUrl(fileId)
          }));
          setAttachments(attachmentList);
        }
      }
    } catch (err) {
      console.error('문서 데이터를 불러오는데 실패했습니다:', err);
      setError('문서 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      // attachments에서 fileIds 추출
      const fileIds = attachments.map(att => att.id);
      
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        fileIds: fileIds
      };

      await communicationApi.archives.updateArchive(parseInt(documentId), updateData);
      toast.success('문서가 수정되었습니다.');
      router.push('/documents');
    } catch (err) {
      console.error('문서 수정 중 오류가 발생했습니다:', err);
      toast.error('문서 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/documents');
  };

  if (loading) {
    return (
      <MainLayout requireAuth requireAdmin>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* 스켈레톤 수정 폼 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            {/* 제목 입력 스켈레톤 */}
            <div className="mb-6">
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* 설명 입력 스켈레톤 */}
            <div className="mb-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>

            {/* 첨부파일 스켈레톤 */}
            <div className="mb-8">
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
              </div>
            </div>

            {/* 버튼 스켈레톤 */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-12 w-24" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout requireAuth requireAdmin>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <GradientButton onClick={() => router.push('/documents')}>
              문서 목록으로 돌아가기
            </GradientButton>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requireAuth requireAdmin>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">문서 수정</h1>
            <p className="text-gray-600">문서 정보를 수정하고 저장하세요</p>
          </div>
        </div>

        {/* 수정 폼 */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {/* 제목 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              제목
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문서 제목을 입력하세요"
              className="h-12 text-lg"
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

          {/* 취소/저장 버튼 */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              취소
            </button>
            <GradientButton
              onClick={handleSave}
              variant="primary"
              className="px-6 py-3"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? '저장 중...' : '저장'}
            </GradientButton>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
