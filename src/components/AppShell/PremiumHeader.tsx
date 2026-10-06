import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Sun, 
  Lock, 
  Home, 
  ClipboardCheck, 
  FileCheck2, 
  Share2, 
  Sliders, 
  Calendar, 
  CalendarDays, 
  Route,
  Truck 
} from 'lucide-react';

interface PremiumHeaderProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
  onNavigateHome?: () => void;
  onOpenSettings?: () => void;
}

export default function PremiumHeader({ 
  activeTab, 
  onSelectTab, 
  onNavigateHome, 
  onOpenSettings 
}: PremiumHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => setCurrentTime(new Date());
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
    return `${d < 10 ? '0' + d : d} ${m} ${y} · ${dayName}`;
  }, [currentTime]);

  // Navegação horizontal completa conforme solicitado
  const headerTabs = [
    { id: 'menu', label: 'INÍCIO', subtitle: '', icon: Home },
    { id: 'checklist', label: 'CHECKLIST', subtitle: 'Divergências', icon: ClipboardCheck },
    { id: 'averbacao', label: 'AVERBAÇÃO', subtitle: 'Seguros', icon: FileCheck2 },
    { id: 'sm_creator', label: 'SM', subtitle: 'Monitoramento', icon: Share2 },
    { id: 'controle', label: 'PRÉ-ALERTA', subtitle: 'Iscas & Alertas', icon: Sliders },
    { id: 'disponibilidade', label: 'DISPONIBILIDADE', subtitle: 'Veículos Pátio', icon: Truck },
    { id: 'escala', label: 'ESCALA 3C', subtitle: 'Plantão', icon: Calendar },
    { id: 'presence', label: 'CALENDÁRIO', subtitle: 'Frequência', icon: CalendarDays },
    { id: 'rotas', label: 'ROTAS', subtitle: 'PGR', icon: Route },
  ];

  return (
    <div className="w-full h-[76px] px-4 sm:px-6 flex items-center justify-between select-none relative font-sans bg-[#fbf8f3] border-b border-[#e8ded2] shadow-xs">
      
      {/* ------------------------------------------------------------- */}
      {/* LEFT: 3 CORAÇÕES LOGO EMBLEM + CENTRAL GR                      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-4 shrink-0">
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group"
          title="Central GR - 3 Corações"
        >
          {/* 3 Corações Circular Red Emblem */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d41a22] via-[#b3141d] to-[#0b1320] border-2 border-white shadow-[0_4px_12px_rgba(179,20,29,0.35)] flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
            {/* Corações icônicos estilizados */}
            <div className="flex items-center justify-center -space-x-1 mb-0.5">
              <span className="text-[#ffdf6d] text-[13px] leading-none">♥</span>
              <span className="text-[#ffea9f] text-[15px] leading-none -translate-y-0.5">♥</span>
              <span className="text-[#ffdf6d] text-[13px] leading-none">♥</span>
            </div>
            <span className="text-white text-[7.5px] font-black tracking-tight leading-none uppercase">
              3corações
            </span>
          </div>
          
          {/* Central GR Text Labels */}
          <div className="text-left leading-none flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-[#73675a] tracking-widest block uppercase mb-0.5">
              CENTRAL
            </span>
            <span className="text-[22px] font-black text-[#a8141d] tracking-tight block uppercase leading-none font-heading">
              GR
            </span>
            <span className="text-[7.5px] font-extrabold tracking-wider text-[#918373] block mt-0.5">
              3CORAÇÕES.COM.BR
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CENTER: CAPSULE NAVIGATION BAR (HORIZONAL TOPO)               */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden xl:flex items-center gap-1 bg-[#f4ece0] p-1.5 rounded-full border border-[#e4d8c7] shadow-inner">
        {headerTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab && onSelectTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-2 leading-tight ${
                isActive
                  ? 'bg-gradient-to-r from-[#be1620] via-[#a8141d] to-[#7d0b13] text-white shadow-[0_4px_14px_rgba(168,20,29,0.4)] border border-[#ff6b74]/30 scale-[1.02]'
                  : 'text-[#42382f] hover:text-[#a8141d] hover:bg-[#fffdfa]/80'
              }`}
            >
              {/* Icon Container */}
              <div className={`p-1 rounded-full ${isActive ? 'bg-white/20 text-white' : 'text-[#877869]'}`}>
                <IconComponent size={14} className="stroke-[2.2]" />
              </div>

              {/* Text Labels */}
              <div className="text-left flex flex-col justify-center">
                <span className={`text-[11px] font-black tracking-tight block uppercase ${isActive ? 'text-white' : 'text-[#1f1a16]'}`}>
                  {tab.label}
                </span>
                {tab.subtitle && (
                  <span className={`text-[7.5px] font-semibold block uppercase ${isActive ? 'text-white/80' : 'text-[#857667]'}`}>
                    {tab.subtitle}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT: NOTIFICATIONS, CLOCK, WEATHER & ADMIN LOCK             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex flex-col text-right leading-none">
          <span className="text-[12px] font-mono font-black text-[#1f1a16]">
            {formattedTime}
          </span>
          <span className="text-[9px] font-mono font-bold text-[#857667] mt-0.5 uppercase">
            {formattedDate}
          </span>
        </div>
      </div>

    </div>
  );
}
