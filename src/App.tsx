import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Timer, Settings, LayoutDashboard, Plus, CheckCircle2, 
  XCircle, Bell, Flag, ChevronRight, MapPin, CreditCard, History, 
  ShieldCheck, Rocket, BarChart3, Activity, Globe, LogIn, Store, 
  Trash2, AlertCircle, RefreshCw, Layers, Calendar, ChevronLeft, Search, 
  FileText, Zap, MousePointer2, UserCheck, ShieldAlert, UserPlus, Eye, Clock, Download, X
} from 'lucide-react';
import { cn } from './lib/utils';
import { supabase } from './services/core';
import { GroupService } from './services/core';
import { RacingEngine, NotificationService, PriceService } from './services/racing';

type ViewType = 
  | 'landing' | 'register' | 'confirmation' | 'notif_status'
  | 'admin_dash' | 'admin_pending' | 'admin_active' | 'admin_logs' | 'admin_price';

export default function App() {
  const [view, setView] = useState<ViewType>('landing');
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
       const { data } = await supabase.from('partners').select('*').eq('slug', 'speedway-luanda').single();
       setPartner(data || { name: 'Kwikrace', id: 'sl-01' });
       setLoading(false);
    }
    init();
  }, []);

  const navigate = (v: ViewType) => setView(v);
  const isAdmin = view.startsWith('admin');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse"><Rocket size={32} className="text-primary" /></div>;

  return (
    <div className={cn("min-h-screen flex flex-col font-body bg-[#f8fafc]", !isAdmin && "bg-white")}>
      
      {/* 🟢 HEADER - KWIKRACE */}
      <header className="h-20 bg-white border-b border-slate-100 flex justify-between items-center px-8 z-[100] fixed top-0 w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('landing')}>
          <div className="bg-[#1a1a1a] p-2.5 rounded-xl"><Rocket size={20} className="text-white" /></div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">KWIKRACE</h1>
        </div>

        <div className="flex items-center gap-4">
           {isAdmin && <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full text-[10px] font-black text-slate-400 border border-slate-100">OPERADOR</div>}
           <button onClick={() => navigate(isAdmin ? 'landing' : 'admin_dash')} className="bg-white border-2 border-primary/10 text-primary text-[10px] font-black px-6 py-2.5 rounded-xl uppercase shadow-sm">
              {isAdmin ? 'SAIR' : 'STAFF'}
           </button>
        </div>
      </header>

      {/* 🟢 MAIN */}
      <main className={cn("flex-1 w-full", isAdmin ? "pt-28 pb-20 px-8 max-w-[1600px] mx-auto" : "pt-24 px-4")}>
          {renderContent(view, navigate, partner)}
      </main>

      {/* MOBILE NAV (CLIENT) */}
      {!isAdmin && <nav className="fixed bottom-0 w-full z-10 bg-white border-t border-slate-100 h-20 flex justify-around items-center md:hidden"><NavBtn active={view === 'landing'} onClick={() => navigate('landing')} icon={<LayoutDashboard size={20}/>} label="Home" /><NavBtn active={view === 'notif_status'} onClick={() => navigate('notif_status')} icon={<Timer size={20}/>} label="Fila" /><NavBtn active={view === 'admin_dash'} onClick={() => navigate('admin_dash')} icon={<Settings size={20}/>} label="Staff" /></nav>}
    </div>
  );
}

function renderContent(view: ViewType, navigate: (v: ViewType) => void, partner: any) {
  switch (view) {
    case 'landing': return <ClientHome onRegister={() => navigate('register')} partner={partner} />;
    case 'register': return <ClientRegister onComplete={() => navigate('confirmation')} partner={partner} />;
    case 'confirmation': return <ClientConfirmation onStatus={() => navigate('notif_status')} />;
    case 'notif_status': return <ClientQueue partner={partner} />;
    case 'admin_dash': return <AdminDashboard navigate={navigate} partner={partner} tab="participants" />;
    case 'admin_pending': return <AdminDashboard navigate={navigate} partner={partner} tab="participants" />;
    case 'admin_active': return <AdminDashboard navigate={navigate} partner={partner} tab="live" />;
    case 'admin_logs': return <AdminDashboard navigate={navigate} partner={partner} tab="audit" />;
    case 'admin_price': return <AdminDashboard navigate={navigate} partner={partner} tab="price" />;
    default: return <ClientHome onRegister={() => navigate('register')} partner={partner} />;
  }
}

function NavBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1", active ? "text-primary px-4 py-2 bg-primary/5 rounded-xl" : "text-slate-300")}>
      {icon} <span className="text-[8px] font-bold uppercase">{label}</span>
    </button>
  );
}

