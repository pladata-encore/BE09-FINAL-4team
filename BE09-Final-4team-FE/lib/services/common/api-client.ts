import axios from 'axios'
import { ApiResult } from './types'
import { LoginResponse } from '../user'

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

// 메모리에 Access Token 저장
let accessToken: string | null = null
let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

// Access Token 관리 함수들
export const setAccessToken = (token: string) => {
  accessToken = token
}

export const getAccessToken = () => {
  return accessToken
}

export const clearAccessToken = () => {
  accessToken = null
}

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 요청 인터셉터 - 인증 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    // 메모리에서 Access Token 가져오기
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Token Refresh용 별도 axios 인스턴스 (순환 참조 방지)
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // HttpOnly 쿠키를 위해 필요
})

// 응답 인터셉터 - 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // 401 에러이고 /api/auth/ 요청이 아닌 경우 토큰 갱신 시도
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.startsWith('/api/auth/')) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Refresh Token으로 새 Access Token 요청
        const response = await refreshClient.post<ApiResult<LoginResponse>>('/api/auth/refresh')

        const { accessToken: newToken, userId, email, name, role } = response.data.data
        setAccessToken(newToken)
        
        // AuthContext에 토큰 갱신 성공 이벤트 전달
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
            detail: { userId, email, name, role }
          }))
        }
        
        // 대기 중인 요청들 처리
        processQueue(null, newToken)
        
        // 원본 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)

      } catch (refreshError) {
        // Refresh 실패 시 로그아웃 처리
        processQueue(refreshError, null)
        clearAccessToken()
        
        // AuthContext에 토큰 갱신 실패 이벤트 전달
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:token-expired'))
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // 에러 메시지 표준화
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred'
    
    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

export default apiClient
