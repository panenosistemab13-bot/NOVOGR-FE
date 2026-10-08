import React, { ReactNode } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import PremiumHeader from './PremiumHeader';
import NavigationDrawer from '../Layout/NavigationDrawer';
import OperationalFooter from './OperationalFooter';

interface AppShellProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettings?: () => void;
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
  onOpenWallpaper,
  isWallpaperOpen,
  children
}: AppShellProps) {
  return (
    <DashboardLayout
      header={
        <PremiumHeader 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenWallpaper={onOpenWallpaper}
          isWallpaperOpen={isWallpaperOpen}
          onOpenSettings={onOpenSettings}
        />
      }
      drawer={
        <NavigationDrawer
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onOpenSettings={onOpenSettings}
        />
      }
      footer={<OperationalFooter />}
    >
      {children}
    </DashboardLayout>
  );
}
