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
  children
}: AppShellProps) {
  return (
    <DashboardLayout
      header={
        <PremiumHeader 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
        />
      }
      sidebar={null}
      footer={null}
    >
      {children}
    </DashboardLayout>
  );
}
