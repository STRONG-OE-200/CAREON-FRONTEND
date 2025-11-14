# CareOn (돌봄온)

> 가족 간병인을 위한 실시간 스케줄 협업 서비스

[Main Schedule Screenshot]
_(핵심 기능 스크린샷 1~2장)_

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

<br />

---

## 🚀 향후 개발 계획 (Future Plans)

현재 핵심 기능인 스케줄 협업을 완성했으며, 다음과 같은 기능들을 추가하여 서비스를 고도화할 예정입니다.

- **간병 로그 (Log):**
  - 환자의 상태(식사, 투약, 특이사항)를 멤버들이 실시간으로 기록하고 공유하는 '디지털 간병 일지' 기능을 구현할 예정입니다.
- **캘린더 (Calendar):**
  - 간병 관련 일정을 월별 캘린더 뷰로 한눈에 볼 수 있는 기능을 추가할 계획입니다.
- **챗봇 (Chatbot):**
  - 간병 관련 정책, 멘탈 케어, 안내를 챗봇 형태로 제공하는 기능을 추가할 계획입니다.

---

<br />

## 🛠️ 기술 스택

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context (`useContext`), `localStorage`
- **API Client:** Axios
- **Deployment:** Vercel

<br />

## 💡 핵심 트러블슈팅

- **상태 동기화 & 캐시 버그 해결:**
  - 방 생성/스케줄 확정 직후, UI가 갱신되지 않는 **"오래된 정보(Stale State)"** 버그 발생.
  - `window.location.href` (강제 새로고침), `usePathname` (Context 재호출), API URL 캐시 버스터(`&_t=...`) 등을 적용하여 **Next.js/Vercel의 데이터 캐시** 문제 해결.
- **전역 상태 관리 설계:**
  - `React Context` (`RoomContext`)를 도입하여, 여러 페이지와 레이아웃(Layout, Page, Sidebar)이 `roomId`, `isOwner`, `scheduleStatus` (none/draft/finalized) 상태를 실시간으로 공유하도록 설계.
- **API 데이터 변환:**
  - `[[0,1]]` (UI 그리드) ↔ `[{day, hour}]` (API `slots` 배열)
  - `[[{isCareNeeded: true}]]` (API 객체 그리드) → `[[0,1]]` (UI 숫자 그리드)
  - API 명세서에 맞춰 프론트엔드에서 데이터를 실시간으로 변환하는 로직 구현.
