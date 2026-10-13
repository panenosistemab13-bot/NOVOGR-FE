import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  MapPin, 
  Radio, 
  TrendingUp, 
  Truck, 
  Compass,
  Sparkles
} from 'lucide-react';
import { toAbsoluteUrl } from '../../utils/url';
import panoramicBg from '../../assets/images/panoramic_truck_sunset_1791630272932.jpg';
import brazilMapGold from '../../assets/images/brazil_map_gold_1791473887938.jpg';

export default function CinematicLogisticPanel() {
  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-[#1C160F] flex flex-col justify-between p-6 lg:p-8 font-sans">
      
      {/* 1. CINEMATIC BACKGROUND IMAGE (Caminhão na rodovia ao pôr do sol) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out hover:scale-105"
        style={{
          backgroundImage: `url(${toAbsoluteUrl(panoramicBg)})`,
          filter: 'brightness(0.92) contrast(1.08)'
        }}
      />

      {/* 2. GRADIENT OVERLAYS (Golden highlights and cinematic atmospheric light) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C160F]/95 via-[#2E2012]/50 to-[#1C160F]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFE4]/15 via-transparent to-[#2E2012]/40 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#DDB76B]/20 rounded-full blur-3xl pointer-events-none" />

      {/* 3. TOPO: BADGE INSTITUCIONAL E STATUS EM TEMPO REAL */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C160F]/80 backdrop-blur-md border border-[#DDB76B]/40 text-[#E7D4AF] text-xs font-black uppercase tracking-wider shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
          <Radio size={13} className="text-[#DDB76B]" />
          <span>FROTA CONECTADA • TEMPO REAL</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C160F]/80 backdrop-blur-md border border-[#D9C39B]/30 text-white text-[11px] font-mono font-bold shadow-md">
          <Compass size={13} className="text-[#DDB76B]" />
          <span>HUB SANTA LUZIA</span>
        </div>
      </div>

      {/* 4. CENTRO: MAPA DO BRASIL INTEGRADO COM CONEXÕES LOGÍSTICAS E MINAS GERAIS */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 py-2">
        <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
          
          {/* Subtle gold circular radar glow */}
          <div className="absolute inset-0 rounded-full border border-[#DDB76B]/25 animate-pulse" />
          <div className="absolute inset-8 rounded-full border border-[#DDB76B]/15" />
          <div className="absolute inset-16 rounded-full bg-gradient-to-tr from-[#C69A45]/10 to-transparent blur-md" />

          {/* Golden Brazil map container */}
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-[#DDB76B]/40 shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-sm bg-black/35 group">
            <img 
              src={toAbsoluteUrl(brazilMapGold)} 
              alt="Mapa Logístico Brasil"
              className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Pulsing Logistics Node: Minas Gerais (Santa Luzia) */}
            <div className="absolute top-[58%] left-[62%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DDB76B] opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C69A45] border-2 border-white shadow-lg" />
              </span>
              <span className="mt-1 px-2 py-0.5 rounded-md bg-[#1C160F]/90 border border-[#DDB76B] text-[9px] font-black text-[#DDB76B] font-mono tracking-wider whitespace-nowrap shadow-md">
                MG • SANTA LUZIA
              </span>
            </div>

            {/* Connecting lines SVG overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              {/* Santa Luzia to SP */}
              <line x1="62" y1="58" x2="56" y2="69" stroke="#DDB76B" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
              {/* Santa Luzia to RJ */}
              <line x1="62" y1="58" x2="68" y2="67" stroke="#DDB76B" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
              {/* Santa Luzia to Northeast */}
              <line x1="62" y1="58" x2="78" y2="35" stroke="#DDB76B" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
              {/* Santa Luzia to South */}
              <line x1="62" y1="58" x2="52" y2="82" stroke="#DDB76B" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
              {/* Santa Luzia to Central-West */}
              <line x1="62" y1="58" x2="48" y2="52" stroke="#DDB76B" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Título Institucional Central */}
        <div className="text-center mt-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDB76B]/15 border border-[#DDB76B]/30 mb-1.5">
            <Sparkles size={12} className="text-[#DDB76B]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E7D4AF]">
              REDE DE DISTRIBUIÇÃO NACIONAL
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] font-heading">
            LOGÍSTICA QUE APROXIMA
          </h2>
          <p className="text-xs text-[#E7D4AF]/90 font-medium max-w-sm mx-auto mt-1">
            Conectando nossas origens aos destinos com excelência operacional e rastreabilidade total.
          </p>
        </div>
      </div>

      {/* 5. BASE: 3 INDICADORES VISUAIS (SEGURANÇA, EFICIÊNCIA E PESSOAS) */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-3 pt-3 border-t border-[#DDB76B]/30">
        
        {/* Indicador 1: SEGURANÇA */}
        <div className="bg-[#1C160F]/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-[#DDB76B]/40 shadow-lg text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#C69A45]/20 border border-[#DDB76B]/50 flex items-center justify-center text-[#DDB76B] mb-1.5">
            <ShieldCheck size={18} />
          </div>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E7D4AF] block">
            SEGURANÇA
          </span>
          <span className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">
            100% PGR
          </span>
        </div>

        {/* Indicador 2: EFICIÊNCIA */}
        <div className="bg-[#1C160F]/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-[#DDB76B]/40 shadow-lg text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#C69A45]/20 border border-[#DDB76B]/50 flex items-center justify-center text-[#DDB76B] mb-1.5">
            <Zap size={18} />
          </div>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E7D4AF] block">
            EFICIÊNCIA
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono mt-0.5">
            99.8% SLA
          </span>
        </div>

        {/* Indicador 3: PESSOAS */}
        <div className="bg-[#1C160F]/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-[#DDB76B]/40 shadow-lg text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#C69A45]/20 border border-[#DDB76B]/50 flex items-center justify-center text-[#DDB76B] mb-1.5">
            <Users size={18} />
          </div>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E7D4AF] block">
            PESSOAS
          </span>
          <span className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">
            3C VALOR
          </span>
        </div>

      </div>

    </div>
  );
}
