import React, { ReactNode } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import PremiumHeader from './PremiumHeader';

interface AppShellProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettings?: () => void;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
  children: ReactNode;
}

export default function AppShell({
  activeTab,
  onSelectTab,
  onOpenSettings,
  children
}: AppShellProps) {
  return (
    <DashboardLayout
      header={
        <PremiumHeader 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onNavigateHome={() => onSelectTab('menu')}
          onOpenSettings={onOpenSettings}
        />
      }
      sidebar={null}
      rightPanel={undefined}
      footer={null}
    >
      {children}
    </DashboardLayout>
  );
}
