import React from 'react';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  header?: React.ReactNode;
  drawer?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isDark?: boolean;
}

export default function DashboardLayout({
  header,
  drawer,
  children,
  footer,
  isDark = true,
}: DashboardLayoutProps) {
  return (
    <div className={cn(
      "w-screen h-screen flex flex-col overflow-hidden select-none font-sans",
      isDark ? "bg-[#07080c] text-white" : "bg-[#F6F2E9] text-[#25231F]"
    )}>
      {/* 1. TOPBAR HORIZONTAL */}
      {header && (
        <header className="w-full shrink-0 z-30">
          {header}
        </header>
      )}

      {/* 2 & 3. WORKSPACE: CONTINUOUS VERTICAL MENU ON LEFT + ADJACENT MAIN CONTENT */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative">
        {drawer}

        <main className={cn(
          "flex-1 h-full overflow-y-auto w-full relative z-10 min-w-0",
          !isDark && "bg-[#F6F2E9] text-[#25231F]"
        )}>
          {children}
        </main>
      </div>

      {footer || null}
    </div>
  );
}
