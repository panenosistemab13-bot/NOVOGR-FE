import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  ClipboardCheck,
  FileCheck2,
  Share2,
  BarChart3,
  Calendar,
  Users2,
  MapPin,
  ChevronRight,
  ChevronDown,
  Lock,
  LogOut,
  Search,
  Bell,
  Sun,
  X,
  Settings,
  Package,
  Truck,
  Route
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PageDefinition, ICON_MAP, getAllAvailablePages, loadPageVisibility } from '../data/pagesConfig';

import Checklist from './Checklist';
import Averbacao from './Averbacao';
import SMCreator from './SMCreator';
import Controle from './Controle';
import Escala from './Escala';
import Disponibilidade from './Disponibilidade';
import Iscas from './Iscas';
import PresenceList from './PresenceList';
import Rotas from './Rotas';
import MainDashboard from './Dashboard/MainDashboard';

// High-fidelity image assets
import avatarJefferson from '../assets/images/avatar_jefferson_dias_1790206857666.jpg';
import goldMedalLogo from '../assets/images/gold_logo_medal_3c_1790406432555.jpg';
import footerBeansBanner from '../assets/images/footer_beans_banner_1790423099535.jpg';

interface InitialMenuProps {
  onSelect: (pageId: string) => void;
  pages?: PageDefinition[];
  activeTab?: string;
  onUnlockPresenceList?: () => void;
  onLogout?: () => void;
  averbacaoView?: 'generator' | 'analytics';
  smCreatorView?: 'generator' | 'codes';
  focusedIndex?: any;
  setFocusedIndex?: any;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  showPresenceList?: boolean;
  showRotasPage?: boolean;
  currentUser?: { email: string; name: string; role: string } | null;
}

