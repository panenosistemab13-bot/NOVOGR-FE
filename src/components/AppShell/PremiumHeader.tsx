import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { 
  Sun, 
  Cloud,
  User, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Menu, 
  Settings,
  Globe
} from 'lucide-react';
import goldMedalLogo from '../../assets/images/gold_logo_medal_3c_1790406432555.jpg';

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
  activeTab,
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
  const isDark = activeTab === 'menu';

  const [loggedUser, setLoggedUser] = useState(() => {
    try {
      const saved = localStorage.getItem('logged_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { name: 'JEFFERSON', role: 'admin' };
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('logged_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setLoggedUser(parsed);
        }
      }
    } catch {}

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
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
    return `${d < 10 ? '0' + d : d} ${m} ${y}`;
  }, [currentTime]);

  const formattedDayOfWeek = useMemo(() => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return days[currentTime.getDay()];
  }, [currentTime]);

  // =========================================================================
  // LIGHT HEADER (FOR ALL PAGES EXCEPT INÍCIO, EXACTLY MATCHING USER IMAGE)
  // =========================================================================
  if (!isDark) {
    return (
      <header className="w-full h-[68px] bg-[#FFFEFC] border-b border-[#E8DDCA] px-4 md:px-7 flex items-center justify-between shadow-[0_2px_10px_rgba(196,154,69,0.05)] shrink-0 z-30 select-none font-sans">
        
        {/* Left: Hamburger + Logo + Brand Title + Location */}
        <div className="flex items-center gap-3.5 shrink-0">
          <button 
            type="button"
            onClick={onToggleDrawer}
            className="w-9 h-9 rounded-xl hover:bg-[#F5EFE4] text-[#4A453E] hover:text-[#C49A45] flex items-center justify-center transition-colors cursor-pointer"
            title="Menu Operacional"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Logo Café Três Corações */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
            title="Central GR - 3 Corações"
          >
            <div className="w-10 h-10 rounded-full p-0.5 bg-white border-2 border-[#D8B065] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
              <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col text-left leading-none">
              <span className="text-[17px] font-black text-[#25231F] tracking-tight font-sans">
                CENTRAL GR
              </span>
              <span className="text-[8.5px] font-bold text-[#8C6D28] tracking-widest uppercase mt-0.5">
                LOGÍSTICA QUE APROXIMA
              </span>
            </div>
          </div>

          {/* Location Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EB] border border-[#E8DDCA] text-[10px] font-black text-[#6B5A3E] uppercase tracking-wider ml-1 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#C49A45]" />
            <span>SANTA LUZIA - MG</span>
          </div>
        </div>

        {/* Center: Calligraphy Tagline with subtle golden accent */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center">
          <span className="font-serif italic text-[#8C6D28] text-[16px] tracking-wide font-medium">
            Juntos movemos o que importa
          </span>
          <div className="w-32 h-[1.5px] bg-gradient-to-r from-transparent via-[#D8B065] to-transparent mt-0.5 opacity-80" />
        </div>

        {/* Right: Weather Chips + Date/Time + User Profile Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Weather 1 */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF5EB] border border-[#E8DDCA] shadow-2xs">
            <Sun className="w-4 h-4 text-[#D9A74A]" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[11px] font-black text-[#25231F]">36°</span>
              <span className="text-[8px] font-bold text-[#8C7B63] uppercase">ENSOLARADO</span>
            </div>
          </div>

          {/* Weather 2 */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF5EB] border border-[#E8DDCA] shadow-2xs">
            <Cloud className="w-4 h-4 text-[#999080]" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[11px] font-black text-[#25231F]">28°C</span>
              <span className="text-[8px] font-bold text-[#8C7B63] uppercase">CÉU LIMPO</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="hidden md:flex flex-col text-right leading-none px-3 py-1.5 rounded-xl bg-[#FAF5EB] border border-[#E8DDCA] shadow-2xs font-mono">
            <span className="text-[11px] font-black text-[#25231F]">
              {formattedDate}
            </span>
            <span className="text-[8.5px] font-bold text-[#8C7B63] uppercase mt-0.5">
              {formattedDayOfWeek} • {formattedTime}
            </span>
          </div>

          {/* User Profile Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-[#FAF5EB] hover:bg-[#F2EAE0] border border-[#E8DDCA] transition-all cursor-pointer shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D8B065] to-[#AA7E2F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[11px] font-black text-[#25231F] tracking-wide uppercase">
                  {loggedUser?.name || 'JEFFERSON'}
                </span>
                <span className="text-[8.5px] font-bold text-[#8C6D28] uppercase">
                  {loggedUser?.role === 'Administrador' ? 'admin' : (loggedUser?.role || 'admin')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7B63]" />
            </button>

            {showUserDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserDropdown(false)} 
                />
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E8DDCA] rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#E8DDCA] text-stone-500">
                    <p className="font-bold text-[#25231F] uppercase">{loggedUser?.name || 'JEFFERSON'}</p>
                    <p className="text-[10px] text-[#8C6D28] font-bold">Acesso Administrador Fixo</p>
                  </div>
                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenSettings();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#FAF5EB] flex items-center gap-2 text-[#25231F] font-semibold cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#C49A45]" />
                      <span>Configurações & Páginas</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sair do Sistema</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  // =========================================================================
  // DARK HEADER (STRICTLY FOR THE INÍCIO PAGE AS REQUESTED BY USER)
  // =========================================================================
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
          <div className="w-11 h-11 rounded-full p-0.5 bg-white border-2 border-[#D6A84F] shadow-[0_0_18px_rgba(214,168,79,0.3)] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform shrink-0">
            <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
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
            {formattedDate} - {formattedDayOfWeek}
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
