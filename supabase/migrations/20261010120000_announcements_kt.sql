-- =====================================================================
-- KulaTam Restaurant - announcements shown under the bell icon
--
-- Run AFTER 20261010000000_kulatam_menu_kt.sql (it reuses admins_kt,
-- is_admin_kt() and set_updated_at_kt() from that migration).
--
-- Anyone can read announcements that are published and currently live.
-- Only users listed in admins_kt can create, edit or delete them.
-- Safe to re-run.
-- =====================================================================

begin;

create table if not exists public.announcements_kt (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 80),
  body         text check (char_length(body) <= 280),
  link_url     text check (link_url is null or link_url ~* '^https?://'),
  starts_at    timestamptz not null default now(),
  ends_at      timestamptz,
  is_published boolean not null default true,
  created_by   uuid default auth.uid() references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint announcements_kt_window check (ends_at is null or ends_at > starts_at)
);

create index if not exists announcements_kt_live_idx
  on public.announcements_kt (starts_at desc) where is_published;

drop trigger if exists set_updated_at_kt on public.announcements_kt;
create trigger set_updated_at_kt before update on public.announcements_kt
  for each row execute function public.set_updated_at_kt();

alter table public.announcements_kt enable row level security;

grant select on public.announcements_kt to anon, authenticated;
grant insert, update, delete on public.announcements_kt to authenticated;

drop policy if exists "announcements_kt: public read live" on public.announcements_kt;
create policy "announcements_kt: public read live" on public.announcements_kt
  for select to anon, authenticated
  using (
    (is_published and starts_at <= now() and (ends_at is null or ends_at > now()))
    or (select public.is_admin_kt())
  );

drop policy if exists "announcements_kt: admin write" on public.announcements_kt;
create policy "announcements_kt: admin write" on public.announcements_kt
  for all to authenticated
  using ((select public.is_admin_kt()))
  with check ((select public.is_admin_kt()));

commit;
