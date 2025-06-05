import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('⚠️  Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes. Usando stub temporário.');
  client = createClient('https://placeholder.supabase.co', 'service-role-key');
} else {
  client = createClient(supabaseUrl, supabaseServiceRoleKey);
}

export const supabaseServer = client; 