import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Timer, 
  Settings, 
  LayoutDashboard, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Flag,
  ChevronRight,
  MapPin,
  CreditCard,
  History,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Button } from './components/Button';
import { Card } from './components/Card';

// Types
type View = 'landing' | 'register' | 'status' | 'admin' | 'superadmin';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [partner, setPartner] = useState({ name: 'Algarve Circuit', id: 'aia-2024' });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md h-20 flex justify-between items-center px-8 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 10V34M12 22L32 10M12 22L32 34" stroke="#9d1c2b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 
            className="text-2xl font-black text-[#1a1a1a] tracking-tight cursor-pointer"
            onClick={() => setView('landing')}
          >
            KwikRace
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="px-6 py-2 rounded-full border-2 border-[#fff1f2] bg-[#fffafb] text-[#9d1c2b] text-xs font-black uppercase tracking-widest hover:bg-[#fff1f2] transition-colors shadow-sm"
            onClick={() => setView(view === 'admin' ? 'landing' : 'admin')}
          >
            GESTOR
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-32 px-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div key="landing">
              <LandingView onRegister={() => setView('register')} />
            </motion.div>
          )}
          {view === 'register' && (
            <motion.div key="register">
              <RegisterView onComplete={() => setView('status')} />
            </motion.div>
          )}
          {view === 'status' && (
            <motion.div key="status">
              <StatusView />
            </motion.div>
          )}
          {view === 'admin' && (
            <motion.div key="admin">
              <AdminDashboard />
            </motion.div>
          )}
          {view === 'superadmin' && (
            <motion.div key="superadmin">
              <SuperAdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 bg-white/90 backdrop-blur-md h-22 flex justify-around items-center pb-6 px-4 border-t border-gray-100">
        <NavButton active={view === 'landing'} onClick={() => setView('landing')} icon={<LayoutDashboard size={24} />} label="Fila" />
        <NavButton active={false} onClick={() => {}} icon={<CreditCard size={24} />} label="Preços" />
        <NavButton active={false} onClick={() => {}} icon={<History size={24} />} label="Logs" />
        <NavButton active={view === 'admin'} onClick={() => setView('admin')} icon={<Settings size={24} />} label="Admin" />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center transition-all active:scale-90 relative",
        active ? "text-[#9d1c2b]" : "text-gray-400 hover:text-gray-600"
      )}
    >
      {active && <div className="absolute -top-3 w-8 h-1 bg-[#9d1c2b] rounded-full" />}
      {icon}
      <span className="font-headline text-[9px] font-black uppercase tracking-widest mt-1">{label}</span>
    </button>
  );
}

// --- Views ---

function LandingView({ onRegister }: { onRegister: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 py-12"
    >
      {/* Big Central Logo */}
      <div className="mb-4">
        <svg width="80" height="80" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 10V34M12 22L32 10M12 22L32 34" stroke="#9d1c2b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="space-y-4">
        <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tight text-[#9d1c2b] leading-tight">
          Acelere para a Pista!
        </h2>
        <p className="text-on-surface-variant font-medium text-lg md:text-xl">
          Inscreva o seu grupo no Karting mais próximo.
        </p>
      </div>

      {/* QR Code Verification Card */}
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center space-y-8">
        <div className="flex items-center gap-2 self-start mb-2">
          <div className="text-[#e11d48]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2l3 3-3 3-3-3 3-3z" />
            </svg>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">CÓDIGO DO QR CODE</span>
        </div>

        <div className="flex gap-4 justify-center w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-16 md:w-20 md:h-20 bg-[#f8fafc] rounded-2xl flex items-center justify-center border border-gray-50">
              <div className="w-3 h-3 bg-slate-500 rounded-full" />
            </div>
          ))}
        </div>

        <button 
          onClick={onRegister}
          className="w-full py-6 bg-[#f4a7bb] hover:bg-[#f195ae] text-white rounded-3xl font-black uppercase tracking-[0.15em] text-sm transition-all shadow-lg shadow-pink-100/50 flex justify-center items-center gap-2"
        >
          VALIDAR LOCAL
        </button>
      </div>

      {/* Footer */}
      <div className="pt-8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9d1c2b]">KWIKRACE SMART REGISTRATION</p>
        <p className="text-[11px] font-medium text-gray-400">
          © 2026 <span className="text-[#9d1c2b] font-bold">KwikRace Angola</span>.
        </p>
      </div>
    </motion.div>
  );
}

function RegisterView({ onComplete }: { onComplete: () => void }) {
  const [pilots, setPilots] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-lg mx-auto space-y-8"
    >
      <div className="relative">
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#9d1c2b]" />
        <p className="text-[#9d1c2b] text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Registration Portal</p>
        <h2 className="font-headline text-4xl font-black tracking-tight uppercase">Novo Grupo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="block font-headline text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Líder da Equipa</label>
          <input 
            required
            className="w-full bg-gray-50 border-0 border-b-2 border-gray-100 focus:border-[#9d1c2b] focus:ring-0 text-on-surface px-4 py-5 transition-all rounded-t-2xl font-medium placeholder:text-on-surface-variant/40"
            placeholder="Insira o nome do líder..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <label className="block font-headline text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Grid de Pilotos</label>
            <span className="text-primary font-headline text-2xl font-black italic">{pilots.length} Slots</span>
          </div>
          
          <div className="space-y-3">
            {pilots.map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 text-[11px] font-black font-headline rounded-lg border border-gray-100">P{i+1}</div>
                <input 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 placeholder:text-on-surface-variant/30 font-medium"
                  placeholder="Nome completo do piloto..."
                  required
                />
                {i > 0 && (
                  <button type="button" onClick={() => setPilots(pilots.filter((_, idx) => idx !== i))} className="text-red-500">
                    <XCircle size={20} />
                  </button>
                )}
              </div>
            ))}
            
            {pilots.length < 6 && (
              <button 
                type="button"
                onClick={() => setPilots([...pilots, ''])}
                className="w-full py-4 border-2 border-dashed border-outline-variant/50 rounded-xl text-on-surface-variant hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-3"
              >
                <Plus size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Adicionar Piloto</span>
              </button>
            )}
          </div>
        </div>

        <Card variant="default" className="space-y-4 border-[#fff1f2] bg-[#fffafb]">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em]">Total Estimado</span>
            <span className="text-[#9d1c2b] font-headline text-2xl font-black italic">{pilots.length * 15000} AOA</span>
          </div>
          <Button type="submit" className="w-full py-5" loading={loading}>
            Finalizar Inscrição
          </Button>
        </Card>
      </form>
    </motion.div>
  );
}

