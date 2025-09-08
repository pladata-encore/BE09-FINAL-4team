import { apiClient } from '../common/api-client'
import { ApiResult } from '../common/types'
import {
  AttachmentInfoResponse,
  AttachmentInfoListResponse,
  FileUploadRequest
} from './types'

// 파일 첨부 API
export const attachmentApi = {
  // 파일 업로드 (multiple files)
  uploadFiles: async (files: File[]): Promise<AttachmentInfoListResponse> => {
    const formData = new FormData()
    
    // 각 파일을 FormData에 추가
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await apiClient.post<AttachmentInfoListResponse>(
      '/api/attachments/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  // 파일 정보 조회
  getFileInfo: async (fileId: string): Promise<AttachmentInfoResponse> => {
    const response = await apiClient.get<AttachmentInfoResponse>(
      `/api/attachments/${fileId}/info`
    )
    return response.data
  },

  // 파일 다운로드 (브라우저에서 다운로드 실행)
  downloadFile: async (fileId: string, fileName?: string): Promise<void> => {
    const response = await apiClient.get(`/api/attachments/${fileId}/download`, {
      responseType: 'blob',
    })

    // 브라우저에서 파일 다운로드 실행
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 파일명 설정 (응답 헤더에서 추출하거나 매개변수 사용)
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch) {
        link.download = filenameMatch[1].replace(/['"]/g, '')
      }
    } else if (fileName) {
      link.download = fileName
    } else {
      link.download = `file_${fileId}`
    }
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  // 파일 다운로드 URL 생성 (직접 링크용)
  getDownloadUrl: (fileId: string): string => {
    return `/api/attachments/${fileId}/download`
  },

  // 파일 삭제 (ADMIN 권한 필요)
  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete<void>(`/api/attachments/${fileId}`)
  }
}

// 통합 Attachment API 객체
export const attachmentService = {
  ...attachmentApi
}