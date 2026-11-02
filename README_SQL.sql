-- FULL ONLINE MURY SQL
create table if not exists profiles (id uuid references auth.users primary key, username text, email text, avatar_url text, bio text, is_online boolean default false, created_at timestamp default now());
create table if not exists messages (id uuid primary key default gen_random_uuid(), sender_id uuid, receiver_id uuid, content text, type text default 'text', media_url text, is_read boolean default false, reaction jsonb, created_at timestamp default now());
create table if not exists friendships (id uuid primary key default gen_random_uuid(), user_id uuid, friend_id uuid, status text default 'pending', created_at timestamp default now());
create table if not exists blocked_users (user_id uuid, blocked_id uuid, primary key (user_id, blocked_id));
insert into storage.buckets (id,name,public) values ('avatars','avatars',true) on conflict do nothing;
insert into storage.buckets (id,name,public) values ('media','media',true) on conflict do nothing;
alter table profiles enable row level security;
alter table messages enable row level security;
alter table friendships enable row level security;
alter table blocked_users enable row level security;
drop policy if exists "public read" on profiles; create policy "public read" on profiles for select using (true);
drop policy if exists "update own" on profiles; create policy "update own" on profiles for update using (auth.uid()=id);
drop policy if exists "insert own" on profiles; create policy "insert own" on profiles for insert with check (auth.uid()=id);
drop policy if exists "read messages" on messages; create policy "read messages" on messages for select using (true);
drop policy if exists "insert messages" on messages; create policy "insert messages" on messages for insert with check (true);
drop policy if exists "update messages" on messages; create policy "update messages" on messages for update using (true);
