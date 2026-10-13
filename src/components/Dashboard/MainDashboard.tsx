import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Package, 
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Search,
  ExternalLink,
  ShieldCheck,
  Radio,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { rtdb as db } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { IscaItem } from '../Iscas';

// Imagens de alta fidelidade
import heroConvoyCity from '../../assets/images/hero_convoy_3c_1791473865922.jpg';
import goldPodiumImg from '../../assets/images/gold_trophy_podium_1791473848875.jpg';
import brazilGoldMapImg from '../../assets/images/brazil_map_gold_1791473887938.jpg';

// Conjunto de dados inicial de alta fidelidade para frota 3 Corações
const DEFAULT_ISCAS_DATA: IscaItem[] = [
  { id: 'ISC-3C-104', destino: 'BETIM (MG) ➔ FORTALEZA (CE)', status: 'ROTA IDA', motorista: 'Carlos Eduardo', cavalo: 'RXX-4091', carreta: 'FTR-8921', unidade: 'Matriz MG', data: 'Hoje, 08:30' },
  { id: 'ISC-3C-112', destino: 'VARGINHA (MG) ➔ RECIFE (PE)', status: 'ROTA IDA', motorista: 'Marcos Antonio', cavalo: 'ABC-9812', carreta: 'CFE-4412', unidade: 'Filial Varginha', data: 'Hoje, 09:15' },
  { id: 'ISC-3C-118', destino: 'TRÊS CORAÇÕES (MG) ➔ SÃO PAULO (SP)', status: 'ROTA IDA', motorista: 'Valdir Silva', cavalo: 'BRA-3E21', carreta: 'KLP-9011', unidade: 'CD Três Corações', data: 'Hoje, 07:45' },
  { id: 'ISC-3C-125', destino: 'BETIM (MG) ➔ SALVADOR (BA)', status: 'ROTA IDA', motorista: 'Gilmar Souza', cavalo: 'GHJ-3344', carreta: 'MKO-2211', unidade: 'Matriz MG', data: 'Hoje, 10:20' },
  { id: 'ISC-3C-134', destino: 'TRÊS CORAÇÕES (MG) ➔ CURITIBA (PR)', status: 'ROTA IDA', motorista: 'Renato Lima', cavalo: 'OPI-8877', carreta: 'XXZ-5544', unidade: 'CD Três Corações', data: 'Hoje, 06:50' },
  { id: 'ISC-3C-141', destino: 'VARGINHA (MG) ➔ BRASÍLIA (DF)', status: 'ROTA IDA', motorista: 'Eduardo Braga', cavalo: 'KMN-1212', carreta: 'QWE-7766', unidade: 'Filial Varginha', data: 'Hoje, 11:00' },
  
  { id: 'ISC-3C-201', destino: 'NATAL (RN) ➔ TRÊS CORAÇÕES (MG)', status: 'ROTA VOLTA', motorista: 'Rogério Santos', cavalo: 'JKH-7721', carreta: 'OPX-3310', unidade: 'Retorno Matriz', data: 'Ontem, 22:40' },
  { id: 'ISC-3C-208', destino: 'CURITIBA (PR) ➔ VARGINHA (MG)', status: 'ROTA VOLTA', motorista: 'Fernando Dias', cavalo: 'MNO-5520', carreta: 'RTY-1199', unidade: 'Retorno Varginha', data: 'Hoje, 04:10' },
  { id: 'ISC-3C-215', destino: 'CAMPINAS (SP) ➔ BETIM (MG)', status: 'ROTA VOLTA', motorista: 'Luciano Neves', cavalo: 'ZZP-9922', carreta: 'KLO-8833', unidade: 'Retorno Matriz', data: 'Hoje, 05:30' },
  { id: 'ISC-3C-223', destino: 'FORTALEZA (CE) ➔ TRÊS CORAÇÕES (MG)', status: 'ROTA VOLTA', motorista: 'André Moreira', cavalo: 'LLX-1144', carreta: 'POI-4433', unidade: 'Retorno Matriz', data: 'Ontem, 19:20' },

  { id: 'ISC-3C-302', destino: 'CD SANTO ANDRÉ (SP)', status: 'NO DESTINO', motorista: 'Tiago Mendes', cavalo: 'DFG-1123', carreta: 'UIO-9988', unidade: 'Filial SP', data: 'Chegada 07:15' },
  { id: 'ISC-3C-309', destino: 'FILIAL RIO DE JANEIRO (RJ)', status: 'NO DESTINO', motorista: 'Leonardo Lima', cavalo: 'BVC-8877', carreta: 'HJK-4455', unidade: 'Filial RJ', data: 'Chegada 08:00' },
  { id: 'ISC-3C-317', destino: 'HUB SALVADOR (BA)', status: 'NO DESTINO', motorista: 'Paulo Ribeiro', cavalo: 'QWE-6655', carreta: 'ASD-2233', unidade: 'Filial BA', data: 'Chegada 09:40' },
  { id: 'ISC-3C-328', destino: 'CD PORTO ALEGRE (RS)', status: 'NO DESTINO', motorista: 'Cleber Ferreira', cavalo: 'VVX-7711', carreta: 'ZSA-9900', unidade: 'Filial RS', data: 'Chegada 06:30' },

  { id: 'ISC-3C-405', destino: 'PÁTIO TRÊS CORAÇÕES (MG)', status: 'PREPARAÇÃO', motorista: 'Base Operacional', cavalo: '--', carreta: '--', unidade: 'Oficina / Bateria 100%', data: 'Checklist OK' },
  { id: 'ISC-3C-412', destino: 'BASE BETIM (MG)', status: 'PREPARAÇÃO', motorista: 'Equipe PGR', cavalo: '--', carreta: '--', unidade: 'Configuração APN', data: 'Testando Sinal' },
  { id: 'ISC-3C-419', destino: 'PÁTIO VARGINHA (MG)', status: 'PREPARAÇÃO', motorista: 'Operador Logístico', cavalo: '--', carreta: '--', unidade: 'Aguardando Carregamento', data: 'Reserva Frota' },

  { id: 'ISC-3C-501', destino: 'TRECHO BR-116 KM 420 (BA)', status: 'EXTRAVIADA', motorista: 'Alerta PGR / Sem Sinal', cavalo: 'KKK-0012', carreta: 'ZZZ-9911', unidade: 'Acionamento Pronta Resposta', data: 'Último sinal > 48h' },
  { id: 'ISC-3C-506', destino: 'RODOVIA ANHANGUERA KM 85 (SP)', status: 'EXTRAVIADA', motorista: 'Bateria Descarregada / Investigação', cavalo: 'BBA-7744', carreta: 'LLM-2233', unidade: 'PGR Três Corações', data: 'Sinal Intermitente' },
];

