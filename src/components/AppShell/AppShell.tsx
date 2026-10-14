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
  children
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDark = activeTab === 'menu';

  return (
    <DashboardLayout
      isDark={isDark}
      header={
        <PremiumHeader 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenWallpaper={onOpenWallpaper}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          onToggleDrawer={() => setDrawerOpen(prev => !prev)}
          isWallpaperOpen={isWallpaperOpen}
          isAdmin={true}
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
        />
      }
      footer={<OperationalFooter isDark={isDark} />}
    >
      {children}
    </DashboardLayout>
  );
}
