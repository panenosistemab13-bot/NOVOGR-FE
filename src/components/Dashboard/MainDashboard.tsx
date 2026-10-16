import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  AlertTriangle, 
  Package, 
  ArrowUpRight, 
  RotateCcw, 
  CheckCircle2, 
  Sliders, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Radio, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Box,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { rtdb as db } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { IscaItem } from '../Iscas';
import { extractCityForDistribution } from '../../utils/iscasDistribution';

// Imagens de altíssima fidelidade da frota e produtos Grupo 3 Corações
import heroConvoyCity from '../../assets/images/hero_convoy_3c_1791473865922.jpg';
import coffeeBeansImg from '../../assets/images/coffee_beans_3d_1789847062486.jpg';
import brazilGoldMapImg from '../../assets/images/brazil_map_gold_1791473887938.jpg';
import goldMedalLogo from '../../assets/images/gold_logo_medal_3c_1790406432555.jpg';

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

interface MainDashboardProps {
  onNavigate?: (tabId: string) => void;
}

export default function MainDashboard({ onNavigate }: MainDashboardProps) {
  const [iscasList, setIscasList] = useState<IscaItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedStatusTab, setSelectedStatusTab] = useState<'TODAS' | 'ROTA IDA' | 'ROTA VOLTA' | 'NO DESTINO' | 'PREPARAÇÃO' | 'EXTRAVIADA'>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

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

  // Classificação padronizada das iscas nos status solicitados
  const classifiedGroups = useMemo(() => {
    const items = iscasList.length > 0 ? iscasList : DEFAULT_ISCAS_DATA;

    const rotaIda: IscaItem[] = [];
    const rotaVolta: IscaItem[] = [];
    const noDestino: IscaItem[] = [];
    const preparacao: IscaItem[] = [];
    const extraviada: IscaItem[] = [];

    items.forEach((item) => {
      const st = (item.status || '').toUpperCase();
      const obs = (item.obs1 || '').toUpperCase();
      const combined = `${st} ${obs}`;

      if (combined.includes('EXTRAVI') || combined.includes('PERDID') || combined.includes('SINISTRO') || combined.includes('ALERTA')) {
        extraviada.push(item);
      } else if (combined.includes('DESTINO') || combined.includes('ENTREG') || combined.includes('CHEG')) {
        noDestino.push(item);
      } else if (combined.includes('VOLTA') || combined.includes('RETORNO')) {
        rotaVolta.push(item);
      } else if (combined.includes('PREPARA') || combined.includes('PÁTIO') || combined.includes('PATIO') || combined.includes('ESTOQUE') || combined.includes('BASE') || combined.includes('DISPONÍVEL')) {
        preparacao.push(item);
      } else {
        rotaIda.push(item);
      }
    });

    const total = items.length;
    const operacionaisSeguras = total - extraviada.length;
    const eficienciaPercent = total > 0 ? ((operacionaisSeguras / total) * 100).toFixed(1) : '100.0';
    const emTransitoPercent = total > 0 ? (((rotaIda.length + rotaVolta.length) / total) * 100).toFixed(1) : '0.0';

    const destUnidadeDist: Record<string, number> = {};
    items.forEach(item => {
      const city = extractCityForDistribution(item.destino, item.unidade);
      if (city) {
        destUnidadeDist[city] = (destUnidadeDist[city] || 0) + 1;
      }
    });

    return {
      total,
      rotaIda,
      rotaVolta,
      noDestino,
      preparacao,
      extraviada,
      eficienciaPercent,
      emTransitoPercent,
      destUnidadeDist
    };
  }, [iscasList]);

  // Filtragem da lista para exibição
  const filteredIscas = useMemo(() => {
    const items = iscasList.length > 0 ? iscasList : DEFAULT_ISCAS_DATA;

    return items.filter((item) => {
      const st = (item.status || '').toUpperCase();
      const obs = (item.obs1 || '').toUpperCase();
      const combined = `${st} ${obs}`;

      if (selectedStatusTab === 'ROTA IDA') {
        const isExtr = combined.includes('EXTRAVI') || combined.includes('PERDID') || combined.includes('SINISTRO');
        const isDest = combined.includes('DESTINO') || combined.includes('ENTREG');
        const isVolt = combined.includes('VOLTA') || combined.includes('RETORNO');
        const isPrep = combined.includes('PREPARA') || combined.includes('PATIO') || combined.includes('PÁTIO');
        if (isExtr || isDest || isVolt || isPrep) return false;
      } else if (selectedStatusTab === 'ROTA VOLTA') {
        if (!combined.includes('VOLTA') && !combined.includes('RETORNO')) return false;
      } else if (selectedStatusTab === 'NO DESTINO') {
        if (!combined.includes('DESTINO') && !combined.includes('ENTREG') && !combined.includes('CHEG')) return false;
      } else if (selectedStatusTab === 'PREPARAÇÃO') {
        if (!combined.includes('PREPARA') && !combined.includes('PÁTIO') && !combined.includes('PATIO') && !combined.includes('ESTOQUE') && !combined.includes('BASE')) return false;
      } else if (selectedStatusTab === 'EXTRAVIADA') {
        if (!combined.includes('EXTRAVI') && !combined.includes('PERDID') && !combined.includes('SINISTRO') && !combined.includes('ALERTA')) return false;
      }

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
  }, [iscasList, selectedStatusTab, searchTerm]);

  const getStatusBadgeStyle = (status: string) => {
    const up = (status || '').toUpperCase();
    if (up.includes('EXTRAVI') || up.includes('PERDID') || up.includes('SINISTRO') || up.includes('ALERTA')) {
      return 'bg-[#FFF2F2] text-rose-700 border-[#F8C6C6]';
    }
    if (up.includes('DESTINO') || up.includes('ENTREG') || up.includes('CHEG')) {
      return 'bg-[#EDF9F1] text-emerald-700 border-[#A3E2B7]';
    }
    if (up.includes('VOLTA') || up.includes('RETORNO')) {
      return 'bg-[#F6EEFA] text-purple-700 border-[#E4D0ED]';
    }
    if (up.includes('PREPARA') || up.includes('PÁTIO') || up.includes('PATIO')) {
      return 'bg-[#FEF8E8] text-amber-800 border-[#F6DC9B]';
    }
    return 'bg-[#F0F8FF] text-sky-800 border-[#BAE0FD]';
  };



  return (
    <div className="w-full min-h-full flex flex-col gap-4 p-4 md:p-6 text-[#25231F] select-none font-sans relative bg-[#F6F2E9]">
      
      {/* ========================================================================= */}
      {/* 1. TOP ROW: HERO CARGA 3 CORAÇÕES (68%) + GAUGE DE ISCAS MONITORADAS (32%) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* Banner Cinematográfico 3 Corações (Col 8) */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(196,154,69,0.10)] border border-[#E8DDCA] relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-7 min-h-[165px] bg-[#FFFDF9] group">
          <img 
            src={heroConvoyCity} 
            alt="Caminhão 3 Corações Rodovia" 
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 pointer-events-none"
          />
          {/* Suave camada de luminosidade corporativa preservando visibilidade da cena */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9]/95 via-[#FFFDF9]/80 to-transparent pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D8B065] to-transparent pointer-events-none" />

          {/* Texto Oficial: CENTRAL GR / JUNTOS EM TODAS AS ROTAS */}
          <div className="relative z-10 flex flex-col text-left max-w-xl">
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8C6D28] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#D8B065]/60 shadow-2xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>CENTRAL GR ➔ TELEMETRIA ATIVA</span>
              </span>
            </div>

            <h1 className="text-[24px] sm:text-[32px] font-black text-[#25231F] uppercase tracking-tight leading-[1] font-sans">
              JUNTOS EM TODAS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8C6D28] via-[#B8862D] to-[#6E541E]">
                AS ROTAS
              </span>
            </h1>

            <p className="text-[11.5px] sm:text-[12.5px] text-[#4A453E] mt-2 font-medium leading-relaxed max-w-md">
              Rastreamento contínuo de iscas, telemetria de frotas e segurança integrada Grupo 3 Corações.
            </p>
          </div>

          {/* Badge Grupo 3 Corações */}
          <div className="relative z-10 shrink-0 mt-4 md:mt-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#D8B065]/70 shadow-xs">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-[#d41a22] flex items-center justify-center shadow-xs">
                <span className="text-white font-black text-xs leading-none">3C</span>
              </div>
              <div className="text-left text-[#25231F] leading-none">
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#8C7B63] block">GRUPO</span>
                <span className="text-[13px] font-black tracking-tight block">3CORAÇÕES</span>
              </div>
            </div>
            <span className="text-[11px] font-serif italic text-[#8C6D28] mt-1 font-bold tracking-wide">
              Paixão por cada entrega
            </span>
          </div>
        </div>

        {/* Card Circular Gauge: EFICIÊNCIA DE MONITORAMENTO DE ISCAS (Col 4) */}
        <div className="lg:col-span-4 bg-[#FFFEFC] rounded-2xl p-5 border border-[#E8DDCA] shadow-[0_4px_16px_rgba(196,154,69,0.06)] flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col text-left leading-tight z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black text-[#6E6454] uppercase tracking-wider">
                ISCAS MONITORADAS
              </span>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-[#EAF7EE] border border-[#A7E0BA] px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-700" />
                <span>ONLINE</span>
              </span>
            </div>
            <span className="text-[38px] font-black text-[#25231F] tracking-tight block leading-none font-sans font-mono">
              {classifiedGroups.total}
            </span>
            <span className="text-[11px] font-semibold text-[#6E6454] mt-2 block">
              <strong className="text-[#8C6D28] font-mono font-bold">
                {classifiedGroups.rotaIda.length + classifiedGroups.rotaVolta.length}
              </strong> em trânsito · <span className="font-mono text-emerald-700 font-bold">{classifiedGroups.noDestino.length}</span> entregues
            </span>
            <button
              onClick={() => onNavigate?.('iscas')}
              className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#D8B065] to-[#AA7E2F] hover:brightness-105 border border-[#FFF5DB]/40 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer w-fit shadow-xs active:scale-98"
            >
              <Package size={12} />
              <span>GERENCIAR ISCAS ➔</span>
            </button>
          </div>

          {/* Gauge Circular Dourado Tecnológico de Eficiência */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center z-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#EFE7DA" strokeWidth="9" />
              <circle 
                cx="50" 
                cy="50" 
                r="38" 
                fill="none" 
                stroke="url(#goldDonutGradMain)" 
                strokeWidth="9" 
                strokeDasharray="238.7" 
                strokeDashoffset={238.7 * (1 - Number(classifiedGroups.eficienciaPercent) / 100)} 
                strokeLinecap="round" 
              />
              <defs>
                <linearGradient id="goldDonutGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E6C687" />
                  <stop offset="50%" stopColor="#C59B48" />
                  <stop offset="100%" stopColor="#8C6D28" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[13px] font-black text-[#8C6D28] font-mono">
                {classifiedGroups.eficienciaPercent}%
              </span>
              <span className="text-[8px] font-bold text-[#8C7B63] uppercase mt-0.5">SEGUIDAS</span>
            </div>
          </div>
        </div>

      </div>



      {/* ========================================================================= */}
      {/* 2. KPI BAR: OS 5 STATUS OFICIAIS + DISTRIBUIÇÃO DESTINO/UNIDADE           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 w-full">
        
        {/* KPI 1: ROTA IDA */}
        <div 
          onClick={() => setSelectedStatusTab('ROTA IDA')}
          className={cn(
            "bg-[#FFFEFC] rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3 text-left shadow-[0_2px_10px_rgba(196,154,69,0.05)] hover:scale-[1.01]",
            selectedStatusTab === 'ROTA IDA' ? "border-sky-500 ring-2 ring-sky-200" : "border-[#E8DDCA]"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ArrowUpRight size={20} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-sky-800 block">
              ROTA IDA
            </span>
            <span className="text-[22px] font-black text-[#25231F] block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.rotaIda.length}
            </span>
            <span className="text-[9px] font-bold text-sky-700 block mt-0.5">
              {classifiedGroups.total > 0 ? ((classifiedGroups.rotaIda.length / classifiedGroups.total) * 100).toFixed(0) : 0}% <span className="text-[#8C7B63] font-normal">das iscas</span>
            </span>
          </div>
        </div>

        {/* KPI 2: ROTA VOLTA */}
        <div 
          onClick={() => setSelectedStatusTab('ROTA VOLTA')}
          className={cn(
            "bg-[#FFFEFC] rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3 text-left shadow-[0_2px_10px_rgba(196,154,69,0.05)] hover:scale-[1.01]",
            selectedStatusTab === 'ROTA VOLTA' ? "border-purple-500 ring-2 ring-purple-200" : "border-[#E8DDCA]"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <RotateCcw size={18} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-purple-800 block">
              ROTA VOLTA
            </span>
            <span className="text-[22px] font-black text-[#25231F] block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.rotaVolta.length}
            </span>
            <span className="text-[9px] font-bold text-purple-700 block mt-0.5">
              {classifiedGroups.total > 0 ? ((classifiedGroups.rotaVolta.length / classifiedGroups.total) * 100).toFixed(0) : 0}% <span className="text-[#8C7B63] font-normal">das iscas</span>
            </span>
          </div>
        </div>

        {/* KPI 3: NO DESTINO */}
        <div 
          onClick={() => setSelectedStatusTab('NO DESTINO')}
          className={cn(
            "bg-[#FFFEFC] rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3 text-left shadow-[0_2px_10px_rgba(196,154,69,0.05)] hover:scale-[1.01]",
            selectedStatusTab === 'NO DESTINO' ? "border-emerald-500 ring-2 ring-emerald-200" : "border-[#E8DDCA]"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 size={19} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-800 block">
              NO DESTINO
            </span>
            <span className="text-[22px] font-black text-[#25231F] block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.noDestino.length}
            </span>
            <span className="text-[9px] font-bold text-emerald-700 block mt-0.5">
              {classifiedGroups.total > 0 ? ((classifiedGroups.noDestino.length / classifiedGroups.total) * 100).toFixed(0) : 0}% <span className="text-[#8C7B63] font-normal">entregues</span>
            </span>
          </div>
        </div>

        {/* KPI 4: SANTA LUZIA (PREPARAÇÃO) */}
        <div 
          onClick={() => setSelectedStatusTab('PREPARAÇÃO')}
          className={cn(
            "bg-[#FFFEFC] rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3 text-left shadow-[0_2px_10px_rgba(196,154,69,0.05)] hover:scale-[1.01]",
            selectedStatusTab === 'PREPARAÇÃO' ? "border-[#C59B48] ring-2 ring-amber-200" : "border-[#E8DDCA]"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E6C687] to-[#B8862D] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sliders size={18} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8C6D28] block">
              SANTA LUZIA
            </span>
            <span className="text-[22px] font-black text-[#25231F] block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.preparacao.length}
            </span>
            <span className="text-[9px] font-bold text-[#8C6D28] block mt-0.5">
              {classifiedGroups.total > 0 ? ((classifiedGroups.preparacao.length / classifiedGroups.total) * 100).toFixed(0) : 0}% <span className="text-[#8C7B63] font-normal">em base/pátio</span>
            </span>
          </div>
        </div>

        {/* KPI 5: EXTRAVIADA */}
        <div 
          onClick={() => setSelectedStatusTab('EXTRAVIADA')}
          className={cn(
            "bg-[#FFFEFC] rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3 text-left shadow-[0_2px_10px_rgba(196,154,69,0.05)] hover:scale-[1.01]",
            selectedStatusTab === 'EXTRAVIADA' ? "border-rose-500 ring-2 ring-rose-200" : "border-[#E8DDCA]"
          )}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle size={18} className="stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-700 block">
              EXTRAVIADA
            </span>
            <span className="text-[22px] font-black text-[#25231F] block mt-0.5 tracking-tight font-mono">
              {classifiedGroups.extraviada.length}
            </span>
            <span className="text-[9px] font-bold text-rose-600 block mt-0.5">
              {classifiedGroups.extraviada.length > 0 ? 'Atenção PGR' : 'Sem alertas'}
            </span>
          </div>
        </div>

        {/* KPI 6: DISTRIBUIÇÃO: DESTINO/UNIDADE */}
        <div className="bg-[#FFFEFC] rounded-2xl p-4 border border-[#E8DDCA] shadow-[0_2px_10px_rgba(196,154,69,0.05)] flex flex-col justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-left">
            <Box size={14} className="text-[#8C6D28]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-[#8C6D28] block truncate">
              DISTRIBUIÇÃO: DESTINO/UNIDADE
            </span>
          </div>
          <select 
            className="bg-[#FAF5EB] text-[#25231F] text-xs font-bold p-2 rounded-xl border border-[#E8DDCA] w-full outline-none focus:border-[#C49A45]"
            defaultValue=""
          >
            <option value="" disabled>Selecione uma localização</option>
            {Object.entries(classifiedGroups.destUnidadeDist)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, count]) => (
                <option key={key} value={key}>{key}: {count} iscas</option>
              ))}
          </select>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: MONITORAMENTO OPERACIONAL (5) + MAPA (4) + PADRÃO OURO (3) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
        
        {/* BLOCO 1: MONITORAMENTO DETALHADO POR STATUS (Col 5) */}
        <div className="lg:col-span-5 bg-[#FFFEFC] rounded-2xl p-5 border border-[#E8DDCA] shadow-[0_4px_16px_rgba(196,154,69,0.06)] flex flex-col justify-between">
          
          {/* Header do Bloco com Controles de Filtro */}
          <div className="flex flex-col gap-3 pb-3.5 border-b border-[#E8DDCA]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FAF5EB] to-[#F2E8D5] border border-[#D8B065] text-[#8C6D28] flex items-center justify-center shadow-2xs">
                  <Package size={16} className="text-[#C49A45]" />
                </div>
                <div>
                  <h3 className="text-[13px] font-black text-[#25231F] tracking-tight uppercase leading-none font-sans">
                    CONTROLE OPERACIONAL DE ISCAS
                  </h3>
                  <span className="text-[8.5px] font-bold text-[#8C7B63] uppercase tracking-wider block mt-1">
                    DADOS VINCULADOS AO MÓDULO ISCAS | TEMPO REAL
                  </span>
                </div>
              </div>

              {/* Botão para abrir o módulo de Iscas */}
              <button
                onClick={() => onNavigate?.('iscas')}
                className="flex items-center gap-1 text-[10.5px] font-black uppercase text-[#8C6D28] hover:text-[#25231F] transition-colors cursor-pointer"
              >
                <span>Módulo Iscas</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {/* Abas dos 5 Status + TODAS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['TODAS', 'ROTA IDA', 'ROTA VOLTA', 'NO DESTINO', 'PREPARAÇÃO', 'EXTRAVIADA'] as const).map((tab) => {
                const isSelected = selectedStatusTab === tab;
                const count = 
                  tab === 'TODAS' ? classifiedGroups.total :
                  tab === 'ROTA IDA' ? classifiedGroups.rotaIda.length :
                  tab === 'ROTA VOLTA' ? classifiedGroups.rotaVolta.length :
                  tab === 'NO DESTINO' ? classifiedGroups.noDestino.length :
                  tab === 'PREPARAÇÃO' ? classifiedGroups.preparacao.length :
                  classifiedGroups.extraviada.length;

                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedStatusTab(tab)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[9.5px] font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs",
                      isSelected
                        ? "bg-gradient-to-r from-[#D8B065] via-[#C59B48] to-[#AA7E2F] text-white shadow-xs font-black"
                        : "bg-[#FAF5EB] hover:bg-white text-[#4A453E] border border-[#E8DDCA]"
                    )}
                  >
                    <span>{tab}</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[8.5px] font-mono",
                      isSelected ? "bg-white/20 text-white" : "bg-[#25231F] text-white"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Campo de Busca Rápida */}
            <div className="relative w-full">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por ID da isca, destino, motorista, placa..."
                className="w-full bg-[#FAF5EB] focus:bg-white border border-[#E8DDCA] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#25231F] font-bold placeholder-[#8C7B63] focus:outline-none focus:border-[#C49A45] shadow-2xs"
              />
            </div>
          </div>

          {/* Lista de Iscas Filtradas (Cards Verticais) */}
          <div className="flex flex-col gap-2 my-2.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredIscas.length === 0 ? (
              <div className="p-8 text-center text-[#8C7B63] text-xs font-semibold">
                Nenhum registro encontrado para o filtro selecionado.
              </div>
            ) : (
              filteredIscas.slice(0, 8).map((isca) => (
                <div 
                  key={isca.id}
                  className="bg-[#FAF5EB]/60 hover:bg-white border border-[#E8DDCA] hover:border-[#D8B065] rounded-xl p-2.5 transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <div className="w-8 h-8 rounded-lg bg-[#FFFDF9] border border-[#D8B065] flex items-center justify-center text-[#8C6D28] font-mono text-[10px] font-black shrink-0 shadow-2xs">
                      <Radio size={14} />
                    </div>
                    <div className="leading-tight">
                      <div className="flex items-center gap-2">
                        <strong className="text-[11.5px] font-black text-[#25231F] font-mono">
                          {isca.id}
                        </strong>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border",
                          getStatusBadgeStyle(isca.status)
                        )}>
                          {isca.status}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-[#4A453E] font-semibold block mt-0.5 truncate max-w-[210px]">
                        {isca.destino}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                    <div className="leading-tight text-left sm:text-right">
                      <span className="text-[9px] text-[#6E6454] block">
                        {isca.motorista ? `Mot: ${isca.motorista}` : (isca.cavalo ? `Placa: ${isca.cavalo}` : 'Grupo 3 Corações')}
                      </span>
                      <span className="text-[8.5px] text-emerald-700 font-mono font-bold block mt-0.5 flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                        <span>On-line</span>
                      </span>
                    </div>

                    <button 
                      onClick={() => onNavigate?.('iscas')}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#FAF5EB] text-[#8C7B63] hover:text-[#C49A45] border border-[#E8DDCA] transition-colors cursor-pointer"
                      title="Ver no Módulo Iscas"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* BLOCO 2: MAPA 3D "BRASIL CONECTADO" (Col 4) */}
        <div className="lg:col-span-4 bg-[#FFFEFC] rounded-2xl p-4 border border-[#E8DDCA] shadow-[0_4px_16px_rgba(196,154,69,0.06)] relative overflow-hidden flex flex-col justify-between group min-h-[350px]">
          <img 
            src={brazilGoldMapImg} 
            alt="Brasil Conectado Rotas Douradas" 
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent pointer-events-none" />

          {/* Top Label & Fullscreen Button */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-[#8C6D28] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#D8B065]/70 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              COBERTURA NACIONAL 3C
            </span>
            <button
              onClick={() => setIsMapFullscreen(true)}
              className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-[#8C6D28] border border-[#D8B065]/70 flex items-center justify-center shadow-xs cursor-pointer transition-all hover:scale-105"
              title="Expandir para tela cheia"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Bottom Card Legend */}
          <div className="relative z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#E8DDCA] shadow-sm text-left max-w-[270px]">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#D8B065] to-[#AA7E2F] text-white flex items-center justify-center">
                <MapPin size={11} className="stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#25231F]">
                BRASIL CONECTADO
              </span>
            </div>
            <h4 className="text-[12px] font-black text-[#8C6D28] uppercase tracking-tight leading-none mb-1">
              ROTAS & TELEMETRIA
            </h4>
            <p className="text-[9.5px] text-[#4A453E] font-medium leading-tight">
              Monitoramento ativo de Três Corações, Betim e Varginha para todas as regiões do país.
            </p>
            <div className="flex items-center gap-3 mt-2 pt-1.5 border-t border-[#E8DDCA] text-[8.5px] font-mono font-bold text-[#6E6454]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                Rotas ativas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                Pontos de entrega
              </span>
            </div>
          </div>
        </div>

        {/* FULLSCREEN MODAL FOR MAP */}
        {isMapFullscreen && (
          <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col justify-between p-6 animate-in fade-in duration-200">
            
            <img 
              src={brazilGoldMapImg} 
              alt="Brasil Conectado Rotas Douradas Tela Cheia 4K" 
              className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none filter saturate-110 brightness-110 p-2 sm:p-6"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

            {/* Top Bar inside Fullscreen */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#E6C575] bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#C69A45] flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                COBERTURA NACIONAL 3C • MODO TELA CHEIA 4K
              </span>
              <button
                onClick={() => setIsMapFullscreen(false)}
                className="w-11 h-11 rounded-xl bg-black/80 hover:bg-black text-[#E6C575] border border-[#C69A45] flex items-center justify-center shadow-lg cursor-pointer transition-all hover:scale-105"
                title="Sair da tela cheia"
              >
                <Minimize2 size={20} />
              </button>
            </div>

            {/* Bottom Card Legend in Fullscreen */}
            <div className="relative z-10 bg-black/85 backdrop-blur-md p-5 rounded-2xl border border-[#C69A45]/80 shadow-2xl text-left max-w-md text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C69A45] to-[#91651F] text-black flex items-center justify-center font-bold">
                  <MapPin size={13} className="stroke-[2.5]" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  BRASIL CONECTADO
                </span>
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1.5">
                ROTAS & TELEMETRIA 3C (4K ULTRA HD)
              </h4>
              <p className="text-xs text-stone-300 font-medium leading-relaxed">
                Monitoramento ativo e em tempo real de Três Corações, Betim e Varginha para todas as regiões do país com alta precisão PGR.
              </p>
              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/15 text-[10px] font-mono font-bold text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Rotas ativas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Pontos de entrega
                </span>
              </div>
            </div>

          </div>
        )}

        {/* BLOCO 3: INDICADORES PGR + RESUMO CONSOLIDADO DE ISCAS (Col 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Card Superior: PADRÃO OURO PGR com Latas Douradas */}
          <div className="bg-[#FFFEFC] rounded-2xl p-4 border border-[#E8DDCA] shadow-[0_4px_16px_rgba(196,154,69,0.06)] relative overflow-hidden flex flex-col justify-between min-h-[175px]">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#FAF5EB] border border-[#D8B065] flex items-center justify-center text-[#8C6D28]">
                  <ShieldCheck size={12} />
                </div>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-[#8C6D28]">
                  PADRÃO OURO PGR
                </span>
              </div>
              <span className="text-[8px] font-bold uppercase bg-[#FAF5EB] text-[#8C6D28] border border-[#E8DDCA] px-2 py-0.5 rounded-full">
                GRUPO 3C
              </span>
            </div>

            <div className="relative z-10 my-2 text-left">
              <span className="text-[26px] font-black tracking-tight block leading-none font-mono text-[#25231F]">
                {classifiedGroups.eficienciaPercent}% <small className="text-xs font-bold text-emerald-700">↑ Eficiência</small>
              </span>
              <span className="text-[10.5px] font-bold text-[#8C6D28] mt-1 block">
                {classifiedGroups.total - classifiedGroups.extraviada.length} de {classifiedGroups.total} iscas operando sem sinistro
              </span>
            </div>

            {/* Grãos de Café Dourados 3 Corações */}
            <div className="relative z-10 w-full h-24 rounded-xl overflow-hidden border border-[#E8DDCA] shadow-2xs group bg-white">
              <img 
                src={coffeeBeansImg} 
                alt="Grãos de Café Grupo Três Corações" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Card Inferior: CONSOLIDAÇÃO DOS 5 STATUS */}
          <div className="bg-[#FFFEFC] rounded-2xl p-4 border border-[#E8DDCA] shadow-[0_4px_16px_rgba(196,154,69,0.06)] flex-1 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DDCA]">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-[#C49A45]" />
                <span className="text-[11px] font-black text-[#25231F] uppercase tracking-wider">
                  DISTRIBUIÇÃO DE ISCAS
                </span>
              </div>
              <button 
                onClick={() => onNavigate?.('iscas')}
                className="text-[9.5px] font-bold text-[#8C6D28] hover:text-[#25231F] cursor-pointer flex items-center gap-1"
              >
                Planilha ➔
              </button>
            </div>

            <div className="flex flex-col gap-2 my-2 text-xs">
              
              {/* 1. Rota Ida */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-sky-800 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Rota Ida
                  </span>
                  <span className="font-mono font-bold text-[#25231F]">
                    {classifiedGroups.rotaIda.length} <small className="text-[#8C7B63]">({classifiedGroups.total > 0 ? ((classifiedGroups.rotaIda.length / classifiedGroups.total) * 100).toFixed(0) : 0}%)</small>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#FAF5EB] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full" 
                    style={{ width: `${classifiedGroups.total > 0 ? ((classifiedGroups.rotaIda.length / classifiedGroups.total) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* 2. Rota Volta */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-purple-800 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Rota Volta
                  </span>
                  <span className="font-mono font-bold text-[#25231F]">
                    {classifiedGroups.rotaVolta.length} <small className="text-[#8C7B63]">({classifiedGroups.total > 0 ? ((classifiedGroups.rotaVolta.length / classifiedGroups.total) * 100).toFixed(0) : 0}%)</small>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#FAF5EB] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${classifiedGroups.total > 0 ? ((classifiedGroups.rotaVolta.length / classifiedGroups.total) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* 3. No Destino */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    No Destino
                  </span>
                  <span className="font-mono font-bold text-[#25231F]">
                    {classifiedGroups.noDestino.length} <small className="text-[#8C7B63]">({classifiedGroups.total > 0 ? ((classifiedGroups.noDestino.length / classifiedGroups.total) * 100).toFixed(0) : 0}%)</small>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#FAF5EB] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${classifiedGroups.total > 0 ? ((classifiedGroups.noDestino.length / classifiedGroups.total) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* 4. Preparação */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-800 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Em Preparação
                  </span>
                  <span className="font-mono font-bold text-[#25231F]">
                    {classifiedGroups.preparacao.length} <small className="text-[#8C7B63]">({classifiedGroups.total > 0 ? ((classifiedGroups.preparacao.length / classifiedGroups.total) * 100).toFixed(0) : 0}%)</small>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#FAF5EB] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${classifiedGroups.total > 0 ? ((classifiedGroups.preparacao.length / classifiedGroups.total) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* 5. Extraviada */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-rose-700 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Extraviada
                  </span>
                  <span className="font-mono font-bold text-[#25231F]">
                    {classifiedGroups.extraviada.length} <small className="text-rose-600 font-semibold">({classifiedGroups.total > 0 ? ((classifiedGroups.extraviada.length / classifiedGroups.total) * 100).toFixed(0) : 0}%)</small>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#FAF5EB] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full" 
                    style={{ width: `${classifiedGroups.total > 0 ? ((classifiedGroups.extraviada.length / classifiedGroups.total) * 100) : 0}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Rodapé do Card */}
            <div className="pt-2 border-t border-[#E8DDCA] flex items-center justify-between text-[10px] text-[#8C7B63]">
              <span className="font-black uppercase tracking-wider text-[#8C6D28]">
                TOTAL GERAL:
              </span>
              <strong className="text-[#25231F] font-mono text-[12px]">
                {classifiedGroups.total} ISCAS
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. FOOTER (Branded, Clean & Sophisticated)                                */}
      {/* ========================================================================= */}
      <footer className="w-full pt-4 pb-2 border-t border-[#E8DDCA] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-sans text-[#7D705C] select-none">
        <div className="flex items-center gap-1.5">
          <span>Juntos em todos os caminhos</span>
          <span className="text-[#C49A45]">♥</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px] tracking-wider text-[#8C7B63]">
          <span className="hover:text-[#25231F] cursor-pointer">3 CORAÇÕES</span>
          <span>|</span>
          <span className="hover:text-[#25231F] cursor-pointer">LOGÍSTICA</span>
          <span>|</span>
          <span className="hover:text-[#25231F] cursor-pointer">PESSOAS</span>
          <span>|</span>
          <span className="hover:text-[#25231F] cursor-pointer">RESULTADOS</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>Juntos vamos mais longe</span>
          <span className="text-[#C49A45]">♥</span>
        </div>
      </footer>

    </div>
  );
}
