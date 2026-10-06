import React, { useState } from 'react';
import { Truck, Warehouse, Package, Download, X, Clock, MapPin } from 'lucide-react';

interface TelemetryPanelProps {
  onInspectStatus?: (status: string) => void;
}

export default function TelemetryPanel({ onInspectStatus }: TelemetryPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const STATUS_DETAILS: Record<string, Array<{ plate: string; hub: string; detail: string }>> = {
    'VEÍCULOS EM ROTA': [
      { plate: 'BRA2E19', hub: 'Três Corações -> SP', detail: '74 km/h • ETA: 1h 20m' },
      { plate: 'RJX8K44', hub: 'Rio de Janeiro -> BH', detail: '68 km/h • ETA: 2h 45m' },
      { plate: 'POA4L88', hub: 'Curitiba -> Porto Alegre', detail: '76 km/h • ETA: 3h 10m' },
      { plate: 'BSB5K70', hub: 'Brasília -> Goiânia', detail: '78 km/h • ETA: 45m' },
      { plate: 'SSA3P90', hub: 'Salvador -> Feira de Santana', detail: '75 km/h • ETA: 50m' },
    ],
    'EM PÁTIO': [
      { plate: 'MGZ9F10', hub: 'Pátio Três Corações (MG)', detail: 'Pronto para Carregamento' },
      { plate: 'FLN2J77', hub: 'CD Sul Florianópolis', detail: 'Em Espera de Rota' },
      { plate: 'BEL3W99', hub: 'Pátio Ananindeua (PA)', detail: 'Inspeção Pré-Viagem' },
      { plate: 'NAT8G22', hub: 'CD Natal (RN)', detail: 'Conferência de Lacre' },
    ],
    'CARREGANDO': [
      { plate: 'SPO3B82', hub: 'Doca 04 - Santos (SP)', detail: 'Cápsulas Três Corações (85%)' },
      { plate: 'CXS5X12', hub: 'Doca 02 - Caxias do Sul (RS)', detail: 'Café Solúvel (60%)' },
      { plate: 'GYN9H33', hub: 'Doca 01 - Goiânia (GO)', detail: 'Café Tradicional 500g (90%)' },
    ],
    'DESCARREGANDO': [
      { plate: 'ESP1M04', hub: 'Doca 07 - Vitória (ES)', detail: 'Descarregando Café Solúvel' },
      { plate: 'FOR1D55', hub: 'Doca 03 - Sobral (CE)', detail: 'Descarregando Café Almofada' },
      { plate: 'CPS7C91', hub: 'Doca 02 - Ribeirão Preto (SP)', detail: 'Descarregando Cappuccinos' },
    ],
  };

  const handleCardClick = (statusName: string) => {
    setSelectedStatus(prev => prev === statusName ? null : statusName);
    if (onInspectStatus) onInspectStatus(statusName);
  };

  return (
    <article className="bg-[#fffdfa] rounded-[18px] border border-[#ded5c6] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full select-none overflow-hidden relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5.5 h-5.5 rounded-full bg-red-100/80 border border-red-200 flex items-center justify-center text-[#8d1118] shrink-0">
            <span className="text-[11px] leading-none">♡</span>
          </div>
          <div className="text-left">
            <h3 className="text-[11.5px] font-black text-stone-900 tracking-wide uppercase font-sans">
              TELEMETRIA TÁTICA
            </h3>
            <p className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider">
              FLUXO DE MOVIMENTAÇÃO 24H
            </p>
          </div>
        </div>

        {/* Top Right Legend */}
        <div className="flex items-center gap-2.5 text-[7.5px] font-bold text-stone-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff1744] shadow-xs glow-red" />
            <span className="text-stone-700">FLUXO KM</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-xs glow-cyan" />
            <span className="text-stone-700">VELOCIDADE</span>
          </div>
        </div>
      </div>

      {/* 24h Movement Area Curve Chart in Dark Tactical Cockpit Canvas */}
      <div className="relative w-full flex-1 min-h-[140px] bg-slate-950 rounded-xl border border-stone-800 p-2.5 flex flex-col justify-between shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)] overflow-hidden">
        
        <div className="flex h-full w-full">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-[7.5px] font-mono text-slate-400 font-bold pr-2.5 border-r border-slate-800 shrink-0 select-none">
            <span>80</span>
            <span>60</span>
            <span>40</span>
            <span>20</span>
            <span>0</span>
          </div>

          {/* Area of Waves */}
          <div className="flex-1 pl-2.5 relative h-full flex flex-col justify-between">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-15 pointer-events-none">
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
            </div>

            {/* SVG Dual Wave Exact Curve */}
            <div className="w-full h-full relative">
              <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Translucent fill under Cyan wave */}
                <path d="M 20 130 Q 125 100 250 60 T 480 80 L 480 160 L 20 160 Z" fill="url(#cyanGrad)" />

                {/* Superior Red Neon Wave */}
                <path 
                  d="M 20 100 C 80 80, 120 40, 180 60 C 240 80, 270 20, 330 40 C 390 60, 420 10, 480 30" 
                  fill="none" 
                  stroke="#ff1744" 
                  strokeWidth="3" 
                  className="glow-red"
                />

                {/* Inferior Cyan Neon Wave */}
                <path 
                  d="M 20 130 C 80 120, 120 90, 180 100 C 240 110, 270 60, 330 80 C 390 100, 420 60, 480 80" 
                  fill="none" 
                  stroke="#00e5ff" 
                  strokeWidth="3" 
                  className="glow-cyan"
                />

                {/* White luminous dots along Red Wave */}
                <circle cx="20" cy="100" r="4" fill="#ffffff" stroke="#ff1744" strokeWidth="2" />
                <circle cx="130" cy="48" r="4" fill="#ffffff" stroke="#ff1744" strokeWidth="2" />
                <circle cx="250" cy="70" r="4" fill="#ffffff" stroke="#ff1744" strokeWidth="2" />
                <circle cx="330" cy="40" r="4" fill="#ffffff" stroke="#ff1744" strokeWidth="2" />
                <circle cx="420" cy="20" r="4" fill="#ffffff" stroke="#ff1744" strokeWidth="2" />

                {/* White luminous dots along Cyan Wave */}
                <circle cx="20" cy="130" r="4" fill="#ffffff" stroke="#00e5ff" strokeWidth="2" />
                <circle cx="130" cy="95" r="4" fill="#ffffff" stroke="#00e5ff" strokeWidth="2" />
                <circle cx="250" cy="105" r="4" fill="#ffffff" stroke="#00e5ff" strokeWidth="2" />
                <circle cx="330" cy="80" r="4" fill="#ffffff" stroke="#00e5ff" strokeWidth="2" />
                <circle cx="420" cy="68" r="4" fill="#ffffff" stroke="#00e5ff" strokeWidth="2" />
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[7.5px] font-mono text-slate-400 font-bold mt-1">
              <span>00h</span>
              <span>06h</span>
              <span>12h</span>
              <span>18h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4 Telemetry Under-Grid Cards matching reference */}
      <div className="grid grid-cols-4 gap-1.5 mt-2 shrink-0">
        <button
          type="button"
          onClick={() => handleCardClick('VEÍCULOS EM ROTA')}
          className={`bg-slate-900/90 hover:bg-slate-800 rounded-xl p-1.5 text-center border transition-all cursor-pointer shadow-xs text-white ${
            selectedStatus === 'VEÍCULOS EM ROTA' ? 'border-[#ff1744] ring-1 ring-[#ff1744]' : 'border-slate-800'
          }`}
        >
          <Truck size={13} className="mx-auto text-amber-400" />
          <span className="text-[6.5px] font-bold text-slate-300 uppercase tracking-tighter block mt-0.5">VEÍCULOS EM ROTA</span>
          <span className="text-xs font-black text-white font-mono block">32</span>
        </button>

        <button
          type="button"
          onClick={() => handleCardClick('EM PÁTIO')}
          className={`bg-slate-900/90 hover:bg-slate-800 rounded-xl p-1.5 text-center border transition-all cursor-pointer shadow-xs text-white ${
            selectedStatus === 'EM PÁTIO' ? 'border-[#00e5ff] ring-1 ring-[#00e5ff]' : 'border-slate-800'
          }`}
        >
          <Warehouse size={13} className="mx-auto text-cyan-400" />
          <span className="text-[6.5px] font-bold text-slate-300 uppercase tracking-tighter block mt-0.5">EM PÁTIO</span>
          <span className="text-xs font-black text-white font-mono block">8</span>
        </button>

        <button
          type="button"
          onClick={() => handleCardClick('CARREGANDO')}
          className={`bg-slate-900/90 hover:bg-slate-800 rounded-xl p-1.5 text-center border transition-all cursor-pointer shadow-xs text-white ${
            selectedStatus === 'CARREGANDO' ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-800'
          }`}
        >
          <Package size={13} className="mx-auto text-amber-300" />
          <span className="text-[6.5px] font-bold text-slate-300 uppercase tracking-tighter block mt-0.5">CARREGANDO</span>
          <span className="text-xs font-black text-white font-mono block">6</span>
        </button>

        <button
          type="button"
          onClick={() => handleCardClick('DESCARREGANDO')}
          className={`bg-slate-900/90 hover:bg-slate-800 rounded-xl p-1.5 text-center border transition-all cursor-pointer shadow-xs text-white ${
            selectedStatus === 'DESCARREGANDO' ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-slate-800'
          }`}
        >
          <Download size={13} className="mx-auto text-emerald-400" />
          <span className="text-[6.5px] font-bold text-slate-300 uppercase tracking-tighter block mt-0.5">DESCARREGANDO</span>
          <span className="text-xs font-black text-white font-mono block">4</span>
        </button>
      </div>

      {/* Selected Status Flyout Drawer */}
      {selectedStatus && (
        <div className="absolute inset-x-2 bottom-14 bg-stone-900/95 border border-stone-700 rounded-xl p-3 z-30 shadow-2xl backdrop-blur-md text-left text-white animate-fade-in">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 mb-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
              {selectedStatus} — Amostra Telemetria
            </span>
            <button
              type="button"
              onClick={() => setSelectedStatus(null)}
              className="text-stone-400 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {STATUS_DETAILS[selectedStatus]?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9px] bg-stone-800/80 p-1.5 rounded border border-stone-700">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-300">{item.plate}</span>
                  <span className="text-stone-300">{item.hub}</span>
                </div>
                <span className="text-emerald-400 font-mono">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </article>
  );
}
