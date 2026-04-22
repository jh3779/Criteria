# Criteria

정답 대신 판단 기준을 세우는 사고 구조화 플랫폼입니다.

## 언어

- English: `README.md`
- 한국어: `README.ko.md`

## 기술 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (PostgreSQL)
- OpenAI API

## 빠른 시작

1. 의존성 설치:

```bash
npm install
```

2. 환경 변수 파일 복사:

```bash
cp .env.example .env.local
```

3. `.env.local` 값 채우기:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (선택)

4. 실행:

```bash
npm run dev
```

## 데이터베이스 설정 (Supabase)

Supabase SQL Editor에서 아래 순서로 실행하세요.

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_thinking_system.sql`

## 구현된 MVP 기능

- Structured Paper 스타일 UI
- 입력 전용 워크스페이스 (`/input`)와 단계별 결과 노출
- 관점 비교 2열 그리드 + 선택의 대가(Trade-off Ledger) 시각화
- 결과 집중 모드(Focus Mode)
- 공개 포스트 라이브러리 (`/articles`)와 관리자 CMS (`/admin`)
- 6단계 강제 스키마 기반 AI 구조화 API (`/api/ai/structure`)
- `ai_logs` 저장 및 관리자 승격 경로(로그 -> 공개 포스트)

## 참고

- Supabase 설정이 없으면 읽기 API는 샘플 포스트를 사용합니다.
- 관리자 쓰기 및 AI 로그 저장에는 service role key가 필요합니다.
- `OPENAI_MODEL` 기본값은 `gpt-4o`입니다.
