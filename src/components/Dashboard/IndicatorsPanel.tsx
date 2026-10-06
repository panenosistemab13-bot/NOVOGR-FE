import React from 'react';
import { Truck, Navigation, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export default function IndicatorsPanel() {
  return (
    <article className="bg-gradient-to-b from-[#fffefc] to-[#f9f3eb] rounded-[20px] border border-[#ded5c6] p-3 shadow-[0_8px_24px_rgba(46,29,16,0.06)] flex flex-col justify-between h-full select-none">
      
      {/* 3 Metric Rows */}
      <div className="flex flex-col justify-between flex-1 gap-1">
        
        {/* Metric 1: TOTAL DE ROTAS */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f7f0e6]/60 border border-[#e8dccf]">
          <div className="w-8 h-8 rounded-lg bg-[#ded0c0] flex items-center justify-center text-[#4a2e1d] shrink-0 shadow-xs">
            <Truck size={16} />
          </div>
          <div className="flex-1 text-left leading-none">
            <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider block">
              TOTAL DE ROTAS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[22px] font-black text-stone-900 font-mono">42</span>
              <span className="text-[8.5px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={10} /> 12%
              </span>
            </div>
            <span className="text-[7px] text-stone-400 block mt-0.5">vs. mês anterior</span>
          </div>
        </div>

        {/* Metric 2: DISTÂNCIA PERCORRIDA */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f7f0e6]/60 border border-[#e8dccf]">
          <div className="w-8 h-8 rounded-lg bg-[#ded0c0] flex items-center justify-center text-[#4a2e1d] shrink-0 shadow-xs">
            <Navigation size={16} />
          </div>
          <div className="flex-1 text-left leading-none">
            <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider block">
              DISTÂNCIA PERCORRIDA
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[20px] font-black text-stone-900 font-mono">12.480 <span className="text-[12px] font-sans font-bold">km</span></span>
              <span className="text-[8.5px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={10} /> 8%
              </span>
            </div>
            <span className="text-[7px] text-stone-400 block mt-0.5">vs. mês anterior</span>
          </div>
        </div>

        {/* Metric 3: TEMPO MÉDIO */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f7f0e6]/60 border border-[#e8dccf]">
          <div className="w-8 h-8 rounded-lg bg-[#ded0c0] flex items-center justify-center text-[#4a2e1d] shrink-0 shadow-xs">
            <Clock size={16} />
          </div>
          <div className="flex-1 text-left leading-none">
            <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider block">
              TEMPO MÉDIO
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[20px] font-black text-stone-900 font-mono">8h 24min</span>
              <span className="text-[8.5px] font-bold text-[#b91c1c] flex items-center gap-0.5">
                <TrendingDown size={10} /> 6%
              </span>
            </div>
            <span className="text-[7px] text-stone-400 block mt-0.5">vs. mês anterior</span>
          </div>
        </div>

      </div>

      {/* Operational Status Badges (Ativa, Carregada, Descarga, Parada) */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[#ebdcc9] mt-1 text-[8.5px] font-bold text-stone-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
          <span>Ativa: 32</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-xs" />
          <span>Carregada: 5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-xs" />
          <span>Descarga: 3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-xs" />
          <span>Parada: 2</span>
        </div>
      </div>

    </article>
  );
}
