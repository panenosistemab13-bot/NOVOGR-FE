import React from 'react';
import { 
  FileCheck2, 
  Radio, 
  Sliders, 
  Truck, 
  Calendar, 
  Route, 
  Settings, 
  LayoutGrid, 
  Menu as MenuIcon, 
  Bell, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface OperationalMenuProps {
  onNavigate?: (tabId: string) => void;
  activeModule?: string;
  onOpenSettings?: () => void;
}

interface ModuleItem {
  id: string;
  number: string;
  name: string;
  description: string;
  icon: React.ElementType;
  isSpecialActive?: boolean;
}

export default function OperationalMenu({ 
  onNavigate, 
  activeModule = 'rotas',
  onOpenSettings 
}: OperationalMenuProps) {

  const modules: ModuleItem[] = [
    {
      id: 'averbacao',
      number: '01',
      name: 'AVERBAÇÃO',
      description: 'SEGUROS DE CARGA',
      icon: FileCheck2
    },
    {
      id: 'sm_creator',
      number: '02',
      name: 'MONITORAMENTO',
      description: 'SOLICITAÇÕES',
      icon: Radio
    },
    {
      id: 'controle',
      number: '03',
      name: 'PRÉ-ALERTA',
      description: 'ISCAS & CONTROLE PGR',
      icon: Sliders
    },
    {
      id: 'disponibilidade',
      number: '04',
      name: 'DISPONIBILIDADE',
      description: 'VEÍCULOS PÁTIO',
      icon: Truck
    },
    {
      id: 'escala',
      number: '05',
      name: 'ESCALA 3C',
      description: 'PLANTÃO LOGÍSTICO',
      icon: Calendar
    },
    {
      id: 'rotas',
      number: '06',
      name: 'ROTAS',
      description: 'PGR E DESTINOS',
      icon: Route,
      isSpecialActive: true
    },
    {
      id: 'configuracoes',
      number: '07',
      name: 'CONFIGURAÇÕES & PÁGINAS',
      description: 'PREFERÊNCIAS & SISTEMA',
      icon: Settings
    }
  ];

  const handleModuleClick = (module: ModuleItem) => {
    if (module.id === 'configuracoes') {
      if (onOpenSettings) {
        onOpenSettings();
      } else if (onNavigate) {
        onNavigate('configuracoes');
      }
      return;
    }

    if (onNavigate) {
      onNavigate(module.id);
    }
  };

  return (
    <div className="w-full h-full bg-[#F5EFE4] text-[#33291B] flex flex-col justify-between p-4 sm:p-6 lg:p-7 overflow-y-auto font-sans select-none border-r border-[#D9C39B]/80 shadow-[4px_0_30px_rgba(145,101,31,0.06)] relative">
      
      {/* Glow highlight in top-left */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#FFF9EF]/80 via-[#E7D4AF]/20 to-transparent pointer-events-none rounded-br-full blur-2xl" />

      {/* 1. CABEÇALHO INSTITUCIONAL */}
      <header className="relative z-10 shrink-0 pb-4 border-b border-[#D9C39B]/50">
        <div className="flex items-center justify-between gap-3">
          
          {/* Lado esquerdo: Menu + 3 Corações Logo + Central GR */}
          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="w-9 h-9 rounded-xl bg-[#FFF9EF] border border-[#D9C39B] text-[#91651F] flex items-center justify-center hover:bg-[#EEE2CD] transition-colors shadow-xs"
              title="Menu do Sistema"
            >
              <MenuIcon size={18} className="stroke-[2.2]" />
            </button>

            {/* Logo 3 Corações Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d41a22] via-[#b3141d] to-[#7f0b12] border-2 border-white/95 shadow-[0_3px_10px_rgba(212,26,34,0.35)] flex flex-col items-center justify-center relative overflow-hidden shrink-0">
              <div className="flex items-center justify-center -space-x-0.5 mb-0.5">
                <span className="text-white text-[9px] leading-none">♥</span>
                <span className="text-white text-[11px] leading-none -translate-y-0.5">♥</span>
                <span className="text-white text-[9px] leading-none">♥</span>
              </div>
              <span className="text-white text-[5px] font-black tracking-tight leading-none uppercase">
                3corações
              </span>
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-[#33291B] font-heading">
                  CENTRAL GR
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#E7D4AF] text-[#91651F] text-[8px] font-black uppercase tracking-wider border border-[#D9C39B]">
                  4K PREMIUM
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-[#857662] tracking-widest uppercase">
                LOGÍSTICA QUE APROXIMA
              </p>
            </div>
          </div>

          {/* Lado direito: Localização + Notificações */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF9EF] border border-[#D9C39B] text-[#33291B] text-[10px] font-bold uppercase tracking-wider shadow-xs">
              <MapPin size={12} className="text-[#d41a22]" />
              <span className="hidden xs:inline font-mono">SANTA LUZIA - MG</span>
              <span className="xs:hidden font-mono">SL - MG</span>
            </div>

            <button 
              type="button"
              className="w-9 h-9 rounded-xl bg-[#FFF9EF] border border-[#D9C39B] text-[#91651F] flex items-center justify-center hover:bg-[#EEE2CD] transition-colors relative shadow-xs"
              title="Notificações operacionais"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#d41a22] ring-2 ring-[#FFF9EF]" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. CORPO DO MENU OPERACIONAL */}
      <main className="relative z-10 flex-1 py-4 flex flex-col justify-center space-y-3 sm:space-y-3.5">
        
        {/* CARTÃO PRINCIPAL — MENU OPERACIONAL */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#DDB76B] via-[#E7D4AF] to-[#C69A45] p-[1.5px] shadow-[0_8px_20px_rgba(198,154,69,0.18)]">
          <div className="w-full bg-gradient-to-r from-[#FFF9EF] to-[#F5EFE4] rounded-[15px] p-3 sm:p-3.5 flex items-center justify-between border border-white/60">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#DDB76B] to-[#C69A45] shadow-md flex items-center justify-center text-[#33291B] border border-white/40 shrink-0">
                <LayoutGrid size={22} className="stroke-[2.5]" />
              </div>
              <div className="leading-tight">
                <span className="text-[14px] sm:text-[15px] font-black uppercase text-[#33291B] tracking-wide block font-heading">
                  MENU OPERACIONAL
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#91651F]">
                  PAINEL CENTRAL DE OPERAÇÕES
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C69A45]/15 border border-[#C69A45]/30 text-[#91651F] text-[9.5px] font-bold uppercase tracking-wider">
              <span>SISTEMA ATIVO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* LISTA DE MÓDULOS OPERACIONAIS (1 a 7) */}
        <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
          {modules.map((module) => {
            const Icon = module.icon;
            const isCurrentlySelected = activeModule === module.id;
            const isActiveStyle = module.isSpecialActive || isCurrentlySelected;

            return (
              <button
                key={module.id}
                type="button"
                onClick={() => handleModuleClick(module)}
                className={cn(
                  "w-full rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer text-left flex items-center justify-between p-2.5 sm:p-3 border group relative overflow-hidden",
                  isActiveStyle
                    ? "bg-gradient-to-r from-[#DDB76B] via-[#E7D4AF] to-[#C69A45] border-[#C69A45] shadow-[0_6px_18px_rgba(198,154,69,0.22)] ring-1 ring-[#C69A45]/40"
                    : "bg-[#FFF9EF] hover:bg-[#EEE2CD]/80 border-[#D9C39B] hover:border-[#C69A45] shadow-[0_2px_8px_rgba(145,101,31,0.04)] hover:shadow-[0_4px_12px_rgba(198,154,69,0.12)]"
                )}
              >
                {/* Linha decorativa de iluminação interna */}
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  {/* Ícone no compartimento com acabamento metálico */}
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 border",
                      isActiveStyle
                        ? "bg-[#33291B] text-[#DDB76B] border-[#33291B] shadow-sm"
                        : "bg-gradient-to-b from-[#FFF9EF] to-[#EEE2CD] text-[#C69A45] border-[#D9C39B]"
                    )}
                  >
                    <Icon size={20} className="stroke-[2.3]" />
                  </div>

                  {/* Nome e Descrição */}
                  <div className="flex flex-col leading-tight min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[12.5px] sm:text-[13.5px] font-black uppercase tracking-tight truncate font-heading",
                          isActiveStyle ? "text-[#33291B]" : "text-[#33291B] group-hover:text-[#91651F]"
                        )}
                      >
                        {module.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate mt-0.5",
                        isActiveStyle ? "text-[#4d3a22] font-bold" : "text-[#857662]"
                      )}
                    >
                      {module.description}
                    </span>
                  </div>
                </div>

                {/* Lado Direito: Badge ATIVO (se ativo) + Seta de navegação */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {isActiveStyle && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#33291B] text-[#FFF9EF] text-[8.5px] sm:text-[9px] font-black uppercase tracking-widest border border-[#33291B] shadow-xs">
                      ATIVO
                    </span>
                  )}
                  
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:translate-x-0.5",
                      isActiveStyle
                        ? "text-[#33291B]"
                        : "text-[#857662] group-hover:text-[#C69A45]"
                    )}
                  >
                    <ChevronRight size={17} className="stroke-[2.5]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </main>

      {/* 3. RODAPÉ DO MENU */}
      <footer className="relative z-10 shrink-0 pt-3 border-t border-[#D9C39B]/50 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C69A45]" />
          <p className="text-[11px] sm:text-[12px] font-medium text-[#857662] italic tracking-wide text-center">
            “Juntos em todos os caminhos”
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C69A45]" />
        </div>
        <span className="text-[8px] font-mono font-bold text-[#A89880] tracking-widest uppercase mt-1">
          CENTRAL GR • 3 CORAÇÕES • GESTÃO DE RISCO
        </span>
      </footer>

    </div>
  );
}
