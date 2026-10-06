import React from 'react';
import { MapPin, FileText, ChevronRight, Shield, Target, Package, Compass } from 'lucide-react';
import heroRedConvoy from '../../assets/images/hero_red_convoy_3c_1790406399003.jpg';

interface CinematicHeroProps {
  onLaunchRoute?: () => void;
  onViewProtocols?: () => void;
}

export default function CinematicHero({
  onLaunchRoute,
  onViewProtocols
}: CinematicHeroProps) {
  return (
    <section className="relative w-full h-[235px] xl:h-[248px] rounded-[18px] overflow-hidden border border-[#ded5c6]/90 shadow-[0_6px_25px_rgba(30,18,10,0.12)] bg-stone-950 flex items-center select-none shrink-0 group">
      
      {/* Background: Photorealistic 4K red convoy on highway at sunset */}
      <img
        src={heroRedConvoy}
        alt="Frota Café Três Corações na Rodovia"
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01] group-hover:scale-[1.02] transition-transform duration-1000"
        referrerPolicy="no-referrer"
      />

      {/* Cinematic lighting gradients to ensure sharp typography and HUD contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

      {/* Subtle warm golden specular rim light across the top edge */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#dfb15b]/60 to-transparent pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 w-full h-full px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Left Hero Text & Call to Actions */}
        <div className="max-w-[470px] text-left flex flex-col justify-center">
          
          {/* Eyebrow with Pulsing Gold Dot */}
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-[#f3d498]/20 border border-[#f3d498]/60 flex items-center justify-center">
              <Compass size={10} className="text-[#f3d498] animate-[spin_10s_linear_infinite]" />
            </div>
            <span className="text-[9.5px] font-black uppercase tracking-[0.22em] text-[#f3d498] font-mono drop-shadow-xs">
              LOGÍSTICA OPERACIONAL
            </span>
          </div>

          {/* Main Headline with 3D Gold Embossed Gradient */}
          <h1 className="text-[34px] xl:text-[38px] font-black text-white tracking-tight leading-[0.92] uppercase mb-1.5 font-heading">
            LOGÍSTICA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#fed7aa] to-[#d97706] font-black drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              OMNIPRESENTE
            </span>
          </h1>

          {/* Description */}
          <p className="text-[11px] xl:text-[11.5px] text-stone-200 leading-relaxed font-medium mb-3.5 max-w-[430px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Conectando regiões, pessoas e oportunidades com segurança, eficiência e o sabor do Brasil em cada rota operada de norte a sul.
          </p>

          {/* Action Buttons matching reference */}
          <div className="flex items-center gap-3">
            {/* Launch Route Button */}
            <button 
              type="button"
              onClick={onLaunchRoute}
              className="px-4.5 py-2 rounded-full bg-gradient-to-r from-[#8d1118] via-[#a31523] to-[#58090e] hover:from-[#a31523] hover:to-[#8d1118] text-white text-[10.5px] font-black tracking-wider uppercase transition-all shadow-[0_4px_18px_rgba(141,17,24,0.55)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-[#dfb15b]/40 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                <MapPin size={11} className="stroke-[2.5]" />
              </div>
              <span>Lançar Nova Rota</span>
              <ChevronRight size={13} className="text-white/80" />
            </button>

            {/* View Protocols Button */}
            <button 
              type="button"
              onClick={onViewProtocols}
              className="px-4.5 py-2 rounded-full bg-[#fdfbf7]/90 hover:bg-white text-stone-900 text-[10.5px] font-black tracking-wider uppercase transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-[#ded5c6] cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-stone-800 shrink-0 shadow-inner">
                <FileText size={11} className="stroke-[2.5]" />
              </div>
              <span>Ver Protocolos</span>
              <ChevronRight size={13} className="text-stone-500" />
            </button>
          </div>

        </div>

        {/* Right Hero HUD Panel: Holographic Brazil Map & 3D Stat Badges */}
        <div className="w-[395px] h-[195px] xl:h-[205px] bg-[#0c1420]/80 backdrop-blur-md rounded-[18px] border border-white/20 p-3 shadow-[0_12px_36px_rgba(0,0,0,0.65)] flex items-center gap-3 shrink-0 self-center">
          
          {/* Holographic Mini Map of Brazil with glowing routes & nodes */}
          <div className="w-[185px] h-full relative shrink-0 border-r border-white/15 pr-2.5 flex items-center justify-center">
            <svg viewBox="0 0 200 180" className="w-full h-full select-none">
              <defs>
                <filter id="heroHoloGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="heroHoloMeshGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.04" />
                </radialGradient>
              </defs>

              {/* Wireframe Relief Contour Lines of Brazil */}
              <path 
                d="M 45,45 Q 85,22 135,28 T 175,60 T 180,105 T 145,150 T 90,165 T 55,120 T 35,75 Z" 
                fill="url(#heroHoloMeshGrad)"
                stroke="#38bdf8"
                strokeWidth="1.5"
                filter="url(#heroHoloGlow)"
              />
              <path 
                d="M 55,55 Q 90,38 125,40 T 160,68 T 165,100 T 135,135 T 95,145 T 65,110 T 48,80 Z" 
                fill="none"
                stroke="#22d3ee"
                strokeWidth="0.8"
                strokeDasharray="2 3"
                opacity="0.65"
              />

              {/* Glowing routes connecting key operational hubs */}
              <path d="M 60,65 L 110,65 L 140,95 L 125,130 L 95,152" fill="none" stroke="#22d3ee" strokeWidth="2.2" filter="url(#heroHoloGlow)" />
              <path d="M 110,65 L 125,130 M 140,95 L 165,85" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="3 2" />
              <path d="M 60,65 L 85,110 L 125,130" fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="2 2" />

              {/* Glowing Nodes */}
              <circle cx="60" cy="65" r="3.5" fill="#38bdf8" className="animate-pulse" filter="url(#heroHoloGlow)" />
              <circle cx="110" cy="65" r="3" fill="#f59e0b" />
              <circle cx="140" cy="95" r="3" fill="#22d3ee" />
              <circle cx="165" cy="85" r="2.8" fill="#10b981" />
              <circle cx="125" cy="130" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" filter="url(#heroHoloGlow)" />
              <circle cx="95" cy="152" r="3" fill="#22d3ee" />

              <text 
                x="102" 
                y="95" 
                textAnchor="middle" 
                fill="#ffffff" 
                opacity="0.9" 
                fontSize="12" 
                fontWeight="900" 
                letterSpacing="3"
                className="font-mono drop-shadow-[0_2px_8px_rgba(34,211,238,0.9)]"
              >
                BRASIL
              </text>
            </svg>
          </div>

          {/* 3 Vertical Stat Badges with 3D Metallic Golden Medals */}
          <div className="flex-1 flex flex-col justify-between h-full py-1">
            
            {/* Badge 1: + EFICIÊNCIA NAS ROTAS */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#dfb15b] via-[#c28e26] to-[#805a12] p-0.5 shadow-sm shrink-0 flex items-center justify-center border border-[#fff6d8]/60">
                <div className="w-full h-full rounded-full bg-stone-950/80 flex items-center justify-center text-[#dfb15b]">
                  <Target size={12} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="leading-tight text-left">
                <span className="text-[9.5px] font-black tracking-wide text-white uppercase block font-heading">
                  + EFICIÊNCIA
                </span>
                <span className="text-[7.5px] font-bold text-stone-300 uppercase tracking-widest block mt-0.5">
                  NAS ROTAS
                </span>
              </div>
            </div>

            {/* Badge 2: + SEGURANÇA NAS OPERAÇÕES */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#dfb15b] via-[#c28e26] to-[#805a12] p-0.5 shadow-sm shrink-0 flex items-center justify-center border border-[#fff6d8]/60">
                <div className="w-full h-full rounded-full bg-stone-950/80 flex items-center justify-center text-[#dfb15b]">
                  <Shield size={12} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="leading-tight text-left">
                <span className="text-[9.5px] font-black tracking-wide text-white uppercase block font-heading">
                  + SEGURANÇA
                </span>
                <span className="text-[7.5px] font-bold text-stone-300 uppercase tracking-widest block mt-0.5">
                  NAS OPERAÇÕES
                </span>
              </div>
            </div>

            {/* Badge 3: + RESULTADOS EM TODAS AS REGIÕES */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#dfb15b] via-[#c28e26] to-[#805a12] p-0.5 shadow-sm shrink-0 flex items-center justify-center border border-[#fff6d8]/60">
                <div className="w-full h-full rounded-full bg-stone-950/80 flex items-center justify-center text-[#dfb15b]">
                  <Package size={12} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="leading-tight text-left">
                <span className="text-[9.5px] font-black tracking-wide text-white uppercase block font-heading">
                  + RESULTADOS
                </span>
                <span className="text-[7.5px] font-bold text-stone-300 uppercase tracking-widest block mt-0.5">
                  EM TODAS AS REGIÕES
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
