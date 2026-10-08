import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { 
  Sun, 
  User, 
  MapPin,
  ShieldCheck
} from 'lucide-react';

interface PremiumHeaderProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
  onNavigateHome?: () => void;
  onOpenSettings?: () => void;
  onOpenWallpaper?: () => void;
  isWallpaperOpen?: boolean;
}

export default function PremiumHeader({ 
  onNavigateHome, 
  onOpenWallpaper,
  isWallpaperOpen
}: PremiumHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
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
    <header className="w-full h-[76px] px-4 sm:px-6 flex items-center justify-between select-none relative font-sans bg-[#0d1012]/95 backdrop-blur-md border-b border-[rgba(201,151,62,0.22)] shadow-[0_8px_24px_rgba(0,0,0,0.7)] z-30">
      
      {/* ------------------------------------------------------------- */}
      {/* LEFT: 3 CORAÇÕES LOGO EMBLEM + CENTRAL GR + SANTA LUZIA - MG  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-4 shrink-0">
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3.5 cursor-pointer group"
          title="Central GR - 3 Corações"
        >
          {/* 3 Corações Circular Red Emblem */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d41a22] via-[#b3141d] to-[#7f0b12] border-2 border-white/90 shadow-[0_0_18px_rgba(212,26,34,0.5)] flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform shrink-0">
            <div className="flex items-center justify-center -space-x-1 mb-0.5">
              <span className="text-white text-[12px] leading-none drop-shadow-xs">♥</span>
              <span className="text-white text-[14px] leading-none -translate-y-0.5 drop-shadow-xs">♥</span>
              <span className="text-white text-[12px] leading-none drop-shadow-xs">♥</span>
            </div>
            <span className="text-white text-[6.5px] font-black tracking-tight leading-none uppercase">
              3corações
            </span>
          </div>
          
          {/* Central GR Text Labels & Location */}
          <div className="text-left leading-none flex flex-col justify-center">
            <div className="flex items-center gap-2.5">
              <span className="text-[18px] font-black text-white tracking-tight uppercase leading-none font-sans drop-shadow-sm">
                CENTRAL GR
              </span>
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(201,151,62,0.15)] border border-[rgba(201,151,62,0.3)] text-[#e5c27a] text-[9.5px] font-black uppercase tracking-wider">
                <MapPin size={10} />
                <span>SANTA LUZIA - MG</span>
              </div>
            </div>
            <span className="text-[8.5px] font-bold tracking-widest text-[#a8a39a] block uppercase mt-1.5">
              LOGÍSTICA QUE APROXIMA
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTER: LOCATION BADGE FOR MOBILE/TABLET                      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex sm:hidden items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(201,151,62,0.15)] border border-[rgba(201,151,62,0.3)] text-[#e5c27a] text-[9.5px] font-black uppercase tracking-wider">
        <MapPin size={10} />
        <span>SANTA LUZIA - MG</span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT: CLIMATE, CLOCK, USER PROFILE (JEFFERSON / ADMIN)       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {/* 360° Button */}
        <button
          onClick={onOpenWallpaper}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-sm",
            isWallpaperOpen
              ? "bg-gradient-to-r from-emerald-600 to-teal-800 text-white border-emerald-400/40"
              : "bg-[#171a1c] hover:bg-[#232628] text-[#e5c27a] border-[rgba(201,151,62,0.3)] shadow-[0_0_10px_rgba(201,151,62,0.15)]"
          )}
          title={isWallpaperOpen ? "Voltar a exibir as páginas dos aplicativos" : "Ver 360°"}
        >
          <span>{isWallpaperOpen ? '↩️' : '🌐'}</span>
          <span className="hidden sm:inline">
            {isWallpaperOpen ? 'Exibir Páginas' : '360°'}
          </span>
        </button>

        {/* Climate Widget */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131619] border border-[rgba(201,151,62,0.15)] text-left">
          <div className="w-6 h-6 rounded-full bg-[#e5c27a]/20 flex items-center justify-center text-[#e5c27a]">
            <Sun size={14} className="animate-spin-slow" />
          </div>
          <div className="leading-none flex flex-col">
            <span className="text-[10px] font-bold text-white uppercase">
              Santa Luzia - MG
            </span>
            <span className="text-[8.5px] font-semibold text-[#a8a39a] mt-0.5">
              <strong className="text-[#e5c27a]">27°C</strong> Operação Normal
            </span>
          </div>
        </div>

        {/* Clock & Date */}
        <div className="hidden sm:flex flex-col text-right leading-none px-2 py-1 rounded-xl bg-[#131619] border border-[rgba(201,151,62,0.15)]">
          <span className="text-[12px] font-mono font-black text-[#e5c27a] tracking-wider">
            {formattedTime}
          </span>
          <span className="text-[8.5px] font-mono font-bold text-[#a8a39a] mt-0.5 uppercase tracking-wide">
            {formattedDate}
          </span>
        </div>

        {/* User Profile: Jefferson | Administrador */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[rgba(201,151,62,0.2)]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-[#131619] flex items-center justify-center text-[#e5c27a]">
              <User size={16} />
            </div>
          </div>
          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-[11.5px] font-black text-white uppercase tracking-tight">
              Jefferson
            </span>
            <span className="text-[8.5px] font-semibold text-[#a8a39a] mt-0.5 flex items-center gap-1">
              <ShieldCheck size={10} className="text-[#e5c27a]" />
              Administrador
            </span>
          </div>
        </div>

      </div>

    </header>
  );
}
