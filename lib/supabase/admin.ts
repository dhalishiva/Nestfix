import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { browserSupabaseEnv } from './env';
export function createAdminClient() {
  const {url}=browserSupabaseEnv();
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing server-only SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
