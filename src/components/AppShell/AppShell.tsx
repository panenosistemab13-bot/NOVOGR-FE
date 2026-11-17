import React, { ReactNode, useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import PremiumHeader from './PremiumHeader';
import NavigationDrawer from '../Layout/NavigationDrawer';
import OperationalFooter from './OperationalFooter';

import { PageDefinition } from '../../data/pagesConfig';

interface AppShellProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
  onOpenWallpaper?: () => void;
  isWallpaperOpen?: boolean;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  currentUser?: { email: string; name: string; role: string; roleLabel?: string; allowedPages?: string[] } | null;
  children: ReactNode;
}

export default function AppShell({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onLogout,
  onOpenWallpaper,
  isWallpaperOpen,
  pageVisibility,
  availablePages,
  currentUser,
  children
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isDark = false;

  const isAdminUser =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'Administrador' ||
    currentUser?.name?.toLowerCase() === 'jefferson' ||
    currentUser?.email?.trim().toLowerCase() === 'panenosistemab13@gmail.com' ||
    currentUser?.email?.trim().toLowerCase() === 'jefferson@3coracoes.com.br';

  const handleToggleDrawer = () => {
    setDrawerOpen(prev => !prev);
  };

  return (
    <DashboardLayout
      isDark={isDark}
      header={
        <PremiumHeader 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenWallpaper={onOpenWallpaper}
          onOpenSettings={isAdminUser ? onOpenSettings : undefined}
          onLogout={onLogout}
          onToggleDrawer={handleToggleDrawer}
          isWallpaperOpen={isWallpaperOpen}
          isAdmin={isAdminUser}
          currentUser={currentUser}
        />
      }
      drawer={
        <NavigationDrawer
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenSettings={isAdminUser ? onOpenSettings : undefined}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isOpen={drawerOpen}
          setIsOpen={setDrawerOpen}
          pageVisibility={pageVisibility}
          availablePages={availablePages}
          currentUser={currentUser}
        />
      }
      footer={activeTab === 'menu' ? null : <OperationalFooter isDark={isDark} />}
    >
      {children}
    </DashboardLayout>
  );
}
