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
  ChevronRight, 
  Package, 
  Users2,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageDefinition } from '../../data/pagesConfig';
import goldMedalLogo from '../../assets/images/gold_logo_medal_3c_1790406432555.jpg';

interface NavigationDrawerProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettings?: () => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  isDark?: boolean;
}

export default function NavigationDrawer({
  activeTab,
  onSelectTab,
  onOpenSettings,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
  pageVisibility,
  isDark = true,
}: NavigationDrawerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = propSetIsOpen || setInternalIsOpen;

  // Estado para controlar se o menu flutuante em páginas claras está expandido ou minimizado (apenas ícones)
  const [isMinimized, setIsMinimized] = useState<boolean>(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const defaultItems = [
    { id: 'menu', label: 'Início', subtitle: 'Painel Central', icon: Home },
    { id: 'checklist', label: 'Checklist', subtitle: 'Vistoria de Frota', icon: ClipboardCheck },
    { id: 'averbacao', label: 'Averbação', subtitle: 'Seguros de Carga', icon: FileCheck2 },
    { id: 'sm_creator', label: 'SM', subtitle: 'Monitoramento', icon: Radio },
    { id: 'controle', label: 'Controle', subtitle: 'Iscas & PGR', icon: Sliders },
    { id: 'escala', label: 'Escala', subtitle: 'Plantão Logístico', icon: Calendar },
    { id: 'presence', label: 'Lista de Presença', subtitle: 'Frequência & Agenda', icon: Users },
    { id: 'rotas', label: 'Rotas', subtitle: 'P&R e Destinos', icon: Route },
  ];

  const menuItems = React.useMemo(() => {
    if (pageVisibility) {
      return defaultItems.filter(item => {
        if (item.id === 'menu') return true;
        return pageVisibility[item.id] !== false;
      });
    }
    return defaultItems;
  }, [pageVisibility]);

  const handleSelect = (id: string) => {
    onSelectTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* ===================================================================== */}
      {/* 1. FLOATING MINIMIZED SIDEBAR (SEM FUNDO, APENAS ÍCONES) NAS PÁGINAS   */}
      {/* ===================================================================== */}
      {/* ===================================================================== */}
      {/* 2. MOBILE DRAWER OR SLIDE-OVER DRAWER (FOR INÍCIO OR ON PHONES)       */}
      {/* ===================================================================== */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside 
        aria-label="Menu Operacional"
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-[290px] sm:w-[320px] max-w-[85vw] bg-[#FAF6EE] border-r border-[#E6D9C5] shadow-2xl flex flex-col select-none transition-transform duration-250 ease-out font-sans",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {/* HEADER */}
        <div className="pt-4 px-4 pb-3 shrink-0 border-b border-[#E6D9C5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full p-0.5 bg-white border border-[#D8B065] shadow-xs flex items-center justify-center overflow-hidden">
                <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
              </div>

              <div className="flex flex-col text-left leading-none">
                <span className="text-sm font-black text-[#25231F] uppercase font-sans">
                  CENTRAL GR
                </span>
                <span className="text-[8.5px] font-bold text-[#8C6D28] uppercase mt-0.5">
                  Menu Operacional
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-[#FAF5EB] hover:bg-[#F2EAE0] text-[#4A453E] border border-[#E8DDCA] flex items-center justify-center cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left border",
                  isActive
                    ? "bg-gradient-to-r from-[#D8B065] via-[#C59B48] to-[#AA7E2F] text-white font-black border-[#C59B48] shadow-md"
                    : "bg-white hover:bg-[#FAF5EB] text-[#25231F] border-[#E8DDCA]"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <IconComponent size={17} className={isActive ? "text-white" : "text-[#8C6D28]"} />
                  <span className="text-xs font-bold truncate">{item.label}</span>
                </div>
                {isActive && (
                  <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-black/20 text-white">
                    ATIVO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* FOOTER */}
        {onOpenSettings && (
          <div className="p-3 border-t border-[#E6D9C5] bg-[#FAF5EB]">
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF5EB] text-[#25231F] border border-[#E8DDCA] font-bold text-xs cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-[#C49A45]" />
                <span>Configurações & Páginas</span>
              </div>
              <ChevronRight size={14} className="text-[#8C7B63]" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
