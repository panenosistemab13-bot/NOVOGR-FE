import React from 'react';
import { cn } from '../../lib/utils';

interface OperationalFooterProps {
  isDark?: boolean;
}

export default function OperationalFooter({ isDark = true }: OperationalFooterProps) {
  return (
    <footer className={cn(
      "w-full h-10 px-6 border-t flex items-center justify-between text-xs select-none shrink-0 z-20 font-sans",
      isDark 
        ? "bg-[#080a0c] border-[rgba(201,151,62,0.18)] text-white" 
        : "bg-[#FFFEFC] border-[#E8DDCA] text-[#7D705C]"
    )}>
      
      {/* Left: Juntos em todos os caminhos + 3 Corações emblem */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "font-serif italic text-[13px] tracking-wide",
          isDark ? "text-[#f4f0e8]" : "text-[#7D705C]"
        )}>
          Juntos em todos os caminhos
        </span>
        <div className="w-5 h-5 rounded-full bg-[#d41a22] flex items-center justify-center shadow-xs">
          <span className="text-white text-[10px] leading-none">♥</span>
        </div>
      </div>

      {/* Center: 3 CORAÇÕES | LOGÍSTICA | PESSOAS | RESULTADOS */}
      <div className={cn(
        "hidden md:flex flex-col items-center gap-0.5 text-[10px] font-black tracking-widest uppercase font-mono",
        isDark ? "text-[#a8a39a]" : "text-[#8C7B63]"
      )}>
        <div className="flex items-center gap-4">
          <span className={isDark ? "text-white" : "text-[#25231F]"}>3 CORAÇÕES</span>
          <span className={isDark ? "text-[#c9973e]/40" : "text-[#D8B065]"}>|</span>
          <span>LOGÍSTICA</span>
          <span className={isDark ? "text-[#c9973e]/40" : "text-[#D8B065]"}>|</span>
          <span>PESSOAS</span>
          <span className={isDark ? "text-[#c9973e]/40" : "text-[#D8B065]"}>|</span>
          <span>RESULTADOS</span>
        </div>
        <span className="text-[9.5px] font-sans font-semibold tracking-normal text-[#c9973e] lowercase">
          criado por jefferson augusto
        </span>
      </div>

      {/* Right: Juntos vamos mais longe + 3 Corações emblem */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "font-serif italic text-[13px] tracking-wide",
          isDark ? "text-[#f4f0e8]" : "text-[#7D705C]"
        )}>
          Juntos vamos mais longe
        </span>
        <div className="w-5 h-5 rounded-full bg-[#d41a22] flex items-center justify-center shadow-xs">
          <span className="text-white text-[10px] leading-none">♥</span>
        </div>
      </div>

    </footer>
  );
}
