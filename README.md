# 배포 주소 
https://manutd26.vercel.app/

# 🔴 MU-Tactics: Professional Guild Tactical Management System

> **맨체스터 유나이티드 길드를 위한 고성능 전술 분석 및 실시간 스쿼드 관리 플랫폼**

MU-Tactics는 길드 승리를 위해 실시간 전술 시뮬레이션, 영상 분석 아카이브, 그리고 길드원 간의 유기적인 피드백을 지원하는 **Next.js 기반 웹 플랫폼**입니다.

---

## 🚀 주요 기능 (Key Features)

### ⚽ 실시간 인터랙티브 전술판
* **Drag & Drop 시뮬레이션:** 우리 팀과 상대 팀 선수를 자유롭게 배치하여 전술 흐름을 시뮬레이션합니다.
* **실시간 자동 저장:** 선수 위치가 Supabase DB에 즉시 동기화되어 모든 길드원이 동일한 화면을 공유합니다.
* **스마트 드로잉 시스템:** 4색 펜과 지우개로 이동 경로를 작도하며, 데이터는 브라우저에 안전하게 보관됩니다.
* **원터치 초기화:** 버튼 하나로 선수들을 대기석과 구석으로 자동 정렬합니다.

### 📺 전술 분석 허브
* **영상 카테고리 아카이브:** 유튜브 링크 등록만으로 전술, 공격, 수비, 경기 영상 등을 체계적으로 관리합니다.
* **지능형 페이지네이션:** 영상이 많아져도 성능 저하 없이 페이지당 9개씩 효율적으로 로드합니다.
* **필터링 시스템:** 카테고리별로 원하는 영상을 즉시 찾아볼 수 있습니다.

### 💬 실시간 피드백 시스템
* **Layer형 댓글 UI:** 그리드 레이아웃을 해치지 않는 플로팅 레이어 방식의 댓글창을 구현했습니다.
* **피드백 CRUD:** 댓글 작성, 수정, 삭제 기능을 통해 자유로운 전술 토론이 가능합니다.
* **커스텀 디자인:** 다크 모드에 최적화된 슬림 스크롤바와 세련된 UI를 제공합니다.

---

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Deployment** | Vercel |

---

## 📂 프로젝트 구조 (Project Structure)

이미지 기반의 실제 폴더 구조입니다.
```text
MANUTD-TACTICS
├── app/
│   ├── manage-squad/   # 선수단 명단 관리 페이지
│   ├── squad/          # 실시간 전술판 (Drag & Drop, Drawing)
│   ├── tactics/        # 전술 영상 분석 및 댓글 시스템
│   ├── upload/         # 전술 영상 등록 페이지
│   ├── actions.ts      # Server Actions (DB 저장 로직)
│   ├── layout.tsx      # 전역 레이아웃 및 폰트 설정
│   └── page.tsx        # 메인 홈 페이지
├── components/
│   └── Navbar.tsx      # 전역 네비게이션 바
├── lib/
│   └── supabase.ts     # Supabase 클라이언트 설정
├── public/             # 로고 및 아이콘 리소스
└── .env.local          # 환경 변수 (Supabase API Key 등)
```

# 📦 설치 및 실행 방법

## 1. 저장소 복제 및 패키지 설치
```bash
git clone [https://github.com/your-username/manutd-tactics.git](https://github.com/your-username/manutd-tactics.git)
npm install
```

## 2. 환경 변수 설정
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 로컬 서버 구동
```bash
npm run dev
```

# 💡 개발 목표
이 프로젝트는 길드 운영의 전문성을 높이고, 전술 공유의 장벽을 낮추기 위해 개발되었습니다. 단순히 보는 전술이 아닌, 함께 그리고 소통하는 **실전 지향적 데이터베이스**를 지향합니다.

Glory Glory Man United! 🔴
