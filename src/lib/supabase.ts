import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export type Role = 'client' | 'admin' | 'superadmin';

export interface Partner {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  settings: any;
}

export interface Group {
  id: string;
  partner_id: string;
  leader_name: string;
  leader_phone: string;
  members: string[];
  status: 'pending' | 'approved' | 'rejected' | 'in_queue' | 'racing' | 'finished';
  price_paid: number;
  created_at: string;
}

export interface Race {
  id: string;
  partner_id: string;
  group_id: string;
  status: 'active' | 'finished';
  started_at: string;
}
