# Criteria

A platform that offers perspectives and questions to support users' philosophical reflection.

## Purpose and Problem

People often approach a concern through familiar perspectives and assumptions, repeating a question without encountering other ways to think about it. Criteria aims to offer possible assumptions and philosophical perspectives so users can examine their thinking and continue their inquiry.

Its central invitation is **“You could also consider this question from this perspective.”** It does not establish one perspective as the correct answer, decide for the user, or require a final conclusion. Users may agree, challenge an interpretation, or suspend judgment.

## Principles for Reflection

- **Offer perspectives.** Explore both what an interpretation illuminates and the questions it leaves open.
- **Explore assumptions.** Surface beliefs that might be present without asserting the user's hidden motives or values.
- **Expose tensions between values.** Explore gains, sacrifices, and conflicting values without reducing every concern to a choice evaluation.
- **Leave room for further thought.** Invite users to revise, reject, or extend a proposed framework in their own words.
- **Do not use philosophy as authority.** Philosophical perspectives are lenses for inquiry, not definitive answers or tools to persuade users.

For example, “Should I turn something I love into a career?” could invite this reflection:

> Loving an activity might mean preserving its enjoyment, or finding it meaningful enough to endure its difficulties. How does the meaning of “love” change between these perspectives?

The inquiry can be valuable without reaching a career decision.

## Intended Philosophy and Current Implementation

The principles above describe the product's intended direction. The current implementation accepts one question and generates a fixed six-step response: **problem definition → condition isolation → perspective comparison → trade-offs → decision criteria → conclusion**.

The existing “decision criteria” and “conclusion” steps do not establish that users form their own criteria or can continue the inquiry within the product. Future implementation should review these steps in favor of **questions for reflection and space to continue the user's thinking**. This documentation change does not modify UI copy, API prompts, or response schemas.

## Questions to Validate

These are hypotheses for future validation, not demonstrated outcomes.

- Do users discover a perspective or assumption they had not previously considered?
- Can they identify a perspective's limits and explain why they agree, disagree, or suspend judgment?
- Do they reframe their question or continue exploring after reading the response?

Decision speed and reaching a conclusion are not sufficient measures of value. The initial audience and usage context still need validation; the product is not restricted to project management for a particular profession.

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

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. In Vercel Project Settings -> Environment Variables, set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional)
4. Ensure Supabase migrations are applied in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_thinking_system.sql`
5. Redeploy the project after env vars are saved.
