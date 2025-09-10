# EditModal 근무정책 자동 적용 기능

## 개요

구성원 정보 수정 시 근무정책이 변경된 경우 자동으로 스케줄을 초기화하고 새 정책을 적용하며 연차를 재부여하는 기능입니다.

## 구현된 기능

### 1. 자동화 함수 (`applyWorkPolicyAutomatically`)

```typescript
const applyWorkPolicyAutomatically = async (
  userId: number,
  previousWorkPolicyId?: string
) => {
  // 근무정책 변경 여부 확인
  if (previousWorkPolicyId === newWorkPolicyId) {
    return; // 변경 없으면 건너뛰기
  }

  // 1단계: 기존 스케줄 초기화 후 새 근무정책 적용
  await workScheduleApi.applyWorkPolicyToSchedule(userId, startDate, endDate);

  // 2단계: 연차 정책 재부여 (근무년수 기반)
  await employeeLeaveBalanceApi.grantAnnualLeaveByWorkYears(userId);
};
```

### 2. 실행 조건

- **근무정책 변경 시에만**: 기존 정책과 새 정책이 다른 경우에만 실행
- **순서 보장**: `await`를 사용해 스케줄 적용 → 연차 부여 순서로 실행
- **에러 처리**: 각 단계별 성공/실패 메시지 제공

### 3. 실행 순서

1. **구성원 정보 업데이트**: 기본 정보, 조직 정보, 근무정책 등 수정
2. **근무정책 변경 감지**: 기존 정책 ID와 새 정책 ID 비교
3. **스케줄 초기화 및 적용**: 기존 스케줄 삭제 후 새 정책 기반 스케줄 생성
4. **연차 재부여**: 기존 연차 초기화 후 새 정책 기반 연차 부여

### 4. 적용되는 API 엔드포인트

#### 근무정책 스케줄 적용 (1단계)

- **엔드포인트**: `POST /api/work-schedule/users/{userId}/apply-work-policy`
- **동작**: 기존 스케줄을 완전히 초기화하고 새 근무정책 기반으로 재생성

#### 연차 정책 재부여 (2단계)

- **엔드포인트**: `POST /api/leave-balance/grant-by-work-years/{employeeId}`
- **동작**: 기존 연차를 초기화하고 근무년수 기반으로 새 연차 부여

## 사용 방법

### 구성원 수정 프로세스

```typescript
const handleSave = async () => {
  // 기존 근무정책 ID 저장
  const previousWorkPolicyId = employee?.workPolicies?.[0];

  try {
    // 1. 구성원 정보 업데이트
    const response = await apiClient.patch(
      `/api/users/${editedEmployee.id}`,
      updateData
    );

    // 2. 근무정책 자동화 로직 실행 (순서대로)
    if (editedEmployee.workPolicies?.length > 0) {
      await applyWorkPolicyAutomatically(
        parseInt(editedEmployee.id),
        previousWorkPolicyId
      );
    }
  } catch (error) {
    // 에러 처리
  }
};
```

## UI 개선 사항

### 근무정책 리스트 스크롤

- **최대 높이**: 300px로 제한
- **스크롤**: 5개 이상의 정책이 있을 때 자동으로 스크롤 가능
- **클래스**: `max-h-[300px] overflow-y-auto`


## 에러 처리 및 메시지

### 성공 메시지 (한글)

- "근무 정책이 스케줄에 성공적으로 적용되었습니다."
- "연차 정책이 성공적으로 부여되었습니다."
- "구성원 정보가 성공적으로 업데이트되었습니다."

### 경고 메시지 (한글)

- "구성원 정보는 수정되었지만, 근무 정책 적용 중 일부 오류가 발생했습니다. 관리자에게 문의해주세요."

### 로깅

- 각 단계별 콘솔 로그로 진행 상황 추적
- 에러 발생 시 상세 로그 기록

## 특징

### 1. 변경 감지

- 근무정책이 실제로 변경된 경우에만 자동화 로직 실행
- 불필요한 API 호출 방지

### 2. 순서 보장

- `await`를 사용해 스케줄 적용 완료 후 연차 부여 실행
- 의존성 있는 작업의 순서 보장

### 3. 에러 복구

- 구성원 정보 수정은 성공했지만 정책 적용 실패 시 사용자에게 알림
- 관리자가 수동으로 정책을 재적용할 수 있도록 안내

### 4. 사용자 경험

- 각 단계별 성공 메시지로 진행 상황 알림
- 스크롤 가능한 정책 리스트로 사용성 향상

## AddMemberModal과의 차이점

| 구분        | AddMemberModal         | EditModal                |
| ----------- | ---------------------- | ------------------------ |
| 실행 조건   | 사용자 생성 시 항상    | 근무정책 변경 시에만     |
| 기존 데이터 | 없음                   | 기존 스케줄/연차 초기화  |
| 변경 감지   | 불필요                 | 기존 정책과 비교         |
| 에러 처리   | 생성 실패 시 전체 롤백 | 부분 실패 시 경고 메시지 |

## 향후 개선 사항

1. 정책 적용 상태 실시간 표시
2. 배치 처리를 통한 여러 구성원 동시 정책 변경
3. 정책 변경 이력 추적 및 감사 로그
