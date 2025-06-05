// utils/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  // Durante o build local ou testes, as variáveis podem não existir.
  // Para evitar que a aplicação quebre, criamos um client de "stub".
  console.warn(
    '⚠️  Variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas. Usando valores placeholder temporários.'
  );
  client = createClient('https://placeholder.supabase.co', 'public-anon-key');
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;