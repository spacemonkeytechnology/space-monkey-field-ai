create extension if not exists "pgcrypto";

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  question text,
  image_path text,
  image_url text,
  analysis jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Users can read their own jobs"
  on public.jobs
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own jobs"
  on public.jobs
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own jobs"
  on public.jobs
  for delete
  using (auth.uid() = user_id);

create index if not exists jobs_user_created_at_idx
  on public.jobs (user_id, created_at desc);

insert into storage.buckets (id, name, public)
values ('job-images', 'job-images', true)
on conflict (id) do nothing;

create policy "Users can view their job images"
  on storage.objects
  for select
  using (bucket_id = 'job-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their job images"
  on storage.objects
  for insert
  with check (bucket_id = 'job-images' and auth.uid()::text = (storage.foldername(name))[1]);
