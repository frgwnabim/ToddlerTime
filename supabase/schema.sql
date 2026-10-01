-- =====================================================================
-- ToddlerTime: skema database Supabase
-- ---------------------------------------------------------------------
-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang (idempotent).
--
-- Video, channel, dan produk TIDAK disimpan di sini: tetap dari data/*.json.
--   video_id   = Video.id dari data/videos.json, mis. "yt_EWZDDYbbvAM"
--   channel_id = Channel.id YouTube asli, mis. "UCxxxxxxxxxxxxxxxxxxxxxx"
--
-- Keamanan (Row Level Security):
--   - Setiap tabel: user hanya bisa membaca & menulis datanya sendiri.
--   - Pengecualian publik: komentar (dibaca semua orang), serta JUMLAH
--     reaction dan subscriber lewat fungsi agregat (siapa yang like /
--     subscribe tetap privat).
-- =====================================================================


-- ---------------------------------------------------------------------
-- Utilitas
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- profiles: satu baris per akun orang tua
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 50),
  avatar_url   text check (avatar_url is null or avatar_url ~ '^https://'),
  created_at   timestamptz not null default now()
);

-- Buat profile otomatis saat user mendaftar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
        'Ayah/Bunda'
      ),
      50
    ),
    case
      when new.raw_user_meta_data ->> 'avatar_url' like 'https://%'
        then new.raw_user_meta_data ->> 'avatar_url'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Isi profile untuk user yang sudah ada sebelum skema ini dijalankan.
insert into public.profiles (id, display_name)
select
  u.id,
  left(
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
      'Ayah/Bunda'
    ),
    50
  )
from auth.users u
on conflict (id) do nothing;


-- ---------------------------------------------------------------------
-- subscriptions: channel yang diikuti
-- ---------------------------------------------------------------------

create table if not exists public.subscriptions (
  user_id    uuid not null references auth.users (id) on delete cascade,
  channel_id text not null check (channel_id ~ '^UC[A-Za-z0-9_-]{22}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, channel_id)
);

create index if not exists subscriptions_channel_id_idx on public.subscriptions (channel_id);


-- ---------------------------------------------------------------------
-- video_reactions: 1 = suka, -1 = tidak suka (satu reaction per video)
-- ---------------------------------------------------------------------

create table if not exists public.video_reactions (
  user_id    uuid not null references auth.users (id) on delete cascade,
  video_id   text not null check (video_id ~ '^yt_[A-Za-z0-9_-]{11}$'),
  value      smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index if not exists video_reactions_video_id_idx on public.video_reactions (video_id);

drop trigger if exists video_reactions_set_updated_at on public.video_reactions;
create trigger video_reactions_set_updated_at
  before update on public.video_reactions
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- comments: maksimal 300 karakter
-- ---------------------------------------------------------------------

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  video_id   text not null check (video_id ~ '^yt_[A-Za-z0-9_-]{11}$'),
  content    text not null check (char_length(trim(content)) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists comments_video_id_created_at_idx on public.comments (video_id, created_at desc);
create index if not exists comments_user_id_idx on public.comments (user_id);

-- Tolak komentar berkata kasar, juga bila ditulis langsung lewat API.
-- Daftar kata mengikuti lib/profanity.ts (filter di aplikasi lebih lengkap).
create or replace function public.comments_block_profanity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  normalized text := translate(lower(new.content), '013457@$!', 'oieastasi');
begin
  if normalized ~ '\m(bangsat|bajingan|kontol|memek|ngentot|entot|jancok|jancuk|goblok|goblog|tolol|kampret|keparat|brengsek|bacot|pantek|lonte|pelacur|bencong|sialan|fuck|shit|bitch|bastard|asshole|motherfuck|cunt|pussy|whore|slut|retard|nigger|nigga|faggot)'
     or normalized ~ '\m(tai|taik|asu|bego|dungu|idiot|dick|fag|wtf|stfu)\M' then
    raise exception 'Komentar mengandung kata yang kurang baik.' using errcode = 'check_violation';
  end if;
  new.content := trim(new.content);
  return new;
end;
$$;

drop trigger if exists comments_block_profanity on public.comments;
create trigger comments_block_profanity
  before insert or update on public.comments
  for each row execute function public.comments_block_profanity();


-- ---------------------------------------------------------------------
-- watch_later & favorites
-- ---------------------------------------------------------------------

create table if not exists public.watch_later (
  user_id    uuid not null references auth.users (id) on delete cascade,
  video_id   text not null check (video_id ~ '^yt_[A-Za-z0-9_-]{11}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table if not exists public.favorites (
  user_id    uuid not null references auth.users (id) on delete cascade,
  video_id   text not null check (video_id ~ '^yt_[A-Za-z0-9_-]{11}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);


-- ---------------------------------------------------------------------
-- watch_history: posisi terakhir per video
-- ---------------------------------------------------------------------

create table if not exists public.watch_history (
  user_id               uuid not null references auth.users (id) on delete cascade,
  video_id              text not null check (video_id ~ '^yt_[A-Za-z0-9_-]{11}$'),
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  updated_at            timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index if not exists watch_history_user_updated_idx on public.watch_history (user_id, updated_at desc);

drop trigger if exists watch_history_set_updated_at on public.watch_history;
create trigger watch_history_set_updated_at
  before update on public.watch_history
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- parental_settings: satu baris per akun (null = tidak dibatasi)
-- ---------------------------------------------------------------------

create table if not exists public.parental_settings (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  daily_limit_minutes    integer check (daily_limit_minutes is null or daily_limit_minutes between 5 and 600),
  bedtime_start          time,
  bedtime_end            time,
  break_reminder_minutes integer check (break_reminder_minutes is null or break_reminder_minutes between 5 and 180),
  -- Hash PIN (jangan pernah menyimpan PIN mentah).
  pin_hash               text,
  updated_at             timestamptz not null default now(),
  check ((bedtime_start is null) = (bedtime_end is null))
);

-- Percobaan PIN (dikelola server dengan service role).
alter table public.parental_settings add column if not exists pin_failed_attempts integer not null default 0;
alter table public.parental_settings add column if not exists pin_locked_until timestamptz;
-- Penanda publik "PIN sudah dibuat" tanpa membuka hash-nya.
alter table public.parental_settings
  add column if not exists has_pin boolean generated always as (pin_hash is not null) stored;

drop trigger if exists parental_settings_set_updated_at on public.parental_settings;
create trigger parental_settings_set_updated_at
  before update on public.parental_settings
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- screen_time: total detik menonton per hari (tanggal zona Asia/Jakarta)
-- ---------------------------------------------------------------------

create table if not exists public.screen_time (
  user_id         uuid not null references auth.users (id) on delete cascade,
  date            date not null,
  seconds_watched integer not null default 0 check (seconds_watched between 0 and 86400),
  primary key (user_id, date)
);

-- Kelonggaran dari orang tua untuk hari itu (hanya diubah server setelah PIN benar).
alter table public.screen_time add column if not exists bonus_minutes integer not null default 0
  check (bonus_minutes between 0 and 600);
alter table public.screen_time add column if not exists unlocked boolean not null default false;
alter table public.screen_time add column if not exists override_until timestamptz;

-- Tambah detik menonton (delta) untuk hari ini/kemarin. Hanya bisa menambah.
create or replace function public.add_screen_time(p_date date, p_seconds integer)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Jakarta')::date;
  total integer;
begin
  if p_seconds is null or p_seconds < 0 or p_seconds > 900 then
    raise exception 'Nilai detik tidak valid' using errcode = 'check_violation';
  end if;
  if p_date is null or p_date not between today - 1 and today then
    raise exception 'Tanggal tidak valid' using errcode = 'check_violation';
  end if;

  insert into public.screen_time (user_id, date, seconds_watched)
  values ((select auth.uid()), p_date, p_seconds)
  on conflict (user_id, date) do update
    set seconds_watched = least(86400, public.screen_time.seconds_watched + excluded.seconds_watched)
  returning seconds_watched into total;
  return total;
end;
$$;

revoke all on function public.add_screen_time(date, integer) from public, anon;
grant execute on function public.add_screen_time(date, integer) to authenticated;


-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles          enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.video_reactions   enable row level security;
alter table public.comments          enable row level security;
alter table public.watch_later       enable row level security;
alter table public.favorites         enable row level security;
alter table public.watch_history     enable row level security;
alter table public.parental_settings enable row level security;
alter table public.screen_time       enable row level security;

-- profiles: hanya pemilik (insert dilakukan trigger).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- comments: dibaca publik, ditulis & dihapus hanya oleh pemilik.
drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments
  for select to anon, authenticated using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Tabel milik pribadi: select/insert/update/delete hanya oleh pemilik.
do $$
declare
  t text;
begin
  foreach t in array array[
    'subscriptions', 'video_reactions', 'watch_later', 'favorites',
    'watch_history', 'parental_settings', 'screen_time'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      t || '_select_own', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      t || '_insert_own', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      t || '_update_own', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      t || '_delete_own', t
    );
  end loop;
end;
$$;


-- =====================================================================
-- Hak akses kolom: kontrol orang tua
-- ---------------------------------------------------------------------
-- RLS membatasi BARIS; ini membatasi KOLOM. Dari browser (role
-- authenticated), orang tua hanya bisa MEMBACA pengaturan (tanpa pin_hash)
-- dan MENAMBAH detik menonton. Mengubah pengaturan, PIN, tambahan waktu,
-- dan buka kunci hanya lewat Server Action (service role) setelah PIN benar,
-- jadi si kecil tidak bisa melewati batas lewat API.
-- =====================================================================

revoke all on public.parental_settings from anon, authenticated;
grant select (
  user_id, daily_limit_minutes, bedtime_start, bedtime_end,
  break_reminder_minutes, has_pin, updated_at
) on public.parental_settings to authenticated;

revoke all on public.screen_time from anon, authenticated;
grant select on public.screen_time to authenticated;
grant insert (user_id, date, seconds_watched) on public.screen_time to authenticated;
grant update (seconds_watched) on public.screen_time to authenticated;


-- =====================================================================
-- Fungsi baca publik (agregat, tanpa membuka data per user)
-- =====================================================================

-- Jumlah suka & tidak suka sebuah video.
create or replace function public.get_video_reaction_counts(p_video_id text)
returns table (likes bigint, dislikes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*) filter (where value = 1)  as likes,
    count(*) filter (where value = -1) as dislikes
  from public.video_reactions
  where video_id = p_video_id;
$$;

-- Jumlah subscriber ToddlerTime sebuah channel.
create or replace function public.get_channel_subscriber_count(p_channel_id text)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) from public.subscriptions where channel_id = p_channel_id;
$$;

-- Komentar sebuah video + nama & avatar penulis (profil lain tetap privat).
create or replace function public.get_video_comments(p_video_id text, p_limit integer default 50)
returns table (
  id            uuid,
  user_id       uuid,
  video_id      text,
  content       text,
  created_at    timestamptz,
  author_name   text,
  author_avatar text
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.user_id, c.video_id, c.content, c.created_at, p.display_name, p.avatar_url
  from public.comments c
  left join public.profiles p on p.id = c.user_id
  where c.video_id = p_video_id
  order by c.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;

revoke all on function public.get_video_reaction_counts(text) from public;
revoke all on function public.get_channel_subscriber_count(text) from public;
revoke all on function public.get_video_comments(text, integer) from public;
grant execute on function public.get_video_reaction_counts(text) to anon, authenticated;
grant execute on function public.get_channel_subscriber_count(text) to anon, authenticated;
grant execute on function public.get_video_comments(text, integer) to anon, authenticated;

-- Fungsi trigger tidak boleh dipanggil langsung lewat API.
revoke all on function public.handle_new_user() from public, anon, authenticated;
