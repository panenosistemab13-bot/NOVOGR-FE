import React from 'react';
import { 
  Home, 
  ClipboardCheck, 
  FileCheck2, 
  Share2, 
  Sliders, 
  Calendar, 
  CalendarDays, 
  Route 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface OrbitalSidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const ORBITAL_SIDEBAR_ITEMS: OrbitalSidebarItem[] = [
  { id: 'menu', label: 'INÍCIO', icon: Home },
  { id: 'checklist', label: 'CHECKLIST', icon: ClipboardCheck },
  { id: 'averbacao', label: 'APURAÇÃO', icon: FileCheck2 },
  { id: 'sm_creator', label: 'SPM', icon: Share2 },
  { id: 'controle', label: 'PRÉ-ANÁLISE', icon: Sliders },
  { id: 'escala', label: 'ESCALA', icon: Calendar },
  { id: 'presence', label: 'CALENDÁRIO', icon: CalendarDays },
  { id: 'rotas', label: 'ROTAS', icon: Route },
];

interface OrbitalSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export default function OrbitalSidebar({
  activeTab,
  onSelectTab,
}: OrbitalSidebarProps) {
  return (
    <aside className="w-52 sm:w-60 h-full bg-[#080a0f] border-r border-white/10 flex flex-col justify-between p-3.5 select-none shrink-0 z-30 font-sans shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
      
      {/* TOP SECTION: ORBITAL GLOW LOGO + BRAND */}
      <div className="flex flex-col gap-6">
        
        {/* Glowing Orbital Logo */}
        <div className="flex items-center gap-3 px-1 py-1 cursor-pointer" onClick={() => onSelectTab('menu')}>
          <div className="relative w-10 h-10 rounded-full bg-[#12151e] border border-[#ff3b4b]/40 flex items-center justify-center shadow-[0_0_20px_rgba(255,59,75,0.35)] shrink-0 group">
            {/* Outer Orbit Ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-[#ff3b4b]/60 animate-spin-slow" />
            
            {/* Core Icon */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7a0c16] via-[#c4161c] to-[#ff3b4b] flex items-center justify-center shadow-inner">
              <span className="text-white text-[11px] font-black leading-none">3C</span>
            </div>
          </div>

          <div className="flex flex-col text-left leading-none">
            <span className="text-[13px] font-black tracking-wider text-white font-heading uppercase">
              OBSERVATÓRIO
            </span>
            <span className="text-[9px] font-mono font-bold text-[#ff3b4b] uppercase tracking-widest mt-0.5">
              3 CORAÇÕES GR
            </span>
          </div>
        </div>

        {/* NAVIGATION ITEMS LIST */}
        <nav className="flex flex-col gap-1.5 w-full">
          {ORBITAL_SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  "w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all cursor-pointer font-sans relative group text-left",
                  isActive
                    ? "bg-[#18090d] text-white border-l-4 border-l-[#ff3b4b] border-t border-r border-b border-[#ff3b4b]/30 shadow-[0_0_20px_rgba(255,59,75,0.2)] font-black"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent font-bold"
                )}
              >
                {/* Active Glowing Dot */}
                {isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ff3b4b] shadow-[0_0_8px_#ff3b4b]" />
                )}

                <Icon 
                  size={16} 
                  className={cn(
                    "shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-[#ff3b4b]" : "text-slate-500 group-hover:text-slate-300"
                  )} 
                />

                <span className="text-xs uppercase tracking-wider block">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* FOOTER LIVE STATUS */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ff3b4b] animate-ping" />
          <span className="text-slate-300 font-bold">SISTEMA EM ÓRBITA</span>
        </div>
        <span className="text-[#ff3b4b] font-black">v2026.10</span>
      </div>

    </aside>
  );
}