// --- CLIENT VIEWS ---

function ClientHome({ onRegister, partner }: any) {
  const [price, setPrice] = useState(0);
  useEffect(() => { PriceService.getPriceForToday(partner.id).then(setPrice); }, [partner.id]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
      <Rocket size={64} className="text-primary animate-pulse" />
      <div className="space-y-4">
         <h2 className="text-5xl font-black text-slate-800 uppercase italic">KWIKRACE</h2>
         <p className="text-slate-400 font-bold text-sm uppercase tracking-widest italic">Corrida de Karting.</p>
      </div>
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-2 border-slate-50 w-full max-w-sm">
         <h3 className="text-4xl font-black text-slate-800 italic">{price.toLocaleString()},00</h3>
         <button onClick={onRegister} className="w-full h-18 bg-primary text-white rounded-2xl font-black italic tracking-widest uppercase mt-8 text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">INSCREVER</button>
      </div>
    </div>
  );
}

function ClientRegister({ onComplete, partner }: any) {
  const [pilots, setPilots] = useState([{ name: '', phone: '', age: '' }]);
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const todayPrice = await PriceService.getPriceForToday(partner.id);
      await GroupService.submit(partner.id, pilots[0], pilots.slice(1), terms, pilots.length * todayPrice);
      onComplete();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-10 py-6">
      <h2 className="text-3xl font-black text-slate-800 uppercase italic underline decoration-primary decoration-4">Inscrição</h2>
      <div className="space-y-4">
        {pilots.map((p, i) => (
          <div key={i} className="itel-card relative pt-10">
             <div className="absolute top-4 left-6 text-[10px] font-black text-slate-300 uppercase">Piloto {i+1}</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={p.name} placeholder="Nome" onChange={e=>{const n=[...pilots];n[i].name=e.target.value;setPilots(n)}} className="bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" />
                <input value={p.phone} placeholder="Telefone" onChange={e=>{const n=[...pilots];n[i].phone=e.target.value;setPilots(n)}} className="bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" />
             </div>
          </div>
        ))}
        <button onClick={() => setPilots([...pilots, { name: '', phone: '', age: '' }])} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[35px] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-primary transition-all">+ Adicionar</button>
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] space-y-8 shadow-2xl">
           <label className="flex gap-4 cursor-pointer"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} className="w-6 h-6 rounded text-primary" /><p className="text-[10px] font-bold opacity-60">Aceito os termos.</p></label>
           <button disabled={!terms || loading} onClick={handleSend} className="w-full h-16 bg-primary rounded-2xl font-black uppercase text-sm shadow-xl shadow-primary/20">{loading ? 'ENVIANDO...' : 'RESERVAR'}</button>
        </div>
      </div>
    </div>
  );
}

function ClientConfirmation({ onStatus }: any) {
  return (
    <div className="text-center py-24 space-y-10 max-w-sm mx-auto">
       <CheckCircle2 size={72} className="mx-auto text-primary" />
       <h2 className="text-4xl font-black italic uppercase">Sucesso!</h2>
       <button onClick={onStatus} className="bg-primary text-white w-full h-16 rounded-2xl font-black uppercase shadow-xl shadow-primary/20">VER FILA</button>
    </div>
  );
}

function ClientQueue({ partner }: any) {
  const [queue, setQueue] = useState<any[]>([]);
  useEffect(() => { supabase.from('groups').select('*').eq('partner_id', partner.id).eq('status', 'approved').order('queue_position').then(({data})=>setQueue(data||[])); }, [partner.id]);
  return (
    <div className="max-w-md mx-auto py-10 space-y-10">
       <div className="bg-slate-900 text-white p-12 rounded-[50px] shadow-3xl text-center border-b-8 border-primary">
          <p className="text-[10px] font-black text-primary uppercase mb-1">Status</p>
          <h3 className="text-4xl font-black italic uppercase">KWIKRACE</h3>
       </div>
       <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-slate-300 ml-4">Próximos</h4>
          {queue.map((g, i) => (
             <div key={g.id} className="bg-white p-6 rounded-[35px] flex items-center gap-8 shadow-sm border border-slate-50">
                <p className="text-3xl font-black italic text-slate-100 italic">#0{i+1}</p>
                <div><h4 className="text-sm font-black uppercase italic tracking-tight">{g.leader_name}</h4><p className="text-[9px] font-bold text-slate-300 uppercase">Aguardando</p></div>
             </div>
          ))}
       </div>
    </div>
  );
}

// --- STAFF VIEWS ---

