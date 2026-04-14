create table if not exists public.prayer_records (
  user_id uuid not null references auth.users (id) on delete cascade,
  date_key text not null,
  prayers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, date_key)
);

create or replace function public.set_prayer_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists prayer_records_set_updated_at on public.prayer_records;

create trigger prayer_records_set_updated_at
before update on public.prayer_records
for each row
execute function public.set_prayer_records_updated_at();

alter table public.prayer_records enable row level security;

drop policy if exists "Users can view their own prayer records" on public.prayer_records;
create policy "Users can view their own prayer records"
on public.prayer_records
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own prayer records" on public.prayer_records;
create policy "Users can insert their own prayer records"
on public.prayer_records
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own prayer records" on public.prayer_records;
create policy "Users can update their own prayer records"
on public.prayer_records
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own prayer records" on public.prayer_records;
create policy "Users can delete their own prayer records"
on public.prayer_records
for delete
using (auth.uid() = user_id);
