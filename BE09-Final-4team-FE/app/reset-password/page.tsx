"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  email: string
  name: string
  isAdmin: boolean
  needsPasswordReset: boolean
}

interface PasswordErrors {
  newPassword?: string
  confirmPassword?: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const userData = localStorage.getItem('currentUser')
    
    if (!isLoggedIn || !userData) {
      router.push('/login')
      return
    }

    const user: User = JSON.parse(userData)
    if (!user.needsPasswordReset) {
      router.push('/')
      return
    }

    setCurrentUser(user)
  }, [router])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('최소 8자 이상')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('대문자 1개 이상')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('소문자 1개 이상')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('숫자 1개 이상')
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('특수문자(!@#$%^&*) 1개 이상')
    }
    
    return errors
  }

  const handleInputChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }))
    
    const newErrors = { ...errors }
    
    if (field === 'newPassword') {
      const passwordErrors = validatePassword(value)
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(', ')
      } else {
        delete newErrors.newPassword
      }
      
      if (passwords.confirmPassword && value !== passwords.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
      } else if (passwords.confirmPassword && value === passwords.confirmPassword) {
        delete newErrors.confirmPassword
      }
    }
    
    if (field === 'confirmPassword') {
      if (value !== passwords.newPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
      } else {
        delete newErrors.confirmPassword
      }
    }
    
    setErrors(newErrors)
  }

  const getPasswordStrength = (password: string) => {
    const validations = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*]/.test(password)
    ]
    
    const strength = validations.filter(Boolean).length
    return {
      strength,
      percentage: (strength / 5) * 100,
      color: strength <= 2 ? 'red' : strength <= 3 ? 'yellow' : strength <= 4 ? 'orange' : 'green'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newPasswordErrors = validatePassword(passwords.newPassword)
      const finalErrors: PasswordErrors = {}

      if (newPasswordErrors.length > 0) {
        finalErrors.newPassword = newPasswordErrors.join(', ')
      }

      if (passwords.newPassword !== passwords.confirmPassword) {
        finalErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
      }

      if (!passwords.newPassword) {
        finalErrors.newPassword = '새 비밀번호를 입력해주세요'
      }

      if (!passwords.confirmPassword) {
        finalErrors.confirmPassword = '비밀번호 확인을 입력해주세요'
      }

      if (Object.keys(finalErrors).length > 0) {
        setErrors(finalErrors)
        toast.error('입력 정보를 확인해주세요')
        return
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex((u: any) => u.email === currentUser?.email)
      
      if (userIndex !== -1) {
        users[userIndex].password = passwords.newPassword
        users[userIndex].needsPasswordReset = false
        localStorage.setItem('users', JSON.stringify(users))
      }

      if (currentUser) {
        const updatedUser = { ...currentUser, needsPasswordReset: false }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      }

      toast.success('비밀번호가 성공적으로 변경되었습니다!')
      router.push('/')
    } catch (error) {
      toast.error('비밀번호 변경 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isLoggedIn')
    router.push('/login')
  }

  if (!currentUser) {
    return null
  }

  const passwordStrength = getPasswordStrength(passwords.newPassword)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">비밀번호 재설정</CardTitle>
          <CardDescription className="text-gray-600">
            {currentUser.name}님, 새로운 비밀번호를 설정해주세요
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                새 비밀번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* 비밀번호 강도 표시 */}
              {passwords.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-red-500' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                          passwordStrength.color === 'orange' ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{passwordStrength.strength}/5</span>
                  </div>
                  
                  {/* 비밀번호 요구사항 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center space-x-1 ${passwords.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                      {passwords.newPassword.length >= 8 ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>최소 8자 이상</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[A-Z]/.test(passwords.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/[A-Z]/.test(passwords.newPassword) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>대문자 1개 이상</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[a-z]/.test(passwords.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/[a-z]/.test(passwords.newPassword) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>소문자 1개 이상</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[0-9]/.test(passwords.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/[0-9]/.test(passwords.newPassword) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>숫자 1개 이상</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[!@#$%^&*]/.test(passwords.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                      {/[!@#$%^&*]/.test(passwords.newPassword) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>특수문자 1개 이상</span>
                    </div>
                  </div>
                </div>
              )}
              
              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                비밀번호 확인
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="pl-10 pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-12"
              >
                취소
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>처리 중...</span>
                  </div>
                ) : (
                  '비밀번호 변경'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 