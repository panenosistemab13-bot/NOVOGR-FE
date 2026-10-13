import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Check, 
  Home,
  ClipboardCheck,
  FileCheck2,
  Radio,
  Package,
  Sliders,
  Truck,
  FileSpreadsheet,
  Calendar,
  Route,
  Save,
  RotateCcw,
  Sparkles,
  Command
} from 'lucide-react';
import { 
  PageDefinition, 
  getAllAvailablePages, 
  savePageVisibility,
  saveFullPageConfigToFirebase
} from '../data/pagesConfig';
import { cn } from '../lib/utils';

interface RestrictedPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisibility: Record<string, boolean>;
  onSave: (newVisibility: Record<string, boolean>, updatedPages: PageDefinition[]) => void;
}

interface OperationalMenuItem {
  id: string;
  label: string;
  subtitle: string;
  shortcut: string;
  icon: React.ElementType;
  isFixed?: boolean;
}

// Ordem exata dos 10 módulos operacionais conforme especificação visual
export const OPERATIONAL_MENU_ORDER: OperationalMenuItem[] = [
  { id: 'menu', label: 'INÍCIO', subtitle: 'PAINEL CENTRAL', shortcut: '1', icon: Home, isFixed: true },
  { id: 'checklist', label: 'CHECKLIST', subtitle: 'DIVERGÊNCIAS', shortcut: '2', icon: ClipboardCheck },
  { id: 'averbacao', label: 'AVERBAÇÃO', subtitle: 'SEGUROS DE CARGA', shortcut: '3', icon: FileCheck2 },
  { id: 'sm_creator', label: 'SM', subtitle: 'MONITORAMENTO', shortcut: '4', icon: Radio },
  { id: 'iscas', label: 'ISCAS', subtitle: 'RASTREAMENTO & DESTINOS', shortcut: '5', icon: Package },
  { id: 'controle', label: 'PRÉ-ALERTA', subtitle: 'ISCAS & CONTROLE PGR', shortcut: '6', icon: Sliders },
  { id: 'disponibilidade', label: 'DISPONIBILIDADE', subtitle: 'VEÍCULOS PÁTIO', shortcut: '7', icon: Truck },
  { id: 'escala', label: 'ESCALA 3C', subtitle: 'PLANTÃO LOGÍSTICO', shortcut: '8', icon: FileSpreadsheet },
  { id: 'presence', label: 'CALENDÁRIO', subtitle: 'FREQUÊNCIA & AGENDA', shortcut: '9', icon: Calendar },
  { id: 'rotas', label: 'ROTAS', subtitle: 'P&R E DESTINOS', shortcut: '0', icon: Route },
];

