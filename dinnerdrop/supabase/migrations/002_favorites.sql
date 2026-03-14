-- Favorites table
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  meal_name text not null,
  meal_data jsonb not null,
  created_at timestamptz default now()
);

alter table public.favorites enable row level security;

create policy "Users can manage own favorites"
  on public.favorites for all using (auth.uid() = user_id);
