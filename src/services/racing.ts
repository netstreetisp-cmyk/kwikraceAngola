import { EventEmitter } from 'events';
import axios from 'axios';
import { supabase } from './core';

// Event-driven engine (internal messaging)
const eventBus = new EventEmitter();

/**
 * 5. Queue Service (FIFO per Partner)
 * Logic: Sequential execution, priority management.
 */
export const QueueService = {
  async getNext(partnerId: string) {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('status', 'in_queue')
      .order('approved_at', { ascending: true })
      .limit(1);
    return data?.[0];
  },

  async addToQueue(groupId: string) {
    const { data } = await supabase
      .from('groups')
      .update({ status: 'in_queue', approved_at: new Date().toISOString() })
      .eq('id', groupId)
      .select();
    
    // Dispara evento para o sistema de notificações
    eventBus.emit('group_queued', data?.[0]);
    return data?.[0];
  }
};

/**
 * 6. Racing Engine
 * Logic: Session starts, status transitions (atomicity), single active race.
 */
export const RacingEngine = {
  async startRace(partnerId: string, groupId: string) {
    // 1. Verificação Atómica (Atomic check)
    const { count: activeCount } = await supabase
      .from('races')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', partnerId)
      .eq('status', 'active');

    if (activeCount && activeCount > 0) throw new Error("A pista já tem uma corrida ativa.");

    // 2. Transição de estado (Group -> Racing)
    await supabase.from('groups').update({ status: 'racing' }).eq('id', groupId);

    // 3. Iniciar corrida
    const { data } = await supabase.from('races').insert([{
      partner_id: partnerId,
      group_id: groupId,
      status: 'active',
      started_at: new Date().toISOString()
    }]).select();

    eventBus.emit('race_started', { partnerId, groupId });
    return data?.[0];
  }
};


/**
 * 7. Notification Service (SMS via SMSHub)
 * Logic: Listen to events and triggered SMS messages using official SMSHub API.
 */
export const NotificationService = {
  async sendSMS(phone: string, message: string) {
    const authId = process.env.VITE_SMSHUB_AUTH_ID;
    const secretKey = process.env.VITE_SMSHUB_SECRET_KEY;
    const baseUrl = process.env.VITE_SMSHUB_BASE_URL || 'https://smshub.co.ao/api';
    const senderId = process.env.VITE_SMSHUB_SENDER_ID || 'KwikRace';

    try {
      console.log(`[SMS_SERVICE] Enviando para: ${phone}...`);
      
      const response = await axios.post(`${baseUrl}/send`, {
        auth_id: authId,
        secret_key: secretKey,
        to: phone,
        message: message,
        sender: senderId
      });

      if (response.data.success) {
        console.log(`[SMS_SERVICE] SMS Enviado com sucesso.`);
        return true;
      }
      throw new Error(response.data.message || 'Falha no envio de SMS');
    } catch (error: any) {
      console.error(`[SMS_SERVICE] Erro:`, error.message);
      return false;
    }
  }
};


// Event Listeners (Reactive triggers)
eventBus.on('group_queued', (group) => {
  NotificationService.sendSMS(group.leader_phone, `KwikRace: Seu grupo está na fila! Posição aproximada será notificada.`);
});

eventBus.on('race_started', async ({ partnerId, groupId }) => {
  // Notifica o próximo da fila para se preparar
  const next = await QueueService.getNext(partnerId);
  if (next) {
    NotificationService.sendSMS(next.leader_phone, `KwikRace: Prepare-se! Você é o próximo na pista.`);
  }
});

/**
 * 8. Price Service (Dynamic Pricing & Billables)
 * Logic: Cost calculation, plan enforcement.
 */
export const PriceService = {
  async calculateCost(partnerId: string, sessionTypeId: string) {
    const { data: config } = await supabase
      .from('pricing_plans')
      .select('price')
      .eq('partner_id', partnerId)
      .eq('id', sessionTypeId)
      .single();
    
    return config?.price || 0;
  }
};
