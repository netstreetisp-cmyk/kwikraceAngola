import { supabase } from './core';

/**
 * 9. Logs/Auditory Service
 * Logic: Audit trails per tenant, imutability.
 */
export const AuditService = {
  async log(partnerId: string, userId: string, service: string, action: string, details: any = {}) {
    const { data } = await supabase.from('audit_logs').insert([{
      partner_id: partnerId,
      user_id: userId,
      service_name: service,
      action,
      details,
      created_at: new Date().toISOString()
    }]).select();
    return data?.[0];
  },

  async getAudit(partnerId: string) {
    const { data } = await supabase.from('audit_logs').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
    return data;
  }
};

/**
 * 10. CRM/Contacts Service
 * Logic: History, contact tracking, marketing segments.
 */
export const CRMService = {
  async trackContact(partnerId: string, name: string, phone: string, email: string = '') {
    const { data, error } = await supabase.from('contacts').upsert({
      partner_id: partnerId,
      name,
      phone,
      email,
      last_interaction: new Date().toISOString()
    }, { onConflict: 'phone, partner_id' }).select();
    return data?.[0];
  },

  async getDashboard(partnerId: string) {
    const { data } = await supabase.from('contacts').select('*').eq('partner_id', partnerId).limit(50);
    return data;
  }
};

/**
 * 11. Analytics Service (Global & Partner)
 * Logic: Global dashboards, revenue monitoring across tenants.
 */
export const AnalyticsService = {
  async getPartnerStats(partnerId: string) {
    const { data: races } = await supabase.from('daily_stats').select('*').eq('partner_id', partnerId).order('date', { ascending: false });
    return races;
  },

  async getGlobalStats() {
    // Total aggregated stats (for SuperAdmin)
    const { data: totalPartners } = await supabase.from('partners').select('*', { count: 'exact', head: true });
    const { data: revenue } = await supabase.from('daily_stats').select('total_revenue');
    
    return {
      total_tenants: totalPartners || 0,
      total_revenue: (revenue || []).reduce((acc: number, cur: any) => acc + (cur.total_revenue || 0), 0)
    };
  }
};
