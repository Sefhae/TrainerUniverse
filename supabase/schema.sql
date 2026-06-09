-- ============================================================================
-- TrainerUniverse — Supabase schema + Row Level Security (RLS)
-- ============================================================================
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → New query →
-- paste everything → Run. It is idempotent (safe to re-run).
--
-- Auth model: Supabase Auth (auth.users) owns email + password. The app-side
-- `users` table keeps role + an `auth_id` that links back to auth.users. Every
-- other table is unchanged from the original Postgres schema and still uses
-- integer ids, so the rest of the app keeps working without a data redesign.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists users (
  id         serial primary key,
  auth_id    uuid unique references auth.users(id) on delete cascade,
  email      text unique not null,
  role       text not null default 'trainer',
  created_at timestamptz not null default now()
);

create table if not exists trainer_profiles (
  id               serial primary key,
  user_id          integer not null references users(id) on delete cascade,
  name             text not null,
  tagline          text not null default '',
  bio              text not null default '',
  profile_photo    text not null default '',
  cover_photo      text not null default '',
  location         text not null default '',
  is_remote        integer not null default 0,
  years_experience integer not null default 0,
  availability     text not null default '[]',
  is_published     integer not null default 1,
  is_verified      integer not null default 0,
  response_time    text not null default 'within 24 hours',
  created_at       timestamptz not null default now()
);

create table if not exists specialties (
  id   serial primary key,
  name text unique not null
);

create table if not exists trainer_specialties (
  trainer_id   integer not null references trainer_profiles(id) on delete cascade,
  specialty_id integer not null references specialties(id) on delete cascade,
  primary key (trainer_id, specialty_id)
);

create table if not exists pricing_packages (
  id          serial primary key,
  trainer_id  integer not null references trainer_profiles(id) on delete cascade,
  name        text not null,
  description text not null default '',
  sessions    integer not null default 1,
  price       double precision not null default 0,
  is_popular  integer not null default 0
);

create table if not exists previous_work (
  id            serial primary key,
  trainer_id    integer not null references trainer_profiles(id) on delete cascade,
  photo         text not null default '',
  student_name  text not null default '',
  goal          text not null default '',
  duration      text not null default '',
  description   text not null default '',
  display_order integer not null default 0,
  is_visible    integer not null default 1
);

create table if not exists reviews (
  id            serial primary key,
  trainer_id    integer not null references trainer_profiles(id) on delete cascade,
  reviewer_name text not null,
  rating        integer not null,
  comment       text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists certifications (
  id         serial primary key,
  trainer_id integer not null references trainer_profiles(id) on delete cascade,
  name       text not null,
  issuer     text not null default '',
  year       integer
);

create table if not exists student_profiles (
  id            serial primary key,
  user_id       integer not null unique references users(id) on delete cascade,
  name          text not null,
  profile_photo text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists trainer_students (
  trainer_id  integer not null references trainer_profiles(id) on delete cascade,
  student_id  integer not null references student_profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (trainer_id, student_id)
);

create table if not exists training_sessions (
  id           serial primary key,
  trainer_id   integer not null references trainer_profiles(id) on delete cascade,
  student_id   integer not null references student_profiles(id) on delete cascade,
  title        text not null default 'Training Session',
  scheduled_at text not null,
  duration_min integer not null default 60,
  status       text not null default 'confirmed',
  notes        text not null default '',
  created_at   timestamptz not null default now()
);

create table if not exists session_change_requests (
  id           serial primary key,
  session_id   integer not null references training_sessions(id) on delete cascade,
  requested_by text not null,
  proposed_at  text not null,
  message      text not null default '',
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);

create table if not exists messages (
  id         serial primary key,
  trainer_id integer not null references trainer_profiles(id) on delete cascade,
  student_id integer not null references student_profiles(id) on delete cascade,
  sender     text not null,
  content    text not null,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id         serial primary key,
  name       text not null,
  email      text not null,
  subject    text not null default '',
  message    text not null,
  created_at timestamptz not null default now()
);

create table if not exists session_requests (
  id         serial primary key,
  trainer_id integer not null references trainer_profiles(id) on delete cascade,
  student_id integer not null references student_profiles(id) on delete cascade,
  package_id integer references pricing_packages(id) on delete set null,
  message    text not null default '',
  status     text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists student_removal_requests (
  id         serial primary key,
  trainer_id integer not null references trainer_profiles(id) on delete cascade,
  student_id integer not null references student_profiles(id) on delete cascade,
  reason     text not null default '',
  status     text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------
-- IMPORTANT: this is a permissive STARTER policy set so the app works end to
-- end immediately. Fine-grained authorization (e.g. "a trainer may only edit
-- their own packages") is still enforced in the API route code, exactly as it
-- was before. Tighten these policies before a real production launch.
--
-- Pattern used below:
--   • Public marketplace tables  → anyone (anon) may SELECT; only logged-in
--     (authenticated) users may write.
--   • Private / app tables       → only logged-in users may read & write.
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
  public_read text[] := array[
    'trainer_profiles','specialties','trainer_specialties','pricing_packages',
    'previous_work','reviews','certifications'
  ];
  private_tbl text[] := array[
    'users','student_profiles','trainer_students','training_sessions',
    'session_change_requests','messages','session_requests','student_removal_requests'
  ];
begin
  -- Enable RLS everywhere
  foreach t in array (public_read || private_tbl || array['contact_messages']) loop
    execute format('alter table %I enable row level security', t);
  end loop;

  -- Public-read tables: anon+authenticated may read; authenticated may write.
  foreach t in array public_read loop
    execute format($f$drop policy if exists "%1$s_read" on %1$I$f$, t);
    execute format($f$create policy "%1$s_read" on %1$I for select to anon, authenticated using (true)$f$, t);
    execute format($f$drop policy if exists "%1$s_write" on %1$I$f$, t);
    execute format($f$create policy "%1$s_write" on %1$I for all to authenticated using (true) with check (true)$f$, t);
  end loop;

  -- Private tables: authenticated only.
  foreach t in array private_tbl loop
    execute format($f$drop policy if exists "%1$s_all" on %1$I$f$, t);
    execute format($f$create policy "%1$s_all" on %1$I for all to authenticated using (true) with check (true)$f$, t);
  end loop;

  -- contact form: anyone may submit; only logged-in users may read.
  execute 'drop policy if exists "contact_insert" on contact_messages';
  execute 'create policy "contact_insert" on contact_messages for insert to anon, authenticated with check (true)';
  execute 'drop policy if exists "contact_read" on contact_messages';
  execute 'create policy "contact_read" on contact_messages for select to authenticated using (true)';

  -- reviews: a visitor can leave a review without an account (matches the app),
  -- so allow anon INSERT in addition to the authenticated write policy above.
  execute 'drop policy if exists "reviews_insert_anon" on reviews';
  execute 'create policy "reviews_insert_anon" on reviews for insert to anon with check (true)';
end $$;

-- ---------------------------------------------------------------------------
-- Seed: the built-in specialty list (safe to re-run)
-- ---------------------------------------------------------------------------
insert into specialties (name) values
  ('Strength Training'),('Weight Loss'),('Bodybuilding'),('Functional Training'),
  ('HIIT'),('Yoga'),('Pilates'),('CrossFit'),('Powerlifting'),('Olympic Lifting'),
  ('Nutrition'),('Sports Performance'),('Rehabilitation'),('Mobility'),
  ('Senior Fitness'),('Pre/Post Natal'),('Boxing'),('Running'),('Cycling'),('Swimming')
on conflict (name) do nothing;
