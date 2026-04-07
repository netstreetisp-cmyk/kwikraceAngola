import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 1. Auth Service
 * Logic: JWT verification, RBAC, session management.
 */
export const AuthService = {
  async verifySession(token: string) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return user;
  },

  async authorize(userId: string, requiredRole: string) {
    const { data: user } = await supabase.from('users').select('role').eq('id', userId).single();
    return user?.role === requiredRole;
  }
};

/**
 * 2. Partner Service (Tenants)
 * Logic: Settings, branding, status per tenant.
 */
export const PartnerService = {
  async getPartner(partnerId: string) {
    const { data } = await supabase.from('partners').select('*').eq('id', partnerId).single();
    return data;
  },

  async updateSettings(partnerId: string, settings: any) {
    const { data } = await supabase.from('partners').update({ settings }).eq('id', partnerId).select();
    return data?.[0];
  }
};

/**
 * 3. User Service (Profiles)
 * Logic: User data, account management.
 */
export const UserService = {
  async getProfile(userId: string) {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    return data;
  },

  async createClient(email: string, full_name: string, phone: string, partner_id: string) {
    const { data } = await supabase.from('users').insert([{ email, full_name, phone, role: 'client', partner_id }]).select();
    return data?.[0];
  }
};

/**
 * 4. Group Service (Racing Teams)
 * Logic: Registration, members, payment status.
 */
export const GroupService = {
  async registerGroup(partnerId: string, leader: { name: string, phone: string }, members: string[]) {
    const { data, error } = await supabase.from('groups').insert([{
      partner_id: partnerId,
      leader_name: leader.name,
      leader_phone: leader.phone,
      members,
      status: 'pending'
    }]).select();
    if (error) throw error;
    return data?.[0];
  },

  async updateStatus(groupId: string, status: string) {
    const { data } = await supabase.from('groups').update({ status }).eq('id', groupId).select();
    return data?.[0];
  }
};
