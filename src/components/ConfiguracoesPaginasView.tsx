import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  RotateCcw,
  Sliders,
  Users,
  Info,
  History,
  LayoutGrid,
  Lock
} from 'lucide-react';
import {
  getAllAvailablePages,
  loadPageVisibility,
  savePageVisibility,
  PageDefinition,
  ICON_MAP
} from '../data/pagesConfig';
import { rtdb } from '../firebase';
import { ref, set, onValue } from '../utils/rtdbWithUndo';
import CadastroView from './CadastroView';
import Historico from './Historico';
import { cn } from '../lib/utils';
import { logAuditAction, subscribeAuditHistory } from '../utils/auditHistory';

interface ConfiguracoesPaginasViewProps {
  onBack?: () => void;
  onOpenCadastro?: () => void;
  initialTab?: 'paginas' | 'cadastro' | 'historico';
  currentUser?: { email: string; name: string; role: string; allowedPages?: string[] } | null;
}

export default function ConfiguracoesPaginasView({
  onBack,
  onOpenCadastro: _onOpenCadastro,
  initialTab = 'paginas',
  currentUser
}: ConfiguracoesPaginasViewProps) {
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'Administrador' ||
    currentUser?.name?.toLowerCase() === 'jefferson' ||
    currentUser?.email?.trim().toLowerCase() === 'panenosistemab13@gmail.com' ||
    currentUser?.email?.trim().toLowerCase() === 'jefferson@3coracoes.com.br';
  const canViewHistory = isAdmin;

  const resolveInitialTab = (tab: 'paginas' | 'cadastro' | 'historico') => {
    if (tab === 'historico' && canViewHistory) return 'historico';
    return tab;
  };

  const [activeTab, setActiveTab] = useState<'paginas' | 'cadastro' | 'historico'>(() =>
    resolveInitialTab(initialTab)
  );
  const [pages, setPages] = useState<PageDefinition[]>([]);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const dynamicShortcutMap = useMemo(() => {
    const map: Record<string, string> = {
      menu: 'Ctrl + 1'
    };
    let currentNumber = 2;
    pages.forEach((p) => {
      if (p.id === 'cadastro' || p.id === 'settings') {
        map[p.id] = 'Acessos';
        return;
      }
      const isVis = visibility[p.id] !== false;
      if (isVis) {
        if (currentNumber <= 9) {
          map[p.id] = `Ctrl + ${currentNumber}`;
          currentNumber++;
        } else if (currentNumber === 10) {
          map[p.id] = 'Ctrl + 0';
          currentNumber++;
        } else {
          map[p.id] = 'Menu';
        }
      } else {
        map[p.id] = 'Oculto';
      }
    });
    return map;
  }, [pages, visibility]);

  useEffect(() => {
    setActiveTab(resolveInitialTab(initialTab));
  }, [initialTab, isAdmin, canViewHistory]);

  useEffect(() => {
    const unsubHistory = subscribeAuditHistory((list) => {
      setHistoryCount(list.length);
    });
    return () => unsubHistory();
  }, []);

  useEffect(() => {
    setPages(getAllAvailablePages());
    setVisibility(loadPageVisibility());

    const configRef = ref(rtdb, 'pages_config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.visibility) {
        const merged = { ...loadPageVisibility(), ...data.visibility };
        setVisibility(merged);
        savePageVisibility(merged);
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

    const pageName = pages.find((p) => p.id === pageId)?.label || pageId;
    logAuditAction({
      action: 'EDIT',
      module: 'Configurações',
      target: `Visibilidade: ${pageName}`,
      details: `Marcou página como ${nextVal ? 'VISÍVEL' : 'OCULTA'} no menu`
    });
    showToast(`Página "${pageName}" marcada como ${nextVal ? 'VISÍVEL' : 'OCULTA'}.`);
  };

  const handleShowAll = () => {
    const updated: Record<string, boolean> = {};
    pages.forEach((p) => {
      updated[p.id] = true;
    });
    setVisibility(updated);
    savePageVisibility(updated);
    try {
      set(ref(rtdb, 'pages_config/visibility'), updated);
    } catch (e) {
      console.error(e);
    }
    logAuditAction({
      action: 'EDIT',
      module: 'Configurações',
      target: 'Visibilidade de Páginas',
      details: 'Exibiu todas as páginas no menu principal'
    });
    showToast('Todas as páginas agora estão visíveis no menu.');
  };

  const handleResetToDefault = () => {
    const updated: Record<string, boolean> = {};
    pages.forEach((p) => {
      updated[p.id] = p.isDefaultVisible;
    });
    setVisibility(updated);
    savePageVisibility(updated);
    try {
      set(ref(rtdb, 'pages_config/visibility'), updated);
    } catch (e) {
      console.error(e);
    }
    logAuditAction({
      action: 'EDIT',
      module: 'Configurações',
      target: 'Visibilidade de Páginas',
      details: 'Restaurou visibilidade das páginas para o padrão do sistema'
    });
    showToast('Visibilidade restaurada para o padrão do sistema.');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const totalPages = pages.length;
  const visibleCount = pages.filter((p) => visibility[p.id] !== false).length;
  const hiddenCount = totalPages - visibleCount;

  if (!isAdmin) {
    return (
      <div className="min-h-full bg-[#F9F8F6] text-[#17191E] p-8 flex items-center justify-center select-none font-sans">
        <div className="max-w-md w-full bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF8] to-[#FAF1DC] border border-[#DFC078] rounded-3xl p-8 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] border-2 border-[#E7C46D] text-[#FFF5D6] flex items-center justify-center mb-4 shadow-sm">
            <Lock size={28} />
          </div>
          <h2 className="text-lg font-black text-[#17191E] uppercase mb-2">Acesso Restrito ao Administrador</h2>
          <p className="text-xs text-[#6B665D] leading-relaxed mb-6">
            Somente o Administrador tem permissão para visualizar informações relacionadas a páginas, e-mails e funções.
          </p>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full bg-gradient-to-b from-[#C81B24] via-[#8E0E17] to-[#560409] text-white text-xs font-extrabold uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer border-2 border-[#E7C46D]"
            >
              Voltar ao Início
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ zoom: 0.88 }}
      className="min-h-full bg-[#F9F8F6] text-[#17191E] p-4 sm:p-6 relative overflow-hidden select-none font-sans"
    >
      {/* Ornamentos luxuosos carmesim e dourado nos cantos */}
      <svg
        className="pointer-events-none fixed top-0 left-0 w-48 sm:w-72 h-28 sm:h-40 opacity-90 z-0"
        viewBox="0 0 320 180"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cfgTopLeftRed" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#63050A" />
            <stop offset="55%" stopColor="#A6111B" />
            <stop offset="100%" stopColor="#D6232D" />
          </linearGradient>
          <linearGradient id="cfgTopLeftGold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#B98321" />
            <stop offset="50%" stopColor="#FCE79D" />
            <stop offset="100%" stopColor="#D9A83E" />
          </linearGradient>
        </defs>
        <path d="M0 0H265C195 36 112 72 0 148V0Z" fill="url(#cfgTopLeftRed)" />
        <path d="M0 148C112 72 195 36 265 0H286C208 42 122 86 0 164V148Z" fill="url(#cfgTopLeftGold)" />
      </svg>

      <svg
        className="pointer-events-none fixed top-0 right-0 w-56 sm:w-96 h-32 sm:h-44 opacity-90 z-0"
        viewBox="0 0 380 180"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cfgTopRightRed" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#8E0E17" />
            <stop offset="55%" stopColor="#C81B24" />
            <stop offset="100%" stopColor="#5C050A" />
          </linearGradient>
          <linearGradient id="cfgTopRightGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E6BE5E" />
            <stop offset="50%" stopColor="#FFF0B8" />
            <stop offset="100%" stopColor="#B98321" />
          </linearGradient>
        </defs>
        <path d="M380 0H95C198 48 286 72 380 156V0Z" fill="url(#cfgTopRightRed)" />
        <path d="M95 0C198 48 286 72 380 156V172C278 88 184 58 68 0H95Z" fill="url(#cfgTopRightGold)" />
      </svg>

      <svg
        className="pointer-events-none fixed bottom-0 left-0 w-44 sm:w-64 h-24 sm:h-32 opacity-85 z-0"
        viewBox="0 0 260 130"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cfgBotLeftRed" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#5C050A" />
            <stop offset="60%" stopColor="#A6111B" />
            <stop offset="100%" stopColor="#D6232D" />
          </linearGradient>
          <linearGradient id="cfgBotLeftGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FCE79D" />
            <stop offset="100%" stopColor="#B98321" />
          </linearGradient>
        </defs>
        <path d="M0 130V22C68 78 138 106 238 130H0Z" fill="url(#cfgBotLeftRed)" />
        <path d="M0 22C68 78 138 106 238 130H256C148 98 74 66 0 6V22Z" fill="url(#cfgBotLeftGold)" />
      </svg>

      <svg
        className="pointer-events-none fixed bottom-0 right-0 w-48 sm:w-72 h-24 sm:h-32 opacity-85 z-0"
        viewBox="0 0 280 130"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cfgBotRightRed" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#5C050A" />
            <stop offset="65%" stopColor="#9E0E17" />
            <stop offset="100%" stopColor="#D2212B" />
          </linearGradient>
          <linearGradient id="cfgBotRightGold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#FCE79D" />
            <stop offset="100%" stopColor="#B98321" />
          </linearGradient>
        </defs>
        <path d="M280 130V18C204 78 132 106 24 130H280Z" fill="url(#cfgBotRightRed)" />
        <path d="M280 18C204 78 132 106 24 130H6C122 98 198 64 280 4V18Z" fill="url(#cfgBotRightGold)" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4">
        {/* CABEÇALHO PRINCIPAL */}
        <header className="relative overflow-hidden rounded-3xl border border-[#DFC078] bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF1DC] px-5 py-4 shadow-[0_12px_30px_-14px_rgba(92,16,22,0.22)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#FAF0DA] hover:brightness-95 text-[#17191E] border border-[#DFC078] shadow-[0_3px_10px_-3px_rgba(92,58,12,0.2)] flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                title="Voltar ao Início"
              >
                <ArrowLeft size={18} strokeWidth={2.3} />
              </button>
            )}

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#D41F29] via-[#9E0E17] to-[#63050A] border-2 border-[#E7C46D] shadow-[0_6px_16px_-4px_rgba(142,14,23,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center text-white shrink-0">
              <Settings size={23} className="text-[#FFF5D6]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#17191E] tracking-tight uppercase">
                  CONFIGURAÇÕES
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-b from-[#FCE79D] via-[#EAC159] to-[#C89428] text-[#292012] border border-[#DFB042] text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                  Central de Gestão
                </span>
              </div>
              <p className="text-xs text-[#6B665D] mt-0.5 font-medium">
                Gerencie as páginas do sistema, visibilidade no menu e cadastro de usuários com suas funções
              </p>
            </div>
          </div>

          {isAdmin && activeTab === 'paginas' && (
            <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
              <button
                type="button"
                onClick={handleShowAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#FAF0DA] hover:brightness-98 text-[#292012] border border-[#DFC078] text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                <Eye size={14} className="text-emerald-600" />
                <span>Exibir Todas</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#FAF0DA] hover:brightness-98 text-[#292012] border border-[#DFC078] text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw size={14} className="text-[#8E0E17]" />
                <span>Restaurar Padrão</span>
              </button>
            </div>
          )}
        </header>

        {/* ABAS SUPERIORES EM CÁPSULA 3D */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-0.5">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('paginas')}
              className={cn(
                'px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer active:scale-97',
                activeTab === 'paginas'
                  ? 'bg-gradient-to-b from-[#C81B24] via-[#8E0E17] to-[#560409] border-2 border-[#E7C46D] text-white shadow-[0_8px_20px_-6px_rgba(142,14,23,0.5),inset_0_1px_0_rgba(255,255,255,0.28)]'
                  : 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF0DA] border border-[#DFC078] text-[#292012] shadow-[0_4px_12px_-4px_rgba(92,58,12,0.18)] hover:border-[#B98321]'
              )}
            >
              <LayoutGrid
                size={15}
                className={activeTab === 'paginas' ? 'text-[#FCE79D]' : 'text-[#8C6D28]'}
              />
              <span>Páginas & Menu</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums border',
                  activeTab === 'paginas'
                    ? 'bg-[#4B0409] border-[#E7C46D]/70 text-[#FCE79D]'
                    : 'bg-gradient-to-b from-[#FCE79D] to-[#DFB042] border-[#DFB042] text-[#292012]'
                )}
              >
                {visibleCount} ativas
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('cadastro')}
            className={cn(
              'px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer active:scale-97',
              activeTab === 'cadastro'
                ? 'bg-gradient-to-b from-[#C81B24] via-[#8E0E17] to-[#560409] border-2 border-[#E7C46D] text-white shadow-[0_8px_20px_-6px_rgba(142,14,23,0.5),inset_0_1px_0_rgba(255,255,255,0.28)]'
                : 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF0DA] border border-[#DFC078] text-[#292012] shadow-[0_4px_12px_-4px_rgba(92,58,12,0.18)] hover:border-[#B98321]'
            )}
          >
            <Users
              size={15}
              className={activeTab === 'cadastro' ? 'text-[#FCE79D]' : 'text-[#8C6D28]'}
            />
            <span>Aba Cadastro (Usuários & Funções)</span>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border',
                activeTab === 'cadastro'
                  ? 'bg-[#4B0409] border-[#E7C46D]/70 text-[#FCE79D]'
                  : 'bg-gradient-to-b from-[#FCE79D] to-[#DFB042] border-[#DFB042] text-[#292012]'
              )}
            >
              Acessos
            </span>
          </button>

          {canViewHistory && (
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              className={cn(
                'px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer active:scale-97',
                activeTab === 'historico'
                  ? 'bg-gradient-to-b from-[#C81B24] via-[#8E0E17] to-[#560409] border-2 border-[#E7C46D] text-white shadow-[0_8px_20px_-6px_rgba(142,14,23,0.5),inset_0_1px_0_rgba(255,255,255,0.28)]'
                  : 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF0DA] border border-[#DFC078] text-[#292012] shadow-[0_4px_12px_-4px_rgba(92,58,12,0.18)] hover:border-[#B98321]'
              )}
            >
              <History
                size={15}
                className={activeTab === 'historico' ? 'text-[#FCE79D]' : 'text-[#8C6D28]'}
              />
              <span>Histórico</span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums border',
                  activeTab === 'historico'
                    ? 'bg-[#4B0409] border-[#E7C46D]/70 text-[#FCE79D]'
                    : 'bg-gradient-to-b from-[#FCE79D] to-[#DFB042] border-[#DFB042] text-[#292012]'
                )}
              >
                {historyCount} ações
              </span>
            </button>
          )}
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
            <Check size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* TAB 1: PÁGINAS & MENU */}
        {activeTab === 'paginas' && (
          <div className="space-y-5">
            {/* METRICS SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF1DC] border border-[#DFC078] rounded-3xl p-4 shadow-[0_8px_20px_-10px_rgba(92,58,12,0.16)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-[#6B665D] uppercase tracking-wider">
                    Total de Módulos
                  </p>
                  <p className="text-2xl font-black text-[#17191E] mt-0.5 tabular-nums">{totalPages}</p>
                </div>
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#FCE79D] via-[#E5BB54] to-[#B98321] border border-[#DFC078] flex items-center justify-center text-[#59090F] shadow-xs">
                  <Sliders size={18} />
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF1DC] border border-[#DFC078] rounded-3xl p-4 shadow-[0_8px_20px_-10px_rgba(92,58,12,0.16)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                    Módulos Visíveis
                  </p>
                  <p className="text-2xl font-black text-emerald-700 mt-0.5 tabular-nums">{visibleCount}</p>
                </div>
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 border-2 border-emerald-200 flex items-center justify-center text-white shadow-xs">
                  <Eye size={18} />
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF1DC] border border-[#DFC078] rounded-3xl p-4 shadow-[0_8px_20px_-10px_rgba(92,58,12,0.16)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-[#8E0E17] uppercase tracking-wider">
                    Módulos Ocultos
                  </p>
                  <p className="text-2xl font-black text-[#8E0E17] mt-0.5 tabular-nums">{hiddenCount}</p>
                </div>
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] border-2 border-[#E7C46D] flex items-center justify-center text-white shadow-xs">
                  <EyeOff size={18} />
                </div>
              </div>
            </div>

            {/* PAGES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pages.map((page) => {
                const isVisible = visibility[page.id] !== false;
                const IconComp = ICON_MAP[page.iconName] || Sliders;
                const shortcut = dynamicShortcutMap[page.id] || (isVisible ? 'Ativo' : 'Oculto');

                return (
                  <div
                    key={page.id}
                    className={cn(
                      'rounded-3xl p-4 border transition-all flex flex-col justify-between shadow-sm relative overflow-hidden',
                      isVisible
                        ? 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF1DC] border-[#DFC078] hover:shadow-md'
                        : 'bg-[#F6F3EC] border-[#E0D6C0] opacity-75'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center border shadow-xs',
                            isVisible
                              ? 'bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] text-white border-[#E7C46D]'
                              : 'bg-stone-200 text-stone-500 border-stone-300'
                          )}
                        >
                          <IconComp size={18} />
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#DFC078] text-[#5B4720]">
                          {shortcut}
                        </span>
                      </div>

                      <h3 className="font-black text-sm text-[#17191E] leading-tight mb-1.5">
                        {page.label}
                      </h3>
                      <span className="inline-block text-[9px] font-extrabold uppercase text-[#7A5610] bg-gradient-to-b from-[#FFF3C9] to-[#F7DE94] px-2.5 py-0.5 rounded-full border border-[#DFC078] mb-2">
                        {page.category}
                      </span>
                      <p className="text-[11px] text-[#6B665D] leading-relaxed line-clamp-2">
                        {page.description}
                      </p>
                    </div>

                    <div className="pt-3.5 mt-3 border-t border-[#E6D2A3]/80 space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                        <span className="text-[#6B665D]">Status:</span>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full border',
                            isVisible
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-stone-200 text-stone-600 border-stone-300'
                          )}
                        >
                          {isVisible ? 'VISÍVEL' : 'OCULTO'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(page.id)}
                        className={cn(
                          'w-full py-2 px-3 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs',
                          isVisible
                            ? 'bg-gradient-to-b from-[#C81B24] via-[#8E0E17] to-[#560409] hover:brightness-110 text-white border border-[#E7C46D]'
                            : 'bg-gradient-to-b from-[#FFFFFF] to-[#FAF0DA] hover:brightness-98 text-[#292012] border border-[#DFC078]'
                        )}
                      >
                        {isVisible ? (
                          <>
                            <EyeOff size={14} className="text-[#FCE79D]" />
                            <span>Ocultar Página</span>
                          </>
                        ) : (
                          <>
                            <Eye size={14} className="text-emerald-600" />
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
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF6DC] via-[#FCECC0]/70 to-[#FFF6DC] border border-[#DFC078] flex items-start gap-3 text-xs text-[#6B4E12]">
              <Info size={18} className="shrink-0 text-[#9E0E17] mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-extrabold">Dica Operacional:</span> As preferências de visibilidade gerais afetam o menu principal do Administrador. Para definir quais páginas cada usuário pode visualizar, acesse a{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('cadastro')}
                  className="underline font-black text-[#8E0E17] hover:text-black cursor-pointer"
                >
                  Aba Cadastro
                </button>
                .
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ABA CADASTRO (USUÁRIOS & FUNÇÕES) */}
        {activeTab === 'cadastro' && (
          <div>
            <CadastroView
              embedded={true}
              currentUser={currentUser}
              onBack={onBack}
            />
          </div>
        )}

        {/* TAB 3: HISTÓRICO DE AÇÕES DOS USUÁRIOS */}
        {activeTab === 'historico' && canViewHistory && (
          <div>
            <Historico
              embedded={true}
              currentUser={currentUser}
              onBack={onBack}
            />
          </div>
        )}
      </div>
    </div>
  );
}
