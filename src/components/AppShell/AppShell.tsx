import React, { ReactNode } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import OrbitalSidebar from './OrbitalSidebar';

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
      sidebar={
        <OrbitalSidebar 
          activeTab={activeTab}
          onSelectTab={onSelectTab}
        />
      }
      footer={null}
    >
      {children}
    </DashboardLayout>
  );
}
