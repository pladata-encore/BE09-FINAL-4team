"use client";

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationMessage } from '@/lib/services/websocket';
import { Bell, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// 알림 타입별 아이콘과 색상
const getNotificationIcon = (type: NotificationMessage['type']) => {
  switch (type) {
    case 'ANNOUNCEMENT':
      return <Bell className="w-4 h-4 text-blue-600" />;
    case 'APPROVAL_REQUEST':
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    case 'APPROVAL_APPROVED':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'APPROVAL_REJECTED':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'APPROVAL_REFERENCE':
      return <FileText className="w-4 h-4 text-purple-600" />;
    default:
      return <Bell className="w-4 h-4 text-gray-600" />;
  }
};

// 알림 타입별 제목
const getNotificationTitle = (type: NotificationMessage['type']) => {
  switch (type) {
    case 'ANNOUNCEMENT':
      return '새 공지사항';
    case 'APPROVAL_REQUEST':
      return '결재 요청';
    case 'APPROVAL_APPROVED':
      return '결재 승인';
    case 'APPROVAL_REJECTED':
      return '결재 반려';
    case 'APPROVAL_REFERENCE':
      return '결재 참조';
    default:
      return '알림';
  }
};

// 알림 클릭 시 라우팅
const getNotificationRoute = (notification: NotificationMessage): string => {
  switch (notification.type) {
    case 'ANNOUNCEMENT':
      return `/announcements#${notification.referenceId}`;
    case 'APPROVAL_REQUEST':
    case 'APPROVAL_APPROVED':
    case 'APPROVAL_REJECTED':
    case 'APPROVAL_REFERENCE':
      return `/approvals/${notification.referenceId}`;
    default:
      return '/';
  }
};

export function NotificationToastManager() {
  const { toastNotifications, markAsRead, removeToast } = useNotifications();
  const router = useRouter();
  const shownToastIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    // 새로운 토스트 알림만 표시 (이미 표시한 것은 제외)
    toastNotifications.forEach((notification) => {
      // 이미 표시한 알림은 스킵
      if (shownToastIds.current.has(notification.notificationId)) {
        return;
      }

      const icon = getNotificationIcon(notification.type);
      const title = getNotificationTitle(notification.type);
      const route = getNotificationRoute(notification);

      // 표시한 알림 ID 기록
      shownToastIds.current.add(notification.notificationId);

      const handleToastClick = (toastId: string | number) => {
        console.log('토스트 클릭됨:', notification);
        // 알림 읽음 처리 (실제 알림 ID 사용)
        markAsRead(notification.notificationId);
        // 토스트에서 즉시 제거
        removeToast(notification.notificationId);
        // 해당 토스트만 닫기
        toast.dismiss(toastId);
        // 해당 페이지로 이동
        if (notification.type === 'ANNOUNCEMENT') {
          // 현재 공지사항 페이지에 있으면 해시만 변경하고 hashchange 이벤트 발생
          if (window.location.pathname === '/announcements') {
            window.location.hash = `#${notification.referenceId}`;
          } else {
            router.push(route);
          }
        } else {
          router.push(route);
        }
      };

      // 토스트 표시
      const toastId = toast(
        <div 
          className="flex items-start gap-3 w-full cursor-pointer hover:bg-gray-50 p-2 rounded"
          onClick={() => handleToastClick(toastId)}
        >
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {title}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
              {notification.content}
            </div>
            {notification.channel && (
              <div className="text-xs text-gray-400 mt-1">
                {notification.channel === 'personal' ? '개인 알림' : '전체 공지'}
              </div>
            )}
          </div>
        </div>,
        {
          duration: 5000,
          position: 'bottom-right',
          onDismiss: () => {
            // 토스트 닫기 시에만 토스트에서 제거 (읽음 처리는 하지 않음)
            removeToast(notification.notificationId);
          },
          onAutoClose: () => {
            // 자동으로 닫힐 때도 토스트에서 제거
            removeToast(notification.notificationId);
          }
        }
      );
    });
  }, [toastNotifications, markAsRead, removeToast, router]);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (토스트만 관리)
  return null;
}