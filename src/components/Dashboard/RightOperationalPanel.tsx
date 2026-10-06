import React, { useState } from 'react';
import { MapPin, Compass, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import truckThumb from '../../assets/images/sidebar_truck_red_1790209039511.jpg';
import AssetAllocationModal from '../AssetAllocationModal';

interface RightOperationalPanelProps {
  onNavigateToRotas?: () => void;
  onNavigateToEscala?: () => void;
  onNavigateToControle?: () => void;
}

export default function RightOperationalPanel({
  onNavigateToRotas,
  onNavigateToEscala,
  onNavigateToControle,
}: RightOperationalPanelProps) {
  const [showAssetModal, setShowAssetModal] = useState(false);

  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5 select-none overflow-hidden">
      
      {/* ========================================================================= */}
      {/* CARD 1: OPERAÇÃO GLOBAL (ONLINE)                                          */}
      {/* ========================================================================= */}
      <article className="flex-1 bg-[#fffdfa] rounded-[18px] border border-[#ded5c6] p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-0">
        
        {/* Header: OPERAÇÃO GLOBAL + ONLINE Badge */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-100/80 border border-red-200 flex items-center justify-center text-[#8d1118] shrink-0">
              <span className="text-[12px] leading-none">♡</span>
            </div>
            <span className="font-black text-[12px] uppercase tracking-wider text-stone-900 font-sans">
              OPERAÇÃO GLOBAL
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider shadow-xs">
            ONLINE
          </span>
        </div>

        {/* Gauge 1: 100% Cobertura Ativa de Pátio e Frota + Caminhão 3D */}
        <div className="flex items-center justify-between gap-2.5 py-1">
          {/* Circular Gauge */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#e5dccf" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="113.1"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[12px] font-black font-mono text-stone-900">100%</span>
            </div>
          </div>

          <div className="leading-tight text-left flex-1 min-w-0">
            <span className="text-[10px] font-black text-stone-900 uppercase tracking-tight block">
              COBERTURA ATIVA
            </span>
            <span className="text-[8px] font-bold text-stone-500 uppercase tracking-wider block mt-0.5">
              DE PÁTIO E FROTA
            </span>
          </div>

          {/* 3D Truck Thumbnail */}
          <div className="w-18 h-11 rounded-xl overflow-hidden border border-stone-200 shadow-xs shrink-0 bg-stone-100">
            <img 
              src={truckThumb} 
              alt="Frota Ativa"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Gauge 2: 98% Processamento da Operação + Barras Ascendentes */}
        <div className="flex items-center justify-between gap-2.5 py-1">
          {/* Circular Gauge */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#e5dccf" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="113.1"
                strokeDashoffset="2.2"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[12px] font-black font-mono text-stone-900">98%</span>
            </div>
          </div>

          <div className="leading-tight text-left flex-1 min-w-0">
            <span className="text-[10px] font-black text-stone-900 uppercase tracking-tight block">
              PROCESSAMENTO
            </span>
            <span className="text-[8px] font-bold text-stone-500 uppercase tracking-wider block mt-0.5">
              DA OPERAÇÃO
            </span>
            <span className="text-[8.5px] font-bold text-[#8d1118] uppercase tracking-wider block mt-0.5">
              EFICIÊNCIA ↳
            </span>
          </div>

          {/* 3D Ascending Bars Graphic with gloss and depth */}
          <div className="flex items-end gap-1 h-10 w-16 shrink-0 justify-end pr-1">
            <div className="w-2.5 h-[35%] rounded-t-sm bg-gradient-to-t from-[#c28e26] to-[#ffd87d] shadow-xs" />
            <div className="w-2.5 h-[50%] rounded-t-sm bg-gradient-to-t from-[#c28e26] to-[#ffd87d] shadow-xs" />
            <div className="w-2.5 h-[65%] rounded-t-sm bg-gradient-to-t from-[#d97706] to-[#fde68a] shadow-xs" />
            <div className="w-2.5 h-[80%] rounded-t-sm bg-gradient-to-t from-[#0d9488] to-[#2dd4bf] shadow-xs" />
            <div className="w-2.5 h-[100%] rounded-t-sm bg-gradient-to-t from-[#8d1118] to-[#ef4444] shadow-xs" />
          </div>
        </div>

        {/* Bottom Banner: Alocação de Ativos */}
        <div 
          onClick={() => setShowAssetModal(true)}
          className="pt-2 border-t border-stone-200/80 flex items-center justify-between cursor-pointer hover:opacity-85 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-[#8d1118]">
              <span className="text-[10px]">♡</span>
            </div>
            <div className="leading-tight text-left">
              <span className="text-[9.5px] font-black text-stone-900 uppercase tracking-tight block">
                ALOCAÇÃO DE ATIVOS
              </span>
              <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider block">
                DISTRIBUIÇÃO DA FROTA POR REGIÃO
              </span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-600 shadow-2xs">
            <Compass size={12} className="text-[#8d1118]" />
          </div>
        </div>

      </article>

      {/* ========================================================================= */}
      {/* CARD 2: ALOCAÇÃO DE ATIVOS (DONUT 3D + REGIÕES + BOTÃO DETALHAMENTO)      */}
      {/* ========================================================================= */}
      <article className="flex-1 bg-[#fffdfa] rounded-[18px] border border-[#ded5c6] p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-between min-h-0">
        
        {/* Header */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-full bg-red-100/80 border border-red-200 flex items-center justify-center text-[#8d1118] shrink-0">
            <span className="text-[12px] leading-none">♡</span>
          </div>
          <div className="text-left">
            <h3 className="text-[12px] font-black text-stone-900 tracking-wide uppercase font-sans">
              ALOCAÇÃO DE ATIVOS
            </h3>
            <p className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider">
              DISTRIBUIÇÃO DA FROTA POR REGIÃO
            </p>
          </div>
        </div>

        {/* Body: Donut 3D + Region Breakdown */}
        <div className="flex items-center justify-between gap-3 my-auto py-1">
          
          {/* 3D Segmented Donut with Central 42 */}
          <div 
            onClick={() => setShowAssetModal(true)}
            className="relative w-28 h-28 shrink-0 flex items-center justify-center cursor-pointer group/donut"
            title="Clique para ver detalhamento de ativos"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-md transition-transform group-hover/donut:scale-105 duration-300">
              {/* Sudeste 33% (Dourado/Amarelo #f59e0b) */}
              <path d="M 100 20 A 80 80 0 0 1 176 124 L 142 116 A 45 45 0 0 0 100 55 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="2"/>
              {/* Sul 21% (Ciano/Azul #06b6d4) */}
              <path d="M 176 124 A 80 80 0 0 1 100 180 L 100 145 A 45 45 0 0 0 142 116 Z" fill="#06b6d4" stroke="#ffffff" strokeWidth="2"/>
              {/* Nordeste 17% (Verde #10b981) */}
              <path d="M 100 180 A 80 80 0 0 1 32 142 L 62 124 A 45 45 0 0 0 100 145 Z" fill="#10b981" stroke="#ffffff" strokeWidth="2"/>
              {/* Centro-Oeste 14% (Laranja #f97316) */}
              <path d="M 32 142 A 80 80 0 0 1 32 58 L 62 76 A 45 45 0 0 0 62 124 Z" fill="#f97316" stroke="#ffffff" strokeWidth="2"/>
              {/* Norte 14% (Vermelho #ef4444) */}
              <path d="M 32 58 A 80 80 0 0 1 100 20 L 100 55 A 45 45 0 0 0 62 76 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2"/>
            </svg>

            {/* Inner Spherical Center with the Number 42 */}
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-[#fffaf0] via-[#f7ebd9] to-[#ebdcc2] border-2 border-[#dfb15b] shadow-md flex items-center justify-center">
              <span className="text-xl font-black text-amber-950 font-mono">42</span>
            </div>
          </div>

          {/* Region Breakdown List */}
          <div className="flex-1 flex flex-col gap-1.5 text-[9.5px] text-left">
            <div 
              onClick={() => setShowAssetModal(true)}
              className="flex items-center justify-between cursor-pointer hover:bg-amber-50/70 p-0.5 rounded transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                <span className="font-bold text-stone-800 uppercase tracking-tight">SUDESTE</span>
              </div>
              <span className="font-mono font-black text-stone-900 text-[10px]">
                14 <span className="text-[8px] font-normal text-stone-500">(33%)</span>
              </span>
            </div>

            <div 
              onClick={() => setShowAssetModal(true)}
              className="flex items-center justify-between cursor-pointer hover:bg-amber-50/70 p-0.5 rounded transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shrink-0" />
                <span className="font-bold text-stone-800 uppercase tracking-tight">SUL</span>
              </div>
              <span className="font-mono font-black text-stone-900 text-[10px]">
                9 <span className="text-[8px] font-normal text-stone-500">(21%)</span>
              </span>
            </div>

            <div 
              onClick={() => setShowAssetModal(true)}
              className="flex items-center justify-between cursor-pointer hover:bg-amber-50/70 p-0.5 rounded transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
                <span className="font-bold text-stone-800 uppercase tracking-tight">NORDESTE</span>
              </div>
              <span className="font-mono font-black text-stone-900 text-[10px]">
                7 <span className="text-[8px] font-normal text-stone-500">(17%)</span>
              </span>
            </div>

            <div 
              onClick={() => setShowAssetModal(true)}
              className="flex items-center justify-between cursor-pointer hover:bg-amber-50/70 p-0.5 rounded transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shrink-0" />
                <span className="font-bold text-stone-800 uppercase tracking-tight">CENTRO-OESTE</span>
              </div>
              <span className="font-mono font-black text-stone-900 text-[10px]">
                6 <span className="text-[8px] font-normal text-stone-500">(14%)</span>
              </span>
            </div>

            <div 
              onClick={() => setShowAssetModal(true)}
              className="flex items-center justify-between cursor-pointer hover:bg-amber-50/70 p-0.5 rounded transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
                <span className="font-bold text-stone-800 uppercase tracking-tight">NORTE</span>
              </div>
              <span className="font-mono font-black text-stone-900 text-[10px]">
                6 <span className="text-[8px] font-normal text-stone-500">(14%)</span>
              </span>
            </div>
          </div>

        </div>

        {/* Action Button: VER DETALHAMENTO */}
        <button
          type="button"
          onClick={() => setShowAssetModal(true)}
          className="w-full py-2 rounded-xl bg-[#f0e7da] hover:bg-[#e6dccb] border border-[#ded5c6] text-[9.5px] font-black uppercase tracking-widest text-stone-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-[0.99]"
        >
          <span>VER DETALHAMENTO</span>
          <ChevronRight size={13} className="text-[#8d1118]" />
        </button>

      </article>

      {/* Asset Allocation Detailed Modal */}
      <AssetAllocationModal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
      />

    </div>
  );
}
