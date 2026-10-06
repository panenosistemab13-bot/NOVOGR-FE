import React from 'react';

interface DashboardLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function DashboardLayout({
  sidebar,
  header,
  children,
  footer,
}: DashboardLayoutProps) {
  return (
    <div className="w-screen h-screen flex flex-row overflow-hidden bg-[#07080c] text-white">
      {/* LEFT SIDEBAR NAVIGATION */}
      {sidebar && (
        <div className="h-full shrink-0 z-30">
          {sidebar}
        </div>
      )}

      {/* MAIN WORKSPACE BODY */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">
        {header && (
          <header className="w-full flex-shrink-0 z-20">
            {header}
          </header>
        )}

        <main className="flex-1 w-full h-full overflow-y-auto min-h-0 relative z-10">
          {children}
        </main>

        {footer || null}
      </div>
    </div>
  );
}
