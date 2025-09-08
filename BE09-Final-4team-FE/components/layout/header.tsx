"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Bell, User, Menu, LogOut, Settings, User as UserIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth";
import { userApi } from "@/lib/services/user/api";
import ProfileModal from '@/app/members/components/ProfileModal'
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown'
import { getAccessToken } from '@/lib/services/common/api-client'

interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  joinDate: string
  organization: string
  position: string
  role: string
  job: string
  rank?: string
  isAdmin: boolean
  teams: string[]
  profileImage?: string
  selfIntroduction?: string
  remainingLeave?: number
  weeklyWorkHours?: number
  workPolicies?: string[]
  weeklySchedule?: Array<{
    title: string
    date: string
    time?: string
  }>
}

interface HeaderProps {
  userName?: string
  hasNewNotifications?: boolean
  showUserProfile?: boolean
  onToggleSidebar?: () => void
  isMobile?: boolean
}

export function Header({
  userName = "김인사",
  hasNewNotifications: hasNewNotifications = true,
  showUserProfile = true,
  onToggleSidebar,
  isMobile = false
}: HeaderProps) {
  const { user, logout, isAdmin } = useAuth()
  const [employeeData, setEmployeeData] = useState<Employee | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  const getAuthenticatedImageUrl = async (fileId: string) => {
    try {
      const token = getAccessToken()
      if (!token) return null

      const response = await fetch(`http://localhost:9000/api/attachments/${fileId}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
    } catch (error) {
      console.error('이미지 로드 실패:', error)
    }
    return null
  }

  useEffect(() => {
    if (user?.email) {
      userApi.getAllUsers()
        .then(users => {
          if (Array.isArray(users)) {
            const employee = users.find((emp: any) => emp.email === user.email);
            if (employee) {
              const mappedEmployee = {
                ...employee,
                profileImage: employee.profileImageUrl
              };
              setEmployeeData(mappedEmployee);
              
              if (employee.profileImageUrl && !employee.profileImageUrl.startsWith('http')) {
                getAuthenticatedImageUrl(employee.profileImageUrl).then(url => {
                  setProfileImageUrl(url);
                });
              } else {
                setProfileImageUrl(employee.profileImageUrl);
              }
            } else {
              setEmployeeData(null);
              setProfileImageUrl(null);
            }
          } else {
            console.warn('Users is not an array:', users);
            setEmployeeData(null);
          }
        })
        .catch(error => {
          console.error('직원 데이터 로드 오류:', error);
          setEmployeeData(null);
        });
    }
  }, [user]);

  useEffect(() => {
    const handleEmployeeUpdate = (event: CustomEvent) => {
      const updatedEmployee = event.detail
      if (updatedEmployee.email === user?.email) {
        setEmployeeData(updatedEmployee)
      }
    }

    window.addEventListener('employeeUpdated', handleEmployeeUpdate as EventListener)

    return () => {
      window.removeEventListener('employeeUpdated', handleEmployeeUpdate as EventListener)
    }
  }, [user?.email])

  const displayName = employeeData?.name || user?.name || userName
  const displayEmail = user?.email || ''

  const handleMyProfileClick = () => {
    if (employeeData) {
      setShowProfileModal(true)
    }
  }

  const handleProfileModalClose = () => {
    setShowProfileModal(false)
  }

  const handleProfileUpdate = (updatedEmployee: Employee) => {
    setEmployeeData(updatedEmployee)
  }

  const handleNotificationClick = (notification: any) => {
    console.log('알림 클릭:', notification)
  }

  const handleViewAllNotifications = () => {
    console.log('모든 알림 보기')
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 sm:px-6 lg:px-8 py-2 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="hover:bg-gray-100/80 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <NotificationsDropdown
            hasNewNotifications={hasNewNotifications}
            onNotificationClick={handleNotificationClick}
          />
          {showUserProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:bg-gray-200/80 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm overflow-hidden bg-transparent">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-transparent">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
                    {employeeData && (
                      <p className="text-xs leading-none text-muted-foreground">{employeeData.position} • {employeeData.organization}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMyProfileClick}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>내 프로필</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {showProfileModal && employeeData && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={handleProfileModalClose}
          employee={employeeData}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}