import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  ClipboardCheck, 
  FileCheck2, 
  Radio, 
  Sliders, 
  FileSpreadsheet, 
  Truck, 
  Calendar, 
  Route,
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavigationDrawerProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettings?: () => void;
}

export default function NavigationDrawer({
  activeTab,
  onSelectTab,
  onOpenSettings,
}: NavigationDrawerProps) {
  // Estado inicial: menu recolhido (fechado) por padrão
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Fechar o menu ao pressionar a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const menuItems = [
    { id: 'menu', label: 'INÍCIO', subtitle: 'PAINEL CENTRAL', icon: Home },
    { id: 'checklist', label: 'CHECKLIST', subtitle: 'DIVERGÊNCIAS', icon: ClipboardCheck },
    { id: 'averbacao', label: 'AVERBAÇÃO', subtitle: 'SEGUROS DE CARGA', icon: FileCheck2 },
    { id: 'sm_creator', label: 'SM', subtitle: 'MONITORAMENTO', icon: Radio },
    { id: 'controle', label: 'PRÉ-ALERTA', subtitle: 'ISCAS & CONTROLE PGR', icon: Sliders },
    { id: 'disponibilidade', label: 'DISPONIBILIDADE', subtitle: 'VEÍCULOS PÁTIO', icon: Truck },
    { id: 'escala', label: 'ESCALA 3C', subtitle: 'PLANTÃO LOGÍSTICO', icon: FileSpreadsheet },
    { id: 'presence', label: 'CALENDÁRIO', subtitle: 'FREQUÊNCIA & AGENDA', icon: Calendar },
    { id: 'rotas', label: 'ROTAS', subtitle: 'P&R E DESTINOS', icon: Route },
  ];

  const handleSelect = (id: string) => {
    onSelectTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. ESTADO RECOLHIDO: BOTÃO QUADRADO JUNTO À BORDA ESQUERDA     */}
      {/* ============================================================== */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir Menu Operacional"
          title="Abrir Menu Operacional"
          className="fixed left-3 top-[82px] z-40 w-11 h-11 rounded-xl bg-[#121619] hover:bg-[#1a2024] text-[#e5c27a] hover:text-[#fff5db] border border-[rgba(201,151,62,0.35)] hover:border-[rgba(201,151,62,0.7)] shadow-[0_4px_16px_rgba(0,0,0,0.65),0_0_10px_rgba(201,151,62,0.15)] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group select-none"
        >
          <Menu size={22} className="stroke-[2.3] transition-transform group-hover:scale-105" />
        </button>
      )}

      {/* ============================================================== */}
      {/* 2. BACKDROP OVERLAY (FECHA AO CLICAR FORA)                      */}
      {/* ============================================================== */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity duration-250"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ============================================================== */}
      {/* 3. COLUNA LATERAL EXPANDIDA (DRAWER SOBREPOSTO PREMIUM 3C)     */}
      {/* ============================================================== */}
      <aside 
        aria-label="Menu Operacional"
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-[310px] sm:w-[330px] max-w-[88vw] border-r border-[rgba(201,151,62,0.3)] shadow-[15px_0_50px_rgba(0,0,0,0.92)] flex flex-col select-none transition-transform duration-250 ease-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        style={{
          background: 'radial-gradient(ellipse 260px 180px at 15% 0%, rgba(201,151,62,0.12), transparent 70%), linear-gradient(180deg, #0b0e12 0%, #07090b 55%, #040506 100%)'
        }}
      >
        {/* CABEÇALHO DO MENU */}
        <div className="pt-4 px-4 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            {/* Logo 3 Corações + Título Menu Operacional */}
            <div className="flex items-center gap-2.5">
              {/* Emblema Circular Vermelho 3 Corações com corações dourados */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d41a22] via-[#b3141d] to-[#7f0b12] border-2 border-[#fff5db]/80 shadow-[0_0_14px_rgba(212,26,34,0.6)] flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                <div className="flex items-center justify-center -space-x-0.5 mb-0.5">
                  <span className="text-[#ffd700] text-[10px] leading-none drop-shadow-xs">♥</span>
                  <span className="text-[#ffd700] text-[12px] leading-none -translate-y-0.5 drop-shadow-xs">♥</span>
                  <span className="text-[#ffd700] text-[10px] leading-none drop-shadow-xs">♥</span>
                </div>
                <span className="text-white text-[5.5px] font-black tracking-tight leading-none uppercase">
                  3corações
                </span>
              </div>

              {/* Divisor vertical dourado */}
              <div className="h-7 w-[1px] bg-gradient-to-b from-transparent via-[#c9973e]/60 to-transparent" />

              {/* Textos: Menu Operacional / Painel Central */}
              <div className="flex flex-col justify-center leading-none">
                <span className="text-[13px] font-black text-[#e5c27a] tracking-wider uppercase font-sans drop-shadow-xs">
                  MENU OPERACIONAL
                </span>
                <span className="text-[8.5px] font-bold text-[#a87930] tracking-widest uppercase mt-0.5 font-sans">
                  PAINEL CENTRAL DO SISTEMA
                </span>
              </div>
            </div>

            {/* Botão de Fechar claramente visível no cabeçalho */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar Menu"
              title="Fechar Menu"
              className="w-8 h-8 rounded-xl bg-[#14181c] hover:bg-[#20262b] text-[#e5c27a] hover:text-[#fff5db] border border-[rgba(201,151,62,0.35)] flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <X size={17} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Divisor / Friso curvo com reflexo dourado */}
          <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(201,151,62,0.45)] to-transparent" />
        </div>

        {/* LISTA DE PÁGINAS NAVEGÁVEIS */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const isDisponibilidade = item.id === 'disponibilidade';
            const IconComponent = item.icon;

            // Destaque em vermelho estilo 3D para DISPONIBILIDADE ou item ativo
            if (isDisponibilidade || isActive) {
              const showFullActiveRed = isDisponibilidade || isActive;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer text-left relative overflow-hidden group active:scale-[0.99]",
                    showFullActiveRed
                      ? "bg-gradient-to-r from-[#d71920] via-[#bd141b] to-[#7f0b10] border border-red-400/50 shadow-[0_0_24px_rgba(215,25,32,0.7),inset_0_1px_1px_rgba(255,255,255,0.35)]"
                      : "bg-white/[0.03] hover:bg-white/[0.06] border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Indicador de ponto luminoso no item ativo */}
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] shrink-0 animate-pulse" />

                    {/* Ícone 3D em caixa vermelha glossy */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#ef2a32] via-[#d71920] to-[#990c11] border border-red-300/40 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                      <IconComponent size={19} className="stroke-[2.5]" />
                    </div>

                    {/* Título & Subtítulo */}
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-[12px] font-black text-white uppercase tracking-tight font-sans truncate drop-shadow-xs">
                        {item.label}
                      </span>
                      <span className="text-[8.5px] font-bold text-white/85 uppercase tracking-wider font-sans truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Lado direito: Badge ATIVO + Chevron */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-[#8a0b10] border border-red-300/40 text-[8.5px] font-black text-white uppercase tracking-wider shadow-inner">
                      ATIVO
                    </span>
                    <ChevronRight size={16} className="text-white/90 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            }

            // Itens regulares com design premium escuro e detalhes dourados
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer group text-left hover:bg-white/[0.04] border border-transparent hover:border-[rgba(201,151,62,0.2)] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Caixa 3D do ícone com aro dourado metálico */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1c2227] via-[#14191d] to-[#0d1013] border border-[rgba(201,151,62,0.32)] shadow-[0_4px_12px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] flex items-center justify-center text-[#e5c27a] group-hover:border-[#e5c27a]/60 group-hover:shadow-[0_0_12px_rgba(201,151,62,0.3)] transition-all shrink-0 group-hover:scale-105">
                    <IconComponent size={19} className="stroke-[2.2]" />
                  </div>

                  {/* Título & Subtítulo */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[12px] font-black text-white group-hover:text-[#fff5db] uppercase tracking-tight font-sans truncate">
                      {item.label}
                    </span>
                    <span className="text-[8.5px] font-semibold text-[#a8a39a] uppercase tracking-wider font-sans truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                {/* Seta Chevron dourada */}
                <ChevronRight 
                  size={16} 
                  className="text-[#c9973e]/60 group-hover:text-[#e5c27a] group-hover:translate-x-0.5 transition-all shrink-0" 
                />
              </button>
            );
          })}
        </div>

        {/* RODAPÉ DO MENU: CONFIGURAÇÕES & PÁGINAS */}
        <div className="p-3 pt-2 border-t border-[rgba(201,151,62,0.22)] shrink-0 bg-[#06080a]/90">
          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#14181c] via-[#0f1215] to-[#14181c] hover:bg-[#1a2024] text-stone-200 hover:text-white border border-[rgba(201,151,62,0.35)] hover:border-[#e5c27a] transition-all cursor-pointer group shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Settings size={17} className="text-[#e5c27a] group-hover:rotate-45 transition-transform" />
              <span className="h-3.5 w-[1px] bg-[rgba(201,151,62,0.4)]" />
              <span className="text-[10px] font-black uppercase tracking-wider font-sans text-stone-200 group-hover:text-white">
                CONFIGURAÇÕES & PÁGINAS
              </span>
            </div>
            <ChevronRight size={15} className="text-[#c9973e] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </aside>
    </>
  );
}
