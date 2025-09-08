// 파일 첨부 관련 타입 정의

// 파일 정보 응답
export interface AttachmentInfoResponse {
  fileId: string
  fileName: string
  fileSize: number
  contentType: string
}

// 파일 업로드 응답 (배열)
export type AttachmentInfoListResponse = AttachmentInfoResponse[]

// 파일 업로드 요청 (FormData 사용)
export interface FileUploadRequest {
  files: File[]
}