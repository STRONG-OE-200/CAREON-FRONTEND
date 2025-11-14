# CareOn (돌봄온)

> 가족 간병인을 위한 실시간 스케줄 협업 및 간병 로그 서비스

<br />

## 📌 주요 기능

- **인증:** JWT 로그인, 회원가입, 로그아웃
- **방 관리:** 방 생성, 방장/멤버 역할(Role) 구분 UI, 멤버 내보내기, 방 나가기
- **스케줄 협업 (핵심):**
  - **1. 생성 (방장):** '간병 필요 시간' 등록
  - **2. 참여 (멤버):** '간병 가능 시간' 제출
  - **3. 조정 (방장):** 신청자 충돌 현황 확인 (멤버별 색상) 및 수동 배정
  - **4. 확정:** 스케줄 최종 확정 및 모든 멤버에게 공유
- **스케줄 조회:**
  - **확정 시간표:** 멤버별 고유 색상 + 이름으로 렌더링
  - **내 시간표:** 나에게 할당된 시간만 하이라이트
  - **과거 시간표:** 이전 스케줄 불러오기 및 이번 주로 복사
- **간병 로그 (Log):**
  - **항목 관리:** 방마다 "체온", "혈압" 외 커스텀 항목을 `POST`/`DELETE` API로 동적 관리
  - **로그 생성:** 날짜/시간, 값(Content), 메모를 `POST` API로 기록
  - **로그 조회:** `GET` API로 날짜별 로그 목록 조회 및 항목별 필터링
  - **로그 수정/삭제:** `PATCH` / `DELETE` API를 연동한 상세 모달 구현
  - **차트:** `Chart.js`를 활용, '체온'(일간 및 주간), '혈압'(시간대별 주간) 추이 시각화

<br />

## 🚀 향후 개발 계획 (Future Plans)

- **캘린더 (Calendar):** 간병 관련 스케줄을 월별 캘린더 뷰로 조회
- **챗봇 (Chatbot):** 간병 정보 제공 및 간단한 질의응답 기능

<br />

## 🛠️ 기술 스택

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context (`useContext`), `localStorage`
- **API Client:** Axios
- **Data Visualization:** `Chart.js`, `date-fns`
- **Deployment:** Vercel

<br />

## 💡 핵심 트러블슈팅

- **상태 동기화 & 캐시 버그 해결:**
  - 방 생성/스케줄 확정 직후, UI가 갱신되지 않는 **"오래된 정보(Stale State)"** 버그 발생.
  - `window.location.href` (강제 새로고침), `usePathname` (Context 재호출), API URL 캐시 버스터(`&_t=...`), `Cache-Control` 헤더 등을 적용하여 **Next.js/Vercel의 데이터 캐시** 문제 해결.
- **전역 상태 관리 설계:**
  - `React Context` (`RoomContext`)를 도입하여, 여러 페이지와 레이아웃(Layout, Page, Sidebar)이 `roomId`, `isOwner`, `scheduleStatus` (none/draft/finalized) 상태를 실시간으로 공유하도록 설계.
- **API 데이터 변환:**
  - API 명세서에 맞춰 프론트엔드에서 데이터를 실시간으로 변환하는 로직 구현.
  - (예: `[[0,1]]` ↔ `[{day, hour}]`, `log.metric` ↔ `log.metric_label`)
- **동적 ID 처리:**
  - `localStorage`의 `myUserId`와 API 응답의 `owner.user_id`를 비교하여 방장/멤버 UI를 동적으로 렌더링.
  - `GET /metrics` API로 "항목 목록"을 받아와 로그 필터 버튼을 동적으로 생성.
