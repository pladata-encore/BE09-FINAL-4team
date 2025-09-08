// 공통 API 응답 타입
/**
 * @deprecated 백엔드에서 ApiResult가 deprecated 되었습니다.
 *             아직 ApiResult를 사용하는 백엔드 API가 있다면 단계적으로 수정해야 합니다.
 */
export interface ApiResult<T> {
  status: string
  message: string
  data: T
}

// 페이지네이션 관련 타입
export interface Pageable {
  page: number
  size: number
  sort?: string[]
}

export interface SortObject {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface PageableObject {
  offset: number
  sort: SortObject
  unpaged: boolean
  paged: boolean
  pageSize: number
  pageNumber: number
}

export interface PageResult<T> {
  totalPages: number
  totalElements: number
  size: number
  content: T[]
  number: number
  sort: SortObject
  first: boolean
  last: boolean
  numberOfElements: number
  pageable: PageableObject
  empty: boolean
}

// 공통 에러 타입
export interface ApiError {
  message: string
  status?: number
  data?: any
}