export default function RestrictedPagesModal({
  isOpen,
  onClose,
  currentVisibility,
  onSave
}: RestrictedPagesModalProps) {
  const [visibilityState, setVisibilityState] = useState<Record<string, boolean>>(() => ({ ...currentVisibility }));
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisibilityState({ ...currentVisibility });
      setSavedToast(false);
    }
  }, [isOpen, currentVisibility]);

  if (!isOpen) return null;

  const togglePage = (pageId: string) => {
    if (pageId === 'menu') return; // Início é sempre ativo
    setVisibilityState(prev => ({
      ...prev,
      [pageId]: !Boolean(prev[pageId])
    }));
  };

  const setAllVisible = (visible: boolean) => {
    setVisibilityState(prev => {
      const updated = { ...prev };
      OPERATIONAL_MENU_ORDER.forEach(item => {
        if (item.id !== 'menu') {
          updated[item.id] = visible;
        }
      });
      return updated;
    });
  };

  const handleSaveAndClose = () => {
    const finalVisibility = { ...visibilityState, menu: true };
    
    // Persistência local e nuvem
    savePageVisibility(finalVisibility);
    saveFullPageConfigToFirebase(finalVisibility, [], OPERATIONAL_MENU_ORDER.map(i => i.id));

    const allPages = getAllAvailablePages();
    onSave(finalVisibility, allPages);

    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 800);
  };

  // Contadores
  const activeCount = OPERATIONAL_MENU_ORDER.filter(item => 
    item.id === 'menu' || Boolean(visibilityState[item.id])
  ).length;

  const hiddenCount = OPERATIONAL_MENU_ORDER.length - activeCount;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        className="w-full max-w-6xl xl:max-w-7xl bg-[#F5EFE4] border-2 border-[#D9C39B] shadow-[0_25px_70px_rgba(198,154,69,0.3)] rounded-[32px] p-5 sm:p-7 relative text-[#33291B] flex flex-col max-h-[94vh] overflow-hidden font-sans"
      >
        {/* Toast de Confirmação */}
        <AnimatePresence>
          {savedToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-5 inset-x-20 z-50 py-3 px-6 rounded-2xl bg-[#33291B] text-[#FFF9EF] border border-[#DDB76B] text-xs font-mono font-bold shadow-2xl flex items-center justify-center gap-2"
            >
              <Check size={16} className="text-[#DDB76B]" />
              <span>Configurações salvas e aplicadas em toda a malha operacional!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 1. HEADER HORIZONTAL COMPLETO                                             */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#D9C39B] gap-4 shrink-0">
          
          {/* Logo 3 Corações + Título */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d41a22] via-[#b3141d] to-[#7f0b12] border-2 border-[#D9C39B] shadow-[0_0_16px_rgba(212,26,34,0.3)] flex flex-col items-center justify-center relative overflow-hidden shrink-0">
              <div className="flex items-center justify-center -space-x-0.5 mb-0.5">
                <span className="text-white text-[11px] leading-none">♥</span>
                <span className="text-white text-[13px] leading-none -translate-y-0.5">♥</span>
                <span className="text-white text-[11px] leading-none">♥</span>
              </div>
              <span className="text-white text-[6.5px] font-black tracking-tight leading-none uppercase">
                3corações
              </span>
            </div>

            <div className="h-9 w-[1.5px] bg-[#D9C39B]" />

            <div className="flex flex-col justify-center leading-none text-left">
              <div className="flex items-center gap-2">
                <span className="text-[16px] sm:text-[18px] font-black text-[#33291B] tracking-wider uppercase font-sans">
                  CONFIGURAÇÃO OPERACIONAL
                </span>
                <span className="text-[9.5px] font-mono font-bold text-[#91651F] tracking-widest uppercase bg-[#EEE2CD] px-2.5 py-0.5 rounded-full border border-[#D9C39B]">
                  PAINEL HORIZONTAL
                </span>
              </div>
              <p className="text-[11px] text-[#7A756D] font-medium mt-1">
                Controle de visibilidade dos módulos e mapeamento de atalhos rápidos do teclado.
              </p>
            </div>
          </div>

          {/* Contadores e Ações Rápidas Centrais */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#EEE2CD]/70 p-1.5 rounded-2xl border border-[#D9C39B]">
              <span className="px-3 py-1 rounded-xl bg-[#E7F6E7] border border-emerald-300 text-emerald-800 text-[10.5px] font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <Eye size={13} className="text-emerald-600" />
                <span>{activeCount} Visíveis</span>
              </span>

              {hiddenCount > 0 && (
                <span className="px-3 py-1 rounded-xl bg-[#FDEAEA] border border-red-300 text-red-800 text-[10.5px] font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                  <EyeOff size={13} className="text-red-600" />
                  <span>{hiddenCount} Ocultos</span>
                </span>
              )}

              <div className="h-5 w-[1px] bg-[#D9C39B] mx-0.5" />

              <button
                type="button"
                onClick={() => setAllVisible(true)}
                className="px-2.5 py-1 text-[10.5px] font-bold text-[#91651F] hover:text-[#33291B] hover:bg-[#FFFDF8] rounded-lg transition-colors cursor-pointer"
              >
                Exibir Todas
              </button>

              <button
                type="button"
                onClick={() => setAllVisible(false)}
                className="px-2.5 py-1 text-[10.5px] font-bold text-stone-500 hover:text-stone-800 hover:bg-[#FFFDF8] rounded-lg transition-colors cursor-pointer"
              >
                Ocultar Opcionais
              </button>
            </div>

            {/* Botão Fechar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              title="Fechar"
              className="w-10 h-10 rounded-2xl bg-[#EEE2CD] hover:bg-[#E7D4AF] text-[#91651F] hover:text-[#33291B] border border-[#D9C39B] flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. GRID HORIZONTAL: 5 COLUNAS X 2 LINHAS (OS 10 MÓDULOS)                 */}
        {/* ========================================================================= */}
        <div className="my-4 overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {OPERATIONAL_MENU_ORDER.map((item) => {
              const Icon = item.icon;
              const isVisible = item.isFixed ? true : Boolean(visibilityState[item.id]);

              return (
                <div
                  key={item.id}
                  onClick={() => !item.isFixed && togglePage(item.id)}
                  className={cn(
                    "rounded-2xl p-4 border transition-all flex flex-col justify-between text-left shadow-xs relative group min-h-[145px]",
                    item.isFixed
                      ? "bg-[#FFF9EF] border-[#C69A45] ring-2 ring-[#C69A45]/30 cursor-default"
                      : isVisible
                        ? "bg-[#FFFDF8] hover:bg-[#FFF9EF] border-[#D9C39B] hover:border-[#C69A45] cursor-pointer hover:shadow-md"
                        : "bg-[#EAE4D8]/60 hover:bg-[#EAE4D8] border-[#D5C6AC] opacity-65 cursor-pointer"
                  )}
                >
                  {/* Topo do Card: Ícone + Atalho Ctrl */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform",
                      item.isFixed
                        ? "bg-[#33291B] text-[#FFF9EF] border-[#33291B] shadow-sm"
                        : isVisible
                          ? "bg-[#EEE2CD] text-[#91651F] border-[#D9C39B] group-hover:scale-105"
                          : "bg-stone-200 text-stone-500 border-stone-300"
                    )}>
                      <Icon size={20} className="stroke-[2.2]" />
                    </div>

                    {/* Badge do Atalho Ctrl + Número */}
                    <kbd className="px-2.5 py-1 rounded-xl bg-[#EEE2CD] text-[#7A5A1A] font-mono text-[10px] font-black border border-[#D9C39B] shadow-2xs shrink-0 flex items-center gap-1">
                      <span>Ctrl + {item.shortcut}</span>
                    </kbd>
                  </div>

                  {/* Centro do Card: Nome e Subtítulo */}
                  <div className="my-2 leading-tight">
                    <strong className={cn(
                      "text-[13px] font-black uppercase tracking-wide block font-sans truncate",
                      isVisible ? "text-[#33291B]" : "text-stone-500 line-through"
                    )}>
                      {item.label}
                    </strong>
                    <span className="text-[9px] font-mono font-bold text-[#91651F] uppercase tracking-wider block mt-0.5 truncate">
                      {item.subtitle}
                    </span>
                  </div>

                  {/* Base do Card: Botão de Visibilidade Horizontal */}
                  <div className="pt-2 border-t border-[#D9C39B]/40">
                    {item.isFixed ? (
                      <div className="w-full py-1.5 rounded-xl bg-[#33291B] text-[#FFF9EF] text-[10px] font-black uppercase tracking-wider border border-[#33291B] flex items-center justify-center gap-1.5 shadow-2xs">
                        <Check size={13} className="text-[#DDB76B]" />
                        <span>SEMPRE ATIVO</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePage(item.id);
                        }}
                        className={cn(
                          "w-full py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95",
                          isVisible
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                            : "bg-stone-300 hover:bg-stone-400 text-stone-700 border-stone-400"
                        )}
                      >
                        {isVisible ? (
                          <>
                            <Eye size={13} />
                            <span>VISÍVEL</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} />
                            <span>OCULTO</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FOOTER HORIZONTAL COM DICA OPERACIONAL E SALVAMENTO                    */}
        {/* ========================================================================= */}
        <div className="pt-3.5 border-t border-[#D9C39B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[#7A756D] text-left">
            <span className="w-2 h-2 rounded-full bg-[#C69A45] shrink-0" />
            <span>
              Pressione <kbd className="font-mono font-bold text-[#33291B] bg-[#EEE2CD] px-1.5 py-0.5 rounded border border-[#D9C39B]">Ctrl + Número</kbd> em qualquer tela do sistema para alternar instantaneamente entre os módulos.
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#EEE2CD] hover:bg-[#E7D4AF] text-[#33291B] border border-[#D9C39B] text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d41a22] to-[#a11118] hover:from-[#b7141b] hover:to-[#840c12] text-white border border-[#7f0b12] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
            >
              <Save size={15} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
