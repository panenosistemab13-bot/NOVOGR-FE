import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { 
  Sun, 
  User, 
  MapPin,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Menu,
  Settings 
} from 'lucide-react';

interface PremiumHeaderProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
  onNavigateHome?: () => void;
  onOpenSettings?: () => void;
  onOpenWallpaper?: () => void;
  onLogout?: () => void;
  isWallpaperOpen?: boolean;
  onToggleDrawer?: () => void;
  isAdmin?: boolean; 
}

export default function PremiumHeader({ 
  onNavigateHome, 
  onOpenWallpaper,
  onOpenSettings,
  onLogout,
  isWallpaperOpen,
  onToggleDrawer,
  isAdmin = false 
}: PremiumHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loggedUser, setLoggedUser] = useState({ name: 'Jefferson', role: 'Administrador' });

  useEffect(() => {
    import('../../firebase').then(({ auth }) => {
      const user = auth.currentUser;
      if (user) {
        let name = user.displayName || 'Usuário';
        if (name.toLowerCase() === 'jeff') name = 'Jefferson'; 
        setLoggedUser({
          name: name,
          role: 'Administrador'
        });
      }
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  }, [currentTime]);

  const formattedDate = useMemo(() => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const d = currentTime.getDate();
    const m = months[currentTime.getMonth()];
    const y = currentTime.getFullYear();
    const dayName = days[currentTime.getDay()];
    return `${d < 10 ? '0' + d : d} ${m} ${y} - ${dayName}`;
  }, [currentTime]);

  return (
    <header className="w-full h-[70px] px-4 sm:px-6 flex items-center justify-between select-none relative font-sans bg-[#0B1012]/95 backdrop-blur-md border-b border-[rgba(201,151,62,0.20)] shadow-[0_4px_20px_rgba(0,0,0,0.6)] z-30">
      
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleDrawer}
          aria-label="Abrir Menu Operacional"
          title="Abrir Menu Operacional"
          className="w-10 h-10 rounded-xl bg-[#121A26] hover:bg-[#172231] text-[#D6A84F] hover:text-white border border-[#D6A84F]/35 hover:border-[#D6A84F]/70 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group shrink-0"
        >
          <Menu size={20} className="stroke-[2.3] transition-transform group-hover:scale-105" />
        </button>

        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3.5 cursor-pointer group"
          title="Central GR - 3 Corações"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d41a22] via-[#b3141d] to-[#7f0b12] border-2 border-white/90 shadow-[0_0_18px_rgba(212,26,34,0.5)] flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
            <div className="flex items-center justify-center -space-x-1 mb-0.5">
              <span className="text-white text-[11px] leading-none drop-shadow-xs">♥</span>
              <span className="text-white text-[13px] leading-none -translate-y-0.5 drop-shadow-xs">♥</span>
              <span className="text-white text-[11px] leading-none drop-shadow-xs">♥</span>
            </div>
            <span className="text-white text-[6px] font-black tracking-tight leading-none uppercase">
              3corações
            </span>
          </div>
          
          <div className="text-left leading-none flex flex-col justify-center">
            <span className="text-[17px] font-black text-white tracking-tight uppercase leading-none font-sans drop-shadow-sm">
              CENTRAL GR
            </span>
            <span className="text-[8px] font-bold tracking-widest text-[#a8a39a] block uppercase mt-1">
              LOGÍSTICA QUE APROXIMA
            </span>
          </div>
        </div>

        <div className="hidden sm:block h-7 w-[1px] bg-stone-700/60" />

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(201,151,62,0.12)] border border-[rgba(201,151,62,0.25)] text-[#e5c27a] text-[10px] font-black uppercase tracking-wider">
          <MapPin size={11} className="text-red-500" />
          <span>SANTA LUZIA - MG</span>
        </div>
      </div>

      <div className="flex sm:hidden items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(201,151,62,0.12)] border border-[rgba(201,151,62,0.25)] text-[#e5c27a] text-[9px] font-black uppercase tracking-wider">
        <MapPin size={10} className="text-red-500" />
        <span>SANTA LUZIA - MG</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-[#141c21] hover:bg-[#1a2329] text-[#e5c27a] border-[rgba(201,151,62,0.3)] shadow-[0_0_10px_rgba(201,151,62,0.15)] transition-all cursor-pointer border"
            title="Configurações"
          >
            <Settings size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={onOpenWallpaper}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-sm",
            isWallpaperOpen
              ? "bg-gradient-to-r from-emerald-600 to-teal-800 text-white border-emerald-400/40"
              : "bg-[#141c21] hover:bg-[#1a2329] text-[#e5c27a] border-[rgba(201,151,62,0.3)] shadow-[0_0_10px_rgba(201,151,62,0.15)]"
          )}
          title={isWallpaperOpen ? "Voltar a exibir as páginas dos aplicativos" : "Ver 360°"}
        >
          <span>{isWallpaperOpen ? '↩️' : '🌐'}</span>
          <span className="hidden sm:inline">
            {isWallpaperOpen ? 'Exibir Páginas' : '360°'}
          </span>
        </button>

        <div className="hidden lg:block h-7 w-[1px] bg-stone-700/60" />

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12181b] border border-stone-700/80 text-left">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Sun size={14} className="animate-spin-slow" />
          </div>
          <div className="leading-none flex flex-col">
            <span className="text-[11px] font-black text-white uppercase flex items-center gap-1">
              <span>28°C</span>
            </span>
            <span className="text-[8.5px] font-semibold text-stone-400 mt-0.5">
              Céu limpo
            </span>
          </div>
        </div>

        <div className="hidden sm:block h-7 w-[1px] bg-stone-700/60" />

        <div className="hidden sm:flex flex-col text-right leading-none px-2.5 py-1.5 rounded-xl bg-[#12181b] border border-stone-700/80">
          <span className="text-[12px] font-mono font-black text-[#e5c27a] tracking-wider">
            {formattedTime}
          </span>
          <span className="text-[8px] font-mono font-bold text-stone-400 mt-0.5 uppercase tracking-wide">
            {formattedDate}
          </span>
        </div>

        <div className="hidden md:block h-7 w-[1px] bg-stone-700/60" />

        <div className="relative">
          <div 
            onClick={() => setShowUserDropdown(prev => !prev)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#e5c27a]/30 transition-all cursor-pointer group select-none"
            title="Opções de perfil / Encerrar sessão"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] p-0.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#12181b] flex items-center justify-center text-[#e5c27a]">
                <User size={15} />
              </div>
            </div>
            <div className="hidden md:flex flex-col text-left leading-none">
              <span className="text-[11.5px] font-black text-white uppercase tracking-tight group-hover:text-[#e5c27a] transition-colors">
                {loggedUser.name}
              </span>
              <span className="text-[8.5px] font-semibold text-stone-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck size={10} className="text-[#e5c27a]" />
                {loggedUser.role}
              </span>
            </div>
            <ChevronDown size={13} className="text-stone-400 group-hover:text-[#e5c27a] transition-transform ml-0.5" />
          </div>

          {showUserDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserDropdown(false)} 
              />

              <div className="absolute right-0 mt-2 top-full w-60 bg-[#121417] border border-[#C5A059] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.7)] p-3 z-50 text-xs font-sans text-[#FAF7F0] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="pb-2.5 mb-2.5 border-b border-[#C5A059]/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#181A1D] border border-[#C5A059] flex items-center justify-center text-[#C5A059] font-black shrink-0">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col text-left leading-tight truncate">
                    <span className="text-xs font-black uppercase text-white truncate">{loggedUser.name}</span>
                    <span className="text-[9px] font-bold text-[#C5A059] uppercase">{loggedUser.role}</span>
                    <span className="text-[8px] font-mono text-stone-400 truncate mt-0.5">Sessão ativa</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout?.();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#C91F2D]/15 hover:bg-[#C91F2D] text-red-200 hover:text-white border border-[#C91F2D]/40 font-black uppercase text-[10.5px] tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Encerrar e voltar ao login</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
