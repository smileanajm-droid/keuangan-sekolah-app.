import { createClient } from '@supabase/supabase-js'

// Masukkan URL dan Anon Key dari Supabase Anda di sini
const supabaseUrl = 'PASTE_URL_SUPABASE_ANDA'
const supabaseAnonKey = 'PASTE_ANON_KEY_SUPABASE_ANDA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
