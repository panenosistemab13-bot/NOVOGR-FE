import React from 'react';

export default function OperationalFooter() {
  return (
    <footer className="w-full h-10 px-6 bg-[#080a0c] border-t border-[rgba(201,151,62,0.18)] flex items-center justify-between text-xs select-none shrink-0 z-20">
      
      {/* Left: Juntos em todos os caminhos + 3 Corações emblem */}
      <div className="flex items-center gap-2">
        <span className="font-serif italic text-[#f4f0e8] text-[13px] tracking-wide">
          Juntos em todos os caminhos
        </span>
        <div className="w-5 h-5 rounded-full bg-[#d41a22] flex items-center justify-center shadow-[0_0_8px_rgba(212,26,34,0.5)]">
          <span className="text-white text-[10px] leading-none">♥</span>
        </div>
      </div>

      {/* Center: 3 CORAÇÕES | LOGÍSTICA | PESSOAS | RESULTADOS */}
      <div className="hidden md:flex items-center gap-4 text-[10px] font-black tracking-widest text-[#a8a39a] uppercase">
        <span className="text-white">3 CORAÇÕES</span>
        <span className="text-[#c9973e]/40">|</span>
        <span>LOGÍSTICA</span>
        <span className="text-[#c9973e]/40">|</span>
        <span>PESSOAS</span>
        <span className="text-[#c9973e]/40">|</span>
        <span>RESULTADOS</span>
      </div>

      {/* Right: Juntos vamos mais longe + 3 Corações emblem */}
      <div className="flex items-center gap-2">
        <span className="font-serif italic text-[#f4f0e8] text-[13px] tracking-wide">
          Juntos vamos mais longe
        </span>
        <div className="w-5 h-5 rounded-full bg-[#d41a22] flex items-center justify-center shadow-[0_0_8px_rgba(212,26,34,0.5)]">
          <span className="text-white text-[10px] leading-none">♥</span>
        </div>
      </div>

    </footer>
  );
}
