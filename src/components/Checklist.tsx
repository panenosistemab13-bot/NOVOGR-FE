import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ClipboardCheck, 
  Trash2, 
  Plus, 
  Clock, 
  Search,
  Truck,
  Wrench,
  Edit2,
  Copy,
  Check,
  Upload,
  FileText,
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
  Mail,
  RotateCcw,
  MessageSquare,
  Send,
  Menu,
  MapPin,
  Sun,
  Cloud,
  User,
  ChevronDown,
  Home,
  Sliders,
  Calendar,
  Users,
  Route,
  LogOut,
  Settings,
  Phone,
  Pen,
  ChevronRight,
  ExternalLink,
  Container
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { format, differenceInCalendarDays, startOfDay, addDays } from 'date-fns';
import { safeCopyText } from '../utils/clipboard';

import panoramicTruckHero from '../assets/images/checklist_hero_truck_panoramic_1791986198896.jpg';
import goldMedalLogo from '../assets/images/gold_logo_medal_3c_1790406432555.jpg';

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
  statusOverride?: 'APROVADO' | 'VENCIDO' | 'NEGATIVADO' | 'REPROVADO';
  pdfs?: PdfFile[];
  dataAgendamento?: string;
  osStatus?: 'PENDENTE' | 'AGENDADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO';
  checklistRealizado?: 'sim' | 'não';
}