const STATES = [
  'BR', 'MG', 'SP', 'RJ', 'PR', 'BA', 'CE', 'PE', 'RN', 'RS', 'SC', 'GO', 'DF'
];

interface MainDashboardProps {
  onNavigate?: (tabId: string) => void;
}

export default function MainDashboard({ onNavigate }: MainDashboardProps) {
  const [iscasList, setIscasList] = useState<IscaItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedStatusTab, setSelectedStatusTab] = useState<'TODAS' | 'ROTA IDA' | 'ROTA VOLTA' | 'NO DESTINO' | 'PREPARAÇÃO' | 'EXTRAVIADA'>('TODAS');
  const [selectedState, setSelectedState] = useState('BR');
  const [searchTerm, setSearchTerm] = useState('');

  // Sincronização em tempo real com o banco de dados Firebase e cache local do módulo Iscas
  useEffect(() => {
    const iscasRef = ref(db, 'iscas_data');
    const unsubscribe = onValue(iscasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr: IscaItem[] = Array.isArray(data) ? data : Object.values(data);
        if (arr.length > 0) {
          setIscasList(arr);
          setHasLoaded(true);
          try { localStorage.setItem('iscas_data', JSON.stringify(arr)); } catch {}
          return;
        }
      }

      // Fallback local caso Firebase esteja vazio
      try {
        const cached = localStorage.getItem('iscas_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setIscasList(parsed);
            setHasLoaded(true);
            return;
          }
        }
      } catch {}

      // Se não houver dados cadastrados ainda, usa a base padrão de alta fidelidade
      setIscasList(DEFAULT_ISCAS_DATA);
      setHasLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // Classificação padronizada das iscas nos 5 status solicitados pelo usuário
  const classifiedGroups = useMemo(() => {
    const items = iscasList.length > 0 ? iscasList : DEFAULT_ISCAS_DATA;

    const rotaIda: IscaItem[] = [];
    const rotaVolta: IscaItem[] = [];
    const semDestino: IscaItem[] = [];
    const preparacaoDisponivel: IscaItem[] = [];
    const extraviada: IscaItem[] = [];

    items.forEach((item) => {
      const st = (item.status || '').toUpperCase();
      const obs = (item.obs1 || '').toUpperCase();
      const combined = `${st} ${obs}`;

      if (combined.includes('EXTRAVI') || combined.includes('PERDID') || combined.includes('SINISTRO') || combined.includes('ALERTA')) {
        extraviada.push(item);
      } else if (combined.includes('DESTINO') || combined.includes('ENTREG') || combined.includes('CHEG')) {
        semDestino.push(item);
      } else if (combined.includes('VOLTA') || combined.includes('RETORNO')) {
        rotaVolta.push(item);
      } else if (combined.includes('PREPARA') || combined.includes('PÁTIO') || combined.includes('PATIO') || combined.includes('DISPONÍVEL') || combined.includes('DISPONIVEL') || combined.includes('ESTOQUE') || combined.includes('BASE')) {
        preparacaoDisponivel.push(item);
      } else {
        // Padrão ou status "ROTA IDA" / "IDA" / "EM ROTA"
        rotaIda.push(item);
      }
    });

    const total = items.length;
    const operacionaisSeguras = total - extraviada.length;
    const eficienciaPercent = total > 0 ? ((operacionaisSeguras / total) * 100).toFixed(1) : '100.0';

    return {
      total,
      rotaIda,
      rotaVolta,
      semDestino,
      preparacaoDisponivel,
      extraviada,
      eficienciaPercent
    };
  }, [iscasList]);

  // Filtragem da lista para exibição na tabela interativa
  const filteredIscas = useMemo(() => {
    const items = iscasList.length > 0 ? iscasList : DEFAULT_ISCAS_DATA;

    return items.filter((item) => {
      const st = (item.status || '').toUpperCase();
      const obs = (item.obs1 || '').toUpperCase();
      const combined = `${st} ${obs}`;

      // Filtro de aba de status
      if (selectedStatusTab === 'ROTA IDA') {
        const isExtr = combined.includes('EXTRAVI') || combined.includes('PERDID') || combined.includes('SINISTRO');
        const isDest = combined.includes('DESTINO') || combined.includes('ENTREG');
        const isVolt = combined.includes('VOLTA') || combined.includes('RETORNO');
        const isPrep = combined.includes('PREPARA') || combined.includes('PATIO') || combined.includes('PÁTIO') || combined.includes('DISPONÍVEL') || combined.includes('DISPONIVEL');
        if (isExtr || isDest || isVolt || isPrep) return false;
      } else if (selectedStatusTab === 'ROTA VOLTA') {
        if (!combined.includes('VOLTA') && !combined.includes('RETORNO')) return false;
      } else if (selectedStatusTab === 'SEM DESTINO') {
        if (!combined.includes('DESTINO') && !combined.includes('ENTREG') && !combined.includes('CHEG')) return false;
      } else if (selectedStatusTab === 'PREPARAÇÃO / DISPONÍVEL') {
        if (!combined.includes('PREPARA') && !combined.includes('PÁTIO') && !combined.includes('PATIO') && !combined.includes('DISPONÍVEL') && !combined.includes('DISPONIVEL') && !combined.includes('ESTOQUE') && !combined.includes('BASE')) return false;
      } else if (selectedStatusTab === 'EXTRAVIADA') {
        if (!combined.includes('EXTRAVI') && !combined.includes('PERDID') && !combined.includes('SINISTRO') && !combined.includes('ALERTA')) return false;
      }

      // Filtro de UF selecionada (se não for BR)
      if (selectedState !== 'BR') {
        const text = `${item.destino} ${item.unidade || ''}`.toUpperCase();
        if (!text.includes(selectedState)) return false;
      }

      // Filtro de busca de texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const match = 
          item.id.toLowerCase().includes(term) ||
          item.destino.toLowerCase().includes(term) ||
          item.status.toLowerCase().includes(term) ||
          (item.motorista && item.motorista.toLowerCase().includes(term)) ||
          (item.cavalo && item.cavalo.toLowerCase().includes(term)) ||
          (item.carreta && item.carreta.toLowerCase().includes(term));
        if (!match) return false;
      }

      return true;
    });
  }, [iscasList, selectedStatusTab, selectedState, searchTerm]);

  const getStatusBadgeStyle = (status: string) => {
    const up = (status || '').toUpperCase();
    if (up.includes('EXTRAVI') || up.includes('PERDID') || up.includes('SINISTRO') || up.includes('ALERTA')) {
      return 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
    }
    if (up.includes('DESTINO') || up.includes('ENTREG') || up.includes('CHEG')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (up.includes('VOLTA') || up.includes('RETORNO')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    if (up.includes('PREPARA') || up.includes('PÁTIO') || up.includes('PATIO') || up.includes('DISPONÍVEL') || up.includes('DISPONIVEL')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    // Rota Ida
    return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
  };

  return (
    <div className="w-full min-h-full flex flex-col gap-4 p-4 sm:p-6 text-white select-none font-sans relative">
      
      {/* ========================================================================= */}
      {/* 1. TOP ROW: HERO CARGA 3 CORAÇÕES (68%) + GAUGE DE ISCAS MONITORADAS (32%) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* Banner Cinematográfico 3 Corações (Col 8) */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-[rgba(201,151,62,0.25)] relative flex flex-col md:flex-row items-center justify-between p-6 min-h-[175px] group">
          <img 
            src={heroConvoyCity} 
            alt="Caminhão 3 Corações Rodovia" 
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080a0c]/90 via-[#080a0c]/60 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0c]/85 via-transparent to-black/30 pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#e5c27a]/60 to-transparent pointer-events-none" />

          {/* Texto Oficial: CENTRAL GR / JUNTOS EM TODAS AS ROTAS */}
          <div className="relative z-10 flex flex-col text-left max-w-xl">
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#e5c27a] bg-[#0d1012]/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#c9973e]/40 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                <span>CENTRAL GR ➔ TELEMETRIA ATIVA</span>
              </span>
            </div>

            <h1 className="text-[26px] sm:text-[34px] font-black text-white uppercase tracking-tight leading-[1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              JUNTOS EM TODAS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4f0e8] via-[#e5c27a] to-[#c9973e]">
                AS ROTAS
              </span>
            </h1>

            <p className="text-[12px] sm:text-[13px] text-[#f4f0e8]/90 mt-2 font-medium leading-relaxed drop-shadow-md max-w-md">
              Rastreamento contínuo de iscas, telemetria de frotas e segurança integrada Grupo 3 Corações.
            </p>
          </div>

          {/* Badge Grupo 3 Corações */}
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

        {/* Card Circular Gauge: EFICIÊNCIA DE MONITORAMENTO DE ISCAS (Col 4) */}
        <div className="lg:col-span-4 bg-[#131619]/95 backdrop-blur-md rounded-2xl p-5 border border-[rgba(201,151,62,0.22)] shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col text-left leading-tight z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black text-[#d8d3c8] uppercase tracking-wider">
                ISCAS MONITORADAS
              </span>
              <span className="text-[10px] font-extrabold text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>ONLINE</span>
              </span>
            </div>
            <span className="text-[40px] font-black text-white tracking-tight block leading-none font-sans drop-shadow-sm font-mono">
              {classifiedGroups.total}
            </span>
            <span className="text-[11px] font-semibold text-[#a8a39a] mt-2 block">
              <strong className="text-[#e5c27a] font-mono font-bold">
                {classifiedGroups.rotaIda.length + classifiedGroups.rotaVolta.length}
              </strong> em trânsito · <span className="font-mono text-emerald-400">{classifiedGroups.semDestino.length}</span> entregues
            </span>
            <button
              onClick={() => onNavigate?.('iscas')}
              className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#e5c27a] hover:text-[#fff5db] bg-[#c9973e]/15 hover:bg-[#c9973e]/30 border border-[#c9973e]/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer w-fit shadow-xs"
            >
              <Package size={12} />
              <span>Gerenciar Iscas ➔</span>
            </button>
          </div>

          {/* Gauge Circular Dourado Tecnológico de Eficiência */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center z-10">
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_12px_rgba(201,151,62,0.3)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#232628" strokeWidth="9" />
              <circle 
                cx="50" 
                cy="50" 
                r="38" 
                fill="none" 
                stroke="url(#goldDonutGradIscas)" 
                strokeWidth="9" 
                strokeDasharray="238.7" 
                strokeDashoffset={238.7 * (1 - Number(classifiedGroups.eficienciaPercent) / 100)} 
                strokeLinecap="round" 
              />
              <defs>
                <linearGradient id="goldDonutGradIscas" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e5c27a" />
                  <stop offset="50%" stopColor="#d9ad5a" />
                  <stop offset="100%" stopColor="#b77a25" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[13px] font-black text-[#e5c27a] font-mono">
                {classifiedGroups.eficienciaPercent}%
              </span>
              <span className="text-[8px] font-bold text-[#a8a39a] uppercase mt-0.5">Seguras</span>
            </div>
          </div>
        </div>

      </div>

      {/* QUICK OPERATIONAL MODULES BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {[
          { id: 'iscas', label: 'ISCAS', subtitle: 'RASTREAMENTO & DESTINOS' },
          { id: 'checklist', label: 'CHECKLIST', subtitle: 'DIVERGÊNCIAS' },
          { id: 'averbacao', label: 'AVERBAÇÃO', subtitle: 'SEGUROS DE CARGA' },
          { id: 'sm_creator', label: 'SM', subtitle: 'MONITORAMENTO' },
          { id: 'controle', label: 'PRÉ-ALERTA', subtitle: 'PGR & ALERTAS' },
          { id: 'disponibilidade', label: 'DISPONIBILIDADE', subtitle: 'PÁTIO' },
          { id: 'escala', label: 'ESCALA 3C', subtitle: 'PLANTÃO' },
          { id: 'rotas', label: 'ROTAS', subtitle: 'P&R E DESTINOS' },
        ].map(mod => (
          <button
            key={mod.id}
            onClick={() => onNavigate?.(mod.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131619] hover:bg-[#1f2429] text-[#e5c27a] border border-[#c9973e]/30 hover:border-[#c9973e] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <span>{mod.label}</span>
            <span className="text-[8px] text-stone-400 font-normal">({mod.subtitle})</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. KPI BAR: OS 5 STATUS OFICIAIS DE ISCAS (ROTA IDA, ROTA VOLTA,          */}
      {/*    SEM DESTINO, PREPARAÇÃO / DISPONÍVEL, EXTRAVIADA)                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
        
        {/* KPI 1: ROTA IDA */}
        <div 
          onClick={() => setSelectedStatusTab('ROTA IDA')}
          className={cn(
            "bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:scale-[1.02]",
            selectedStatusTab === 'ROTA IDA' ? "border-[#38bdf8] ring-2 ring-[#38bdf8]/30" : "border-[rgba(201,151,62,0.2)]"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#0284c7] text-[#080a0c] flex items-center justify-center shrink-0 border border-sky-300/60 shadow-[0_0_15px_rgba(56,189,248,0.35)]">
            <ArrowUpRight size={22} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#38bdf8] block">
              ROTA IDA
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.rotaIda.length}
            </span>
            <span className="text-[9px] font-bold text-sky-400 block mt-0.5">
              {classifiedGroups.total > 0 ? ((classifiedGroups.rotaIda.length / classifiedGroups.total) * 100).toFixed(0) : 0}% <span className="text-[#a8a39a] font-normal">das iscas</span>
            </span>
          </div>
        </div>

        {/* KPI 2: ROTA VOLTA */}
        <div 
          onClick={() => setSelectedStatusTab('ROTA VOLTA')}
          className={cn(
            "bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:scale-[1.02]",
            selectedStatusTab === 'ROTA VOLTA' ? "border-[#c084fc] ring-2 ring-[#c084fc]/30" : "border-[rgba(201,151,62,0.2)]"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c084fc] to-[#7e22ce] text-white flex items-center justify-center shrink-0 border border-purple-300/60 shadow-[0_0_15px_rgba(192,132,252,0.35)]">
            <RotateCcw size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#c084fc] block">
              ROTA VOLTA
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.rotaVolta.length}
            </span>
            <span className="text-[9px] font-bold text-purple-300 block mt-0.5">
              {classifiedGroups.total > 0 ? ((classifiedGroups.rotaVolta.length / classifiedGroups.total) * 100).toFixed(0) : 0}% <span className="text-[#a8a39a] font-normal">das iscas</span>
            </span>
          </div>
        </div>

        {/* KPI 3: SEM DESTINO */}
        <div 
          onClick={() => setSelectedStatusTab('SEM DESTINO')}
          className={cn(
            "bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:scale-[1.02]",
            selectedStatusTab === 'SEM DESTINO' ? "border-[#34d399] ring-2 ring-[#34d399]/30" : "border-[rgba(201,151,62,0.2)]"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#34d399] to-[#059669] text-white flex items-center justify-center shrink-0 border border-emerald-300/60 shadow-[0_0_15px_rgba(52,211,153,0.35)]">
            <CheckCircle2 size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#34d399] block">
              SEM DESTINO
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.semDestino.length}
            </span>
            <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">
              {classifiedGroups.total > 0 ? ((classifiedGroups.semDestino.length / classifiedGroups.total) * 100).toFixed(0) : 0}% <span className="text-[#a8a39a] font-normal">entregues</span>
            </span>
          </div>
        </div>

        {/* KPI 4: PREPARAÇÃO / DISPONÍVEL */}
        <div 
          onClick={() => setSelectedStatusTab('PREPARAÇÃO / DISPONÍVEL')}
          className={cn(
            "bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:scale-[1.02]",
            selectedStatusTab === 'PREPARAÇÃO / DISPONÍVEL' ? "border-[#fbbf24] ring-2 ring-[#fbbf24]/30" : "border-[rgba(201,151,62,0.2)]"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#d97706] text-[#080a0c] flex items-center justify-center shrink-0 border border-amber-300/60 shadow-[0_0_15px_rgba(251,191,36,0.35)]">
            <Sliders size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#fbbf24] block">
              PREP. / DISP.
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.preparacaoDisponivel.length}
            </span>
            <span className="text-[9px] font-bold text-amber-300 block mt-0.5">
              {classifiedGroups.total > 0 ? ((classifiedGroups.preparacaoDisponivel.length / classifiedGroups.total) * 100).toFixed(0) : 0}% <span className="text-[#a8a39a] font-normal">em base</span>
            </span>
          </div>
        </div>

        {/* KPI 5: EXTRAVIADA (Alerta Crítico) */}
        <div 
          onClick={() => setSelectedStatusTab('EXTRAVIADA')}
          className={cn(
            "bg-[#131619]/95 backdrop-blur-md rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:scale-[1.02]",
            selectedStatusTab === 'EXTRAVIADA' ? "border-[#ef4444] ring-2 ring-[#ef4444]/40" : "border-[rgba(239,68,68,0.3)]"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ef4444] to-[#991b1b] text-white flex items-center justify-center shrink-0 border border-red-300/60 shadow-[0_0_15px_rgba(239,68,68,0.45)] animate-pulse">
            <AlertTriangle size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#ef4444] block">
              EXTRAVIADA
            </span>
            <span className="text-[24px] font-black text-white block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.extraviada.length}
            </span>
            <span className="text-[9px] font-bold text-[#ef4444] block mt-0.5">
              {classifiedGroups.extraviada.length > 0 ? 'Atenção PGR' : 'Sem alertas'}
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: MONITORAMENTO OPERACIONAL DE ISCAS (Col 12)                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* BLOCO: MONITORAMENTO DETALHADO POR STATUS (Col 12) */}
        <div className="lg:col-span-12 bg-[#131619]/95 backdrop-blur-md rounded-2xl p-5 border border-[rgba(201,151,62,0.22)] shadow-[0_16px_40px_rgba(0,0,0,0.65)] flex flex-col justify-between">
          
          {/* Header do Bloco com Controles de Filtro */}
          <div className="flex flex-col gap-3 pb-3.5 border-b border-[rgba(201,151,62,0.18)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e5c27a] to-[#b77a25] flex items-center justify-center text-[#080a0c] shadow-sm">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="text-[13px] font-black text-white tracking-tight uppercase leading-none font-sans">
                    CONTROLE OPERACIONAL DE ISCAS
                  </h3>
                  <span className="text-[8.5px] font-bold text-[#a8a39a] uppercase tracking-wider block mt-1">
                    DADOS VINCULADOS AO MÓDULO ISCAS | TEMPO REAL
                  </span>
                </div>
              </div>

              {/* Botão para abrir o módulo de Iscas */}
              <button
                onClick={() => onNavigate?.('iscas')}
                className="flex items-center gap-1 text-[10px] font-bold text-[#e5c27a] hover:text-white transition-colors cursor-pointer"
              >
                <span>Módulo Iscas</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {/* Abas dos Status + TODAS */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {(['TODAS', 'ROTA IDA', 'ROTA VOLTA', 'SEM DESTINO', 'PREPARAÇÃO / DISPONÍVEL', 'EXTRAVIADA'] as const).map((tab) => {
                const isSelected = selectedStatusTab === tab;
                const count = 
                  tab === 'TODAS' ? classifiedGroups.total :
                  tab === 'ROTA IDA' ? classifiedGroups.rotaIda.length :
                  tab === 'ROTA VOLTA' ? classifiedGroups.rotaVolta.length :
                  tab === 'SEM DESTINO' ? classifiedGroups.semDestino.length :
                  tab === 'PREPARAÇÃO / DISPONÍVEL' ? classifiedGroups.preparacaoDisponivel.length :
                  classifiedGroups.extraviada.length;

                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedStatusTab(tab)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
                      isSelected
                        ? "bg-gradient-to-r from-[#e5c27a] to-[#b77a25] text-[#080a0c] shadow-xs"
                        : "bg-[#171a1c] text-[#a8a39a] hover:text-white border border-[rgba(201,151,62,0.15)]"
                    )}
                  >
                    <span>{tab}</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[9px] font-mono",
                      isSelected ? "bg-[#080a0c]/20 text-[#080a0c]" : "bg-white/10 text-white"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Campo de Busca Rápida */}
            <div className="relative w-full">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a39a]" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por ID da isca, destino, motorista, placa..."
                className="w-full bg-[#171a1c] border border-[rgba(201,151,62,0.2)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#a8a39a]/60 focus:outline-none focus:border-[#e5c27a]"
              />
            </div>
          </div>

          {/* Lista de Iscas Filtradas (Grid Horizontais) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 my-3 max-h-[350px] overflow-y-auto pr-1">
            {filteredIscas.length === 0 ? (
              <div className="col-span-full p-8 text-center text-[#a8a39a] text-xs">
                Nenhum registro encontrado para o filtro selecionado.
              </div>
            ) : (
              filteredIscas.slice(0, 15).map((isca) => (
                <div 
                  key={isca.id}
                  className="bg-[#171a1c]/90 hover:bg-[#1f2429] border border-[rgba(201,151,62,0.15)] hover:border-[#c9973e]/50 rounded-xl p-2.5 transition-all text-left flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9973e]/20 to-[#c9973e]/5 border border-[#c9973e]/30 flex items-center justify-center text-[#e5c27a] font-mono text-[10px] font-black shrink-0">
                      <Radio size={14} />
                    </div>
                    <div className="leading-tight truncate">
                      <div className="flex items-center gap-2">
                        <strong className="text-[11px] font-black text-white font-mono">
                          {isca.id}
                        </strong>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border",
                          getStatusBadgeStyle(isca.status)
                        )}>
                          {isca.status}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#f4f0e8]/90 font-semibold block mt-0.5 truncate">
                        {isca.destino}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onNavigate?.('iscas')}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-[#c9973e]/20 text-[#a8a39a] hover:text-[#e5c27a] transition-colors cursor-pointer"
                    title="Ver no Módulo Iscas"
                  >
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
