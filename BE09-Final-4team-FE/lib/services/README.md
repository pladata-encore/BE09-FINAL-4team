# Services Structure

MSA(Microservices Architecture) 환경을 위한 서비스별 API 클라이언트 구조입니다.

## 폴더 구조

```
lib/services/
├── common/                   # 공통 타입 및 유틸리티
│   ├── types.ts              # 공통 API 응답 타입 (PageResult 등)
│   ├── api-client.ts         # 공통 HTTP 클라이언트 설정
│   └── index.ts              # 공통 exports
├── approval/                 # 승인 서비스
│   ├── types.ts              # 승인 서비스 전용 타입
│   ├── api.ts                # 승인 서비스 API 함수들
│   └── index.ts              # 승인 서비스 exports
├── user/                     # 사용자 서비스
│   ├── types.ts              # 사용자 서비스 전용 타입
│   ├── api.ts                # 사용자 서비스 API 함수들
│   └── index.ts              # 사용자 서비스 exports
├── attendance/               # 근태 서비스
│   ├── types.ts              # 근태 서비스 전용 타입
│   ├── api.ts                # 근태 서비스 API 함수들
│   └── index.ts              # 근태 서비스 exports
└── ...
```

## 사용 방법

### 1. 특정 서비스만 임포트
```typescript
import { approvalApi, DocumentStatus } from '@/lib/services/approval'
import { userApi, UserRole } from '@/lib/services/user'
```

### 2. 공통 타입 사용
```typescript
import { PageResult } from '@/lib/services/common'
```

### 3. 개별 서비스를 직접 임포트 (권장)
```typescript
import { approvalApi } from '@/lib/services/approval'
import { userApi } from '@/lib/services/user'

// API 사용 예시
const categories = await approvalApi.category.getCategories()
const userProfile = await userApi.getProfile()
```

## API 에러 처리

서비스 클라이언트에서는 `response.data`만 반환하며, 에러 처리는 `try-catch`로 수행합니다:

```typescript
try {
  const categories = await approvalApi.category.getCategories()
  // 성공 시 처리
} catch (error: any) {
  // error.status: HTTP 상태 코드
  // error.message: 에러 메시지
  // error.data: 서버 응답 데이터
  console.error('API Error:', error.status, error.message)
}
```

## 새로운 서비스 추가하기

1. `lib/services/` 하위에 서비스 이름으로 폴더 생성
2. 해당 폴더에 `types.ts`, `api.ts`, `index.ts` 파일 생성

### 예시

```typescript
// lib/services/approval/types.ts
export interface DocumentResponse {
  id: number
  title: string
  content?: string
  status: DocumentStatus
  authorId: number
  template: TemplateResponse
  createdAt: string
  updatedAt: string
}

// lib/services/approval/api.ts
import apiClient from '../common/api-client'
import { CreateDocumentRequest, DocumentResponse } from './types'
import { PageResult } from '../common/types'

export const documentApi = {
  createDocument: async (request: CreateDocumentRequest): Promise<DocumentResponse> => {
    const response = await apiClient.post<DocumentResponse>('/api/approval/documents', request)
    return response.data
  },
}

// lib/services/approval/index.ts
export * from './types'
export * from './api'
export { default as approvalApi } from './api'
```