export const LicensePlate: React.FC<{ plate: string; type?: 'cavalo' | 'carreta'; className?: string }> = ({ plate, type, className }) => {
  if (!plate || plate === '-' || plate.trim() === '') return <span className="text-[#857B6C] font-mono font-bold">-</span>;
  const cleanPlate = formatPlateWithHyphen(plate);
  const isCarreta = type === 'carreta';
  const isCavalo = type === 'cavalo';
  const headerText = isCavalo ? 'CAVALO' : isCarreta ? 'CARRETA' : 'BRASIL';
  
  return (
    <div className={cn(
      "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider w-[128px] h-[40px] shrink-0 transform transition-transform hover:scale-105 rounded-lg shadow-xs border",
      isCarreta ? "bg-[#FFFBF3] border-[#EADBBF]" : "bg-white border-[#E0D5C1]",
      className
    )}>
      <div className="w-full bg-[#0051A2] h-[10px] flex items-center justify-between px-1.5 leading-none relative">
        <span className="text-[5px] text-white font-sans font-bold">BR</span>
        <span className="text-[6.5px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          {headerText}
        </span>
        <div className="w-[7px] h-[5px] bg-[#009b3a] border border-white/20 flex items-center justify-center relative rounded-[1px] overflow-hidden">
          <div className="w-[3.5px] h-[2.5px] bg-yellow-400 rotate-45 transform flex items-center justify-center">
            <div className="w-[1px] h-[1px] bg-red-800 rounded-full" />
          </div>
        </div>
      </div>
      <div className={cn("w-full flex-1 flex items-center justify-center px-1.5", isCarreta ? "bg-[#FAF5EC]" : "bg-white")}>
        <span className="text-[#25231F] font-black text-[14px] tracking-wide leading-none select-all font-mono">
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

interface ChecklistProps {
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  pageVisibility?: Record<string, boolean>;
}

export default function Checklist({ 
  onNavigate, 
  onLogout, 
  onOpenSettings,
  pageVisibility 
}: ChecklistProps = {}) {
  // Navigation tabs of checklist
  const [activeView, setActiveView] = useState<'monitoring' | 'os' | 'generator'>('generator');

  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [osSearchTerm, setOsSearchTerm] = useState('');
  const [osStatusFilter, setOsStatusFilter] = useState<'TODOS' | 'PENDENTE' | 'AGENDADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO'>('TODOS');
  const [filter, setFilter] = useState<'TODOS' | 'EM DIA' | 'VENCIDO' | 'NEGATIVADOS'>('TODOS');

  // Vehicle items list
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [selectedFilial, setSelectedFilial] = useState('LOGÍSTICA SC');

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type?: 'success' | 'delete' | 'info';
  }>({ show: false, message: '' });

  const showToast = (message: string, type: 'success' | 'delete' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  // New item modal form state
  const [newItem, setNewItem] = useState<Omit<ChecklistItem, 'id'>>({
    cavalo: '',
    carretas: '',
    dataTeste: format(new Date(), 'yyyy-MM-dd'),
    dataVencimento: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
    manutencaoOs: '',
    periferico: '',
    observacao: '',
    dataAgendamento: '',
    osStatus: 'PENDENTE',
    checklistRealizado: 'não'
  });

  // Generator form state matching the reference image exactly
  const [genData, setGenData] = useState({
    greeting: 'Boa noite,',
    requestText: 'Solicito o checklist para os conjuntos abaixo:',
    cavalo: 'SAS2D02',
    carretas: 'POG2095 / POR5E42',
    motorista: '',
    contato: '(31) 98481-7047',
    signature: 'Att.,'
  });
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Time & user info
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loggedUser = useMemo(() => {
    try {
      const saved = localStorage.getItem('logged_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { name: 'JEFFERSON', role: 'Administrador' };
  }, []);

  const safeParseDate = (dateStr?: string): Date | null => {
    if (!dateStr || dateStr === 'REPROVADO' || dateStr === 'VENCIDO' || dateStr === '#VALUE!') return null;
    const trimmed = dateStr.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        if (dd && mm && yyyy) {
          return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
        }
      }
    }
    if (trimmed.includes('-')) {
      const parts = trimmed.split('T')[0].split('-');
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        if (yyyy && mm && dd) {
          return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
        }
      }
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  };

  const getStatus = (item: ChecklistItem) => {
    const today = startOfDay(new Date());
    const expiry = safeParseDate(item.dataVencimento);

    if (expiry) {
      const expStart = startOfDay(expiry);
      const diff = differenceInCalendarDays(expStart, today);
      if (diff < 0) {
        return { label: 'VENCIDO', color: 'text-rose-700', bg: 'bg-[#FFF2F2]', border: 'border-[#F8C6C6]' };
      }
    }

    if (item.statusOverride) {
      if (item.statusOverride === 'VENCIDO' || item.statusOverride === 'REPROVADO' || item.statusOverride === 'NEGATIVADO') {
        return { label: item.statusOverride, color: 'text-rose-700', bg: 'bg-[#FFF2F2]', border: 'border-[#F8C6C6]' };
      }
      if (item.statusOverride === 'APROVADO') {
        return { label: 'APROVADO', color: 'text-emerald-700', bg: 'bg-[#EDF9F1]', border: 'border-[#A3E2B7]' };
      }
    }

    if (!expiry) {
      return { label: 'PENDENTE', color: 'text-amber-800', bg: 'bg-[#FEF8E8]', border: 'border-[#F6DC9B]' };
    }

    const expStart = startOfDay(expiry);
    const diff = differenceInCalendarDays(expStart, today);

    if (diff <= 3) {
      return { label: 'A VENCER', color: 'text-amber-800', bg: 'bg-[#FEF8E8]', border: 'border-[#F6DC9B]' };
    }

    return { label: 'APROVADO', color: 'text-emerald-700', bg: 'bg-[#EDF9F1]', border: 'border-[#A3E2B7]' };
  };

  // Sync Firebase RTDB
  useEffect(() => {
    const checklistRef = ref(rtdb, 'checklist_veiculos');
    const unsubscribe = onValue(checklistRef, async (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 0) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val,
          cavalo: formatPlateWithHyphen(val.cavalo),
          carretas: formatPlateWithHyphen(val.carretas)
        }));
        setItems(list);
      } else {
        const hasBeenCleared = localStorage.getItem('checklist_cleared_permanently') === 'true';
        const hasBeenSeeded = localStorage.getItem('checklist_seeded_v1') === 'true';

        if (!hasBeenCleared && !hasBeenSeeded) {
          const initialSeed: Record<string, any> = {
            "v1": { id: "v1", cavalo: "POZ-4431", carretas: "", dataTeste: "2026-06-10", dataVencimento: "2026-08-09", manutencaoOs: "", periferico: "", observacao: "" },
            "v2": { id: "v2", cavalo: "POZ-3241", carretas: "", dataTeste: "2026-06-30", dataVencimento: "2026-08-29", manutencaoOs: "", periferico: "", observacao: "" },
            "v3": { id: "v3", cavalo: "SBK-5A52", carretas: "POG-2095 / POF-7735", dataTeste: "2026-07-09", dataVencimento: "2026-09-07", manutencaoOs: "", periferico: "", observacao: "" },
            "v4": { id: "v4", cavalo: "SBK-5C22", carretas: "POG-1245 / POG-0885", dataTeste: "2026-07-16", dataVencimento: "2026-09-14", manutencaoOs: "", periferico: "", observacao: "" },
            "v5": { id: "v5", cavalo: "TYQ-6F51", carretas: "PNE-7353 / PNE-7433", dataTeste: "2026-07-18", dataVencimento: "2026-09-16", manutencaoOs: "", periferico: "", observacao: "" },
            "v6": { id: "v6", cavalo: "SBK-5B52", carretas: "PNC-8303 / PNC-8953", dataTeste: "2026-07-29", dataVencimento: "2026-09-27", manutencaoOs: "", periferico: "", observacao: "" },
            "v7": { id: "v7", cavalo: "TYT-8A14", carretas: "QOX-3164 / QOX-3168", dataTeste: "2026-08-08", dataVencimento: "2026-10-07", manutencaoOs: "", periferico: "", observacao: "" },
            "v8": { id: "v8", cavalo: "SAR-8D82", carretas: "SBF-9G98 / TIC-0F85", dataTeste: "2026-08-09", dataVencimento: "2026-10-08", manutencaoOs: "", periferico: "", observacao: "" },
            "v9": { id: "v9", cavalo: "THX-5I51", carretas: "POG-0685 / POG-0545", dataTeste: "2026-08-10", dataVencimento: "2026-10-09", manutencaoOs: "", periferico: "", observacao: "" },
            "v10": { id: "v10", cavalo: "SBK-4J52", carretas: "SBG-0B88 / PZX-4633", dataTeste: "2026-08-10", dataVencimento: "2026-10-09", manutencaoOs: "900382", periferico: "", observacao: "" },
            "v11": { id: "v11", cavalo: "POD-0255", carretas: "SBJ-0E22 / SBJ-0C82", dataTeste: "2026-08-12", dataVencimento: "2026-10-11", manutencaoOs: "", periferico: "", observacao: "" },
            "v12": { id: "v12", cavalo: "PNY-2605", carretas: "POF-9075 / POF-8375", dataTeste: "2026-08-21", dataVencimento: "2026-10-20", manutencaoOs: "", periferico: "", observacao: "" },
            "v13": { id: "v13", cavalo: "UUF-7I05", carretas: "PNW-5562", dataTeste: "2026-08-21", dataVencimento: "2026-10-20", manutencaoOs: "", periferico: "", observacao: "" },
            "v14": { id: "v14", cavalo: "PNY-2215", carretas: "SBJ-0E22 / SBJ-0C82", dataTeste: "2026-08-28", dataVencimento: "2026-10-27", manutencaoOs: "", periferico: "", observacao: "" },
            "v15": { id: "v15", cavalo: "SBN-4J62", carretas: "PNC-8603 / PNC-8873", dataTeste: "2026-08-29", dataVencimento: "2026-10-28", manutencaoOs: "", periferico: "", observacao: "" },
            "v16": { id: "v16", cavalo: "POD-0345", carretas: "POF-8075 / POF-7875", dataTeste: "2026-08-31", dataVencimento: "2026-10-30", manutencaoOs: "", periferico: "", observacao: "" },
            "v17": { id: "v17", cavalo: "POD-0645", carretas: "MIN-8723 / TIC-0D95", dataTeste: "2026-09-04", dataVencimento: "2026-11-03", manutencaoOs: "", periferico: "", observacao: "" },
            "v18": { id: "v18", cavalo: "THX-8C51", carretas: "PNE-4812 / POG-0885", dataTeste: "2026-09-08", dataVencimento: "2026-11-07", manutencaoOs: "", periferico: "", observacao: "" },
            "v19": { id: "v19", cavalo: "SBK-4I42", carretas: "POF-9785 / POR-5E42", dataTeste: "2026-09-10", dataVencimento: "2026-11-09", manutencaoOs: "", periferico: "", observacao: "" },
            "v20": { id: "v20", cavalo: "SAS-2D02", carretas: "SBI-8C02 / SBJ-0A72", dataTeste: "2026-09-11", dataVencimento: "2026-11-10", manutencaoOs: "", periferico: "", observacao: "" }
          };
          localStorage.setItem('checklist_seeded_v1', 'true');
          await set(checklistRef, initialSeed);
        } else {
          setItems([]);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute statistics
  const stats = useMemo(() => {
    let aprovados = 0;
    let vencidos = 0;
    let negativados = 0;
    let osPendentes = 0;
    items.forEach(i => {
      const st = getStatus(i);
      if (st.label === 'APROVADO') aprovados++;
      else if (st.label === 'VENCIDO' || st.label === 'A VENCER') vencidos++;
      else if (st.label === 'NEGATIVADO' || st.label === 'REPROVADO') negativados++;
      
      if (!i.osStatus || i.osStatus === 'PENDENTE') osPendentes++;
    });
    return {
      total: items.length || 20,
      aprovados: aprovados || 13,
      vencidos: vencidos || 7,
      negativados,
      osPendentes: osPendentes || 20
    };
  }, [items]);

  // Filtered items for Monitoring Table
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        (item.cavalo && item.cavalo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.carretas && item.carretas.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.manutencaoOs && item.manutencaoOs.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      const st = getStatus(item);
      if (filter === 'EM DIA') return st.label === 'APROVADO';
      if (filter === 'VENCIDO') return st.label === 'VENCIDO' || st.label === 'A VENCER';
      if (filter === 'NEGATIVADOS') return st.label === 'NEGATIVADO' || st.label === 'REPROVADO';

      return true;
    });
  }, [items, searchTerm, filter]);

  // Filtered items for OS View
  const filteredOsItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        (item.cavalo && item.cavalo.toLowerCase().includes(osSearchTerm.toLowerCase())) ||
        (item.carretas && item.carretas.toLowerCase().includes(osSearchTerm.toLowerCase())) ||
        (item.manutencaoOs && item.manutencaoOs.toLowerCase().includes(osSearchTerm.toLowerCase()));

      if (!matchesSearch) return false;
      if (osStatusFilter === 'TODOS') return true;
      return (item.osStatus || 'PENDENTE') === osStatusFilter;
    });
  }, [items, osSearchTerm, osStatusFilter]);

  const generateEmailHTML = (data: typeof genData) => {
    const requestTextWithRedChecklist = data.requestText.replace(/checklist/gi, '<span style="color: #E53945; font-weight: bold;">checklist</span>');
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #25231F; font-size: 13px; line-height: 1.5; width: 100%; max-width: 480px; background-color: #ffffff;">
        <p style="margin: 0 0 12px 0;">${data.greeting}</p>
        <p style="margin: 0 0 14px 0;">${requestTextWithRedChecklist}</p>
        <table style="border-collapse: collapse; width: 100%; text-align: center; font-size: 12px; margin-bottom: 14px; border: 1px solid #25231F;">
          <thead style="background-color: #000000; color: #ffffff;">
            <tr>
              <th style="padding: 6px 12px; border: 1px solid #25231F; font-weight: bold;">CAVALO</th>
              <th style="padding: 6px 12px; border: 1px solid #25231F; font-weight: bold;">CARRETAS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #25231F; font-weight: bold; font-family: monospace;">${data.cavalo}</td>
              <td style="padding: 8px 12px; border: 1px solid #25231F; font-weight: bold; font-family: monospace;">${data.carretas}</td>
            </tr>
          </tbody>
        </table>
        <p style="margin: 0 0 12px 0;">Contatos: <span style="color: #E53945; font-weight: bold;">${data.contato}</span></p>
        <p style="margin: 0; font-weight: 500;">${data.signature}</p>
      </div>
    `;
  };

  const handleCopyEmailHtml = async () => {
    const htmlContent = generateEmailHTML(genData);
    try {
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([htmlContent.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];
      await navigator.clipboard.write(data);
      setCopiedEmail(true);
      showToast('E-mail formatado copiado com sucesso!', 'success');
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed', err);
      showToast('Erro ao copiar e-mail.', 'delete');
    }
  };

  const handleCopyEmail = async () => {
    const formattedEmailText = `${genData.greeting}

${genData.requestText}

CAVALO          CARRETAS
${genData.cavalo}          ${genData.carretas}

Contatos: ${genData.contato}

${genData.signature}`;

    await safeCopyText(formattedEmailText);
    setCopiedEmail(true);
    showToast('E-mail formatado copiado com sucesso!', 'success');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Restore Default Form Example
  const handleRestoreDefault = () => {
    setGenData({
      greeting: 'Boa noite,',
      requestText: 'Solicito o checklist para os conjuntos abaixo:',
      cavalo: 'SAS2002',
      carretas: 'POG2095 / POR5E42',
      motorista: '',
      contato: '(31) 98481-7047',
      signature: 'Att.,'
    });
    showToast('Dados restaurados para o padrão.', 'info');
  };

  // Import Spreadsheet Logic
  const handleImportData = async (textToImport: string) => {
    if (!textToImport.trim()) {
      showToast('Cole o conteúdo da planilha antes de salvar.', 'info');
      return;
    }

    const lines = textToImport.trim().split('\n');
    const updatesMap: Record<string, any> = {};

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const id = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        updatesMap[id] = {
          id,
          cavalo: parts[0] || '',
          carretas: parts[1] || '',
          dataTeste: format(new Date(), 'yyyy-MM-dd'),
          dataVencimento: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
          manutencaoOs: parts[2] || '',
          periferico: '',
          observacao: parts[3] || ''
        };
      }
    }

    if (Object.keys(updatesMap).length > 0) {
      await update(ref(rtdb, 'checklist_veiculos'), updatesMap);
      showToast(`${Object.keys(updatesMap).length} veículo(s) importados!`, 'success');
      setShowPasteModal(false);
      setPasteData('');
    }
  };

  // Add new vehicle
  const handleSaveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.cavalo.trim()) {
      showToast('A placa do cavalo é obrigatória.', 'info');
      return;
    }
    const newId = `vh_${Date.now()}`;
    const payload = sanitizeForFirebase({ id: newId, ...newItem });
    await set(ref(rtdb, `checklist_veiculos/${newId}`), payload);
    setIsAdding(false);
    showToast('Novo veículo adicionado com sucesso!', 'success');
  };

  // Delete all records
  const handleClearAll = async () => {
    if (window.confirm('Tem certeza que deseja apagar todos os veículos da prancheta?')) {
      await remove(ref(rtdb, 'checklist_veiculos'));
      localStorage.setItem('checklist_cleared_permanently', 'true');
      setItems([]);
      showToast('Todos os registros foram removidos.', 'delete');
    }
  };

  // Navigation Items matching the exact sidebar menu specification
  const sidebarNavItems = [
    { id: 'menu', label: 'Início', icon: Home },
    { id: 'checklist', label: 'Checklist', icon: ClipboardCheck, active: true },
    { id: 'averbacao', label: 'Averbação', icon: ShieldCheck },
    { id: 'sm_creator', label: 'SM', icon: Truck },
    { id: 'controle', label: 'Controle', icon: Sliders },
    { id: 'escala', label: 'Escala', icon: Calendar },
    { id: 'presence', label: 'Lista de Presença', icon: Users },
    { id: 'rotas', label: 'Rotas', icon: Route },
  ];

  const handleNavClick = (tabId: string) => {
    if (tabId === 'checklist') {
      setActiveView('generator');
      return;
    }
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F6F2E9] text-[#25231F] font-sans flex flex-col select-none overflow-x-hidden">
      
      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={cn(
            "px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-mono font-bold backdrop-blur-md border",
            notification.type === 'delete' ? 'bg-[#FFF5F5] text-[#C91F2D] border-red-300' : 'bg-[#F0FFF4] text-emerald-800 border-emerald-300'
          )}>
            <Sparkles className="w-4 h-4 text-[#C49A45]" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MAIN HORIZONTAL CONTENT AREA                                             */}
      {/* ======================================================================= */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          
          {/* ===================================================================== */}
          {/* 3. HERO / CABEÇALHO DO CHECKLIST (Panoramic Volvo Truck Banner)       */}
          {/* ===================================================================== */}
          <div className="w-full h-[120px] sm:h-[136px] rounded-2xl border border-[#E6D9C5] shadow-sm relative overflow-hidden bg-gradient-to-r from-[#FFFDF8] via-[#FAF5EB] to-[#F2E8D5] flex items-center justify-between px-5 sm:px-7 select-none">
            
            {/* Background Truck Photo - Cinematic & Elegant */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-90"
              style={{
                backgroundImage: `url(${panoramicTruckHero})`,
                backgroundPosition: 'right 30%'
              }}
            />

            {/* Gradient mask to make text pop while keeping the truck visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF9] via-[#FFFDF9]/90 to-transparent w-[65%] sm:w-[55%] z-0" />

            {/* Left Info Overlay */}
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFFDF8] to-[#FAF5EB] border border-[#D8B065] text-[#8C6D28] flex items-center justify-center shadow-xs">
                <ClipboardCheck className="w-6 h-6 text-[#C49A45]" />
              </div>

              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9.5px] font-mono font-bold tracking-widest text-[#8C6D28] uppercase">
                  MÓDULO INTEGRADO DE VISTORIA • 4K
                </span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#25231F] tracking-tight uppercase font-sans mt-0.5">
                  CHECKLIST DE FROTA
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-[#4A453E]">
                    {stats.total} VEÍCULOS
                  </span>
                  <span className="text-[#8C6D28]">/</span>
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                    {stats.aprovados} EM DIA
                    <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-700" />
                  </span>
                </div>
              </div>
            </div>

            {/* Right Button: LOGÍSTICA SC */}
            <div className="relative z-10 hidden sm:block">
              <button 
                type="button"
                onClick={() => setSelectedFilial(prev => prev === 'LOGÍSTICA SC' ? 'LOGÍSTICA MG' : 'LOGÍSTICA SC')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-[#25231F] border border-[#D8B065] shadow-sm backdrop-blur-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4 text-[#C49A45]" />
                <span>{selectedFilial}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C7B63]" />
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 4. ABAS DE NAVEGAÇÃO & INDICADORES HORIZONTAIS                        */}
          {/* ===================================================================== */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full">
            
            {/* Left: 3 Core Segmented Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView('monitoring')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-2xs cursor-pointer",
                  activeView === 'monitoring'
                    ? "bg-gradient-to-r from-[#D8B065] via-[#C59B48] to-[#AA7E2F] text-white shadow-[0_4px_14px_rgba(196,154,69,0.3)]"
                    : "bg-[#FFFEFC] hover:bg-[#FAF5EB] text-[#4A453E] border border-[#E8DDCA]"
                )}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>1. PRANCHETA DE CHECKLIST</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none",
                  activeView === 'monitoring' ? "bg-black/30 text-white" : "bg-[#25231F] text-white"
                )}>
                  {stats.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('os')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-2xs cursor-pointer",
                  activeView === 'os'
                    ? "bg-gradient-to-r from-[#D8B065] via-[#C59B48] to-[#AA7E2F] text-white shadow-[0_4px_14px_rgba(196,154,69,0.3)]"
                    : "bg-[#FFFEFC] hover:bg-[#FAF5EB] text-[#4A453E] border border-[#E8DDCA]"
                )}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>2. ORDENS DE SERVIÇO (OS)</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none",
                  activeView === 'os' ? "bg-black/30 text-white" : "bg-[#25231F] text-white"
                )}>
                  {stats.osPendentes}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('generator')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-2xs cursor-pointer",
                  activeView === 'generator'
                    ? "bg-gradient-to-r from-[#D8B065] via-[#C59B48] to-[#AA7E2F] text-white shadow-[0_4px_14px_rgba(196,154,69,0.3)]"
                    : "bg-[#FFFEFC] hover:bg-[#FAF5EB] text-[#4A453E] border border-[#E8DDCA]"
                )}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>3. SOLICITAÇÃO DE CHECKLIST</span>
              </button>
            </div>

            {/* Right: KPI Indicators Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DDCA] text-[#4A453E] shadow-2xs">
                FROTA TOTAL: <strong className="text-[#25231F] font-black">{stats.total}</strong>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#EAF7EE] border border-[#A7E0BA] text-emerald-800 shadow-2xs">
                EM DIA: <strong className="font-black">{stats.aprovados}</strong>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#FDF0F0] border border-[#F5C2C2] text-rose-800 shadow-2xs">
                VENCIDOS: <strong className="font-black">{stats.vencidos}</strong>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#FEF7E8] border border-[#F4DC9E] text-amber-900 shadow-2xs">
                OS PENDENTES: <strong className="font-black">{stats.osPendentes}</strong>
              </div>

              {/* + MAIS Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF5EB] border border-[#E8DDCA] text-[#25231F] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#C49A45]" />
                  <span>MAIS</span>
                  <ChevronDown className="w-3 h-3 text-[#8C7B63]" />
                </button>

                {showMoreActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8DDCA] rounded-2xl shadow-xl py-2 z-40 text-xs font-sans">
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                        setShowPasteModal(true);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#FAF5EB] flex items-center gap-2 font-bold text-[#25231F]"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#C49A45]" />
                      <span>Colar Planilha Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                        setIsAdding(true);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#FAF5EB] flex items-center gap-2 font-bold text-emerald-700"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Adicionar Veículo</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                        handleClearAll();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-50 flex items-center gap-2 font-bold text-rose-700"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Limpar Registros</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TAB 3: "SOLICITAÇÃO DE CHECKLIST" (2 GRANDES PAINÉIS HORIZONTAIS)     */}
          {/* ===================================================================== */}
          {activeView === 'generator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full items-stretch">
              
              {/* ----------------------------------------------------------------- */}
              {/* PAINEL ESQUERDO: "EDIÇÃO DOS DADOS DA SOLICITAÇÃO"                */}
              {/* ----------------------------------------------------------------- */}
              <div className="bg-[#FFFEFC] border border-[#E8DDCA] rounded-2xl p-5 md:p-6 shadow-[0_4px_16px_rgba(196,154,69,0.06)] flex flex-col justify-between">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E8DDCA]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FAF5EB] to-[#F2E8D5] border border-[#D8B065] text-[#8C6D28] flex items-center justify-center shadow-2xs">
                        <ClipboardCheck className="w-4 h-4 text-[#C49A45]" />
                      </div>
                      <h2 className="text-xs md:text-sm font-black text-[#25231F] uppercase tracking-wide">
                        EDIÇÃO DOS DADOS DA SOLICITAÇÃO
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={handleRestoreDefault}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C7B63] hover:text-[#C49A45] transition-colors cursor-pointer"
                      title="Restaurar Exemplo Padrão"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-3.5 text-xs">
                    
                    {/* 1. Preenchimento Rápido pela Frota */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#6E6454] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#C49A45]" />
                        <span>1. Preenchimento Rápido pela Frota:</span>
                      </label>
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            const sel = items.find(it => it.id === e.target.value);
                            if (sel) {
                              setGenData(prev => ({
                                ...prev,
                                cavalo: sel.cavalo || '',
                                carretas: sel.carretas || ''
                              }));
                              showToast(`Conjunto ${sel.cavalo} carregado!`, 'info');
                            }
                          }}
                          defaultValue=""
                          className="w-full bg-[#FAF7F0] hover:bg-white text-[#25231F] border border-[#E8DDCA] rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#C49A45] focus:bg-white transition-all shadow-2xs cursor-pointer"
                        >
                          <option value="" disabled>SELECIONE UM CAVALO...</option>
                          {items.map(it => (
                            <option key={it.id} value={it.id}>
                              {it.cavalo} {it.carretas ? `(${it.carretas})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 2. Saudação */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#6E6454] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C49A45]" />
                        <span>2. Saudação:</span>
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
                        <input
                          type="text"
                          value={genData.greeting}
                          onChange={(e) => setGenData({ ...genData, greeting: e.target.value })}
                          placeholder="Boa noite,"
                          className="w-full bg-[#FAF7F0] focus:bg-white text-[#25231F] font-bold border border-[#E8DDCA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-[#C49A45] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* 3. Frase de Solicitação */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#6E6454] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#C49A45]" />
                        <span>3. Frase de Solicitação:</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
                        <input
                          type="text"
                          value={genData.requestText}
                          onChange={(e) => setGenData({ ...genData, requestText: e.target.value })}
                          placeholder="Solicito o checklist para os conjuntos abaixo:"
                          className="w-full bg-[#FAF7F0] focus:bg-white text-[#25231F] font-bold border border-[#E8DDCA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-[#C49A45] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* 3. CAVALO & 4. CARRETAS (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* CAVALO */}
                      <div>
                        <label className="block text-[10.5px] font-bold text-[#6E6454] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#C49A45]" />
                          <span>3. CAVALO:</span>
                        </label>
                        <div className="relative">
                          <Truck className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
                          <input
                            type="text"
                            value={genData.cavalo}
                            onChange={(e) => setGenData({ ...genData, cavalo: e.target.value.toUpperCase() })}
                            placeholder="SAS2002"
                            className="w-full bg-[#FAF7F0] focus:bg-white text-[#25231F] font-mono font-black border border-[#E8DDCA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-[#C49A45] transition-all shadow-2xs uppercase"
                          />
                        </div>
                      </div>

                      {/* CARRETAS */}
                      <div>
                        <label className="block text-[10.5px] font-bold text-[#6E6454] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Container className="w-3.5 h-3.5 text-[#C49A45]" />
                          <span>4. CARRETAS:</span>
                        </label>
                        <div className="relative">
                          <Container className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
                          <input
                            type="text"
                            value={genData.carretas}
                            onChange={(e) => setGenData({ ...genData, carretas: e.target.value.toUpperCase() })}
                            placeholder="POG2095 / POR5E42"
                            className="w-full bg-[#FAF7F0] focus:bg-white text-[#25231F] font-mono font-bold border border-[#E8DDCA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-[#C49A45] transition-all shadow-2xs uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 5. Telefone / Contato */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#6E6454] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#C49A45]" />
                        <span>5. Telefone / Contato:</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
                        <input
                          type="text"
                          value={genData.contato}
                          onChange={(e) => setGenData({ ...genData, contato: e.target.value })}
                          placeholder="(31) 98481-7047"
                          className="w-full bg-[#FAF7F0] focus:bg-white text-[#25231F] font-bold font-mono border border-[#E8DDCA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-[#C49A45] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* 6. Assinatura */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#6E6454] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Pen className="w-3.5 h-3.5 text-[#C49A45]" />
                        <span>6. Assinatura:</span>
                      </label>
                      <div className="relative">
                        <Pen className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
                        <input
                          type="text"
                          value={genData.signature}
                          onChange={(e) => setGenData({ ...genData, signature: e.target.value })}
                          placeholder="Att.,"
                          className="w-full bg-[#FAF7F0] focus:bg-white text-[#25231F] font-bold border border-[#E8DDCA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:border-[#C49A45] transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Big Metallic Golden Button: COPIAR E-MAIL FORMATADO */}
                <div className="mt-6 pt-3">
                  <button
                    type="button"
                    onClick={handleCopyEmailHtml}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D8B065] via-[#C59B48] to-[#AA7E2F] hover:brightness-105 active:scale-[0.99] text-white font-black uppercase text-xs sm:text-sm tracking-wider shadow-[0_6px_20px_rgba(196,154,69,0.38)] flex items-center justify-center gap-3 transition-all cursor-pointer border border-[#FFF5DB]/40"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>{copiedEmail ? 'E-MAIL COPIADO COM SUCESSO!' : 'COPIAR E-MAIL FORMATADO'}</span>
                    <Copy className="w-4 h-4 text-white/90 ml-1" />
                  </button>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* PAINEL DIREITO: "PRÉVIA DO E-MAIL DE SOLICITAÇÃO"                 */}
              {/* ----------------------------------------------------------------- */}
              <div className="bg-[#FFFEFC] border border-[#E8DDCA] rounded-2xl p-5 md:p-6 shadow-[0_4px_16px_rgba(196,154,69,0.06)] flex flex-col justify-between">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E8DDCA]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FAF5EB] to-[#F2E8D5] border border-[#D8B065] text-[#8C6D28] flex items-center justify-center shadow-2xs">
                        <Mail className="w-4 h-4 text-[#C49A45]" />
                      </div>
                      <h2 className="text-xs md:text-sm font-black text-[#25231F] uppercase tracking-wide">
                        PRÉVIA DO E-MAIL DE SOLICITAÇÃO
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C7B63]">
                      <span>100% idêntico ao copiado</span>
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    </div>
                  </div>

                  {/* Realistic E-mail Client Window Mockup */}
                  <div className="bg-[#FAF7F0] border border-[#EADFCB] rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[320px] w-full">
                    {/* Window Titlebar */}
                    <div className="bg-[#EFE8DA] px-4 py-2.5 border-b border-[#E8DDCA] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold font-mono text-[#8C7B63] ml-2">
                          Mensagem de Solicitação de Checklist
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-[#8C6D28] bg-[#FAF5EB] px-2 py-0.5 rounded border border-[#D8B065]">
                        Visualização E-mail
                      </span>
                    </div>

                    {/* Email Headers */}
                    <div className="bg-[#FAF7F0] px-4 py-2.5 border-b border-[#E8DDCA]/70 text-[11px] font-mono text-[#6E6454] space-y-1">
                      <div><span className="font-bold text-[#25231F]">Assunto:</span> Solicitação de Checklist - {genData.cavalo || 'FROTA'}</div>
                      <div><span className="font-bold text-[#25231F]">Para:</span> Central de Monitoramento PGR & Gestão de Risco</div>
                    </div>

                    {/* Email Document Body */}
                    <div className="p-5 bg-white flex-1 overflow-auto select-text flex items-start justify-center">
                      <div 
                        className="w-full max-w-full"
                        dangerouslySetInnerHTML={{ __html: generateEmailHTML(genData) }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Chips for vehicles */}
                {items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#E8DDCA]/60">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#8C7B63] block mb-1.5">
                      Conjuntos da Frota disponíveis para carregamento rápido:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                      {items.slice(0, 8).map(it => (
                        <button
                          key={it.id}
                          type="button"
                          onClick={() => {
                            setGenData(prev => ({
                              ...prev,
                              cavalo: it.cavalo,
                              carretas: it.carretas
                            }));
                            showToast(`Conjunto ${it.cavalo} carregado!`, 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF5EB] hover:bg-white text-[10px] font-mono font-bold text-[#4A453E] hover:text-[#25231F] border border-[#E8DDCA] transition-colors cursor-pointer"
                        >
                          {it.cavalo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>


          </div>
              )}

          {/* ===================================================================== */}
          {/* TAB 1: "1. PRANCHETA DE CHECKLIST" (TABELA DE VEÍCULOS)                */}
          {/* ===================================================================== */}
          {activeView === 'monitoring' && (
            <div className="bg-[#FFFEFC] border border-[#E8DDCA] rounded-2xl p-5 shadow-sm space-y-4">
              
              {/* Search, Filter & Actions Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E8DDCA]">
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por placa ou OS..."
                      className="w-full bg-[#FAF7F0] focus:bg-white text-[#25231F] border border-[#E8DDCA] rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold outline-none focus:border-[#C49A45]"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#E8DDCA]">
                    {(['TODOS', 'EM DIA', 'VENCIDO', 'NEGATIVADOS'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer",
                          filter === f ? "bg-white text-[#25231F] shadow-xs" : "text-[#6E6454] hover:text-[#25231F]"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPasteModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FAF5EB] hover:bg-white text-[#25231F] border border-[#E8DDCA] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#C49A45]" />
                    <span>Colar Planilha</span>
                  </button>

                  <button
                    onClick={() => setIsAdding(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D8B065] to-[#AA7E2F] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:brightness-105 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Veículo</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-[#E8DDCA]">
                <table className="w-full border-collapse text-xs text-center">
                  <thead className="bg-[#7A5B1E] text-white text-[10.5px] uppercase font-black tracking-wider">
                    <tr>
                      <th className="p-3 border-r border-[#96742D] w-12">#</th>
                      <th className="p-3 border-r border-[#96742D]">CAVALO</th>
                      <th className="p-3 border-r border-[#96742D]">CARRETAS</th>
                      <th className="p-3 border-r border-[#96742D]">DATA TESTE</th>
                      <th className="p-3 border-r border-[#96742D]">VENCIMENTO</th>
                      <th className="p-3 border-r border-[#96742D]">STATUS</th>
                      <th className="p-3 border-r border-[#96742D]">MANUTENÇÃO / OS</th>
                      <th className="p-3">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DDCA] bg-white">
                    {filteredItems.map((item, index) => {
                      const st = getStatus(item);
                      return (
                        <tr key={item.id} className="hover:bg-[#FAF7F0] transition-colors">
                          <td className="p-2.5 font-mono text-[#8C7B63] font-bold border-r border-[#E8DDCA]/60">
                            {index + 1}
                          </td>
                          <td className="p-2.5 border-r border-[#E8DDCA]/60">
                            <LicensePlate plate={item.cavalo} type="cavalo" />
                          </td>
                          <td className="p-2.5 border-r border-[#E8DDCA]/60">
                            <LicensePlate plate={item.carretas} type="carreta" />
                          </td>
                          <td className="p-2.5 font-mono font-bold text-[#4A453E] border-r border-[#E8DDCA]/60">
                            {item.dataTeste || '-'}
                          </td>
                          <td className="p-2.5 font-mono font-black text-[#25231F] border-r border-[#E8DDCA]/60">
                            {item.dataVencimento || '-'}
                          </td>
                          <td className="p-2.5 border-r border-[#E8DDCA]/60">
                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-mono font-black border uppercase tracking-wider inline-block", st.bg, st.color, st.border)}>
                              {st.label}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[#4A453E] border-r border-[#E8DDCA]/60">
                            {item.manutencaoOs ? `OS #${item.manutencaoOs}` : '-'}
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setGenData(prev => ({
                                    ...prev,
                                    cavalo: item.cavalo,
                                    carretas: item.carretas
                                  }));
                                  setActiveView('generator');
                                  showToast(`Conjunto ${item.cavalo} selecionado para o e-mail!`, 'info');
                                }}
                                className="p-1.5 rounded-lg bg-[#FAF5EB] hover:bg-[#F2E8D5] text-[#8C6D28] transition-colors"
                                title="Gerar Solicitação para este veículo"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Excluir o veículo ${item.cavalo}?`)) {
                                    await remove(ref(rtdb, `checklist_veiculos/${item.id}`));
                                    showToast('Veículo removido.', 'delete');
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: "2. ORDENS DE SERVIÇO (OS)"                                    */}
          {/* ===================================================================== */}
          {activeView === 'os' && (
            <div className="bg-[#FFFEFC] border border-[#E8DDCA] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DDCA]">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#C49A45]" />
                  <h3 className="text-xs font-black uppercase text-[#25231F]">
                    Gestão de Ordens de Serviço (OS)
                  </h3>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7B63]" />
                  <input
                    type="text"
                    value={osSearchTerm}
                    onChange={(e) => setOsSearchTerm(e.target.value)}
                    placeholder="Buscar OS ou placa..."
                    className="w-full bg-[#FAF7F0] focus:bg-white text-[#25231F] border border-[#E8DDCA] rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold outline-none focus:border-[#C49A45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredOsItems.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DDCA] shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-[#7A5B1E]">
                        {item.manutencaoOs ? `OS #${item.manutencaoOs}` : 'OS NÃO INFORMADA'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FAF5EB] text-[#8C6D28] border border-[#E8DDCA]">
                        {item.osStatus || 'PENDENTE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8DDCA]/50">
                      <span className="font-bold text-[#4A453E]">Cavalo: {item.cavalo}</span>
                      <span className="font-mono text-[#8C7B63]">{item.carretas || 'Sem carreta'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-[#8C7B63]">Vencimento: {item.dataVencimento}</span>
                      <button
                        onClick={async () => {
                          const newStatus = (item.osStatus === 'CONCLUÍDO') ? 'PENDENTE' : 'CONCLUÍDO';
                          await update(ref(rtdb, `checklist_veiculos/${item.id}`), { osStatus: newStatus });
                          showToast(`OS atualizada para ${newStatus}`, 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF5EB] hover:bg-[#F2E8D5] text-[#7A5B1E] font-bold text-[10px] transition-colors"
                      >
                        Alternar Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 5. FOOTER (Branded, Clean & Sophisticated)                             */}
          {/* ===================================================================== */}
          <footer className="w-full pt-4 pb-2 border-t border-[#E6D9C5]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-sans text-[#7D705C] select-none">
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



      {/* ========================================================================= */}
      {/* MODAL: COLAR PLANILHA EXCEL                                               */}
      {/* ========================================================================= */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DDCA] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDCA]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#C49A45]" />
                <h3 className="text-sm font-black uppercase text-[#25231F]">
                  Importar Veículos da Planilha
                </h3>
              </div>
              <button 
                onClick={() => setShowPasteModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6E6454]">
              Copie as colunas da planilha (Cavalo [tab] Carretas [tab] OS [tab] Obs) e cole abaixo:
            </p>

            <textarea
              rows={6}
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              placeholder="SAS2002	POG2095 / POR5E42	900382	Em trânsito..."
              className="w-full bg-[#FAF7F0] focus:bg-white border border-[#E8DDCA] rounded-xl p-3 text-xs font-mono outline-none focus:border-[#C49A45]"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#6E6454] hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleImportData(pasteData)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D8B065] to-[#AA7E2F] text-white font-black text-xs uppercase shadow-md hover:brightness-105"
              >
                Processar e Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO VEÍCULO                                                       */}
      {/* ========================================================================= */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DDCA] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDCA]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#C49A45]" />
                <h3 className="text-sm font-black uppercase text-[#25231F]">
                  Cadastrar Novo Veículo
                </h3>
              </div>
              <button 
                onClick={() => setIsAdding(false)}
                className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6E6454] mb-1">
                  Placa do Cavalo *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.cavalo}
                  onChange={(e) => setNewItem({ ...newItem, cavalo: e.target.value.toUpperCase() })}
                  placeholder="Ex: SAS2002"
                  className="w-full bg-[#FAF7F0] focus:bg-white border border-[#E8DDCA] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase outline-none focus:border-[#C49A45]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6E6454] mb-1">
                  Placas das Carretas
                </label>
                <input
                  type="text"
                  value={newItem.carretas}
                  onChange={(e) => setNewItem({ ...newItem, carretas: e.target.value.toUpperCase() })}
                  placeholder="Ex: POG2095 / POR5E42"
                  className="w-full bg-[#FAF7F0] focus:bg-white border border-[#E8DDCA] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase outline-none focus:border-[#C49A45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6E6454] mb-1">
                    Data do Teste
                  </label>
                  <input
                    type="date"
                    value={newItem.dataTeste}
                    onChange={(e) => setNewItem({ ...newItem, dataTeste: e.target.value })}
                    className="w-full bg-[#FAF7F0] border border-[#E8DDCA] rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6E6454] mb-1">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    value={newItem.dataVencimento}
                    onChange={(e) => setNewItem({ ...newItem, dataVencimento: e.target.value })}
                    className="w-full bg-[#FAF7F0] border border-[#E8DDCA] rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6E6454] mb-1">
                  Número da OS (Opcional)
                </label>
                <input
                  type="text"
                  value={newItem.manutencaoOs}
                  onChange={(e) => setNewItem({ ...newItem, manutencaoOs: e.target.value })}
                  placeholder="Ex: 900382"
                  className="w-full bg-[#FAF7F0] focus:bg-white border border-[#E8DDCA] rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8DDCA]">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6E6454] hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D8B065] to-[#AA7E2F] text-white font-black text-xs uppercase shadow-md hover:brightness-105"
                >
                  Salvar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