function AdminDashboard({ navigate, partner, tab }: any) {
  const [stats, setStats] = useState({ pending: 0, active: 0, total: 0 });
  const [balance, setBalance] = useState<number | string>('...');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    async function load() {
       const { count: p } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).eq('status', 'pending');
       const { count: a } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).eq('status', 'approved');
       const { count: t } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id);
       const bal = await NotificationService.getBalance();
       const prc = await PriceService.getPriceForToday(partner.id);
       setStats({ pending: p || 0, active: a || 0, total: t || 0 });
       setBalance(bal);
       setPrice(prc);
    }
    load();
  }, [partner.id]);

  return (
    <div className="space-y-8">
      
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Inscritos" val={stats.total} icon={<Users className="text-primary"/>} />
         <StatCard label="Ativos" val={stats.active} icon={<Rocket className="text-success"/>} />
         <StatCard label="Pendentes" val={stats.pending} icon={<Clock className="text-warning"/>} />
         <StatCard label="Wallet" val={balance.toLocaleString()} icon={<CreditCard className="text-purple-500"/>} />
      </div>

      {/* NAV */}
      <div className="flex justify-center gap-2 overflow-x-auto py-4">
         <TabBtn active={tab === 'participants'} onClick={()=>navigate('admin_pending')} icon={<Users size={16}/>} label="Inscrições" />
         <TabBtn active={tab === 'live'} onClick={()=>navigate('admin_active')} icon={<Zap size={16}/>} label="Pistas" />
         <TabBtn active={tab === 'audit'} onClick={()=>navigate('admin_logs')} icon={<History size={16}/>} label="Histórico" />
      </div>

      {/* CONTENT */}
      <div className="bg-white border rounded-[2.5rem] shadow-sm overflow-hidden">
         <div className="p-10 space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
               <h2 className="text-2xl font-black text-slate-800 uppercase italic">Kwikrace</h2>
               <div className="flex items-center gap-4">
                  <div className="bg-slate-50 px-6 py-3 rounded-xl flex items-center gap-4 text-xs font-black border">
                     Preço: {price.toLocaleString()}
                     <button onClick={()=>navigate('admin_price')} className="bg-primary text-white text-[10px] px-4 py-1.5 rounded-lg">Mudar</button>
                  </div>
                  <div className="relative">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                     <input placeholder="Procurar..." className="pl-11 pr-6 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium w-64" />
                  </div>
               </div>
            </div>

            {tab === 'participants' && <StaticTable partner={partner} />}
            {tab === 'live' && <LiveGrid partner={partner} />}
            {tab === 'audit' && <AuditView partner={partner} />}
            {tab === 'price' && <PriceEditor partner={partner} navigate={navigate} />}
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, icon }: any) {
  return (
    <div className="itel-card group h-40 flex flex-col justify-between py-8 px-10 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-all"/>
       <div className="bg-slate-50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">{icon}</div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-800 italic">{val}</p>
       </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn("itel-tab", active ? "itel-tab-active" : "itel-tab-inactive")}>
       {icon} {label}
    </button>
  );
}

