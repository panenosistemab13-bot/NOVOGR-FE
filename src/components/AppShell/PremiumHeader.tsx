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
    <header className="w-full h-[70px] px-4 sm:px-6 flex items-center justify-between select-none relative font-sans bg-[#0B1012]/95 backdrop-blur-md border-b border-[rgba(201,151,62,0.20)] shadow-[0_4px_20px_rgba(0,0,0,0.6)] z-30">
      
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
          
          {/* Central GR Text Labels */}
          <div className="text-left leading-none flex flex-col justify-center">
            <span className="text-[17px] font-black text-white tracking-tight uppercase leading-none font-sans drop-shadow-sm">
              CENTRAL GR
            </span>
            <span className="text-[8px] font-bold tracking-widest text-[#a8a39a] block uppercase mt-1">
              LOGÍSTICA QUE APROXIMA
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden sm:block h-7 w-[1px] bg-stone-700/60" />

        {/* Location Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(201,151,62,0.12)] border border-[rgba(201,151,62,0.25)] text-[#e5c27a] text-[10px] font-black uppercase tracking-wider">
          <MapPin size={11} className="text-red-500" />
          <span>SANTA LUZIA - MG</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTER: LOCATION BADGE FOR MOBILE ONLY                        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex sm:hidden items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(201,151,62,0.12)] border border-[rgba(201,151,62,0.25)] text-[#e5c27a] text-[9px] font-black uppercase tracking-wider">
        <MapPin size={10} className="text-red-500" />
        <span>SANTA LUZIA - MG</span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT: CLIMATE, CLOCK, USER PROFILE (JEFFERSON / ADMIN)       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {/* 360° Button */}
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

        {/* Vertical divider */}
        <div className="hidden lg:block h-7 w-[1px] bg-stone-700/60" />

        {/* Climate Widget: ☀ 28°C Céu limpo */}
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

        {/* Vertical divider */}
        <div className="hidden sm:block h-7 w-[1px] bg-stone-700/60" />

        {/* Clock & Date */}
        <div className="hidden sm:flex flex-col text-right leading-none px-2.5 py-1.5 rounded-xl bg-[#12181b] border border-stone-700/80">
          <span className="text-[12px] font-mono font-black text-[#e5c27a] tracking-wider">
            {formattedTime}
          </span>
          <span className="text-[8px] font-mono font-bold text-stone-400 mt-0.5 uppercase tracking-wide">
            {formattedDate}
          </span>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block h-7 w-[1px] bg-stone-700/60" />

        {/* User Profile: Jefferson | Administrador */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-[#12181b] flex items-center justify-center text-[#e5c27a]">
              <User size={15} />
            </div>
          </div>
          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-[11.5px] font-black text-white uppercase tracking-tight">
              Jefferson
            </span>
            <span className="text-[8.5px] font-semibold text-stone-400 mt-0.5 flex items-center gap-1">
              <ShieldCheck size={10} className="text-[#e5c27a]" />
              Administrador
            </span>
          </div>
        </div>

      </div>

    </header>
  );
}
