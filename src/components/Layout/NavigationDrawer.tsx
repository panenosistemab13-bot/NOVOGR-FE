import React, { useState } from 'react';
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
  Settings 
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
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'menu', label: 'INÍCIO', subtitle: 'Painel Central', icon: Home },
    { id: 'checklist', label: 'CHECKLIST', subtitle: 'Divergências', icon: ClipboardCheck },
    { id: 'averbacao', label: 'AVERBAÇÃO', subtitle: 'Seguros de Carga', icon: FileCheck2 },
    { id: 'sm_creator', label: 'SM', subtitle: 'Monitoramento', icon: Radio },
    { id: 'controle', label: 'PRÉ-ALERTA', subtitle: 'Iscas & Controle PGR', icon: Sliders },
    { id: 'disponibilidade', label: 'DISPONIBILIDADE', subtitle: 'Veículos Pátio', icon: Truck },
    { id: 'escala', label: 'ESCALA 3C', subtitle: 'Plantão Logístico', icon: FileSpreadsheet },
    { id: 'presence', label: 'CALENDÁRIO', subtitle: 'Frequência & Agenda', icon: Calendar },
    { id: 'rotas', label: 'ROTAS', subtitle: 'P&R e Destinos', icon: Route },
  ];

  const handleSelect = (id: string) => {
    onSelectTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. CONTINUOUS FIXED VERTICAL SIDEBAR (76px width)              */}
      {/* ============================================================== */}
      <aside className="w-[76px] shrink-0 h-full bg-[rgba(5,12,15,0.95)] backdrop-blur-md border-r border-[rgba(201,151,62,0.18)] flex flex-col items-center justify-between py-3 z-20 select-none">
        
        {/* Toggle Menu Button at Top */}
        <div className="flex flex-col items-center pb-2 border-b border-[rgba(201,151,62,0.15)] w-full">
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="w-11 h-11 rounded-xl bg-[#12181b] hover:bg-stone-800 text-[#e5c27a] hover:text-white border border-[rgba(201,151,62,0.25)] flex items-center justify-center transition-all cursor-pointer shadow-sm group active:scale-95"
            title={isOpen ? "Fechar Menu" : "Expandir Menu"}
          >
            {isOpen ? <X size={20} className="stroke-[2.5]" /> : <Menu size={22} className="stroke-[2.2]" />}
          </button>
        </div>

        {/* Vertical Icon Stack (Closed State: Only icons visible) */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-1.5 w-full my-auto overflow-y-auto py-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group",
                  isActive
                    ? "bg-[#D71920] text-white shadow-[0_0_16px_rgba(215,25,32,0.55)] border border-red-500/70"
                    : "text-stone-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
                title={item.label}
              >
                <IconComponent 
                  size={20} 
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    isActive ? "stroke-[2.5] text-white" : "stroke-[2]"
                  )} 
                />

                {/* Micro tooltip on hover */}
                <span className="absolute left-[80px] bg-[#0c1012] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-[rgba(201,151,62,0.3)] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Settings Button */}
        {onOpenSettings && (
          <div className="pt-2 border-t border-[rgba(201,151,62,0.15)] w-full flex justify-center">
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-11 h-11 rounded-xl text-stone-400 hover:text-[#e5c27a] hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer group"
              title="Configurações de Páginas"
            >
              <Settings size={20} className="stroke-[2] group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        )}
      </aside>

      {/* ============================================================== */}
      {/* 2. EXPANDED OVERLAY MENU (Overlaid on top, doesn't push layout) */}
      {/* ============================================================== */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={cn(
          "fixed left-0 top-[76px] bottom-0 z-50 w-[280px] bg-[rgba(5,12,15,0.98)] backdrop-blur-2xl border-r border-[rgba(201,151,62,0.25)] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col transition-transform duration-200 ease-out select-none",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {/* Top of Expanded Drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(201,151,62,0.18)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D71920] shadow-[0_0_8px_#D71920]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#e5c27a] font-sans">
              MENU OPERACIONAL
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-950/80 hover:text-red-400 text-stone-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar Menu"
          >
            <X size={18} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Expanded Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left group",
                  isActive
                    ? "bg-[#D71920] text-white shadow-[0_0_20px_rgba(215,25,32,0.5)] border border-red-500/80"
                    : "hover:bg-white/5 text-stone-300 border border-transparent"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl shrink-0 transition-colors",
                  isActive 
                    ? "bg-black/30 text-white" 
                    : "bg-[#141c21] text-stone-400 group-hover:text-[#e5c27a] group-hover:bg-[#1a2329]"
                )}>
                  <IconComponent size={18} className="stroke-[2.3]" />
                </div>

                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-black uppercase tracking-tight truncate",
                      isActive ? "text-white" : "text-stone-200 group-hover:text-white"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <span className={cn(
                      "text-[9.5px] font-medium tracking-wider uppercase mt-0.5 truncate",
                      isActive ? "text-white/80" : "text-stone-400"
                    )}>
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Config Link in Expanded Drawer */}
        {onOpenSettings && (
          <div className="p-3 border-t border-[rgba(201,151,62,0.15)] shrink-0">
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#141c21] hover:bg-[#1a2329] text-stone-300 hover:text-white border border-stone-700/80 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider"
            >
              <Settings size={16} className="text-[#e5c27a]" />
              <span>Configurações & Páginas</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
