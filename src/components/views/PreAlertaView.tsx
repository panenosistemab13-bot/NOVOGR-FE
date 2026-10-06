import React, { useState, useMemo } from 'react';
import { BellRing, ShieldAlert, Check, Filter, CheckCircle2 } from 'lucide-react';
import { PRE_ALERTS, PreAlertItem } from '../../data/mockData';

export default function PreAlertaView() {
  const [alerts, setAlerts] = useState<PreAlertItem[]>(PRE_ALERTS);
  const [severityFilter, setSeverityFilter] = useState<string>('TODAS');

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => severityFilter === 'TODAS' || a.severity === severityFilter);
  }, [alerts, severityFilter]);

  const stats = useMemo(() => {
    return {
      critical: alerts.filter(a => a.severity === 'Crítico' && !a.acknowledged).length,
      moderate: alerts.filter(a => a.severity === 'Moderado' && !a.acknowledged).length,
      info: alerts.filter(a => a.severity === 'Informativo' && !a.acknowledged).length,
    };
  }, [alerts]);

  return (
    <div className="w-full space-y-4 p-4 xl:p-6 max-w-[1920px] mx-auto text-left select-none">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121A26] border border-white/10 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest bg-[#172231] px-2.5 py-0.5 rounded border border-white/10">
              SISTEMA DE PREVENÇÃO & PRÓNTA RESPOSTA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight uppercase font-heading flex items-center gap-2">
            <BellRing size={28} className="text-[#A31324]" />
            Painel de Pré-Alertas
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Detecção antecipada de anomalias operacionais, desvios de rota e falhas de sinal.
          </p>
        </div>
      </div>

      {/* SEVERITY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="exec-card p-4 border-[#E63946]/40 bg-[#E63946]/10">
          <span className="text-[10px] font-mono text-[#E63946] font-bold uppercase block">ALERTAS CRÍTICOS</span>
          <div className="text-3xl font-black text-[#E63946] font-heading mt-1">{stats.critical}</div>
          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">Exige ação tática imediata</span>
        </div>

        <div className="exec-card p-4 border-[#D6A84F]/40 bg-[#D6A84F]/10">
          <span className="text-[10px] font-mono text-[#D6A84F] font-bold uppercase block">ALERTAS MODERADOS</span>
          <div className="text-3xl font-black text-[#D6A84F] font-heading mt-1">{stats.moderate}</div>
          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">Acompanhamento contínuo</span>
        </div>

        <div className="exec-card p-4 border-[#4DD6D8]/40 bg-[#4DD6D8]/10">
          <span className="text-[10px] font-mono text-[#4DD6D8] font-bold uppercase block">INFORMATIVOS</span>
          <div className="text-3xl font-black text-[#4DD6D8] font-heading mt-1">{stats.info}</div>
          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">Notificações operacionais</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="exec-card p-4 flex items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-[#D6A84F]" />
          <span className="text-[#94A3B8]">Filtrar por Severidade:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#172231] text-[#F3F6F8] font-bold px-3 py-1.5 rounded-xl border border-white/10 outline-none cursor-pointer"
          >
            <option value="TODAS">TODOS</option>
            <option value="Crítico">Crítico</option>
            <option value="Moderado">Moderado</option>
            <option value="Informativo">Informativo</option>
          </select>
        </div>

        <span className="text-[11px] text-[#94A3B8]">Exibindo {filteredAlerts.length} pré-alertas</span>
      </div>

      {/* ALERT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map((alt) => (
          <div 
            key={alt.id}
            className={`exec-card p-4 space-y-3 transition-all ${
              alt.severity === 'Crítico' ? 'border-l-4 border-l-[#E63946]' :
              alt.severity === 'Moderado' ? 'border-l-4 border-l-[#D6A84F]' :
              'border-l-4 border-l-[#4DD6D8]'
            } ${alt.acknowledged ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  alt.severity === 'Crítico' ? 'bg-[#E63946] text-white' :
                  alt.severity === 'Moderado' ? 'bg-[#D6A84F] text-black' :
                  'bg-[#4DD6D8] text-black'
                }`}>
                  {alt.severity}
                </span>
                <span className="font-mono text-xs font-bold text-[#F3F6F8]">{alt.code}</span>
              </div>
              <span className="font-mono text-xs text-[#94A3B8]">{alt.time}</span>
            </div>

            <div className="space-y-1 text-left font-mono text-xs">
              <div><span className="text-[#94A3B8]">Região/Local:</span> <span className="text-[#F3F6F8] font-bold">{alt.region}</span></div>
              <div><span className="text-[#94A3B8]">Veículo:</span> <span className="text-[#D6A84F] font-bold">{alt.vehicle}</span></div>
              <p className="text-[#F3F6F8] bg-[#172231] p-2.5 rounded-lg border border-white/5 mt-2 leading-relaxed">
                {alt.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-[#94A3B8]">
                {alt.acknowledged ? '✓ Alerta Reconhecido' : 'Pendente de Reconhecimento'}
              </span>

              {!alt.acknowledged && (
                <button
                  onClick={() => acknowledgeAlert(alt.id)}
                  className="px-3 py-1.5 bg-[#A31324] hover:bg-[#E63946] text-white text-[11px] font-mono font-bold uppercase rounded-lg shadow-md cursor-pointer flex items-center gap-1"
                >
                  <Check size={13} />
                  <span>Reconhecer Alerta</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
