# Criteria

Beyond Answers, Build Your Criteria.

## Languages

- English: `README.md`
- 한국어: `README.ko.md`

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (PostgreSQL)
- OpenAI API

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)

4. Run:

```bash
npm run dev
```

## Database Setup (Supabase)

Run migrations in order:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_thinking_system.sql`

## Implemented MVP Features

- Structured Paper UI with minimalist blueprint styling
- Dedicated input workspace (`/input`) with progressive disclosure results
- Perspective comparison (balanced grid) and tradeoff ledger (price-of-choice)
- Focus mode for distraction-free result reading
- Public post library (`/articles`) and admin CMS (`/admin`)
- AI question structuring API (`/api/ai/structure`) with strict 6-step schema
- AI log persistence (`ai_logs`) and admin promotion path to posts

## Notes

- If Supabase is not configured, read endpoints use seeded sample posts.
- Admin write operations and AI log persistence require service-role access.
- `OPENAI_MODEL` defaults to `gpt-4o`.
