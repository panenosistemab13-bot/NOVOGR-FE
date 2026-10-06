import React, { useState } from 'react';
import { 
  Building2, 
  Globe, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Activity, 
  PieChart, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  ShieldAlert 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import BrazilMap3D from '../charts/BrazilMap3D';
import { 
  INICIO_KPIS, 
  REGIONAL_PERFORMANCES, 
  FINANCIAL_SUMMARY, 
  MONTHLY_REVENUE_EVOLUTION, 
  DAILY_PERFORMANCE_HISTORY, 
  OPERATIONAL_ALERTS, 
  MapNode 
} from '../../data/mockData';

interface InicioViewProps {
  onNavigateToTab?: (tabId: string) => void;
}

export default function InicioView({ onNavigateToTab }: InicioViewProps) {
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alerts, setAlerts] = useState(OPERATIONAL_ALERTS);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  return (
    <div className="w-full space-y-4 p-4 xl:p-6 max-w-[1920px] mx-auto text-left select-none">
      
      {/* HERO TITLE & CONTROLS HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121A26] border border-white/10 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest bg-[#172231] px-2.5 py-0.5 rounded border border-white/10">
              CENTRO DE COMANDO OPERACIONAL
            </span>
            <span className="text-[10px] font-mono font-black text-[#43D17A] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#43D17A] animate-pulse" />
              OPERAÇÃO ESTÁVEL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight uppercase font-heading">
            Visão Geral Operacional
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Monitoramento estratégico em tempo real e controle unificado de frota, riscos e logística.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-gradient-to-r from-[#A31324] to-[#700C18] hover:from-[#E63946] hover:to-[#A31324] text-[#F3F6F8] rounded-xl font-mono text-xs font-black uppercase tracking-wider border border-[#D6A84F]/40 shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Atualizar dados'}</span>
          </button>
        </div>
      </div>

      {/* TOP 4 KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INICIO_KPIS.map((kpi, idx) => (
          <div key={idx} className="exec-card p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[#94A3B8] mb-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#172231] border border-white/10 flex items-center justify-center text-[#D6A84F]">
                {idx === 0 && <ShieldAlert size={16} />}
                {idx === 1 && <CheckCircle2 size={16} />}
                {idx === 2 && <AlertTriangle size={16} />}
                {idx === 3 && <Activity size={16} />}
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl xl:text-3xl font-black text-[#F3F6F8] tracking-tight font-heading">
                {kpi.value}
              </span>
              <span className={`text-xs font-mono font-bold flex items-center ${kpi.isPositive ? 'text-[#43D17A]' : 'text-[#E63946]'}`}>
                {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </span>
            </div>

            <span className="text-[10px] text-[#94A3B8] font-mono block mt-1">
              {kpi.period}
            </span>
          </div>
        ))}
      </div>

      {/* MAIN DASHBOARD GRID (MATCHING REFERENCE IMAGE 111.JPEG) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT 7 COLUMNS: MAP, RANKING & DUAL-AXIS TREND */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 3D MAP & REGIONAL SUMMARY CARD */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* Map Container */}
            <div className="sm:col-span-8 h-[380px]">
              <BrazilMap3D 
                selectedNodeId={selectedNode?.id} 
                onSelectNode={(node) => setSelectedNode(node)} 
              />
            </div>

            {/* Left Quick Side Stats (Unidades Ativas & Cobertura) */}
            <div className="sm:col-span-4 flex flex-col gap-3 justify-between">
              
              <div className="exec-card p-4 text-left flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 text-[#94A3B8]">
                  <Building2 size={16} className="text-[#D6A84F]" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider">UNIDADES ATIVAS</span>
                </div>
                <div className="text-3xl font-black text-[#F3F6F8] tracking-tight font-heading">47</div>
                <span className="text-[10px] text-[#94A3B8] font-mono mt-1">em todo o Brasil</span>
              </div>

              <div className="exec-card p-4 text-left flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 text-[#94A3B8]">
                  <Globe size={16} className="text-[#4DD6D8]" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider">COBERTURA NACIONAL</span>
                </div>
                <div className="text-3xl font-black text-[#F3F6F8] tracking-tight font-heading">98,6%</div>
                <span className="text-[10px] text-[#94A3B8] font-mono mt-1">dos municípios monitorados</span>
              </div>

            </div>

          </div>

          {/* RANKING REGIONAL HORIZONTAL PROGRESS BARS */}
          <div className="exec-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-black text-[#F3F6F8] uppercase tracking-wider">
                RANKING REGIONAL — DESEMPENHO POR REGIÃO NO PERÍODO
              </span>
              <span className="text-[10px] font-mono text-[#D6A84F] font-bold">DESEMPENHO | VAR. VS ANT.</span>
            </div>

            <div className="space-y-2.5">
              {REGIONAL_PERFORMANCES.map((reg) => (
                <div key={reg.id} className="flex items-center gap-3 text-xs font-mono">
                  <div className="w-5 h-5 rounded-full bg-[#172231] border border-white/20 text-[#D6A84F] font-black text-[10px] flex items-center justify-center shrink-0">
                    {reg.rank}
                  </div>
                  <span className="w-28 font-bold text-[#F3F6F8] uppercase truncate">{reg.region}</span>

                  <div className="flex-1 bg-[#172231] h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, reg.performance)}%`, backgroundColor: reg.color }}
                    />
                  </div>

                  <span className="w-16 text-right font-black text-[#F3F6F8]">{reg.performance}%</span>
                  <span className={`w-16 text-right font-bold ${reg.varVsAnt.startsWith('+') ? 'text-[#43D17A]' : 'text-[#E63946]'}`}>
                    {reg.varVsAnt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DUAL-AXIS LINE/BAR CHART: EVOLUÇÃO DE DESEMPENHO */}
          <div className="exec-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-2 gap-2">
              <div>
                <span className="text-xs font-mono font-black text-[#F3F6F8] uppercase tracking-wider block">
                  EVOLUÇÃO DE DESEMPENHO
                </span>
                <span className="text-[10px] text-[#94A3B8]">Acompanhamento de indicadores chave ao longo do tempo</span>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[#E63946]"><span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" /> Desempenho (%)</span>
                <span className="flex items-center gap-1 text-[#4DD6D8]"><span className="w-2.5 h-2.5 rounded-full bg-[#4DD6D8]" /> Resultado (R$ Bilhões)</span>
              </div>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={DAILY_PERFORMANCE_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#E63946" fontSize={10} tickLine={false} domain={[50, 70]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#4DD6D8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#172231', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', color: '#F3F6F8', fontSize: '11px' }} 
                  />
                  <Bar yAxisId="right" dataKey="resultado" fill="rgba(77, 214, 216, 0.25)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="desempenho" stroke="#E63946" strokeWidth={3} dot={{ r: 4, fill: '#E63946' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* RIGHT 5 COLUMNS: OPERATIONAL RADIAL GAUGE, FINANCIAL SUMMARY & ALERTS */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* DESEMPENHO OPERACIONAL RADIAL RING */}
          <div className="exec-card p-5 flex items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="text-[10px] font-mono font-black text-[#94A3B8] uppercase tracking-wider block">
                DESEMPENHO OPERACIONAL
              </span>
              <div className="text-4xl font-black text-[#F3F6F8] tracking-tight font-heading">
                64,81%
              </div>
              <span className="text-xs font-mono text-[#43D17A] font-bold block">
                +8,23 pp vs 15.01.24 (61,58%)
              </span>
            </div>

            {/* Circular Donut Visual */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#172231]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#D6A84F]"
                  strokeDasharray="64.81, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-mono font-black text-[#D6A84F]">
                +8,23 pp
              </span>
            </div>
          </div>

          {/* RESULTADO TOTAL & MONTHLY BAR CHART */}
          <div className="exec-card p-4 space-y-3">
            <div className="text-left">
              <span className="text-[10px] font-mono font-black text-[#94A3B8] uppercase tracking-wider block">
                RESULTADO TOTAL
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight font-heading mt-0.5">
                R$ 5.559.042.000
              </div>
              <span className="text-xs font-mono text-[#43D17A] font-bold block mt-0.5">
                +11,2% vs período anterior
              </span>
            </div>

            {/* Monthly Bar Chart */}
            <div className="h-[140px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MONTHLY_REVENUE_EVOLUTION}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#172231', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', color: '#F3F6F8', fontSize: '11px' }} 
                  />
                  <Bar dataKey="valor" fill="#A31324" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RESUMO FINANCEIRO TABLE */}
          <div className="exec-card p-4 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-[#94A3B8] font-black uppercase">
              <span>RESUMO FINANCEIRO (Janeiro/2025)</span>
              <span>VAR. %</span>
            </div>

            <div className="space-y-1.5 divide-y divide-white/5">
              {FINANCIAL_SUMMARY.map((fin, idx) => (
                <div key={idx} className="flex items-center justify-between pt-1.5 text-[11px]">
                  <span className="text-[#94A3B8] font-semibold">{fin.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#F3F6F8]">{fin.value}</span>
                    <span className={`w-14 text-right font-black ${fin.isPositive ? 'text-[#43D17A]' : 'text-[#E63946]'}`}>
                      {fin.varPercent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ALERTAS & OBSERVAÇÕES PANEL */}
          <div className="exec-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-black text-[#F3F6F8] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={15} className="text-[#E63946]" />
                ALERTAS & OBSERVAÇÕES
              </span>
              <span className="w-5 h-5 rounded-full bg-[#E63946] text-white font-mono font-black text-[10px] flex items-center justify-center">
                {alerts.filter(a => !a.read).length}
              </span>
            </div>

            <div className="space-y-2 text-left">
              {alerts.map((alt) => (
                <div 
                  key={alt.id} 
                  onClick={() => markAlertRead(alt.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    alt.type === 'warning' 
                      ? 'bg-[#E63946]/10 border-[#E63946]/30 hover:border-[#E63946]' 
                      : 'bg-[#172231] border-white/10 hover:border-[#D6A84F]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase ${alt.type === 'warning' ? 'text-[#E63946]' : 'text-[#F3F6F8]'}`}>
                      {alt.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">{alt.timeAgo}</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-tight">
                    {alt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM SUMMARY KPIS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
        <div className="exec-card p-3 text-left">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">RESULTADO TOTAL (YTD)</span>
          <span className="text-lg font-black text-[#F3F6F8]">R$ 5,56B</span>
          <span className="text-[9.5px] font-mono text-[#43D17A] block">+11,2% vs YTD anterior</span>
        </div>

        <div className="exec-card p-3 text-left">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">DESEMPENHO OPERACIONAL</span>
          <span className="text-lg font-black text-[#F3F6F8]">64,81%</span>
          <span className="text-[9.5px] font-mono text-[#43D17A] block">+8,23 pp vs ano anterior</span>
        </div>

        <div className="exec-card p-3 text-left">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">LUCRO OPERACIONAL (YTD)</span>
          <span className="text-lg font-black text-[#F3F6F8]">R$ 1,26B</span>
          <span className="text-[9.5px] font-mono text-[#43D17A] block">+8,6% vs YTD anterior</span>
        </div>

        <div className="exec-card p-3 text-left">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">MARGEM OPERACIONAL</span>
          <span className="text-lg font-black text-[#F3F6F8]">16,01%</span>
          <span className="text-[9.5px] font-mono text-[#43D17A] block">+2,1 pp vs ano anterior</span>
        </div>

        <div className="exec-card p-3 text-left">
          <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">UNIDADES ATIVAS</span>
          <span className="text-lg font-black text-[#F3F6F8]">47</span>
          <span className="text-[9.5px] font-mono text-[#D6A84F] block">Em todo o Brasil</span>
        </div>
      </div>

    </div>
  );
}
