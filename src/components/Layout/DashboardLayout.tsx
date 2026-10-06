import React from 'react';
import OperationalFooter from '../AppShell/OperationalFooter';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function DashboardLayout({
  sidebar,
  header,
  children,
  rightPanel,
  footer,
}: DashboardLayoutProps) {
  return (
    <div className="app-shell">
      {/* =====================================================
          FUNDO GERAL (ELECTION THEME BACKGROUND)
      ====================================================== */}
      <div className="app-background" />

      {/* =====================================================
          HEADER HORIZONTAL SUPERIOR (ELECTION THEME)
      ====================================================== */}
      <header className="app-header">
        {header}
      </header>

      {/* =====================================================
          CORPO DA APLICAÇÃO (WIDE FULL DISPLAY, NO DESKTOP SIDEBAR)
      ====================================================== */}
      <div className="app-body">
        {/* ÁREA CENTRAL DE TRABALHO */}
        <main className="app-main">
          <div className="app-main-content">
            {children}
          </div>
        </main>
      </div>

      {/* =====================================================
          RODAPÉ HORIZONTAL (BROADCAST INFORMATION FOOTER)
      ====================================================== */}
      {footer || <OperationalFooter />}
    </div>
  );
}
