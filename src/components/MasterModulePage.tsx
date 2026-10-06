import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  Eye,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Truck,
  FileCheck2,
  ClipboardCheck,
  CalendarDays,
  Sliders,
  Users2,
  Route,
  Container,
  Check,
  X,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

// Mercosul Plate Component
export function MercosulPlate({ plate, className }: { plate: string; className?: string }) {
  if (!plate || plate === '-' || plate.trim() === '') {
    return <span className="text-stone-500 font-mono font-bold text-[10px]">-</span>;
  }
  const clean = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[96px] h-[30px] shrink-0 rounded-[6px] shadow-sm border border-stone-300 bg-white transition-transform hover:scale-105 cursor-default",
        className
      )}
      title={`Placa Mercosul: ${clean}`}
    >
      <div className="w-full bg-[#002776] h-[8px] flex items-center justify-between px-1 leading-none relative">
        <span className="text-[4.5px] text-white font-sans font-bold tracking-tight">BR</span>
        <span className="text-[5.5px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          BRASIL
        </span>
        <div className="w-[6px] h-[4px] bg-[#009b3a] border border-white/30 flex items-center justify-center relative rounded-[1px] overflow-hidden shrink-0">
          <div className="w-[3px] h-[2px] bg-[#ffdf00] rotate-45 transform flex items-center justify-center">
            <div className="w-[1px] h-[1px] bg-[#002776] rounded-full" />
          </div>
        </div>
      </div>

      <div className="w-full flex-1 flex items-center justify-center bg-white px-1">
        <span
          className="text-stone-900 font-black text-[11.5px] tracking-wider leading-none"
          style={{
            fontFamily: "'Courier New', monospace, sans-serif",
            letterSpacing: '0.08em',
          }}
        >
          {clean}
        </span>
      </div>
    </div>
  );
}

