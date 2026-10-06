import React from 'react';
import { UserCheck, ChevronRight } from 'lucide-react';

interface FleetAllocationProps {
  onViewDetails?: () => void;
}

export default function FleetAllocation({ onViewDetails }: FleetAllocationProps) {
  return (
    <article className="bg-[#fffdfa] rounded-[22px] border border-[#ded5c9] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full select-none overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="w-6.5 h-6.5 rounded-full bg-red-100 flex items-center justify-center text-[#8e0b18] shrink-0">
          <UserCheck size={13} />
        </div>
        <div className="text-left">
          <h3 className="text-[12px] font-black text-stone-900 tracking-wide uppercase font-sans">
            Alocação de Ativos
          </h3>
          <p className="text-[8px] font-bold text-stone-500 uppercase tracking-wider">
            Distribuição da frota por região
          </p>
        </div>
      </div>

      {/* 3D Glossy Donut Chart Area + Region Breakdown Legend */}
      <div className="flex items-center justify-between gap-4 my-1 flex-1">
        
        {/* 3D Volumetric Visual Donut with Specular Highlights and Radial Shading */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          <div 
            className="w-full h-full rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.18)] relative overflow-hidden"
            style={{
              background: 'conic-gradient(#8e0b18 0% 33%, #0d9488 33% 54%, #eab308 54% 71%, #ea580c 71% 85%, #facc15 85% 100%)'
            }}
          >
            {/* 3D Specular Highlight Ring Overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/25 via-transparent to-white/40 pointer-events-none" />
          </div>

          {/* Inner Cutout Cylinder with Depth & 42 TOTAL */}
          <div className="absolute inset-4.5 rounded-full bg-white shadow-[inset_0_3px_8px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center border border-stone-100">
            <span className="text-2xl font-black text-stone-900 leading-none font-mono">42</span>
            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">TOTAL</span>
          </div>
        </div>

        {/* Region List Legend matching Screenshot 1 */}
        <div className="flex-1 flex flex-col gap-1.5 text-[9px] text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8e0b18] shadow-2xs" />
              <span className="font-bold text-stone-800 uppercase">SUDESTE</span>
            </div>
            <span className="font-mono font-black text-stone-900">14 <span className="text-[7.5px] font-normal text-stone-400">(33%)</span></span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488] shadow-2xs" />
              <span className="font-bold text-stone-800 uppercase">SUL</span>
            </div>
            <span className="font-mono font-black text-stone-900">9 <span className="text-[7.5px] font-normal text-stone-400">(21%)</span></span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-2xs" />
              <span className="font-bold text-stone-800 uppercase">NORDESTE</span>
            </div>
            <span className="font-mono font-black text-stone-900">7 <span className="text-[7.5px] font-normal text-stone-400">(17%)</span></span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] shadow-2xs" />
              <span className="font-bold text-stone-800 uppercase">CENTRO-OESTE</span>
            </div>
            <span className="font-mono font-black text-stone-900">6 <span className="text-[7.5px] font-normal text-stone-400">(14%)</span></span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#facc15] shadow-2xs" />
              <span className="font-bold text-stone-800 uppercase">NORTE</span>
            </div>
            <span className="font-mono font-black text-stone-900">6 <span className="text-[7.5px] font-normal text-stone-400">(14%)</span></span>
          </div>
        </div>

      </div>

      {/* Action Button at bottom */}
      <button
        type="button"
        onClick={onViewDetails}
        className="w-full mt-2.5 py-2 rounded-xl bg-[#fdfbf7] hover:bg-stone-100 border border-[#ded5c6] text-[9.5px] font-bold uppercase tracking-widest text-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
      >
        <span>VER DETALHAMENTO</span>
        <ChevronRight size={13} className="text-[#8e0b18]" />
      </button>

    </article>
  );
}
