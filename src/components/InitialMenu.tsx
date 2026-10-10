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
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PageDefinition } from '../data/pagesConfig';

import Checklist from './Checklist';
import Averbacao from './Averbacao';
import SMCreator from './SMCreator';
import Controle from './Controle';
import Escala from './Escala';
import PresenceList from './PresenceList';
import Rotas from './Rotas';
import DashboardInicioFuturistic from './DashboardInicioFuturistic';

// High-fidelity image assets
import avatarJefferson from '../assets/images/avatar_jefferson_dias_1790206857666.jpg';
import coffeeLatteCup from '../assets/images/latte_cup_saucer_beans_1790406410066.jpg';
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
  pageVisibility?: any;
  availablePages?: any;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
}

export default function InitialMenu({
  onSelect,
  activeTab = 'menu',
  onUnlockPresenceList,
  onLogout,
  averbacaoView = 'generator',
  smCreatorView = 'generator',
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

  // Sidebar navigation items matching the layout
  const sidebarItems = [
    { id: 'menu', label: 'Início', icon: Home },
    { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
    { id: 'averbacao', label: 'Averbação', icon: FileCheck2 },
    { id: 'sm_creator', label: 'SM', icon: Share2 },
    { id: 'controle', label: 'Controle', icon: BarChart3 },
    { id: 'escala', label: 'Escala', icon: Calendar },
    { id: 'presence', label: 'Lista de Presença', icon: Users2 },
    { id: 'rotas', label: 'Rotas', icon: MapPin },
  ];

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
      case 'controle':
        return <Controle onBack={() => handleItemClick('menu')} />;
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
    <div className="w-full min-h-screen h-screen overflow-hidden flex items-center justify-center bg-[#090a0c] text-[#FAF7F0] font-sans relative select-none">

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
          className="bg-[#121417] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col justify-between overflow-hidden"
        >

          {/* ===================================================================== */}
          {/* 1. TOPBAR OPERACIONAL CAFÉ TRÊS CORAÇÕES (HEIGHT = 65px)              */}
          {/* ===================================================================== */}
          <header className="w-full h-[65px] px-6 border-b border-[#C5A059] flex items-center justify-between z-40 shrink-0" style={{ background: 'linear-gradient(180deg, #181A1D 0%, #252A30 100%)' }}>
            
            {/* Left: Brand Identity & Sistema Operacional Title */}
            <div className="flex items-center gap-6">
              <div 
                onClick={() => handleItemClick('menu')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* 3D Gold Rimmed Red Circle Medal with 3 Corações Heart Logo */}
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 shadow-[0_4px_12px_rgba(180,130,40,0.35)] group-hover:scale-105 transition-transform flex items-center justify-center bg-transparent border-2 border-[#C5A059]">
                  <img 
                    src={goldMedalLogo} 
                    alt="Café Três Corações"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="leading-tight text-left">
                  <strong className="text-[16px] font-black text-[#FAF7F0] tracking-wide font-sans block">
                    Café Três Corações
                  </strong>
                  <span className="text-[8px] font-bold text-[#C5A059] uppercase tracking-widest block mt-0.5">
                    SEGURANÇA • LOGÍSTICA • RESULTADOS
                  </span>
                </div>
              </div>

              <div className="h-7 w-px bg-[#C5A059] shrink-0" />

              {/* Sistema Operacional Center Title */}
              <div className="flex flex-col text-left leading-tight shrink-0">
                <span className="text-[13.5px] font-black uppercase tracking-wider text-[#FAF7F0] font-sans">
                  SISTEMA OPERACIONAL
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#C5A059] mt-0.5">
                  CONTROLE TÁTICO • GESTÃO • RESULTADOS
                </span>
              </div>
            </div>

            {/* Center-Right & Right: Search, Notifications, Profile, Weather & Clock */}
            <div className="flex items-center gap-4 shrink-0">

              {/* Search Bar Pill (Width ~280px, Height ~40px, Radius ~25px) */}
              <div className="flex items-center gap-2.5 px-4 h-[40px] rounded-[25px] bg-[#f2e8d8]/85 border border-[#dfd6c6] w-[275px] shadow-inner text-stone-600 focus-within:bg-white focus-within:border-stone-400 transition-all">
                <Search size={14} className="text-stone-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Buscar no sistema..."
                  className="bg-transparent border-none outline-none text-[12.5px] text-stone-800 placeholder-stone-400 w-full font-sans"
                />
              </div>

              {/* Notification Bell with Badge 3 */}
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

              {/* User Profile Capsule */}
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
                    <span className="text-[12px] font-bold text-stone-900 leading-tight">Jefferson Dias</span>
                    <span className="text-[9px] text-stone-500 font-medium leading-none mt-0.5">Administrador</span>
                  </div>
                  <ChevronDown size={13} className="text-stone-400 group-hover:text-stone-700 ml-0.5 transition-colors" />
                </div>

                {/* Profile Dropdown */}
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

              {/* Date, Time & Weather (Fortaleza - CE ☀️ 28°C) */}
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
          {/* 2. MAIN WORKSPACE: SIDEBAR (~200px) + DASHBOARD CONTENT (~1700px)     */}
          {/* ===================================================================== */}
          <main className="flex-1 w-full px-4 py-2.5 gap-3 flex items-stretch overflow-hidden min-h-0">
            
            {/* ------------------------------------------------------------------- */}
            {/* LEFT SIDEBAR (~200px)                                               */}
            {/* ------------------------------------------------------------------- */}
            {/* ------------------------------------------------------------------- */}
            {/* LEFT SIDEBAR (~280px) - MENU OPERACIONAL                            */}
            {/* ------------------------------------------------------------------- */}
            <aside className="w-[280px] shrink-0 bg-[#121417] border border-[#C5A059] rounded-[22px] p-3 shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col justify-between h-full overflow-y-auto">
              
              <div className="flex flex-col gap-3">
                {/* Header in sidebar matching image */}
                <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#C5A059] flex items-center justify-center bg-[#181A1D]">
                      <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-[12.5px] font-black text-[#C5A059] uppercase tracking-wider block font-heading">
                        MENU OPERACIONAL
                      </span>
                      <span className="text-[7.5px] font-bold text-stone-400 uppercase tracking-widest block mt-0.5 font-mono">
                        PAINEL CENTRAL DO SISTEMA
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleItemClick('menu')}
                    className="w-7 h-7 rounded-full bg-[#181A1D] border border-[#C5A059]/60 flex items-center justify-center text-[#C5A059] hover:bg-[#C91F2D] hover:text-white transition-colors cursor-pointer shadow-xs"
                    title="Fechar / Início"
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Navigation Links */}
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
                            ? "bg-gradient-to-r from-[#8e0b18] via-[#a91625] to-[#6f0712] text-white shadow-[0_4px_16px_rgba(201,31,45,0.45)] border border-red-500/50"
                            : "bg-[#181A1D] text-[#FAF7F0] hover:text-[#C5A059] hover:bg-[#1f2429] border border-[#C5A059]/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-2xs border",
                            isActive ? "bg-[#C5A059] text-[#121417] border-[#fff8e3]" : "bg-[#121417] text-[#C5A059] border-[#C5A059]/60"
                          )}>
                            <Icon size={14} />
                          </div>
                          <span className="font-sans font-black text-[11.5px] tracking-wide">
                            {item.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 border border-white/20 text-[9px] font-black text-white tracking-widest uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              ATIVO
                            </span>
                          )}
                          <ChevronRight 
                            size={14} 
                            className={cn(
                              "shrink-0 transition-transform",
                              isActive ? "text-[#C5A059]" : "text-stone-500 group-hover:text-[#C5A059]"
                            )} 
                          />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Config Button */}
              <div className="mt-2 pt-2 border-t border-[#C5A059]/50">
                <button
                  onClick={() => handleItemClick('controle')}
                  className="w-full h-[45px] flex items-center justify-between px-3.5 rounded-[16px] bg-[#181A1D] hover:bg-[#1f2429] text-[#FAF7F0] hover:text-[#C5A059] border border-[#C5A059]/40 font-black uppercase text-[11px] tracking-wide transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7.5 h-7.5 rounded-full bg-[#121417] text-[#C5A059] border border-[#C5A059]/60 flex items-center justify-center shrink-0">
                      <Settings size={14} />
                    </div>
                    <span>CONFIGURAÇÕES & PÁGINAS</span>
                  </div>
                  <ChevronRight size={14} className="text-stone-500" />
                </button>
              </div>

            </aside>

            {/* ------------------------------------------------------------------- */}
            {/* MAIN CONTENT AREA: DASHBOARD OR ACTIVE SUB-MODULE                   */}
            {/* ------------------------------------------------------------------- */}
            <section className="flex-1 min-w-0 h-full overflow-hidden">
              {activeNav === 'menu' ? (
                <DashboardInicioFuturistic onNavigate={handleItemClick} />
              ) : (
                <div id="main-scroll-container" className="bg-[#121417] rounded-[22px] h-full overflow-y-auto border border-[#C5A059] shadow-md relative z-10 p-5">
                  <div className="mb-4 pb-3 border-b border-[#C5A059] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleItemClick('menu')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#181A1D] hover:bg-[#252A30] text-[#FAF7F0] text-xs font-bold transition-colors cursor-pointer"
                      >
                        ‹ Voltar ao Início
                      </button>
                      <span className="text-xs font-bold text-[#FAF7F0] uppercase tracking-wider">
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
          <footer className="w-full h-[40px] px-6 border-t border-[#C5A059] flex items-center justify-between relative overflow-hidden shrink-0 z-30 shadow-inner" style={{ background: 'linear-gradient(180deg, #181A1D 0%, #252A30 100%)' }}>
            
            {/* Background roasted coffee beans texture on the right */}
            <div className="absolute inset-0 opacity-45 pointer-events-none">
              <img 
                src={footerBeansBanner} 
                alt="Coffee Beans Banner" 
                className="w-full h-full object-cover object-right" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#181A1D] via-[#181A1D]/80 to-transparent pointer-events-none" />

            {/* Left Spacer */}
            <div className="w-48 z-10" />

            {/* Center Slogan */}
            <div className="z-10 text-center">
              <span className="text-[10px] font-mono font-bold tracking-[0.28em] text-[#C5A059] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                JUNTOS, LEVAMOS O MELHOR DO CAFÉ MAIS LONGE.
              </span>
            </div>

            {/* Right Brand Badges: 3 Corações Heart Logo + Gold Line + Yoki Logo */}
            <div className="flex items-center gap-3 z-10">
              
              {/* 3 Corações Round Red/Gold Badge */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8e0b18] to-[#5a060f] border border-[#dfb15b] p-0.5 shadow-md flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#dfb15b]">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>

              {/* Vertical Gold Divider */}
              <div className="h-4 w-px bg-[#dfb15b]/60" />

              {/* Yoki Brand Oval Logo Badge */}
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
