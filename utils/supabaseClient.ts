// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL não encontrada. Verifique se está no .env.local e se o servidor foi reiniciado.");
}
if (!supabaseAnonKey) {
  throw new Error("Chave anônima do Supabase não encontrada. Verifique se está no .env.local e se o servidor foi reiniciado.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);