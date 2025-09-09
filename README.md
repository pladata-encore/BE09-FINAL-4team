# Hermes (에르메스) ERP 시스템

> "신속하고 정확한 정보 전달의 신처럼, 직장인의 모든 흐름을 연결하는 ERP 시스템"
> 

---

## 1. 🛫 프로젝트 기획서

### ✨ 개요

- **설명:**
    - Hermes는 조직 내 모든 구성원의 **업무 흐름, 인사 관리, 일정, 성과** 등을 하나로 통합하고, **신속한 정보 전달과 자동화된 의사결정 흐름**을 실현하는 **MSA 기반 차세대 ERP 시스템**입니다.
    고대 그리스의 전령신 'Hermes'처럼, 빠르고 정확하게 필요한 정보를 조직 내 모든 사용자에게 전달하는 플랫폼을 지향합니다.
- 진행 기간:
    - 2025.07.18 ~ 2025.09.10

### 🎯 주제 선정 이유

- 실제 조직의 업무 흐름을 반영한 통합 인사관리 시스템의 필요성
- 기능별로 분리된 기존 시스템의 한계 극복
- 스타트업 및 성장 조직의 다음과 같은 니즈 해결:
    - 인사, 전자결재, 협업 도구의 분리 운영
    - 외부 시스템 연동의 복잡성
    - 승인 프로세스 단절로 인한 비효율

### 🎯 프로젝트 목표

- 효율적인 인사·업무 프로세스 통합
- 자동화된 승인 흐름 제공
- 커뮤니케이션, 문서, 일정까지 한 플랫폼 내에서 처리

### 👨‍👩‍👧‍👦 팀원 구성