function StatusView() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-10"
    >
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-[1px] bg-primary/30" />
          <span className="font-label text-on-surface-variant text-[11px] uppercase tracking-[0.3em] font-bold">ESTADO DO PEDIDO</span>
        </div>
        <h2 className="font-headline text-5xl font-bold tracking-tighter text-on-surface">Paddock Status</h2>
      </section>

      <Card variant="high" className="p-10 relative overflow-hidden text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-[#fff1f2] rounded-3xl flex items-center justify-center border border-[#fff1f2]">
            <Timer size={40} className="text-[#9d1c2b] animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-headline text-3xl font-black uppercase italic">Aguardando Aprovação</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto font-medium">O seu registo está em fila de espera para validação técnica pela nossa equipa.</p>
        </div>
        <div className="pt-6 border-t border-gray-100">
          <p className="text-[#9d1c2b] font-bold text-xl">Aguarde o sinal do staff</p>
          <p className="text-on-surface-variant text-sm mt-1">A confirmação será enviada via SMS em breve.</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex items-center gap-4">
          <Users className="text-primary" />
          <div>
            <p className="text-[9px] font-bold uppercase text-on-surface-variant">Pilotos</p>
            <p className="font-headline font-bold text-xl">4 Inscritos</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <MapPin className="text-primary" />
          <div>
            <p className="text-[9px] font-bold uppercase text-on-surface-variant">Paddock</p>
            <p className="font-headline font-bold text-xl">01 - Luanda</p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function AdminDashboard() {
  const [pendingGroups, setPendingGroups] = useState([
    { id: '1', leader: 'Ricardo Torque', pilots: 4, total: '60.000 AOA', time: 'Há 2 min' },
    { id: '2', leader: 'Ana Sprint', pilots: 2, total: '30.000 AOA', time: 'Há 15 min' },
  ]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <section className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-[1px] bg-primary" />
            <span className="font-label text-primary text-[10px] uppercase font-bold tracking-[0.3em]">Paddock Control</span>
          </div>
          <h2 className="font-headline text-4xl font-bold tracking-tight">Solicitações</h2>
        </div>
        <div className="text-right">
          <p className="text-4xl font-headline font-black text-[#9d1c2b] italic">{pendingGroups.length}</p>
          <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Pendentes</p>
        </div>
      </section>

      <div className="space-y-4">
        {pendingGroups.map(group => (
          <Card key={group.id} className="flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="w-12 h-12 bg-[#fff1f2] rounded-2xl flex items-center justify-center text-[#9d1c2b]">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">{group.leader}</h4>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-black">{group.pilots} Pilotos • {group.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <p className="font-headline font-bold text-xl text-[#9d1c2b] italic">{group.total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPendingGroups(pendingGroups.filter(g => g.id !== group.id))}>
                  <XCircle size={18} />
                </Button>
                <Button size="sm" onClick={() => setPendingGroups(pendingGroups.filter(g => g.id !== group.id))}>
                  <CheckCircle2 size={18} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <section className="space-y-6">
        <h3 className="font-headline text-2xl font-bold uppercase italic">Fila Ativa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-emerald-500 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Em Pista</span>
              <Timer size={16} className="text-emerald-500" />
            </div>
            <h4 className="font-bold">Scuderia 42</h4>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">Tempo restante: 08:42</p>
          </Card>
          <Card className="opacity-60 border-l-4 border-[#9d1c2b] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-[#fff1f2] text-[#9d1c2b] text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Próximo</span>
              <ChevronRight size={16} className="text-[#9d1c2b]" />
            </div>
            <h4 className="font-bold">Grip Masters</h4>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">Aguardando no pit lane</p>
          </Card>
        </div>
      </section>
    </motion.div>
  );
}

function SuperAdminDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <section>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-[1px] bg-primary" />
          <span className="font-label text-primary text-[10px] uppercase font-bold tracking-[0.3em]">Global Ecosystem</span>
        </div>
        <h1 className="font-headline text-5xl font-bold tracking-tight">Gestão de Parceiros</h1>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-2">Parceiros</p>
          <p className="text-4xl font-headline font-black">24</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-2">Corridas (24h)</p>
          <p className="text-4xl font-headline font-black">1.420</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-2">Receita Total</p>
          <p className="text-4xl font-headline font-black text-primary">4.2M</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-2">Uptime</p>
          <p className="text-4xl font-headline font-black text-tertiary">99.9%</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Parceiro</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Localização</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { name: 'Speedway Luanda', loc: 'Luanda, AO', status: 'Operacional' },
              { name: 'Benguela Pro', loc: 'Benguela, AO', status: 'Operacional' },
              { name: 'Huambo Arena', loc: 'Huambo, AO', status: 'Manutenção', error: true },
            ].map((p, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold">{p.name}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{p.loc}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                    p.error ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </motion.div>
  );
}
