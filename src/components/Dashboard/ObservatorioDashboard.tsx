import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Compass, 
  PieChart as PieIcon, 
  Clock, 
  Sparkles,
  Layers,
  Radio,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function ObservatorioDashboard() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#07080c] text-white font-sans p-4 sm:p-6 overflow-x-hidden select-none flex flex-col justify-between relative">
      
      {/* BACKGROUND COSMIC NEBULA GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(255,59,75,0.08)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_right,rgba(0,240,255,0.05)_0%,rgba(0,0,0,0)_60%)] pointer-events-none z-0" />

      <div className="relative z-10 space-y-6 max-w-[1800px] mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* TOP TITLE HEADER                                                         */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="text-left space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-heading">
              OBSERVATÓRIO <br className="sm:hidden" />
              <span className="text-slate-200">DE DADOS </span>
              <span className="text-[#ff3b4b]">EM ÓRBITA</span>
            </h1>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#ff3b4b] animate-ping" />
              <span>Inteligência orbital. Decisões em tempo real.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#121520] border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono">
              <Radio size={14} className="text-[#ff3b4b] animate-pulse" />
              <span className="text-slate-300 font-bold">STATUS DA REDE: <span className="text-[#00f0ff]">100% OPERACIONAL</span></span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY GRID: 3D ORBITAL MAP (LEFT 8 COLS) + INSIGHTS PANEL (RIGHT 4 COLS) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLUMNS: 3D MAP & SUMMARY KPIS & TIMELINE */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 3D TERRITORY ORBITAL MAP STAGE */}
            <div className="w-full bg-[#0d0f17] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] min-h-[420px] flex flex-col justify-between">
              
              {/* Top Map Indicators */}
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Compass size={14} className="text-[#ff3b4b]" />
                  TELEMETRIA EM TEMPO REAL • BRASIL
                </span>

                <span className="text-[10px] font-mono text-slate-500 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                  ÓRBITA LEO • SENSORIAIS 3C
                </span>
              </div>

              {/* 3D MAP VECTOR VISUALIZER */}
              <div className="w-full h-80 my-2 relative flex items-center justify-center">
                
                {/* Concentric Elliptical Orbit Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[520px] h-[240px] rounded-full border border-[#ff3b4b]/20 border-dashed animate-spin-slow" />
                  <div className="w-[380px] h-[180px] rounded-full border border-[#00f0ff]/20 animate-spin-reverse" />
                  <div className="w-[240px] h-[110px] rounded-full border border-[#ffb800]/20 border-dotted" />
                </div>

                {/* 3D Brazil Topography Projection SVG */}
                <svg className="w-full h-full max-w-xl text-[#1e2333] drop-shadow-[0_0_25px_rgba(0,240,255,0.15)]" viewBox="0 0 800 500" fill="none">
                  {/* Terrain Mesh Grid Lines */}
                  <path d="M150,250 Q400,100 650,250 Q400,400 150,250 Z" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
                  <path d="M220,250 Q400,150 580,250 Q400,350 220,250 Z" stroke="rgba(255,59,75,0.12)" strokeWidth="1" fill="none" />

                  {/* Brazil 3D Contour Blocks */}
                  <path 
                    d="M320,120 L480,100 L560,180 L520,320 L420,380 L300,340 L280,220 Z" 
                    fill="#151824" 
                    stroke="#2e354a" 
                    strokeWidth="2" 
                    className="transition-colors hover:fill-[#1b2030]"
                  />
                  <path 
                    d="M340,140 L460,120 L530,190 L500,300 L410,350 L320,320 L300,220 Z" 
                    fill="#1d2232" 
                    stroke="#ff3b4b" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4"
                  />

                  {/* Orbital Connecting Arcs */}
                  <path d="M320,200 Q450,110 520,220" stroke="#00f0ff" strokeWidth="2" strokeDasharray="6 6" fill="none" />
                  <path d="M300,320 Q400,250 480,310" stroke="#ff3b4b" strokeWidth="2" fill="none" />

                  {/* Pulsing Telemetry Nodes */}
                  <g className="cursor-pointer" onClick={() => setSelectedNode('Norte')}>
                    <circle cx="320" cy="200" r="7" fill="#00f0ff" className="animate-ping opacity-75" />
                    <circle cx="320" cy="200" r="5" fill="#00f0ff" />
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedNode('Nordeste')}>
                    <circle cx="520" cy="220" r="9" fill="#ff3b4b" className="animate-ping opacity-75" />
                    <circle cx="520" cy="220" r="6" fill="#ff3b4b" />
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedNode('Sudeste')}>
                    <circle cx="480" cy="310" r="8" fill="#ffb800" className="animate-ping opacity-75" />
                    <circle cx="480" cy="310" r="5" fill="#ffb800" />
                  </g>

                  <g className="cursor-pointer" onClick={() => setSelectedNode('Sul')}>
                    <circle cx="410" cy="350" r="6" fill="#00f0ff" />
                  </g>
                </svg>

                {/* Floating Node Label Overlay */}
                <div className="absolute top-1/2 right-12 bg-black/70 backdrop-blur-md border border-[#ff3b4b]/40 px-3 py-2 rounded-xl text-left font-mono text-xs shadow-xl">
                  <span className="text-[9px] text-slate-400 block uppercase">PONTO CRÍTICO</span>
                  <span className="text-[#ff3b4b] font-black uppercase">NORDESTE ATIVO</span>
                </div>
              </div>

              {/* Bottom Tag Legend inside Map Stage */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/10 pt-3 z-10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ff3b4b]" /> Alta Frequência</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00f0ff]" /> Telemetria OK</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ffb800]" /> Alerta Ativo</span>
                </div>
                <span>ÓRBITA 3C BRASIL</span>
              </div>

            </div>

            {/* 3 SUMMARY KPIS CARDS (CENTER BOTTOM) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: PARTICIPAÇÃO */}
              <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  {/* Gauge Donut Circle */}
                  <div className="relative w-12 h-12 rounded-full border-4 border-[#1c2130] border-t-[#ff3b4b] border-r-[#ff3b4b] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-mono font-black text-white">64%</span>
                  </div>
                  <div className="text-left leading-none space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      PARTICIPAÇÃO
                    </span>
                    <span className="text-2xl font-black text-white tracking-tight font-heading block">
                      64,81%
                    </span>
                    <span className="text-[10px] font-mono text-[#00f0ff] font-bold block">
                      +4,76% vs. eleição anterior
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: VOTOS APURADOS / REGISTROS */}
              <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#141824] border border-white/10 flex items-center justify-center text-[#ff3b4b] shrink-0">
                    <Users size={22} />
                  </div>
                  <div className="text-left leading-none space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      VOTOS APURADOS
                    </span>
                    <span className="text-2xl font-black text-white tracking-tight font-heading block">
                      5.559.042
                    </span>
                    <span className="text-[10px] font-mono text-[#00f0ff] font-bold block">
                      +3,19% vs. eleição anterior
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: ZONAS APURADAS / COBERTURA */}
              <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#141824] border border-white/10 flex items-center justify-center text-[#00f0ff] shrink-0">
                    <Target size={22} />
                  </div>
                  <div className="text-left leading-none space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      ZONAS APURADAS
                    </span>
                    <span className="text-2xl font-black text-white tracking-tight font-heading block">
                      98,12%
                    </span>
                    <span className="text-[10px] font-mono text-[#00f0ff] font-bold block">
                      +2,31% vs. eleição anterior
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* TIMELINE STEPPER: LINHA DO TEMPO DA APURAÇÃO */}
            <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono font-black text-[#ff3b4b] uppercase tracking-wider text-left">
                <span className="w-2 h-2 rounded-full bg-[#ff3b4b]" />
                <span>LINHA DO TEMPO DA APURAÇÃO</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-white/10 font-mono text-center">
                
                {/* Node 1 */}
                <div className="space-y-1 p-2 rounded-xl bg-[#121520] border border-white/5 opacity-70">
                  <span className="text-[10px] font-black text-slate-300 block uppercase">INÍCIO</span>
                  <span className="text-[9px] text-slate-500 block">01 OUT 08:00</span>
                </div>

                {/* Node 2 */}
                <div className="space-y-1 p-2 rounded-xl bg-[#121520] border border-white/5 opacity-70">
                  <span className="text-[10px] font-black text-slate-300 block uppercase">1º BOLETIM</span>
                  <span className="text-[9px] text-slate-500 block">01 OUT 12:00</span>
                </div>

                {/* Node 3 */}
                <div className="space-y-1 p-2 rounded-xl bg-[#121520] border border-white/5 opacity-70">
                  <span className="text-[10px] font-black text-slate-300 block uppercase">2º BOLETIM</span>
                  <span className="text-[9px] text-slate-500 block">01 OUT 16:00</span>
                </div>

                {/* Node 4 */}
                <div className="space-y-1 p-2 rounded-xl bg-[#121520] border border-white/5 opacity-70">
                  <span className="text-[10px] font-black text-slate-300 block uppercase">3º BOLETIM</span>
                  <span className="text-[9px] text-slate-500 block">01 OUT 20:00</span>
                </div>

                {/* Node 5 - ATUAL (ACTIVE RED) */}
                <div className="space-y-1 p-2 rounded-xl bg-[#24080c] border border-[#ff3b4b] shadow-[0_0_15px_rgba(255,59,75,0.3)]">
                  <span className="text-[10px] font-black text-[#ff3b4b] block uppercase">ATUAL</span>
                  <span className="text-[9px] text-white font-bold block">05 OUT 13:59</span>
                </div>

                {/* Node 6 */}
                <div className="space-y-1 p-2 rounded-xl bg-[#121520] border border-white/5 opacity-60">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">PRÓXIMO</span>
                  <span className="text-[9px] text-slate-500 block">05 OUT 18:00</span>
                </div>

                {/* Node 7 */}
                <div className="space-y-1 p-2 rounded-xl bg-[#121520] border border-white/5 opacity-60">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">ENCERRAMENTO</span>
                  <span className="text-[9px] text-slate-500 block">05 OUT 24:00</span>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: INSIGHTS EM DESTAQUE */}
          <div className="lg:col-span-4 space-y-4 text-left">
            
            <div className="bg-[#0d0f17] border border-white/10 rounded-3xl p-5 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
              
              <div className="border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest block">
                  INSIGHTS EM DESTAQUE
                </span>
              </div>

              {/* Section 1: PARTICIPAÇÃO NACIONAL */}
              <div className="p-3.5 rounded-2xl bg-[#121520] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">PARTICIPAÇÃO NACIONAL</span>
                  <span className="text-2xl font-black text-white font-heading mt-0.5 block">64,81%</span>
                  <span className="text-[10px] font-mono text-[#00f0ff] font-bold block mt-1">+4,76% vs. eleição anterior</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#ff3b4b] flex items-center justify-center text-[#ff3b4b]">
                  <Activity size={18} />
                </div>
              </div>

              {/* Section 2: VOTOS APURADOS */}
              <div className="p-3.5 rounded-2xl bg-[#121520] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">VOTOS APURADOS</span>
                  <span className="text-2xl font-black text-white font-heading mt-0.5 block">5.559.042</span>
                  <span className="text-[10px] font-mono text-[#00f0ff] font-bold block mt-1">+3,19% vs. eleição anterior</span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#00f0ff] flex items-center justify-center text-[#00f0ff]">
                  <Users size={18} />
                </div>
              </div>

              {/* Section 3: ALERTAS CRÍTICOS */}
              <div className="p-3.5 rounded-2xl bg-[#20080b] border border-[#ff3b4b]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#ff3b4b] uppercase block font-bold">ALERTAS CRÍTICOS</span>
                  <span className="text-3xl font-black text-white font-heading block">3</span>
                  <span className="text-[10px] font-mono text-slate-400 block">em monitoramento</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#ff3b4b] text-white flex items-center justify-center animate-pulse">
                  <AlertTriangle size={18} />
                </div>
              </div>

              {/* Section 4: DESTAQUES REGIONAIS */}
              <div className="p-3.5 rounded-2xl bg-[#121520] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">DESTAQUES REGIONAIS</span>
                <p className="text-xs font-bold text-slate-200">
                  Nordeste apresenta maior crescimento <span className="text-[#00f0ff]">+6,22% participação</span>
                </p>
              </div>

              {/* Section 5: RANKING NACIONAL ORBITAL CONCENTRIC RINGS */}
              <div className="p-4 rounded-2xl bg-[#121520] border border-white/10 space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">RANKING NACIONAL</span>
                
                <div className="relative h-28 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-[#ff3b4b] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#00f0ff] flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#ffb800]" />
                    </div>
                  </div>

                  <div className="absolute top-1 right-2 text-right font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">1º</span>
                    <span className="text-sm font-black text-[#ff3b4b]">34,82%</span>
                  </div>

                  <div className="absolute bottom-1 left-2 text-left font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">2º</span>
                    <span className="text-xs font-black text-[#00f0ff]">24,40%</span>
                  </div>

                  <div className="absolute bottom-1 right-4 text-right font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">3º</span>
                    <span className="text-[11px] font-black text-[#ffb800]">15,59%</span>
                  </div>
                </div>
              </div>

              {/* Section 6: LEGENDA DE FLUXOS */}
              <div className="p-3 rounded-2xl bg-[#121520] border border-white/10 space-y-2 font-mono text-[10px]">
                <span className="text-slate-400 block font-bold uppercase">LEGENDA DE FLUXOS</span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-white inline-block" /> Alto Volume</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[#00f0ff] inline-block" /> Médio Volume</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[#00f0ff] inline-block" /> Variação Positiva</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[#ff3b4b] inline-block" /> Variação Negativa</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
