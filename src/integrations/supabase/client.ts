import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qnpoftjwfwzgxmuzqauc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucG9mdGp3Znd6Z3htdXpxYXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NjIxMDEsImV4cCI6MjA4NzEzODEwMX0.c2dv3P_Lc5iReTc7CJ8oKHAF4c3n_6BSuyeX2mvJoNI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);