import React, { useEffect, useMemo } from 'react';
import { 
  Home, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  Route,
  X,
  RotateCcw,
  CalendarDays,
  Bell,
  ListFilter,
  Truck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageDefinition, getAllAvailablePages, loadPageVisibility, ICON_MAP } from '../../data/pagesConfig';

interface NavigationDrawerProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettings?: () => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  currentUser?: { email: string; name: string; role: string; roleLabel?: string; allowedPages?: string[] } | null;
}

export default function NavigationDrawer({
  activeTab,
  onSelectTab,
  onOpenSettings,
  isCollapsed = true,
  setIsCollapsed,
  isOpen = false,
  setIsOpen,
  pageVisibility,
  availablePages,
  currentUser
}: NavigationDrawerProps) {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && setIsOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const menuItems = useMemo(() => {
    const pages = (availablePages && availablePages.length > 0) ? availablePages : getAllAvailablePages();
    const vis = pageVisibility || loadPageVisibility();
    const isAgenteDeRisco = currentUser?.role === 'agente_de_risco' || currentUser?.role === 'funcionario';
    const userAllowed = isAgenteDeRisco ? (currentUser?.allowedPages || []) : null;

    const items: Array<{ id: string; label: string; subtitle: string; icon: React.ElementType }> = [
      { id: 'menu', label: 'Início', subtitle: 'Painel Central', icon: Home }
    ];
    pages.forEach(p => {
      if (p.id !== 'cadastro' && p.id !== 'settings' && vis[p.id] !== false) {
        if (userAllowed && !userAllowed.includes(p.id)) {
          return;
        }
        items.push({
          id: p.id,
          label: p.label,
          subtitle: p.category || p.badge || 'Módulo',
          icon: ICON_MAP[p.iconName] || Route
        });
      }
    });
    return items;
  }, [availablePages, pageVisibility, currentUser]);

  const handleSelect = (id: string) => {
    onSelectTab(id);
    if (setIsOpen) setIsOpen(false);
  };

  // Custom bespoke icon renderer matching the Menu Operacional reference design
  const renderMenuIcon = (id: string, FallbackIcon: React.ElementType, isActive: boolean) => {
    const iconColor = isActive ? 'text-white' : 'text-[#1F1F1F]';

    switch (id) {
      case 'menu':
        return (
          <svg viewBox="0 0 24 24" className={cn("w-5 h-5", iconColor)} fill="currentColor">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
          </svg>
        );
      case 'averbacao':
        return (
          <RotateCcw className={cn("w-5 h-5 stroke-[2.2]", iconColor)} />
        );
      case 'sm_creator':
        return (
          <CalendarDays className={cn("w-5 h-5 stroke-[2.2]", iconColor)} />
        );
      case 'controle':
        return (
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 24 24" className={cn("w-5 h-5", iconColor)} fill="currentColor">
              <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#DC2626] border-[1.5px] border-white shadow-2xs" />
          </div>
        );
      case 'escala':
        return (
          <div className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center",
            isActive ? "bg-white/15 text-white" : "bg-[#1F1F1F] text-white"
          )}>
            <ListFilter className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'rotas':
        return (
          <Route className={cn("w-5 h-5 stroke-[2.3]", iconColor)} />
        );
      case 'disponibilidade':
        return (
          <Truck className={cn("w-5 h-5 stroke-[2.2]", iconColor)} fill={isActive ? "none" : "currentColor"} />
        );
      default:
        return <FallbackIcon className={cn("w-5 h-5 stroke-[2.2]", iconColor)} />;
    }
  };

  const renderNavItemButton = (
    item: { id: string; label: string; icon: React.ElementType },
    isActive: boolean,
    onClick: () => void
  ) => (
    <div key={item.id} className="relative flex items-center group">
      {/* Left Gold Pill Bar when Active */}
      {isActive && (
        <div className=" -left-1.5 w-1.5 h-10 rounded-l-full bg-gradient-to-b from-[#DF9F28] via-[#F2C347] to-[#C8881A] shrink-0 mr-1 shadow-xs" />
      )}

      <button
        type="button"
        onClick={onClick}
        title={item.label}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-[18px] transition-all duration-200 cursor-pointer select-none relative overflow-hidden",
          isActive
            ? "bg-gradient-to-r from-[#FFF7DF] via-[#FBE295] to-[#F2C144] text-[#141414] border-[1.5px] border-[#E5AE29] shadow-[0_6px_16px_rgba(229,174,41,0.28)]"
            : "bg-white/95 hover:bg-white text-[#1E1E1E] border border-[#EAE8E1] hover:border-[#DFD4BC] shadow-[0_3px_10px_rgba(0,0,0,0.03)]"
        )}
      >
        {/* Subtle Diagonal Gloss Sheen on Active Button */}
        {isActive && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(115deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 48%, rgba(230,170,35,0.18) 100%)'
            }}
          />
        )}

        <div className="flex items-center gap-3.5 min-w-0 relative z-10">
          {/* Icon Box */}
          <div
            className={cn(
              "w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
              isActive
                ? "bg-gradient-to-b from-[#2A2A2A] to-[#0E0E0E] text-white shadow-[0_3px_8px_rgba(0,0,0,0.35)] border border-[#D4AF37]/40"
                : "bg-[#F4F3F0] text-[#1F1F1F] border border-[#E8E6E1]/80 shadow-2xs"
            )}
          >
            {renderMenuIcon(item.id, item.icon, isActive)}
          </div>

          {/* Label */}
          <span
            className={cn(
              "text-[14.5px] truncate tracking-tight text-left",
              isActive ? "font-extrabold text-[#111111]" : "font-bold text-[#1E1E1E]"
            )}
          >
            {item.label}
          </span>
        </div>

        {/* Right Chevron */}
        <div className="flex items-center shrink-0 ml-2 relative z-10">
          <ChevronRight
            size={16}
            className={cn(
              "transition-transform group-hover:translate-x-0.5",
              isActive ? "text-[#141414] stroke-[2.5]" : "text-[#3A3A3A] stroke-[2]"
            )}
          />
        </div>
      </button>
    </div>
  );

  const isSettingsActive = activeTab === 'settings' || activeTab === 'cadastro';
  const settingsLabel = (currentUser?.role === 'admin' || currentUser?.name?.toLowerCase() === 'jefferson')
    ? 'Configurações & Páginas'
    : 'Meus Dados de Acesso';

  return (
    <>
      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER (MENU OPERACIONAL CENTRAL GR)                          */}
      {/* ========================================================================= */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsOpen && setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside 
        style={{ zoom: 0.92 }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 w-[335px] max-w-[90vw] bg-gradient-to-b from-[#FAF9F6] via-[#F7F6F2] to-[#F3F2EE] rounded-r-[28px] border-r border-[#E6D6B2] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col font-sans transition-transform duration-250 ease-out overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {/* Top-Right Subtle Gold Ribbon Accent */}
        <div className="absolute top-0 right-0 w-36 h-6 pointer-events-none z-0 overflow-hidden">
          <svg viewBox="0 0 160 28" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="topGoldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F5D77F" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#D49B27" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FFF0B8" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path d="M20,0 C60,16 110,16 160,0 L160,0 L20,0 Z" fill="url(#topGoldAccent)" />
          </svg>
        </div>

        {/* HEADER: Gold Route Icon + Divider + CENTRAL GR + Close Button */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            {/* 3D Metallic Gold App Badge */}
            <div className="w-13 h-13 rounded-[16px] bg-gradient-to-br from-[#F7DE88] via-[#D89E28] to-[#9E690E] p-[1.5px] shadow-[0_6px_14px_rgba(196,138,32,0.35)] shrink-0">
              <div className="w-full h-full rounded-[14.5px] bg-gradient-to-br from-[#F5D061] via-[#D49722] to-[#A87010] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.45),transparent_55%)] pointer-events-none" />
                {/* Route Network Nodes SVG */}
                <svg viewBox="0 0 32 32" className="w-8 h-8 text-white drop-shadow-xs" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="21" cy="7" r="3" />
                  <circle cx="9" cy="23" r="3" />
                  <circle cx="23" cy="21" r="2.5" />
                  <circle cx="9" cy="11" r="2.2" />
                  <path d="M18.5 8.5L13 13c-2 1.8-2 4.2 0 5.5l7.5 1.8" />
                  <path d="M11 11.5l5 2.5" />
                  <path d="M11.5 21.5l3.5-3.5" />
                </svg>
              </div>
            </div>

            {/* Vertical Dark Divider Line */}
            <div className="w-[1.5px] h-9 bg-[#3A3A3A]/75 rounded-full shrink-0" />

            {/* CENTRAL GR / MENU OPERACIONAL */}
            <div className="flex flex-col text-left leading-none">
              <div className="flex items-center gap-1.5 text-[19px] font-black tracking-tight">
                <span className="text-[#121212]">CENTRAL</span>
                <span className="text-[#C89128]">GR</span>
              </div>
              <span className="text-[10.5px] font-extrabold text-[#6E6E6E] tracking-wide uppercase mt-1">
                MENU OPERACIONAL
              </span>
            </div>
          </div>

          {/* Circular Close Button */}
          <button 
            type="button" 
            onClick={() => setIsOpen && setIsOpen(false)} 
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF6EC] border border-[#E6D2A3] text-[#1A1A1A] flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-105 transition-all shrink-0"
            title="Fechar Menu"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* SECTION DIVIDER: NAVEGAÇÃO PRINCIPAL */}
        <div className="px-5 pt-2 pb-2 flex items-center gap-2 shrink-0 relative z-10">
          <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-[#E5B84B] to-[#B8821E] shrink-0" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#666666] shrink-0">
            NAVEGAÇÃO PRINCIPAL
          </span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-[#DFC17B] to-[#E8D5A7]/40 ml-1" />
        </div>

        {/* NAVIGATION ITEMS LIST */}
        <div className="flex-1 overflow-y-auto px-4 py-1.5 space-y-2.5 scrollbar-thin scrollbar-thumb-amber-200 relative z-10">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return renderNavItemButton(item, isActive, () => handleSelect(item.id));
          })}

          {/* CONFIGURAÇÕES & PÁGINAS CARD AT THE BOTTOM OF THE LIST */}
          {onOpenSettings && (
            <div className="pt-1 pb-2">
              {renderNavItemButton(
                {
                  id: 'settings',
                  label: settingsLabel,
                  icon: Settings
                },
                isSettingsActive,
                () => {
                  onOpenSettings();
                  if (setIsOpen) setIsOpen(false);
                }
              )}
            </div>
          )}
        </div>

        {/* BOTTOM LUXURY GOLD & RED WAVE RIBBON ACCENT */}
        <div className="w-full h-8 relative shrink-0 pointer-events-none z-10 overflow-hidden mt-auto">
          <svg viewBox="0 0 400 42" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bottomGoldWave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F5DE93" />
                <stop offset="35%" stopColor="#C98F22" />
                <stop offset="70%" stopColor="#EBC359" />
                <stop offset="100%" stopColor="#B37912" />
              </linearGradient>
              <linearGradient id="bottomRedWave" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B80C18" />
                <stop offset="50%" stopColor="#E31826" />
                <stop offset="100%" stopColor="#8F0711" />
              </linearGradient>
            </defs>
            {/* Gold Wave Layer */}
            <path
              d="M0,12 Q120,22 230,36 L400,6 L400,42 L0,42 Z"
              fill="url(#bottomGoldWave)"
            />
            {/* Thin White Highlight Stroke */}
            <path
              d="M0,18 Q130,28 245,42"
              stroke="#FFF6D6"
              strokeWidth="1.2"
              fill="none"
              opacity="0.8"
            />
            {/* Red Corner Wave Layer */}
            <path
              d="M235,42 Q325,28 400,4 L400,42 Z"
              fill="url(#bottomRedWave)"
            />
          </svg>
        </div>
      </aside>
    </>
  );
}
