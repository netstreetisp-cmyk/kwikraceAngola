import { EventEmitter } from 'events';
import axios from 'axios';
import { supabase } from './core';

// Event-driven engine (internal messaging)
const eventBus = new EventEmitter();

// SMS HUB AUTH CACHE
let cachedToken: string | null = null;
let tokenExpiry: Date | null = null;

/**
 * 5. Queue Service (FIFO per Partner)
 * Logic: Sequential execution, priority management.
 */
export const QueueService = {
  async getNextInLine(partnerId: string, currentQueuePosition: number) {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('status', 'approved')
      .gt('queue_position', currentQueuePosition)
      .order('queue_position', { ascending: true })
      .limit(1);
    return data?.[0];
  }
};

/**
 * 6. Racing Engine (Single Track Awareness)
 */
export const RacingEngine = {
  async startRace(partnerId: string, groupId: string) {
    const { count: activeCount } = await supabase
      .from('races')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', partnerId)
      .eq('status', 'active');

    if (activeCount && activeCount > 0) throw new Error("A pista já tem uma corrida ativa.");

    const { data: group } = await supabase.from('groups').select('*').eq('id', groupId).single();
    if (!group) throw new Error("Grupo não encontrado.");

    await supabase.from('groups').update({ status: 'racing' }).eq('id', groupId);

    const { data: race } = await supabase.from('races').insert([{
      partner_id: partnerId,
      group_id: groupId,
      status: 'active',
      started_at: new Date().toISOString()
    }]).select().single();

    await supabase.from('audit_logs').insert([{
      partner_id: partnerId,
      service_name: 'racing',
      action: 'START_RACE',
      details: { groupId, leader_name: group.leader_name }
    }]);

    eventBus.emit('race_started', { partnerId, group });
    return race;
  }
};

/**
 * 7. Notification Service (SMS HUB Protocol - FINAL SYNC)
 * Implements Token Authentication & JSON POST delivery per docs.
 */
export const NotificationService = {
  async getAuthToken() {
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) return cachedToken;
    const authId = process.env.VITE_SMSHUB_AUTH_ID;
    const secretKey = process.env.VITE_SMSHUB_SECRET_KEY;
    const baseUrl = "https://app.smshubangola.com/api";
    try {
      const response = await axios.post(`${baseUrl}/authentication`, { authId, secretKey });
      if (response.data.status === 200) {
        cachedToken = response.data.data.authToken;
        tokenExpiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        return cachedToken;
      }
      return null;
    } catch (e) {
      console.error('[SMSHUB_AUTH_ERROR]', e);
      return null;
    }
  },

  async sendSMS(phones: string[], message: string) {
    const token = await this.getAuthToken();
    if (!token) return false;
    const senderId = process.env.VITE_SMSHUB_SENDER_ID || "SMSHUB";
    try {
      const response = await axios.post(`https://app.smshubangola.com/api/sendsms`, {
        contactNo: phones,
        message: message,
        from: senderId
      }, {
        headers: { "accessToken": token }
      });
      return response.data.status === 200;
    } catch (error) {
      console.error(`[SMS_ERROR]`, error);
      return false;
    }
  },

  async getBalance() {
    const token = await this.getAuthToken();
    if (!token) return 0;
    try {
      const response = await axios.get("https://app.smshubangola.com/api/balance", {
        headers: { "accessToken": token }
      });
      return response.data.data || 0;
    } catch (e) { return 0; }
  },

  async notifyGroup(membersData: any[], message: string) {
    const phones = membersData.map(m => m.phone).filter(p => !!p);
    if (phones.length > 0) return await this.sendSMS(phones, message);
    return false;
  }
};

// Event Listeners
eventBus.on('race_started', async ({ partnerId, group }) => {
  const messageEntering = `KwikRace: É a vossa vez! Dirijam-se para a pista agora para a corrida.`;
  await NotificationService.notifyGroup(group.members_data, messageEntering);

  const nextGroup = await QueueService.getNextInLine(partnerId, group.queue_position);
  if (nextGroup) {
    const messageNext = `KwikRace: Atenção! Só falta uma corrida para a vossa vez. Preparem-se no Pit Lane.`;
    await NotificationService.notifyGroup(nextGroup.members_data, messageNext);
  }
});

/**
 * 8. Price Service (DYNAMIC WEEKDAY TRACKER)
 */
export const PriceService = {
  async getPriceForToday(partnerId: string) {
    const today = new Date().getDay(); // 0-6
    const { data } = await supabase
      .from('daily_pricing')
      .select('price_per_runner')
      .eq('partner_id', partnerId)
      .eq('day_of_week', today)
      .single();
    return data?.price_per_runner || 0;
  }
};
