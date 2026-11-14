import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as htmlToImage from 'html-to-image';
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
  Car
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
import { ref, onValue, set } from 'firebase/database';

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
  }
};

interface AverbacaoProps {
  view?: string;
  onBack?: () => void;
}

export function Averbacao({ onBack }: AverbacaoProps) {
  const [emailColor, setEmailColor] = useState<'amarelo' | 'vermelho' | 'azul' | 'verde'>('amarelo');
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
    showNotificationMsg('Informações limpas! Colunas mantidas para preenchimento manual.', 'delete');
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows(prev => prev.filter((_, i) => i !== index));
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
    showNotificationMsg('Nova linha de nota fiscal adicionada!');
  };

  const handleUpdateRowField = (index: number, field: keyof AverbacaoRow, value: string) => {
    setParsedRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
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

  const copyToEmail = async () => {
    const accentHex = activeTheme.accentColor;
    const textColorHex = activeTheme.textColor;
    
    const displayRows = filteredRows.length > 0 ? filteredRows : parsedRows;
    const rowsToUse = displayRows;

    const uniqueTransportRows = getUniqueTransportRows(rowsToUse);
    const routeTitle = getRouteTitle(rowsToUse);
    const totalCarga = getTotalValue();

    let imageBlob: Blob | null = null;
    if (emailPreviewRef.current) {
      try {
        imageBlob = await htmlToImage.toBlob(emailPreviewRef.current, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
          fontEmbedCSS: ''
        });
      } catch (e) {
        console.warn('Não foi possível gerar blob de imagem:', e);
      }
    }

    const tableRowsHtml = uniqueTransportRows.map(row => `
      <tr style="background-color: ${activeTheme.accentColor}; color: ${activeTheme.textColor}; font-weight: bold; text-align: center; font-size: 11px;">
        <td style="border: 1px solid #000000; padding: 6px 8px; text-transform: uppercase;">${row.origem || '-'}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; text-transform: uppercase;">${row.destino || '-'}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; text-transform: uppercase;">${row.transportadora || extraData.transportadora || '-'}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-family: monospace;">${row.placaCav || '-'}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-family: monospace;">${row.placaCarr || '-'}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; text-transform: uppercase;">${row.tecnologia || extraData.tecnologia || '-'}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; text-transform: uppercase;">${row.nomeMotorista || extraData.nomeMotorista || '-'}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px; font-family: monospace;">${row.cpf || extraData.cpf || '-'}</td>
        <td style="border: 1px solid #000000; padding: 6px 8px;">${row.telefone || extraData.telefone || '-'}</td>
      </tr>
    `).join('');

    const uniqueProtocols = getUniqueProtocols(rowsToUse);
    const protocolsHtml = uniqueProtocols.length > 0
      ? uniqueProtocols.map(p => `
          <div style="font-size: 13px; font-weight: bold; color: #000000; margin-bottom: 4px;">
            PROTOCOLO: <span style="color: #0B3B8C; font-family: monospace, Courier, monospace; font-weight: bold;">${p}</span>
          </div>
        `).join('')
      : `
          <div style="font-size: 13px; font-weight: bold; color: #000000; margin-bottom: 4px;">
            PROTOCOLO: <span style="color: #0B3B8C; font-family: monospace, Courier, monospace; font-weight: bold;">-</span>
          </div>
        `;

    const protocolsPlainText = uniqueProtocols.length > 0
      ? uniqueProtocols.map(p => `PROTOCOLO: ${p}`).join('\n')
      : 'PROTOCOLO: -';

    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; line-height: 1.6; max-width: 950px; background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <p style="font-weight: bold; margin: 0 0 12px 0; color: #000000; font-size: 15px;">Bom dia!</p>
        
        <p style="margin: 0 0 14px 0; color: #1f2937;">
          Segue <span style="background-color: ${accentHex}; color: ${textColorHex}; padding: 3px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">AVERBAÇÃO</span> realizada via sistema.
        </p>

        <div style="background-color: #FAF6EC; border: 1px solid #F2C94C; padding: 14px 18px; border-radius: 10px; margin: 16px 0; font-family: Arial, sans-serif;">
          <div style="font-size: 14px; font-weight: bold; color: #0B3B8C; margin-bottom: 6px; text-transform: uppercase;">
            ${routeTitle || 'AGUARDANDO DADOS'}
          </div>
          ${protocolsHtml}
          <div style="font-size: 13px; font-weight: bold; color: #000000; margin-top: 4px;">
            Valor da Carga: <span style="color: #BA0C16; font-family: monospace, Courier, monospace; font-weight: bold;">${totalCarga}</span>
          </div>
        </div>

        <p style="margin: 14px 0 10px 0; color: #1f2937; font-size: 13px; font-weight: 500;">
          Segue dados e NF's em anexo.
        </p>

        ${uniqueTransportRows.length > 0 ? `
          <div style="margin: 18px 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; text-align: center; border: 1px solid #000000;">
              <thead>
                <tr style="background-color: #24231E; color: #ffffff; font-weight: bold; font-size: 10px; text-transform: uppercase;">
                  <th style="border: 1px solid #000000; padding: 7px 6px;">ORIGEM</th>
                  <th style="border: 1px solid #000000; padding: 7px 6px;">DESTINO</th>
                  <th style="border: 1px solid #000000; padding: 7px 6px;">TRANSPORTADORA</th>
                  <th style="border: 1px solid #000000; padding: 7px 6px;">PLACA CAVALO</th>
                  <th style="border: 1px solid #000000; padding: 7px 6px;">PLACAS CARRETAS</th>
                  <th style="border: 1px solid #000000; padding: 7px 6px;">TECNOLOGIA</th>
                  <th style="border: 1px solid #000000; padding: 7px 6px;">NOME MOTORISTA</th>
                  <th style="border: 1px solid #000000; padding: 7px 6px;">CPF</th>
                  <th style="border: 1px solid #000000; padding: 7px 6px;">TELEFONE</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>
        ` : ''}

        <p style="font-weight: bold; margin-top: 16px; margin-bottom: 0; color: #000000;">Att,</p>
      </div>
    `.trim();

    const plainTextTable = uniqueTransportRows.map(r => 
      `${r.origem || '-'} | ${r.destino || '-'} | ${r.transportadora || extraData.transportadora || '-'} | ${r.placaCav || '-'} | ${r.placaCarr || '-'} | ${r.tecnologia || extraData.tecnologia || '-'} | ${r.nomeMotorista || extraData.nomeMotorista || '-'} | ${r.cpf || extraData.cpf || '-'} | ${r.telefone || extraData.telefone || '-'}`
    ).join('\n');

    const plainText = `Bom dia!\n\nSegue AVERBAÇÃO realizada via sistema.\n\n${routeTitle || 'AGUARDANDO DADOS'}\n${protocolsPlainText}\nValor da Carga: ${totalCarga}\n\nSegue dados e NF's em anexo.\n\n${uniqueTransportRows.length > 0 ? `ORIGEM | DESTINO | TRANSPORTADORA | PLACA CAVALO | PLACAS CARRETAS | TECNOLOGIA | NOME MOTORISTA | CPF | TELEFONE\n${plainTextTable}\n\n` : ''}Att,`;

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
    <div className="w-full h-full flex flex-col relative text-left bg-[#FAF6EF] p-3.5 sm:p-4 text-[#181715] font-sans overflow-y-auto">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            className={cn(
              "fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl border text-xs font-mono font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md",
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
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 w-full items-start">
        
        {/* LEFT COLUMN: STACKED CARDS MATCHING REFERENCE DESIGN */}
        <div className="flex flex-col gap-3 w-full">
          
          {/* CARD 1: TOP CONTROLS BAR (CÓDIGOS RÁPIDOS + PLANILHA + LIMPAR) */}
          <div className="bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl p-3 sm:px-4 sm:py-3 shadow-[0_4px_16px_rgba(0,0,0,0.035)] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap flex-1">
              {/* Branded Badge Container */}
              <div className="flex items-center gap-2.5 bg-[#FAF6EE] border border-[#EDE3CE]/90 rounded-2xl px-3.5 py-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#24231E] flex items-center justify-center shadow-xs shrink-0">
                  <Zap size={15} className="text-[#F5B82E] fill-[#F5B82E]" />
                </div>
                <div className="leading-tight pr-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#181715] block">
                    CÓDIGOS RÁPIDOS
                  </span>
                  <span className="text-[10px] font-medium text-[#7A7469] block">
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
                          "text-[9.5px] font-bold uppercase tracking-wider block transition-colors",
                          isItemCopied ? "text-emerald-700" : "text-[#7A7469]"
                        )}>
                          {item.label}
                        </span>
                        <span className={cn(
                          "text-xs sm:text-[13px] font-extrabold tracking-tight block mt-0.5 tabular-nums",
                          isItemCopied ? "text-emerald-900" : "text-[#181715]"
                        )}>
                          {item.code}
                        </span>
                      </div>

                      <div className="shrink-0">
                        {isItemCopied ? (
                          <Check size={14} className="text-emerald-600 stroke-[2.5]" />
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
                className="bg-[#282622] hover:bg-[#383630] text-white text-[11px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap"
                title="Abrir caixa de colagem manual de planilha"
              >
                <FileSpreadsheet size={14} className="text-[#F5B82E]" />
                <span>PLANILHA</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="bg-[#BA0C16] hover:bg-[#9E0810] text-white text-[11px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 whitespace-nowrap"
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
              <span className="text-xs font-extrabold uppercase tracking-wide text-[#181715]">
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
                        className={cn("stroke-[2.8]", key === 'amarelo' ? "text-[#181715]" : "text-white")}
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
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6E685F] block">
                  FORMATO PARA CLIENTE DE E-MAIL
                </span>
                <span className="text-xs sm:text-[13px] font-extrabold text-[#181715] uppercase tracking-tight block mt-0.5">
                  CORPO DA MENSAGEM DE AVERBAÇÃO
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopySubject}
                className={cn(
                  "text-[11px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap",
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
                type="button"
                onClick={copyToEmail}
                className="bg-gradient-to-r from-[#D69E2E] to-[#B87D14] hover:brightness-105 text-white text-[11px] font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                title="Copiar e-mail formatado"
              >
                {copied ? <Check size={14} /> : <Copy size={14} className="text-white" />}
                <span>{copied ? 'COPIADO!' : 'COPIAR FORMATADO'}</span>
              </button>
            </div>
          </div>

          {/* CARD 4: ASSUNTO DO E-MAIL BAR */}
          <div className="bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl px-4 py-3.5 shadow-[0_3px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E685F]">
                  ASSUNTO DO E-MAIL
                </span>
                {isTransportadora3C() && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FCE588] text-[#181715] text-[10px] font-extrabold uppercase tracking-wide">
                    MODO 3C / FROTA 3C (&amp; SM)
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-[14px] font-extrabold text-[#181715] select-all break-words tracking-tight">
                {getEmailSubject()}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopySubject}
              className={cn(
                "px-4 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 border whitespace-nowrap",
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

          {/* CARD 5: EMAIL BODY PREVIEW CONTAINER */}
          <div 
            ref={emailPreviewRef}
            className="bg-[#FFFDF9] border border-[#EDE3CE] rounded-3xl p-5 text-left font-sans text-[#181715] space-y-3.5 shadow-[0_4px_18px_rgba(0,0,0,0.035)] leading-relaxed"
          >
            <p className="font-extrabold text-[#181715] text-sm">Bom dia!</p>
            
            <p className="font-medium text-[#181715] text-xs sm:text-[13px] flex items-center gap-1.5 flex-wrap">
              <span>Segue</span>
              <span
                className={cn("px-2.5 py-0.5 rounded-md font-extrabold text-xs uppercase shadow-2xs", activeTheme.highlightClass)}
                style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}
              >
                AVERBAÇÃO
              </span>
              <span>realizada via sistema.</span>
            </p>

            {/* Highlights Quote Box */}
            <div className="bg-[#FAF6EC] border border-[#F2C94C] px-4 py-3.5 rounded-2xl space-y-1">
              <div className="text-xs sm:text-[13px] font-extrabold text-[#0B3B8C] uppercase tracking-tight">
                {getRouteTitle(filteredRows.length > 0 ? filteredRows : parsedRows) || 'AGUARDANDO DADOS'}
              </div>
              {getUniqueProtocols(filteredRows.length > 0 ? filteredRows : parsedRows).length > 0 ? (
                getUniqueProtocols(filteredRows.length > 0 ? filteredRows : parsedRows).map((prot, idx) => (
                  <div key={idx} className="text-xs sm:text-[13px] font-extrabold text-[#181715]">
                    PROTOCOLO: <span className="text-[#0B3B8C] font-extrabold">{prot}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs sm:text-[13px] font-extrabold text-[#181715]">
                  PROTOCOLO: <span className="text-[#0B3B8C] font-extrabold">-</span>
                </div>
              )}
              <div className="text-xs sm:text-[13px] font-extrabold text-[#181715]">
                Valor da Carga: <span className="text-[#BA0C16] font-extrabold tabular-nums">{getTotalValue()}</span>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] font-medium text-[#181715]">
              Segue dados e NF's em anexo.
            </p>

            {/* Operational Transport Data Table */}
            <div className="overflow-x-auto rounded-xl border border-[#24231E] shadow-2xs">
              <table className="w-full border-collapse text-center text-xs font-sans">
                <thead>
                  <tr className="bg-[#24231E] text-white text-[10px] font-extrabold uppercase tracking-wider">
                    <th className="py-2.5 px-2 border border-[#3A3832]">ORIGEM</th>
                    <th className="py-2.5 px-2 border border-[#3A3832]">DESTINO</th>
                    <th className="py-2.5 px-2 border border-[#3A3832]">TRANSPORTADORA</th>
                    <th className="py-2.5 px-2 border border-[#3A3832]">PLACA CAVALO</th>
                    <th className="py-2.5 px-2 border border-[#3A3832]">PLACAS CARRETAS</th>
                    <th className="py-2.5 px-2 border border-[#3A3832]">TECNOLOGIA</th>
                    <th className="py-2.5 px-2 border border-[#3A3832]">NOME MOTORISTA</th>
                    <th className="py-2.5 px-2 border border-[#3A3832]">CPF</th>
                    <th className="py-2.5 px-2 border border-[#3A3832]">TELEFONE</th>
                  </tr>
                </thead>
                <tbody>
                  {getUniqueTransportRows(filteredRows.length > 0 ? filteredRows : parsedRows).map((row, idx) => (
                    <tr 
                      key={row.id || idx}
                      className={cn("font-extrabold text-[11px]", activeTheme.tableCellClass)}
                      style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}
                    >
                      <td className="py-2 px-1.5 border border-[#24231E]/60 uppercase">
                        <input
                          type="text"
                          value={row.origem || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'origem', e.target.value.toUpperCase())}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                      <td className="py-2 px-1.5 border border-[#24231E]/60 uppercase">
                        <input
                          type="text"
                          value={row.destino || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'destino', e.target.value.toUpperCase())}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                      <td className="py-2 px-1.5 border border-[#24231E]/60 uppercase">
                        <input
                          type="text"
                          value={row.transportadora || extraData.transportadora || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'transportadora', e.target.value.toUpperCase())}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                      <td className="py-2 px-1.5 border border-[#24231E]/60">
                        <input
                          type="text"
                          value={row.placaCav || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'placaCav', e.target.value.toUpperCase())}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                      <td className="py-2 px-1.5 border border-[#24231E]/60">
                        <input
                          type="text"
                          value={row.placaCarr || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'placaCarr', e.target.value.toUpperCase())}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                      <td className="py-2 px-1.5 border border-[#24231E]/60 uppercase">
                        <input
                          type="text"
                          value={row.tecnologia || extraData.tecnologia || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'tecnologia', e.target.value.toUpperCase())}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                      <td className="py-2 px-1.5 border border-[#24231E]/60 uppercase">
                        <input
                          type="text"
                          value={row.nomeMotorista || extraData.nomeMotorista || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'nomeMotorista', e.target.value.toUpperCase())}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                      <td className="py-2 px-1.5 border border-[#24231E]/60 tabular-nums">
                        <input
                          type="text"
                          value={row.cpf || extraData.cpf || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'cpf', e.target.value)}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold tabular-nums outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                      <td className="py-2 px-1.5 border border-[#24231E]/60 tabular-nums">
                        <input
                          type="text"
                          value={row.telefone || extraData.telefone || ''}
                          onChange={(e) => handleUpdateTransportField(idx, 'telefone', e.target.value)}
                          placeholder="-"
                          className="w-full bg-transparent text-center font-extrabold tabular-nums outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                          style={{ color: activeTheme.textColor }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="font-extrabold text-[#181715] pt-1 text-sm">Att,</p>
          </div>

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
              <BarChart3 size={20} className="text-[#F0A818] stroke-[2.4]" />
              <span className="text-xs sm:text-[13px] font-extrabold uppercase text-[#181715] tracking-wide">
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
                    <label className="text-[9.5px] font-bold text-[#6E685F] uppercase tracking-wider block pl-7 mb-0.5">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2.5">
                      <IconComp size={16} className="text-[#F0A818] shrink-0 stroke-[2.2]" />
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
                          "w-full bg-transparent font-extrabold text-[#181715] outline-none placeholder:text-[#A39C90] placeholder:font-medium text-xs sm:text-[13px]",
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
