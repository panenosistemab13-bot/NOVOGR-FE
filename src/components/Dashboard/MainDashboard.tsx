import React, { useState } from 'react';
import { 
  Trophy, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Truck, 
  User, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  PieChart as PieIcon, 
  Users2, 
  Scale, 
  ArrowUpRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Imagens de alta fidelidade
import heroConvoyCity from '../../assets/images/hero_convoy_3c_1791473865922.jpg';
import goldPodiumImg from '../../assets/images/gold_trophy_podium_1791473848875.jpg';
import brazilGoldMapImg from '../../assets/images/brazil_map_gold_1791473887938.jpg';

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
    votes: '37.568.895 votos',
    diffPercent: '▲ 0,62 p.p.',
    trend: 'up',
    color: '#e5c27a',
    avatarBg: 'bg-[#1e2329]',
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
    diffPercent: '▼ 0,62 p.p.',
    trend: 'down',
    color: '#38bdf8',
    avatarBg: 'bg-[#0284c7]',
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
    color: '#a8a29e',
    avatarBg: 'bg-[#78350f]',
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
    color: '#10b981',
    avatarBg: 'bg-[#065f46]',
    avatarText: 'RG',
    trophyType: 'pewter'
  }
];

const STATES = [
  'BR', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
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
    <div className="w-full min-h-full flex flex-col gap-4 p-4 sm:p-6 text-white select-none font-sans relative">
      
      {/* ========================================================================= */}
      {/* 1. TOP ROW: HERO CARGA 3 CORAÇÕES (68%) + SEÇÕES APURADAS (32%)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* Banner Cinematográfico 3 Corações (Col 8) */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-[rgba(201,151,62,0.22)] relative flex flex-col md:flex-row items-center justify-between p-6 min-h-[175px] group">
          {/* Imagem de Fundo Rodovia ao Entardecer com Caminhão */}
          <img 
            src={heroConvoyCity} 
            alt="Caminhão 3 Corações Rodovia" 
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 pointer-events-none"
          />
          {/* Overlays sutis para manter legibilidade máxima e cinematografia */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080a0c]/90 via-[#080a0c]/55 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0c]/80 via-transparent to-black/30 pointer-events-none" />
          {/* Rim light superior dourado */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#e5c27a]/60 to-transparent pointer-events-none" />

          {/* Texto Oficial: CENTRAL GR / JUNTOS EM TODAS AS ROTAS */}
          <div className="relative z-10 flex flex-col text-left max-w-xl">
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#e5c27a] bg-[#0d1012]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#c9973e]/40 shadow-sm flex items-center gap-1.5">
                <span>CENTRAL GR</span>
                <span className="text-white text-xs">➔</span>
              </span>
            </div>

            <h1 className="text-[26px] sm:text-[34px] font-black text-white uppercase tracking-tight leading-[1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              JUNTOS EM TODAS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4f0e8] via-[#e5c27a] to-[#c9973e]">
                AS ROTAS
              </span>
            </h1>

            <p className="text-[12px] sm:text-[13px] text-[#f4f0e8]/90 mt-2 font-medium leading-relaxed drop-shadow-md max-w-md">
              Mais controle, mais segurança, mais resultados para o seu negócio.
            </p>
          </div>

          {/* Badge Grupo 3 Corações - Paixão por cada entrega */}
          <div className="relative z-10 shrink-0 mt-4 md:mt-0 flex flex-col items-center justify-center bg-[#0d1012]/85 backdrop-blur-md px-5 py-3 rounded-2xl border border-[rgba(201,151,62,0.3)] shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="text-[#d41a22] font-black text-xs leading-none">3C</span>
              </div>
              <div className="text-left text-white leading-none">
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#a8a39a] block">GRUPO</span>
                <span className="text-[13px] font-black tracking-tight block">3CORAÇÕES</span>
              </div>
            </div>
            <span className="text-[11px] font-serif italic text-[#e5c27a] mt-1 font-semibold tracking-wide">
              Paixão por cada entrega
            </span>
          </div>
        </div>

        {/* Card Seções Apuradas com Gráfico Circular (Col 4) */}
        <div className="lg:col-span-4 bg-[#131619]/95 backdrop-blur-md rounded-2xl p-5 border border-[rgba(201,151,62,0.22)] shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col text-left leading-tight z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black text-[#d8d3c8] uppercase tracking-wider">
                SEÇÕES APURADAS
              </span>
              <span className="text-[10px] font-extrabold text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <span>↑</span> (+17,55 P.P.)
              </span>
            </div>
            <span className="text-[40px] font-black text-white tracking-tight block leading-none font-sans drop-shadow-sm">
              {apuradoPercent.toString().replace('.', ',')}%
            </span>
            <span className="text-[11px] font-semibold text-[#a8a39a] mt-2 block">
              <strong className="text-white font-mono font-bold">{apuradoSecoes}</strong> de <span className="font-mono">{totalSecoes}</span> seções
            </span>
          </div>

          {/* Gauge Circular Dourado Tecnológico */}
          <div className="relative w-26 h-26 shrink-0 flex items-center justify-center z-10">
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_12px_rgba(201,151,62,0.25)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#232628" strokeWidth="10" />
              <circle 
                cx="50" 
                cy="50" 
                r="38" 
                fill="none" 
                stroke="url(#goldDonutGrad)" 
                strokeWidth="10" 
                strokeDasharray="238.7" 
                strokeDashoffset={238.7 * (1 - apuradoPercent / 100)} 
                strokeLinecap="round" 
              />
              <defs>
                <linearGradient id="goldDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5c27a" />
                  <stop offset="50%" stopColor="#d9ad5a" />
                  <stop offset="100%" stopColor="#b77a25" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[12px] font-black text-[#e5c27a] font-mono">64,8%</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. KPI BAR: 5 CARDS HORIZONTAIS COM CÍRCULOS METÁLICOS 3D DOURADOS        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
        
        {/* KPI 1: TOTAL DE VEÍCULOS */}
        <div className="bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border border-[rgba(201,151,62,0.2)] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] text-[#080a0c] flex items-center justify-center shrink-0 border border-[#fff5db]/50 shadow-[0_0_15px_rgba(201,151,62,0.3)]">
            <Truck size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#a8a39a] block">
              TOTAL DE VEÍCULOS
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              328
            </span>
            <span className="text-[9px] font-bold text-[#10b981] block mt-0.5">
              ↑ +12% <span className="text-[#a8a39a] font-normal">vs. mês anterior</span>
            </span>
          </div>
        </div>

        {/* KPI 2: MOTORISTAS ATIVOS */}
        <div className="bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border border-[rgba(201,151,62,0.2)] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] text-[#080a0c] flex items-center justify-center shrink-0 border border-[#fff5db]/50 shadow-[0_0_15px_rgba(201,151,62,0.3)]">
            <User size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#a8a39a] block">
              MOTORISTAS ATIVOS
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              412
            </span>
            <span className="text-[9px] font-bold text-[#10b981] block mt-0.5">
              ↑ +8% <span className="text-[#a8a39a] font-normal">vs. mês anterior</span>
            </span>
          </div>
        </div>

        {/* KPI 3: EM ROTA */}
        <div className="bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border border-[rgba(201,151,62,0.2)] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] text-[#080a0c] flex items-center justify-center shrink-0 border border-[#fff5db]/50 shadow-[0_0_15px_rgba(201,151,62,0.3)]">
            <MapPin size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#a8a39a] block">
              EM ROTA
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              287
            </span>
            <span className="text-[9px] font-bold text-[#38bdf8] block mt-0.5">
              ↑ 87,5% <span className="text-[#a8a39a] font-normal">da frota</span>
            </span>
          </div>
        </div>

        {/* KPI 4: EM ALERTA (Destaque Vermelho Controlado) */}
        <div className="bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border border-[rgba(239,68,68,0.25)] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ef4444] to-[#991b1b] text-white flex items-center justify-center shrink-0 border border-red-300/40 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
            <AlertTriangle size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#ef4444] block">
              EM ALERTA
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              18
            </span>
            <span className="text-[9px] font-bold text-[#ef4444] block mt-0.5">
              ↑ 5,5% <span className="text-[#a8a39a] font-normal">da frota</span>
            </span>
          </div>
        </div>

        {/* KPI 5: DISPONÍVEIS NO PÁTIO */}
        <div className="bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border border-[rgba(201,151,62,0.2)] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e5c27a] via-[#c9973e] to-[#b77a25] text-[#080a0c] flex items-center justify-center shrink-0 border border-[#fff5db]/50 shadow-[0_0_15px_rgba(201,151,62,0.3)]">
            <Shield size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#a8a39a] block">
              DISPONÍVEIS NO PÁTIO
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              37
            </span>
            <span className="text-[9px] font-bold text-[#10b981] block mt-0.5">
              ↑ 11,3% <span className="text-[#a8a39a] font-normal">da frota</span>
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: RANKING NACIONAL + BRASIL CONECTADO + DIFERENÇA E VOTOS    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* BLOCO 1: RANKING NACIONAL (Col 5) */}
        <div className="lg:col-span-5 bg-[#131619]/95 backdrop-blur-md rounded-2xl p-5 border border-[rgba(201,151,62,0.22)] shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex flex-col justify-between">
          
          {/* Header do Ranking */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[rgba(201,151,62,0.18)] gap-3">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e5c27a] to-[#b77a25] flex items-center justify-center text-[#080a0c] shadow-sm">
                <Trophy size={18} />
              </div>
              <div>
                <h3 className="text-[13px] font-black text-white tracking-tight uppercase leading-none font-sans">
                  RANKING NACIONAL
                </h3>
                <span className="text-[8.5px] font-bold text-[#a8a39a] uppercase tracking-wider block mt-1">
                  DE RESULTADOS | VOTAÇÃO EM TEMPO REAL
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dropdown Outubro 2025 */}
              <div className="bg-[#171a1c] border border-[rgba(201,151,62,0.25)] rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-bold text-[#f4f0e8]">
                <CalendarIcon size={12} className="text-[#e5c27a]" />
                <span>{selectedMonth}</span>
                <ChevronDown size={12} className="text-[#a8a39a]" />
              </div>

              {/* Segmented Control: Geral / Por Estado / Por Região */}
              <div className="bg-[#171a1c] p-0.5 rounded-full border border-[rgba(201,151,62,0.25)] flex items-center gap-0.5">
                <button
                  onClick={() => setActiveFilter('geral')}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer",
                    activeFilter === 'geral'
                      ? "bg-gradient-to-r from-[#e5c27a] to-[#b77a25] text-[#080a0c] shadow-xs"
                      : "text-[#a8a39a] hover:text-white"
                  )}
                >
                  Geral
                </button>
                <button
                  onClick={() => setActiveFilter('estado')}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer",
                    activeFilter === 'estado'
                      ? "bg-gradient-to-r from-[#e5c27a] to-[#b77a25] text-[#080a0c] shadow-xs"
                      : "text-[#a8a39a] hover:text-white"
                  )}
                >
                  Por Estado
                </button>
                <button
                  onClick={() => setActiveFilter('regiao')}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer",
                    activeFilter === 'regiao'
                      ? "bg-gradient-to-r from-[#e5c27a] to-[#b77a25] text-[#080a0c] shadow-xs"
                      : "text-[#a8a39a] hover:text-white"
                  )}
                >
                  Por Região
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Posições (1º ao 4º Lugar) */}
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.06)] my-2">
            {candidates.map((cand) => {
              const is1st = cand.rank === '1º';
              const is2nd = cand.rank === '2º';
              const is3rd = cand.rank === '3º';
              const is4th = cand.rank === '4º';

              return (
                <div key={cand.rank} className="py-2.5 flex items-center justify-between gap-3 text-left">
                  
                  {/* Left: Medalha 3D + Avatar + Nome */}
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    {/* Medalha 3D Metálica */}
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] shadow-sm shrink-0 border",
                      is1st && "bg-gradient-to-br from-[#ffd54f] via-[#ffb300] to-[#ff8f00] text-[#080a0c] border-[#fff5db]",
                      is2nd && "bg-gradient-to-br from-[#e0e0e0] via-[#bdbdbd] to-[#9e9e9e] text-[#121517] border-white/80",
                      is3rd && "bg-gradient-to-br from-[#d7ccc8] via-[#bcaaa4] to-[#8d6e63] text-white border-white/60",
                      is4th && "bg-gradient-to-br from-[#34d399] to-[#059669] text-white border-emerald-300/60"
                    )}>
                      {cand.rank}
                    </div>

                    {/* Avatar Redondo */}
                    <div className={cn("w-8 h-8 rounded-full text-white font-black text-[11px] flex items-center justify-center shadow-xs shrink-0 border border-white/20", cand.avatarBg)}>
                      {cand.avatarText}
                    </div>

                    {/* Informações */}
                    <div className="leading-tight">
                      <strong className="text-[11.5px] font-black text-white block tracking-tight">
                        {cand.name}
                      </strong>
                      <span className="text-[9px] font-semibold text-[#a8a39a] block mt-0.5">
                        {cand.party} · {cand.number} · Vice: {cand.vice}
                      </span>
                    </div>
                  </div>

                  {/* Center: Barra de Progresso Estilizada */}
                  <div className="flex-1 max-w-[140px] hidden sm:block">
                    <div className="w-full bg-[#232628] rounded-full h-2 overflow-hidden border border-white/5">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          is1st && "bg-gradient-to-r from-[#e5c27a] to-[#c9973e] shadow-[0_0_8px_rgba(201,151,62,0.4)]",
                          is2nd && "bg-gradient-to-r from-[#38bdf8] to-[#0284c7] shadow-[0_0_8px_rgba(56,189,248,0.4)]",
                          is3rd && "bg-gradient-to-r from-[#d6d3d1] to-[#78716c]",
                          is4th && "bg-gradient-to-r from-[#34d399] to-[#059669]"
                        )}
                        style={{ width: `${cand.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Percentual + Votos + Troféu */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right leading-none">
                      <span className="text-[15px] font-black text-white tracking-tight block font-mono">
                        {cand.percentage.toString().replace('.', ',')}%
                      </span>
                      <span className="text-[8.5px] font-semibold text-[#a8a39a] block mt-1 font-mono">
                        {cand.votes}
                      </span>
                    </div>

                    {/* Ícone de Troféu / Usuário */}
                    <div className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center border shadow-xs",
                      is1st ? "bg-[#c9973e]/20 text-[#e5c27a] border-[#c9973e]/40" : "bg-white/5 text-[#a8a39a] border-white/10"
                    )}>
                      {is1st ? <Trophy size={14} /> : <User size={14} />}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Filtro Rápido de Estados */}
          <div className="w-full pt-2 border-t border-[rgba(201,151,62,0.18)] flex items-center gap-1 overflow-x-auto scrollbar-none">
            {STATES.map((uf) => {
              const isSelected = selectedState === uf;
              return (
                <button
                  key={uf}
                  onClick={() => handleStateClick(uf)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black transition-all cursor-pointer shrink-0 leading-none",
                    isSelected
                      ? "bg-gradient-to-r from-[#e5c27a] to-[#b77a25] text-[#080a0c] shadow-xs"
                      : "bg-[#171a1c] text-[#a8a39a] hover:text-white hover:bg-[#232628] border border-[rgba(201,151,62,0.15)]"
                  )}
                >
                  {uf === 'BR' && <span className="mr-0.5">🇧🇷</span>}
                  {uf}
                </button>
              );
            })}
          </div>

        </div>

        {/* BLOCO 2: MAPA 3D "BRASIL CONECTADO" (Col 4) */}
        <div className="lg:col-span-4 bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border border-[rgba(201,151,62,0.22)] shadow-[0_16px_40px_rgba(0,0,0,0.65)] relative overflow-hidden flex flex-col justify-between group">
          {/* Imagem de Fundo do Mapa Relevo Satélite com Rotas Douradas */}
          <img 
            src={brazilGoldMapImg} 
            alt="Brasil Conectado Rotas Douradas" 
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0c]/90 via-transparent to-black/20 pointer-events-none" />

          {/* Top Label */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-[#e5c27a] bg-[#0d1012]/80 px-2 py-0.5 rounded-full border border-[#c9973e]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              TELEMETRIA OPERACIONAL 3C
            </span>
          </div>

          {/* Badge Inferior "BRASIL CONECTADO" */}
          <div className="relative z-10 bg-[#0d1012]/85 backdrop-blur-md p-3.5 rounded-xl border border-[rgba(201,151,62,0.3)] shadow-[0_8px_20px_rgba(0,0,0,0.8)] text-left max-w-[240px]">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-[#e5c27a] text-[#080a0c] flex items-center justify-center">
                <MapPin size={12} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
                BRASIL
              </span>
            </div>
            <h4 className="text-[13px] font-black text-[#e5c27a] uppercase tracking-tight leading-none mb-1">
              CONECTADO
            </h4>
            <p className="text-[9.5px] text-[#f4f0e8]/80 font-medium leading-tight">
              Cada rota importa. <br /> Cada entrega conta.
            </p>
          </div>
        </div>

        {/* BLOCO 3: DIFERENÇA 1º X 2º + QUADRO DE VOTOS (Col 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Card Superior: DIFERENÇA 1º X 2º com Pódio Dourado 3D */}
          <div className="bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-[rgba(201,151,62,0.22)] relative overflow-hidden flex flex-col justify-between min-h-[175px]">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#c9973e]/30 flex items-center justify-center text-[#e5c27a]">
                  <Scale size={10} />
                </div>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-[#e5c27a]">
                  DIFERENÇA 1º X 2º
                </span>
              </div>
              <span className="text-[8px] font-bold uppercase bg-[#c9973e]/20 text-[#e5c27a] border border-[#c9973e]/40 px-2 py-0.5 rounded-full">
                BRASIL
              </span>
            </div>

            <div className="relative z-10 my-2 text-left">
              <span className="text-[26px] font-black tracking-tight block leading-none font-mono text-white">
                {diferencaVotos} <small className="text-xs font-semibold text-[#a8a39a]">votos</small>
              </span>
              <span className="text-[11px] font-bold text-[#e5c27a] mt-1 block">
                {diferencaPp} pontos percentuais
              </span>
            </div>

            {/* Imagem Pódio Dourado 3D com Troféu e Louros */}
            <div className="relative z-10 w-full h-24 rounded-xl overflow-hidden border border-[rgba(201,151,62,0.2)] shadow-inner group">
              <img 
                src={goldPodiumImg} 
                alt="Pódio Dourado 3D com Troféu" 
                className="w-full h-full object-cover object-bottom group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080a0c]/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Card Inferior: Quadro de VOTOS */}
          <div className="bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border border-[rgba(201,151,62,0.22)] shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex-1 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(201,151,62,0.18)]">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-[#e5c27a]" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  VOTOS
                </span>
              </div>
              <span className="text-[9.5px] font-bold text-[#e5c27a] hover:underline cursor-pointer flex items-center gap-1">
                Ver todos ➔
              </span>
            </div>

            <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.06)] my-1 text-xs">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#a8a39a] font-medium text-[11px]">Válidos</span>
                <span className="font-mono font-bold text-white text-[11.5px]">
                  75.762.826 <small className="text-[#10b981] font-semibold">(95,43%)</small>
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#a8a39a] font-medium text-[11px]">Brancos</span>
                <span className="font-mono font-bold text-white text-[11.5px]">
                  1.430.294 <small className="text-[#a8a39a] font-semibold">(1,80%)</small>
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#a8a39a] font-medium text-[11px]">Nulos</span>
                <span className="font-mono font-bold text-white text-[11.5px]">
                  2.921.760 <small className="text-[#a8a39a] font-semibold">(2,77%)</small>
                </span>
              </div>
            </div>

            {/* Rodapé do Card Votos com Ícones Dourados */}
            <div className="pt-2 border-t border-[rgba(201,151,62,0.18)] flex items-center justify-between text-[9.5px] text-[#a8a39a]">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#c9973e]/20 text-[#e5c27a] flex items-center justify-center">
                  <Users2 size={11} />
                </div>
                <div>
                  <span className="block text-[7.5px] uppercase font-bold text-[#a8a39a]">Total de votos</span>
                  <strong className="text-white font-mono text-[10px]">80.115.880</strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#c9973e]/20 text-[#e5c27a] flex items-center justify-center">
                  <PieIcon size={11} />
                </div>
                <div>
                  <span className="block text-[7.5px] uppercase font-bold text-[#a8a39a]">Seções apuradas</span>
                  <strong className="text-white font-mono text-[10px]">323.539</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
