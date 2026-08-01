-- EduNutrition — Supabase schema
-- Run via Supabase SQL editor or migrations. Requires pgcrypto/uuid-ossp for uuid_generate_v4().

create extension if not exists "uuid-ossp";

-- 1. Schools
create table schools (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  canton varchar(50),
  email varchar(255) unique,
  subscription_tier varchar(50) not null default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  student_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete set null,
  role varchar(50) not null check (role in ('admin', 'teacher', 'nurse', 'student')),
  first_name varchar(255),
  last_name varchar(255),
  created_at timestamptz default now()
);

-- 3. Modules
create table modules (
  id uuid primary key default uuid_generate_v4(),
  title varchar(255) not null,
  description text,
  level varchar(50) check (level in ('co', 'gymnasium', 'university')),
  category varchar(100),
  duration_minutes int,
  video_url varchar(500),
  created_by uuid references profiles(id) on delete set null,
  published boolean not null default false,
  created_at timestamptz default now()
);

-- 4. Lessons
create table lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references modules(id) on delete cascade,
  order_num int not null default 0,
  title varchar(255) not null,
  content text, -- markdown
  video_url varchar(500),
  created_at timestamptz default now()
);

-- 5. Quizzes
create table quizzes (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid not null unique references lessons(id) on delete cascade,
  questions jsonb not null default '[]', -- [{question, options: [a,b,c,d], correct: 0}, ...]
  created_at timestamptz default now()
);

-- 6. Progress
create table progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid references modules(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean not null default false,
  quiz_score float,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, lesson_id)
);

-- 7. Subscriptions
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references schools(id) on delete cascade,
  tier varchar(50) not null check (tier in ('free', 'pro', 'enterprise')),
  max_users int,
  max_modules int,
  price_monthly float,
  stripe_subscription_id varchar(255),
  active boolean not null default true,
  started_at timestamptz default now(),
  renews_at timestamptz
);

-- Indexes
create index idx_profiles_school_id on profiles(school_id);
create index idx_modules_level_category on modules(level, category);
create index idx_lessons_module_id on lessons(module_id);
-- quizzes.lesson_id already has an index via its unique constraint above.
create index idx_progress_user_id on progress(user_id);
create index idx_progress_module_id on progress(module_id);
create index idx_subscriptions_school_id on subscriptions(school_id);

-- ============================================================
-- Row Level Security
-- Multi-tenant model: a user only sees data scoped to their
-- own school (via profiles.school_id) or their own rows.
-- ============================================================

alter table schools enable row level security;
alter table profiles enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table quizzes enable row level security;
alter table progress enable row level security;
alter table subscriptions enable row level security;

-- Helper: current user's role/school, read via profiles row (no recursion since
-- policies below reference profiles by subquery, not by calling a SECURITY DEFINER fn).
create or replace function auth_profile_school_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select school_id from profiles where id = auth.uid();
$$;

create or replace function auth_profile_role()
returns varchar
language sql stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

-- schools: members can read their own school; only admins can update it
create policy schools_select_own on schools
  for select using (id = auth_profile_school_id());

create policy schools_update_admin on schools
  for update using (id = auth_profile_school_id() and auth_profile_role() = 'admin');

-- profiles: users read their own profile + profiles in their own school;
-- only admins can insert/update/delete profiles in their school
create policy profiles_select_self_or_school on profiles
  for select using (id = auth.uid() or school_id = auth_profile_school_id());

create policy profiles_update_self on profiles
  for update using (id = auth.uid());

create policy profiles_admin_manage on profiles
  for all using (school_id = auth_profile_school_id() and auth_profile_role() = 'admin');

-- modules: published modules are readable by any authenticated user;
-- unpublished modules only visible to their creator; admins/teachers/nurses can write
create policy modules_select_published on modules
  for select using (published = true or created_by = auth.uid());

create policy modules_write_staff on modules
  for all using (auth_profile_role() in ('admin', 'teacher', 'nurse'))
  with check (auth_profile_role() in ('admin', 'teacher', 'nurse'));

-- lessons: readable if parent module is readable; writable by staff
create policy lessons_select on lessons
  for select using (
    exists (
      select 1 from modules m
      where m.id = lessons.module_id
        and (m.published = true or m.created_by = auth.uid())
    )
  );

create policy lessons_write_staff on lessons
  for all using (auth_profile_role() in ('admin', 'teacher', 'nurse'))
  with check (auth_profile_role() in ('admin', 'teacher', 'nurse'));

-- quizzes: same visibility as parent lesson; writable by staff
create policy quizzes_select on quizzes
  for select using (
    exists (
      select 1 from lessons l
      join modules m on m.id = l.module_id
      where l.id = quizzes.lesson_id
        and (m.published = true or m.created_by = auth.uid())
    )
  );

create policy quizzes_write_staff on quizzes
  for all using (auth_profile_role() in ('admin', 'teacher', 'nurse'))
  with check (auth_profile_role() in ('admin', 'teacher', 'nurse'));

-- progress: users manage only their own rows; staff can read progress for
-- students in their own school (aggregated analytics use case)
create policy progress_own on progress
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy progress_staff_read_school on progress
  for select using (
    auth_profile_role() in ('admin', 'teacher', 'nurse')
    and exists (
      select 1 from profiles p
      where p.id = progress.user_id
        and p.school_id = auth_profile_school_id()
    )
  );

-- subscriptions: only visible/editable by admins of that school
create policy subscriptions_admin_only on subscriptions
  for all using (school_id = auth_profile_school_id() and auth_profile_role() = 'admin')
  with check (school_id = auth_profile_school_id() and auth_profile_role() = 'admin');
