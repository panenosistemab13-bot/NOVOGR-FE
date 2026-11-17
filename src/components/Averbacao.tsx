import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';
import { 
  ShieldCheck, 
  Zap,
  Clipboard, 
  Trash2, 
  Sparkles, 
  Check, 
  Building, 
  User, 
  CreditCard, 
  Phone, 
  Search,
  Copy,
  Plus,
  Mail,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  AlertCircle,
  MapPin,
  Truck,
  Palette,
  BarChart3,
  Cpu,
  Car,
  Home,
  ChevronLeft,
  RefreshCw,
  Flag,
  Settings,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { safeCopyText, safeCopyHtmlAndText, safeCopyImage } from '../utils/clipboard';
import { 
  parseAverbacaoData, 
  AverbacaoRow, 
  ExtraData, 
  formatCurrencyValue, 
  parseCurrencyNumber 
} from '../utils/averbacaoParser';
import { rtdb } from '../firebase';
import { ref, onValue, set } from '../utils/rtdbWithUndo';
import { logAuditAction, logDebouncedEdit } from '../utils/auditHistory';

const DEFAULT_TRANSPORTADORAS = [
  "MODECENSE",
  "3C LOGÍSTICA",
  "FROTA 3C",
  "APK TRANSPORTES",
  "TOMASI LOGÍSTICA",
  "TRANSMAGNA",
  "RNCGG EXTEMPORÂNEO",
  "GT MINAS",
  "GOBOR",
  "TRANSVALADARES"
];

const DEFAULT_TECNOLOGIAS = [
  "SIGHRA",
  "SASCAR",
  "AUTOTRAC",
  "ONIXSAT",
  "SATELLITE"
];

const COLOR_THEMES = {
  amarelo: {
    name: 'AMARELO',
    highlightClass: 'bg-[#FFEE4A] text-black border border-[#E5C820]',
    tableCellClass: 'bg-[#FFFF00] text-black border border-[#24231E]',
    borderClass: 'border-[#F2C94C]',
    accentColor: '#FFFF00',
    textColor: '#000000',
    circleBg: 'bg-[#F5C518]'
  },
  vermelho: {
    name: 'VERMELHO',
    highlightClass: 'bg-[#AD0C14] text-white border border-[#8A080E]',
    tableCellClass: 'bg-[#AD0C14] text-white border border-[#24231E]',
    borderClass: 'border-[#AD0C14]',
    accentColor: '#E11D48',
    textColor: '#FFFFFF',
    circleBg: 'bg-[#AD0C14]'
  },
  azul: {
    name: 'AZUL',
    highlightClass: 'bg-[#0B3B8C] text-white border border-[#082B66]',
    tableCellClass: 'bg-[#0B3B8C] text-white border border-[#24231E]',
    borderClass: 'border-[#0B3B8C]',
    accentColor: '#2563EB',
    textColor: '#FFFFFF',
    circleBg: 'bg-[#0B3B8C]'
  },
  verde: {
    name: 'VERDE',
    highlightClass: 'bg-[#096B36] text-white border border-[#064E27]',
    tableCellClass: 'bg-[#096B36] text-white border border-[#24231E]',
    borderClass: 'border-[#096B36]',
    accentColor: '#10B981',
    textColor: '#FFFFFF',
    circleBg: 'bg-[#096B36]'
  },
  rosa: {
    name: 'ROSA',
    highlightClass: 'bg-[#9E0E17] text-white border border-[#DFC078]',
    tableCellClass: 'bg-[#FFFBF2] text-[#1E1B18] border border-[#EAD9B0]',
    borderClass: 'border-[#DFC078]',
    accentColor: '#EC4899',
    textColor: '#FFFFFF',
    circleBg: 'bg-[#EC4899]'
  }
};

interface AverbacaoProps {
  view?: string;
  onBack?: () => void;
}

export function Averbacao({ onBack }: AverbacaoProps) {
  const [emailColor, setEmailColor] = useState<'amarelo' | 'vermelho' | 'azul' | 'verde' | 'rosa'>('amarelo');
  const activeTheme = COLOR_THEMES[emailColor];
  const emailPreviewRef = useRef<HTMLDivElement>(null);
  
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [rawInputText, setRawInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'delete' } | null>(null);
  const [isOperationalOpen, setIsOperationalOpen] = useState(true);

  const [hideAnexos, setHideAnexos] = useState(true);
  const [customTransportadoras, setCustomTransportadoras] = useState<string[]>(DEFAULT_TRANSPORTADORAS);
  const [showAddTranspInput, setShowAddTranspInput] = useState(false);
  const [newTranspName, setNewTranspName] = useState("");

  const [extraData, setExtraData] = useState<ExtraData>(() => {
    try {
      const saved = localStorage.getItem('averbacao_extra_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      origem: 'SANTA LUZIA',
      destino: 'LONDRINA',
      transportadora: 'FROTA 3C',
      placaCav: 'QWA6A22',
      placaCarr: 'DLV7307',
      tecnologia: 'SIGHRA',
      nomeMotorista: 'ROBSON LUIS VIEIRA',
      cpf: '051.248.966-09',
      telefone: '(31) 99935-0970'
    };
  });

  const [parsedRows, setParsedRows] = useState<AverbacaoRow[]>(() => {
    try {
      const saved = localStorage.getItem('averbacao_rows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return [
      {
        id: 'row-default-1',
        dataAverbacao: new Date().toLocaleDateString('pt-BR'),
        origem: 'SANTA LUZIA',
        destino: 'LONDRINA',
        placaCav: 'QWA6A22',
        placaCarr: 'DLV7307',
        nf: '312509',
        valorNf: 'R$ 1.849.200,00',
        somaVl: 'R$ 1.849.200,00',
        protocolo: 'AVB-984210',
        transportadora: 'FROTA 3C',
        tecnologia: 'SIGHRA',
        nomeMotorista: 'ROBSON LUIS VIEIRA',
        cpf: '051.248.966-09',
        telefone: '(31) 99935-0970'
      }
    ];
  });

  // Subscribe to Firebase RTDB for persistent averbacao data
  useEffect(() => {
    try {
      const rowsRef = ref(rtdb, 'averbacao_data/rows');
      const unsubscribeRows = onValue(rowsRef, (snapshot) => {
        const val = snapshot.val();
        if (val && Array.isArray(val) && val.length > 0) {
          setParsedRows(val);
          try { localStorage.setItem('averbacao_rows', JSON.stringify(val)); } catch {}
        }
      });

      const extraRef = ref(rtdb, 'averbacao_data/extra');
      const unsubscribeExtra = onValue(extraRef, (snapshot) => {
        const val = snapshot.val();
        if (val && typeof val === 'object' && Object.keys(val).length > 0) {
          setExtraData(prev => ({ ...prev, ...val }));
          try { localStorage.setItem('averbacao_extra_data', JSON.stringify(val)); } catch {}
        }
      });

      return () => {
        unsubscribeRows();
        unsubscribeExtra();
      };
    } catch (e) {
      console.warn('Firebase RTDB averbacao listener error:', e);
    }
  }, []);

  // Save to localStorage and Firebase RTDB
  useEffect(() => {
    try {
      if (parsedRows.length > 0) {
        localStorage.setItem('averbacao_rows', JSON.stringify(parsedRows));
        set(ref(rtdb, 'averbacao_data/rows'), parsedRows);
      } else {
        localStorage.removeItem('averbacao_rows');
        set(ref(rtdb, 'averbacao_data/rows'), null);
      }
    } catch (e) {
      console.warn('Falha ao salvar averbacao_rows:', e);
    }
  }, [parsedRows]);

  useEffect(() => {
    try {
      const hasAny = Object.values(extraData).some(v => typeof v === 'string' && v.trim().length > 0);
      if (hasAny) {
        localStorage.setItem('averbacao_extra_data', JSON.stringify(extraData));
        set(ref(rtdb, 'averbacao_data/extra'), extraData);
      } else {
        localStorage.removeItem('averbacao_extra_data');
        set(ref(rtdb, 'averbacao_data/extra'), null);
      }
    } catch (e) {
      console.warn('Falha ao salvar averbacao_extra_data:', e);
    }
  }, [extraData]);

  const showNotificationMsg = (message: string, type: 'success' | 'delete' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  const copyCodeToClipboard = async (label: string, code: string) => {
    await safeCopyText(code);
    setCopiedCode(label);
    showNotificationMsg(`Código ${label} (${code}) copiado!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddCustomTransp = () => {
    const trimmed = newTranspName.trim().toUpperCase();
    if (trimmed) {
      if (!customTransportadoras.includes(trimmed)) {
        setCustomTransportadoras((prev) => [...prev, trimmed]);
      }
      setExtraData(prev => ({ ...prev, transportadora: trimmed }));
      setNewTranspName("");
      setShowAddTranspInput(false);
      logAuditAction({
        action: 'ADD',
        module: 'Averbação',
        target: `Transportadora ${trimmed}`,
        details: `Cadastrou transportadora "${trimmed}"`
      });
      showNotificationMsg(`Transportadora "${trimmed}" adicionada!`);
    }
  };

  // Main intelligent parsing function
  const handleProcessInput = (text: string) => {
    if (!text || !text.trim()) {
      showNotificationMsg('Nenhum texto informado para colagem.', 'delete');
      return;
    }

    const result = parseAverbacaoData(text);

    if (result.rows.length > 0) {
      setParsedRows(result.rows);

      // Auto update extra data if pulled from spreadsheet
      setExtraData(prev => ({
        ...prev,
        origem: result.extra.origem || prev.origem,
        destino: result.extra.destino || prev.destino,
        placaCav: result.extra.placaCav || prev.placaCav,
        placaCarr: result.extra.placaCarr || prev.placaCarr,
        transportadora: result.extra.transportadora || prev.transportadora,
        tecnologia: result.extra.tecnologia || prev.tecnologia,
        nomeMotorista: result.extra.nomeMotorista || prev.nomeMotorista,
        cpf: result.extra.cpf || prev.cpf,
        telefone: result.extra.telefone || prev.telefone
      }));

      if (result.extra.transportadora && !customTransportadoras.includes(result.extra.transportadora)) {
        setCustomTransportadoras(prev => [...prev, result.extra.transportadora!]);
      }

      setShowPasteModal(false);
      setRawInputText('');
      logAuditAction({
        action: 'ADD',
        module: 'Averbação',
        target: `${result.rows.length} nota(s) importada(s)`,
        details: `Formato ${result.detectedFormat} | Rota: ${result.extra.origem || '-'} x ${result.extra.destino || '-'}`
      });
      showNotificationMsg(`${result.rows.length} nota(s) importada(s) com sucesso! [${result.detectedFormat}]`);
    } else {
      showNotificationMsg('Formato não reconhecido. Cole dados tabulados ou linhas da planilha.', 'delete');
    }
  };

  // Global paste event listener: allows user to press Ctrl+V anywhere on the Averbação page
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      // Do not intercept if user is typing in standard inputs or textareas
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      const text = e.clipboardData?.getData('text');
      if (text && text.trim()) {
        e.preventDefault();
        handleProcessInput(text);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [customTransportadoras]);

  // Read directly from clipboard via API button
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        handleProcessInput(text);
      } else {
        showNotificationMsg('A área de transferência está vazia.', 'delete');
      }
    } catch (err) {
      setShowPasteModal(true);
      showNotificationMsg('Pressione Ctrl+V dentro da caixa para colar.', 'delete');
    }
  };

  const handleUpdateOperationalField = (field: keyof ExtraData, value: string) => {
    setExtraData(prev => ({ ...prev, [field]: value }));
    setParsedRows(prev => {
      if (prev.length === 0) {
        return [{
          id: `row-${Date.now()}`,
          dataAverbacao: new Date().toLocaleDateString('pt-BR'),
          origem: field === 'origem' ? value : '',
          destino: field === 'destino' ? value : '',
          placaCav: field === 'placaCav' ? value : '',
          placaCarr: field === 'placaCarr' ? value : '',
          transportadora: field === 'transportadora' ? value : '',
          tecnologia: field === 'tecnologia' ? value : '',
          nomeMotorista: field === 'nomeMotorista' ? value : '',
          cpf: field === 'cpf' ? value : '',
          telefone: field === 'telefone' ? value : '',
          nf: '',
          valorNf: '',
          somaVl: '',
          protocolo: ''
        }];
      }
      return prev.map(row => ({
        ...row,
        [field]: value
      }));
    });
    logDebouncedEdit(`averbacao_op_${String(field)}`, {
      action: 'EDIT',
      module: 'Averbação',
      target: `Campo ${String(field)}`,
      details: `Editou "${String(field)}" para "${value}"`
    });
  };

  const handleUpdateTransportField = (index: number, field: keyof AverbacaoRow, value: string) => {
    setParsedRows(prev => {
      const copy = prev.length > 0 ? [...prev] : [{
        id: `row-${Date.now()}`,
        dataAverbacao: new Date().toLocaleDateString('pt-BR'),
        origem: '',
        destino: '',
        placaCav: '',
        placaCarr: '',
        transportadora: '',
        tecnologia: '',
        nomeMotorista: '',
        cpf: '',
        telefone: '',
        nf: '',
        valorNf: '',
        somaVl: '',
        protocolo: ''
      }];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });

    if (index === 0 || parsedRows.length <= 1) {
      if (field in extraData) {
        setExtraData(prev => ({ ...prev, [field]: value }));
      }
    }
    logDebouncedEdit(`averbacao_transp_${index}_${String(field)}`, {
      action: 'EDIT',
      module: 'Averbação',
      target: `Linha ${index + 1} (${String(field)})`,
      details: `Alterou "${String(field)}" para "${value}"`
    });
  };

  const handleClearAll = async () => {
    const emptyRow: AverbacaoRow = {
      id: `row-${Date.now()}`,
      dataAverbacao: new Date().toLocaleDateString('pt-BR'),
      origem: '',
      destino: '',
      transportadora: '',
      placaCav: '',
      placaCarr: '',
      tecnologia: '',
      nomeMotorista: '',
      cpf: '',
      telefone: '',
      nf: '',
      valorNf: '',
      somaVl: '',
      protocolo: ''
    };
    setParsedRows([emptyRow]);
    setExtraData({
      origem: '',
      destino: '',
      transportadora: '',
      placaCav: '',
      placaCarr: '',
      tecnologia: '',
      nomeMotorista: '',
      cpf: '',
      telefone: ''
    });
    try {
      localStorage.removeItem('averbacao_rows');
      localStorage.removeItem('averbacao_extra_data');
      await set(ref(rtdb, 'averbacao_data'), null);
    } catch (e) {
      console.warn('Erro ao limpar averbacao_data no Firebase:', e);
    }
    logAuditAction({
      action: 'DELETE',
      module: 'Averbação',
      target: 'Dados de Averbação',
      details: 'Limpou todas as notas e campos operacionais da averbação'
    });
    showNotificationMsg('Informações limpas! Colunas mantidas para preenchimento manual.', 'delete');
  };

  const handleRemoveRow = (index: number) => {
    const target = parsedRows[index];
    setParsedRows(prev => prev.filter((_, i) => i !== index));
    logAuditAction({
      action: 'DELETE',
      module: 'Averbação',
      target: target?.nf ? `NF ${target.nf}` : `Nota linha ${index + 1}`,
      details: `Removeu nota fiscal (Valor: ${target?.valorNf || '-'})`
    });
    showNotificationMsg('Nota fiscal removida.');
  };

  const handleAddEmptyRow = () => {
    const newRow: AverbacaoRow = {
      id: `row-${Date.now()}`,
      dataAverbacao: new Date().toLocaleDateString('pt-BR'),
      origem: parsedRows[0]?.origem || '',
      destino: parsedRows[0]?.destino || '',
      placaCav: parsedRows[0]?.placaCav || '',
      placaCarr: parsedRows[0]?.placaCarr || '',
      nf: '',
      valorNf: 'R$ 0,00',
      somaVl: 'R$ 0,00',
      protocolo: ''
    };
    setParsedRows(prev => [...prev, newRow]);
    logAuditAction({
      action: 'ADD',
      module: 'Averbação',
      target: 'Nova Nota Fiscal',
      details: 'Adicionou uma nova linha manual de nota fiscal'
    });
    showNotificationMsg('Nova linha de nota fiscal adicionada!');
  };

  const handleUpdateRowField = (index: number, field: keyof AverbacaoRow, value: string) => {
    setParsedRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    logDebouncedEdit(`averbacao_row_${index}_${String(field)}`, {
      action: 'EDIT',
      module: 'Averbação',
      target: `NF linha ${index + 1} (${String(field)})`,
      details: `Editou "${String(field)}" para "${value}"`
    });
  };

  const getTotalValue = () => {
    if (parsedRows.length === 0) return 'R$ 0,00';
    const sum = parsedRows.reduce((acc, row) => acc + parseCurrencyNumber(row.valorNf), 0);
    return formatCurrencyValue(sum);
  };

  const getRouteTitle = (rows: AverbacaoRow[]) => {
    const activeRows = rows.length > 0 ? rows : parsedRows;
    const origem = activeRows.find(r => r.origem && r.origem.trim() !== '' && r.origem !== '-')?.origem || extraData.origem || '';
    const uniqueDestinos = Array.from(new Set(activeRows.map(r => r.destino?.trim()).filter(d => d && d !== '-')));
    if (extraData.destino && !uniqueDestinos.includes(extraData.destino)) {
      if (uniqueDestinos.length === 0) uniqueDestinos.push(extraData.destino);
    }

    if (!origem && uniqueDestinos.length === 0) {
      return 'ROTA: AGUARDANDO DADOS';
    }
    if (uniqueDestinos.length === 0) {
      return `ROTA: ${origem}`;
    }
    if (uniqueDestinos.length === 1) {
      return `ROTA: ${origem || '-'} X ${uniqueDestinos[0]}`;
    }
    return `ROTA: ${origem || '-'} X MÚLTIPLOS DESTINOS (${uniqueDestinos.join(', ')})`;
  };

  const isTransportadora3C = (rows?: AverbacaoRow[]) => {
    const activeRows = rows && rows.length > 0 ? rows : (filteredRows.length > 0 ? filteredRows : parsedRows);
    const transp = (
      activeRows.find(r => r.transportadora && r.transportadora.trim() !== '' && r.transportadora !== '-')?.transportadora ||
      extraData.transportadora ||
      ''
    ).trim().toUpperCase();

    return (
      transp === '3C' ||
      transp === 'FROTA 3C' ||
      transp === 'FOTA 3C' ||
      transp.includes('FROTA 3C') ||
      transp.includes('FOTA 3C') ||
      transp.startsWith('3C ') ||
      transp.endsWith(' 3C') ||
      transp.includes('3C LOG')
    );
  };

  const getEmailSubject = (rows?: AverbacaoRow[]) => {
    const activeRows = rows && rows.length > 0 ? rows : (filteredRows.length > 0 ? filteredRows : parsedRows);
    const origemRaw = activeRows.find(r => r.origem && r.origem.trim() !== '' && r.origem !== '-')?.origem || extraData.origem || '';
    const origem = (origemRaw.trim() || 'ORIGEM').toUpperCase();

    const uniqueDestinos = Array.from(
      new Set(activeRows.map(r => r.destino?.trim()).filter(d => d && d !== '-'))
    );
    if (extraData.destino && extraData.destino.trim() !== '' && extraData.destino !== '-' && uniqueDestinos.length === 0) {
      uniqueDestinos.push(extraData.destino.trim());
    }
    const destino = (uniqueDestinos.length > 0 ? uniqueDestinos.join(' / ') : 'DESTINO').toUpperCase();

    const placaRaw = activeRows.find(r => r.placaCav && r.placaCav.trim() !== '' && r.placaCav !== '-')?.placaCav || extraData.placaCav || '';
    const placaLimpa = placaRaw.replace(/-/g, '').trim().toUpperCase();
    const placa = placaLimpa || 'PLACA';

    const prefix = isTransportadora3C(activeRows)
      ? 'AVERBAÇÃO & SM 3 CORAÇÕES'
      : 'AVERBAÇÃO 3 CORAÇÕES';

    return `${prefix} - ${origem} x ${destino} - ${placa}`;
  };

  const handleCopySubject = async () => {
    const subjectText = getEmailSubject();
    await safeCopyText(subjectText);
    setCopiedSubject(true);
    showNotificationMsg(`Assunto copiado: ${subjectText}`);
    setTimeout(() => setCopiedSubject(false), 2500);
  };

  const getUniqueProtocols = (rows: AverbacaoRow[]): string[] => {
    const activeRows = rows.length > 0 ? rows : parsedRows;
    if (activeRows.length === 0) return [];
    return Array.from(new Set(activeRows.map(r => r.protocolo?.trim()).filter(Boolean)));
  };

  const getProtocolsList = (rows: AverbacaoRow[]) => {
    const protocols = getUniqueProtocols(rows);
    return protocols.length > 0 ? protocols.join(', ') : 'PENDENTE';
  };

  const getUniqueTransportRows = (rows: AverbacaoRow[]) => {
    const activeRows = rows.length > 0 ? rows : parsedRows;
    const defaultEmptyRow: AverbacaoRow = {
      id: 'row-empty-default',
      dataAverbacao: new Date().toLocaleDateString('pt-BR'),
      origem: extraData.origem || '',
      destino: extraData.destino || '',
      transportadora: extraData.transportadora || '',
      placaCav: extraData.placaCav || '',
      placaCarr: extraData.placaCarr || '',
      tecnologia: extraData.tecnologia || '',
      nomeMotorista: extraData.nomeMotorista || '',
      cpf: extraData.cpf || '',
      telefone: extraData.telefone || '',
      nf: '',
      valorNf: '',
      somaVl: '',
      protocolo: ''
    };

    if (activeRows.length === 0) {
      return [defaultEmptyRow];
    }

    const primaryPlacaCav = activeRows.find(r => r.placaCav && r.placaCav.trim() !== '' && r.placaCav !== '-')?.placaCav || extraData.placaCav || '';
    const primaryPlacaCarr = activeRows.find(r => r.placaCarr && r.placaCarr.trim() !== '' && r.placaCarr !== '-')?.placaCarr || extraData.placaCarr || '';
    const primaryOrigem = activeRows.find(r => r.origem && r.origem.trim() !== '' && r.origem !== '-')?.origem || extraData.origem || '';

    const tripGroups = new Map<string, {
      baseRow: AverbacaoRow;
      carretas: Set<string>;
    }>();

    activeRows.forEach(row => {
      const orig = (row.origem && row.origem !== '-') ? row.origem : (extraData.origem || primaryOrigem || '');
      const dest = (row.destino && row.destino !== '-') ? row.destino : (extraData.destino || '');
      const cav = (row.placaCav && row.placaCav !== '-') ? row.placaCav : (extraData.placaCav || primaryPlacaCav || '');
      const carr = (row.placaCarr && row.placaCarr !== '-') ? row.placaCarr : '';

      const key = `${orig.toUpperCase().trim()}|${dest.toUpperCase().trim()}|${cav.toUpperCase().trim()}`;
      if (!tripGroups.has(key)) {
        tripGroups.set(key, {
          baseRow: {
            ...row,
            origem: orig,
            destino: dest,
            placaCav: cav
          },
          carretas: new Set<string>()
        });
      }

      if (carr) {
        carr.split(/[\/,;]+/).forEach(c => {
          const clean = c.trim().toUpperCase();
          if (clean) tripGroups.get(key)!.carretas.add(clean);
        });
      }
    });

    const uniqueList: AverbacaoRow[] = [];
    tripGroups.forEach(({ baseRow, carretas }) => {
      let combinedCarretas = Array.from(carretas).join(' / ');
      if (!combinedCarretas) {
        combinedCarretas = extraData.placaCarr || primaryPlacaCarr || '';
      }

      uniqueList.push({
        ...baseRow,
        placaCarr: combinedCarretas,
        transportadora: baseRow.transportadora || extraData.transportadora || '',
        tecnologia: baseRow.tecnologia || extraData.tecnologia || '',
        nomeMotorista: baseRow.nomeMotorista || extraData.nomeMotorista || '',
        cpf: baseRow.cpf || extraData.cpf || '',
        telefone: baseRow.telefone || extraData.telefone || ''
      });
    });

    return uniqueList.length > 0 ? uniqueList : [defaultEmptyRow];
  };

  const copyAsImage = async () => {
    if (!emailPreviewRef.current) return;
    setIsGeneratingImg(true);
    try {
      emailPreviewRef.current.querySelectorAll('input').forEach(input => {
        input.setAttribute('value', input.value);
      });
      const blob = await htmlToImage.toBlob(emailPreviewRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        fontEmbedCSS: ''
      });
      if (blob) {
        const result = await safeCopyImage(blob, `averbacao-${Date.now()}.png`);
        if (result.copied) {
          showNotificationMsg('Imagem da averbação copiada para a área de transferência!');
        } else if (result.downloaded) {
          showNotificationMsg('Imagem baixada com sucesso!');
        } else {
          showNotificationMsg('Não foi possível copiar a imagem.', 'delete');
        }
      }
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      showNotificationMsg('Erro ao gerar imagem.', 'delete');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const filteredRows = parsedRows.filter(r => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.placaCav && r.placaCav.toLowerCase().includes(term)) ||
      (r.placaCarr && r.placaCarr.toLowerCase().includes(term)) ||
      (r.nf && r.nf.toLowerCase().includes(term)) ||
      (r.protocolo && r.protocolo.toLowerCase().includes(term)) ||
      (r.destino && r.destino.toLowerCase().includes(term)) ||
      (r.origem && r.origem.toLowerCase().includes(term)) ||
      (r.nomeMotorista && r.nomeMotorista.toLowerCase().includes(term))
    );
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia!';
    if (hour >= 12 && hour < 18) return 'Boa tarde!';
    return 'Boa noite!';
  };

  const getCleanRouteText = (rows: AverbacaoRow[]) => {
    const raw = getRouteTitle(rows) || 'ROTA: AGUARDANDO DADOS';
    return raw.replace(/^ROTA:\s*/i, '').trim() || 'AGUARDANDO DADOS';
  };

  const copyToEmail = async () => {
    const accentHex = activeTheme.accentColor;
    const textColorHex = activeTheme.textColor;
    
    const displayRows = filteredRows.length > 0 ? filteredRows : parsedRows;
    const rowsToUse = displayRows;

    const uniqueTransportRows = getUniqueTransportRows(rowsToUse);
    const routeTitle = getRouteTitle(rowsToUse);
    const cleanRoute = getCleanRouteText(rowsToUse);
    const totalCarga = getTotalValue();
    const greeting = getGreeting();

    let imageBlob: Blob | null = null;
    const elemento = document.getElementById('email-preview');
    if (elemento) {
      try {
        elemento.querySelectorAll('input').forEach(input => {
          input.setAttribute('value', input.value);
        });
        const canvas = await html2canvas(elemento, {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 20000,
          scrollX: 0,
          scrollY: 0,
          width: elemento.scrollWidth,
          height: elemento.scrollHeight,
          windowWidth: elemento.scrollWidth,
          windowHeight: elemento.scrollHeight
        } as any);
        imageBlob = await new Promise<Blob | null>(resolve => {
          canvas.toBlob(resolve, 'image/png');
        });
      } catch (e) {
        console.warn('Erro ao gerar imagem com html2canvas:', e);
      }
    }

    const isRosaTheme = emailColor === 'rosa';

    const tableRowsHtml = uniqueTransportRows.map(row => `
      <tr style="background-color: ${isRosaTheme ? '#FFFBF2' : activeTheme.accentColor}; color: ${isRosaTheme ? '#1E1B18' : activeTheme.textColor}; font-weight: 500; text-align: center; font-size: 11.5px;">
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px; text-transform: uppercase;">${row.origem || '-'}</td>
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px; text-transform: uppercase;">${row.destino || '-'}</td>
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px; text-transform: uppercase;">${row.transportadora || extraData.transportadora || '-'}</td>
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px; font-family: Arial, sans-serif; text-transform: uppercase;">${row.placaCav || '-'}</td>
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px; font-family: Arial, sans-serif; text-transform: uppercase;">${row.placaCarr || '-'}</td>
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px; text-transform: uppercase;">${row.tecnologia || extraData.tecnologia || '-'}</td>
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px; text-transform: uppercase;">${row.nomeMotorista || extraData.nomeMotorista || '-'}</td>
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px; font-family: Arial, sans-serif;">${row.cpf || extraData.cpf || '-'}</td>
        <td style="border: 1px solid ${isRosaTheme ? '#EAD9B0' : '#3A3830'}; padding: 9px 8px;">${row.telefone || extraData.telefone || '-'}</td>
      </tr>
    `).join('');

    const uniqueProtocols = getUniqueProtocols(rowsToUse);
    const protocolsListToRender = uniqueProtocols.length > 0 ? uniqueProtocols : ['-'];
    const protocolsRowsHtml = protocolsListToRender.map(p => `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1E1B18; margin-top: 6px; font-weight: 600; letter-spacing: 0.2px;">
        PROTOCOLO: <span style="color: ${isRosaTheme ? '#B9121B' : '#0000FF'}; font-family: Arial, Helvetica, sans-serif; font-weight: 700;">${p}</span>
      </div>
    `).join('');

    const protocolsPlainText = uniqueProtocols.length > 0
      ? uniqueProtocols.map(p => `PROTOCOLO: ${p}`).join('\n')
      : 'PROTOCOLO: -';

    const htmlContent = isRosaTheme ? `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #1E1B18; line-height: 1.5; max-width: 980px; background: linear-gradient(180deg, #FFFDF9 0%, #FFF9EE 100%); padding: 20px; border: 1.5px solid #DFC078; border-radius: 22px;">
        <table style="width: 100%; height: 210px; border-collapse: collapse; margin-bottom: 16px; background-image: url('/assets/aistudio/image_e4209467.png'); background-size: cover; background-position: center; border: 1.5px solid #DFC078; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 16px; vertical-align: bottom; text-align: left; width: 27%;">
              <div style="display: inline-block; background: linear-gradient(180deg, #FFFFFF 0%, #F7E5C0 100%); border: 1.5px solid #DFB963; border-radius: 999px; padding: 8px 18px; font-size: 14px; font-weight: 700; color: #1E1B18;">
                &lt; ${greeting}
              </div>
            </td>
            <td style="padding: 16px; vertical-align: middle; text-align: center; width: 46%;">
              <div style="background: linear-gradient(135deg, #FFFFFF 0%, #FFFBF1 100%); border: 1.5px solid #D7A949; border-radius: 16px; padding: 14px 18px; text-align: left; max-width: 420px; margin: 0 auto;">
                <div style="font-size: 13px; font-weight: 700; color: #1E1B18; text-transform: uppercase; margin-bottom: 6px;">
                  ROTA: <span style="color: #C8141B;">${cleanRoute}</span>
                </div>
                ${protocolsRowsHtml}
                <div style="font-size: 13.5px; font-weight: 700; color: #1E1B18; margin-top: 8px;">
                  Valor da Carga: <span style="color: #C8141B; font-size: 15px;">${totalCarga}</span>
                </div>
              </div>
            </td>
            <td style="padding: 16px; vertical-align: bottom; text-align: right; width: 27%;">
              <div style="display: inline-block; background: linear-gradient(180deg, #FFFFFF 0%, #F7E6C2 100%); border: 1.5px solid #D7A949; border-radius: 999px; padding: 6px 16px; font-size: 12px; font-weight: 700; color: #1E1B18;">
                Seguir ↻ <span style="background: linear-gradient(180deg, #D91E28 0%, #6E0409 100%); color: #FFFFFF; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; font-size: 10px;">AVERBAÇÃO</span> realizada via sistema.
              </div>
            </td>
          </tr>
        </table>

        ${uniqueTransportRows.length > 0 ? `
          <div style="border: 1.5px solid #DFC078; border-radius: 16px; overflow: hidden; background-color: #FFFBF2;">
            <div style="background: linear-gradient(90deg, #D41A23 0%, #8F0810 55%, #4A0205 100%); color: #FFFFFF; padding: 12px 16px; font-size: 13.5px; font-weight: 600;">
              Segue dados e NF's em anexo.
            </div>
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; text-align: center;">
              <thead>
                <tr style="background: linear-gradient(180deg, #AD0F18 0%, #5E0307 100%); color: #FFFFFF; font-size: 10px; text-transform: uppercase; font-weight: 700;">
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">ORIGEM</th>
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">DESTINO</th>
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">TRANSPORTADORA</th>
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">PLACA CAVALO</th>
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">PLACA S. CARRETAS</th>
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">TECNOLOGIA</th>
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">NOME MOTORISTA</th>
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">CPF</th>
                  <th style="border: 1px solid #DFC280; padding: 9px 6px;">TELEFONE</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `.trim() : `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #141517; line-height: 1.5; max-width: 980px; background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
          <tr>
            <td style="text-align: left; vertical-align: middle;">
              <div style="display: inline-block; background-color: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 12px; padding: 8px 16px; font-size: 15px; font-weight: 400; color: #1F2937;">
                ${greeting}
              </div>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <div style="display: inline-block; background-color: #F4F5F7; border: 1px solid #DCDEE4; border-radius: 999px; padding: 6px 16px; font-size: 12.5px; color: #181715;">
                <span style="font-weight: 400;">Segue</span>
                <span style="background-color: ${accentHex}; color: ${textColorHex}; padding: 3px 10px; border-radius: 6px; font-weight: 400; font-size: 11px; text-transform: uppercase; margin: 0 4px; display: inline-block;">AVERBAÇÃO</span>
                <span style="font-weight: 400;">realizada via sistema.</span>
              </div>
            </td>
          </tr>
        </table>

        <div style="background-color: #F8FAFC; border-left: 5px solid ${accentHex}; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; font-family: Arial, Helvetica, sans-serif;">
          <div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.2px; margin-bottom: 6px;">
            ROTA: <span style="color: #0000FF; font-family: Arial, Helvetica, sans-serif; font-weight: 600;">${cleanRoute}</span>
          </div>
          ${protocolsRowsHtml}
          <div style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #000000; margin-top: 6px; font-weight: 600; letter-spacing: 0.2px;">
            Valor da Carga: <span style="color: #CC0000; font-family: Arial, Helvetica, sans-serif; font-weight: 600;">${totalCarga}</span>
          </div>
        </div>

        ${uniqueTransportRows.length > 0 ? `
          <div style="border: 2px solid #141518; border-radius: 16px; overflow: hidden; background-color: #141518;">
            <div style="background-color: #18191D; color: #ffffff; padding: 10px 16px; font-size: 13px; font-weight: 400; border-bottom: 1px solid #2E3036;">
              Segue dados e NFs em anexo.
            </div>
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; text-align: center;">
              <thead>
                <tr style="background-color: #1F2024; color: #ffffff; font-weight: 400; font-size: 10px; text-transform: uppercase;">
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">ORIGEM</th>
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">DESTINO</th>
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">TRANSPORTADORA</th>
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">PLACA CAVALO</th>
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">PLACA S. CARRETAS</th>
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">TECNOLOGIA</th>
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">NOME MOTORISTA</th>
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">CPF</th>
                  <th style="border: 1px solid #32343A; padding: 9px 6px; font-weight: 400;">TELEFONE</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `.trim();

    const plainTextTable = uniqueTransportRows.map(r => 
      `${r.origem || '-'} | ${r.destino || '-'} | ${r.transportadora || extraData.transportadora || '-'} | ${r.placaCav || '-'} | ${r.placaCarr || '-'} | ${r.tecnologia || extraData.tecnologia || '-'} | ${r.nomeMotorista || extraData.nomeMotorista || '-'} | ${r.cpf || extraData.cpf || '-'} | ${r.telefone || extraData.telefone || '-'}`
    ).join('\n');

    const plainText = `${greeting}\n\nSegue AVERBAÇÃO realizada via sistema.\n\n${routeTitle || 'ROTA: AGUARDANDO DADOS'}\n${protocolsPlainText}\nValor da Carga: ${totalCarga}\n\nSegue dados e NFs em anexo.\n\n${uniqueTransportRows.length > 0 ? `ORIGEM | DESTINO | TRANSPORTADORA | PLACA CAVALO | PLACA S. CARRETAS | TECNOLOGIA | NOME MOTORISTA | CPF | TELEFONE\n${plainTextTable}` : ''}`;

    const copiedSuccessfully = await safeCopyHtmlAndText(htmlContent, plainText, imageBlob);
    if (copiedSuccessfully) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showNotificationMsg('Formato da averbação copiado com sucesso!');
    } else {
      showNotificationMsg('Texto simples da averbação copiado!');
    }
  };

  return (
    <div
      className="w-full min-h-full flex-1 flex flex-col relative text-left bg-[#FAF6EF] p-3.5 sm:p-4 text-[#181715] font-sans"
      style={{ zoom: 0.84 }}
    >
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            className={cn(
              "fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-normal flex items-center gap-3 shadow-2xl backdrop-blur-md",
              notification.type === 'delete'
                ? "bg-[#FFF5F5] text-[#C91F2D] border-red-300"
                : "bg-[#F0FFF4] text-emerald-800 border-emerald-300"
            )}
          >
            <Check size={15} className={notification.type === 'delete' ? "text-[#C91F2D]" : "text-emerald-600"} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* GRID SYSTEM: MASTER BOARD ON THE LEFT, SIDEBAR ON THE RIGHT               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-3.5 w-full items-start">
        
        {/* LEFT COLUMN: STACKED CARDS MATCHING REFERENCE DESIGN */}
        <div className="flex flex-col gap-2.5 w-full">
          
          {/* CARD 1: TOP CONTROLS BAR (CÓDIGOS RÁPIDOS + PLANILHA + LIMPAR) */}
          <div className="bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl p-3 sm:px-4 sm:py-3 shadow-[0_4px_16px_rgba(0,0,0,0.035)] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap flex-1">
              {/* Branded Badge Container */}
              <div className="flex items-center gap-2.5 bg-[#FAF6EE] border border-[#EDE3CE]/90 rounded-2xl px-3.5 py-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#24231E] flex items-center justify-center shadow-xs shrink-0">
                  <Zap size={15} className="text-[#F5B82E] fill-[#F5B82E]" />
                </div>
                <div className="leading-tight pr-1">
                  <span className="text-[11px] font-normal uppercase tracking-wider text-[#181715] block">
                    CÓDIGOS RÁPIDOS
                  </span>
                  <span className="text-[10px] font-normal text-[#7A7469] block">
                    Clique para copiar
                  </span>
                </div>
              </div>

              {/* Interactive Quick Code Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
                {[
                  { label: 'CÁPSULA', code: '9000000982' },
                  { label: 'MÁQUINA', code: '000000901' },
                  { label: 'EMBARQUES', code: '132' },
                ].map((item) => {
                  const isItemCopied = copiedCode === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => copyCodeToClipboard(item.label, item.code)}
                      title={`Clique para copiar ${item.label}: ${item.code}`}
                      className={cn(
                        "group relative flex items-center justify-between gap-2 px-4 py-2 rounded-2xl border text-left transition-all duration-150 cursor-pointer select-none active:scale-[0.98]",
                        isItemCopied
                          ? "bg-emerald-50 border-emerald-400 shadow-xs"
                          : "bg-white hover:bg-[#FFFDF9] border-[#EDE3CE] hover:border-[#D69E2E] shadow-[0_2px_6px_rgba(0,0,0,0.025)]"
                      )}
                    >
                      <div className="min-w-0">
                        <span className={cn(
                          "text-[9.5px] font-normal uppercase tracking-wider block transition-colors",
                          isItemCopied ? "text-emerald-700" : "text-[#7A7469]"
                        )}>
                          {item.label}
                        </span>
                        <span className={cn(
                          "text-xs sm:text-[13px] font-normal tracking-tight block mt-0.5 tabular-nums",
                          isItemCopied ? "text-emerald-900" : "text-[#181715]"
                        )}>
                          {item.code}
                        </span>
                      </div>

                      <div className="shrink-0">
                        {isItemCopied ? (
                          <Check size={14} className="text-emerald-600 stroke-[2]" />
                        ) : (
                          <Copy size={14} className="text-[#C8922A] group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Pill Buttons: PLANILHA & LIMPAR */}
            <div className="flex items-center gap-2.5 justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowPasteModal(true)}
                className="bg-[#282622] hover:bg-[#383630] text-white text-[11px] font-normal uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap"
                title="Abrir caixa de colagem manual de planilha"
              >
                <FileSpreadsheet size={14} className="text-[#F5B82E]" />
                <span>PLANILHA</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="bg-[#BA0C16] hover:bg-[#9E0810] text-white text-[11px] font-normal uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap"
                title="Limpar todos os registros"
              >
                <Trash2 size={14} className="text-white" />
                <span>LIMPAR</span>
              </button>
            </div>
          </div>

          {/* CARD 2: PALETA DE CORES DO E-MAIL */}
          <div className="bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl px-4 py-3 shadow-[0_3px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#FEF4D6] flex items-center justify-center shrink-0">
                <Palette size={16} className="text-[#D99B16]" />
              </div>
              <span className="text-xs font-normal uppercase tracking-wide text-[#181715]">
                PALETA DE CORES DO E-MAIL
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {(Object.keys(COLOR_THEMES) as Array<keyof typeof COLOR_THEMES>).map((key) => {
                const theme = COLOR_THEMES[key];
                const isSelected = emailColor === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEmailColor(key)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-xs",
                      theme.circleBg,
                      isSelected
                        ? "ring-2 ring-offset-2 ring-[#C8922A] scale-105"
                        : "opacity-90 hover:opacity-100 hover:scale-105"
                    )}
                    title={theme.name}
                  >
                    {isSelected && (
                      <Check
                        size={14}
                        className={cn("stroke-[2.2]", key === 'amarelo' ? "text-[#181715]" : "text-white")}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 3: HEADER BAR - FORMATO PARA CLIENTE DE E-MAIL / CORPO DA MENSAGEM DE AVERBAÇÃO */}
          <div className="bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl px-4 py-3 shadow-[0_3px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D69E2E] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mail size={17} />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[10px] font-normal uppercase tracking-wider text-[#6E685F] block">
                  FORMATO PARA CLIENTE DE E-MAIL
                </span>
                <span className="text-xs sm:text-[13px] font-normal text-[#181715] uppercase tracking-tight block mt-0.5">
                  CORPO DA MENSAGEM DE AVERBAÇÃO
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopySubject}
                className={cn(
                  "text-[11px] font-normal uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap",
                  copiedSubject
                    ? "bg-emerald-600 text-white"
                    : "bg-[#282622] hover:bg-[#383630] text-white"
                )}
                title="Copiar assunto do e-mail"
              >
                {copiedSubject ? <Check size={14} /> : <Copy size={14} className="text-[#F5B82E]" />}
                <span>{copiedSubject ? 'ASSUNTO COPIADO!' : 'COPIAR ASSUNTO'}</span>
              </button>

              <button
                id="btnCopiarEmail"
                type="button"
                onClick={copyToEmail}
                className={cn(
                  "text-[11px] font-normal uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap",
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-[#BA0C16] hover:bg-[#9E0810] text-white"
                )}
                title="Copiar para e-mail"
              >
                {copied ? <Check size={14} /> : <Copy size={14} className="text-white" />}
                <span>{copied ? 'COPIADO!' : 'COPIAR PARA EMAIL'}</span>
              </button>
            </div>
          </div>

          {/* CARD 4: ASSUNTO DO E-MAIL BAR (OCULTO) */}
          <div className="hidden bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.03)] flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <span className="text-[10px] font-normal uppercase tracking-wider text-[#6E685F]">
                  ASSUNTO DO E-MAIL
                </span>
                {isTransportadora3C() && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FCE588] text-[#181715] text-[10px] font-normal uppercase tracking-wide">
                    MODO 3C / FROTA 3C (&amp; SM)
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-[14px] font-normal text-[#181715] select-all break-words tracking-tight">
                {getEmailSubject()}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopySubject}
              className={cn(
                "px-4 py-2 rounded-full text-[11px] font-normal uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 border whitespace-nowrap",
                copiedSubject
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-[#FAF6EE] hover:bg-[#F3E9D2] text-[#181715] border-[#E6D6B8] shadow-2xs active:scale-95"
              )}
              title="Copiar assunto do e-mail"
            >
              {copiedSubject ? <Check size={13} className="text-white" /> : <Copy size={13} className="text-[#C8922A]" />}
              <span>{copiedSubject ? 'COPIADO!' : 'COPIAR ASSUNTO'}</span>
            </button>
          </div>

          {/* CARD 5: EMAIL BODY PREVIEW CONTAINER (PAINEL DE AVERBAÇÃO DA ROTA) */}
          {emailColor === 'rosa' ? (
            <div
              id="email-preview"
              ref={emailPreviewRef}
              className="relative rounded-[24px] overflow-hidden border-[1.5px] border-[#DFC078] bg-gradient-to-b from-[#FFFDF9] via-[#FFF9EE] to-[#FAF0D8] text-left font-sans text-[#1E1B18] shadow-[0_10px_30px_rgba(110,65,15,0.12)]"
            >
              {/* TOP HERO SECTION */}
              <div 
                className="relative w-full min-h-[210px] sm:min-h-[224px] flex flex-col justify-center overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url('/assets/aistudio/image_e4209467.png')` }}
              >

                {/* Soft warm sunlight glow in center-top behind the Rota card */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse 42% 85% at 50% 25%, rgba(255,244,218,0.65) 0%, rgba(255,255,255,0) 100%)',
                  }}
                />

                {/* Hero Foreground Controls & Cards */}
                <div className="relative z-10 w-full px-2.5 sm:px-3.5 pt-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left spacer matching background greeting pill position in image_e4209467.png */}
                  <div className="lg:w-[27%] shrink-0 hidden lg:block" />

                  {/* Center: ROTA + PROTOCOLOS + VALOR DA CARGA Cream & Gold Card */}
                  <div className="relative flex-1 max-w-[500px] rounded-[20px] border-[1.5px] border-[#D7A949] bg-gradient-to-br from-[#FFFFFF] via-[#FFFBF1] to-[#F8E6C2] px-5 py-3.5 shadow-[0_8px_22px_rgba(110,72,16,0.16)] overflow-hidden">
                    {/* Subtle diagonal gold shimmer */}
                    <div
                      className="pointer-events-none absolute -right-10 -bottom-8 w-44 h-24 rounded-full opacity-35"
                      style={{ background: 'linear-gradient(135deg, transparent 25%, #E7C26E 100%)' }}
                    />

                    <div className="relative z-10 space-y-2">
                      {/* ROTA */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#DF1F29] to-[#980B13] flex items-center justify-center shrink-0 shadow-xs border border-[#F3D17F]">
                          <MapPin size={13} className="text-white stroke-[2.3]" />
                        </div>
                        <div className="text-[13.5px] font-bold uppercase tracking-[0.015em] break-words">
                          <span className="text-[#1E1B18]">ROTA: </span>
                          <span className="text-[#C8141B]">
                            {getCleanRouteText(filteredRows.length > 0 ? filteredRows : parsedRows)}
                          </span>
                        </div>
                      </div>

                      {/* PROTOCOLO(S) */}
                      {(getUniqueProtocols(filteredRows.length > 0 ? filteredRows : parsedRows).length > 0
                        ? getUniqueProtocols(filteredRows.length > 0 ? filteredRows : parsedRows)
                        : ['-']
                      ).map((prot, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#FFE693] via-[#E1AD3B] to-[#AD7714] flex items-center justify-center shrink-0 shadow-xs border border-[#9E6A10]">
                            <Clipboard size={12} className="text-[#FFFDF5] stroke-[2.2]" />
                          </div>
                          <div className="text-[13.5px] font-bold tracking-[0.015em]">
                            <span className="uppercase text-[#1E1B18]">PROTOCOLO: </span>
                            <span className="text-[#C8141B] tabular-nums">{prot}</span>
                          </div>
                        </div>
                      ))}

                      {/* Valor da Carga */}
                      <div className="flex items-center gap-2.5 pt-0.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#FFE693] via-[#E1AD3B] to-[#AD7714] flex items-center justify-center shrink-0 shadow-xs border border-[#8E5D08] text-[12px] font-black text-[#2A1B02]">
                          $
                        </div>
                        <div className="text-[13.5px] font-bold tracking-[0.015em]">
                          <span className="text-[#1E1B18]">Valor da Carga: </span>
                          <span className="text-[15.5px] font-extrabold text-[#C8141B] tabular-nums">
                            {getTotalValue()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Capsule (Seguir ⟳ [✓ AVERBAÇÃO] realizada via sistema.) */}
                  <div className="flex items-center justify-start lg:justify-end shrink-0 lg:pt-8">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-b from-[#FFFFFF] via-[#FFFBF3] to-[#F7E6C2] border-[1.5px] border-[#D7A949] rounded-full px-3.5 py-1.5 shadow-[0_6px_16px_rgba(120,82,20,0.14)] flex-wrap">
                      <span className="text-[12px] font-semibold text-[#1E1B18]">Seguir</span>
                      <RefreshCw size={13} className="text-[#2D241C] stroke-[2.2]" />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-b from-[#D91E28] via-[#A90C14] to-[#6E0409] border border-[#ECC871] text-white text-[11px] font-bold uppercase tracking-wider shadow-[0_2px_6px_rgba(120,8,14,0.35)]">
                        <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#FFEAA3] to-[#C88E22] flex items-center justify-center">
                          <Check size={9} className="text-[#6E050A] stroke-[3]" />
                        </span>
                        <span>AVERBAÇÃO</span>
                      </span>
                      <span className="text-[12px] font-semibold text-[#1E1B18]">
                        realizada via sistema.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM TABLE SECTION + CORNER RIBBONS */}
              <div className="relative px-3 sm:px-4 pb-5 pt-1">
                {/* Bottom-Right Crimson & Gold Corner Ribbon */}
                <svg
                  className="pointer-events-none absolute right-0 bottom-0 w-72 h-24 select-none"
                  viewBox="0 0 288 96"
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="rosaBottomCrimson" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D61F29" />
                      <stop offset="60%" stopColor="#940A12" />
                      <stop offset="100%" stopColor="#580308" />
                    </linearGradient>
                    <linearGradient id="rosaBottomGold" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#FFF0B8" />
                      <stop offset="50%" stopColor="#E1B555" />
                      <stop offset="100%" stopColor="#A97922" />
                    </linearGradient>
                  </defs>
                  <path d="M55 96 C145 78 220 55 288 22 L288 96 Z" fill="url(#rosaBottomCrimson)" />
                  <path d="M25 96 C135 76 218 52 288 12 L288 26 C220 60 140 82 48 96 Z" fill="url(#rosaBottomGold)" />
                </svg>

                {/* LUXURY TABLE CARD */}
                <div className="relative z-10 rounded-[18px] p-[2.5px] bg-gradient-to-b from-[#FFFDF7] via-[#F2D99D] to-[#D4A448] border-[1.5px] border-[#DFC078] shadow-[0_10px_26px_rgba(95,12,12,0.20)]">
                  <div className="rounded-[15px] overflow-hidden border border-[#C99B42]/60 bg-[#FFFBF2]">
                    {/* Banner Header Bar */}
                    <div className="relative px-4 py-2.5 flex items-center justify-between overflow-hidden bg-gradient-to-r from-[#D41A23] via-[#8F0810] to-[#4A0205] border-b border-[#E5BE66]/70">
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-white/40 via-[#FFE4A0]/35 to-transparent pointer-events-none" />

                      {/* Subtle dotted world texture */}
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
                        viewBox="0 0 900 48"
                        preserveAspectRatio="none"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {Array.from({ length: 42 }).map((_, cIdx) =>
                          Array.from({ length: 5 }).map((__, rIdx) => (
                            <circle
                              key={`${cIdx}-${rIdx}`}
                              cx={280 + cIdx * 13}
                              cy={6 + rIdx * 9}
                              r={(cIdx + rIdx) % 3 === 0 ? 1.5 : 0.9}
                              fill="#FF8C8C"
                            />
                          ))
                        )}
                      </svg>

                      <div className="flex items-center gap-3 z-10">
                        {/* Metallic Gold Semi-Truck Icon */}
                        <svg className="w-7 h-5 shrink-0" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="2" width="18" height="13" rx="2" fill="#F5CA68" />
                          <path d="M19 6H25.5C26.4 6 27.1 6.5 27.5 7.3L30 12.2V15H19V6Z" fill="#DFAA3B" />
                          <path d="M21 7.8H25.2L27.3 11.5H21V7.8Z" fill="#6F070C" />
                          <circle cx="7" cy="17" r="3" fill="#6F070C" stroke="#F8D989" strokeWidth="1.8" />
                          <circle cx="24" cy="17" r="3" fill="#6F070C" stroke="#F8D989" strokeWidth="1.8" />
                        </svg>
                        <span className="text-[13.5px] sm:text-[14.5px] font-semibold text-white tracking-wide drop-shadow-xs">
                          Segue dados e NF&apos;s em anexo.
                        </span>
                      </div>

                      {/* Right Corner Diagonal Gold Stripes */}
                      <svg
                        className="absolute right-0 top-0 h-full w-28 pointer-events-none"
                        viewBox="0 0 112 48"
                        preserveAspectRatio="none"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <polygon points="32,48 68,0 79,0 43,48" fill="#F3C968" />
                        <polygon points="49,48 85,0 100,0 64,48" fill="#D59A2B" />
                      </svg>
                    </div>

                    {/* Inner Editable Table */}
                    <div className="overflow-x-auto bg-gradient-to-b from-[#FFFDF9] to-[#FBF0DA]">
                      <table className="w-full border-collapse text-center text-xs font-sans">
                        <thead>
                          <tr className="bg-gradient-to-b from-[#AD0F18] via-[#84070E] to-[#5E0307] text-white text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-2 border-r border-[#C9854B]/45 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <MapPin size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>ORIGEM</span>
                              </div>
                            </th>
                            <th className="py-2.5 px-2 border-r border-[#C9854B]/45 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <Flag size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>DESTINO</span>
                              </div>
                            </th>
                            <th className="py-2.5 px-2 border-r border-[#C9854B]/45 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <Truck size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>TRANSPORTADORA</span>
                              </div>
                            </th>
                            <th className="py-2.5 px-2 border-r border-[#C9854B]/45 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <CreditCard size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>PLACA CAVALO</span>
                              </div>
                            </th>
                            <th className="py-2.5 px-2 border-r border-[#C9854B]/45 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <Truck size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>PLACA S. CARRETAS</span>
                              </div>
                            </th>
                            <th className="py-2.5 px-2 border-r border-[#C9854B]/45 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <Settings size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>TECNOLOGIA</span>
                              </div>
                            </th>
                            <th className="py-2.5 px-2 border-r border-[#C9854B]/45 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <User size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>NOME MOTORISTA</span>
                              </div>
                            </th>
                            <th className="py-2.5 px-2 border-r border-[#C9854B]/45 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <FileText size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>CPF</span>
                              </div>
                            </th>
                            <th className="py-2.5 px-2 font-bold">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <Phone size={13} className="text-[#F5CB64] stroke-[2] shrink-0" />
                                <span>TELEFONE</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getUniqueTransportRows(filteredRows.length > 0 ? filteredRows : parsedRows).map((row, idx) => (
                            <tr
                              key={row.id || idx}
                              className="bg-gradient-to-b from-[#FFFDF9] to-[#FBF0DA] text-[#1E1B18] font-semibold text-[11.5px]"
                            >
                              <td className="py-3 px-1.5 border-t border-r border-[#DFC280] uppercase">
                                <input
                                  type="text"
                                  value={row.origem || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'origem', e.target.value.toUpperCase())}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold uppercase outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                              <td className="py-3 px-1.5 border-t border-r border-[#DFC280] uppercase">
                                <input
                                  type="text"
                                  value={row.destino || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'destino', e.target.value.toUpperCase())}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold uppercase outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                              <td className="py-3 px-1.5 border-t border-r border-[#DFC280] uppercase">
                                <input
                                  type="text"
                                  value={row.transportadora || extraData.transportadora || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'transportadora', e.target.value.toUpperCase())}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold uppercase outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                              <td className="py-3 px-1.5 border-t border-r border-[#DFC280]">
                                <input
                                  type="text"
                                  value={row.placaCav || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'placaCav', e.target.value.toUpperCase())}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold uppercase outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                              <td className="py-3 px-1.5 border-t border-r border-[#DFC280]">
                                <input
                                  type="text"
                                  value={row.placaCarr || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'placaCarr', e.target.value.toUpperCase())}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold uppercase outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                              <td className="py-3 px-1.5 border-t border-r border-[#DFC280] uppercase">
                                <input
                                  type="text"
                                  value={row.tecnologia || extraData.tecnologia || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'tecnologia', e.target.value.toUpperCase())}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold uppercase outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                              <td className="py-3 px-1.5 border-t border-r border-[#DFC280] uppercase">
                                <input
                                  type="text"
                                  value={row.nomeMotorista || extraData.nomeMotorista || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'nomeMotorista', e.target.value.toUpperCase())}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold uppercase outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                              <td className="py-3 px-1.5 border-t border-r border-[#DFC280] tabular-nums">
                                <input
                                  type="text"
                                  value={row.cpf || extraData.cpf || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'cpf', e.target.value)}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold tabular-nums outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                              <td className="py-3 px-1.5 border-t border-[#DFC280] tabular-nums">
                                <input
                                  type="text"
                                  value={row.telefone || extraData.telefone || ''}
                                  onChange={(e) => handleUpdateTransportField(idx, 'telefone', e.target.value)}
                                  placeholder="-"
                                  className="w-full bg-transparent text-center font-semibold tabular-nums outline-none focus:bg-[#F5E8C8]/50 rounded px-1 text-[11.5px] tracking-wide text-[#1E1B18]"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              ref={emailPreviewRef}
              className="bg-white border border-[#E5E7EB] rounded-3xl p-5 sm:p-6 text-left font-sans text-[#181715] space-y-4 shadow-[0_4px_18px_rgba(0,0,0,0.035)]"
            >
              {/* TOP ROW: GREETING PILL (LEFT) & STATUS CAPSULE (RIGHT) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left Greeting Pill */}
                <div className="inline-flex items-center bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-4 py-2.5 self-start">
                  <span className="text-[15px] font-normal tracking-normal text-[#1F2937] leading-none">
                    {getGreeting()}
                  </span>
                </div>

                {/* Right Status Capsule Pill */}
                <div className="inline-flex items-center gap-2 bg-[#F4F5F7] border border-[#DCDEE4] rounded-full px-4 py-1.5 self-start sm:self-auto">
                  <span className="text-xs sm:text-[12.5px] font-normal text-[#181715]">
                    Segue
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-md font-normal text-[11px] uppercase tracking-wide"
                    style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}
                  >
                    AVERBAÇÃO
                  </span>
                  <span className="text-xs sm:text-[12.5px] font-normal text-[#26272B]">
                    realizada via sistema.
                  </span>
                </div>
              </div>

              {/* MIDDLE BLOCK: ROTA + PROTOCOLOS + VALOR DA CARGA (MATCHING image_aac15e6e.png) */}
              <div
                className="bg-[#F8FAFC] rounded-xl px-5 py-4 space-y-2 border-l-[5px]"
                style={{ borderLeftColor: activeTheme.accentColor, fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                {/* ROTA */}
                <div className="text-[13px] font-semibold uppercase tracking-[0.015em] break-words">
                  <span className="text-[#000000]">ROTA: </span>
                  <span className="text-[#0000FF]">
                    {getCleanRouteText(filteredRows.length > 0 ? filteredRows : parsedRows)}
                  </span>
                </div>

                {/* PROTOCOLO(S) */}
                {(getUniqueProtocols(filteredRows.length > 0 ? filteredRows : parsedRows).length > 0
                  ? getUniqueProtocols(filteredRows.length > 0 ? filteredRows : parsedRows)
                  : ['-']
                ).map((prot, idx) => (
                  <div key={idx} className="text-[13px] font-semibold tracking-[0.015em]">
                    <span className="uppercase text-[#000000]">PROTOCOLO: </span>
                    <span className="text-[#0000FF] tabular-nums">{prot}</span>
                  </div>
                ))}

                {/* Valor da Carga */}
                <div className="text-[13px] font-semibold tracking-[0.015em] pt-0.5">
                  <span className="text-[#000000]">Valor da Carga: </span>
                  <span className="text-[#CC0000] tabular-nums">
                    {getTotalValue()}
                  </span>
                </div>
              </div>

              {/* BOTTOM UNIFIED TABLE CARD MATCHING REFERENCE IMAGE (image_16a38314.png) */}
              <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#2A2C32] via-[#15161A] to-[#0E0F12] shadow-[0_8px_22px_rgba(0,0,0,0.12)] border border-[#18191C]">
                
                {/* Top Glossy Dark Bar: Gold Truck + "Segue dados e NFs em anexo." + Diagonal Yellow Corner Stripes */}
                <div className="relative px-4 py-2.5 flex items-center justify-between overflow-hidden">
                  {/* Subtle Top Gloss Line */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-white/30 via-white/10 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center gap-2.5 z-10">
                    {/* Gold Truck SVG Icon */}
                    <svg className="w-6 h-5 shrink-0" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 3C1 1.89543 1.89543 1 3 1H16C17.1046 1 18 1.89543 18 3V14H1V3Z" fill="#FFD600" />
                      <path d="M18 5.5H23.2C23.9 5.5 24.5 5.9 24.8 6.5L27 11V14H18V5.5Z" fill="#F5B800" />
                      <path d="M19.5 7H23L24.8 10.5H19.5V7Z" fill="#18191D" />
                      <circle cx="6.5" cy="15.5" r="2.8" fill="#18191D" stroke="#FFD600" strokeWidth="1.7" />
                      <circle cx="22.5" cy="15.5" r="2.8" fill="#18191D" stroke="#FFD600" strokeWidth="1.7" />
                    </svg>
                    <span className="text-xs sm:text-[13.5px] font-normal text-white/95 tracking-wide">
                      Segue dados e NFs em anexo.
                    </span>
                  </div>

                  {/* Right Corner Diagonal Yellow Stripes matching image_16a38314.png */}
                  <svg className="absolute right-0 top-0 h-full w-24 pointer-events-none" viewBox="0 0 96 44" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="44,44 76,0 85,0 53,44" fill="#FFD600" />
                    <polygon points="58,44 90,0 96,0 96,44" fill="#FFD600" />
                  </svg>
                </div>

                {/* Inner Rounded Table Frame */}
                <div className="overflow-x-auto rounded-t-2xl border-t border-[#3A3C44] bg-[#141518]">
                  <table className="w-full border-collapse text-center text-xs font-sans">
                    <thead>
                      <tr className="bg-gradient-to-b from-[#2C2E34] via-[#18191D] to-[#0D0E11] text-white text-[10px] sm:text-[10.5px] font-normal uppercase tracking-wider">
                        <th className="py-3 px-2 border-r border-[#2E3036] font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <MapPin size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>ORIGEM</span>
                          </div>
                        </th>
                        <th className="py-3 px-2 border-r border-[#2E3036] font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <MapPin size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>DESTINO</span>
                          </div>
                        </th>
                        <th className="py-3 px-2 border-r border-[#2E3036] font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <Truck size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>TRANSPORTADORA</span>
                          </div>
                        </th>
                        <th className="py-3 px-2 border-r border-[#2E3036] font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <CreditCard size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>PLACA CAVALO</span>
                          </div>
                        </th>
                        <th className="py-3 px-2 border-r border-[#2E3036] font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <Truck size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>PLACA S. CARRETAS</span>
                          </div>
                        </th>
                        <th className="py-3 px-2 border-r border-[#2E3036] font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <Cpu size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>TECNOLOGIA</span>
                          </div>
                        </th>
                        <th className="py-3 px-2 border-r border-[#2E3036] font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <User size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>NOME MOTORISTA</span>
                          </div>
                        </th>
                        <th className="py-3 px-2 border-r border-[#2E3036] font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <Clipboard size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>CPF</span>
                          </div>
                        </th>
                        <th className="py-3 px-2 font-normal">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <Phone size={13} className="text-[#FFD600] stroke-[1.7] shrink-0" />
                            <span>TELEFONE</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getUniqueTransportRows(filteredRows.length > 0 ? filteredRows : parsedRows).map((row, idx) => (
                        <tr 
                          key={row.id || idx}
                          className={cn("font-normal text-[11.5px]", activeTheme.tableCellClass)}
                          style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}
                        >
                          <td className="py-3 px-1.5 border-t border-r border-black/25 uppercase font-normal">
                            <input
                              type="text"
                              value={row.origem || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'origem', e.target.value.toUpperCase())}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal uppercase outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                          <td className="py-3 px-1.5 border-t border-r border-black/25 uppercase font-normal">
                            <input
                              type="text"
                              value={row.destino || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'destino', e.target.value.toUpperCase())}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal uppercase outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                          <td className="py-3 px-1.5 border-t border-r border-black/25 uppercase font-normal">
                            <input
                              type="text"
                              value={row.transportadora || extraData.transportadora || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'transportadora', e.target.value.toUpperCase())}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal uppercase outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                          <td className="py-3 px-1.5 border-t border-r border-black/25 font-normal">
                            <input
                              type="text"
                              value={row.placaCav || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'placaCav', e.target.value.toUpperCase())}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal uppercase outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                          <td className="py-3 px-1.5 border-t border-r border-black/25 font-normal">
                            <input
                              type="text"
                              value={row.placaCarr || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'placaCarr', e.target.value.toUpperCase())}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal uppercase outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                          <td className="py-3 px-1.5 border-t border-r border-black/25 uppercase font-normal">
                            <input
                              type="text"
                              value={row.tecnologia || extraData.tecnologia || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'tecnologia', e.target.value.toUpperCase())}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal uppercase outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                          <td className="py-3 px-1.5 border-t border-r border-black/25 uppercase font-normal">
                            <input
                              type="text"
                              value={row.nomeMotorista || extraData.nomeMotorista || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'nomeMotorista', e.target.value.toUpperCase())}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal uppercase outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                          <td className="py-3 px-1.5 border-t border-r border-black/25 tabular-nums font-normal">
                            <input
                              type="text"
                              value={row.cpf || extraData.cpf || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'cpf', e.target.value)}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal tabular-nums outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                          <td className="py-3 px-1.5 border-t border-black/25 tabular-nums font-normal">
                            <input
                              type="text"
                              value={row.telefone || extraData.telefone || ''}
                              onChange={(e) => handleUpdateTransportField(idx, 'telefone', e.target.value)}
                              placeholder="-"
                              className="w-full bg-transparent text-center font-normal tabular-nums outline-none focus:bg-black/10 rounded px-1 text-[11.5px] tracking-wide"
                              style={{ color: activeTheme.textColor }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: UNIFIED "DADOS OPERACIONAIS" SIDEBAR CARD */}
        <div className="bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col w-full shrink-0">
          
          {/* Card Header */}
          <button
            type="button"
            onClick={() => setIsOperationalOpen(!isOperationalOpen)}
            className="w-full flex items-center justify-between pb-3.5 border-b border-[#EDE3CE] cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 size={20} className="text-[#F0A818] stroke-[2]" />
              <span className="text-xs sm:text-[13px] font-medium uppercase text-[#181715] tracking-wide">
                DADOS OPERACIONAIS
              </span>
            </div>
            {isOperationalOpen ? (
              <ChevronUp size={18} className="text-[#D69E2E]" />
            ) : (
              <ChevronDown size={18} className="text-[#D69E2E]" />
            )}
          </button>

          {/* Operational Fields List */}
          {isOperationalOpen && (
            <div className="pt-3.5 space-y-3 text-left">
              {[
                { key: 'origem' as const, label: 'ORIGEM', placeholder: 'SANTA LUZIA', icon: MapPin, uppercase: true },
                { key: 'destino' as const, label: 'DESTINO', placeholder: 'LONDRINA', icon: MapPin, uppercase: true },
                { key: 'transportadora' as const, label: 'TRANSPORTADORA', placeholder: 'FROTA 3C', icon: Truck, uppercase: true },
                { key: 'placaCav' as const, label: 'PLACA CAVALO', placeholder: 'QWA6A22', icon: Car, uppercase: true },
                { key: 'placaCarr' as const, label: 'PLACAS CARRETAS', placeholder: 'DLV7307', icon: Truck, uppercase: true },
                { key: 'tecnologia' as const, label: 'TECNOLOGIA', placeholder: 'SIGHRA', icon: Cpu, uppercase: true },
                { key: 'nomeMotorista' as const, label: 'NOME MOTORISTA', placeholder: 'ROBSON LUIS VIEIRA', icon: User, uppercase: true },
                { key: 'cpf' as const, label: 'CPF', placeholder: '000.000.000-00', icon: CreditCard, uppercase: false },
                { key: 'telefone' as const, label: 'TELEFONE', placeholder: '(00) 00000-0000', icon: Phone, uppercase: false },
              ].map((field) => {
                const IconComp = field.icon;
                return (
                  <div
                    key={field.key}
                    className="bg-[#FFFDF9] hover:bg-white focus-within:bg-white border border-[#EDE3CE] focus-within:border-[#D69E2E] rounded-2xl px-3.5 py-2 transition-all shadow-[0_2px_6px_rgba(0,0,0,0.015)]"
                  >
                    <label className="text-[9.5px] font-normal text-[#6E685F] uppercase tracking-wider block pl-7 mb-0.5">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2.5">
                      <IconComp size={16} className="text-[#F0A818] shrink-0 stroke-[1.8]" />
                      <input
                        type="text"
                        value={extraData[field.key] || ''}
                        onChange={(e) =>
                          handleUpdateOperationalField(
                            field.key,
                            field.uppercase ? e.target.value.toUpperCase() : e.target.value
                          )
                        }
                        placeholder={field.placeholder}
                        className={cn(
                          "w-full bg-transparent font-normal text-[#181715] outline-none placeholder:text-[#A39C90] placeholder:font-normal text-xs sm:text-[13px]",
                          field.uppercase && "uppercase"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Paste TSV / Operations Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl border border-[#ded5c6] shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-left">
              <div>
                <h3 className="font-bold text-base text-stone-900 font-sans uppercase flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-[#C49A45]" />
                  <span>Colar Planilha de Averbação / Operações</span>
                </h3>
                <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                  Suporta Planilha de Operações (25 colunas), TSV de Averbação, CSV ou dados separados por TAB/ponto-e-vírgula.
                </p>
              </div>
              <button 
                onClick={() => setShowPasteModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setRawInputText(text);
                  } catch (e) {
                    // Clipboard permission fallback
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center gap-1.5 cursor-pointer border border-stone-300 shadow-2xs"
              >
                <Clipboard size={12} />
                <span>Colar da Área de Transferência</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const example = `DATA AVERBAÇÃO\tORIGEM\tDESTINO\tPLACA CAV\tPLACA CARR\tNF\tVALOR NF\tSOMA VL/NF's\tNº PROTOCOLO\n03/08/2026\tMONTES CLAROS/MG\tVESPASIANO/MG\tRTK4C72\tTEM5E12\t8601\tR$ 560.321,21\tR$ 1.190.002,14\t361\n\t\t\t\tTEM5E25\t8602\tR$ 629.680,93\t\t362`;
                  setRawInputText(example);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold flex items-center gap-1.5 cursor-pointer border border-amber-300 shadow-2xs"
                title="Inserir modelo de exemplo conforme planilha de averbação"
              >
                <Sparkles size={12} className="text-[#C49A45]" />
                <span>Carregar Exemplo (Montes Claros ➔ Vespasiano)</span>
              </button>
            </div>

            <textarea
              value={rawInputText}
              onChange={(e) => setRawInputText(e.target.value)}
              placeholder="Cole aqui (Ctrl+V) as linhas da planilha Excel, Google Sheets ou portal de averbação..."
              rows={9}
              className="w-full bg-[#fbf9f5] border border-[#ded5c6] rounded-xl p-3 text-xs font-mono outline-none focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]"
            />

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-stone-500 font-mono">
                {rawInputText.trim() ? `${rawInputText.trim().split('\n').length} linha(s) detectada(s)` : 'Aguardando colagem...'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleProcessInput(rawInputText)}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#C49A45] to-[#A07A33] hover:brightness-110 cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Processar e Inserir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Averbacao;
