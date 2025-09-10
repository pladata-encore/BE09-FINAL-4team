"use client";

import { newsApi, NewsArticle } from "@/lib/services/news";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { typography } from "@/lib/design-tokens";
import {
  Users,
  Calendar,
  Clock,
  Bell,
  FileText,
  CheckCircle,
  AlertCircle,
  Globe,
  User,
  Timer,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  attendanceApi,
  workMonitorApi,
  employeeLeaveBalanceApi,
} from "@/lib/services/attendance";
import { useAuth } from "@/hooks/use-auth";
import { formatKstTime } from "@/lib/utils/datetime";
import { useNotifications } from "@/contexts/NotificationContext";
import { communicationApi } from "@/lib/services/communication";
import { useRef } from "react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinDate: string;
  organization: string;
  position: string;
  role: string;
  job: string;
  rank?: string;
  isAdmin: boolean;
  teams: string[];
}

interface AttendanceState {
  checkInTime: string | null;
  checkOutTime: string | null;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  lastCheckInDate: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { recentNotifications, markAsRead } = useNotifications();

  // 실제 알림 목록 상태 (communication API)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(
    null
  );
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const notificationScrollRef = useRef<HTMLDivElement>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [thisWeekVacation, setThisWeekVacation] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const [currentTime, setCurrentTime] = useState("");
  const [currentIP, setCurrentIP] = useState("");
  const [attendanceState, setAttendanceState] = useState<AttendanceState>({
    checkInTime: null,
    checkOutTime: null,
    isCheckedIn: false,
    isCheckedOut: false,
    lastCheckInDate: null,
  });

  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // 공지사항 상태
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  // 이번 주 근로시간 상태
  const [weeklyWork, setWeeklyWork] = useState<{
    weekly: number;
    dailyAverage: number;
    overtime: number;
  }>({ weekly: 0, dailyAverage: 0, overtime: 0 });

  // 오늘 출근/지각/휴가 수
  const [workMonitor, setWorkMonitor] = useState<{
    attendanceCount: number;
    lateCount: number;
    vacationCount: number;
  } | null>(null);

  // 나의 연차 요약 상태
  const [leaveSummary, setLeaveSummary] = useState<{
    remaining: number;
    total: number;
    used: number;
  }>({ remaining: 0, total: 0, used: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setCurrentIP(data.ip);
      } catch (error) {
        setCurrentIP("123.456.789.123");
      }
    };

    getIP();
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    if (
      attendanceState.lastCheckInDate &&
      attendanceState.lastCheckInDate !== today
    ) {
      setAttendanceState({
        checkInTime: null,
        checkOutTime: null,
        isCheckedIn: false,
        isCheckedOut: false,
        lastCheckInDate: null,
      });
    }
  }, [attendanceState.lastCheckInDate]);

  useEffect(() => {
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) {
      const parsedEmployees = JSON.parse(savedEmployees);
      setEmployees(parsedEmployees);
      setTotalEmployees(parsedEmployees.length);

      setTodayAttendance(Math.round(parsedEmployees.length * 0.9));

      setThisWeekVacation(3);

      setPendingApprovals(2);
    }
  }, []);

  // 오늘 출근/지각/휴가 수 불러오기
  useEffect(() => {
    const loadWorkMonitor = async () => {
      try {
        console.log("Loading work monitor data...");
        const data = await workMonitorApi.getTodayWorkMonitor();
        console.log("Work monitor data loaded:", data);
        console.log("Late count from API:", data.lateCount);
        console.log("Attendance count from API:", data.attendanceCount);
        console.log("Vacation count from API:", data.vacationCount);

        setWorkMonitor({
          attendanceCount: data.attendanceCount || 0,
          lateCount: data.lateCount || 0,
          vacationCount: data.vacationCount || 0,
        });
      } catch (error: any) {
        console.error("workMonitor load error:", error);
        // 에러 발생 시 기본값 설정
        setWorkMonitor({
          attendanceCount: 0,
          lateCount: 0,
          vacationCount: 0,
        });
      }
    };

    loadWorkMonitor();

    // 자동 갱신: 매 30초마다 데이터 새로고침
    const interval = setInterval(loadWorkMonitor, 30000);

    return () => clearInterval(interval);
  }, []);

  // 날짜가 바뀌면 workMonitor 데이터 리셋 및 새로 로드
  useEffect(() => {
    const checkDateChange = () => {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem("lastWorkMonitorDate");

      if (lastDate !== today) {
        console.log("Date changed, refreshing work monitor data...");
        localStorage.setItem("lastWorkMonitorDate", today);

        // 새로운 날짜의 데이터 로드
        const loadWorkMonitor = async () => {
          try {
            const data = await workMonitorApi.getTodayWorkMonitor();
            setWorkMonitor({
              attendanceCount: data.attendanceCount || 0,
              lateCount: data.lateCount || 0,
              vacationCount: data.vacationCount || 0,
            });
          } catch (error: any) {
            console.error("workMonitor reload error:", error);
            setWorkMonitor({
              attendanceCount: 0,
              lateCount: 0,
              vacationCount: 0,
            });
          }
        };

        loadWorkMonitor();
      }
    };

    // 컴포넌트 마운트 시 한 번 체크
    checkDateChange();

    // 매 분마다 날짜 변경 체크
    const dateCheckInterval = setInterval(checkDateChange, 60000);

    return () => clearInterval(dateCheckInterval);
  }, []);

  // 출근/퇴근 후 work monitor 데이터 갱신하는 함수
  const refreshWorkMonitor = async () => {
    try {
      console.log("Refreshing work monitor data after attendance action...");
      const data = await workMonitorApi.updateTodayWorkMonitorData();
      console.log("Refreshed work monitor data:", data);
      console.log("Updated late count:", data.lateCount);
      setWorkMonitor({
        attendanceCount: data.attendanceCount || 0,
        lateCount: data.lateCount || 0,
        vacationCount: data.vacationCount || 0,
      });
    } catch (error: any) {
      console.error("workMonitor refresh error:", error);
    }
  };

  useEffect(() => {
    const loadNews = async () => {
      try {
        setNewsLoading(true); // 로딩 시작
        const recentNews = await newsApi.getRecentNewsForDashboard();
        setNewsData(recentNews);
        console.log("뉴스 데이터 로드 완료:", recentNews);
      } catch (error) {
        console.error("Error fetching recent news:", error);
        setNewsData([]); // 에러 발생 시 뉴스 데이터를 비웁니다.
      } finally {
        setNewsLoading(false); // 로딩 종료
      }
    };
    loadNews(); // 컴포넌트 마운트 시 뉴스 로드 함수 호출
  }, []);

  useEffect(() => {
    const loadWeekly = async () => {
      try {
        if (!user?.id) return;
        const detail = await attendanceApi.getThisWeekAttendance(
          Number(user.id)
        );
        const days = detail?.dailySummaries || [];
        let totalHours = 0;
        let workedDays = 0;
        days.forEach((d: any) => {
          const h =
            typeof d.workHours === "number"
              ? d.workHours
              : typeof d.workMinutes === "number"
              ? d.workMinutes / 60
              : 0;
          if (h > 0) {
            totalHours += h;
            workedDays += 1;
          }
        });
        const dailyAvg =
          workedDays > 0 ? Math.round((totalHours / workedDays) * 10) / 10 : 0;
        const overtime = Math.max(0, Math.round((totalHours - 40) * 10) / 10);
        setWeeklyWork({
          weekly: Math.round(totalHours * 10) / 10,
          dailyAverage: dailyAvg,
          overtime,
        });
      } catch (e) {
        // 실패 시 기본값 유지
        setWeeklyWork({ weekly: 0, dailyAverage: 0, overtime: 0 });
      }
    };
    loadWeekly();
  }, [user?.id]);

  useEffect(() => {
    const loadLeaveSummary = async () => {
      try {
        if (!user?.id) return;
        const summary = await employeeLeaveBalanceApi.getLeaveBalanceSummary(
          Number(user.id)
        );
        const total = summary?.totalGrantedDays ?? 0;
        const used = summary?.totalUsedDays ?? 0;
        const remaining =
          summary?.totalRemainingDays ?? Math.max(0, total - used);
        setLeaveSummary({ remaining, total, used });
      } catch (e) {
        setLeaveSummary({ remaining: 0, total: 0, used: 0 });
      }
    };
    loadLeaveSummary();
  }, [user?.id]);

  // 알림 목록 로드 함수
  const loadNotifications = async (reset: boolean = false) => {
    if (!hasMoreNotifications && !reset) return;

    try {
      setNotificationsLoading(true);
      const params = reset
        ? {}
        : lastNotificationId
        ? { lastId: lastNotificationId }
        : {};
      const response = await communicationApi.notifications.getMyNotifications(
        params
      );
      const newNotifications = response.data || [];

      if (reset) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }

      if (newNotifications.length > 0) {
        setLastNotificationId(newNotifications[newNotifications.length - 1].id);
      }
      setHasMoreNotifications(newNotifications.length >= 20);
    } catch (error) {
      console.error("알림 목록 로드 실패:", error);
      if (reset) setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // 초기 알림 목록 로드
  useEffect(() => {
    loadNotifications(true);
  }, []);

  // 공지사항 목록 로드
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        const data = await communicationApi.announcements.getAllAnnouncements();
        // 최신 5개 표시
        setAnnouncements(data.slice(0, 5));
      } catch (error) {
        console.error("공지사항 로드 실패:", error);
        setAnnouncements([]);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  // 웹소켓 새 알림이 오면 알림 목록 새로고침
  useEffect(() => {
    if (recentNotifications.length > 0) {
      loadNotifications(true);
    }
  }, [recentNotifications]);

  // 알림 스크롤 처리
  const handleNotificationScroll = () => {
    const container = notificationScrollRef.current;
    if (!container || notificationsLoading || !hasMoreNotifications) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

    if (isAtBottom) {
      loadNotifications(false);
    }
  };

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = notificationScrollRef.current;
    if (container) {
      container.addEventListener("scroll", handleNotificationScroll);
      return () =>
        container.removeEventListener("scroll", handleNotificationScroll);
    }
  }, [notificationsLoading, hasMoreNotifications]);

  // 출근
  const handleCheckIn = async () => {
    try {
      if (!user?.id) {
        toast.error("사용자 정보를 확인할 수 없습니다.");
        return;
      }

      const now = new Date();
      const checkInDisplay = formatKstTime(now);

      const res = await attendanceApi.checkIn({
        userId: Number(user.id),
        checkIn: now.toISOString(),
      });
      console.log("checkIn response:", res);

      setAttendanceState((prev) => ({
        ...prev,
        checkInTime: checkInDisplay,
        isCheckedIn: true,
        lastCheckInDate: now.toDateString(),
      }));

      // 출근 성공 후 work monitor 데이터 갱신
      await refreshWorkMonitor();

      // 출근 상태에 따른 메시지 표시
      if (res.attendanceStatus === "LATE") {
        toast.warning("지각으로 출근이 기록되었습니다.");
      } else {
        toast.success("출근이 기록되었습니다!");
      }
    } catch (error: any) {
      console.error("checkIn error:", {
        message: error?.message,
        status: error?.status,
        data: error?.data,
      });
      toast.error(`출근 기록 오류: ${error?.message || "알 수 없는 오류"}`);
    }
  };

  // 퇴근
  const handleCheckOut = async () => {
    try {
      if (!user?.id) {
        toast.error("사용자 정보를 확인할 수 없습니다.");
        return;
      }

      const now = new Date();
      const checkOutDisplay = formatKstTime(now);

      const res = await attendanceApi.checkOut({
        userId: Number(user.id),
        checkOut: now.toISOString(),
      });
      console.log("checkOut response:", res);

      setAttendanceState((prev) => ({
        ...prev,
        checkOutTime: checkOutDisplay,
        isCheckedOut: true,
      }));

      // 퇴근 후 work monitor 데이터 갱신 (조퇴 등의 상태 반영)
      await refreshWorkMonitor();

      toast.success("퇴근이 기록되었습니다!");
    } catch (error: any) {
      console.error("checkOut error:", {
        message: error?.message,
        status: error?.status,
        data: error?.data,
      });
      toast.error(`퇴근 기록 오류: ${error?.message || "알 수 없는 오류"}`);
    }
  };

  const employeeData = {
    approvalStats: [
      {
        title: "내가 결재할 문서",
        count: 3,
        bgColor: "#FFF5CC",
        statusColor: "#EA580C",
        icon: FileText,
      },
      {
        title: "내가 신청한 문서",
        count: 2,
        bgColor: "#E3F0FF",
        statusColor: "#007BFF",
        icon: User,
      },
      {
        title: "결재 반려된 문서",
        count: 1,
        bgColor: "#FFE8E8",
        statusColor: "#FF4D4F",
        icon: XCircle,
      },
      {
        title: "결재 완료된 문서",
        count: 8,
        bgColor: "#E8FFF2",
        statusColor: "#00C56B",
        icon: CheckCircle,
      },
    ],

    leaveData: {
      remaining: 12,
      total: 15,
      used: 3,
    },

    workHoursData: {
      weekly: 42,
      dailyAverage: 8.4,
      overtime: 2,
    },
  };

  const adminData = {
    attendanceStats: [
      {
        title: "출근",
        value: String(workMonitor?.attendanceCount ?? 0),
        unit: "people",
        icon: Users,
        backgroundColor: "#E8FFF2",
        iconColor: "#00C56B",
      },
      {
        title: "지각",
        value: String(workMonitor?.lateCount ?? 0),
        unit: "people",
        icon: Clock,
        backgroundColor: "#FFF5CC",
        iconColor: "#FF4D4F",
      },
      {
        title: "휴가",
        value: String(workMonitor?.vacationCount ?? 0),
        unit: "people",
        icon: Calendar,
        backgroundColor: "#E3F0FF",
        iconColor: "#00A8F7",
      },
    ],
  };

  // Debug logging for workMonitor state
  console.log("Current workMonitor state:", workMonitor);
  console.log("AdminData late count:", workMonitor?.lateCount ?? 0);

  const recentActivities = [
    {
      id: 1,
      type: "출근",
      user: "김철수",
      time: "09:00",
      status: "success",
      icon: CheckCircle,
    },
    {
      id: 2,
      type: "휴가 신청",
      user: "이영희",
      time: "08:45",
      status: "pending",
      icon: AlertCircle,
    },
    {
      id: 3,
      type: "퇴근",
      user: "박민수",
      time: "18:30",
      status: "success",
      icon: CheckCircle,
    },
    {
      id: 4,
      type: "결재 승인",
      user: "최지영",
      time: "17:15",
      status: "success",
      icon: CheckCircle,
    },
  ];

  // 알림 타입별 아이콘과 색상
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return { icon: Bell, color: "text-blue-600", bgColor: "bg-blue-100" };
      case "APPROVAL_REQUEST":
        return {
          icon: AlertCircle,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
        };
      case "APPROVAL_APPROVED":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case "APPROVAL_REJECTED":
        return { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" };
      case "APPROVAL_REFERENCE":
        return {
          icon: FileText,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        };
      default:
        return { icon: Bell, color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  // 상대 시간 계산
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return "방금 전";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: any) => {
    try {
      // 읽음 처리 (API 호출)
      if (!notification.read) {
        await communicationApi.notifications.markAsRead(notification.id);
        // 로컬 상태 업데이트
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      }

      // 페이지 이동
      switch (notification.type) {
        case "ANNOUNCEMENT":
          router.push(`/announcements#${notification.referenceId}`);
          break;
        case "APPROVAL_REQUEST":
        case "APPROVAL_APPROVED":
        case "APPROVAL_REJECTED":
        case "APPROVAL_REFERENCE":
          router.push(`/approvals/${notification.referenceId}`);
          break;
        default:
          console.warn("알 수 없는 알림 타입:", notification.type);
      }
    } catch (error) {
      console.error("알림 클릭 처리 실패:", error);
    }
  };

  const renderUnifiedDashboard = () => (
    <>
      {/* 출석 통계 카드 (관리자 정보) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {adminData.attendanceStats.map((metric, index) => (
            <GlassCard
              key={index}
              className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: metric.iconColor }}
                >
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {metric.title}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: metric.iconColor }}
                    >
                      {metric.value}
                    </span>
                    <span className="text-sm text-gray-600">{metric.unit}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* 개인 업무 + 관리자 정보 통합 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* 출퇴근 Card (개인) */}
        <GlassCard
          className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay: "0.4s" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              출퇴근
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {currentTime}
              </div>
              <div className="text-sm text-gray-500">IP: {currentIP}</div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                onClick={handleCheckIn}
                disabled={attendanceState.isCheckedIn}
              >
                {attendanceState.isCheckedIn ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Timer className="w-4 h-4 mr-2" />
                )}
                출근 {attendanceState.checkInTime || currentTime}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
                onClick={handleCheckOut}
                disabled={
                  !attendanceState.isCheckedIn || attendanceState.isCheckedOut
                }
              >
                {attendanceState.isCheckedOut ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                퇴근{" "}
                {attendanceState.checkOutTime ||
                  (attendanceState.isCheckedIn ? currentTime : "")}
              </Button>
            </div>
          </CardContent>
        </GlassCard>

        {/* 이번 주 근로시간 Card (개인) */}
        <GlassCard
          className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay: "0.5s" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              이번 주 근로시간
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2">
                {weeklyWork.weekly}h
              </div>
              <div className="text-sm opacity-90">이번 주 근무시간</div>
            </div>
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <span>일 평균 {weeklyWork.dailyAverage}h</span>
              <span className="text-red-600 font-medium">
                초과근무 {weeklyWork.overtime}h
              </span>
            </div>
          </CardContent>
        </GlassCard>

        {/* 나의 연차 Card (개인) */}
        <GlassCard
          className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay: "0.6s" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              나의 연차
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-2">
                {leaveSummary.remaining}일
              </div>
              <div className="text-sm opacity-90">남은 연차</div>
            </div>
            <div className="flex justify-center gap-6 text-sm text-gray-600">
              <span>총 연차 {leaveSummary.total}일</span>
              <span>사용 연차 {leaveSummary.used}일</span>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* 결재, 뉴스, 공지 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 결재 Card */}
        <GlassCard
          className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay: "0.7s" }}
          onClick={() => router.push("/approvals")}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              결재 현황
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {employeeData.approvalStats.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: item.bgColor }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.statusColor }}
                  >
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">
                    {item.title}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    color: item.statusColor,
                    backgroundColor: "white",
                    fontWeight: "bold",
                  }}
                >
                  {item.count}건
                </Badge>
              </div>
            ))}
          </CardContent>
        </GlassCard>

        {/* 뉴스 Card - 실제 크롤링된 뉴스 사용 */}
        <GlassCard
          className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay: "0.8s" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              뉴스
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newsLoading ? (
              // 로딩 중일 때
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 animate-pulse"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 실제 뉴스 데이터 표시
              newsData.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg_WHITE border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text_GRAY-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.press}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {item.categoryName}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              ))
            )}
          </CardContent>
        </GlassCard>

        {/* 공지 Card */}
        <GlassCard
          className="p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
          style={{ animationDelay: "0.9s" }}
        >
          <CardHeader
            className="pb-4 cursor-pointer"
            onClick={() => router.push("/announcements")}
          >
            <CardTitle className="text-xl font-semibold text-gray-900">
              공지사항
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcementsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-gray-100 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                공지사항이 없습니다.
              </div>
            ) : (
              announcements.map((item) => {
                const announcementDate = new Date(item.createdAt)
                  .toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                  .replace(/\. /g, ".")
                  .replace(/\.$/, "");

                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderLeftColor: "#007BFF",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/announcements#${item.id}`);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-800 text-sm truncate pr-2">
                        {item.title}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {announcementDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </GlassCard>
      </div>
    </>
  );

  const currentDate = new Date();
  const dayString = currentDate.toLocaleDateString("ko-KR", {
    weekday: "short",
  });
  const monthString = currentDate.toLocaleDateString("ko-KR", {
    month: "long",
  });
  const yearString = currentDate.getFullYear();
  const dayNumber = currentDate.getDate();

  return (
    <MainLayout requireAuth={true}>
      {/* Header with date */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className={`${typography.h1} text-gray-800`}>대시보드</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg font-semibold">{monthString}</span>
              <span className="text-lg font-semibold">{dayNumber}일</span>
              <span className="text-lg font-semibold">{dayString}요일</span>
              <span className="text-lg font-semibold">{yearString}년</span>
            </div>
          </div>
        </div>
      </div>

      {/* 통합 대시보드 렌더링 */}
      {renderUnifiedDashboard()}

    </MainLayout>
  );
}
