/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppShell from './components/AppShell/AppShell';
import MainDashboard from './components/Dashboard/MainDashboard';
import {
  Users2,
  ShieldAlert,
  Activity,
  FileCheck2,
  CalendarDays,
  Route,
  BellRing,
  Container,
  LayoutGrid,
  Menu,
  X,
  ChevronRight,
  AlertOctagon,
  Clock,
  ClipboardCheck,
  Package,
  User,
  Briefcase,
  Calendar,
  Sliders,
  Lock,
  Unlock,
  Settings,
  Truck
} from 'lucide-react';
import { cn } from './lib/utils';
import { rtdb as db } from './firebase';
import { ref, onValue } from 'firebase/database';

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}
import PresenceList from './components/PresenceList';
import Dashboard from './components/Dashboard';
import Averbacao from './components/Averbacao';
import SMCreator from './components/SMCreator';
import Rotas from './components/Rotas';
import Checklist from './components/Checklist';
import Controle from './components/Controle';
import Escala from './components/Escala';
import Disponibilidade from './components/Disponibilidade';
import LoginScreen from './components/LoginScreen';
import RestrictedPagesModal from './components/RestrictedPagesModal';
import UpdateTopBanner from './components/UpdateTopBanner';
import { 
  PageDefinition, 
  getAllAvailablePages, 
  loadPageVisibility, 
  savePageVisibility, 
  saveStoredCustomPages, 
  saveStoredPageOrder,
  getStoredCustomPages,
  getStoredPageOrder,
  saveFullPageConfigToFirebase,
  ICON_MAP 
} from './data/pagesConfig';
import { useCurrentPrinciple, PRINCIPLES_OF_LEADERSHIP } from './utils/principles';
import { toAbsoluteUrl } from './utils/url';
import hudBg from './assets/images/wallpaper_hud_command_center_1790202488063.jpg';
import patioBg from './assets/images/wallpaper_patio_logistics_1790202500274.jpg';
import satelliteBg from './assets/images/wallpaper_tactical_satellite_1790202511817.jpg';
import { Globe, Database, FileSpreadsheet } from 'lucide-react';
import factoryMenuBg from './assets/images/factory_wallpaper_menu_1791328632981.jpg';
import factoryChecklistBg from './assets/images/factory_wallpaper_checklist_1791328643367.jpg';
import factoryAverbacaoBg from './assets/images/factory_wallpaper_averbacao_1791328653522.jpg';
import factorySmBg from './assets/images/factory_wallpaper_sm_1791328663393.jpg';
import factoryControleBg from './assets/images/factory_wallpaper_controle_1791328673670.jpg';
import factoryEscalaBg from './assets/images/factory_wallpaper_escala_1791328684394.jpg';
import factoryDisponibilidadeBg from './assets/images/factory_wallpaper_disponibilidade_1791328698210.jpg';
import factoryPresenceBg from './assets/images/factory_wallpaper_presence_1791328708994.jpg';
import factoryRotasBg from './assets/images/factory_wallpaper_rotas_1791328719413.jpg';
import Wallpaper360Viewer from './components/common/Wallpaper360Viewer';

export type Tab = 'menu' | 'presence' | 'risk' | 'averbacao' | 'sm_creator' | 'rotas' | 'checklist' | 'controle' | 'escala' | 'disponibilidade';

const backgroundImages: Record<Tab, string> = {
  menu: factoryMenuBg,
  presence: factoryPresenceBg,
  risk: factorySmBg,
  averbacao: factoryAverbacaoBg,
  sm_creator: factorySmBg,
  rotas: factoryRotasBg,
  checklist: factoryChecklistBg,
  controle: factoryControleBg,
  escala: factoryEscalaBg,
  disponibilidade: factoryDisponibilidadeBg
};

