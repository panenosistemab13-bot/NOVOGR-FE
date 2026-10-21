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
  currentUser?: { email: string; name: string; role: string } | null;
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
  const isDark = false;

  return (
    <DashboardLayout
      isDark={false}
      header={
        <PremiumHeader 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenWallpaper={onOpenWallpaper}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          onToggleDrawer={() => setDrawerOpen(prev => !prev)}
          isWallpaperOpen={isWallpaperOpen}
          isAdmin={currentUser?.role === 'admin'}
          currentUser={currentUser}
        />
      }
      drawer={
        <NavigationDrawer
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenSettings={onOpenSettings}
          isOpen={drawerOpen}
          setIsOpen={setDrawerOpen}
          pageVisibility={pageVisibility}
          availablePages={availablePages}
          isDark={isDark}
          currentUser={currentUser}
        />
      }
      footer={<OperationalFooter isDark={isDark} />}
    >
      {children}
    </DashboardLayout>
  );
}
