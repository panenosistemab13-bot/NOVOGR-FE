import React, { ReactNode, useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import PremiumHeader from './PremiumHeader';
import NavigationDrawer from '../Layout/NavigationDrawer';
import OperationalFooter from './OperationalFooter';

interface AppShellProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
  onOpenWallpaper?: () => void;
  isWallpaperOpen?: boolean;
  children: ReactNode;
}

export default function AppShell({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onLogout,
  onOpenWallpaper,
  isWallpaperOpen,
  children
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <DashboardLayout
      header={
        <PremiumHeader 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenWallpaper={onOpenWallpaper}
          isWallpaperOpen={isWallpaperOpen}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          onToggleDrawer={() => setDrawerOpen(prev => !prev)}
        />
      }
      drawer={
        <NavigationDrawer
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenSettings={onOpenSettings}
          isOpen={drawerOpen}
          setIsOpen={setDrawerOpen}
        />
      }
      footer={<OperationalFooter />}
    >
      {children}
    </DashboardLayout>
  );
}
