-- Add Kroger OAuth token fields to profiles
alter table public.profiles
  add column if not exists kroger_access_token text,
  add column if not exists kroger_refresh_token text,
  add column if not exists kroger_token_expires_at timestamptz;