const allTabs = [
  { id: 'menu', label: 'Início', icon: LayoutGrid },
  { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
  { id: 'averbacao', label: 'Averbação', icon: FileCheck2 },
  { id: 'sm_creator', label: 'SM', icon: CalendarDays },
  { id: 'controle', label: 'Controle', icon: Sliders },
  { id: 'escala', label: 'Escala', icon: FileSpreadsheet },
  { id: 'disponibilidade', label: 'Disponibilidade', icon: Truck },
  { id: 'presence', label: 'Lista de Presença', icon: Users2 },
  { id: 'rotas', label: 'Rotas', icon: Route },
];

export default function App() {
  const principle = useCurrentPrinciple();
  const [currentUser] = useState<{ email: string; name: string; role: string }>({
    email: 'admin@3coracoes.com.br',
    name: 'Administrador 3C',
    role: 'admin'
  });

  const [availablePages, setAvailablePages] = useState<PageDefinition[]>(() => getAllAvailablePages());
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>(() => loadPageVisibility());

  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showRestrictedPagesModal, setShowRestrictedPagesModal] = useState<boolean>(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState<boolean>(false);

  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);

  // Dynamic visible tabs calculation
  const visibleTabs = [
    { id: 'menu', label: 'Início', icon: LayoutGrid },
    ...availablePages
      .filter(p => Boolean(pageVisibility[p.id]))
      .map(p => {
        const found = allTabs.find(t => t.id === p.id);
        const IconComponent = ICON_MAP[p.iconName] || found?.icon || Sliders;
        return {
          id: p.id,
          label: p.label,
          icon: IconComponent
        };
      })
  ];

  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(0);
  const [averbacaoView, setAverbacaoView] = useState<'generator' | 'codes'>('generator');
  const [smCreatorView, setSmCreatorView] = useState<'generator' | 'codes'>('generator');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  useEffect(() => {
    const appsRef = ref(db, 'presence_list/appointments');
    const unsubscribe = onValue(appsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAppointments(data);
      } else {
        setAppointments({});
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Restricted Pages Configuration across ALL devices
  useEffect(() => {
    const pagesConfigRef = ref(db, 'pages_config');
    const unsubscribe = onValue(pagesConfigRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const { visibility, customPages, pageOrder } = data;

        if (customPages && Array.isArray(customPages)) {
          saveStoredCustomPages(customPages);
        }
        if (pageOrder && Array.isArray(pageOrder)) {
          saveStoredPageOrder(pageOrder);
        }
        if (visibility && typeof visibility === 'object') {
          savePageVisibility(visibility);
          setPageVisibility(visibility);
        }

        setAvailablePages(getAllAvailablePages());
      } else {
        // Initial setup if empty in Firebase RTDB
        const curVis = loadPageVisibility();
        const curCustom = getStoredCustomPages();
        const curOrder = getStoredPageOrder();
        saveFullPageConfigToFirebase(curVis, curCustom, curOrder);
      }
    });

    return () => unsubscribe();
  }, []);

  const getTodayStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getMinutesFromMidnight = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts (Ctrl + Number / Cmd + Number) mapped dynamically to the numerical order in "Sugestão de Páginas Restritas"
      if (e.ctrlKey || e.metaKey) {
        let pressedNumber: number | null = null;
        if (e.key >= '1' && e.key <= '9') {
          pressedNumber = parseInt(e.key, 10);
        } else if (e.code && /^Digit[1-9]$/.test(e.code)) {
          pressedNumber = parseInt(e.code.replace('Digit', ''), 10);
        } else if (e.code && /^Numpad[1-9]$/.test(e.code)) {
          pressedNumber = parseInt(e.code.replace('Numpad', ''), 10);
        }

        if (pressedNumber !== null) {
          const targetIndex = pressedNumber - 1; // 1-indexed to 0-indexed position
          if (targetIndex >= 0 && targetIndex < availablePages.length) {
            e.preventDefault();
            const targetPage = availablePages[targetIndex];
            setActiveTab(targetPage.id as Tab);
            return;
          }
        } else if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0') {
          e.preventDefault();
          if (availablePages.length >= 10) {
            setActiveTab(availablePages[9].id as Tab);
          } else {
            setActiveTab('menu');
          }
          return;
        }
      }

      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                             document.activeElement?.tagName === 'TEXTAREA' || 
                             document.activeElement?.getAttribute('contenteditable') === 'true';

      if (isInputFocused) return;

      // Global Backspace to Return to Menu
      if (e.key === 'Backspace' && activeTab !== 'menu') {
        e.preventDefault();
        setActiveTab('menu');
        return;
      }

      // Arrow Up/Down for smooth main page scrolling
      if (e.key === 'ArrowDown') {
        const scrollContainer = document.getElementById('main-scroll-container') || 
                                document.getElementById('main-scroll-container-menu') ||
                                document.querySelector('.overflow-y-auto');
        if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
          e.preventDefault();
          scrollContainer.scrollBy({ top: 180, behavior: 'smooth' });
        } else {
          window.scrollBy({ top: 180, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp') {
        const scrollContainer = document.getElementById('main-scroll-container') || 
                                document.getElementById('main-scroll-container-menu') ||
                                document.querySelector('.overflow-y-auto');
        if (scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight) {
          e.preventDefault();
          scrollContainer.scrollBy({ top: -180, behavior: 'smooth' });
        } else {
          window.scrollBy({ top: -180, behavior: 'smooth' });
        }
      }

      // Arrow Left/Right to transition to different page categories when not on the main menu carousel
      if (activeTab !== 'menu') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const currentIdx = visibleTabs.findIndex(t => t.id === activeTab);
          if (currentIdx !== -1) {
            const prevIdx = (currentIdx - 1 + visibleTabs.length) % visibleTabs.length;
            setActiveTab(visibleTabs[prevIdx].id as Tab);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const currentIdx = visibleTabs.findIndex(t => t.id === activeTab);
          if (currentIdx !== -1) {
            const nextIdx = (currentIdx + 1) % visibleTabs.length;
            setActiveTab(visibleTabs[nextIdx].id as Tab);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, pageVisibility, visibleTabs, availablePages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return `${day} de ${month}. de ${year} • ${time}`;
  };

  const activeTabInfo = visibleTabs.find(t => t.id === activeTab);

  const handleOpenPageSelector = () => {
    setShowPasswordModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'menu':
        return <MainDashboard onNavigate={(id) => setActiveTab(id as Tab)} />;
      case 'presence':
        return <PresenceList onBack={() => setActiveTab('menu')} />;
      case 'averbacao':
        return <Averbacao view={averbacaoView} onBack={() => setActiveTab('menu')} />;
      case 'sm_creator':
        return <SMCreator view={smCreatorView} onBack={() => setActiveTab('menu')} />;
      case 'rotas':
        return <Rotas onBack={() => setActiveTab('menu')} />;
      case 'checklist':
        return <Checklist />;
      case 'controle':
        return <Controle onBack={() => setActiveTab('menu')} />;
      case 'escala':
        return <Escala onBack={() => setActiveTab('menu')} />;
      case 'disponibilidade':
        return <Disponibilidade onBack={() => setActiveTab('menu')} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-20 text-zinc-500">
            <AlertOctagon className="w-12 h-12 mb-4 opacity-50" />
            <h2 className="text-xl font-medium tracking-tight text-zinc-300">Em Desenvolvimento</h2>
            <p className="text-sm">Este módulo está sendo refatorado para o novo padrão de design.</p>
          </div>
        );
    }
  };

  const todayStr = getTodayStr(currentDateTime);
  const currentMinutes = currentDateTime.getHours() * 60 + currentDateTime.getMinutes();

  const todayAppointments = (Object.values(appointments || {}) as Appointment[])
    .filter(app => app && app.date === todayStr)
    .map(app => {
      const appMinutes = getMinutesFromMidnight(app.time);
      const diff = appMinutes - currentMinutes;
      
      let urgency: 'critical' | 'warning' | 'info' | 'past' = 'info';
      let urgencyScore = 1;

      if (diff < -15) {
        urgency = 'past';
        urgencyScore = 0;
      } else if (diff >= -15 && diff <= 0) {
        urgency = 'critical';
        urgencyScore = 3;
      } else if (diff > 0 && diff <= 30) {
        urgency = 'critical';
        urgencyScore = 3;
      } else if (diff > 30 && diff <= 120) {
        urgency = 'warning';
        urgencyScore = 2;
      } else {
        urgency = 'info';
        urgencyScore = 1;
      }

      return {
        ...app,
        diff,
        urgency,
        urgencyScore
      };
    })
    .sort((a, b) => {
      if (a.urgencyScore !== b.urgencyScore) {
        return b.urgencyScore - a.urgencyScore;
      }
      return a.time.localeCompare(b.time);
    });

  const activeTodayApps = todayAppointments.filter(app => app.urgency !== 'past');
  const maxUrgencyApp = activeTodayApps[0];
  const maxUrgencyScore = maxUrgencyApp ? maxUrgencyApp.urgencyScore : 0;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passwordInput.trim().toLowerCase();
    if (clean === '#trescafe2027' || clean === '#trescafe' || clean === 'trescafe' || clean === 'admin') {
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
      setShowRestrictedPagesModal(true);
    } else {
      setPasswordError(true);
    }
  };

  const renderActiveModuleContent = () => {
    switch (activeTab) {
      case 'checklist':
        return <Checklist />;
      case 'averbacao':
        return <Averbacao view={averbacaoView} onBack={() => setActiveTab('menu')} />;
      case 'sm_creator':
        return <SMCreator view={smCreatorView} onBack={() => setActiveTab('menu')} />;
      case 'controle':
        return <Controle onBack={() => setActiveTab('menu')} />;
      case 'escala':
        return <Escala onBack={() => setActiveTab('menu')} />;
      case 'disponibilidade':
        return <Disponibilidade onBack={() => setActiveTab('menu')} />;
      case 'presence':
        return <PresenceList onBack={() => setActiveTab('menu')} />;
      case 'rotas':
        return <Rotas onBack={() => setActiveTab('menu')} />;
      default:
        return null;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={(id) => setActiveTab(id as Tab)}
      onOpenSettings={handleOpenPageSelector}
      showPresenceList={Boolean(pageVisibility['presence'])}
      showRotasPage={Boolean(pageVisibility['rotas'])}
      onOpenWallpaper={() => setShowWallpaperModal(prev => !prev)}
      isWallpaperOpen={showWallpaperModal}
    >
      <div 
        className="w-full h-full overflow-y-auto relative"
        style={{
          backgroundImage: `linear-gradient(rgba(8, 10, 12, 0.82), rgba(8, 10, 12, 0.88)), url(${backgroundImages[activeTab] || backgroundImages.menu})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {activeTab === 'menu' ? (
          <MainDashboard onNavigate={(id) => setActiveTab(id as Tab)} />
        ) : (
          <div className="internal-pages-wrapper w-full min-h-full">
            {renderActiveModuleContent()}
          </div>
        )}
      </div>

      {/* Full screen 360° 4K immersive wallpaper view occupying entire screen */}
      {showWallpaperModal && (
        <Wallpaper360Viewer
          imageUrl={backgroundImages[activeTab] || backgroundImages.menu}
          onClose={() => setShowWallpaperModal(false)}
        />
      )}

      {/* Global Password Modal Overlay - 3D Cyber Security Clearance Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-[#080a0c]/90 backdrop-blur-xl z-[999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#131619] rounded-3xl p-6 sm:p-8 relative border border-[rgba(201,151,62,0.3)] text-white shadow-[0_32px_64px_rgba(0,0,0,0.85)]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] flex items-center justify-center mb-4 border border-[#fff5db]/40 text-[#080a0c] shadow-[0_0_25px_rgba(201,151,62,0.35)]">
                <Lock size={26} className="stroke-[2.5]" />
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tight text-white font-sans mb-1">
                Acesso de Segurança Restrito
              </h3>

              <p className="text-xs text-[#a8a39a] max-w-xs mb-6 leading-relaxed font-sans">
                Insira a chave mestra de administrador para gerenciar as páginas e visibilidade operacional.
              </p>

              <form onSubmit={handlePasswordSubmit} className="w-full">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="••••••••••••"
                  className={cn(
                    "w-full bg-[#171a1c] text-white placeholder-stone-500 border rounded-xl px-4 py-3 text-center font-mono tracking-widest text-lg focus:outline-none transition-all shadow-inner",
                    passwordError 
                      ? "border-red-500 text-red-500 focus:ring-2 focus:ring-red-500" 
                      : "border-[rgba(201,151,62,0.25)] focus:border-[#e5c27a] focus:ring-1 focus:ring-[#e5c27a]"
                  )}
                  autoFocus
                />
                
                {passwordError && (
                  <p className="text-red-400 text-xs font-mono font-bold mt-2 animate-pulse">
                    ⚠️ Chave Incorreta! Tente novamente.
                  </p>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordInput('');
                      setPasswordError(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#171a1c] hover:bg-[#232628] text-[#d8d3c8] font-bold uppercase text-xs tracking-wider transition-colors border border-[rgba(201,151,62,0.2)] cursor-pointer font-sans"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e5c27a] via-[#c9973e] to-[#b77a25] hover:brightness-110 text-[#080a0c] font-black uppercase text-xs tracking-wider shadow-lg transition-all cursor-pointer font-sans"
                  >
                    Autorizar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Global Restricted Pages Suggestion & Configuration Modal */}
      <RestrictedPagesModal
        isOpen={showRestrictedPagesModal}
        onClose={() => setShowRestrictedPagesModal(false)}
        currentVisibility={pageVisibility}
        onSave={(newVisibility, updatedPages) => {
          setPageVisibility(newVisibility);
          setAvailablePages(updatedPages);
        }}
      />
    </AppShell>
  );
}