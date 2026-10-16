-- ============================================================================
-- CDIN · Auth — staff roles via a profiles table + role helper
-- Run in: Supabase SQL Editor. Safe to re-run.
-- ============================================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text,
  role       text not null default 'voter'
             check (role in ('voter','officer','admin','superadmin')),
  officer_id text references public.officers(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- Returns the caller's role (or 'anon'); SECURITY DEFINER bypasses profiles RLS.
create or replace function public.cdin_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;

-- Auto-create a profile (default role 'voter') whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email), 'voter')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- After you create your first staff user (sign up in the app or in
-- Authentication → Users), promote it by email, e.g.:
--
--   update public.profiles set role = 'superadmin' where email = 'you@example.com';
--   update public.profiles set role = 'admin'      where email = 'admin@example.com';
--   update public.profiles set role = 'officer'    where email = 'officer@example.com';
-- ----------------------------------------------------------------------------
