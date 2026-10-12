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
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function NavigationDrawer({
  activeTab,
  onSelectTab,
  onOpenSettings,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
}: NavigationDrawerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = propSetIsOpen || setInternalIsOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

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
      {/* 2. BACKDROP OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity duration-250"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 3. EXPANDED SIDEBAR (MATCHING PRÉ-ALERTA INTERFACE STYLE) */}
      <aside 
        aria-label="Menu Operacional"
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-[310px] sm:w-[330px] max-w-[88vw] bg-[#F5EFE4] border-r border-[#D9C39B] shadow-[15px_0_50px_rgba(198,154,69,0.15)] flex flex-col select-none transition-transform duration-250 ease-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {/* HEADER */}
        <div className="pt-4 px-4 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d41a22] via-[#b3141d] to-[#7f0b12] border-2 border-[#D9C39B] shadow-[0_0_14px_rgba(212,26,34,0.3)] flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                <div className="flex items-center justify-center -space-x-0.5 mb-0.5">
                  <span className="text-white text-[10px] leading-none">♥</span>
                  <span className="text-white text-[12px] leading-none -translate-y-0.5">♥</span>
                  <span className="text-white text-[10px] leading-none">♥</span>
                </div>
                <span className="text-white text-[5.5px] font-black tracking-tight leading-none uppercase">
                  3corações
                </span>
              </div>

              <div className="h-7 w-[1px] bg-[#D9C39B]" />

              <div className="flex flex-col justify-center leading-none">
                <span className="text-[13px] font-black text-[#33291B] tracking-wider uppercase font-sans">
                  MENU OPERACIONAL
                </span>
                <span className="text-[8.5px] font-mono font-bold text-[#91651F] tracking-widest uppercase mt-1 bg-[#EEE2CD] px-2 py-0.5 rounded border border-[#D9C39B] inline-block">
                  PAINEL CENTRAL
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar Menu"
              title="Fechar Menu"
              className="w-8 h-8 rounded-xl bg-[#EEE2CD] hover:bg-[#E7D4AF] text-[#91651F] hover:text-[#33291B] border border-[#D9C39B] flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <X size={17} className="stroke-[2.5]" />
            </button>
          </div>

          <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-transparent via-[#D9C39B] to-transparent" />
        </div>

        {/* NAVIGATION LIST */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer group text-left relative overflow-hidden border active:scale-[0.99]",
                  isActive
                    ? "bg-[#DDB76B] text-[#33291B] border-[#C69A45] shadow-[0_0_15px_rgba(198,154,69,0.3)] font-black"
                    : "bg-[#FFF9EF] hover:bg-[#EEE2CD] text-[#33291B] border-[#D9C39B] hover:border-[#C69A45]"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 border",
                    isActive
                      ? "bg-[#33291B] text-[#DDB76B] border-[#33291B] font-black shadow-sm"
                      : "bg-[#FFF9EF] text-[#C69A45] border-[#D9C39B]"
                  )}>
                    <IconComponent size={19} className="stroke-[2.2]" />
                  </div>

                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[12px] font-black text-[#33291B] group-hover:text-[#91651F] uppercase tracking-tight font-sans truncate">
                      {item.label}
                    </span>
                    <span className="text-[9px] font-mono text-[#857662] uppercase tracking-wider font-semibold truncate mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-[#33291B] border border-[#33291B] text-[9px] font-mono font-black text-[#F5EFE4] uppercase tracking-widest">
                      ATIVO
                    </span>
                  )}
                  <ChevronRight 
                    size={16} 
                    className={cn(
                      "transition-transform",
                      isActive ? "text-[#33291B]" : "text-[#857662] group-hover:text-[#91651F] group-hover:translate-x-0.5"
                    )} 
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* FOOTER: SETTINGS */}
        <div className="p-3 pt-2 border-t border-[#D9C39B] shrink-0 bg-[#EEE2CD]">
          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#FFF9EF] hover:bg-[#E7D4AF] text-[#33291B] hover:text-[#91651F] border border-[#D9C39B] transition-all cursor-pointer group shadow-sm active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Settings size={17} className="text-[#C69A45] group-hover:rotate-45 transition-transform" />
              <span className="h-3.5 w-[1px] bg-[#D9C39B]" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#33291B]">
                CONFIGURAÇÕES & PÁGINAS
              </span>
            </div>
            <ChevronRight size={15} className="text-[#C69A45] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </aside>
    </>
  );
}
