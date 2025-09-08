"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { communicationApi } from "@/lib/services/communication";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import { getRelativeTime } from '@/lib/utils/datetime'

interface Notification {
  id: number;
  userId: number;
  type:
    | "ANNOUNCEMENT"
    | "APPROVAL_REQUEST"
    | "APPROVAL_APPROVED"
    | "APPROVAL_REJECTED"
    | "APPROVAL_REFERENCE";
  content: string;
  referenceId: number;
  createdAt: string; // ISO 8601 문자열
  read: boolean;
}

interface NotificationsDropdownProps {
  hasNewNotifications?: boolean;
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationsDropdown({
  hasNewNotifications = false,
  notifications = [],
  onNotificationClick,
}: NotificationsDropdownProps) {
  const router = useRouter();
  const { hasUnreadNotifications: contextHasUnread, refreshUnreadStatus, recentNotifications } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<Notification[]>(
    []
  );
  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState(hasNewNotifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastId, setLastId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 알림 목록 조회
  const loadNotifications = async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = reset ? {} : lastId ? { lastId } : {};
      const response = await communicationApi.notifications.getMyNotifications(
        params
      );
      const newNotifications = response.data || [];

      setNotificationsList((prev) => {
        const updatedList = reset
          ? newNotifications
          : [...prev, ...newNotifications];

        // 알림 목록 업데이트 후 안읽은 알림 상태 확인
        const hasUnread = updatedList.some((n) => !n.read);
        setHasUnreadNotifications(hasUnread);

        return updatedList;
      });

      if (newNotifications.length > 0) {
        setLastId(newNotifications[newNotifications.length - 1].id);
      }
      setHasMore(newNotifications.length >= 20); // 20개씩 로드하므로 20개 미만이면 더 이상 없음
    } catch (error) {
      console.error("알림 목록 조회 실패:", error);
      setError("알림을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 읽지 않은 알림 체크
  const checkUnreadNotifications = async () => {
    try {
      const response = await communicationApi.notifications.hasUnreadNotifications();
      setHasUnreadNotifications(response.data || false);
    } catch (error: any) {
      console.error("읽지 않은 알림 체크 실패:", error);
      setHasUnreadNotifications(false);
    }
  };

  // 알림 읽음 처리
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await communicationApi.notifications.markAsRead(notificationId);

      // 로컬 상태 업데이트
      setNotificationsList((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );

      // 서버에서 실제 읽지 않은 알림 상태 확인
      await checkUnreadNotifications();
      
      // 컨텍스트 상태도 새로고침
      await refreshUnreadStatus();
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  // props로 받은 notifications가 있으면 사용하되, 로컬 상태와 동기화
  const displayNotifications = notifications.length > 0 
    ? notifications.map(propNotification => {
        // 로컬 상태에서 같은 ID의 알림을 찾아서 읽음 상태 동기화
        const localNotification = notificationsList.find(n => n.id === propNotification.id);
        return localNotification ? localNotification : propNotification;
      })
    : notificationsList;

  const handleNotificationClick = async (notification: Notification) => {
    // 읽지 않은 알림인 경우 읽음 처리
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // 알림 타입별 라우팅
    switch (notification.type) {
      case "ANNOUNCEMENT":
        // 현재 공지사항 페이지에 있으면 해시만 변경하고 hashchange 이벤트 발생
        if (window.location.pathname === "/announcements") {
          window.location.hash = `#${notification.referenceId}`;
        } else {
          router.push(`/announcements#${notification.referenceId}`);
        }
        break;
      case "APPROVAL_REQUEST":
      case "APPROVAL_APPROVED":
      case "APPROVAL_REJECTED":
      case "APPROVAL_REFERENCE":
        // TODO: 결재 페이지 구현 시 실제ㄷ 페이지로 이동
        console.log("결재 관련 알림:", notification);
        break;
      default:
        console.warn("알 수 없는 알림 타입:", notification.type);
    }

    onNotificationClick?.(notification);
  };

  // 무한 스크롤 처리
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

    if (isAtBottom) {
      loadNotifications(false);
    }
  };

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loading, hasMore]);

  const handleDropdownOpen = async (open: boolean) => {
    setIsOpen(open);

    if (open) {
      // 드롭다운 열 때마다 API로 완전 새로고침
      // 1. 읽지 않은 알림 상태 먼저 체크
      await checkUnreadNotifications();
      // 2. 최신 알림 목록 조회 (reset: true로 완전 새로고침)
      await loadNotifications(true);
    }
  };

  // 컴포넌트 마운트 시 읽지 않은 알림 상태 체크
  useEffect(() => {
    checkUnreadNotifications();
  }, []);

  // 컨텍스트의 읽지 않은 알림 상태 동기화
  useEffect(() => {
    setHasUnreadNotifications(contextHasUnread);
  }, [contextHasUnread]);

  // 새 알림 구독 시 빨간 표시 활성화 및 리렌더링
  useEffect(() => {
    if (recentNotifications.length > 0) {
      setHasUnreadNotifications(true);
      // 읽지 않은 알림 상태 새로고침으로 정확한 상태 반영
      checkUnreadNotifications();
    }
  }, [recentNotifications]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-gray-100/80 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5 text-gray-500" />
          {hasUnreadNotifications && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">알림</h3>
        </div>
        <div ref={scrollContainerRef} className="max-h-64 overflow-y-auto">
          {error && (
            <div className="p-3 text-center text-red-500 text-sm">
              {error}
              <button
                onClick={() => loadNotifications(true)}
                className="block mt-2 text-blue-600 hover:text-blue-800 text-xs"
              >
                다시 시도
              </button>
            </div>
          )}

          {displayNotifications.length === 0 && !loading && !error && (
            <div className="p-3 text-center text-gray-500 text-sm">
              알림이 없습니다.
            </div>
          )}

          {displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      notification.read ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getRelativeTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="p-3 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
              알림을 불러오는 중...
            </div>
          )}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
