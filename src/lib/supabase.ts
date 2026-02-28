import { mockSupabase } from './mockSupabase';

// Switched to mockSupabase to allow offline demo accounts and local persistence
export const supabase = mockSupabase as any;
