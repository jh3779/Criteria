create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_ko text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.categories (slug, name, name_ko, sort_order)
values
  ('choice', 'Choice', '선택', 10),
  ('regret', 'Regret', '후회', 20),
  ('growth', 'Growth', '성장', 30),
  ('relationship', 'Relationship', '관계', 40),
  ('pain', 'Pain', '고통', 50),
  ('human-ai', 'Human / AI', '인간 / AI', 60)
on conflict (slug) do update
set
  name = excluded.name,
  name_ko = excluded.name_ko,
  sort_order = excluded.sort_order;

create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  locale text not null default 'en',
  model text not null,
  response_json jsonb not null,
  status text not null default 'generated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_ai_logs_status check (status in ('generated', 'promoted', 'archived'))
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  source_ai_log_id uuid references public.ai_logs(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  is_public boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_logs
add column if not exists promoted_post_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ai_logs_promoted_post_id_fkey'
  ) then
    alter table public.ai_logs
    add constraint ai_logs_promoted_post_id_fkey
    foreign key (promoted_post_id)
    references public.posts(id)
    on delete set null;
  end if;
end;
$$;

create index if not exists idx_posts_published_at on public.posts (published_at desc);
create index if not exists idx_posts_category_id on public.posts (category_id);
create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_posts_is_public on public.posts (is_public);
create index if not exists idx_posts_title_trgm on public.posts using gin (title gin_trgm_ops);
create index if not exists idx_posts_excerpt_trgm on public.posts using gin (excerpt gin_trgm_ops);
create index if not exists idx_posts_content_trgm on public.posts using gin (content gin_trgm_ops);
create index if not exists idx_ai_logs_status on public.ai_logs (status);
create index if not exists idx_ai_logs_created_at on public.ai_logs (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_posts_set_updated_at on public.posts;
create trigger trg_posts_set_updated_at
before update on public.posts
for each row
execute procedure public.set_updated_at();

drop trigger if exists trg_ai_logs_set_updated_at on public.ai_logs;
create trigger trg_ai_logs_set_updated_at
before update on public.ai_logs
for each row
execute procedure public.set_updated_at();

drop trigger if exists trg_categories_set_updated_at on public.categories;
create trigger trg_categories_set_updated_at
before update on public.categories
for each row
execute procedure public.set_updated_at();

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'articles'
  ) then
    insert into public.posts (
      title,
      slug,
      excerpt,
      content,
      category_id,
      published_at,
      created_at,
      updated_at,
      is_public
    )
    select
      a.title,
      a.slug,
      a.excerpt,
      a.content,
      c.id,
      a.published_at,
      a.created_at,
      a.updated_at,
      true
    from public.articles a
    join public.categories c on c.slug = a.category
    on conflict (slug) do nothing;
  end if;
end;
$$;
