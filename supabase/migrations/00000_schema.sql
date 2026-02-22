-- Set up Manamki Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (You and Her)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipes
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  image_url text,
  ingredients jsonb[] not null default '{}',
  steps jsonb[] not null default '{}',
  ai_tags jsonb not null default '[]',
  health_score int check (health_score >= 1 and health_score <= 10),
  categories jsonb not null default '[]',
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pantry Items
create table public.pantry_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  quantity numeric,
  unit text,
  expiry_date date,
  added_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cooked Entries ("Made it!")
create table public.cooked_entries (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) not null,
  rating int check (rating >= 1 and rating <= 5),
  photos text[] default '{}',
  voice_transcript text,
  notes text,
  cooked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Collections
create table public.collections (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipe Collections (Many-to-Many)
create table public.recipe_collections (
  recipe_id uuid references public.recipes(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  primary key (recipe_id, collection_id)
);

-- Shopping List Items
create table public.shopping_list_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  quantity numeric,
  unit text,
  aisle text,
  is_checked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.pantry_items enable row level security;
alter table public.cooked_entries enable row level security;
alter table public.comments enable row level security;
alter table public.collections enable row level security;
alter table public.recipe_collections enable row level security;
alter table public.shopping_list_items enable row level security;

-- Policies (We assume only two users exist in auth.users and both have access to everything)
create policy "Allow all access to authenticated users" on public.profiles for all to authenticated using (true) with check (true);
create policy "Allow all access to authenticated users" on public.recipes for all to authenticated using (true) with check (true);
create policy "Allow all access to authenticated users" on public.pantry_items for all to authenticated using (true) with check (true);
create policy "Allow all access to authenticated users" on public.cooked_entries for all to authenticated using (true) with check (true);
create policy "Allow all access to authenticated users" on public.comments for all to authenticated using (true) with check (true);
create policy "Allow all access to authenticated users" on public.collections for all to authenticated using (true) with check (true);
create policy "Allow all access to authenticated users" on public.recipe_collections for all to authenticated using (true) with check (true);
create policy "Allow all access to authenticated users" on public.shopping_list_items for all to authenticated using (true) with check (true);
