import React from 'react';
import { MapPin, Settings, ChevronRight, Compass } from 'lucide-react';
import truckThumb from '../../assets/images/sidebar_truck_red_1790209039511.jpg';

interface OperationalKPIsProps {
  onNavigateToRotas?: () => void;
  onNavigateToEscala?: () => void;
}

export default function OperationalKPIs({
  onNavigateToRotas,
  onNavigateToEscala
}: OperationalKPIsProps) {
  return (
    <div className="flex flex-col gap-2.5 h-full justify-between select-none">
      
      {/* Card 1: OPERAÇÃO GLOBAL (Height: ~100px) */}
      <article 
        onClick={onNavigateToRotas}
        className="h-[98px] bg-[#fffdfa] rounded-[20px] border border-[#ded5c9] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between shrink-0 hover:border-stone-400 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider text-stone-900 font-sans">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-[#8e0b18]">
              <MapPin size={11} />
            </div>
            <span>OPERAÇÃO GLOBAL</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider border border-emerald-300">
            ONLINE
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mt-0.5">
          {/* Radial 100% Progress Ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" stroke="#e6dfd5" strokeWidth="3.5" fill="none" />
                <circle 
                  cx="22" 
                  cy="22" 
                  r="18" 
                  stroke="#10b981" 
                  strokeWidth="3.5" 
                  strokeDasharray="113.1" 
                  strokeDashoffset="0" 
                  strokeLinecap="round" 
                  fill="none" 
                />
              </svg>
              <span className="absolute text-[12px] font-black text-stone-900 font-mono tracking-tight">100%</span>
            </div>

            <div className="leading-tight text-left">
              <span className="text-[9px] font-black text-stone-800 uppercase tracking-tight block">
                COBERTURA ATIVA
              </span>
              <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider block mt-0.5">
                DE PÁTIO E FROTA
              </span>
            </div>
          </div>

          {/* Red Truck Photo Thumbnail */}
          <div className="w-16 h-11 rounded-xl overflow-hidden shadow-xs border border-stone-200 shrink-0">
            <img 
              src={truckThumb} 
              alt="Frota Ativa"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
            />
          </div>
        </div>
      </article>

      {/* Card 2: PROCESSAMENTO DA OPERAÇÃO (Height: ~106px) */}
      <article className="h-[106px] bg-[#fffdfa] rounded-[20px] border border-[#ded5c9] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider text-stone-900 font-sans">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
              <Settings size={11} />
            </div>
            <span>PROCESSAMENTO DA OPERAÇÃO</span>
          </div>
          <span 
            onClick={onNavigateToRotas} 
            className="px-2.5 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[8px] font-black uppercase tracking-wider border border-emerald-300 transition-colors cursor-pointer"
          >
            EFICIÊNCIA
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mt-0.5">
          {/* Radial 98% Progress Ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" stroke="#e6dfd5" strokeWidth="3.5" fill="none" />
                <circle 
                  cx="22" 
                  cy="22" 
                  r="18" 
                  stroke="#10b981" 
                  strokeWidth="3.5" 
                  strokeDasharray="113.1" 
                  strokeDashoffset="2.3" 
                  strokeLinecap="round" 
                  fill="none" 
                />
              </svg>
              <span className="absolute text-[12px] font-black text-stone-900 font-mono tracking-tight">98%</span>
            </div>

            <div className="leading-tight text-left">
              <span className="text-[9px] font-black text-stone-800 uppercase tracking-tight block">
                PROCESSAMENTO
              </span>
              <span className="text-[7.5px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                EFICIÊNCIA ↳
              </span>
            </div>
          </div>

          {/* 3D Ascending Bars with glossy cylindrical gradient, volume and highlights */}
          <div className="flex items-end gap-1.5 h-11 w-20 shrink-0 pr-1">
            <div className="w-2.5 h-[35%] rounded-t-sm bg-gradient-to-t from-[#c28e26] via-[#dfb15b] to-[#fff3cd] shadow-xs border-t border-white/60" />
            <div className="w-2.5 h-[50%] rounded-t-sm bg-gradient-to-t from-[#c28e26] via-[#dfb15b] to-[#fff3cd] shadow-xs border-t border-white/60" />
            <div className="w-2.5 h-[65%] rounded-t-sm bg-gradient-to-t from-[#c28e26] via-[#dfb15b] to-[#fff3cd] shadow-xs border-t border-white/60" />
            <div className="w-2.5 h-[80%] rounded-t-sm bg-gradient-to-t from-[#d97706] via-[#f59e0b] to-[#fef3c7] shadow-xs border-t border-white/60" />
            <div className="w-2.5 h-[100%] rounded-t-sm bg-gradient-to-t from-[#8e0b18] via-[#b51e2c] to-[#ff808d] shadow-xs border-t border-white/60" />
          </div>
        </div>
      </article>

      {/* Card 3: ALOCAÇÃO DE ATIVOS (Height: ~92px) */}
      <article 
        onClick={onNavigateToEscala}
        className="h-[92px] bg-[#fffdfa] rounded-[20px] border border-[#ded5c9] p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between shrink-0 cursor-pointer hover:border-stone-400 transition-all group relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider text-stone-900 font-sans">
            <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[#8e0b18]">
              <Compass size={11} />
            </div>
            <span>ALOCAÇÃO DE ATIVOS</span>
          </div>
          <ChevronRight size={14} className="text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
        </div>
        
        <div className="flex items-center justify-between pt-0.5">
          <div className="leading-tight text-left">
            <span className="text-[12px] font-black text-stone-900 uppercase tracking-tight block font-heading">
              DISTRIBUIÇÃO DA FROTA
            </span>
            <span className="text-[8px] font-bold text-stone-500 uppercase tracking-wider block mt-0.5">
              POR REGIÃO BRASIL
            </span>
          </div>

          <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#8e0b18] shadow-xs group-hover:scale-105 transition-transform">
            <MapPin size={17} className="text-[#8e0b18] drop-shadow-sm" />
          </div>
        </div>
      </article>

    </div>
  );
}
