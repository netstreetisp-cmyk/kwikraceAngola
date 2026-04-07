import React, { useState, useEffect } from 'react';
import { 
  Trophy, Users, Timer, Settings, LayoutDashboard, Plus, CheckCircle2, 
  XCircle, Bell, Flag, ChevronRight, MapPin, CreditCard, History, 
  ShieldCheck, Rocket, BarChart3, Activity, Globe, LogIn, Store, 
  Trash2, AlertCircle, RefreshCw, Layers, Calendar, ChevronLeft, Search, 
  FileText, Zap, MousePointer2, UserCheck, ShieldAlert, UserPlus, Eye, Clock, Download, FileJson,
  ChevronDown, User
} from 'lucide-react';
import { cn } from './lib/utils';
import { supabase } from './services/core';
import { GroupService } from './services/core';
import { RacingEngine, NotificationService, PriceService } from './services/racing';

type ViewType = 
  | 'landing' | 'register' | 'confirmation' | 'notif_status'
  | 'admin_dash' | 'admin_pending' | 'admin_active' | 'admin_logs' | 'admin_price'
  | 'sadmin_dash';

export default function App() {
  const [view, setView] = useState<ViewType>('landing');
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
       const { data } = await supabase.from('partners').select('*').eq('slug', 'speedway-luanda').single();
       setPartner(data || { name: 'KwikRace HQ', id: 'sl-01' });
       setLoading(false);
    }
    init();
  }, []);

  const navigate = (v: ViewType) => setView(v);
  const isAdmin = view.startsWith('admin') || view.startsWith('sadmin');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Rocket size={32} className="text-primary animate-bounce" /></div>;

  return (
    <div className={cn("min-h-screen flex flex-col font-body bg-[#f8fafc]", !isAdmin && "bg-white")}>
      
      {/* 🟢 HEADER HQ - CONTEXTO RACING */}
      <header className="h-20 bg-white border-b border-slate-100 flex justify-between items-center px-8 z-[100] fixed top-0 w-full">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('landing')}>
          <div className="bg-[#1a1a1a] p-2.5 rounded-xl shadow-lg"><Rocket size={20} className="text-white" /></div>
          <div><h1 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">KWIKRACE HQ</h1><p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 italic">{partner?.name || 'CENTRO OPERACIONAL'}</p></div>
        </div>

        <div className="flex items-center gap-6">
           {isAdmin && (
             <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <p className="text-[10px] font-black text-slate-400">operador.pistas@kwikrace.ao</p>
                <div className="w-8 h-8 rounded-full bg-primary-variant flex items-center justify-center text-primary"><User size={16}/></div>
             </div>
           )}
           <button onClick={() => navigate(isAdmin ? 'landing' : 'admin_dash')} className="bg-white border-2 border-primary/10 text-primary text-[10px] font-black px-6 py-2.5 rounded-xl uppercase hover:bg-primary hover:text-white transition-all shadow-sm">
              {isAdmin ? 'Sair Painel' : 'Painel Staff'}
           </button>
        </div>
      </header>

      {/* 🟢 CONTEÚDO DINÂMICO */}
      <main className={cn("flex-1", isAdmin ? "pt-28 pb-20 px-10" : "pt-20 px-4")}>
          {renderContent(view, navigate, partner)}
      </main>

      {/* FOOTER CLIENTE MOBILE */}
      {!isAdmin && <nav className="fixed bottom-0 w-full z-10 bg-white border-t border-slate-100 h-20 flex justify-around items-center md:hidden"><NavBtn active={view === 'landing'} onClick={() => navigate('landing')} icon={<LayoutDashboard size={20}/>} label="Home" /><NavBtn active={view === 'notif_status'} onClick={() => navigate('notif_status')} icon={<Timer size={20}/>} label="Fila" /><NavBtn active={view === 'admin_dash'} onClick={() => navigate('admin_dash')} icon={<Settings size={20}/>} label="Staff" /></nav>}
    </div>
  );
}

