# HR System 디자인 시스템

## 개요

이 문서는 HR System의 일관된 디자인을 위한 디자인 시스템 가이드라인입니다.

## 디자인 토큰

### 색상 팔레트

#### Primary Colors
- `colors.primary.blue`: 기본 파란색 그라데이션
- `colors.primary.blueHover`: 호버 상태 파란색 그라데이션
- `colors.primary.blueLight`: 연한 파란색 배경
- `colors.primary.blueText`: 파란색 텍스트

#### Status Colors
- `colors.status.success`: 성공 상태 (초록색)
- `colors.status.warning`: 경고 상태 (주황색)
- `colors.status.error`: 오류 상태 (빨간색)
- `colors.status.info`: 정보 상태 (파란색)

#### Schedule Colors
- `colors.schedule.meeting`: 회의
- `colors.schedule.project`: 프로젝트
- `colors.schedule.education`: 교육
- `colors.schedule.customer`: 고객 미팅
- `colors.schedule.report`: 보고
- `colors.schedule.vacation`: 휴가
- `colors.schedule.return`: 복귀

#### Employee Colors
- `colors.employee.ceo`: CEO 아바타
- `colors.employee.developer`: 개발자 아바타
- `colors.employee.senior`: 시니어 아바타
- `colors.employee.designer`: 디자이너 아바타

### 타이포그래피

```typescript
import { typography } from "@/lib/design-tokens"

// 사용 예시
<h1 className={typography.h1}>제목</h1>
<h2 className={typography.h2}>부제목</h2>
<p className={typography.body}>본문</p>
```

### 간격 (Spacing)

```typescript
import { spacing } from "@/lib/design-tokens"

// 사용 예시
<div style={{ marginBottom: spacing.lg }}>내용</div>
```

### 애니메이션

```typescript
import { animations } from "@/lib/design-tokens"

// 사용 예시
<div className={animations.transition}>애니메이션 요소</div>
```

## 컴포넌트

### 레이아웃 컴포넌트

#### MainLayout
모든 페이지의 기본 레이아웃을 제공합니다.

```tsx
import { MainLayout } from "@/components/layout"

<MainLayout 
  menuItems={menuItems}
  title="페이지 제목"
  userName="사용자명"
>
  {/* 페이지 내용 */}
</MainLayout>
```

#### Sidebar
사이드바 네비게이션을 제공합니다.

```tsx
import { Sidebar } from "@/components/layout"

<Sidebar 
  menuItems={menuItems}
  onMenuItemClick={handleMenuClick}
/>
```

#### Header
페이지 헤더를 제공합니다.

```tsx
import { Header } from "@/components/layout"

<Header 
  title="페이지 제목"
  userName="사용자명"
  showNotifications={true}
  showUserProfile={true}
/>
```

### UI 컴포넌트

#### GlassCard
글래스모피즘 효과가 적용된 카드 컴포넌트입니다.

```tsx
import { GlassCard } from "@/components/ui"

<GlassCard 
  hover={true}
  shadow="lg"
  radius="md"
  onClick={handleClick}
>
  카드 내용
</GlassCard>
```

#### GradientButton
그라데이션 효과가 적용된 버튼 컴포넌트입니다.

```tsx
import { GradientButton } from "@/components/ui"

<GradientButton 
  variant="primary"
  size="md"
  onClick={handleClick}
>
  버튼 텍스트
</GradientButton>
```

#### TabGroup
탭 그룹 컴포넌트입니다.

```tsx
import { TabGroup } from "@/components/ui"

const tabs = [
  { id: "tab1", label: "탭 1", icon: <Icon /> },
  { id: "tab2", label: "탭 2", icon: <Icon /> },
]

<TabGroup 
  tabs={tabs}
  activeTab="tab1"
  onTabChange={setActiveTab}
/>
```

#### DateNavigation
날짜 네비게이션 컴포넌트입니다.

```tsx
import { DateNavigation } from "@/components/ui"

<DateNavigation 
  currentPeriod="2025-07-25 ~ 2025-07-31"
  onPrevious={handlePrevious}
  onNext={handleNext}
/>
```

## CSS 클래스

### 글래스모피즘 효과
- `.glass`: 기본 글래스 효과
- `.glass-strong`: 강한 글래스 효과

### 그라데이션 배경
- `.gradient-bg`: 기본 그라데이션 배경
- `.gradient-primary`: 기본 그라데이션
- `.gradient-primary-hover`: 호버 상태 그라데이션

### 상태별 그라데이션
- `.gradient-success`: 성공 상태
- `.gradient-warning`: 경고 상태
- `.gradient-error`: 오류 상태
- `.gradient-info`: 정보 상태

### 스케줄 타입별 스타일
- `.schedule-meeting`: 회의
- `.schedule-project`: 프로젝트
- `.schedule-education`: 교육
- `.schedule-customer`: 고객 미팅
- `.schedule-report`: 보고
- `.schedule-vacation`: 휴가
- `.schedule-return`: 복귀

### 직원별 아바타 색상
- `.avatar-ceo`: CEO
- `.avatar-developer`: 개발자
- `.avatar-senior`: 시니어
- `.avatar-designer`: 디자이너

### 애니메이션
- `.transition-smooth`: 부드러운 전환
- `.hover-lift`: 호버 시 위로 이동
- `.hover-scale`: 호버 시 확대

### 그림자
- `.shadow-primary`: 기본 그림자

### 테두리 반경
- `.rounded-glass`: 글래스 스타일 둥근 모서리
- `.rounded-glass-lg`: 큰 글래스 스타일 둥근 모서리

### 간격
- `.space-section`: 섹션 간격
- `.space-card`: 카드 간격
- `.space-item`: 아이템 간격
- `.space-small`: 작은 간격

## 사용 가이드라인

### 1. 일관성 유지
- 모든 페이지에서 동일한 색상 팔레트 사용
- 일관된 간격과 타이포그래피 적용
- 동일한 애니메이션 패턴 사용

### 2. 접근성 고려
- 충분한 색상 대비 확보
- 키보드 네비게이션 지원
- 스크린 리더 호환성

### 3. 반응형 디자인
- 모바일 우선 접근법
- 유연한 그리드 시스템 사용
- 터치 친화적 인터페이스

### 4. 성능 최적화
- CSS 클래스 재사용
- 불필요한 중첩 방지
- 효율적인 애니메이션 사용

## 예시

### 기본 페이지 구조
```tsx
import { MainLayout } from "@/components/layout"
import { GlassCard, GradientButton } from "@/components/ui"
import { colors, typography } from "@/lib/design-tokens"

export default function ExamplePage() {
  const menuItems = [
    { icon: Home, label: "홈", active: true },
    { icon: Users, label: "사용자", active: false },
  ]

  return (
    <MainLayout menuItems={menuItems}>
      <div className="space-section">
        <h1 className={typography.h1}>페이지 제목</h1>
        <p className={typography.body}>페이지 설명</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <h3 className={typography.h3}>카드 제목</h3>
          <p>카드 내용</p>
        </GlassCard>
      </div>

      <GradientButton variant="primary">
        액션 버튼
      </GradientButton>
    </MainLayout>
  )
}
```

이 디자인 시스템을 통해 일관되고 사용자 친화적인 인터페이스를 구축할 수 있습니다. 