| [이석진 (팀장)](https://github.com/Othereum) | [박경빈](https://github.com/binipk) | [박준범](https://github.com/junbem) | 이혜빈 | [조석근](https://github.com/SeokGeunCho?tab=repositories) |
| --- | --- | --- | --- | --- |
| 결재 시스템 / 멀티테넌시 / 인증 및 보안 | 구성원 관리 시스템 / 조직 관리 시스템 / 로그인 서비스 | 출,퇴근 관리 / 근무표 관리 / 근무 정책 생성 /AI 챗봇 업무 지 | 게시판, 공지사항 기능 / 문서 업로드 및 관리 | 구성원 관리 시스템 / 뉴스 크롤링 |

---

## 2. 🧾 요구사항 정의

### 📍 필수 기능

- **사용자 인증 및 권한 관리** (JWT, ADMIN/USER 권한)
- **전자결재 시스템**: 휴가/근무 요청, 승인 관리
- **인사관리**: 사원 정보, 직급/직위/직책, 고용 형태, 변경 이력
- **게시판/공지사항 기능**
- **문서 업로드 및 관리**
- **캘린더 기반 일정/휴가 시스템**
- **AI 챗봇 업무 지원**
- **자동 뉴스 수집 및 필터링 기능**
- **조직 및 멤버 관리**
- **실시간 알림 등 사용자 편의성 기능**

[요구사항 정의서 시트](https://docs.google.com/spreadsheets/d/1RU6BNMHBs447m35Jfl0hRWiqjUHM6KXM/edit?gid=1866330929#gid=1866330929)

---

## 3. ⚙️ 세부 기능 설명

## 🔐로그인 기능

- [로그인 기능](https://www.notion.so/2698b767810d80bdbd88e899122a382f?pvs=21)

## 🧑‍💼 인사 관리

- [인사관리](https://www.notion.so/2698b767810d8074a3c5fe930585cad9?pvs=21)

### 📣 게시판 기능

- 공지사항 CRUD
- 리치 텍스트 에디터 (Lexical)
- 상세 모달

### 🗓 근무표 관리

- 개인 근무표 관리
- 개인 근무표 조회
- 동료 근무표 조회 기
- 전자결재 시스템 및 승인 템플릿

### 🤖 AI 챗봇

- 문서 업로드
- 시스템 설정 지원
- 날씨 및 현재 시간 제공

### 🗞 뉴스 크롤링

- [뉴스 크롤링](https://www.notion.so/2698b767810d803a9d30f377ec76d515?pvs=21)

### 📂 문서 관리

- 문서 업로드/수정/조회
- 문서 테이블 관리

### 🧩 시스템 설정

- 회사 정보 설정
- 고정/선택/교대 근무 정책 관리

### 🧷 기타 기능

- [비밀번호 재설정](https://www.notion.so/2698b767810d80a197ddcbf2da1d7894?pvs=21)
- 반응형 웹 지원
- 실시간 알림

---

## 4. 🛠 기술 스택

### 🧠 Backend

- Java 17
- Spring Boot
- Spring Cloud
- Spring Security
- JWT

### 🧑‍🎨 Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Material-UI

### 🗄 Database

- PostgreSQL
- MySQL

---

## 5. 🛰 프론트 & 백엔드 아키텍처 및 구조

### 🧱 MSA 구성도

- **Discovery Server (Eureka)**: 서비스 디스커버리
- **Config Server**: 설정 중앙화
- **Gateway Server**: API 게이트웨이, 인증 처리
- **User Service**: 사용자 관리 (PostgreSQL)
- **News Crawler Service**: 뉴스 수집기 (MySQL)
- **Attendance Service**: 직원 출퇴근 기록과 근무 스케줄, 연차(부여·잔액·사용)를 관리하며 AI 챗봇 연계를 통해 휴가 신청 등 자동화된 업무 흐름을 지원 (PostgreSQL)
- **Approval Service**: 템플릿 기반 결재 문서의 작성·수정·제출과 다단계 승인/반려 흐름 및 활동 이력을 관리하는 결재 프로세스
- **Attachment Service**: 문서·게시글 등에서 업로드되는 파일의 저장, 메타데이터 관리, 검증 및 제공(다운로드/URL 발급)을 담당하는 첨부파일 관리
- **Communication Service**: 이메일·알림 등 사용자 커뮤니케이션 채널로 메시지를 발송하고 템플릿/전송 이력을 관리
- **Tenant Service**: 멀티테넌트 환경에서 테넌트(회사)별 구성을 분리·관리하고 테넌트 메타데이터, 초기화 및 격리를 담당

### 스토리보드 (Figma)

[스토리보드 피그마](https://www.figma.com/design/mkyeRFTorV1kJ8YAZQBrx9/Hermes-Storyboard?node-id=0-1&p=f&t=OoEVWyPQzDWMWsLB-0)

### ERD 설계서

[ERD 설계서](https://www.erdcloud.com/d/AkxK4D6AQEp3Z4ems)

### API 명세서

[API 명세서](https://www.notion.so/API-23ba02b1ffb180e29c22dac592076a6e?pvs=21)

### 백엔드 파일 구조

```java
BE09-Final-4team-BE/
├── approval-service/
├── attachment-service/
├── attendance-service/
├── communication-service/
├── companyinfo-service/
├── org-service/
├── tenant-service/
├── user-service/
├── news-crawler-service/
├── config-server/
├── discovery-server/
└── gateway-server/
```

### 프론트엔드 파일 구조

```java
BE09-Final-4team-FE/
├── app/
│   ├── aichat/
│   │   └── components/
│   ├── announcements/
│   │   └── write/
│   │       └── components/
│   │           └── plugins/
│   │           └── themes/
│   ├── approvals/
│   │   └── components/
│   │       └── common/
│   │   └── DocumentWriterModal/
│   │       └── components/
│   │       └── hooks/
│   │       └── layouts/
│   ├── documents/
│   ├── login/
│   ├── members/
│   │   └── components/
│   │       └── profile/
│   ├── news/
│   ├── reset-password/
│   ├── settings/
│   │   └── companyinfo/
│   │   └── workpolicies/
│   │       └── components/
│   │       └── create/
│   ├── vacation/
│   │   └── components/
│   └── work/
│       └── components/
├── components/
│   ├── calendar/
│   ├── clock/
│   ├── layout/
│   ├── paging/
│   └── ui/
├── contexts/
├── hooks/
├── lib/
│   └── services/
│       ├── approval/
│       ├── attachment/
│       ├── attendance/
│       ├── common/
│       ├── communication/
│       ├── organization/
│       ├── title/
│       ├── user/
│       └── websocket/
│   └── utils/
├── providers/
├── public/
└── types/
```

### 클라우드 아키텍처

![image.png](attachment:fbc0a6df-704d-47fe-82b6-8d7516390b54:image.png)

---

## 6. 🔍 회고

> 회고 항목은 개발 완료 후 작성 예정입니다.
> 
- 프로젝트 수행 중 어려웠던 점
- 기술적/팀워크 측면에서의 인사이트
- 개선할 부분 및 다음 프로젝트에의 반영 계획
