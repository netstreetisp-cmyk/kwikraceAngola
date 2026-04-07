import { createClient } from '@supabase/supabase-js';

// Init Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 1. Auth Service (RBAC & Identity)
 */
export const AuthService = {
  async login(email: string, role: string) {
    const { data } = await supabase.from('users').select('*').eq('email', email).eq('role', role).single();
    return data;
  }
};

/**
 * 2. Partner Service (Tenant Isolation)
 */
export const PartnerService = {
  async getBySlug(slug: string) {
    const { data } = await supabase.from('partners').select('*').eq('slug', slug).single();
    return data;
  }
};

/**
 * 3. CRM & Contact Service (Marketing Ready)
 */
export const CRMService = {
  async syncGroupToContacts(partnerId: string, membersData: any[]) {
    const contacts = membersData.map(m => ({
      partner_id: partnerId,
      name: m.name,
      phone: m.phone,
      age: m.age,
      metadata: { source: 'registration_group' }
    }));
    const { error } = await supabase.from('contacts').upsert(contacts, { onConflict: 'partner_id,phone' });
    if (error) console.error('[CRM_ERROR] Falha ao sincronizar:', error.message);
  }
};

/**
 * 4. Group Service (ITEL ADMIN COMPLIANT)
 */
export const GroupService = {
  async submit(partnerId: string, leader: any, members: any[], terms: boolean, totalPrice: number) {
    if (!terms) throw new Error("É necessário aceitar os termos.");
    const { data: group } = await supabase.from('groups').insert([{
      partner_id: partnerId,
      leader_name: leader.name,
      leader_phone: leader.phone,
      members_data: members,
      terms_accepted: terms,
      total_price: totalPrice,
      status: 'pending'
    }]).select().single();
    await CRMService.syncGroupToContacts(partnerId, [...members, { name: leader.name, phone: leader.phone, age: leader.age }]);
    await supabase.from('audit_logs').insert([{
      partner_id: partnerId,
      service_name: 'registration',
      action: 'SUBMISSION',
      details: { leaderName: leader.name, membersCount: members.length }
    }]);
    return group;
  },

  async approve(partnerId: string, groupId: string) {
    const { data } = await supabase.from('groups').update({ 
      status: 'approved', 
      approved_at: new Date().toISOString() 
    }).eq('id', groupId).select().single();
    await supabase.from('audit_logs').insert([{
      partner_id: partnerId,
      service_name: 'staff',
      action: 'APPROVAL',
      details: { groupId, time: new Date().toLocaleTimeString() }
    }]);
    return data;
  },

  async reject(partnerId: string, groupId: string, reason: string) {
    const { data } = await supabase.from('groups').update({ 
      status: 'rejected', 
      rejected_at: new Date().toISOString(),
      rejection_reason: reason
    }).eq('id', groupId).select().single();
    await supabase.from('audit_logs').insert([{
      partner_id: partnerId,
      service_name: 'staff',
      action: 'REJECTION',
      details: { groupId, reason }
    }]);
    return data;
  }
};
