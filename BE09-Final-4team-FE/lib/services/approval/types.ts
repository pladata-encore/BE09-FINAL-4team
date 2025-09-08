import { Pageable } from '../common/types'

// 사용자 프로필 타입
export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string
  profileImageUrl: string
}

// 승인 서비스 특화 열거형
export enum DocumentStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TargetType {
  USER = 'USER',
  ORGANIZATION = 'ORGANIZATION',
  N_LEVEL_MANAGER = 'N_LEVEL_MANAGER'
}

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  MONEY = 'MONEY',
  DATE = 'DATE',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT'
}

export enum DocumentRole {
  AUTHOR = 'AUTHOR',
  APPROVER = 'APPROVER',
  REFERENCE = 'REFERENCE',
  VIEWER = 'VIEWER'
}

export enum ActivityType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  MODIFY_APPROVAL = 'MODIFY_APPROVAL',
  COMMENT = 'COMMENT'
}

export enum AttachmentUsageType {
  DISABLED = 'DISABLED',
  OPTIONAL = 'OPTIONAL',
  REQUIRED = 'REQUIRED'
}

// 내 승인 정보 타입
export interface MyApprovalInfo {
  myApprovalStatus: ApprovalStatus
  isApprovalRequired: boolean
  myApprovalStage: number
}

// 카테고리 관련 타입
export interface CategoryResponse {
  id: number
  name: string
  sortOrder: number
}

export interface CreateCategoryRequest {
  name: string
  sortOrder: number
}

export interface UpdateCategoryRequest {
  name: string
  sortOrder: number
}

// 템플릿 관련 타입
export interface TemplateFieldResponse {
  id: number
  name: string
  fieldType: FieldType
  required: boolean
  fieldOrder: number
  options?: string
}

export interface TemplateFieldRequest {
  name: string
  fieldType: FieldType
  required: boolean
  fieldOrder: number
  options?: string
}

export interface ApprovalTargetResponse {
  id: number
  targetType: TargetType
  user?: UserProfile
  organizationId?: number
  managerLevel?: number
  isReference: boolean
  approvalStatus?: ApprovalStatus
  processor?: UserProfile
  processedAt?: string
}

export interface ApprovalTargetRequest {
  targetType: TargetType
  userId?: number
  organizationId?: number
  managerLevel?: number
  isReference: boolean
}

export interface ApprovalStageResponse {
  id: number
  stageOrder: number
  stageName: string
  isCompleted: boolean
  completedAt?: string
  approvalTargets: ApprovalTargetResponse[]
}

export interface ApprovalStageRequest {
  stageOrder: number
  stageName: string
  approvalTargets: ApprovalTargetRequest[]
}

export interface AttachmentInfoResponse {
  fileId: string
  fileName: string
  fileSize: number
  contentType: string
}

export interface TemplateResponse {
  id: number
  title: string
  icon?: string
  color?: string
  description?: string
  bodyTemplate?: string
  useBody: boolean
  useAttachment: AttachmentUsageType
  allowTargetChange: boolean
  isHidden: boolean
  referenceFiles: AttachmentInfoResponse[]
  category?: CategoryResponse
  fields: TemplateFieldResponse[]
  approvalStages: ApprovalStageResponse[]
  referenceTargets: ApprovalTargetResponse[]
  createdAt: string
  updatedAt: string
}

export interface TemplateSummaryResponse {
  id: number
  title: string
  icon?: string
  color?: string
  description?: string
  useBody: boolean
  useAttachment: AttachmentUsageType
  allowTargetChange: boolean
  isHidden: boolean
  category?: CategoryResponse
  createdAt: string
  updatedAt: string
}

export interface TemplatesByCategoryResponse {
  categoryId?: number
  categoryName?: string
  templates: TemplateSummaryResponse[]
}

export interface CreateTemplateRequest {
  title: string
  icon?: string
  color?: string
  description?: string
  bodyTemplate?: string
  useBody: boolean
  useAttachment: AttachmentUsageType
  allowTargetChange: boolean
  referenceFiles?: string[]
  categoryId?: number
  fields?: TemplateFieldRequest[]
  approvalStages?: ApprovalStageRequest[]
  referenceTargets?: ApprovalTargetRequest[]
}

export interface UpdateTemplateRequest {
  title: string
  icon?: string
  color?: string
  description?: string
  bodyTemplate?: string
  useBody: boolean
  useAttachment: AttachmentUsageType
  allowTargetChange: boolean
  referenceFiles?: string[]
  categoryId?: number
  fields?: TemplateFieldRequest[]
  approvalStages?: ApprovalStageRequest[]
  referenceTargets?: ApprovalTargetRequest[]
}

// 문서 관련 타입
export interface DocumentFieldValueResponse {
  id: number
  fieldName: string
  fieldType: FieldType
  fieldValue?: string
}

export interface DocumentFieldValueRequest {
  templateFieldId: number
  fieldValue?: string
}

export interface DocumentActivityResponse {
  id: number
  activityType: ActivityType
  user: UserProfile
  description?: string
  reason?: string
  createdAt: string
}

export interface DocumentCommentResponse {
  id: number
  content: string
  author: UserProfile
  createdAt: string
  updatedAt: string
}

export interface DocumentBase {
  id: number
  content?: string
  status: DocumentStatus
  author: UserProfile
  currentStage?: number
  myRole: DocumentRole
  myApprovalInfo?: MyApprovalInfo
  createdAt: string
  updatedAt: string
  submittedAt?: string
  approvedAt?: string
}

export interface DocumentResponse extends DocumentBase {
  template: TemplateResponse
  fieldValues: DocumentFieldValueResponse[]
  approvalStages: ApprovalStageResponse[]
  referenceTargets: ApprovalTargetResponse[]
  activities: DocumentActivityResponse[]
  comments: DocumentCommentResponse[]
  attachments: AttachmentInfoResponse[]
}

export interface DocumentSummaryResponse extends DocumentBase {
  template: TemplateSummaryResponse
  totalStages: number
}

export interface CreateDocumentRequest {
  templateId: number
  content?: string
  fieldValues?: DocumentFieldValueRequest[]
  approvalStages?: ApprovalStageRequest[]
  referenceTargets?: ApprovalTargetRequest[]
  attachments?: string[]
  submitImmediately?: boolean
}

export interface UpdateDocumentRequest {
  content?: string
  fieldValues?: DocumentFieldValueRequest[]
  approvalStages?: ApprovalStageRequest[]
  referenceTargets?: ApprovalTargetRequest[]
  attachments?: string[]
}

export interface ApprovalActionRequest {
  reason?: string
}

// 댓글 관련 타입
export interface CreateCommentRequest {
  content: string
}

// API 요청 파라미터 타입들
export interface GetDocumentsParams {
  status?: DocumentStatus[]
  search?: string
  startDate?: string
  endDate?: string
  pageable: Pageable
}

export interface GetTemplatesParams {
  categoryId?: number
}

// 벌크 카테고리 관련 타입
export enum BulkCategoryOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export interface BulkCategoryOperation {
  type: BulkCategoryOperationType
  id?: number
  createRequest?: CreateCategoryRequest
  updateRequest?: UpdateCategoryRequest
}

export interface BulkCategoryRequest {
  operations: BulkCategoryOperation[]
}

export interface CategoryOperationResult {
  operationType: string
  categoryId?: number
  category?: CategoryResponse
  success: boolean
  errorMessage?: string
}

export interface BulkCategoryResponse {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  results: CategoryOperationResult[]
}

