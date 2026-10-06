import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Trash2, 
  Plus, 
  Clock, 
  Search,
  Truck,
  Edit2,
  Check,
  FileText,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Mail,
  User,
  MoreVertical,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { format, differenceInCalendarDays, addDays } from 'date-fns';
import { safeCopyHtmlAndText } from '../utils/clipboard';

export const formatPlateWithHyphen = (plateStr?: string): string => {
  if (!plateStr) return '';
  const clean = plateStr.trim().toUpperCase();
  return clean.replace(/\b([A-Z]{3})([0-9][A-Z0-9]{3})\b/g, '$1-$2');
};

export const sanitizeForFirebase = <T extends Record<string, any>>(obj: T): T => {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeForFirebase(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
};

interface PdfFile {
  id: string;
  name: string;
  url: string;
}

export interface ChecklistItem {
  id: string;
  cavalo: string;
  carretas: string;
  dataTeste: string;
  dataVencimento: string;
  manutencaoOs: string;
  periferico: string;
  observacao: string;
  responsavel?: string;
  statusOverride?: 'APROVADO' | 'VENCIDO' | 'NEGATIVADO' | 'REPROVADO';
  pdfs?: PdfFile[];
  dataAgendamento?: string;
  osStatus?: 'PENDENTE' | 'AGENDADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO';
  checklistRealizado?: 'sim' | 'não';
}

// Mercosul License Plate Component with Blue Header & White Body
export const LicensePlate: React.FC<{ plate: string; type?: 'cavalo' | 'carreta'; className?: string }> = ({ plate, className }) => {
  if (!plate || plate === '-' || plate.trim() === '') return <span className="text-slate-500 font-mono font-bold">-</span>;
  const cleanPlate = formatPlateWithHyphen(plate);
  
  return (
    <div className={cn(
      "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[124px] h-[38px] shrink-0 rounded-lg shadow-md border border-slate-700 bg-white",
      className
    )}>
      {/* Mercosul Blue Bar */}
      <div className="w-full bg-[#0051A2] h-[10px] flex items-center justify-between px-1.5 leading-none relative">
        <span className="text-[5px] text-white font-sans font-black">BRASIL</span>
        <div className="w-[7px] h-[5px] bg-[#009b3a] border border-white/20 flex items-center justify-center relative rounded-[1px] overflow-hidden">
          <div className="w-[4px] h-[2.5px] bg-yellow-400 rotate-45 transform flex items-center justify-center">
            <div className="w-[1.2px] h-[1.2px] bg-blue-800 rounded-full"></div>
          </div>
        </div>
      </div>
      {/* Plate Code */}
      <div className="w-full flex-1 flex items-center justify-center px-1 bg-white">
        <span className="text-slate-950 font-black text-[14px] tracking-wider leading-none select-all font-mono">
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

export default function Checklist() {
  const [activeView, setActiveView] = useState<'monitoring' | 'os' | 'generator'>('monitoring');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [filter, setFilter] = useState<'TODOS' | 'EM DIA' | 'VENCIDO' | 'NEGATIVADOS'>('TODOS');
  const [dateQuickFilter, setDateQuickFilter] = useState<'TODOS' | '1 DIA' | '7 DIAS' | '15 DIAS' | '30 DIAS'>('TODOS');
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteData, setPasteData] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // New Item State
  const [newItem, setNewItem] = useState<Partial<ChecklistItem>>({
    cavalo: '',
    carretas: '',
    dataTeste: format(new Date(), 'yyyy-MM-dd'),
    dataVencimento: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
    manutencaoOs: '',
    periferico: '',
    observacao: '',
    responsavel: 'A. Amaral',
    checklistRealizado: 'sim'
  });

  // Generator Email State
  const [genData, setGenData] = useState({
    greeting: 'Boa noite,',
    requestText: 'Solicito o checklist para os conjuntos abaixo:',
    cavalo: 'POZ-4431',
    carretas: 'Sem conjunto',
    contato: '(31) 98481-7047',
    signature: 'Att,'
  });

  // Notification Toast State
  const [notification, setNotification] = useState<{ show: boolean; message: string; type?: 'success' | 'delete' | 'info' }>({ show: false, message: '' });

  const showToast = (message: string, type: 'success' | 'delete' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '' }), 2200);
  };

  useEffect(() => {
    const checklistRef = ref(rtdb, 'checklist_veiculos');
    const unsubscribe = onValue(checklistRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: ChecklistItem[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setItems(list);
      } else {
        // Default initial seed
        const initialSeed: Record<string, any> = {
          "v1": { id: "v1", cavalo: "POZ-4431", carretas: "Sem conjunto", dataTeste: "2026-10-18", dataVencimento: "2026-10-30", responsavel: "A. Amaral", manutencaoOs: "", observacao: "" },
          "v2": { id: "v2", cavalo: "POZ-3426", carretas: "Sem conjunto", dataTeste: "2026-10-30", dataVencimento: "2026-10-20", responsavel: "A. Amaral", manutencaoOs: "", observacao: "" },
          "v3": { id: "v3", cavalo: "XBW-6895", carretas: "PME-8298 / PAI-8955", dataTeste: "2026-10-20", dataVencimento: "2026-10-27", responsavel: "A. Amaral", manutencaoOs: "", observacao: "" },
          "v4": { id: "v4", cavalo: "QWE-8742", carretas: "Sem conjunto", dataTeste: "2026-10-22", dataVencimento: "2026-10-24", responsavel: "A. Amaral", manutencaoOs: "", observacao: "", statusOverride: "A VENCER" },
          "v5": { id: "v5", cavalo: "RTY-1123", carretas: "ABC-1234 / DEF-5678", dataTeste: "2026-10-10", dataVencimento: "2026-10-01", responsavel: "A. Amaral", manutencaoOs: "", observacao: "", statusOverride: "VENCIDO" }
        };
        await set(checklistRef, initialSeed);
      }
    });
    return () => unsubscribe();
  }, []);

  const safeParseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const clean = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return new Date(clean + 'T12:00:00');
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) return new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T12:00:00`);
    }
    return null;
  };

  const getDaysRemaining = (vencimientoStr: string): { days: number; isVencido: boolean } => {
    const vencDate = safeParseDate(vencimientoStr);
    if (!vencDate) return { days: 0, isVencido: false };
    const today = new Date();
    const diff = differenceInCalendarDays(vencDate, today);
    return { days: Math.abs(diff), isVencido: diff < 0 };
  };

  const getStatus = (item: ChecklistItem) => {
    if (item.statusOverride) {
      if (item.statusOverride === 'VENCIDO') return { label: 'VENCIDO', color: 'bg-red-500/15 border-red-500/40 text-red-400', icon: '🚫' };
      if (item.statusOverride === 'APROVADO') return { label: 'EM DIA', color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400', icon: '✔' };
    }
    const { days, isVencido } = getDaysRemaining(item.dataVencimento);
    if (isVencido) return { label: 'VENCIDO', color: 'bg-red-500/15 border-red-500/40 text-red-400', icon: '🚫' };
    if (days <= 7) return { label: 'A VENCER', color: 'bg-amber-500/15 border-amber-500/40 text-amber-400', icon: '⚠️' };
    return { label: 'EM DIA', color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400', icon: '✔' };
  };

  const handleAdd = async () => {
    if (!newItem.cavalo) {
      alert('Por favor, informe a placa do cavalo.');
      return;
    }
    const id = Date.now().toString();
    try {
      const payload = sanitizeForFirebase({
        id,
        cavalo: formatPlateWithHyphen(newItem.cavalo),
        carretas: formatPlateWithHyphen(newItem.carretas || 'Sem conjunto'),
        dataTeste: newItem.dataTeste || format(new Date(), 'yyyy-MM-dd'),
        dataVencimento: newItem.dataVencimento || format(addDays(new Date(), 60), 'yyyy-MM-dd'),
        responsavel: newItem.responsavel || 'A. Amaral',
        manutencaoOs: newItem.manutencaoOs || '',
        periferico: newItem.periferico || '',
        observacao: newItem.observacao || '',
        checklistRealizado: 'sim'
      });
      await set(ref(rtdb, `checklist_veiculos/${id}`), payload);
      setIsAdding(false);
      showToast('Novo veículo cadastrado com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Erro ao cadastrar.', 'delete');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este checklist?")) return;
    try {
      await remove(ref(rtdb, `checklist_veiculos/${id}`));
      showToast("Registro excluído!", 'delete');
    } catch (error) {
      console.error(error);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.cavalo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.carretas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.responsavel && item.responsavel.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;
      const status = getStatus(item);
      if (filter === 'EM DIA') return status.label === 'EM DIA';
      if (filter === 'VENCIDO') return status.label === 'VENCIDO';
      if (filter === 'NEGATIVADOS') return status.label === 'A VENCER';
      return true;
    });
  }, [items, searchTerm, filter]);

  // Statistics
  const totalVeiculos = items.length || 20;
  const totalEmDia = items.filter(i => getStatus(i).label === 'EM DIA').length || 17;
  const totalAVencer = items.filter(i => getStatus(i).label === 'A VENCER').length || 3;
  const totalVencidos = items.filter(i => getStatus(i).label === 'VENCIDO').length || 1;

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  return (
    <div className="w-full min-h-screen bg-[#07080c] text-white font-sans p-3 sm:p-5 overflow-x-hidden select-none flex flex-col justify-between relative space-y-5">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-[#121520] text-white border border-[#ff3b4b]/40 text-xs font-mono font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <Check size={16} className="text-[#00f0ff]" />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-5 max-w-[1800px] mx-auto">
        
        {/* ========================================================================= */}
        {/* TOP HEADER BREADCRUMB & CLOCK BAR                                         */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#ff3b4b]">◆</span>
            <span className="font-bold text-white uppercase tracking-wider">CHECKLIST</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0d0f17] px-3 py-1 rounded-xl border border-white/10">
              <Clock size={13} className="text-[#00f0ff]" />
              <span className="text-slate-200 font-bold">14:06:01</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">05 OUT 2025</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO BANNER: CHECKLIST DE FROTA & DONUT CIRCLE GAUGE                      */}
        {/* ========================================================================= */}
        <div className="bg-[#0d0f17] border border-white/10 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Title & Description Left */}
          <div className="text-left space-y-2 max-w-xl">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
              // VERIFICADOR DIÁRIO DE CONFORMIDADE DOCUMENTAL
            </span>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading leading-tight">
              CHECKLIST DE FROTA: <br />
              <span className="text-white">{totalVeiculos} VEÍCULOS</span> / <span className="text-[#00f0ff]">{totalEmDia} EM DIA</span>
            </h1>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Verificador diário de conformidade documental. Frota e gestores integrados ao monitoramento de riscos e prazos.
            </p>
          </div>

          {/* Center Donut Circular Gauge */}
          <div className="flex items-center justify-center relative shrink-0">
            <div className="relative w-36 h-36 rounded-full border-8 border-[#1a1f2e] border-t-[#00f0ff] border-r-[#00f0ff] border-b-[#00f0ff] flex flex-col items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.2)]">
              <span className="text-2xl font-black font-mono text-white tracking-tight">17/20</span>
              <span className="text-[10px] font-mono font-bold text-[#00f0ff] uppercase tracking-wider mt-0.5">EM DIA</span>
            </div>
          </div>

          {/* Right Stat Cards Container */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            
            {/* Card 1: VENCIMENTOS */}
            <div className="bg-[#121520] border border-white/10 rounded-2xl p-4 text-left space-y-2 min-w-[150px]">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                VENCIMENTOS
              </span>
              <div className="flex items-center gap-4 font-mono">
                <div>
                  <span className="text-xl font-black text-white block">2</span>
                  <span className="text-[9px] text-slate-500 uppercase block">HOJE</span>
                </div>
                <div className="border-l border-white/10 pl-3">
                  <span className="text-xl font-black text-slate-300 block">5</span>
                  <span className="text-[9px] text-slate-500 uppercase block">EM 7 DIAS</span>
                </div>
              </div>
            </div>

            {/* Card 2: ALERTAS CRÍTICOS */}
            <div className="bg-[#121520] border border-white/10 rounded-2xl p-4 text-left space-y-2 min-w-[150px]">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                ALERTAS CRÍTICOS
              </span>
              <div className="flex items-center gap-4 font-mono">
                <div>
                  <span className="text-xl font-black text-[#ff3b4b] block">1</span>
                  <span className="text-[9px] text-[#ff3b4b] font-bold uppercase block">VENCIDO</span>
                </div>
                <div className="border-l border-white/10 pl-3">
                  <span className="text-xl font-black text-[#ffb800] block">3</span>
                  <span className="text-[9px] text-[#ffb800] font-bold uppercase block">A VENCER</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* FILTER & SEARCH CONTROL BAR                                               */}
        {/* ========================================================================= */}
        <div className="bg-[#0d0f17] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left KPI Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="bg-[#141824] border border-white/10 px-3 py-1.5 rounded-xl font-bold text-slate-300">
              FROTA TOTAL <strong className="text-white ml-1">{totalVeiculos}</strong>
            </span>
            <span className="bg-[#141824] border border-white/10 px-3 py-1.5 rounded-xl font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              EM DIA <strong className="text-[#10b981] ml-0.5">{totalEmDia}</strong>
            </span>
            <span className="bg-[#141824] border border-white/10 px-3 py-1.5 rounded-xl font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb800]" />
              A VENCER <strong className="text-[#ffb800] ml-0.5">{totalAVencer}</strong>
            </span>
            <span className="bg-[#141824] border border-white/10 px-3 py-1.5 rounded-xl font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff3b4b]" />
              VENCIDO <strong className="text-[#ff3b4b] ml-0.5">{totalVencidos}</strong>
            </span>
          </div>

          {/* Center Search Input */}
          <div className="flex items-center gap-2 flex-1 w-full max-w-xl">
            <button className="bg-[#181d2c] border border-white/10 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5 shrink-0">
              <Filter size={13} className="text-[#ff3b4b]" />
              <span>FILTRO</span>
            </button>

            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por placa, conjunto, carreta, posto ou observação..."
                className="w-full bg-[#141824] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-[#ff3b4b]"
              />
            </div>
          </div>

          {/* Right Date Quick Filter Pills */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {(['TODOS', '1 DIA', '7 DIAS', '15 DIAS', '30 DIAS'] as const).map((dPill) => (
              <button
                key={dPill}
                type="button"
                onClick={() => setDateQuickFilter(dPill)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer border",
                  dateQuickFilter === dPill
                    ? "bg-[#ff3b4b] text-white border-[#ff3b4b] shadow-[0_0_12px_rgba(255,59,75,0.4)]"
                    : "bg-[#141824] text-slate-400 border-white/10 hover:text-white"
                )}
              >
                {dPill}
              </button>
            ))}

            <button
              onClick={() => setIsAdding(true)}
              className="bg-[#ff3b4b] hover:bg-[#e02d3f] text-white text-xs font-mono font-black uppercase px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ml-2"
            >
              <Plus size={14} />
              <span>NOVO</span>
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MAIN DATA COMPLIANCE TABLE                                                */}
        {/* ========================================================================= */}
        <div className="bg-[#0d0f17] border border-white/10 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#121520] text-slate-400 border-b border-white/10 text-[10.5px] uppercase font-black tracking-wider">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">PLACA / VEÍCULO</th>
                  <th className="p-3">CONJUNTO / CARRETA</th>
                  <th className="p-3 text-center">STATUS</th>
                  <th className="p-3 text-center">DATA</th>
                  <th className="p-3 text-center">VALIDADE</th>
                  <th className="p-3 text-center">PERÍODO / D.Ú.</th>
                  <th className="p-3">RESPONSÁVEL</th>
                  <th className="p-3 text-center w-20">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#0d0f17]">
                {paginatedItems.map((item, index) => {
                  const statusInfo = getStatus(item);
                  const { days, isVencido } = getDaysRemaining(item.dataVencimento);
                  const rowIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      {/* Index # */}
                      <td className="p-3 text-center text-slate-500 font-bold">
                        {rowIndex}
                      </td>

                      {/* License Plate */}
                      <td className="p-3">
                        <LicensePlate plate={item.cavalo} type="cavalo" />
                      </td>

                      {/* Conjunto / Carreta */}
                      <td className="p-3 font-bold text-slate-200">
                        {item.carretas || 'Sem conjunto'}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10.5px] font-black uppercase border inline-flex items-center gap-1.5",
                          statusInfo.color
                        )}>
                          <span>{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Data Teste */}
                      <td className="p-3 text-center text-slate-300 font-bold">
                        {item.dataTeste ? format(safeParseDate(item.dataTeste) || new Date(), 'dd/MM/yyyy') : '18/10/2026'}
                      </td>

                      {/* Validade & Subtitle */}
                      <td className="p-3 text-center">
                        <span className="font-bold text-white block">
                          {item.dataVencimento ? format(safeParseDate(item.dataVencimento) || new Date(), 'dd/MM/yyyy') : '30/10/2026'}
                        </span>
                        <span className={cn(
                          "text-[9.5px] block mt-0.5 font-bold",
                          isVencido ? "text-red-400" : "text-[#00f0ff]"
                        )}>
                          {isVencido ? `Vencido há ${days} dias` : `${days} dias restantes`}
                        </span>
                      </td>

                      {/* Período / D.Ú. */}
                      <td className="p-3 text-center text-slate-500">
                        -
                      </td>

                      {/* Responsável */}
                      <td className="p-3 font-bold text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-500" />
                          <span>{item.responsavel || 'A. Amaral'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-[#ff3b4b] transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
            <div>
              Exibindo 1-{paginatedItems.length} de {filteredItems.length} veículos
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-[#141824] border border-white/10 text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    "px-3 py-1 rounded-lg border text-xs font-bold cursor-pointer",
                    currentPage === p
                      ? "bg-[#ff3b4b] text-white border-[#ff3b4b]"
                      : "bg-[#141824] text-slate-400 border-white/10"
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-[#141824] border border-white/10 text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>

              <span className="ml-2 text-slate-500">5 / página</span>
            </div>
          </div>

        </div>

      </div>

      {/* Add Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0f17] border border-white/20 rounded-3xl p-6 w-full max-w-lg space-y-4 text-left text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black uppercase tracking-tight text-white font-heading">
                Cadastrar Novo Veículo
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 uppercase block mb-1">Placa Cavalo *</label>
                <input
                  type="text"
                  value={newItem.cavalo}
                  onChange={(e) => setNewItem({ ...newItem, cavalo: e.target.value.toUpperCase() })}
                  placeholder="POZ-4431"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ff3b4b] uppercase"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase block mb-1">Conjunto / Carretas</label>
                <input
                  type="text"
                  value={newItem.carretas}
                  onChange={(e) => setNewItem({ ...newItem, carretas: e.target.value.toUpperCase() })}
                  placeholder="PME-8298 / PAI-8955 ou Sem conjunto"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ff3b4b] uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase block mb-1">Data Teste</label>
                  <input
                    type="date"
                    value={newItem.dataTeste}
                    onChange={(e) => setNewItem({ ...newItem, dataTeste: e.target.value })}
                    className="w-full bg-[#141824] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ff3b4b]"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase block mb-1">Data Validade</label>
                  <input
                    type="date"
                    value={newItem.dataVencimento}
                    onChange={(e) => setNewItem({ ...newItem, dataVencimento: e.target.value })}
                    className="w-full bg-[#141824] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ff3b4b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase block mb-1">Responsável</label>
                <input
                  type="text"
                  value={newItem.responsavel}
                  onChange={(e) => setNewItem({ ...newItem, responsavel: e.target.value })}
                  placeholder="A. Amaral"
                  className="w-full bg-[#141824] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ff3b4b]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#141824] text-slate-300 text-xs font-mono font-bold uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2.5 rounded-xl bg-[#ff3b4b] text-white text-xs font-mono font-black uppercase shadow-md"
              >
                Salvar Veículo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
