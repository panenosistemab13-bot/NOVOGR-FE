import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

// =========================================================================
// DESIGN SYSTEM GLOBAL — CENTRAL GR / 3 CORAÇÕES
// Componentes reutilizáveis Dark Luxury & Dourado / Champagne
// =========================================================================

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  goldBorder?: boolean;
  onClick?: () => void;
}

export function PremiumCard({ children, className, goldBorder = false, onClick }: PremiumCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[#131619] rounded-2xl p-5 shadow-[0_16px_36px_rgba(0,0,0,0.65)] relative text-white transition-all duration-200",
        goldBorder 
          ? "border border-[#d9ad5a]/40 shadow-[0_0_20px_rgba(201,151,62,0.15)]" 
          : "border border-[rgba(201,151,62,0.18)] hover:border-[#d9ad5a]/30",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  variation?: string;
  isPositive?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconVariant?: 'gold' | 'red' | 'emerald';
  className?: string;
}

export function KPICard({
  title,
  value,
  variation,
  isPositive = true,
  icon: Icon,
  iconVariant = 'gold',
  className
}: KPICardProps) {
  return (
    <div className={cn(
      "bg-[#131619] border border-[rgba(201,151,62,0.18)] rounded-2xl p-4 flex items-center gap-3.5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.6)] relative overflow-hidden",
      className
    )}>
      {/* 3D Circular metallic badge for icon */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border shadow-md",
        iconVariant === 'gold' && "bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] text-[#080a0c] border-[#f4f0e8]/40 shadow-[0_0_15px_rgba(201,151,62,0.35)]",
        iconVariant === 'red' && "bg-gradient-to-br from-[#ef4444] to-[#991b1b] text-white border-red-300/40 shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        iconVariant === 'emerald' && "bg-gradient-to-br from-[#34d399] to-[#059669] text-white border-emerald-300/40 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
      )}>
        <Icon size={20} className="stroke-[2.5]" />
      </div>

      <div className="leading-tight flex flex-col justify-center min-w-0">
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#a8a39a] block truncate">
          {title}
        </span>
        <span className="text-[20px] font-black text-white block mt-0.5 tracking-tight font-mono">
          {value}
        </span>
        {variation && (
          <span className={cn(
            "text-[9px] font-bold block mt-0.5",
            isPositive ? "text-[#10b981]" : "text-[#ef4444]"
          )}>
            {variation}
          </span>
        )}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  actions?: ReactNode;
}

export function SectionHeader({ title, subtitle, icon: Icon, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(201,151,62,0.18)] gap-3 text-left">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e5c27a] to-[#b77a25] flex items-center justify-center text-[#080a0c] shadow-sm shrink-0">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h3 className="text-[14px] font-black text-white tracking-tight uppercase leading-none font-sans">
            {title}
          </h3>
          {subtitle && (
            <span className="text-[9.5px] font-bold text-[#a8a39a] uppercase tracking-wider block mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface PremiumButtonProps {
  children: ReactNode;
  variant?: 'gold' | 'dark' | 'outline';
  onClick?: () => void;
  className?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export function PremiumButton({
  children,
  variant = 'gold',
  onClick,
  className,
  icon: Icon
}: PremiumButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md",
        variant === 'gold' && "bg-gradient-to-r from-[#e5c27a] via-[#c9973e] to-[#b77a25] text-[#080a0c] hover:brightness-110 shadow-[0_4px_16px_rgba(201,151,62,0.35)]",
        variant === 'dark' && "bg-[#171a1c] text-[#f4f0e8] hover:bg-[#232628] border border-[rgba(201,151,62,0.22)]",
        variant === 'outline' && "bg-transparent text-[#e5c27a] border border-[#c9973e] hover:bg-[#c9973e]/10",
        className
      )}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'danger' | 'warning' | 'gold' | 'neutral';
  className?: string;
}

export function StatusBadge({ label, variant = 'gold', className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
      variant === 'gold' && "bg-[#c9973e]/15 text-[#e5c27a] border-[#c9973e]/30",
      variant === 'success' && "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",
      variant === 'danger' && "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30",
      variant === 'warning' && "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
      variant === 'neutral' && "bg-white/5 text-[#a8a39a] border-white/10",
      className
    )}>
      {label}
    </span>
  );
}

interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
}

export function DashboardContainer({ children, className }: DashboardContainerProps) {
  return (
    <div className={cn("w-full min-h-full flex flex-col gap-4 p-4 sm:p-6 text-white select-none font-sans", className)}>
      {children}
    </div>
  );
}