function renderContent(view: ViewType, navigate: (v: ViewType) => void, partner: any) {
  switch (view) {
    case 'landing': return <ClientHome onRegister={() => navigate('register')} partner={partner} />;
    case 'register': return <ClientRegister onComplete={() => navigate('confirmation')} partner={partner} />;
    case 'confirmation': return <ClientConfirmation onStatus={() => navigate('notif_status')} />;
    case 'notif_status': return <ClientLiveQueue partner={partner} />;
    case 'admin_dash': return <AdminPortal navigate={navigate} partner={partner} tab="participants" />;
    case 'admin_pending': return <AdminPortal navigate={navigate} partner={partner} tab="participants" />;
    case 'admin_active': return <AdminPortal navigate={navigate} partner={partner} tab="live" />;
    case 'admin_logs': return <AdminPortal navigate={navigate} partner={partner} tab="audit" />;
    case 'admin_price': return <AdminPortal navigate={navigate} partner={partner} tab="price" />;
    default: return <ClientHome onRegister={() => navigate('register')} partner={partner} />;
  }
}

function NavBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1", active ? "text-primary bg-primary/5 p-2 rounded-xl" : "text-gray-300 opacity-60")}>
      {icon}
      <span className="text-[8px] font-bold uppercase">{label}</span>
    </button>
  );
}

// -----------------------------------------------------
// 1. CLIENTE (INSTITUCIONAL CLEAN)
// -----------------------------------------------------

function ClientHome({ onRegister, partner }: any) {
  const [priceToday, setPriceToday] = useState<number>(0);
  useEffect(() => { PriceService.getPriceForToday(partner.id).then(setPriceToday); }, [partner.id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
      <Rocket size={64} className="text-primary animate-pulse" />
      <div className="space-y-4">
         <h2 className="text-5xl font-black text-slate-800 uppercase tracking-tighter leading-none italic">Acelere para a <br/><span className="text-primary italic">Pista!</span></h2>
         <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto italic uppercase tracking-wider">Inscreva o seu grupo no Karting mais próximo.</p>
      </div>
      <div className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-50 shadow-2xl space-y-8 relative overflow-hidden w-full max-w-sm">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
         <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest"><CreditCard size={14} className="inline mr-1"/> CÓDIGO DO QR CODE</p>
            <h3 className="text-4xl font-black text-slate-800 italic mt-6 tracking-tighter">{priceToday.toLocaleString()},00 <span className="text-xs block opacity-30 not-italic uppercase font-bold mt-2 tracking-widest">Preço Individual</span></h3>
         </div>
         <button onClick={onRegister} className="w-full h-16 bg-primary text-white rounded-2xl font-black italic tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">VALIDAR LOCAL</button>
      </div>
      <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-40">KwikRace Smart Registration</p>
    </div>
  );
}

function ClientRegister({ onComplete, partner }: any) {
  const [pilots, setPilots] = useState([{ name: '', phone: '', age: '' }]);
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const todayPrice = await PriceService.getPriceForToday(partner.id);
      await GroupService.submit(partner.id, pilots[0], pilots.slice(1), terms, pilots.length * todayPrice);
      onComplete();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-10 py-10">
      <h2 className="text-3xl font-black italic text-slate-800 uppercase">Inscrição <span className="text-primary">Equipa</span></h2>
      <div className="space-y-6">
        {pilots.map((p, i) => (
          <div key={i} className="itel-card relative pt-10">
             <div className="absolute top-4 left-6 text-[10px] font-black text-slate-300 uppercase">Piloto #{i+1}</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={p.name} placeholder="Nome Completo" onChange={e=>{const n=[...pilots];n[i].name=e.target.value;setPilots(n)}} className="bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" />
                <input value={p.phone} placeholder="Contact Number" onChange={e=>{const n=[...pilots];n[i].phone=e.target.value;setPilots(n)}} className="bg-slate-50 rounded-xl p-4 text-sm font-bold border-none" />
             </div>
          </div>
        ))}
        <button onClick={() => setPilots([...pilots, { name: '', phone: '', age: '' }])} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[35px] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-primary transition-all">+ Elemento</button>
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] space-y-8 shadow-2xl">
           <label className="flex gap-4 cursor-pointer"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} className="w-6 h-6 rounded text-primary" /><p className="text-[10px] font-bold opacity-60">Li e aceito os termos do Karting.</p></label>
           <button disabled={!terms || loading} onClick={handleSubmit} className="w-full h-16 bg-primary rounded-2xl font-black uppercase text-sm">{loading ? 'ENVIANDO...' : 'RESERVAR LUGAR FILA HOJE'}</button>
        </div>
      </div>
    </div>
  );
}