export default function InitialMenu({
  onSelect,
  activeTab = 'menu',
  onUnlockPresenceList,
  onLogout,
  averbacaoView = 'generator',
  smCreatorView = 'generator',
  pageVisibility = {},
  availablePages = [],
  currentUser
}: InitialMenuProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNav, setActiveNav] = useState(activeTab);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Proportional 1930 x 820 scaling controller
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setActiveNav(activeTab);
  }, [activeTab]);

  // Synchronized real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute uniform scale to fit 1930 x 820 perfectly into the viewport
  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1930;
      const targetHeight = 820;
      const wWidth = window.innerWidth;
      const wHeight = window.innerHeight;

      // Uniform proportional scale
      const sX = wWidth / targetWidth;
      const sY = wHeight / targetHeight;
      const calculatedScale = Math.min(sX, sY);

      // Clamp between 0.5 and 1.25
      setScale(Math.max(0.5, Math.min(1.25, calculatedScale)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, [currentTime]);

  const formattedDate = useMemo(() => {
    const day = currentTime.getDate();
    const month = currentTime.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
    const year = currentTime.getFullYear();
    return `${day} ${month} ${year}`;
  }, [currentTime]);

  // Sidebar navigation items dynamically generated from shared config
  const sidebarItems = useMemo(() => {
    const base = [{ id: 'menu', label: 'Início', icon: Home }];
    const pages = (availablePages.length > 0 ? availablePages : getAllAvailablePages())
      .filter(p => p.id !== 'cadastro' && Boolean((pageVisibility && pageVisibility[p.id]) ?? true))
      .map(p => ({
        id: p.id,
        label: p.label,
        icon: ICON_MAP[p.iconName] || Route
      }));
    return [...base, ...pages];
  }, [availablePages, pageVisibility]);

  const handleItemClick = (id: string) => {
    setActiveNav(id);
    onSelect(id);
  };

  const renderActiveModuleContent = () => {
    switch (activeNav) {
      case 'checklist':
        return <Checklist />;
      case 'averbacao':
        return <Averbacao view={averbacaoView} onBack={() => handleItemClick('menu')} />;
      case 'sm_creator':
        return <SMCreator view={smCreatorView} onBack={() => handleItemClick('menu')} />;
      case 'iscas':
        return <Iscas onBack={() => handleItemClick('menu')} />;
      case 'controle':
        return <Controle onBack={() => handleItemClick('menu')} />;
      case 'disponibilidade':
        return <Disponibilidade onBack={() => handleItemClick('menu')} />;
      case 'escala':
        return <Escala onBack={() => handleItemClick('menu')} />;
      case 'presence':
        return <PresenceList onBack={() => handleItemClick('menu')} />;
      case 'rotas':
        return <Rotas onBack={() => handleItemClick('menu')} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen h-screen overflow-hidden flex items-center justify-center bg-[#EFE8D8] text-[#33291B] font-sans relative select-none">

      {/* ========================================================================= */}
      {/* UNIFORMLY SCALED DESIGN CANVAS (1930px × 820px BASE CANVAS)               */}
      {/* ========================================================================= */}
      <div
        style={{
          width: `${1930 * scale}px`,
          height: `${820 * scale}px`,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div 
          ref={containerRef}
          style={{
            width: '1930px',
            height: '820px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          className="bg-[#F5EFE4] shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col justify-between overflow-hidden"
        >

          {/* ===================================================================== */}
          {/* 1. TOPBAR OPERACIONAL CAFÉ TRÊS CORAÇÕES (HEIGHT = 65px)              */}
          {/* ===================================================================== */}
          <header className="w-full h-[65px] px-6 border-b border-[#E8DDCA] flex items-center justify-between z-40 shrink-0 bg-[#FFFEFC]">
            
            {/* Left: Brand Identity & Sistema Operacional Title */}
            <div className="flex items-center gap-6">
              <div 
                onClick={() => handleItemClick('menu')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(180,130,40,0.15)] group-hover:scale-105 transition-transform flex items-center justify-center bg-transparent border-2 border-[#D8B065]">
                  <img 
                    src={goldMedalLogo} 
                    alt="Café Três Corações"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="leading-tight text-left">
                  <strong className="text-[16px] font-black text-[#25231F] tracking-wide font-sans block">
                    Café Três Corações
                  </strong>
                  <span className="text-[8px] font-bold text-[#8C6D28] uppercase tracking-widest block mt-0.5">
                    SEGURANÇA • LOGÍSTICA • RESULTADOS
                  </span>
                </div>
              </div>

              <div className="h-7 w-px bg-[#E8DDCA] shrink-0" />

              {/* Sistema Operacional Center Title */}
              <div className="flex flex-col text-left leading-tight shrink-0">
                <span className="text-[13.5px] font-black uppercase tracking-wider text-[#25231F] font-sans">
                  SISTEMA OPERACIONAL
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#8C6D28] mt-0.5">
                  CONTROLE TÁTICO • GESTÃO • RESULTADOS
                </span>
              </div>
            </div>

            {/* Center-Right & Right: Search, Notifications, Profile, Weather & Clock */}
            <div className="flex items-center gap-4 shrink-0">

              <div className="flex items-center gap-2.5 px-4 h-[40px] rounded-[25px] bg-[#f2e8d8]/85 border border-[#dfd6c6] w-[275px] shadow-inner text-stone-600 focus-within:bg-white focus-within:border-stone-400 transition-all">
                <Search size={14} className="text-stone-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Buscar no sistema..."
                  className="bg-transparent border-none outline-none text-[12.5px] text-stone-800 placeholder-stone-400 w-full font-sans"
                />
              </div>

              <div className="relative shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-9 h-9 rounded-full bg-white hover:bg-stone-50 border border-[#dfd6c6] flex items-center justify-center text-stone-700 shadow-2xs transition-colors cursor-pointer"
                >
                  <Bell size={15} />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8e0b18] text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  3
                </span>
              </div>

              <div className="relative shrink-0">
                <div 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-[#dfd6c6] transition-colors cursor-pointer shadow-2xs group"
                >
                  <img
                    src={avatarJefferson}
                    alt="Jefferson Dias"
                    className="w-7.5 h-7.5 rounded-full object-cover border border-stone-300 shadow-xs"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[12px] font-bold text-stone-900 leading-tight">
                      {currentUser?.name || 'Jefferson Dias'}
                    </span>
                    <span className="text-[9px] text-stone-500 font-medium leading-none mt-0.5">
                      {currentUser?.role === 'admin' ? 'Administrador' : 'Funcionário'}
                    </span>
                  </div>
                  <ChevronDown size={13} className="text-stone-400 group-hover:text-stone-700 ml-0.5 transition-colors" />
                </div>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 top-full w-56 bg-white border border-[#ded5c6] rounded-2xl shadow-xl p-2 z-50 text-xs"
                    >
                      <button
                        onClick={onUnlockPresenceList}
                        className="w-full px-3 py-2 rounded-xl text-left hover:bg-stone-50 text-stone-800 font-bold flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                          <Lock size={14} />
                        </div>
                        <span>Segurança Operacional</span>
                      </button>
                      {onLogout && (
                        <button
                          onClick={onLogout}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-red-50 text-red-700 font-bold flex items-center gap-3 transition-colors cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                            <LogOut size={14} />
                          </div>
                          <span>Encerrar Sessão</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col items-end border-l border-[#dfd6c6] pl-4 leading-tight shrink-0">
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                  {formattedDate}
                </span>
                <strong className="text-[19px] font-mono font-black text-stone-900 tracking-tight mt-0.5">
                  {formattedTime}
                </strong>
                <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-stone-600 mt-0.5">
                  <span>Fortaleza - CE</span>
                  <Sun size={11} className="text-amber-500 fill-amber-500" />
                  <span className="font-mono font-black">28°C</span>
                </div>
              </div>

            </div>

          </header>

          {/* ===================================================================== */}
          {/* 2. MAIN WORKSPACE: SIDEBAR (~280px) + CONTENT AREA                   */}
          {/* ===================================================================== */}
          <main className="flex-1 w-full px-4 py-2.5 gap-3 flex items-stretch overflow-hidden min-h-0">
            
            <aside className="w-[280px] shrink-0 bg-[#FAF6EE] border border-[#E8DDCA] rounded-[22px] p-3 shadow-sm flex flex-col justify-between h-full overflow-y-auto">
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDCA]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#D8B065] flex items-center justify-center bg-white shadow-xs">
                      <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-[12.5px] font-black text-[#25231F] uppercase tracking-wider block font-heading">
                        MENU OPERACIONAL
                      </span>
                      <span className="text-[7.5px] font-bold text-[#8C6D28] uppercase tracking-widest block mt-0.5 font-mono">
                        PAINEL CENTRAL DO SISTEMA
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleItemClick('menu')}
                    className="w-7 h-7 rounded-full bg-white border border-[#E8DDCA] flex items-center justify-center text-[#8C6D28] hover:bg-stone-50 transition-colors cursor-pointer shadow-xs"
                  >
                    <X size={13} />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {sidebarItems.map((item) => {
                    const isActive = activeNav === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={cn(
                          "w-full h-[48px] flex items-center justify-between px-3.5 rounded-[16px] font-black uppercase text-[11.5px] tracking-wide transition-all duration-200 cursor-pointer group text-left relative",
                          isActive
                            ? "bg-gradient-to-r from-[#D8B065] via-[#C59B48] to-[#AA7E2F] text-white shadow-md border border-[#C59B48]"
                            : "bg-white text-[#25231F] hover:bg-[#FAF6EE] border border-[#E8DDCA]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-2xs border",
                            isActive ? "bg-white/20 text-white border-white/30" : "bg-stone-50 text-[#8C6D28] border-stone-200"
                          )}>
                            <Icon size={14} />
                          </div>
                          <span className="font-sans font-black text-[11.5px] tracking-wide">
                            {item.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/10 border border-white/20 text-[9px] font-black text-white tracking-widest uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              ATIVO
                            </span>
                          )}
                          <ChevronRight 
                            size={14} 
                            className={cn(
                              "shrink-0 transition-transform",
                              isActive ? "text-white" : "text-stone-400 group-hover:text-[#8C6D28]"
                            )} 
                          />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-2 pt-2 border-t border-[#E8DDCA]">
                <button
                  onClick={() => {
                    if (currentUser?.role === 'admin') {
                      handleItemClick('settings');
                    } else {
                      handleItemClick('cadastro');
                    }
                  }}
                  className="w-full h-[45px] flex items-center justify-between px-3.5 rounded-[16px] bg-white hover:bg-stone-50 text-[#25231F] hover:text-[#8C6D28] border border-[#E8DDCA] font-black uppercase text-[11px] tracking-wide transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7.5 h-7.5 rounded-full bg-stone-50 text-[#8C6D28] border border-stone-200 flex items-center justify-center shrink-0">
                      <Settings size={14} />
                    </div>
                    <span>{currentUser?.role === 'admin' ? 'CONFIGURAÇÕES & PÁGINAS' : 'MEU PERFIL / SENHA'}</span>
                  </div>
                  <ChevronRight size={14} className="text-stone-400" />
                </button>
              </div>

            </aside>

            <section className="flex-1 min-w-0 h-full overflow-hidden">
              {activeNav === 'menu' ? (
                <MainDashboard 
                  onNavigate={handleItemClick} 
                />
              ) : (
                <div id="main-scroll-container" className="bg-white rounded-[22px] h-full overflow-y-auto border border-[#E8DDCA] shadow-sm relative z-10 p-5">
                  <div className="mb-4 pb-3 border-b border-[#E8DDCA] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleItemClick('menu')}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-[#25231F] text-xs font-bold transition-colors cursor-pointer border border-stone-200"
                      >
                        ‹ Voltar ao Início
                      </button>
                      <span className="text-xs font-bold text-[#25231F] uppercase tracking-wider">
                        {sidebarItems.find(i => i.id === activeNav)?.label}
                      </span>
                    </div>
                  </div>
                  {renderActiveModuleContent()}
                </div>
              )}
            </section>

          </main>

          {/* ===================================================================== */}
          {/* 3. CINEMATIC BOTTOM FOOTER BAR                                        */}
          {/* ===================================================================== */}
          <footer className="w-full h-[40px] px-6 border-t border-[#E8DDCA] flex items-center justify-between relative overflow-hidden shrink-0 z-30 bg-[#FFFEFC]">
            
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img 
                src={footerBeansBanner} 
                alt="Coffee Beans Banner" 
                className="w-full h-full object-cover object-right" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFEFC] via-[#FFFEFC]/80 to-transparent pointer-events-none" />

            <div className="w-48 z-10" />

            <div className="z-10 text-center flex flex-col items-center">
              <span className="text-[10px] font-mono font-bold tracking-[0.28em] text-[#8C6D28] uppercase drop-shadow-sm">
                JUNTOS, LEVAMOS O MELHOR DO CAFÉ MAIS LONGE.
              </span>
              <span className="text-[9px] font-sans font-semibold tracking-wide text-[#A39274] lowercase mt-0.5">
                criado por jefferson augusto
              </span>
            </div>

            <div className="flex items-center gap-3 z-10">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8e0b18] to-[#5a060f] border border-[#dfb15b] p-0.5 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#dfb15b]">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>

              <div className="h-4 w-px bg-[#D8B065]/60" />

              <div className="px-2.5 py-0.5 rounded-full bg-[#e11d24] border border-[#ffdd00] shadow-sm flex items-center justify-center">
                <span className="text-[10px] font-black tracking-tight text-[#ffdd00] font-sans italic">
                  Yoki
                </span>
              </div>

            </div>

          </footer>

        </div>
      </div>

    </div>
  );
}
