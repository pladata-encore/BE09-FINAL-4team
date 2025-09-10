"use client";

import { useState, useEffect } from "react";
import React from "react";
import {
  Calendar,
  Gift,
  Star,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import StyledPaging from "@/components/paging/styled-paging";
import { leaveApi } from "@/lib/services/attendance/api";
import { employeeLeaveBalanceApi } from "@/lib/services/attendance/api";
import {
  CreateLeaveRequestDto,
  LeaveType,
} from "@/lib/services/attendance/types";
import { useAuth } from "@/hooks/use-auth";
import VacationModal from "./vacationmodal";

// Type definitions
interface VacationRecord {
  id: number;
  type: string;
  startDate: string;
  endDate?: string;
  days: number;
  reason: string;
  status: "승인됨" | "대기중" | "반려됨";
}

interface VacationStats {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  specialDays: number;
}

export default function VacationPage(): JSX.Element {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [vacationRecords, setVacationRecords] = useState<VacationRecord[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedVacationType, setSelectedVacationType] =
    useState<string>("기본 연차");
  const [stats, setStats] = useState<VacationStats>({
    totalDays: 0,
    usedDays: 0,
    remainingDays: 0,
    specialDays: 0,
  });

  const [remainingBasic, setRemainingBasic] = useState<number | null>(null);
  const [remainingComp, setRemainingComp] = useState<number | null>(null);
  const [remainingSpecial, setRemainingSpecial] = useState<number | null>(null);

  // 페이지네이션 설정
  const itemsPerPage = 5;
  const totalItems = vacationRecords.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = vacationRecords.slice(startIndex, endIndex);

  // 샘플 데이터 - 페이지네이션 테스트를 위해 더 많은 데이터 추가
  useEffect(() => {
    setVacationRecords([
      {
        id: 1,
        type: "연차",
        startDate: "2025.08.01",
        days: 1,
        reason: "[2025-08-01] 연차 사용 신청합니다.",
        status: "승인됨",
      },
      {
        id: 2,
        type: "연차",
        startDate: "2025.08.05",
        days: 1,
        reason: "[2025-08-05] 개인 사정으로 인한 연차 신청",
        status: "대기중",
      },
      {
        id: 3,
        type: "연차",
        startDate: "2025.07.28",
        days: 1,
        reason: "[2025-07-28] 병원 진료로 인한 연차 신청",
        status: "승인됨",
      },
      {
        id: 4,
        type: "연차",
        startDate: "2025.07.15",
        endDate: "2025.07.16",
        days: 2,
        reason: "[2025-07-15] 여행 계획으로 인한 연차 신청",
        status: "반려됨",
      },
      {
        id: 5,
        type: "반차",
        startDate: "2025.07.10",
        endDate: "오후",
        days: 0.5,
        reason: "[2025-07-10] 오후 개인 업무 처리",
        status: "승인됨",
      },
      {
        id: 6,
        type: "연차",
        startDate: "2025.07.03",
        days: 1,
        reason: "[2025-07-03] 가족 행사 참석",
        status: "승인됨",
      },
      {
        id: 7,
        type: "연차",
        startDate: "2025.06.20",
        days: 1,
        reason: "[2025-06-20] 개인 사정으로 인한 휴가",
        status: "승인됨",
      },
      {
        id: 8,
        type: "반차",
        startDate: "2025.06.15",
        endDate: "오전",
        days: 0.5,
        reason: "[2025-06-15] 오전 병원 진료",
        status: "승인됨",
      },
      {
        id: 9,
        type: "연차",
        startDate: "2025.06.10",
        endDate: "2025.06.12",
        days: 3,
        reason: "[2025-06-10] 가족 여행으로 인한 연차 신청",
        status: "승인됨",
      },
      {
        id: 10,
        type: "연차",
        startDate: "2025.05.25",
        days: 1,
        reason: "[2025-05-25] 개인 업무 처리",
        status: "대기중",
      },
      {
        id: 11,
        type: "연차",
        startDate: "2025.05.18",
        days: 1,
        reason: "[2025-05-18] 결혼식 참석",
        status: "승인됨",
      },
      {
        id: 12,
        type: "반차",
        startDate: "2025.05.10",
        endDate: "오후",
        days: 0.5,
        reason: "[2025-05.10] 오후 개인 일정",
        status: "반려됨",
      },
    ]);
  }, []);

  // 남은 연차 불러오기
  useEffect(() => {
    const fetchRemaining = async () => {
      if (!user?.id) return;
      try {
        const [basic, comp, special] = await Promise.all([
          employeeLeaveBalanceApi.getRemainingLeave(
            user.id,
            LeaveType.BASIC_ANNUAL
          ),
          employeeLeaveBalanceApi.getRemainingLeave(
            user.id,
            LeaveType.COMPENSATION_ANNUAL
          ),
          employeeLeaveBalanceApi.getRemainingLeave(
            user.id,
            LeaveType.SPECIAL_ANNUAL
          ),
        ]);
        setRemainingBasic(basic);
        setRemainingComp(comp);
        setRemainingSpecial(special);
      } catch (e) {
        console.error("남은 연차 조회 실패:", e);
      }
    };
    fetchRemaining();
  }, [user?.id]);

  useEffect(() => {
    const draft =
      typeof window !== "undefined"
        ? localStorage.getItem("aichat:vacationDraft")
        : null;
    if (draft) {
      setSelectedVacationType("기본 연차");
      setIsModalOpen(true);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "승인됨":
        return (
          <Badge
            variant="outline"
            className="text-blue-600 border-blue-200 bg-blue-50"
          >
            {status}
          </Badge>
        );
      case "대기중":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200 bg-orange-50"
          >
            {status}
          </Badge>
        );
      case "반려됨":
        return (
          <Badge
            variant="outline"
            className="text-red-600 border-red-200 bg-red-50"
          >
            {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateRange = (
    startDate: string,
    days: number,
    endDate?: string
  ) => {
    if (days === 0.5) {
      return `${startDate} ~ ${endDate}`;
    }
    if (endDate && endDate !== startDate) {
      return `${startDate} ~ ${endDate}`;
    }
    return startDate;
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // 휴가 카드 클릭 핸들러
  const handleVacationCardClick = (vacationType: string) => {
    setSelectedVacationType(vacationType);
    setIsModalOpen(true);
  };

  // 휴가 타입을 LeaveType enum으로 변환
  const getLeaveType = (vacationType: string): LeaveType => {
    switch (vacationType) {
      case "기본 연차":
      case "연차":
        return LeaveType.BASIC_ANNUAL;
      case "보상 연차":
        return LeaveType.COMPENSATION_ANNUAL;
      case "특별 연차":
        return LeaveType.SPECIAL_ANNUAL;
      default:
        return LeaveType.BASIC_ANNUAL;
    }
  };

  // 연차 잔액 새로고침
  const refreshLeaveBalance = async () => {
    if (!user?.id) return;

    try {
      const [basic, comp, special] = await Promise.all([
        employeeLeaveBalanceApi.getRemainingLeave(
          user.id,
          LeaveType.BASIC_ANNUAL
        ),
        employeeLeaveBalanceApi.getRemainingLeave(
          user.id,
          LeaveType.COMPENSATION_ANNUAL
        ),
        employeeLeaveBalanceApi.getRemainingLeave(
          user.id,
          LeaveType.SPECIAL_ANNUAL
        ),
      ]);
      setRemainingBasic(basic);
      setRemainingComp(comp);
      setRemainingSpecial(special);
      alert("연차 잔액이 새로고침되었습니다.");
    } catch (e) {
      console.error("연차 잔액 새로고침 실패:", e);
      alert("연차 잔액 새로고침에 실패했습니다.");
    }
  };

  // 근무년수 기반 연차 부여
  const grantAnnualLeaveByWorkYears = async () => {
    if (!user?.id) return;

    try {
      await employeeLeaveBalanceApi.grantAnnualLeaveByWorkYears(user.id);
      alert("근무년수에 따른 연차가 부여되었습니다.");
      // 연차 부여 후 잔액 새로고침
      await refreshLeaveBalance();
    } catch (e: any) {
      console.error("연차 부여 실패:", e);

      // 더 자세한 에러 정보 표시
      let errorMessage = "연차 부여에 실패했습니다.";

      if (e?.response?.data?.message) {
        errorMessage = `연차 부여 실패: ${e.response.data.message}`;
      } else if (e?.response?.status) {
        errorMessage = `연차 부여 실패: 서버 오류 (${e.response.status})`;
      } else if (e?.message) {
        errorMessage = `연차 부여 실패: ${e.message}`;
      }

      alert(errorMessage);
    }
  };

  // 휴가 신청 처리
  const handleVacationSubmit = async (data: any) => {
    if (!user?.id) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      // VacationModal의 데이터를 API 요청 형식으로 변환
      const leaveRequest: CreateLeaveRequestDto = {
        employeeId: user.id,
        leaveType: getLeaveType(data.type),
        startDate: data.dates[0] || data.startDate, // dates 배열의 첫 번째 값 또는 startDate 사용
        endDate:
          data.dates[1] || data.dates[0] || data.endDate || data.startDate, // 종료일이 없으면 시작일과 동일
        reason: data.reason,
        // 반차인 경우 시간 정보 포함
        ...(data.type === "반차" &&
          data.startTime &&
          data.endTime && {
            startTime: {
              hour: parseInt(data.startTime.split(":")[0]),
              minute: parseInt(data.startTime.split(":")[1]),
              second: 0,
              nano: 0,
            },
            endTime: {
              hour: parseInt(data.endTime.split(":")[0]),
              minute: parseInt(data.endTime.split(":")[1]),
              second: 0,
              nano: 0,
            },
          }),
      };

      console.log("휴가 신청 요청 데이터:", leaveRequest);

      const response = await leaveApi.createLeaveRequest(leaveRequest);

      console.log("휴가 신청 성공:", response);

      // 성공 시 새로운 기록을 목록에 추가
      const newRecord: VacationRecord = {
        id: response.requestId,
        type: data.type,
        startDate: response.startDate,
        endDate:
          response.endDate !== response.startDate
            ? response.endDate
            : undefined,
        days: response.totalDays,
        reason: response.reason,
        status:
          response.status === "PENDING"
            ? "대기중"
            : response.status === "APPROVED"
            ? "승인됨"
            : response.status === "REJECTED"
            ? "반려됨"
            : "대기중",
      };

      setVacationRecords((prev) => [newRecord, ...prev]);
      setIsModalOpen(false);
      // alert("휴가 신청이 성공적으로 제출되었습니다."); // 모달 제거

      // 휴가 신청 후 연차 잔액 새로고침
      await refreshLeaveBalance();
    } catch (error: any) {
      console.error("휴가 신청 실패:", error);

      let errorMessage = "휴가 신청 중 오류가 발생했습니다.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">휴가 등계</h1>
            <p className="text-gray-600 mt-1">
              나의 휴가 현황을 확인하고 관리하세요
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={grantAnnualLeaveByWorkYears}
              className="flex items-center space-x-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Gift className="w-4 h-4" />
              <span>연차 부여</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleVacationCardClick("기본 연차")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">기본 연차</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {remainingBasic ?? "–"}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      일 남음
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleVacationCardClick("보상 연차")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">보상 연차</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {remainingComp ?? "–"}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      일 남음
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleVacationCardClick("특별 연차")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">특별 연차</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {remainingSpecial ?? "–"}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      일 남음
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vacation Records */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                휴가 기록
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  날짜 범위 선택
                </Button>
                <Button
                  onClick={() => {
                    setSelectedVacationType("기본 연차");
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  휴가 신청
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="text-gray-600 font-medium">
                    구분
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium">
                    기간
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium">
                    일수
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium">
                    사유
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium">
                    상태
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    className="border-gray-100 hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {record.type}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDateRange(
                        record.startDate,
                        record.days,
                        record.endDate
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {record.days}일
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-md truncate">
                      {record.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          <div className="px-6 pb-6">
            <StyledPaging
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </Card>

        {/* Vacation Modal */}
        <VacationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleVacationSubmit}
          defaultVacationType={selectedVacationType}
        />
      </div>
    </MainLayout>
  );
}
