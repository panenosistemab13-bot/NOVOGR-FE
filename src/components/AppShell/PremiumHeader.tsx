import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Menu, 
  Settings,
  Sun
} from 'lucide-react';
import goldMedalLogo from '../../assets/images/gold_logo_medal_3c_1790406432555.jpg';

interface PremiumHeaderProps {
  activeTab: string;
  onSelectTab?: (tabId: string) => void;
  onNavigateHome?: () => void;
  onOpenSettings?: () => void;
  onOpenWallpaper?: () => void;
  onLogout?: () => void;
  isWallpaperOpen?: boolean;
  onToggleDrawer?: () => void;
  isAdmin?: boolean; 
  currentUser?: { email: string; name: string; role: string } | null;
}

export default function PremiumHeader({ 
  activeTab: _activeTab,
  onNavigateHome, 
  onOpenWallpaper: _onOpenWallpaper, 
  onOpenSettings, 
  onLogout, 
  isWallpaperOpen: _isWallpaperOpen, 
  onToggleDrawer, 
  isAdmin: _isAdmin = false,
  currentUser
}: PremiumHeaderProps) {
  const [_currentTime, setCurrentTime] = useState(new Date());
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [loggedUser, setLoggedUser] = useState(() => {
    try {
      const saved = localStorage.getItem('logged_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { name: 'JEFFERSON', role: 'admin' };
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('logged_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setLoggedUser(parsed);
        }
      }
    } catch {}

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full relative bg-white select-none font-sans z-30 shadow-xs">
      {/* Barra Principal Branca - 76px de Altura */}
      <div className="w-full h-[76px] px-4 md:px-6 flex items-center justify-between">
        
        {/* Esquerda: Botão Menu Hambúrguer + Medalhão 3C + CENTRAL GR LOGÍSTICA QUE APROXIMA */}
        <div className="flex items-center gap-3.5 shrink-0">
          <button 
            type="button"
            onClick={onToggleDrawer}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer shadow-2xs text-[#B98321]"
            title="Menu Operacional"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Logo Café Três Corações */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
            title="Central GR - 3 Corações"
          >
            <div className="w-11 h-11 rounded-full p-0.5 border-2 border-[#D4AF37] shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden bg-white">
              <img src={goldMedalLogo} alt="CENTRAL GR" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col text-left leading-none">
              <span className="text-[17px] font-black tracking-wider text-[#10243D] font-heading">
                CENTRAL GR
              </span>
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase mt-1 text-[#D99A19]">
                LOGÍSTICA QUE APROXIMA
              </span>
            </div>
          </div>
        </div>

        {/* Direita: Badge Perfil do Usuário JEFFERSON admin */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Badge Perfil de Usuário */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-900 transition-all cursor-pointer shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full border border-[#D4AF37] overflow-hidden flex items-center justify-center bg-amber-50 text-[#8C6D28]">
                <User className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[11px] font-black tracking-wide uppercase text-slate-900">
                  {currentUser?.name || loggedUser?.name || 'JEFFERSON'}
                </span>
                <span className="text-[8.5px] font-semibold text-slate-500">
                  {currentUser?.role || loggedUser?.role || 'admin'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserDropdown(false)} 
                />
                <div className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl py-2 z-50 text-xs border bg-white border-slate-200 text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100 text-slate-600">
                    <p className="font-bold uppercase text-slate-900">
                      {currentUser?.name || loggedUser?.name || 'JEFFERSON'}
                    </p>
                    <p className="text-[10px] font-bold text-[#8C6D28]">
                      {currentUser?.role === 'admin' ? 'Acesso Administrador Fixo' : 'Acesso Operacional'}
                    </p>
                  </div>
                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenSettings();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 font-semibold cursor-pointer hover:bg-slate-100 text-slate-700"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#E5C27A]" />
                      <span>{currentUser?.role === 'admin' ? 'Configurações & Páginas' : 'Meu Perfil / Senha'}</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 font-semibold cursor-pointer hover:bg-rose-50 text-rose-600"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sair do Sistema</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Borda Esculpida Dourada em Arco Luxuoso - Idêntica ao design da imagem anexada */}
      <div className="absolute -bottom-3 left-0 w-full pointer-events-none z-20 overflow-hidden leading-none">
        <svg viewBox="0 0 1535 14" fill="none" className="w-full h-3 md:h-3.5" preserveAspectRatio="none">
          <defs>
            <linearGradient id="headerGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A67C1E" />
              <stop offset="12%" stopColor="#D4AF37" />
              <stop offset="25%" stopColor="#F9E295" />
              <stop offset="38%" stopColor="#C59B27" />
              <stop offset="50%" stopColor="#E5C27A" />
              <stop offset="68%" stopColor="#C59B27" />
              <stop offset="85%" stopColor="#F9E295" />
              <stop offset="100%" stopColor="#A67C1E" />
            </linearGradient>
          </defs>
          {/* Extensão de fundo branco acompanhando a curvatura */}
          <path 
            d="M 0,0 L 0,11 L 360,11 Q 410,11 440,2 L 1095,2 Q 1125,11 1175,11 L 1535,11 L 1535,0 Z" 
            fill="#ffffff" 
          />
          {/* Friso metálico dourado com relevo */}
          <path 
            d="M 0,11 L 360,11 Q 410,11 440,2 L 1095,2 Q 1125,11 1175,11 L 1535,11" 
            stroke="url(#headerGoldGrad)" 
            strokeWidth="2.5" 
            fill="none" 
          />
        </svg>
      </div>
    </header>
  );
}
