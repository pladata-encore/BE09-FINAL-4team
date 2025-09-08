"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi } from '@/lib/services/user/api'
import { setAccessToken, clearAccessToken } from '@/lib/services/common/api-client'

interface User {
  id: number
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User, tokens: { accessToken: string; expiresIn: number }) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const setUser = (user: User | null) => {
    setUserState(user)

    // Refresh Token 저장 여부 추적
    if (typeof window !== 'undefined') {
      if (user !== null) {
        // Refresh Token은 항상 User Data와 같이 오기 때문에
        // User Data가 set 되면 Refresh Token도 set된 것으로 간주해도 됨
        localStorage.setItem('hasRefreshToken', 'true')
      } else {
        // 마찬가지로 User Data가 unset되면 Refresh Token도 무효화된 것으로 간주할 수 있음
        localStorage.removeItem('hasRefreshToken')
      }
      // Refresh Token은 HttpOnly 쿠키로 저장되기 때문에 이런 간접적인 방법으로 추적해야 함
    }
  }

  const hasRefreshToken = (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasRefreshToken') === 'true'
    }
    return false
  }

  const login = (userData: User, tokens: { accessToken: string; expiresIn: number }) => {
    const user: User = {
      id: Number(userData.id),
      email: userData.email,
      name: userData.name,
      role: userData.role
    }
    
    setUser(user)
    setAccessToken(tokens.accessToken)
    
    // 로그인 시에도 토큰 갱신 이벤트 발생 (웹소켓 연결을 위해)
    window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
      detail: { userId: user.id, email: user.email, name: user.name, role: user.role }
    }))
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error)
    } finally {
      setUser(null)
      clearAccessToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  const refreshUser = async () => {
    try {
      const response = await authApi.refresh()
      
      const user: User = {
        id: response.userId,
        email: response.email,
        name: response.name,
        role: response.role
      }
      setUser(user)
      setAccessToken(response.accessToken)
      
      // 토큰 갱신 이벤트 발생
      window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
        detail: { userId: response.userId, email: response.email, name: response.name, role: response.role }
      }))
    } catch (error) {
      console.error('인증 갱신 실패:', error)
      setUser(null)
      clearAccessToken()
    }
  }

  // 토큰 갱신 이벤트 리스너
  useEffect(() => {
    const handleTokenRefresh = (event: CustomEvent) => {
      const { userId, email, name, role } = event.detail
      const user: User = {
        id: userId,
        email,
        name,
        role
      }
      setUser(user)
      console.log('인증이 자동으로 갱신되었습니다:', user)
    }

    const handleTokenExpired = () => {
      setUser(null)
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search
        // 로그인 페이지가 아닌 경우에만 redirect 파라미터 추가
        if (currentPath !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&expired=true`
        } else {
          window.location.href = '/login'
        }
      }
    }

    window.addEventListener('auth:token-refreshed', handleTokenRefresh as EventListener)
    window.addEventListener('auth:token-expired', handleTokenExpired)

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh as EventListener)
      window.removeEventListener('auth:token-expired', handleTokenExpired)
    }
  }, [])

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (user === null && hasRefreshToken()) {
          await refreshUser()
        }
      } catch (error) {
        // 정상적인 경우일 수 있음 (로그인하지 않은 상태)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const value: AuthContextType = {
    user,
    login,
    logout,
    refreshUser
  }

  return !loading && <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  const isLoggedIn = !!context.user
  const isAdmin = context.user?.role === 'ADMIN'
  
  return {
    ...context,
    isLoggedIn,
    isAdmin
  }
}