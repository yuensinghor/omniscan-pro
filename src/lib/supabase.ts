import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://lfvpknapbzplcxrqqhbp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdnBrbmFwYnpwbGN4cnFxaGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjUxMTAsImV4cCI6MjA4NjUwMTExMH0.7UzJaLnt81mgmlhHpd085Jz-fT-nqNgFOhsl3HFujB8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
