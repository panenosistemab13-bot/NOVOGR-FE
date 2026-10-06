import React from 'react';

export default function OperationalFooter() {
  return (
    <footer className="h-9 px-4 sm:px-6 bg-[#fbf8f3] border-t border-[#e8ded2] text-[#73675a] font-mono text-[10.5px] flex items-center justify-between select-none shrink-0 shadow-xs">
      {/* Left section: Fonte & timestamps */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-[#1a1614] font-bold">Fonte: Grupo 3 Corações GR</span>
        <span className="text-[#d4c5b1]">·</span>
        <span>Atualizado em: 10:14:08</span>
        <span className="text-[#d4c5b1]">·</span>
        <span className="hidden sm:inline">Coletado em: 19:14:49</span>
      </div>

      {/* Center section: Coletor Status */}
      <div className="hidden md:flex items-center gap-1.5 font-bold">
        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
        <span className="text-[#8a7c6e]">Coletor:</span>
        <span className="text-[#15803d]">137/137 painéis OK</span>
      </div>

      {/* Right section: Keyboard shortcuts */}
      <div className="hidden lg:flex items-center gap-3 text-[9.5px] text-[#8a7c6e]">
        <span><strong className="text-[#a8141d]">[F1]</strong> cargo</span>
        <span><strong className="text-[#a8141d]">[F2]</strong> UF</span>
        <span><strong className="text-[#a8141d]">[F3]</strong> mapa</span>
        <span><strong className="text-[#a8141d]">[F4]</strong> rodízio OFF</span>
        <span><strong className="text-[#a8141d]">[F5]</strong> tela cheia</span>
      </div>
    </footer>
  );
}