function ClientConfirmation({ onStatus }: any) {
  return (
    <div className="text-center py-24 space-y-8 max-w-sm mx-auto">
       <CheckCircle2 size={72} className="mx-auto text-primary" />
       <h2 className="text-4xl font-black italic uppercase">Inscrito!</h2>
       <p className="text-sm font-bold text-slate-400">Dirija-se ao staff agora.</p>
       <button onClick={onStatus} className="bg-primary text-white w-full h-16 rounded-2xl font-black uppercase shadow-lg shadow-primary/20 italic">LIVE STATUS</button>
    </div>
  );
}

function ClientLiveQueue({ partner }: any) {
  const [queue, setQueue] = useState<any[]>([]);
  useEffect(() => { supabase.from('groups').select('*').eq('partner_id', partner.id).eq('status', 'approved').order('queue_position').then(({data})=>setQueue(data||[])); }, [partner.id]);

  return (
    <div className="max-w-md mx-auto py-10 space-y-12">
       <div className="bg-slate-900 text-white p-12 rounded-[50px] shadow-3xl text-center space-y-2 border-b-8 border-primary">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Track Status: ACTIVE</p>
          <h3 className="text-4xl font-black italic uppercase">Delta Squad</h3>
       </div>
       <div className="space-y-4">
          <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest italic ml-4">Próximos Pilotos</p>
          {queue.map((g, i) => (
             <div key={g.id} className="bg-white border-none p-6 rounded-[35px] flex items-center gap-8 shadow-sm opacity-50 scale-95 border border-slate-50">
                <p className="text-3xl font-black italic text-slate-100">#0{i+1}</p>
                <div><h4 className="text-sm font-black uppercase tracking-tight italic">{g.leader_name} Team</h4><p className="text-[9px] font-bold text-slate-300">EM FILA DE ESPERA</p></div>
             </div>
          ))}
       </div>
    </div>
  );
}

// -----------------------------------------------------
// 2. STAFF - PORTAL ELITE (ITEL ADMIN REPLICA)
// -----------------------------------------------------

