# Criteria

여러 관점과 질문을 제안해 사용자의 철학적 사유를 돕는 플랫폼입니다.

## 제작 의의와 문제 정의

사람은 익숙한 관점과 전제 안에서 고민하기 때문에, 같은 질문을 반복하면서도 다른 방식으로 생각할 가능성을 놓치곤 합니다. Criteria는 질문에 담긴 전제와 여러 철학적 관점을 제안해, 사용자가 자신의 생각을 검토하고 사유를 이어갈 계기를 만드는 것을 목표로 합니다.

핵심 제안은 **“이 문제를 이런 관점에서도 생각해볼 수 있습니다”**입니다. 특정 관점을 정답으로 확정하거나, 사용자의 결정을 대신하거나, 반드시 결론에 도달하도록 요구하지 않습니다. 사용자는 제안에 동의하거나 반박하고, 판단을 유보할 수도 있습니다.

## 사유를 돕는 원칙

- **관점을 제안합니다.** 하나의 해석을 제시하되 그 관점이 설명하는 것과 남기는 질문을 함께 살펴봅니다.
- **전제를 탐색합니다.** 질문에 포함됐을 수 있는 믿음과 가정을 드러내되, 사용자의 숨은 의도나 가치관을 단정하지 않습니다.
- **가치의 긴장을 드러냅니다.** 선택으로 얻는 것과 포기하는 것, 서로 충돌하는 가치를 탐구합니다. 모든 고민을 선택지 평가로 환원하지 않습니다.
- **생각을 이어갈 여지를 남깁니다.** AI가 만든 기준을 수용하도록 요구하지 않고, 사용자가 자신의 언어로 수정·거부·확장하도록 돕습니다.
- **철학을 권위로 사용하지 않습니다.** 철학적 관점은 탐구의 렌즈이며, 유일한 정답이나 사용자를 설득하는 근거가 아닙니다.

예를 들어 “좋아하는 일을 직업으로 삼아야 할까?”라는 질문에는 다음처럼 접근할 수 있습니다.

> 좋아하는 일을 ‘즐거움을 유지하는 일’로 볼 수도 있지만, ‘어려움을 감수할 만큼 의미 있는 일을 선택하는 것’으로 볼 수도 있습니다. 두 관점에서 ‘좋아한다’는 말의 의미는 어떻게 달라질까요?

이 탐구는 직업 선택에 대한 최종 결론 없이도 의미가 있습니다.

## 목표와 현재 구현의 구분

위 내용은 제품이 지향하는 철학입니다. 현재 구현은 질문 하나를 입력받아 **문제 정의 → 조건 분리 → 관점 비교 → 트레이드오프 → 판단 기준 → 결론**의 고정된 6단계 결과를 생성합니다.

현재의 ‘판단 기준’과 ‘결론’ 단계가 사용자의 기준을 직접 형성하거나 후속 사유를 지원한다는 뜻은 아닙니다. 후속 구현에서는 이를 **되돌아볼 질문과 사용자의 생각 이어가기**에 맞게 검토해야 합니다. 이번 문서 변경은 화면 문구·API 프롬프트·응답 스키마를 변경하지 않습니다.

## 검증할 질문

아래 항목은 향후 검증할 가설이며, 확인된 효과가 아닙니다.

- 사용자가 이전에는 고려하지 않았던 관점이나 전제를 발견하는가?
- 제안된 관점의 한계를 살펴보고 동의·반박·유보하는 이유를 설명할 수 있는가?
- 결과를 읽은 뒤 자신의 질문을 새롭게 표현하거나 탐구를 이어가는가?

결정 속도나 결론 도출 여부만으로 가치를 평가하지 않습니다. 초기 대상과 사용 맥락은 추가 검증이 필요하며, 특정 직군의 프로젝트 관리 도구로 한정하지 않습니다.

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

## 배포 (Vercel)

1. 이 저장소를 GitHub에 푸시합니다.
2. Vercel에서 해당 저장소를 Import 합니다.
3. Vercel Project Settings -> Environment Variables에 아래 값을 설정합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (선택)
4. Supabase 마이그레이션을 순서대로 적용합니다.
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_thinking_system.sql`
5. env 저장 후 프로젝트를 다시 배포합니다.
