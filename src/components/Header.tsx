import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ClipboardCheck, 
  SearchCheck, 
  Share2, 
  BellRing, 
  Users, 
  CalendarDays, 
  Route, 
  UserCheck, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { cn } from '../lib/utils';

export type PageId = 'menu' | 'checklist' | 'averiguacao' | 'sm' | 'pre_alerta' | 'escala_c' | 'calendario' | 'rotas';

interface HeaderProps {
  activeTab: PageId;
  onSelectTab: (tabId: PageId) => void;
  onRefreshData?: () => void;
}

export const NAV_ITEMS = [
  { id: 'menu' as PageId, label: 'INÍCIO', icon: Home },
  { id: 'checklist' as PageId, label: 'CHECKLIST', icon: ClipboardCheck },
  { id: 'averiguacao' as PageId, label: 'AVERIGUAÇÃO', icon: SearchCheck },
  { id: 'sm' as PageId, label: 'SM', icon: Share2 },
  { id: 'pre_alerta' as PageId, label: 'PRÉ-ALERTA', icon: BellRing },
  { id: 'escala_c' as PageId, label: 'ESCALA C', icon: Users },
  { id: 'calendario' as PageId, label: 'CALENDÁRIO', icon: CalendarDays },
  { id: 'rotas' as PageId, label: 'ROTAS', icon: Route },
];

export default function Header({ activeTab, onSelectTab, onRefreshData }: HeaderProps) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full h-[72px] bg-[#121A26] border-b border-white/10 px-4 xl:px-6 flex items-center justify-between select-none shrink-0 shadow-lg relative z-50">
      
      {/* LEFT: BRANDING LOGO */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A31324] via-[#700C18] to-[#121A26] border border-[#D6A84F]/40 flex items-center justify-center shadow-md">
          <ShieldCheck size={22} className="text-[#D6A84F]" />
        </div>

        <div className="flex flex-col text-left leading-none">
          <span className="text-[10px] font-mono font-black text-[#D6A84F] tracking-widest uppercase mb-0.5">
            PLATAFORMA EXECUTIVA
          </span>
          <span className="text-lg font-black tracking-tight text-[#F3F6F8] font-heading uppercase">
            CENTRAL <span className="text-[#A31324]">OPERACIONAL</span>
          </span>
        </div>
      </div>

      {/* CENTER: TOP HORIZONTAL CAPSULE NAVIGATION BAR */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#172231] p-1.5 rounded-2xl border border-white/10 shadow-inner">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const IconComp = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectTab(item.id);
                }
              }}
              className={cn(
                "nav-tab-capsule px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 outline-none font-sans font-extrabold text-[11px] tracking-wide uppercase select-none",
                isActive
                  ? "active bg-gradient-to-b from-[#A31324] to-[#700C18] text-[#F3F6F8] border border-[#D6A84F]/50 shadow-md"
                  : "text-[#94A3B8] hover:text-[#F3F6F8] hover:bg-[#202D3C]/60"
              )}
              aria-label={`Navegar para ${item.label}`}
            >
              <IconComp size={15} className={cn("shrink-0", isActive ? "text-[#D6A84F]" : "text-[#94A3B8]")} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* RIGHT: LIVE CLOCK & USER PROFILE */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            className="p-2 rounded-xl bg-[#172231] hover:bg-[#202D3C] text-[#94A3B8] hover:text-[#F3F6F8] border border-white/10 transition-colors cursor-pointer"
            title="Atualizar Dados Operacionais"
          >
            <RefreshCw size={15} />
          </button>
        )}

        {/* Live Date & Time */}
        <div className="hidden sm:flex flex-col text-right font-mono text-xs leading-tight border-r border-white/10 pr-3.5">
          <span className="text-[#D6A84F] font-extrabold tracking-wider">{timeStr || '10:14:08'}</span>
          <span className="text-[10px] text-[#94A3B8] font-bold">{dateStr || 'TER, 06 OUT'}</span>
        </div>

        {/* User Profile Identification */}
        <div className="flex items-center gap-2.5 bg-[#172231] border border-white/10 px-3 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-[#202D3C] border border-[#D6A84F]/30 flex items-center justify-center text-[#D6A84F]">
            <UserCheck size={16} />
          </div>
          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-[11px] font-black text-[#F3F6F8] font-heading uppercase">COMANDO GR</span>
            <span className="text-[9px] font-mono text-[#43D17A] mt-0.5">● ONLINE</span>
          </div>
        </div>

      </div>

    </header>
  );
}
