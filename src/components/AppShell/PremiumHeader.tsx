import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { 
  Sun, 
  User, 
  MapPin, 
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
  currentUser?: { email: string; name: string; role: string } | null;
}

export default function PremiumHeader({ 
  activeTab,
  onNavigateHome, 
  onOpenWallpaper, 
  onOpenSettings, 
  onLogout, 
  isWallpaperOpen, 
  onToggleDrawer, 
  isAdmin = false,
  currentUser
}: PremiumHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const d = currentTime.getDate();
    const m = months[currentTime.getMonth()];
    const y = currentTime.getFullYear();
    return `${d < 10 ? '0' + d : d} ${m} ${y}`;
  }, [currentTime]);

  const formattedDayOfWeek = useMemo(() => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return days[currentTime.getDay()];
  }, [currentTime]);

  return (
    <header className="w-full h-[68px] bg-[#0D0F12] border-b border-[#1E232B] px-4 md:px-6 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0 z-30 select-none font-sans">
      
      {/* Left: Hamburger + Logo 3C + Brand Title + Location Badge */}
      <div className="flex items-center gap-3.5 shrink-0">
        <button 
          type="button"
          onClick={onToggleDrawer}
          className="w-10 h-10 rounded-xl bg-[#161920] border border-[#2A303C] hover:bg-[#202530] text-[#D4AF37] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
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
          <div className="w-11 h-11 rounded-full p-0.5 bg-[#161920] border-2 border-[#D4AF37] shadow-md flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
            <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
          </div>

          <div className="flex flex-col text-left leading-none">
            <span className="text-[17px] font-black text-white tracking-wider font-heading">
              CENTRAL GR
            </span>
            <span className="text-[8px] font-bold text-[#A8987E] tracking-[0.2em] uppercase mt-1">
              LOGÍSTICA QUE APROXIMA
            </span>
          </div>
        </div>

        {/* Location Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181C24] border border-[#2A313E] text-[11px] font-black text-white uppercase tracking-wider ml-1 shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-[#E08A28]" />
          <span>SANTA LUZIA - MG</span>
        </div>
      </div>

      {/* Right: Settings + 360° + Weather + Date/Time + User Profile Badge */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Settings button */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl bg-[#161920] border border-[#2A303C] hover:bg-[#202530] text-[#D4AF37] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Configurações & Páginas"
          >
            <Settings className="w-4 h-4 text-[#D4AF37]" />
          </button>
        )}

        {/* 360° button */}
        {onOpenWallpaper && (
          <button
            type="button"
            onClick={onOpenWallpaper}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161920] border border-[#2A303C] hover:bg-[#202530] text-[#38BDF8] transition-colors cursor-pointer shadow-2xs font-bold text-xs"
            title="Visualização 360°"
          >
            <Globe className="w-4 h-4 text-[#38BDF8]" />
            <span>360°</span>
          </button>
        )}

        {/* Weather chip */}
        <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#161920] border border-[#2A303C] shadow-2xs">
          <Sun className="w-5 h-5 text-[#F59E0B]" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[12px] font-black text-white">28°C</span>
            <span className="text-[8px] font-bold text-[#94A3B8] uppercase">Céu limpo</span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="hidden md:flex flex-col text-right leading-none px-3.5 py-1.5 rounded-xl bg-[#161920] border border-[#2A303C] shadow-2xs font-mono">
          <span className="text-[13px] font-black text-white">
            {formattedTime}
          </span>
          <span className="text-[8.5px] font-bold text-[#94A3B8] uppercase mt-1">
            {formattedDate} - {formattedDayOfWeek}
          </span>
        </div>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-[#161920] hover:bg-[#202530] border border-[#2A303C] transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-full border border-[#D4AF37] overflow-hidden flex items-center justify-center bg-[#252C38]">
              <User className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[11px] font-black text-white tracking-wide uppercase">
                {currentUser?.name || loggedUser?.name || 'JEFFERSON'}
              </span>
              <span className="text-[8.5px] font-semibold text-[#94A3B8]">
                {currentUser?.role || loggedUser?.role || 'admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {showUserDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserDropdown(false)} 
              />
              <div className="absolute right-0 mt-2 w-52 bg-[#161920] border border-[#2A303C] rounded-2xl shadow-xl py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-[#2A303C] text-zinc-400">
                  <p className="font-bold text-white uppercase">{currentUser?.name || loggedUser?.name || 'JEFFERSON'}</p>
                  <p className="text-[10px] text-[#D4AF37] font-bold">
                    {currentUser?.role === 'admin' ? 'Acesso Administrador Fixo' : 'Acesso Operacional'}
                  </p>
                </div>
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenSettings();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#202530] flex items-center gap-2 text-zinc-200 font-semibold cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{currentUser?.role === 'admin' ? 'Configurações & Páginas' : 'Meu Perfil / Senha'}</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
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
