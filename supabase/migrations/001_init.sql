create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_published_at on public.articles (published_at desc);
create index if not exists idx_articles_category on public.articles (category);
create index if not exists idx_articles_slug on public.articles (slug);
create index if not exists idx_articles_title_trgm on public.articles using gin (title gin_trgm_ops);
create index if not exists idx_articles_excerpt_trgm on public.articles using gin (excerpt gin_trgm_ops);
create index if not exists idx_articles_content_trgm on public.articles using gin (content gin_trgm_ops);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_articles_set_updated_at on public.articles;
create trigger trg_articles_set_updated_at
before update on public.articles
for each row
execute procedure public.set_updated_at();