function StaticTable({ partner }: any) {
  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [query, setQuery] = useState('');

  useEffect(() => { supabase.from('groups').select('*').eq('partner_id', partner.id).order('created_at', { ascending: false }).then(({data})=>setList(data||[])); }, [partner.id]);

  const filtered = list.filter(g => g.leader_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
       <div className="overflow-x-auto">
          <table className="w-full">
             <thead>
                <tr className="itel-table-header">
                   <th className="text-left">Piloto</th>
                   <th className="text-left">Membros</th>
                   <th className="text-left">Estado</th>
                   <th className="text-left">Data</th>
                   <th className="text-right">Ações</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {list.map((g) => (
                   <tr key={g.id} className="itel-table-row">
                      <td className="py-5">
                         <div className="flex items-center gap-4">
                            <div className="avatar-initials">{g.leader_name.slice(0,2)}</div>
                            <div><p className="text-sm font-black text-slate-800 uppercase italic leading-none">{g.leader_name}</p><p className="text-[10px] font-bold text-slate-400 mt-1">{g.leader_phone}</p></div>
                         </div>
                      </td>
                      <td className="text-xs font-black text-slate-400">+{g.members_data.length}</td>
                      <td>
                         <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", g.status === 'approved' ? "bg-success" : "bg-slate-300")} />
                            <span className={cn("text-[11px] font-bold uppercase", g.status === 'approved' ? "text-success" : "text-slate-400")}>{g.status}</span>
                         </div>
                      </td>
                      <td className="text-[10px] font-bold text-slate-300 font-mono italic">{new Date(g.created_at).toLocaleDateString()}</td>
                      <td className="text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={()=>setSelected(g)} className="p-2 text-primary/40 hover:text-primary"><Eye size={16}/></button>
                            <button onClick={async () => { await GroupService.approve(partner.id, g.id); window.location.reload(); }} className="p-2 text-success/40 hover:text-success"><CheckCircle2 size={16}/></button>
                            <button onClick={async () => { await GroupService.reject(partner.id, g.id, 'Manual'); window.location.reload(); }} className="p-2 text-error/40 hover:text-error"><Trash2 size={16}/></button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {selected && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-soft-pulse">
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center border-b-4 border-primary">
                  <h3 className="text-xl font-black uppercase italic">Kwikrace</h3>
                  <button onClick={()=>setSelected(null)}><X size={24}/></button>
               </div>
               <div className="p-10 space-y-6">
                  <div className="space-y-4">
                     {[ {name: selected.leader_name, phone: selected.leader_phone}, ...selected.members_data ].map((m, i) => (
                        <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl">
                           <p className="text-sm font-bold text-slate-800">{m.name}</p>
                           <p className="text-[10px] font-black text-slate-400">{m.phone}</p>
                        </div>
                     ))}
                  </div>
                  <div className="pt-8 border-t flex justify-between items-center text-primary">
                     <p className="text-2xl font-black italic">{selected.total_price.toLocaleString()} AOA</p>
                     <button onClick={()=>setSelected(null)} className="h-12 px-8 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase">Fechar</button>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}

function LiveGrid({ partner }: any) {
  const [active, setActive] = useState<any[]>([]);
  useEffect(() => { supabase.from('groups').select('*').eq('partner_id', partner.id).eq('status', 'approved').order('queue_position').then(({data})=>setActive(data||[]));}, [partner.id]);
  return (
    <div className="space-y-6">
       <div className="bg-slate-900 p-12 rounded-[4rem] text-white flex justify-between items-center border-b-8 border-primary shadow-xl">
          <div className="space-y-1"><p className="text-[10px] font-black text-primary uppercase italic">Ativa</p><h3 className="text-5xl font-black italic uppercase italic">Kwikrace</h3></div>
          <button className="h-16 px-10 bg-primary/20 border border-primary text-primary rounded-2xl font-black text-xs uppercase italic hover:bg-primary hover:text-white transition-all">Encerrar</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.map((g, i) => (
             <div key={g.id} className="itel-card group flex justify-between items-center px-10">
                <div className="flex items-center gap-8"><p className="text-4xl font-black italic text-slate-100 group-hover:text-primary transition-all">#{i+1}</p><h4 className="text-lg font-black italic uppercase text-slate-800 leading-none">{g.leader_name}</h4></div>
                <button onClick={async () => { await RacingEngine.startRace(partner.id, g.id); window.location.reload(); }} className="bg-primary text-white text-[10px] h-12 px-8 rounded-xl font-black uppercase shadow-lg shadow-primary/10">Arrancar</button>
             </div>
          ))}
       </div>
    </div>
  );
}

function AuditView({ partner }: any) {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { supabase.from('audit_logs').select('*').eq('partner_id', partner.id).order('created_at', { ascending: false }).then(({data})=>setLogs(data||[])); }, [partner.id]);
  return (
    <div className="bg-slate-50 rounded-3xl overflow-hidden divide-y divide-white">
       {logs.map((l) => (
          <div key={l.id} className="p-6 flex justify-between items-center hover:bg-white transition-all">
             <div className="flex items-center gap-6"><div className="w-1.5 h-10 bg-slate-200 rounded-full"/><p className="text-xs font-black text-slate-800 uppercase italic">{l.service_name} • {l.action}</p></div>
             <span className="text-[10px] font-bold text-slate-300 italic">{new Date(l.created_at).toLocaleTimeString()}</span>
          </div>
       ))}
    </div>
  );
}

function PriceEditor({ partner, navigate }: any) {
  const [prices, setPrices] = useState<any[]>([]);
  const daysS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  useEffect(() => { supabase.from('daily_pricing').select('*').eq('partner_id', partner.id).order('day_of_week').then(({data})=>setPrices(data||[])); }, [partner.id]);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
       {prices.map((p) => (
          <div key={p.id} className="itel-card flex flex-col justify-between h-44 bg-white hover:border-primary/20">
             <p className="text-[10px] font-black text-slate-300 uppercase">{daysS[p.day_of_week]}</p>
             <input defaultValue={p.price_per_runner} onBlur={async e => { await supabase.from('daily_pricing').update({ price_per_runner: parseFloat(e.target.value) }).eq('id', p.id); alert('OK'); }} className="text-2xl font-black italic bg-transparent p-0 border-none w-full focus:ring-0 text-slate-800" />
             <p className="text-[9px] font-black text-primary uppercase italic">AOA</p>
          </div>
       ))}
    </div>
  );
}
