-- Secure the portfolio admin data model.
-- Run this migration in Supabase SQL editor or with `supabase db push`.
-- After creating an Auth user for the admin, add that user's UUID:
-- insert into public.admin_users (user_id) values ('00000000-0000-0000-0000-000000000000');

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Helper used by the frontend to verify admin access and by RLS policies below.
-- SECURITY DEFINER lets policies check admin membership without exposing write access
-- to the admin_users table itself.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Admin membership is readable only by the signed-in user for their own account.
drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- No insert/update/delete policies are created for admin_users on purpose.
-- Manage admin membership from the Supabase dashboard/SQL editor/service role only.

alter table public.projects enable row level security;
alter table public.project_images enable row level security;

-- Public portfolio pages can still read projects and galleries.
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
on public.projects
for select
to anon, authenticated
using (true);

drop policy if exists "project_images_public_read" on public.project_images;
create policy "project_images_public_read"
on public.project_images
for select
to anon, authenticated
using (true);

-- Only approved admins can create, edit, or delete projects.
drop policy if exists "projects_admin_insert" on public.projects;
create policy "projects_admin_insert"
on public.projects
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "projects_admin_update" on public.projects;
create policy "projects_admin_update"
on public.projects
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "projects_admin_delete" on public.projects;
create policy "projects_admin_delete"
on public.projects
for delete
to authenticated
using (public.is_admin());

-- Only approved admins can create, edit, or delete project gallery images.
drop policy if exists "project_images_admin_insert" on public.project_images;
create policy "project_images_admin_insert"
on public.project_images
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "project_images_admin_update" on public.project_images;
create policy "project_images_admin_update"
on public.project_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "project_images_admin_delete" on public.project_images;
create policy "project_images_admin_delete"
on public.project_images
for delete
to authenticated
using (public.is_admin());
