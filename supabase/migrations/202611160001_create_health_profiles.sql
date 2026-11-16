create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'trainer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "使用者只能讀取自己的帳號角色"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.create_student_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger create_profile_after_signup
  after insert on auth.users
  for each row
  execute function public.create_student_profile();

insert into public.profiles (user_id, role)
select id, 'student' from auth.users
on conflict (user_id) do nothing;

create table if not exists public.health_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  height_cm numeric not null check (height_cm between 50 and 250),
  weight_kg numeric not null check (weight_kg between 20 and 300),
  body_fat_percent numeric not null check (body_fat_percent between 1 and 75),
  age smallint not null check (age between 13 and 120),
  sex text not null check (sex in ('male', 'female')),
  activity_level text not null check (
    activity_level in ('sedentary', 'light', 'moderate', 'high', 'very_high')
  ),
  fitness_goal text not null check (
    fitness_goal in ('fat_loss', 'muscle_gain', 'maintenance')
  ),
  preferred_exercise_type text,
  dietary_restrictions text[] not null default '{}',
  dietary_other text,
  daily_calorie_target numeric check (daily_calorie_target is null or daily_calorie_target > 0),
  daily_carbohydrate_target numeric check (daily_carbohydrate_target is null or daily_carbohydrate_target > 0),
  daily_protein_target numeric check (daily_protein_target is null or daily_protein_target > 0),
  daily_fat_target numeric check (daily_fat_target is null or daily_fat_target > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dietary_restrictions_valid check (
    dietary_restrictions <@ array['vegetarian', 'vegan', 'dairy_free', 'gluten_free', 'halal', 'other']::text[]
  )
);

alter table public.health_profiles enable row level security;

create policy "學員只能讀取自己的健康檔案"
  on public.health_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "學員只能建立自己的健康檔案"
  on public.health_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "學員只能更新自己的健康檔案"
  on public.health_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_health_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_health_profiles_updated_at
  before update on public.health_profiles
  for each row
  execute function public.set_health_profile_updated_at();
