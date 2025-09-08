"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react"
import { toast } from 'sonner'
import apiClient from '@/lib/services/common/api-client'

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PasswordChangeModal({ isOpen, onClose, onSuccess }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (password: string) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password)
    }
    return rules
  }

  const passwordRules = validatePassword(newPassword)
  const isPasswordValid = Object.values(passwordRules).every(rule => rule)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error('모든 필드를 입력해주세요.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }

    if (!isPasswordValid) {
      toast.error('비밀번호는 8자 이상, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.')
      return
    }

    if (currentPassword === newPassword) {
      toast.error('현재 비밀번호와 새 비밀번호가 같습니다.')
      return
    }

    setIsLoading(true)
    try {
      await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      })
      
      toast.success('비밀번호가 성공적으로 변경되었습니다.')
      handleSuccess()
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error)
      const errorMessage = error.response?.data?.message || error.message || '비밀번호 변경 중 오류가 발생했습니다.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (confirm('비밀번호 변경을 취소하시겠습니까? 취소하면 로그아웃됩니다.')) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      onClose()
    }
  }

  const handleSuccess = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    onSuccess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Lock className="w-5 h-5" />
            비밀번호 변경
          </DialogTitle>
          <DialogDescription>
            보안을 위해 비밀번호를 변경해주세요. 새 비밀번호는 8자 이상이어야 합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {newPassword && (
              <div className="space-y-1 text-xs">
                <p className="text-gray-600 font-medium">비밀번호 규칙:</p>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 ${passwordRules.length ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordRules.length ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>8자 이상</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRules.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordRules.uppercase ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>영문 대문자 포함</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRules.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordRules.lowercase ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>영문 소문자 포함</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRules.number ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordRules.number ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>숫자 포함</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordRules.special ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordRules.special ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>특수문자 포함 (!@#$%^&* 등)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {confirmPassword && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${newPassword === confirmPassword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}>
                  {newPassword === confirmPassword ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">
              <strong>주의:</strong> 비밀번호를 변경하지 않으면 다른 기능을 사용할 수 없습니다. 
              취소하면 로그아웃됩니다.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              취소 (로그아웃)
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword || !currentPassword.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
    