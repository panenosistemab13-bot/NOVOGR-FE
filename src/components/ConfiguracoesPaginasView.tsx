import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Users, 
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  DEFAULT_PAGES, 
  getAllAvailablePages, 
  loadPageVisibility, 
  savePageVisibility,
  PageDefinition,
  ICON_MAP
} from '../data/pagesConfig';
import { rtdb } from '../firebase';
import { ref, set, onValue } from 'firebase/database';

interface ConfiguracoesPaginasViewProps {
  onBack?: () => void;
  onOpenCadastro?: () => void;
}

const SHORTCUT_MAP: Record<string, string> = {
  menu: 'Ctrl + 1',
  checklist: 'Ctrl + 2',
  averbacao: 'Ctrl + 3',
  sm_creator: 'Ctrl + 4',
  iscas: 'Ctrl + 5',
  controle: 'Ctrl + 6',
  disponibilidade: 'Ctrl + 7',
  escala: 'Ctrl + 8',
  presence: 'Ctrl + 9',
  rotas: 'Ctrl + 0',
  cadastro: 'Menu'
};

export default function ConfiguracoesPaginasView({ onBack, onOpenCadastro }: ConfiguracoesPaginasViewProps) {
  const [pages, setPages] = useState<PageDefinition[]>([]);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setPages(getAllAvailablePages());
    setVisibility(loadPageVisibility());

    // Sincronizar em tempo real com Firebase RTDB
    const configRef = ref(rtdb, 'pages_config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.visibility) {
        setVisibility(data.visibility);
        savePageVisibility(data.visibility);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleVisibility = (pageId: string) => {
    const current = visibility[pageId] ?? true;
    const nextVal = !current;
    const updated = { ...visibility, [pageId]: nextVal };
    
    setVisibility(updated);
    savePageVisibility(updated);

    try {
      set(ref(rtdb, 'pages_config/visibility'), updated);
    } catch (e) {
      console.error('Erro ao atualizar Firebase:', e);
    }

    const pageName = pages.find(p => p.id === pageId)?.label || pageId;
    showToast(`Página "${pageName}" marcada como ${nextVal ? 'VISÍVEL' : 'OCULTA'}.`);
  };

  const handleShowAll = () => {
    const updated: Record<string, boolean> = {};
    pages.forEach(p => {
      updated[p.id] = true;
    });
    setVisibility(updated);
    savePageVisibility(updated);
    try {
      set(ref(rtdb, 'pages_config/visibility'), updated);
    } catch (e) {
      console.error(e);
    }
    showToast('Todas as páginas agora estão visíveis no menu.');
  };

  const handleResetToDefault = () => {
    const updated: Record<string, boolean> = {};
    pages.forEach(p => {
      updated[p.id] = p.isDefaultVisible;
    });
    setVisibility(updated);
    savePageVisibility(updated);
    try {
      set(ref(rtdb, 'pages_config/visibility'), updated);
    } catch (e) {
      console.error(e);
    }
    showToast('Visibilidade restaurada para o padrão do sistema.');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const totalPages = pages.length;
  const visibleCount = pages.filter(p => visibility[p.id] !== false).length;
  const hiddenCount = totalPages - visibleCount;

  return (
    <div className="min-h-full bg-[#F5F0E6] text-[#25231F] p-4 sm:p-6 lg:p-8 select-none font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#25231F] border border-[#E6D2A3] transition-colors"
                title="Voltar"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d41a22] to-[#7f0b12] border-2 border-[#D9C39B] flex items-center justify-center text-white shadow-sm">
              <Settings size={22} className="text-[#F5EFE4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#25231F] tracking-tight font-heading">
                  CONFIGURAÇÕES & PÁGINAS
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#8C6D28] border border-amber-300 text-[10px] font-mono font-bold uppercase">
                  Visibilidade & Menu
                </span>
              </div>
              <p className="text-xs text-[#77736B] font-mono uppercase tracking-wider mt-0.5">
                Escolha quais páginas ficam visíveis ou ocultas no menu lateral e barra de navegação
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenCadastro && (
              <button
                type="button"
                onClick={onOpenCadastro}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#8C6D28] border border-amber-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Users size={15} />
                <span>Ir para Cadastro</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShowAll}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#25231F] border border-[#E6D2A3] text-xs font-bold transition-all cursor-pointer"
            >
              <Eye size={15} className="text-emerald-600" />
              <span>Exibir Todas</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#25231F] border border-[#E6D2A3] text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw size={15} className="text-stone-500" />
              <span>Padrão</span>
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <Check size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-[#77736B] uppercase tracking-wider">
                Total de Módulos
              </p>
              <p className="text-2xl font-black text-[#25231F] mt-0.5">{totalPages}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
              <Sliders size={18} />
            </div>
          </div>

          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                Módulos Visíveis
              </p>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">{visibleCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Eye size={18} />
            </div>
          </div>

          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                Módulos Ocultos
              </p>
              <p className="text-2xl font-black text-stone-600 mt-0.5">{hiddenCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500">
              <EyeOff size={18} />
            </div>
          </div>
        </div>

        {/* PAGES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pages.map((page) => {
            const isVisible = visibility[page.id] !== false;
            const IconComp = ICON_MAP[page.iconName] || Sliders;
            const shortcut = SHORTCUT_MAP[page.id] || 'Menu';

            return (
              <div
                key={page.id}
                className={`bg-[#FFFCF6] rounded-2xl p-4 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden ${
                  isVisible 
                    ? 'border-[#E6D2A3] hover:shadow-md' 
                    : 'border-stone-300/80 opacity-70 bg-stone-50'
                }`}
              >
                {/* Top: Icon & Shortcut */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isVisible 
                        ? 'bg-[#F5F0E6] text-[#8C6D28] border-[#E6D2A3]' 
                        : 'bg-stone-200 text-stone-500 border-stone-300'
                    }`}>
                      <IconComp size={20} />
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 border border-stone-300 text-stone-600">
                      {shortcut}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-black text-sm text-[#25231F] leading-tight mb-1">
                    {page.label}
                  </h3>
                  <span className="inline-block text-[9px] font-mono font-bold uppercase text-[#8C6D28] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mb-2">
                    {page.category}
                  </span>
                  <p className="text-[11px] text-[#77736B] leading-relaxed line-clamp-2">
                    {page.description}
                  </p>
                </div>

                {/* Bottom: Status & Toggle Button */}
                <div className="pt-4 mt-3 border-t border-[#E6D2A3]/60 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                    <span className="text-[#77736B]">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      isVisible 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-stone-200 text-stone-700 border border-stone-300'
                    }`}>
                      {isVisible ? 'VISÍVEL' : 'OCULTO'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(page.id)}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      isVisible
                        ? 'bg-[#292820] hover:bg-black text-[#FAF7F0] border border-[#D9C39B]'
                        : 'bg-stone-200 hover:bg-stone-300 text-[#25231F] border border-stone-400'
                    }`}
                  >
                    {isVisible ? (
                      <>
                        <EyeOff size={15} className="text-[#C49A45]" />
                        <span>Ocultar Página</span>
                      </>
                    ) : (
                      <>
                        <Eye size={15} className="text-emerald-700" />
                        <span>Tornar Visível</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM HELPER BANNER */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-[#E6D2A3] flex items-start gap-3 text-xs text-[#8C6D28]">
          <Info size={18} className="shrink-0 text-amber-700 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Sincronização Automática:</span> As alterações feitas nesta página são salvas imediatamente no sistema e sincronizadas com todos os dispositivos conectados. Para gerenciar login, senhas e usuários cadastrados, acesse a página <button onClick={onOpenCadastro} className="underline font-black hover:text-black">Cadastro</button>.
          </div>
        </div>

      </div>
    </div>
  );
}
