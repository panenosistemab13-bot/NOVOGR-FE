import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { 
  User, 
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

  const isDark = activeTab === 'menu';

  return (
    <header className={cn(
      "w-full h-[68px] px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none font-sans transition-colors duration-200",
      isDark 
        ? "bg-[#07080c] border-b border-stone-800 text-white shadow-md" 
        : "bg-white border-b border-slate-200 text-slate-800 shadow-xs"
    )}>
      
      {/* Left: Hamburger + Logo 3C + Brand Title + Location Badge */}
      <div className="flex items-center gap-3.5 shrink-0">
        <button 
          type="button"
          onClick={onToggleDrawer}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-2xs",
            isDark 
              ? "bg-stone-900 border border-stone-800 hover:bg-stone-800 text-[#E5C27A]" 
              : "bg-slate-100 border border-slate-300 hover:bg-slate-200 text-[#9A7B38]"
          )}
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
          <div className={cn(
            "w-11 h-11 rounded-full p-0.5 border-2 border-[#D4AF37] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden",
            isDark ? "bg-stone-900" : "bg-slate-50"
          )}>
            <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
          </div>

          <div className="flex flex-col text-left leading-none">
            <span className={cn(
              "text-[17px] font-black tracking-wider font-heading",
              isDark ? "text-white" : "text-slate-900"
            )}>
              CENTRAL GR
            </span>
            <span className={cn(
              "text-[8px] font-bold tracking-[0.2em] uppercase mt-1",
              isDark ? "text-[#E5C27A]" : "text-[#8C6D28]"
            )}>
              LOGÍSTICA QUE APROXIMA
            </span>
          </div>
        </div>
      </div>

      {/* Right: Settings + 360° + User Profile Badge */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* 360° button */}
        {onOpenWallpaper && (
          <button
            type="button"
            onClick={onOpenWallpaper}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs font-bold text-xs border",
              isDark
                ? "bg-stone-900 border-stone-800 hover:bg-stone-800 text-sky-400"
                : "bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-700"
            )}
            title="Visualização 360°"
          >
            <Globe className={cn("w-4 h-4", isDark ? "text-sky-400" : "text-sky-600")} />
            <span>360°</span>
          </button>
        )}

        {/* User Profile Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={cn(
              "flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs",
              isDark
                ? "bg-stone-900 hover:bg-stone-800 border-stone-800 text-white"
                : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-full border border-[#D4AF37] overflow-hidden flex items-center justify-center",
              isDark ? "bg-amber-950/70 text-amber-300" : "bg-amber-100 text-amber-800"
            )}>
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className={cn(
                "text-[11px] font-black tracking-wide uppercase",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {currentUser?.name || loggedUser?.name || 'JEFFERSON'}
              </span>
              <span className={cn(
                "text-[8.5px] font-semibold",
                isDark ? "text-stone-400" : "text-slate-500"
              )}>
                {currentUser?.role || loggedUser?.role || 'admin'}
              </span>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5", isDark ? "text-stone-400" : "text-slate-500")} />
          </button>

          {showUserDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserDropdown(false)} 
              />
              <div className={cn(
                "absolute right-0 mt-2 w-52 rounded-2xl shadow-xl py-2 z-50 text-xs border",
                isDark 
                  ? "bg-[#0e1014] border-stone-800 text-white" 
                  : "bg-white border-slate-200 text-slate-800"
              )}>
                <div className={cn(
                  "px-4 py-2 border-b",
                  isDark ? "border-stone-800 text-stone-300" : "border-slate-100 text-slate-600"
                )}>
                  <p className={cn("font-bold uppercase", isDark ? "text-white" : "text-slate-900")}>
                    {currentUser?.name || loggedUser?.name || 'JEFFERSON'}
                  </p>
                  <p className={cn("text-[10px] font-bold", isDark ? "text-[#E5C27A]" : "text-[#8C6D28]")}>
                    {currentUser?.role === 'admin' ? 'Acesso Administrador Fixo' : 'Acesso Operacional'}
                  </p>
                </div>
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenSettings();
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left flex items-center gap-2 font-semibold cursor-pointer",
                      isDark ? "hover:bg-stone-800 text-stone-200" : "hover:bg-slate-100 text-slate-700"
                    )}
                  >
                    <Settings className="w-3.5 h-3.5 text-[#E5C27A]" />
                    <span>{currentUser?.role === 'admin' ? 'Configurações & Páginas' : 'Meu Perfil / Senha'}</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-left flex items-center gap-2 font-semibold cursor-pointer",
                      isDark ? "hover:bg-rose-950/40 text-rose-400" : "hover:bg-rose-50 text-rose-600"
                    )}
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
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
