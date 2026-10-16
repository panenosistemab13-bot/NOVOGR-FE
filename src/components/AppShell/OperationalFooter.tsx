import React from 'react';
import { cn } from '../../lib/utils';

interface OperationalFooterProps {
  isDark?: boolean;
}

export default function OperationalFooter({ isDark = false }: OperationalFooterProps) {
  return (
    <footer className={cn(
      "w-full h-10 px-6 border-t flex items-center justify-between text-xs select-none shrink-0 z-20 font-sans bg-[#0D0F12] border-[#1E232B] text-white shadow-inner"
    )}>
      
      {/* Left: Juntos em todos os caminhos + 3 Corações emblem */}
      <div className="flex items-center gap-2">
        <span className="font-serif italic text-[13px] tracking-wide text-white">
          Juntos em todos os caminhos
        </span>
        <div className="w-5 h-5 rounded-full bg-[#d41a22] flex items-center justify-center shadow-xs">
          <span className="text-white text-[10px] leading-none">♥</span>
        </div>
      </div>

      {/* Center: 3 CORAÇÕES | LOGÍSTICA | PESSOAS | RESULTADOS */}
      <div className="hidden md:flex flex-col items-center leading-tight">
        <div className="flex items-center gap-3 text-[10px] font-black tracking-widest uppercase font-mono text-[#E5C175]">
          <span>3 CORAÇÕES</span>
          <span className="text-[#8C6D28]">|</span>
          <span>LOGÍSTICA</span>
          <span className="text-[#8C6D28]">|</span>
          <span>PESSOAS</span>
          <span className="text-[#8C6D28]">|</span>
          <span>RESULTADOS</span>
        </div>
        <span className="text-[9px] font-sans font-medium text-[#C5A059] lowercase mt-0.5">
          criado por jefferson augusto
        </span>
      </div>

      {/* Right: Juntos vamos mais longe + 3 Corações emblem */}
      <div className="flex items-center gap-2">
        <span className="font-serif italic text-[13px] tracking-wide text-white">
          Juntos vamos mais longe
        </span>
        <div className="w-5 h-5 rounded-full bg-[#d41a22] flex items-center justify-center shadow-xs">
          <span className="text-white text-[10px] leading-none">♥</span>
        </div>
      </div>

    </footer>
  );
}
