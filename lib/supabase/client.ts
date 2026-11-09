'use client';
import { createBrowserClient } from '@supabase/ssr';
import { browserSupabaseEnv } from './env';
export function createClient() {
  const { url, key } = browserSupabaseEnv();
  return createBrowserClient(url, key);
}
