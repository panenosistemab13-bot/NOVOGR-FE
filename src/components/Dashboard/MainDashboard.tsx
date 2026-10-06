import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  PieChart as PieIcon, 
  Box, 
  Users2, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Layers
} from 'lucide-react';

// Imagens corporativas 3 Corações
import redConvoyTruck from '../../assets/images/hero_red_convoy_3c_1790406399003.jpg';
import latteCupBeans from '../../assets/images/latte_cup_saucer_beans_1790406410066.jpg';
import roadBanner from '../../assets/images/hero_convoy_sunset_1790400296415.jpg';

interface Candidate {
  rank: string;
  name: string;
  party: string;
  number: string;
  vice: string;
  percentage: number;
  votes: string;
  diffPercent: string;
  trend: 'up' | 'down';
  color: string;
  avatarBg: string;
  avatarText: string;
  trophyType: 'gold' | 'silver' | 'bronze' | 'pewter';
}

const INITIAL_CANDIDATES: Candidate[] = [
  {
    rank: '1º',
    name: 'FLAVIO BOLSONARO',
    party: 'PL',
    number: 'Nº 22',
    vice: 'Alfredo Gaspar',
    percentage: 49.58,
    votes: '37.566.895 votos',
    diffPercent: '▼ 0,62 p.p.',
    trend: 'down',
    color: '#c4161c',
    avatarBg: 'bg-[#b8141b]',
    avatarText: 'FB',
    trophyType: 'gold'
  },
  {
    rank: '2º',
    name: 'LULA',
    party: 'PT',
    number: 'Nº 13',
    vice: 'Geraldo Alckmin',
    percentage: 42.25,
    votes: '32.007.853 votos',
    diffPercent: '▲ 0,62 p.p.',
    trend: 'up',
    color: '#0052cc',
    avatarBg: 'bg-[#0052cc]',
    avatarText: 'LA',
    trophyType: 'silver'
  },
  {
    rank: '3º',
    name: 'ESCRITOR AUGUSTO CURY',
    party: 'AVANTE',
    number: 'Nº 70',
    vice: 'Júlio Delgado',
    percentage: 2.97,
    votes: '2.247.926 votos',
    diffPercent: '▲ 0,01 p.p.',
    trend: 'up',
    color: '#491079',
    avatarBg: 'bg-[#491079]',
    avatarText: 'AC',
    trophyType: 'bronze'
  },
  {
    rank: '4º',
    name: 'RONALDO CAIADO',
    party: 'PSD',
    number: 'Nº 55',
    vice: 'Gilberto Kassab',
    percentage: 2.34,
    votes: '1.774.893 votos',
    diffPercent: '▼ 0,04 p.p.',
    trend: 'down',
    color: '#00875a',
    avatarBg: 'bg-[#00875a]',
    avatarText: 'RC',
    trophyType: 'pewter'
  },
  {
    rank: '5º',
    name: 'RENAN SANTOS',
    party: 'MISSÃO',
    number: 'Nº 14',
    vice: 'Coronel Medina',
    percentage: 2.34,
    votes: '1.772.742 votos',
    diffPercent: '▲ 0,03 p.p.',
    trend: 'up',
    color: '#d41a22',
    avatarBg: 'bg-[#d41a22]',
    avatarText: 'RS',
    trophyType: 'pewter'
  }
];

const STATES = [
  'BR', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO', 'ZZ'
];

interface MainDashboardProps {
  onNavigate?: (tabId: string) => void;
}