function AdminPortal({ navigate, partner, tab }: any) {
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 82, activeMembers: 0 });
  const [smsBalance, setSmsBalance] = useState<number | string>('...');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    async function load() {
       const { count: pCount } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).eq('status', 'pending');
       const { count: aCount } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).eq('status', 'approved');
       const { data: grpData } = await supabase.from('groups').select('*').eq('partner_id', partner.id);
       const memCount = grpData?.reduce((acc: number, curr: any) => acc + (curr.members_data.length + 1), 0) || 0;
       const bal = await NotificationService.getBalance();
       const prc = await PriceService.getPriceForToday(partner.id);
       setStats({ pending: pCount || 0, active: aCount || 0, completed: 82, activeMembers: memCount });
       setSmsBalance(bal);
       setPrice(prc);
    }
    load();
  }, [partner.id]);

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      
      {/* 🟢 TOP KPIs - CONTEXTO KARTING (ESPELHADO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <KPICard label="Pilotos Registados" val={stats.activeMembers} icon={<Users size={20} className="text-primary"/>} badge="+ 12%" badgeColor="text-success bg-success/10" />
         <KPICard label="Faturamento Previsto" val={stats.completed} icon={<CreditCard size={20} className="text-success"/>} badge="+ 8%" badgeColor="text-success bg-success/10" />
         <KPICard label="Check-ins Pendentes" val={stats.pending} icon={<Clock size={20} className="text-warning"/>} badge="Pendente" badgeColor="text-slate-400 bg-slate-100" />
         <KPICard label="Pistas em Operação" val={stats.active} icon={<Rocket size={20} className="text-purple-500"/>} badge="Ativo" badgeColor="text-primary bg-primary/10" />
      </div>

      {/* 🟢 ABAS DE NAVEGAÇÃO HQ */}
      <nav className="flex justify-center items-center gap-2 overflow-x-auto pb-4">
         <TabBtn active={tab === 'participants'} onClick={()=>navigate('admin_pending')} icon={<Users size={16}/>} label="Paddock (Inscrições)" />
         <TabBtn active={tab === 'live'} onClick={()=>navigate('admin_active')} icon={<Zap size={16}/>} label="Controlo de Grelha" />
         <TabBtn active={false} icon={<Bell size={16}/>} label="Avisos SMS" />
         <TabBtn active={false} icon={<Activity size={16}/>} label="Métricas" />
         <TabBtn active={tab === 'audit'} onClick={()=>navigate('admin_logs')} icon={<History size={16}/>} label="Histórico HQ" />
      </nav>

      {/* 🟢 GESTÃO OPERACIONAL (ESPELHADA) */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm shadow-slate-200/50 overflow-hidden">
         <div className="p-10 space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
               <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-800 leading-none">Controle de Paddock</h2>
                  <p className="text-sm font-medium text-slate-400">Coordene as equipas e valide pagamentos de pista.</p>
               </div>
               
               <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-slate-50 px-6 py-3 rounded-xl flex items-center gap-4 border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Preço Inscrição:</p>
                     <p className="text-base font-black text-slate-800">{price.toLocaleString()},00</p>
                     <button onClick={()=>navigate('admin_price')} className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-lg ml-2 active:scale-95 transition-all">Atualizar</button>
                  </div>
                  
                  <div className="relative group">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                     <input placeholder="Pesquisar por nome ou equipe..." className="pl-11 pr-6 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium w-64 md:w-80 group-hover:bg-slate-100 transition-all focus:ring-0" />
                  </div>

                  <div className="flex gap-2">
                     <ExportBtn icon={<Download size={14}/>} label="CSV" />
                     <ExportBtn icon={<Download size={14}/>} label="PDF" color="bg-primary text-white" />
                  </div>
               </div>
            </div>

            {/* Content Logic */}
            {tab === 'participants' && <ParticipantsTable partner={partner} />}
            {tab === 'live' && <LiveGrid partner={partner} />}
            {tab === 'audit' && <AuditView partner={partner} />}
            {tab === 'price' && <PriceEditor partner={partner} navigate={navigate} />}
         </div>
      </div>
    </div>
  );
}

