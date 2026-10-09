import React from 'react';

interface DashboardLayoutProps {
  header?: React.ReactNode;
  drawer?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function DashboardLayout({
  header,
  drawer,
  children,
  footer,
}: DashboardLayoutProps) {
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#07080c] text-white select-none">
      {/* 1. TOPBAR HORIZONTAL */}
      {header && (
        <header className="w-full shrink-0 z-30">
          {header}
        </header>
      )}

      {/* 2 & 3. WORKSPACE: CONTINUOUS VERTICAL MENU ON LEFT + ADJACENT MAIN CONTENT */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative">
        {drawer}

        <main className="flex-1 h-full overflow-y-auto w-full relative z-10 min-w-0">
          {children}
        </main>
      </div>

      {footer || null}
    </div>
  );
}
