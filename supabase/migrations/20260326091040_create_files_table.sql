create table public.files (
  id uuid primary key default gen_random_uuid(),

  user_id text not null, -- link to auth.users
  name text not null,
  size bigint,
  type text,

  path text not null, -- IMPORTANT (storage reference)
  download_url text,

  status text default 'uploaded', -- optional (processing state)

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);