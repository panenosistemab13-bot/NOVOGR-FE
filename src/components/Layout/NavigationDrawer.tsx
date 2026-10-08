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
  Users2, 
  Route 
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
}: NavigationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'menu', label: 'INÍCIO', subtitle: '', icon: Home },
    { id: 'checklist', label: 'CHECKLIST', subtitle: 'Divergências', icon: ClipboardCheck },
    { id: 'averbacao', label: 'AVERBAÇÃO', subtitle: 'Seguros', icon: FileCheck2 },
    { id: 'sm_creator', label: 'SM', subtitle: 'Monitoramento', icon: Radio },
    { id: 'controle', label: 'PRÉ-ALERTA', subtitle: 'Iscas & Alertas', icon: Sliders },
    { id: 'disponibilidade', label: 'DISPONIBILIDADE', subtitle: 'Veículos Pátio', icon: Truck },
    { id: 'escala', label: 'ESCALA 3C', subtitle: 'Plantão', icon: FileSpreadsheet },
    { id: 'presence', label: 'CALENDÁRIO', subtitle: 'Frequência', icon: Users2 },
    { id: 'rotas', label: 'ROTAS', subtitle: 'P&R', icon: Route },
  ];

  const handleSelect = (id: string) => {
    onSelectTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* BUTTON ☰ (When menu is closed, absolute/fixed on left side below topbar) */}
      {!isOpen && (
        <div className="absolute top-4 left-4 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="w-[46px] h-[46px] rounded-[12px] bg-[rgba(15,18,20,0.90)] hover:bg-[#d9ad5a] text-[#e5c27a] hover:text-[#080a0c] border border-[rgba(217,173,90,0.35)] shadow-[0_0_20px_rgba(217,173,90,0.15)] flex items-center justify-center transition-all cursor-pointer group"
            title="Abrir Menu de Navegação"
          >
            <Menu size={24} className="stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* OVERLAY BACKDROP WHEN MENU IS OPEN */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FLOATING NAVIGATION DRAWER PANEL */}
      <div 
        className={cn(
          "fixed left-0 top-[72px] z-50 w-[260px] h-[calc(100vh-72px)] bg-[#0a0c0e]/96 backdrop-blur-[24px] border-r border-[rgba(217,173,90,0.20)] shadow-[0_20px_60px_rgba(0,0,0,0.50)] rounded-r-[20px] flex flex-col transition-transform duration-250 ease-in-out select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* TOP OF PANEL: [ ✕ ] NAVEGAÇÃO */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(217,173,90,0.15)] shrink-0">
          <span className="text-xs font-black uppercase tracking-widest text-[#e5c27a] font-sans">
            NAVEGAÇÃO
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(217,173,90,0.2)] text-[#a8a39a] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar Menu"
          >
            <X size={18} className="stroke-[2.5]" />
          </button>
        </div>

        {/* PAGES LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all cursor-pointer text-left group",
                  isActive
                    ? "bg-[rgba(217,173,90,0.14)] border border-[rgba(217,173,90,0.30)] text-white shadow-sm"
                    : "hover:bg-white/5 text-[#d8d3c8] border border-transparent"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg shrink-0 transition-colors",
                  isActive 
                    ? "bg-[#d9ad5a] text-[#080a0c] shadow-[0_0_12px_rgba(217,173,90,0.4)]" 
                    : "bg-[#131619] text-[#a8a39a] group-hover:text-[#e5c27a]"
                )}>
                  <IconComponent size={18} className="stroke-[2.2]" />
                </div>

                <div className="flex flex-col justify-center min-w-0">
                  <span className={cn(
                    "text-xs font-black uppercase tracking-tight truncate",
                    isActive ? "text-[#e5c27a]" : "text-white"
                  )}>
                    {item.label}
                  </span>
                  {item.subtitle && (
                    <span className="text-[9px] font-semibold text-[#a8a39a] tracking-wider uppercase mt-0.5 truncate">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
