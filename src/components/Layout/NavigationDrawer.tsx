import React, { useEffect, useMemo } from 'react';
import { 
  Home, 
  Settings, 
  ChevronRight, 
  Route
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageDefinition, getAllAvailablePages, loadPageVisibility, ICON_MAP } from '../../data/pagesConfig';

interface NavigationDrawerProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettings?: () => void;
  isCollapsed?: boolean;
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
  isCollapsed = false,
  isOpen = false,
  setIsOpen,
  pageVisibility,
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
    const pages = getAllAvailablePages();
    const vis = pageVisibility || loadPageVisibility();
    const isAgenteDeRisco = currentUser?.role === 'agente_de_risco' || currentUser?.role === 'funcionario';
    const userAllowed = isAgenteDeRisco ? (currentUser?.allowedPages || []) : null;

    const items: Array<{ id: string; label: string; subtitle: string; icon: React.ElementType }> = [
      { id: 'menu', label: 'Início', subtitle: 'Painel Central', icon: Home }
    ];
    pages.forEach(p => {
      if (p.id !== 'cadastro' && vis[p.id] !== false) {
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
  }, [pageVisibility, currentUser]);

  const handleSelect = (id: string) => {
    onSelectTab(id);
    if (setIsOpen) setIsOpen(false);
  };

  const renderNavList = (collapsed: boolean) => (
    <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 scrollbar-thin scrollbar-thumb-amber-200">
      {!collapsed && (
        <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-[#8C6D28]">
          NAVEGAÇÃO PRINCIPAL
        </div>
      )}

      {menuItems.map((item) => {
        const isActive = activeTab === item.id;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            title={item.label}
            className={cn(
              "w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer select-none border",
              collapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5",
              isActive
                ? "bg-gradient-to-r from-[#F8EFD9] via-[#FAF3E4] to-[#FFFDF9] text-[#7A5617] border-l-4 border-l-[#B88732] border-t-[#E8DDCA] border-r-[#E8DDCA] border-b-[#E8DDCA] shadow-xs font-black"
                : "bg-white hover:bg-[#FAF8F5] text-[#2D2A24] border-transparent hover:border-[#E8DDCA] font-medium"
            )}
          >
            <div className={cn("flex items-center gap-3 min-w-0", collapsed && "justify-center")}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform",
                isActive 
                  ? "bg-gradient-to-br from-[#D8B065] to-[#B88732] text-white shadow-xs" 
                  : "text-[#B88732] hover:scale-105"
              )}>
                <IconComponent size={18} className="stroke-[2.2]" />
              </div>

              {!collapsed && (
                <span className="text-xs truncate tracking-tight text-left">
                  {item.label}
                </span>
              )}
            </div>

            {!collapsed && isActive && (
              <ChevronRight size={16} className="text-[#B88732] shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP PERMANENT COLLAPSIBLE SIDEBAR                                  */}
      {/* ========================================================================= */}
      <aside 
        className={cn(
          "hidden md:flex flex-col h-full bg-white border-r border-[#E8DDCA] shadow-[4px_0_24px_rgba(184,135,50,0.03)] z-20 shrink-0 transition-all duration-300 ease-in-out font-sans",
          isCollapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {renderNavList(isCollapsed)}

        {/* Desktop Sidebar Footer */}
        <div className="p-2 border-t border-[#E8DDCA] bg-[#FAF8F5] shrink-0">
          {onOpenSettings ? (
            <button
              type="button"
              onClick={onOpenSettings}
              title={(currentUser?.role === 'admin' || currentUser?.name?.toLowerCase() === 'jefferson') ? 'Configurações & Páginas' : 'Meus Dados de Acesso'}
              className={cn(
                "w-full flex items-center rounded-xl bg-white hover:bg-[#FAF8F5] text-[#2D2A24] border border-[#E8DDCA] transition-colors cursor-pointer shadow-2xs",
                isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2 text-xs font-bold"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <Settings size={16} className="text-[#B88732] shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">
                    {(currentUser?.role === 'admin' || currentUser?.name?.toLowerCase() === 'jefferson') ? 'Configurações' : 'Meus Dados'}
                  </span>
                )}
              </div>
              {!isCollapsed && <ChevronRight size={14} className="text-[#8C7B63] shrink-0" />}
            </button>
          ) : (
            <div className={cn("text-[10px] font-bold text-[#8C6D28] text-center", isCollapsed && "hidden")}>
              CENTRAL GR © 2026
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE SLIDE-OVER DRAWER                                               */}
      {/* ========================================================================= */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsOpen && setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside 
        className={cn(
          "md:hidden fixed left-0 top-0 bottom-0 z-50 w-[270px] max-w-[85vw] bg-white border-r border-[#E8DDCA] shadow-2xl flex flex-col font-sans transition-transform duration-250 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <div className="p-4 border-b border-[#E8DDCA] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-sm font-black text-[#211E19]">CENTRAL GR</span>
            <span className="text-[9px] font-extrabold text-[#B88732] tracking-wider uppercase">Menu Operacional</span>
          </div>
          <button 
            type="button" 
            onClick={() => setIsOpen && setIsOpen(false)} 
            className="w-8 h-8 rounded-lg bg-white border border-[#E8DDCA] text-[#7A5617] flex items-center justify-center cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {renderNavList(false)}

        {onOpenSettings && (
          <div className="p-3 border-t border-[#E8DDCA] bg-[#FAF8F5]">
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                if (setIsOpen) setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#2D2A24] border border-[#E8DDCA] text-xs font-bold shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-[#B88732]" />
                <span>{(currentUser?.role === 'admin' || currentUser?.name?.toLowerCase() === 'jefferson') ? 'Configurações & Páginas' : 'Meus Dados de Acesso'}</span>
              </div>
              <ChevronRight size={14} className="text-[#8C7B63]" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