export interface MasterRecord {
  id: string;
  itemImage?: string;
  itemTitle: string;
  itemSubtitle?: string;
  plate?: string;
  secondaryPlate?: string;
  personName: string;
  personRole?: string;
  personAvatar?: string;
  categoryTag: string;
  progressValue: number; // 0 - 100 or fraction
  progressText?: string;
  status: 'concluido' | 'pendente' | 'em_atraso' | 'em_operacao' | 'em_transito';
  statusLabel?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface MasterModulePageProps {
  moduleKey?: string;
  titleKicker?: string;
  headline?: string;
  subtext?: string;
  heroImage?: string;
  primaryCtaLabel?: string;
  onPrimaryCta?: () => void;
  metrics?: {
    total: number;
    completed: number;
    pending: number;
    delayed: number;
  };
  donutData?: {
    score: number; // e.g. 67 for 67%
    scoreLabel: string; // e.g. "Conformidade"
    legend: {
      completed: number;
      pending: number;
      delayed: number;
      total: number;
    };
  };
  records?: MasterRecord[];
  onViewRecord?: (record: MasterRecord) => void;
  customActionContent?: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  hideHeroBanner?: boolean;
}

export function MasterModulePage({
  titleKicker,
  headline,
  subtext,
  heroImage,
  primaryCtaLabel,
  onPrimaryCta,
  metrics,
  donutData,
  records = [],
  onViewRecord,
  title,
  subtitle,
  badge,
  onBack,
  actions,
  children,
  hideHeroBanner = false,
}: MasterModulePageProps) {
  if (children) {
    return (
      <div className="w-full min-h-full h-auto flex flex-col gap-4 overflow-y-auto font-sans p-2">
        <div className="bg-white rounded-[24px] p-5 border border-[#ded5c6] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-4 relative z-10">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-[#ded5c6] cursor-pointer transition-all active:scale-95"
                title="Voltar"
              >
                <ArrowUpRight size={18} className="rotate-180" />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <span>{badge || '☕ REGISTRO TÁTICO'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 uppercase tracking-tight font-sans">
                {title || headline || 'Módulo'}
              </h1>
              <p className="text-xs text-stone-600 font-sans mt-0.5">
                {subtitle || subtext || ''}
              </p>
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0 relative z-10">{actions}</div>}
        </div>
        {children}
      </div>
    );
  }

  const [filter, setFilter] = useState<'all' | 'concluido' | 'pendente' | 'em_atraso'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MasterRecord | null>(null);

  const safeRecords = records || [];
  const filteredRecords = useMemo(() => {
    return safeRecords.filter(r => {
      const matchSearch =
        r.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.plate && r.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.categoryTag && r.categoryTag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (filter === 'concluido') return r.status === 'concluido' || r.status === 'em_operacao';
      if (filter === 'pendente') return r.status === 'pendente' || r.status === 'em_transito';
      if (filter === 'em_atraso') return r.status === 'em_atraso';

      return true;
    });
  }, [safeRecords, searchTerm, filter]);

  return (
    <div className="w-full min-h-full h-auto flex flex-col gap-4 overflow-y-auto p-2">
      
      {/* ========================================================================= */}
      {/* 1. TOP HERO ROW: 16:9 Photography Banner + Donut Gauge Card             */}
      {/* ========================================================================= */}
      {!hideHeroBanner && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0">
          
          {/* Left Hero Box (Spans 3 Columns) */}
          <div className="lg:col-span-3 rounded-[24px] overflow-hidden relative border border-[#ded5c6] shadow-md min-h-[175px] flex flex-col justify-between p-5 group">
            
            {/* Background 4K Photography */}
            <img
              src={heroImage}
              alt={headline}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.75] group-hover:scale-105 transition-transform duration-700 mix-blend-luminosity"
              referrerPolicy="no-referrer"
            />

            {/* Vignette Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-950/95 via-amber-950/60 to-transparent pointer-events-none" />

            {/* Top Row: Shield Badge + Headline Content */}
            <div className="relative z-10 flex items-start gap-4">
              
              {/* Emblem Badge 3D */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#cb9d50] to-[#8c5b16] p-[2px] shadow-lg flex items-center justify-center border border-amber-300/30 shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#1d120a] flex items-center justify-center">
                  <ShieldCheck size={26} className="text-amber-400" />
                </div>
              </div>

              <div className="flex flex-col gap-0.5 max-w-xl text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black tracking-widest text-[#dfb15b] uppercase">
                    {titleKicker || 'SISTEMA OPERACIONAL'}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                    Live Telemetry
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight uppercase font-sans">
                  {headline}
                </h2>
                <p className="text-xs text-amber-100/90 font-medium line-clamp-1 mt-1">
                  {subtext}
                </p>
              </div>
            </div>

            {/* Bottom Row: Overlaid Status Pill Counters */}
            <div className="relative z-10 flex items-center gap-2.5 flex-wrap pt-3 border-t border-white/10">
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/30 text-white shadow-xs">
                <Container size={14} className="text-[#dfb15b]" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-amber-200 uppercase font-mono font-bold">Total:</span>
                  <span className="text-xs font-mono font-black text-white">{metrics?.total || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 shadow-xs">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-emerald-300 uppercase font-mono font-bold">Concluídos:</span>
                  <span className="text-xs font-mono font-black text-emerald-200">{metrics?.completed || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/30 text-amber-400 shadow-xs">
                <Clock size={14} className="text-amber-400" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-amber-300 uppercase font-mono font-bold">Pendentes:</span>
                  <span className="text-xs font-mono font-black text-amber-200">{metrics?.pending || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/30 text-red-400 shadow-xs">
                <AlertTriangle size={14} className="text-red-400" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-red-300 uppercase font-mono font-bold">Em atraso:</span>
                  <span className="text-xs font-mono font-black text-red-200">{metrics?.delayed || 0}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Gauge Card (1 Column) - Donut Chart 3D */}
          <div className="lg:col-span-1 rounded-[24px] bg-gradient-to-br from-white to-[#fcf8f2] border border-[#ded5c6] p-4 flex flex-col items-center justify-between shadow-md relative overflow-hidden">
            
            <div className="w-full flex items-center justify-between pb-1.5 border-b border-[#ded5c6] relative z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-700" />
                MÉTRICA GLOBAL
              </span>
              <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                REAL TIME
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 py-3 w-full relative z-10">
              {/* 3D Donut SVG Ring */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="masterDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff1744" />
                      <stop offset="100%" stopColor="#760914" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#eee7dc"
                    strokeWidth="3.8"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="url(#masterDonutGrad)"
                    strokeWidth="3.8"
                    strokeDasharray={`${donutData?.score || 0}, 100`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-stone-900 font-mono leading-none">
                    {donutData?.score || 0}%
                  </span>
                  <span className="text-[7.5px] font-bold text-amber-800 uppercase tracking-tight mt-0.5">
                    {donutData?.scoreLabel || 'Meta'}
                  </span>
                </div>
              </div>

              {/* Legend Breakdown */}
              <div className="flex flex-col gap-1 text-[10px] font-mono font-semibold text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />
                  <span>Ok: <strong className="text-stone-900">{donutData?.legend?.completed || 0}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_#f59e0b]" />
                  <span>Pend: <strong className="text-stone-900">{donutData?.legend?.pending || 0}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_#ef4444]" />
                  <span>Atr: <strong className="text-stone-900">{donutData?.legend?.delayed || 0}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5 border-t border-stone-200 text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                  <span>Total: <strong className="text-stone-900">{donutData?.legend?.total || 0}</strong></span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER FILTER & ACTION CONTROLS ROW                                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/50 p-2.5 rounded-2xl border border-[#ded5c6] shadow-sm shrink-0 relative">
        
        {/* Primary CTA + Segmented Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar relative z-10">
          
          {primaryCtaLabel && (
            <button
              onClick={onPrimaryCta}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-800 to-red-950 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95 border border-red-700"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>{primaryCtaLabel}</span>
            </button>
          )}

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 bg-stone-200/50 p-1 rounded-xl border border-stone-300/40 shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                filter === 'all'
                  ? "bg-white text-stone-900 shadow-xs border border-stone-300"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('concluido')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                filter === 'concluido'
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Concluídos
            </button>
            <button
              onClick={() => setFilter('pendente')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                filter === 'pendente'
                  ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('em_atraso')}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                filter === 'em_atraso'
                  ? "bg-rose-100 text-rose-850 border border-rose-300 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              Em atraso
            </button>
          </div>

        </div>

        {/* Right Search Input & Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end relative z-10">
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/60 border border-amber-300 text-amber-900 text-xs font-mono font-bold shadow-xs">
            <CalendarIcon size={13} className="text-amber-800" />
            <span>25/09/2026</span>
          </div>

          <button
            className="p-2 rounded-xl bg-white hover:bg-amber-50 text-stone-700 border border-[#ded5c6] transition-colors cursor-pointer active:scale-95"
            title="Filtros Avançados"
          >
            <SlidersHorizontal size={14} />
          </button>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Buscar veículo, placa ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#ded5c6] focus:border-yellow-500 rounded-xl py-1.5 pl-9 pr-3 text-xs text-stone-900 placeholder-stone-500 outline-none transition-all font-semibold shadow-xs"
            />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN RECORDS CANVAS (High-Density Widescreen Glass Grid Cards)          */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
        
        {filteredRecords.length === 0 ? (
          <div className="w-full h-48 rounded-[24px] bg-white border border-[#ded5c6] flex flex-col items-center justify-center p-8 text-center text-stone-500 shadow-sm">
            <Container size={32} className="text-stone-400 mb-2 animate-bounce" />
            <span className="text-sm font-bold text-stone-900">Nenhum registro encontrado</span>
            <span className="text-xs text-stone-500 mt-0.5">Ajuste os filtros de pesquisa para visualizar os dados do módulo.</span>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isCompleted = record.status === 'concluido' || record.status === 'em_operacao';
            const isPending = record.status === 'pendente' || record.status === 'em_transito';
            const isDelayed = record.status === 'em_atraso';

            return (
              <div
                key={record.id}
                onClick={() => onViewRecord && onViewRecord(record)}
                className="w-full bg-white hover:bg-amber-50/30 border border-[#ded5c6] hover:border-[#dfb15b]/60 rounded-2xl p-2.5 sm:p-3 transition-all duration-300 shadow-sm hover:shadow flex flex-col md:flex-row items-center justify-between gap-3 cursor-pointer group relative overflow-hidden"
              >
                {/* Lateral glowing indicator bar on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#9b1526] to-[#760914] scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                
                {/* Col 1: Item Thumbnail & Title */}
                <div className="flex items-center gap-3 w-full md:w-1/4 min-w-[200px] text-left pl-1">
                  {record.itemImage ? (
                    <div className="w-12 h-10 rounded-xl overflow-hidden border border-[#ded5c6] bg-stone-100 shrink-0 shadow-xs">
                      <img
                        src={record.itemImage}
                        alt={record.itemTitle}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-10 rounded-xl bg-gradient-to-br from-red-800 to-red-950 text-white flex items-center justify-center shrink-0 shadow-xs border border-red-700">
                      <Truck size={18} className="group-hover:scale-110 transition-transform" />
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-stone-900 uppercase truncate tracking-tight font-mono group-hover:text-red-700 transition-colors">
                      {record.itemTitle}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium truncate mt-0.5">
                      {record.itemSubtitle || 'Operação Regular'}
                    </span>
                  </div>
                </div>

                {/* Col 2: Mercosul Plate Badge */}
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-start md:justify-center">
                  <MercosulPlate plate={record.plate || 'ABC-1234'} />
                  {record.secondaryPlate && (
                    <ChevronRight size={14} className="text-stone-400 group-hover:text-stone-700" />
                  )}
                  {record.secondaryPlate && (
                    <MercosulPlate plate={record.secondaryPlate} />
                  )}
                </div>

                {/* Col 3: Responsible Person & Avatar */}
                <div className="flex items-center gap-2.5 w-full md:w-1/5 min-w-[150px] text-left">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center text-amber-900 font-mono font-black text-xs shadow-inner">
                    {record.personAvatar ? (
                      <img src={record.personAvatar} alt={record.personName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      record.personName.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-stone-800 truncate">
                      {record.personName}
                    </span>
                    <span className="text-[9.5px] text-stone-500 font-medium truncate mt-0.5">
                      {record.personRole || 'Operador Responsável'}
                    </span>
                  </div>
                </div>

                {/* Col 4: Category Pill */}
                <div className="w-full md:w-auto shrink-0 text-left md:text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider shadow-inner">
                    {record.categoryTag}
                  </span>
                </div>

                {/* Col 5: Progress Bar */}
                <div className="flex flex-col gap-1 w-full md:w-32 shrink-0 text-left">
                  <div className="flex items-center justify-between text-[9.5px] font-mono font-bold text-stone-500">
                    <span>PROGRESSO</span>
                    <span className="text-amber-800">{record.progressText || `${record.progressValue}%`}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/80 p-[1px]">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        isCompleted 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
                          : isPending 
                            ? "bg-gradient-to-r from-amber-500 to-[#dfb15b]" 
                            : "bg-gradient-to-r from-red-600 to-rose-400"
                      )}
                      style={{ width: `${Math.min(100, record.progressValue)}%` }}
                    />
                  </div>
                </div>

                {/* Col 6: Status Tag */}
                <div className="w-full md:w-auto shrink-0 text-left">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit shadow-xs",
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : isPending
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      isCompleted ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-red-500"
                    )} />
                    {record.statusLabel || (isCompleted ? 'Concluído' : isPending ? 'Pendente' : 'Em atraso')}
                  </span>
                </div>

                {/* Col 7: Timestamp */}
                <div className="text-[10px] font-mono text-stone-500 shrink-0 hidden lg:block">
                  {record.timestamp}
                </div>

                {/* Col 8: Action Icons */}
                <div className="flex items-center gap-1 shrink-0 justify-end w-full md:w-auto pr-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRecord && onViewRecord(record);
                    }}
                    className="p-1.5 rounded-lg hover:bg-amber-50 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                    title="Visualizar detalhes"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg hover:bg-amber-50 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                    title="Mais opções"
                  >
                    <MoreVertical size={15} />
                  </button>
                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}

export default MasterModulePage;
