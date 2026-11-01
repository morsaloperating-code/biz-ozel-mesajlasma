import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dqbnsdlkdarmmrcrqoug.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
if(!supabaseAnonKey) console.warn('Supabase anon key missing')
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
