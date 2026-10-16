-- ============================================================================
-- CDIN — Civic Integrity Blockchain Voting · Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================================

-- ---------- Tables ----------------------------------------------------------

create table if not exists public.elections (
  id          text primary key,
  title       text not null,
  type        text not null,
  region      text not null default 'National',
  status      text not null default 'draft'
              check (status in ('draft','scheduled','active','closed')),
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.candidates (
  id          text primary key,
  election_id text not null references public.elections(id) on delete cascade,
  name        text not null,
  party       text not null,
  party_abbr  text not null,
  color       text not null default '#0a8754',
  manifesto   text default ''
);

create table if not exists public.polling_units (
  id                text primary key,
  code              text not null,
  name              text not null,
  region            text not null,
  ward              text not null,
  registered_voters integer not null default 0,
  officer_id        text
);

create table if not exists public.officers (
  id              text primary key,
  name            text not null,
  email           text not null,
  polling_unit_id text references public.polling_units(id) on delete set null,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists public.voters (
  id              text primary key,            -- VIN
  name            text not null,
  email           text not null default '',
  phone           text not null default '',
  nin             text not null default '',
  address         text not null default '',
  photo_url       text,
  polling_unit_id text references public.polling_units(id) on delete set null,
  region          text not null,
  status          text not null default 'registered'
                  check (status in ('registered','verified','voted')),
  biometric_hash  text default '',
  verified_at     timestamptz,
  verified_method text check (verified_method in ('id_card','biometric','qr_code')),
  voted_at        timestamptz
);

create table if not exists public.unit_tallies (
  unit_id       text primary key references public.polling_units(id) on delete cascade,
  registered    integer not null default 0,
  accredited    integer not null default 0,
  vote_cast     integer not null default 0,   -- "cast" is reserved in SQL
  encrypted     integer not null default 0,
  per_candidate jsonb   not null default '{}'::jsonb,
  validation    text    not null default 'validated'
                check (validation in ('validated','pending','flagged'))
);

create table if not exists public.blocks (
  index        integer primary key,
  timestamp    timestamptz not null default now(),
  type         text not null check (type in ('genesis','vote','election','candidate','system')),
  prev_hash    text not null,
  hash         text not null unique,
  nonce        integer not null default 0,
  summary      text not null default '',
  payload_hash text not null default ''
);

create table if not exists public.votes (
  id              text primary key,
  election_id     text references public.elections(id) on delete cascade,
  candidate_id    text references public.candidates(id) on delete set null,
  anon_token      text not null,
  polling_unit_id text references public.polling_units(id) on delete set null,
  region          text not null,
  block_hash      text not null,
  block_index     integer not null,
  timestamp       timestamptz not null default now()
);

create table if not exists public.fraud_alerts (
  id          text primary key,
  type        text not null,
  title       text not null,
  description text not null default '',
  severity    text not null check (severity in ('low','medium','high','critical')),
  risk_score  integer not null default 0,
  scope       text not null default '',
  status      text not null default 'open'
              check (status in ('open','reviewing','confirmed','dismissed')),
  detected_at timestamptz not null default now(),
  metric      text default ''
);

create table if not exists public.audit (
  id        text primary key,
  timestamp timestamptz not null default now(),
  actor     text not null,
  action    text not null,
  detail    text default '',
  severity  text not null default 'info'
            check (severity in ('info','success','warning','critical'))
);

-- Helpful indexes
create index if not exists idx_candidates_election on public.candidates(election_id);
create index if not exists idx_votes_election on public.votes(election_id);
create index if not exists idx_votes_unit on public.votes(polling_unit_id);
create index if not exists idx_voters_unit on public.voters(polling_unit_id);
create index if not exists idx_audit_ts on public.audit(timestamp desc);

-- ---------- Row Level Security ---------------------------------------------
-- DEMO policies: public read everywhere, and writes allowed with the anon key
-- so the client app works immediately. HARDEN before any real election by
-- replacing the write policies with auth.role()-based rules.

alter table public.elections     enable row level security;
alter table public.candidates    enable row level security;
alter table public.polling_units enable row level security;
alter table public.officers      enable row level security;
alter table public.voters        enable row level security;
alter table public.unit_tallies  enable row level security;
alter table public.blocks        enable row level security;
alter table public.votes         enable row level security;
alter table public.fraud_alerts  enable row level security;
alter table public.audit         enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'elections','candidates','polling_units','officers','voters',
    'unit_tallies','blocks','votes','fraud_alerts','audit'
  ]
  loop
    execute format('drop policy if exists "demo_read_%1$s" on public.%1$s;', t);
    execute format('drop policy if exists "demo_write_%1$s" on public.%1$s;', t);
    execute format(
      'create policy "demo_read_%1$s" on public.%1$s for select using (true);', t);
    execute format(
      'create policy "demo_write_%1$s" on public.%1$s for all using (true) with check (true);', t);
  end loop;
end$$;

-- Realtime (optional): stream live changes to the dashboards.
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.unit_tallies;
alter publication supabase_realtime add table public.fraud_alerts;
alter publication supabase_realtime add table public.audit;
alter publication supabase_realtime add table public.blocks;
