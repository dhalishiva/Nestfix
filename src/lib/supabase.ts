import { createClient } from '@supabase/supabase-js';

// Public values. The anon key is meant for browsers; Row Level Security and
// server-side functions decide what each user can read or change.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://qbishtwkusrjffpfpbnf.supabase.co';
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiaXNodHdrdXNyamZmcGZwYm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNDMzMjksImV4cCI6MjEwOTgxOTMyOX0.e2_gc38DGZJNJOe1fdzYH9A0d_2sfy2lniKJK-py1qA';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
});

/** Turns a Supabase/Postgres error into a sentence a customer can act on. */
export function errMsg(e: unknown): string {
  const m = (e as { message?: string })?.message || String(e || '');
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Could not reach Nestfix. Check your internet connection and try again.';
  if (/Invalid login credentials/i.test(m)) return 'That email and password do not match. Try again or reset your password.';
  if (/Email not confirmed/i.test(m)) return 'Confirm your email first. We sent a link to your inbox.';
  if (/User already registered/i.test(m)) return 'An account with this email already exists. Log in instead.';
  if (/rate limit/i.test(m)) return 'Too many attempts. Wait a minute and try again.';
  if (/Password should be at least/i.test(m)) return 'Use a password with at least 6 characters.';
  if (/JWT|token/i.test(m) && /expired/i.test(m)) return 'Your session expired. Log in again.';
  return m || 'Something went wrong. Please try again.';
}
