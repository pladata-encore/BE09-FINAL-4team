# 근무정책 자동 적용 기능

## 개요

사용자 생성 시 선택된 근무정책을 자동으로 적용하고 연차를 부여하는 기능입니다.

## 구현된 기능

### 1. 자동화 함수 (`applyWorkPolicyAutomatically`)

```typescript
const applyWorkPolicyAutomatically = async (userId: number) => {
  // 1. 기존 스케줄 초기화 후 새 근무정책 적용
  await workScheduleApi.applyWorkPolicyToSchedule(userId, startDate, endDate);

  // 2. 연차 정책 부여 (근무년수 기반)
  await employeeLeaveBalanceApi.grantAnnualLeaveByWorkYears(userId);
};
```

### 2. 실행 순서

1. **사용자 생성**: 기본 정보와 근무정책 선택
2. **스케줄 적용**: 선택된 근무정책을 현재 월 스케줄에 자동 반영
3. **연차 부여**: 근무년수를 기반으로 연차 자동 부여

### 3. 적용되는 API 엔드포인트

#### 근무정책 스케줄 적용

- **엔드포인트**: `POST /api/work-schedule/users/{userId}/apply-work-policy`
- **파라미터**:
  - `userId`: 대상 사용자 ID
  - `startDate`: 적용 시작 날짜 (YYYY-MM-DD)
  - `endDate`: 적용 종료 날짜 (YYYY-MM-DD)
- **동작**: 기존 스케줄을 초기화하고 새 근무정책 기반으로 스케줄 생성

#### 연차 정책 부여

- **엔드포인트**: `POST /api/leave-balance/grant-by-work-years/{employeeId}`
- **파라미터**: `employeeId`: 대상 직원 ID
- **동작**: user-service에서 조회한 근무년수를 기반으로 연차 부여

## 사용 방법

### 프로덕션 환경에서의 구현

```typescript
const handleSaveConfirm = async () => {
  try {
    // 1. 사용자 생성
    const createdUser = await userApi.createUser(processedFormData);
    toast.success("사용자가 성공적으로 생성되었습니다.");

    // 2. 근무정책이 선택된 경우 자동화 로직 실행
    if (createdUser?.id && formData.workPolicies.length > 0) {
      await applyWorkPolicyAutomatically(createdUser.id);
    }
  } catch (error) {
    toast.error("사용자 생성에 실패했습니다.");
  }
};
```

## 에러 처리

### 성공 메시지 (한글)

- "사용자가 성공적으로 생성되었습니다."
- "근무 정책이 스케줄에 성공적으로 적용되었습니다."
- "연차 정책이 성공적으로 부여되었습니다."

### 경고 메시지 (한글)

- "사용자는 생성되었지만, 근무 정책 적용 중 일부 오류가 발생했습니다. 관리자에게 문의해주세요."

## 특징

### 1. 기존 스케줄 초기화

- 이미 스케줄이 있는 사용자의 경우, 기존 스케줄을 초기화하고 새 근무정책을 적용합니다.
- `applyWorkPolicyToSchedule` API가 자동으로 처리합니다.

### 2. 연차 정책 자동 부여

- 근무년수를 기반으로 연차를 자동 계산하여 부여합니다.
- 근무정책에 정의된 연차 규칙을 따릅니다.

### 3. 에러 복구

- 사용자 생성은 성공했지만 정책 적용에 실패한 경우, 사용자에게 알림을 제공합니다.
- 관리자가 수동으로 정책을 적용할 수 있도록 안내합니다.

## 향후 개선 사항

1. 배치 처리를 통한 대량 사용자 정책 적용
2. 정책 적용 실패 시 자동 재시도 로직
3. 정책 적용 상태 추적 및 모니터링
