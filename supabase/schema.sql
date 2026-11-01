
-- BIZ OZEL MESAJLASMA - SUPABASE SCHEMA (FREE)
-- Bunu Supabase SQL Editor'da calistir

-- Profiller (2 kisi icin)
create table if not exists profiles (
  id text primary key, -- 'ben' ve 'test' veya uuid
  name text not null,
  avatar_url text,
  bio text default 'Müsait 💬',
  status text default 'online',
  updated_at timestamp with time zone default now()
);

-- Mesajlar
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id text not null, -- 'ben' veya 'test'
  text text,
  type text default 'text', -- text, image, video, audio, file
  media_url text,
  file_name text,
  file_size int,
  reply_to uuid references messages(id),
  reaction jsonb, -- {emoji: '❤️', count: 1}
  edited boolean default false,
  created_at timestamp with time zone default now()
);

-- RLS kapat (ozel app, sadece 2 kisi, free icin basit)
alter table profiles enable row level security;
alter table messages enable row level security;

drop policy if exists "allow all" on profiles;
create policy "allow all" on profiles for all using (true) with check (true);

drop policy if exists "allow all" on messages;
create policy "allow all" on messages for all using (true) with check (true);

-- Realtime ac
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table profiles;

-- Storage bucket icin (Dashboard > Storage > New bucket: media, public)
-- Bucket: media (public)

-- Baslangic profilleri
insert into profiles (id, name, bio) values 
('ben', 'Ben', 'Müsait 💬'),
('test', 'Test', 'Müsait 💬')
on conflict (id) do nothing;