export default function MainDashboard({ onNavigate }: MainDashboardProps) {
  const [selectedState, setSelectedState] = useState('BR');
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [activeFilter, setActiveFilter] = useState<'geral' | 'estado' | 'regiao'>('geral');
  const [selectedMonth, setSelectedMonth] = useState('Outubro 2025');

  const apuradoPercent = 64.81;
  const apuradoSecoes = '323.539';
  const totalSecoes = '499.248';
  const diferencaVotos = '5.559.042';
  const diferencaPp = '7,33';

  const handleStateClick = (state: string) => {
    setSelectedState(state);
    if (state === 'BR') {
      setCandidates(INITIAL_CANDIDATES);
    } else {
      const hash = state.charCodeAt(0) + state.charCodeAt(1);
      const shift = (hash % 8) - 4;
      setCandidates(INITIAL_CANDIDATES.map((c, i) => {
        const factor = i === 0 ? shift : -shift * 0.7;
        const newPct = Math.max(1, Math.min(90, +(c.percentage + factor).toFixed(2)));
        return { ...c, percentage: newPct };
      }));
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col gap-4 p-4 sm:p-6 bg-gradient-to-b from-[#f7f2ea] to-[#f4eee5] text-[#1a1614] select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. SEGUNDA FAIXA: FILTROS HORIZONTAIS DE ESTADOS (MARFIM + BR VERMELHO)    */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#fbf8f3] rounded-2xl p-2 border border-[#e8ded2] shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {STATES.map((uf) => {
          const isSelected = selectedState === uf;
          return (
            <button
              key={uf}
              onClick={() => handleStateClick(uf)}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1 leading-none ${
                isSelected
                  ? 'bg-gradient-to-r from-[#c4161c] to-[#910d14] text-white shadow-[0_3px_10px_rgba(196,22,28,0.35)] scale-105 border border-white/20'
                  : 'bg-white text-[#57493d] hover:text-[#c4161c] hover:bg-[#fffbf5] border border-[#e8dfd3]'
              }`}
            >
              {uf === 'BR' && <span className="text-sm leading-none">🇧🇷</span>}
              <span>{uf}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP ROW: HERO TRUCK 3 CORAÇÕES BANNER (68%) + SEÇÕES APURADAS (32%)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* Banner Caminhão Vermelho 3 Corações (Col 8) */}
        <div className="lg:col-span-8 bg-gradient-to-r from-[#910c14] via-[#c4161c] to-[#730810] rounded-2xl overflow-hidden shadow-md border border-[#e8ded2] relative flex flex-col md:flex-row items-center justify-between p-5 min-h-[155px]">
          {/* Imagem de Fundo com Blend Suave */}
          <img 
            src={redConvoyTruck} 
            alt="Frota 3 Corações" 
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-overlay opacity-40 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#800a11]/90 via-[#c4161c]/70 to-[#61070e]/90 pointer-events-none" />

          {/* Texto Oficial 3 Corações */}
          <div className="relative z-10 flex flex-col text-left max-w-md">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ffd54f] drop-shadow-xs">
              JUNTOS EM TODAS AS ROTAS
            </span>
            <h2 className="text-[22px] sm:text-[28px] font-black text-white uppercase tracking-tight leading-none mt-1 drop-shadow-sm font-heading">
              BRASIL
            </h2>
            <p className="text-[13px] sm:text-[14px] font-serif italic text-white/95 mt-1 font-medium leading-snug">
              Juntos, entregamos mais que café, entregamos confiança e proteção...
            </p>
          </div>

          {/* Caminhão Miniatura Decorativo / Selo 3C */}
          <div className="relative z-10 shrink-0 mt-3 md:mt-0 flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
              <span className="text-[#c4161c] font-black text-xs">3C</span>
            </div>
            <div className="text-left text-white leading-none">
              <span className="text-[8px] font-bold uppercase tracking-wider block opacity-80">GRUPO</span>
              <span className="text-[14px] font-black tracking-tight block">3CORAÇÕES</span>
            </div>
          </div>
        </div>

        {/* Card Seções Apuradas com Gráfico Circular (Col 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#e8ded2] shadow-xs flex items-center justify-between">
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] font-black text-[#57493d] uppercase tracking-wider">
                SEÇÕES APURADAS
              </span>
              <span className="text-[10px] font-extrabold text-[#c4161c] bg-[#fae8e9] px-1.5 py-0.5 rounded-md">
                (+17,55 P.P.)
              </span>
            </div>
            <span className="text-[38px] font-black text-[#1a1614] tracking-tight block leading-none font-heading">
              {apuradoPercent.toString().replace('.', ',')}%
            </span>
            <span className="text-[11px] font-bold text-[#73675a] mt-1.5 block">
              <strong className="text-[#1a1614]">{apuradoSecoes}</strong> de {totalSecoes} seções
            </span>
          </div>

          {/* Gauge Circular 3D em Vermelho e Marfim */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f0e9df" strokeWidth="11" />
              <circle 
                cx="50" 
                cy="50" 
                r="38" 
                fill="none" 
                stroke="url(#redDonutGrad)" 
                strokeWidth="11" 
                strokeDasharray="238.7" 
                strokeDashoffset={238.7 * (1 - apuradoPercent / 100)} 
                strokeLinecap="round" 
              />
              <defs>
                <linearGradient id="redDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5222a" />
                  <stop offset="100%" stopColor="#910d14" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[11px] font-black text-[#c4161c]">64,8%</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: RANKING NACIONAL (68%) + DIFERENÇA E VOTOS (32%)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* Card Ranking Nacional de Resultados (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-[#e8ded2] shadow-xs flex flex-col justify-between">
          
          {/* Header do Ranking com Filtro e Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f0e8dd] gap-3">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#dfb15b] to-[#b88628] flex items-center justify-center text-white shadow-sm">
                <Trophy size={18} />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-[#1a1614] tracking-tight uppercase leading-none font-heading">
                  RANKING NACIONAL
                </h3>
                <span className="text-[9.5px] font-bold text-[#8a7c6e] uppercase tracking-wider block mt-0.5">
                  DE RESULTADOS | VOTAÇÃO EM TEMPO REAL
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dropdown Outubro 2025 */}
              <div className="bg-[#fbf8f3] border border-[#e8ded2] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-[#42382f]">
                <CalendarIcon size={13} className="text-[#c4161c]" />
                <span>{selectedMonth}</span>
                <ChevronDown size={13} className="text-stone-400" />
              </div>

              {/* Segmented Control Geral / Estado / Região */}
              <div className="bg-[#f4ece0] p-1 rounded-full border border-[#e8ded2] flex items-center gap-1">
                <button
                  onClick={() => setActiveFilter('geral')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    activeFilter === 'geral'
                      ? 'bg-gradient-to-r from-[#c4161c] to-[#910d14] text-white shadow-xs'
                      : 'text-[#57493d] hover:text-[#c4161c]'
                  }`}
                >
                  Geral
                </button>
                <button
                  onClick={() => setActiveFilter('estado')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    activeFilter === 'estado'
                      ? 'bg-gradient-to-r from-[#c4161c] to-[#910d14] text-white shadow-xs'
                      : 'text-[#57493d] hover:text-[#c4161c]'
                  }`}
                >
                  Por Estado
                </button>
                <button
                  onClick={() => setActiveFilter('regiao')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    activeFilter === 'regiao'
                      ? 'bg-gradient-to-r from-[#c4161c] to-[#910d14] text-white shadow-xs'
                      : 'text-[#57493d] hover:text-[#c4161c]'
                  }`}
                >
                  Por Região
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Candidatos (1º a 5º Lugar) com Medalhas 3D e Barras de Progresso */}
          <div className="flex flex-col divide-y divide-[#f5eee4] my-2">
            {candidates.map((cand) => {
              const is1st = cand.rank === '1º';
              const is2nd = cand.rank === '2º';
              const is3rd = cand.rank === '3º';

              return (
                <div key={cand.rank} className="py-2.5 flex items-center justify-between gap-3 text-left">
                  
                  {/* Left: Medalha + Avatar + Nome + Vice */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    {/* Medalha 3D */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm shrink-0 ${
                      is1st
                        ? 'bg-gradient-to-br from-[#ffd54f] via-[#ffb300] to-[#ff8f00] text-[#5c3c00] border-2 border-white'
                        : is2nd
                        ? 'bg-gradient-to-br from-[#e0e0e0] via-[#bdbdbd] to-[#9e9e9e] text-[#2c2c2c] border-2 border-white'
                        : is3rd
                        ? 'bg-gradient-to-br from-[#d7ccc8] via-[#bcaaa4] to-[#8d6e63] text-[#3e2723] border-2 border-white'
                        : 'bg-gradient-to-br from-[#cfd8dc] to-[#90a4ae] text-[#263238]'
                    }`}>
                      {cand.rank}
                    </div>

                    {/* Avatar Redondo com Iniciais */}
                    <div className={`w-9 h-9 rounded-full ${cand.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}>
                      {cand.avatarText}
                    </div>

                    {/* Informações do Candidato */}
                    <div className="leading-tight">
                      <strong className="text-[12px] font-black text-[#1a1614] block tracking-tight">
                        {cand.name}
                      </strong>
                      <span className="text-[9.5px] font-semibold text-[#8a7c6e] block mt-0.5">
                        {cand.party} · {cand.number} · Vice: {cand.vice}
                      </span>
                    </div>
                  </div>

                  {/* Center: Barra de Progresso Vermelha */}
                  <div className="flex-1 max-w-[240px] hidden md:block">
                    <div className="w-full bg-[#f2e9dc] rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          is1st 
                            ? 'bg-gradient-to-r from-[#e5222a] to-[#910d14]'
                            : is2nd
                            ? 'bg-gradient-to-r from-[#0066ff] to-[#003d99]'
                            : 'bg-[#a89a8a]'
                        }`}
                        style={{ width: `${cand.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Percentual + Votos + Variação + Troféu */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right leading-none">
                      <span className="text-[17px] font-black text-[#1a1614] tracking-tight block">
                        {cand.percentage.toString().replace('.', ',')}%
                      </span>
                      <span className="text-[9px] font-semibold text-[#8a7c6e] block mt-1">
                        {cand.votes}
                      </span>
                      <span className={`text-[8.5px] font-black block mt-0.5 ${cand.trend === 'up' ? 'text-[#15803d]' : 'text-[#c4161c]'}`}>
                        {cand.diffPercent}
                      </span>
                    </div>

                    {/* Ícone de Troféu 3D */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs ${
                      is1st ? 'bg-[#fff5d9] text-[#b88628]' : is2nd ? 'bg-[#f0f4f8] text-[#5a738e]' : is3rd ? 'bg-[#faefe9] text-[#8d6e63]' : 'bg-[#f5f1eb] text-stone-400'
                    }`}>
                      <Trophy size={16} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Coluna Direita: Diferença 1ºx2º + Quadro de Votos (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Card Vermelho: DIFERENÇA 1º X 2º */}
          <div className="bg-gradient-to-br from-[#910c14] via-[#b8141c] to-[#6e070e] rounded-2xl p-5 text-white shadow-md border border-[#e8ded2] relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ffd54f]">
                DIFERENÇA 1º X 2º
              </span>
              <span className="text-[8px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                BRASIL
              </span>
            </div>

            <div className="relative z-10 my-3 text-left">
              <span className="text-[34px] font-black tracking-tight block leading-none font-heading text-white drop-shadow-xs">
                {diferencaVotos} <small className="text-sm font-semibold opacity-90">votos</small>
              </span>
              <span className="text-[12px] font-bold text-white/90 mt-1 block">
                {diferencaPp} pontos percentuais
              </span>
            </div>

            {/* Gráfico 3D de Barras Subindo Decorativo */}
            <div className="relative z-10 flex items-end gap-1.5 h-10 mt-1 opacity-90">
              <div className="flex-1 bg-white/30 rounded-t-sm h-3" />
              <div className="flex-1 bg-white/40 rounded-t-sm h-5" />
              <div className="flex-1 bg-white/50 rounded-t-sm h-7" />
              <div className="flex-1 bg-white/70 rounded-t-sm h-8" />
              <div className="flex-1 bg-gradient-to-t from-white/80 to-[#ffd54f] rounded-t-sm h-10" />
            </div>
          </div>

          {/* Card Quadro de Votos */}
          <div className="bg-white rounded-2xl p-4 border border-[#e8ded2] shadow-xs flex-1 flex flex-col justify-between text-left">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f2e9dc]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c4161c]" />
              <span className="text-[11px] font-black text-[#1a1614] uppercase tracking-wider">
                VOTOS
              </span>
            </div>

            <div className="flex flex-col divide-y divide-[#f7f0e6] my-1 text-xs">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#73675a] font-medium">Válidos</span>
                <span className="font-mono font-bold text-[#1a1614]">75.762.826 <small className="text-[#a8141d]">(95,43%)</small></span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#73675a] font-medium">Brancos</span>
                <span className="font-mono font-bold text-[#1a1614]">1.430.294 <small className="text-[#8a7c6e]">(1,80%)</small></span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#73675a] font-medium">Nulos</span>
                <span className="font-mono font-bold text-[#1a1614]">2.201.540 <small className="text-[#8a7c6e]">(2,77%)</small></span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#73675a] font-medium">Comparecimento</span>
                <span className="font-mono font-bold text-[#1a1614]">79.394.660 <small className="text-[#15803d]">(79,08%)</small></span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#73675a] font-medium">Abstenção</span>
                <span className="font-mono font-bold text-[#1a1614]">21.004.387 <small className="text-[#8a7c6e]">(20,92%)</small></span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW: BANNER CAFÉ + KPIS 3D + BANNER ROTAS                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* Banner Café que Conecta Pessoas (Col 3) */}
        <div className="lg:col-span-3 bg-gradient-to-r from-[#590a10] via-[#850d14] to-[#c4161c] rounded-2xl p-4 text-white shadow-xs border border-[#e8ded2] relative overflow-hidden flex items-center gap-3">
          <img 
            src={latteCupBeans} 
            alt="Café 3 Corações" 
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/20 shadow-md"
          />
          <div className="text-left leading-tight">
            <span className="text-[13px] font-serif italic text-[#ffd54f] block font-bold">
              Café que conecta pessoas.
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/80 block mt-1">
              3CORAÇÕES
            </span>
          </div>
        </div>

        {/* KPI 1: Total de Seções 499.248 (Col 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-3.5 border border-[#e8ded2] shadow-xs flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#fae8e9] text-[#c4161c] flex items-center justify-center shrink-0">
            <Box size={20} />
          </div>
          <div className="leading-tight">
            <span className="text-[8.5px] font-bold uppercase text-[#8a7c6e] block">
              Total de Seções
            </span>
            <span className="text-[16px] font-black text-[#1a1614] block mt-0.5">
              499.248
            </span>
            <span className="text-[7.5px] font-medium text-[#c4161c] block mt-0.5">
              100% do Brasil
            </span>
          </div>
        </div>

        {/* KPI 2: Votação Apurada 64,81% (Col 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-3.5 border border-[#e8ded2] shadow-xs flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#fae8e9] text-[#c4161c] flex items-center justify-center shrink-0">
            <PieIcon size={20} />
          </div>
          <div className="leading-tight">
            <span className="text-[8.5px] font-bold uppercase text-[#8a7c6e] block">
              Votação Apurada
            </span>
            <span className="text-[16px] font-black text-[#1a1614] block mt-0.5">
              64,81%
            </span>
            <span className="text-[7.5px] font-medium text-[#8a7c6e] block mt-0.5">
              323.539 de 499.248
            </span>
          </div>
        </div>

        {/* KPI 3: Total de Votos 79.394.660 (Col 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-3.5 border border-[#e8ded2] shadow-xs flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#fae8e9] text-[#c4161c] flex items-center justify-center shrink-0">
            <Users2 size={20} />
          </div>
          <div className="leading-tight">
            <span className="text-[8.5px] font-bold uppercase text-[#8a7c6e] block">
              Total de Votos
            </span>
            <span className="text-[16px] font-black text-[#1a1614] block mt-0.5">
              79.394.660
            </span>
            <span className="text-[7.5px] font-medium text-[#15803d] block mt-0.5">
              Comparecimento
            </span>
          </div>
        </div>

        {/* Banner Juntos em Todas as Rotas (Col 3) */}
        <div className="lg:col-span-3 bg-gradient-to-r from-[#7a0c16] to-[#b8141c] rounded-2xl p-4 text-white shadow-xs border border-[#e8ded2] relative overflow-hidden flex items-center justify-between">
          <img 
            src={roadBanner} 
            alt="Rotas 3C" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 pointer-events-none"
          />
          <div className="relative z-10 text-left leading-tight">
            <span className="text-[14px] font-serif italic text-white block font-bold">
              Juntos em todas as rotas.
            </span>
            <span className="text-[8.5px] font-bold uppercase tracking-widest text-[#ffd54f] block mt-1">
              LOGÍSTICA & SEGUROS
            </span>
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
            ♥
          </div>
        </div>

      </div>

    </div>
  );
}
