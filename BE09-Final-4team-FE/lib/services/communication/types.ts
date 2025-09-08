// 공지사항 관련 타입 정의

// 기본 사용자 정보
export interface UserBasicInfo {
  id: number;
  name: string;
  profileImageUrl?: string;
}

// 공지사항 요약 정보 (목록용)
export interface AnnouncementSummaryDto {
  id: number;
  title: string;
  displayAuthor: string;
  views: number;
  commentCount: number;
  createdAt: string;
}

// 공지사항 상세 응답
export interface AnnouncementResponseDto {
  id: number;
  title: string;
  displayAuthor: string;
  content: string;
  createdAt: string;
  fileIds: string[];
  views: number;
}

// 공지사항 생성 요청
export interface AnnouncementCreateRequestDto {
  title: string;
  displayAuthor?: string;
  content: string;
  fileIds?: string[];
}

// 공지사항 수정 요청
export interface AnnouncementUpdateRequestDto {
  title?: string;
  displayAuthor?: string;
  content?: string;
  fileIds?: string[];
}

// 댓글 관련 타입
export interface CommentResponseDto {
  id: number;
  content: string;
  createdAt: string;
  userInfo: UserBasicInfo;
  canDelete: boolean;
}

export interface CommentCreateDto {
  content: string;
}

// 알림 관련 타입
export type NotificationType =
  | "ANNOUNCEMENT"
  | "APPROVAL_REQUEST"
  | "APPROVAL_APPROVED"
  | "APPROVAL_REJECTED"
  | "APPROVAL_REFERENCE";

export interface NotificationResponseDto {
  id: number;
  userId: number;
  type: NotificationType;
  content: string;
  referenceId: number;
  createdAt: string;
  read: boolean;
}

// 알림 목록 조회 파라미터
export interface NotificationQueryParams {
  lastId?: number;
  size?: number;
}

// 사용자별 알림 조회 파라미터 (관리자용)
export interface UserNotificationQueryParams extends NotificationQueryParams {
  userId: number;
}

// 사내 문서함 관련 타입 정의

// 사내 문서 응답 (목록 및 상세)
export interface ArchiveResponseDto {
  id: number;
  title: string;
  description: string;
  fileIds: string[];
}

// 사내 문서 생성 응답
export interface ArchiveCreateResponseDto {
  id: number;
  title: string;
  authorId: number;
  description: string;
  fileIds: string[];
  createdAt: string;
}

// 사내 문서 생성 요청
export interface ArchiveCreateRequestDto {
  title: string;
  description?: string;
  fileIds: string[];
}

// 사내 문서 수정 요청
export interface ArchiveUpdateRequestDto {
  title?: string;
  description?: string;
  fileIds?: string[];
}
