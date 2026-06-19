import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://qilcophrqwoxvosyjyyb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_PN8FQ0LoxrxP3-MO4ooGYQ_TlZhkGiR';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.includes('[REEMPLAZAR')) {
  console.warn('Configura SUPABASE_PUBLISHABLE_KEY en assets/js/config/supabase.js antes de desplegar.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
