-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now(),
  family_size int not null default 2,
  weekly_budget text not null default '$100',
  max_cook_time int not null default 30,
  cuisine_preference text not null default 'mixed',
  dietary_needs text[] default '{}',
  preferred_store text default 'instacart',
  onboarding_complete boolean default false,
  stripe_customer_id text,
  subscription_status text default 'free' -- free | trialing | active | canceled
);

-- Meal plans
create table public.meal_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now(),
  week_start date not null,
  meals jsonb not null,           -- array of 5 meal objects
  grocery_list jsonb not null,    -- organized by category
  total_estimated_cost numeric,
  instacart_link text
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view own meal plans"
  on public.meal_plans for select using (auth.uid() = user_id);

create policy "Users can insert own meal plans"
  on public.meal_plans for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
