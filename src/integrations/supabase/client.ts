
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lddftkbniprmmorgmttq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZGZ0a2JuaXBybW1vcmdtdHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxODAzMDcsImV4cCI6MjA2Mzc1NjMwN30.janpKc2nqmMwKsFp0t9lLYJS3AggKTLN5Ni79x11EjY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