function KPICard({ label, val, icon, badge, badgeColor }: any) {
  return (
    <div className="itel-card flex flex-col justify-between h-44 relative overflow-hidden group">
       <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-all"/>
       <div className="flex justify-between items-start">
          <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">{icon}</div>
          <span className={cn("itel-badge", badgeColor)}>{badge}</span>
       </div>
       <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
          <p className="text-4xl font-black text-slate-800 italic tracking-tighter">{val}</p>
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

function ExportBtn({ icon, label, color }: any) {
  return (
    <button className={cn("flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm active:scale-95", color || "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
       {icon} {label}
    </button>
  );
}

// -----------------------------------------------------
// TAB: PARTICIPANTS REPLICA
// -----------------------------------------------------

function ParticipantsTable({ partner }: any) {
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    supabase.from('groups').select('*').eq('partner_id', partner.id).order('created_at', { ascending: false }).then(({data})=>setList(data||[]));
  }, [partner.id]);

  const filtered = list.filter(g => 
    g.leader_name.toLowerCase().includes(search.toLowerCase()) || 
    g.leader_phone.includes(search)
  );

  return (
    <div className="space-y-6">
       <div className="overflow-x-auto">
          <table className="w-full">
             <thead>
                <tr>
                   <th className="itel-table-header text-left">Líder de Equipa / Piloto</th>
                   <th className="itel-table-header text-left">Membros (Equipa)</th>
                   <th className="itel-table-header text-left">Estado (Check-in)</th>
                   <th className="itel-table-header text-left">Data Submissão</th>
                   <th className="itel-table-header text-right">Acções HQ</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {filtered.map((g) => (
                   <tr key={g.id} className="itel-table-row">
                      <td className="py-5">
                         <div className="flex items-center gap-4">
                            <div className="avatar-initials uppercase shadow-sm border-2 border-white">{g.leader_name.slice(0,2)}</div>
                            <div><p className="text-sm font-black text-slate-800 italic uppercase leading-none">{g.leader_name}</p><p className="text-[10px] font-bold text-slate-400 mt-1">{g.leader_phone}</p></div>
                         </div>
                      </td>
                      <td className="text-xs font-black text-slate-500">+{g.members_data.length} Pilotos</td>
                      <td>
                         <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", g.status === 'approved' ? "bg-success" : "bg-slate-300")} />
                            <span className={cn("text-[11px] font-bold", g.status === 'approved' ? "text-success" : "text-slate-400")}>{g.status === 'approved' ? '• Pago' : '• Não Pago'}</span>
                         </div>
                      </td>
                      <td className="text-[10px] font-bold text-slate-300 font-mono italic">{new Date(g.created_at).toLocaleDateString()}</td>
                      <td className="text-right">
                         <div className="flex justify-end gap-1">
                            <ActionIcon onClick={()=>setSelected(g)} icon={<Eye size={16}/>} />
                            <ActionIcon icon={<Clock size={16}/>} color="text-warning" />
                            <ActionIcon icon={<CheckCircle2 size={16}/>} color="text-success" onClick={async () => { await GroupService.approve(partner.id, g.id); window.location.reload(); }} />
                            <ActionIcon icon={<Trash2 size={16}/>} color="text-error" onClick={async () => { await GroupService.reject(partner.id, g.id, 'Log Rejection'); window.location.reload(); }} />
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* MODAL DETALHES (ITEL POPUP STYLE) */}
       {selected && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-soft-pulse">
               <div className="p-8 bg-primary text-white flex justify-between items-center">
                  <div><h3 className="text-xl font-black uppercase italic leading-none">{selected.leader_name}</h3><p className="text-[10px] opacity-60 font-bold uppercase mt-2 tracking-widest">Detalhes da Inscrição No Evento</p></div>
                  <button onClick={()=>setSelected(null)} className="p-2 hover:bg-white/10 rounded-lg"><XCircle size={24}/></button>
               </div>
               <div className="p-8 space-y-6">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Informação dos Membros</p>
                     {[ {name: selected.leader_name, phone: selected.leader_phone, age: selected.age || 'N/A'}, ...selected.members_data ].map((m, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-primary border border-slate-100">{i===0 ? 'L' : i}</div>
                              <p className="text-sm font-bold text-slate-700">{m.name}</p>
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase">{m.age} ANOS • {m.phone}</p>
                        </div>
                     ))}
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                     <div><p className="text-[9px] font-black text-slate-300 uppercase">Total Líquido</p><p className="text-2xl font-black italic text-primary">{selected.total_price.toLocaleString()} AOA</p></div>
                     <button onClick={()=>setSelected(null)} className="bg-slate-100 px-8 h-12 rounded-xl text-[10px] font-black uppercase">Fechar Detalhes</button>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}

function ActionIcon({ icon, color, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("p-2 hover:bg-slate-50 rounded-lg transition-all active:scale-90", color || "text-primary/60")}>
       {icon}
    </button>
  );
}

// -----------------------------------------------------
// TAB: LIVE GRID (ITEL REFINEMENT)
// -----------------------------------------------------

function LiveGrid({ partner }: any) {
  const [active, setActive] = useState<any[]>([]);
  useEffect(() => { supabase.from('groups').select('*').eq('partner_id', partner.id).eq('status', 'approved').order('queue_position').then(({data})=>setActive(data||[]));}, [partner.id]);

  return (
    <div className="space-y-6">
       <div className="bg-slate-900 p-12 rounded-[3.5rem] border-b-8 border-primary text-white flex justify-between items-center shadow-xl">
          <div className="space-y-3"><p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic mb-1 flex items-center gap-2 animate-pulse"><Activity size={14}/> SINAL PISTA ACTIVO</p><h3 className="text-5xl font-black italic uppercase leading-none">Alfa Pro Racers</h3></div>
          <button className="h-16 px-10 bg-primary/20 border border-primary text-primary rounded-[2.5rem] font-black text-xs uppercase italic tracking-widest hover:bg-primary hover:text-white transition-all">Encerrar Sprint</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.map((g, i) => (
             <div key={g.id} className="itel-card group flex justify-between items-center">
                <div className="flex items-center gap-6"><p className="text-4xl font-black text-slate-100 group-hover:text-primary transition-all italic">#{i+1}</p><div><h4 className="text-lg font-black italic uppercase text-slate-800 leading-none">{g.leader_name}</h4><p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Aguardando Pit Lane</p></div></div>
                <button onClick={async () => { await RacingEngine.startRace(partner.id, g.id); window.location.reload(); }} className="bg-primary text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase shadow-lg shadow-primary/10">Arrancar</button>
             </div>
          ))}
       </div>
    </div>
  );
}

// -----------------------------------------------------
// TAB: AUDIT & PRICE (ITEL STYLE)
// -----------------------------------------------------

function AuditView({ partner }: any) {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { supabase.from('audit_logs').select('*').eq('partner_id', partner.id).order('created_at', { ascending: false }).then(({data})=>setLogs(data||[])); }, [partner.id]);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden divide-y divide-slate-100">
       {logs.map((l) => (
          <div key={l.id} className="p-6 flex justify-between items-center group hover:bg-white transition-all">
             <div className="flex items-center gap-6"><div className="w-1.5 h-8 bg-slate-200 group-hover:bg-primary rounded-full transition-all"/><div className="space-y-1"><p className="text-xs font-black text-slate-800 uppercase tracking-tight italic">{l.service_name} • {l.action}</p><p className="text-xs font-medium text-slate-400">ID: #{l.id.slice(0,12)}</p></div></div>
             <span className="text-[10px] font-bold text-slate-300 italic">{new Date(l.created_at).toLocaleString()}</span>
          </div>
       ))}
    </div>
  );
}

function PriceEditor({ partner, navigate }: any) {
  const [prices, setPrices] = useState<any[]>([]);
  const daysS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  useEffect(() => { supabase.from('daily_pricing').select('*').eq('partner_id', partner.id).order('day_of_week').then(({data})=>setPrices(data||[])); }, [partner.id]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
       {prices.map((p) => (
          <div key={p.id} className="itel-card flex flex-col justify-between h-44 border-slate-100 hover:border-primary/20">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{daysS[p.day_of_week]}</p>
             <input defaultValue={p.price_per_runner} onBlur={async e => { await supabase.from('daily_pricing').update({ price_per_runner: parseFloat(e.target.value) }).eq('id', p.id); alert('Sincronizado!'); }} className="text-2xl font-black italic bg-transparent p-0 border-none w-full focus:ring-0 text-slate-800" />
             <p className="text-[9px] font-black text-primary uppercase underline underline-offset-4 decoration-primary/20">AOA por Piloto</p>
          </div>
       ))}
    </div>
  );
}

// SUPER ADMIN PLACEHOLDER
function SuperAdminDash({ navigate }: any) { return <div className="py-24 text-center space-y-10"><h2 className="text-6xl font-black italic uppercase tracking-tighter">HQ Network Control</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"><button className="itel-card p-12 font-black uppercase italic border-2 hover:border-primary transition-all">Gestão Parceiros</button><button className="itel-card p-12 font-black uppercase italic border-2">Monitor Global</button></div></div>; }
