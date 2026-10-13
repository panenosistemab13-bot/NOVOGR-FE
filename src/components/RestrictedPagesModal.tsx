import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Home,
  ClipboardCheck,
  FileCheck2,
  Radio,
  Package,
  Sliders,
  Truck,
  FileSpreadsheet,
  Calendar,
  Map
} from 'lucide-react';

// Simplified types for the purpose of this interface overhaul
interface PageItem {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  shortcut: string;
}

const PAGES: PageItem[] = [
  { id: 'menu', label: 'INÍCIO', subtitle: 'PAINEL CENTRAL', icon: Home, shortcut: 'Ctrl + 1' },
  { id: 'checklist', label: 'CHECKLIST', subtitle: 'DIVERGÊNCIAS', icon: ClipboardCheck, shortcut: 'Ctrl + 2' },
  { id: 'averbacao', label: 'AVERBAÇÃO', subtitle: 'SEGUROS DE CARGA', icon: FileCheck2, shortcut: 'Ctrl + 3' },
  { id: 'sm_creator', label: 'SM', subtitle: 'MONITORAMENTO', icon: Radio, shortcut: 'Ctrl + 4' },
  { id: 'iscas', label: 'ISCAS', subtitle: 'RASTREAMENTO & DESTINOS', icon: Package, shortcut: 'Ctrl + 5' },
  { id: 'controle', label: 'PRÉ-ALERTA', subtitle: 'ISCAS & CONTROLE PGR', icon: Sliders, shortcut: 'Ctrl + 6' },
  { id: 'disponibilidade', label: 'DISPONIBILIDADE', subtitle: 'VEÍCULOS PÁTIO', icon: Truck, shortcut: 'Ctrl + 7' },
  { id: 'escala', label: 'ESCALA 3C', subtitle: 'PLANTÃO LOGÍSTICO', icon: FileSpreadsheet, shortcut: 'Ctrl + 8' },
  { id: 'presence', label: 'CALENDÁRIO', subtitle: 'FREQUÊNCIA & AGENDA', icon: Calendar, shortcut: 'Ctrl + 9' },
  { id: 'rotas', label: 'ROTAS', subtitle: 'P&R E DESTINOS', icon: Map, shortcut: 'Ctrl + 0' },
];

interface RestrictedPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisibility: Record<string, boolean>;
  onVisibilityChange: (id: string, visible: boolean) => void;
}

export const RestrictedPagesModal: React.FC<RestrictedPagesModalProps> = ({ 
  isOpen, 
  onClose, 
  currentVisibility,
  onVisibilityChange
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-7xl bg-[#F5EFE4] rounded-2xl shadow-2xl overflow-hidden border border-[#D9C39B]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#D9C39B]/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-xl font-bold text-red-700">3C</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">CONFIGURAÇÃO OPERACIONAL</h2>
                  <p className="text-sm text-gray-500 uppercase tracking-widest">VISIBILIDADE & ATALHOS</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#D9C39B]/20 rounded-full transition-colors">
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Content - Horizontal Grid */}
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {PAGES.map((page) => {
                  const isVisible = currentVisibility[page.id] ?? true;
                  return (
                    <div 
                      key={page.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-[#D9C39B]/20 flex flex-col justify-between h-40 transition-all hover:shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-[#F5EFE4] flex items-center justify-center">
                          <page.icon size={20} className="text-red-700" />
                        </div>
                        <span className="text-[10px] font-bold bg-[#F5EFE4] px-2 py-1 rounded text-gray-600 border border-[#D9C39B]">
                          {page.shortcut}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <h3 className="font-bold text-gray-800 text-sm">{page.label}</h3>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{page.subtitle}</p>
                      </div>

                      <button
                        onClick={() => onVisibilityChange(page.id, !isVisible)}
                        className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${
                          isVisible 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        {isVisible ? 'VISÍVEL' : 'OCULTAR'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestrictedPagesModal;
