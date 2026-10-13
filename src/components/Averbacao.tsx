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
  Sliders,
  Mail,
  FileCheck2,
  ChevronDown,
  Trash,
  Image as ImageIcon,
  FileSpreadsheet,
  Edit3,
  Layers,
  AlertCircle,
  MapPin,
  Truck
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
    highlightClass: 'bg-[#FFFF00] text-black border border-yellow-400',
    tableCellClass: 'bg-[#FFFF00] text-black border border-black',
    borderClass: 'border-l-4 border-l-[#FFFF00]',
    accentColor: '#FFFF00',
    textColor: '#000000',
    circleBg: 'bg-[#FFFF00]'
  },
  vermelho: {
    name: 'VERMELHO',
    highlightClass: 'bg-red-600 text-white border border-red-700',
    tableCellClass: 'bg-red-600 text-white border border-red-800',
    borderClass: 'border-l-4 border-l-red-600',
    accentColor: '#E11D48',
    textColor: '#FFFFFF',
    circleBg: 'bg-red-600'
  },
  azul: {
    name: 'AZUL',
    highlightClass: 'bg-blue-600 text-white border border-blue-700',
    tableCellClass: 'bg-blue-600 text-white border border-blue-800',
    borderClass: 'border-l-4 border-l-blue-600',
    accentColor: '#2563EB',
    textColor: '#FFFFFF',
    circleBg: 'bg-blue-600'
  },
  verde: {
    name: 'VERDE',
    highlightClass: 'bg-emerald-600 text-white border border-emerald-700',
    tableCellClass: 'bg-emerald-600 text-white border border-emerald-800',
    borderClass: 'border-l-4 border-l-emerald-600',
    accentColor: '#10B981',
    textColor: '#FFFFFF',
    circleBg: 'bg-emerald-600'
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
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'delete' } | null>(null);

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
      transportadora: 'MODECENSE',
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
        transportadora: 'MODECENSE',
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

  const getProtocolsList = (rows: AverbacaoRow[]) => {
    const activeRows = rows.length > 0 ? rows : parsedRows;
    if (activeRows.length === 0) return '-';
    const uniqueProtocols = Array.from(new Set(activeRows.map(r => r.protocolo?.trim()).filter(Boolean)));
    return uniqueProtocols.length > 0 ? uniqueProtocols.join(', ') : 'PENDENTE';
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

    const seen = new Set<string>();
    const uniqueList: AverbacaoRow[] = [];

    activeRows.forEach(row => {
      const orig = (row.origem && row.origem !== '-') ? row.origem : (extraData.origem || primaryOrigem || '');
      const dest = (row.destino && row.destino !== '-') ? row.destino : (extraData.destino || '');
      const cav = (row.placaCav && row.placaCav !== '-') ? row.placaCav : (extraData.placaCav || primaryPlacaCav || '');
      const carr = (row.placaCarr && row.placaCarr !== '-') ? row.placaCarr : (extraData.placaCarr || primaryPlacaCarr || '');

      const key = `${orig.toUpperCase().trim()}|${dest.toUpperCase().trim()}|${cav.toUpperCase().trim()}|${carr.toUpperCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push({
          ...row,
          origem: orig,
          destino: dest,
          placaCav: cav,
          placaCarr: carr,
          transportadora: row.transportadora || extraData.transportadora || '',
          tecnologia: row.tecnologia || extraData.tecnologia || '',
          nomeMotorista: row.nomeMotorista || extraData.nomeMotorista || '',
          cpf: row.cpf || extraData.cpf || '',
          telefone: row.telefone || extraData.telefone || ''
        });
      }
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
    const protocolosList = getProtocolsList(rowsToUse);
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

    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; line-height: 1.6; max-width: 950px; background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <p style="font-weight: bold; margin: 0 0 12px 0; color: #000000; font-size: 15px;">Bom dia!</p>
        
        <p style="margin: 0 0 14px 0; color: #1f2937;">
          Segue <span style="background-color: ${accentHex}; color: ${textColorHex}; padding: 3px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">AVERBAÇÃO</span> realizada via sistema.
        </p>

        <div style="background-color: #f8f9fa; border-left: 5px solid ${accentHex}; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-family: Arial, sans-serif;">
          <div style="font-size: 14px; font-weight: bold; color: #000000; margin-bottom: 6px; text-transform: uppercase;">
            ${routeTitle || 'AGUARDANDO DADOS'}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #000000; margin-bottom: 6px;">
            PROTOCOLO: <span style="color: #2563eb; font-family: monospace, Courier, monospace; font-weight: bold;">${protocolosList || '-'}</span>
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #000000;">
            Valor da Carga: <span style="color: #dc2626; font-family: monospace, Courier, monospace; font-weight: bold;">${totalCarga}</span>
          </div>
        </div>

        ${uniqueTransportRows.length > 0 ? `
          <div style="margin: 18px 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; text-align: center; border: 1px solid #000000;">
              <thead>
                <tr style="background-color: #292820; color: #ffffff; font-weight: bold; font-size: 10px; text-transform: uppercase;">
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

    const plainText = `Bom dia!\n\nSegue AVERBAÇÃO realizada via sistema.\n\n${routeTitle || 'AGUARDANDO DADOS'}\nPROTOCOLO: ${protocolosList || '-'}\nValor da Carga: ${totalCarga}\n\n${uniqueTransportRows.length > 0 ? `ORIGEM | DESTINO | TRANSPORTADORA | PLACA CAVALO | PLACAS CARRETAS | TECNOLOGIA | NOME MOTORISTA | CPF | TELEFONE\n${plainTextTable}\n\n` : ''}Att,`;

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
    <div className="w-full h-full flex flex-col relative text-left bg-[#F5F0E6] p-3 text-[#25231F] font-sans overflow-y-auto">
      
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
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 w-full items-start">
        
        {/* LEFT COLUMN: BRANDED INTERACTIVE BOARD PANEL */}
        <div className="flex flex-col gap-3.5 w-full">
          
          {/* TOP CONTROLS: CODES BAR & QUICK IMPORT ACTIONS */}
          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#25231F]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-black uppercase text-[#C49A45] flex items-center gap-1 font-mono">
                ⚡ CÓDIGOS RÁPIDOS:
              </span>
              
              {/* Capsula Field */}
              <div className="flex items-center bg-white border border-[#E6D2A3] rounded px-3 py-1.5 font-bold font-mono text-[#292820] gap-2 shadow-inner">
                <span className="text-[#77736B]">CÁPSULA:</span>
                <span className="text-[#C49A45] tracking-wider font-extrabold uppercase">
                  9000000982
                </span>
                <button 
                  onClick={() => copyCodeToClipboard('CÁPSULA', '9000000982')}
                  className="text-[#77736B] hover:text-[#C49A45] cursor-pointer"
                  title="Copiar código Cápsula"
                >
                  <Copy size={11} />
                </button>
              </div>

              {/* Maquina Field */}
              <div className="flex items-center bg-white border border-[#E6D2A3] rounded px-3 py-1.5 font-bold font-mono text-[#292820] gap-2 shadow-inner">
                <span className="text-[#77736B]">MÁQUINA:</span>
                <span className="text-[#C49A45] font-black">00008901</span>
                <button 
                  onClick={() => copyCodeToClipboard('MÁQUINA', '00008901')}
                  className="text-[#77736B] hover:text-[#C49A45] cursor-pointer"
                  title="Copiar código Máquina"
                >
                  <Copy size={11} />
                </button>
              </div>

              {/* Embarques Field */}
              <div className="flex items-center bg-white border border-[#E6D2A3] rounded px-3 py-1.5 font-bold font-mono text-[#292820] gap-2 shadow-inner">
                <span className="text-[#77736B]">EMBARQUES:</span>
                <span className="text-[#C49A45] font-black">132</span>
                <button 
                  onClick={() => copyCodeToClipboard('EMBARQUES', '132')}
                  className="text-[#77736B] hover:text-[#C49A45] cursor-pointer"
                  title="Copiar código Embarques"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>

            {/* BUTTON BAR: INTELLIGENT PASTE & ACTION BUTTONS */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {!hideAnexos && (
                <button
                  onClick={handlePasteFromClipboard}
                  title="Colar dados da área de transferência (ou use Ctrl+V na página)"
                  className="bg-gradient-to-r from-[#C49A45] to-[#A07A33] hover:brightness-110 text-white text-[11px] font-black uppercase px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer border border-[#E6D2A3] flex items-center gap-1.5"
                >
                  <Clipboard size={12} />
                  <span>COLAR DADOS (CTRL+V)</span>
                </button>
              )}

              <button
                onClick={() => setShowPasteModal(true)}
                className="bg-white hover:bg-[#F5F0E6] border border-[#E6D2A3] text-[#292820] text-[11px] font-black uppercase px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                title="Abrir caixa de colagem manual de planilha"
              >
                <FileSpreadsheet size={12} className="text-[#C49A45]" />
                <span>PLANILHA</span>
              </button>

              <button
                onClick={handleClearAll}
                className="bg-[#FFF5F5] hover:bg-[#FFE3E3] border border-red-300 text-[#C91F2D] text-[11px] font-black uppercase px-3 py-2 rounded-xl shadow-xs cursor-pointer"
                title="Limpar todos os registros"
              >
                LIMPAR
              </button>
            </div>
          </div>

          {/* QUICK PASTE CALLOUT BANNER */}
          {!hideAnexos && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-[#E6D2A3] rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-stone-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="font-bold text-[11px]">
                  💡 <strong>Dica de Agilidade:</strong> Copie sua linha no Excel/Google Sheets e aperte <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#E6D2A3] text-stone-900 font-mono text-[10px] shadow-2xs">Ctrl+V</kbd> em qualquer lugar desta tela para importar dados e NFs automaticamente!
                </span>
              </div>
            </div>
          )}

          {/* SEARCH BAR (Wide) */}
          <div className="relative w-full">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77736B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa, nota fiscal, motorista, protocolo ou destino..."
              className="w-full bg-[#FFFCF6] text-[#292820] border border-[#E6D2A3] rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C49A45] shadow-inner placeholder-[#77736B]"
            />
          </div>

          {/* COLOR THEME PICKER */}
          <div className="flex items-center justify-between bg-[#292820] text-white px-4 py-2.5 rounded-xl border border-[#E6D2A3]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#E6D2A3]">PALETA DE CORES DO E-MAIL</span>
            <div className="flex items-center gap-2">
              {(Object.keys(COLOR_THEMES) as Array<keyof typeof COLOR_THEMES>).map((key) => {
                const theme = COLOR_THEMES[key];
                const isSelected = emailColor === key;
                return (
                  <button
                    key={key}
                    onClick={() => setEmailColor(key)}
                    className={cn(
                      "w-9 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center font-bold text-xs border",
                      theme.circleBg,
                      isSelected ? "ring-2 ring-white scale-110 shadow-md border-white" : "border-transparent opacity-80 hover:opacity-100"
                    )}
                    title={theme.name}
                  >
                    {isSelected && <Check size={12} className={key === 'amarelo' ? "text-black" : "text-white"} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EMAIL PREVIEW CARD CONTAINER */}
          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm text-xs font-mono space-y-3.5 text-[#25231F]">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E6D2A3]/60 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C49A45]/15 text-[#C49A45] border border-[#E6D2A3] flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="text-left leading-none">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#C49A45] block">
                    FORMATO PARA CLIENTE DE E-MAIL
                  </span>
                  <span className="text-[13px] font-black text-[#292820] uppercase tracking-tight block mt-1">
                    CORPO DA MENSAGEM DE AVERBAÇÃO
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={copyToEmail}
                    className="bg-gradient-to-r from-[#C49A45] via-[#B88938] to-[#9A7230] hover:brightness-110 text-white text-[11px] font-black uppercase px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-[#E6D2A3]"
                    title="Copiar e-mail formatado"
                  >
                    <Clipboard size={12} />
                    <span>{copied ? 'COPIADO' : 'COPIAR FORMATADO'}</span>
                  </button>
                  {!hideAnexos && (
                    <button
                      onClick={copyAsImage}
                      disabled={isGeneratingImg}
                      className="bg-white hover:bg-[#F5F0E6] text-[#292820] border border-[#E6D2A3] text-[11px] font-black uppercase px-3 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title="Copiar visualização como imagem"
                    >
                      <ImageIcon size={12} className="text-[#C49A45]" />
                      <span>{isGeneratingImg ? 'GERANDO...' : 'COPIAR IMAGEM'}</span>
                    </button>
                  )}
              </div>
            </div>

            {/* Inner Message Template (rendered for display & image capture) */}
            <div 
              ref={emailPreviewRef}
              className="bg-white border border-[#E6D2A3] rounded-2xl p-6 text-left font-sans text-stone-900 space-y-4 shadow-sm leading-relaxed"
            >
              <p className="font-extrabold text-stone-950 text-sm">Bom dia!</p>
              
              <p className="font-semibold text-stone-800 text-xs sm:text-sm">
                Segue <span className={cn("px-2 py-0.5 rounded font-black", activeTheme.highlightClass)} style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>AVERBAÇÃO</span> realizada via sistema.
              </p>

              {/* Highlights Quote Panel */}
              <div 
                className="bg-[#FAF7F0] p-4.5 rounded-xl space-y-1.5 shadow-2xs border border-[#E6D2A3]/40"
                style={{ borderLeft: `5px solid ${activeTheme.accentColor}` }}
              >
                <div className="text-xs sm:text-[13px] font-black text-stone-950 uppercase">
                  {getRouteTitle(filteredRows.length > 0 ? filteredRows : parsedRows) || 'AGUARDANDO DADOS'}
                </div>
                <div className="text-xs font-black text-stone-900">
                  PROTOCOLO: <span className="text-[#C49A45] font-extrabold font-mono">{getProtocolsList(filteredRows.length > 0 ? filteredRows : parsedRows) || '-'}</span>
                </div>
                <div className="text-xs font-black text-stone-900">
                  Valor da Carga: <span className="text-[#C91F2D] font-extrabold font-mono">{getTotalValue()}</span>
                </div>
              </div>

              {/* Operational Transport Data Table */}
              <div className="overflow-x-auto rounded-xl border border-black shadow-xs my-2">
                <table className="w-full border-collapse text-center text-xs font-sans">
                  <thead>
                    <tr className="bg-[#292820] text-white text-[10px] font-black uppercase">
                      <th className="p-2 border border-black">ORIGEM</th>
                      <th className="p-2 border border-black">DESTINO</th>
                      <th className="p-2 border border-black">TRANSPORTADORA</th>
                      <th className="p-2 border border-black">PLACA CAVALO</th>
                      <th className="p-2 border border-black">PLACAS CARRETAS</th>
                      <th className="p-2 border border-black">TECNOLOGIA</th>
                      <th className="p-2 border border-black">NOME MOTORISTA</th>
                      <th className="p-2 border border-black">CPF</th>
                      <th className="p-2 border border-black">TELEFONE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getUniqueTransportRows(filteredRows.length > 0 ? filteredRows : parsedRows).map((row, idx) => (
                      <tr 
                        key={row.id || idx}
                        className={cn("font-bold text-[11px]", activeTheme.tableCellClass)}
                        style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}
                      >
                        <td className="p-1 border border-black uppercase">
                          <input
                            type="text"
                            value={row.origem || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'origem', e.target.value.toUpperCase())}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                        <td className="p-1 border border-black uppercase">
                          <input
                            type="text"
                            value={row.destino || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'destino', e.target.value.toUpperCase())}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                        <td className="p-1 border border-black uppercase">
                          <input
                            type="text"
                            value={row.transportadora || extraData.transportadora || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'transportadora', e.target.value.toUpperCase())}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                        <td className="p-1 border border-black font-mono">
                          <input
                            type="text"
                            value={row.placaCav || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'placaCav', e.target.value.toUpperCase())}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold uppercase font-mono outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                        <td className="p-1 border border-black font-mono">
                          <input
                            type="text"
                            value={row.placaCarr || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'placaCarr', e.target.value.toUpperCase())}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold uppercase font-mono outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                        <td className="p-1 border border-black uppercase">
                          <input
                            type="text"
                            value={row.tecnologia || extraData.tecnologia || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'tecnologia', e.target.value.toUpperCase())}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                        <td className="p-1 border border-black uppercase">
                          <input
                            type="text"
                            value={row.nomeMotorista || extraData.nomeMotorista || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'nomeMotorista', e.target.value.toUpperCase())}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold uppercase outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                        <td className="p-1 border border-black font-mono">
                          <input
                            type="text"
                            value={row.cpf || extraData.cpf || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'cpf', e.target.value)}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold font-mono outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                        <td className="p-1 border border-black">
                          <input
                            type="text"
                            value={row.telefone || extraData.telefone || ''}
                            onChange={(e) => handleUpdateTransportField(idx, 'telefone', e.target.value)}
                            placeholder="-"
                            className="w-full bg-transparent text-center font-bold outline-none focus:bg-black/10 rounded px-1 text-[11px]"
                            style={{ color: activeTheme.textColor }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="font-extrabold text-stone-950 pt-2 text-sm">Att,</p>
            </div>

            {/* Branded footer of this panel */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-[#77736B] border-t border-[#E6D2A3]/60 pt-3 gap-2">
              <div className="flex items-center gap-1 flex-wrap uppercase">
                <span>TOTAL DE ROTAS: {getUniqueTransportRows(filteredRows.length > 0 ? filteredRows : parsedRows).length || 0}</span>
                <span>•</span>
                <span>TOTAL DE NOTAS: {parsedRows.length}</span>
                <span>•</span>
                <span>SOMA: {getTotalValue()}</span>
              </div>
              
              <div className="flex items-center gap-1.5 uppercase text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>SISTEMA PRONTO PARA CÓPIA</span>
              </div>
            </div>

          </div>

          {/* EDITABLE SECTION: GERENCIADOR DE NOTAS FISCAIS IMPORTADAS */}
          {!hideAnexos && (
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm text-xs text-[#25231F] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E6D2A3]/60 pb-2.5 gap-2">
                <div className="flex items-center gap-2">
                  <Layers size={15} className="text-[#C49A45]" />
                  <span className="font-black uppercase tracking-wider text-[11px] text-[#292820]">
                    Gerenciador de Notas Fiscais Importadas ({parsedRows.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddEmptyRow}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <Plus size={11} />
                    <span>Adicionar Nota</span>
                  </button>
                </div>
              </div>

              {parsedRows.length === 0 ? (
                <div className="text-center py-6 text-stone-500 space-y-2">
                  <AlertCircle size={24} className="mx-auto text-amber-500" />
                  <p className="font-bold">Nenhuma nota fiscal na lista.</p>
                  <p className="text-[11px]">Cole os dados da planilha usando Ctrl+V ou clique no botão "COLAR DADOS".</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#E6D2A3]/70">
                  <table className="w-full border-collapse text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#292820] text-white text-[10px] font-black uppercase">
                        <th className="p-2 border border-[#3A3830] w-10 text-center">#</th>
                        <th className="p-2 border border-[#3A3830] w-32">NF</th>
                        <th className="p-2 border border-[#3A3830] w-36">VALOR</th>
                        <th className="p-2 border border-[#3A3830] w-12 text-center">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-amber-50/50 bg-white">
                          <td className="p-1.5 border border-stone-200 text-center font-bold text-[10px] text-stone-500">
                            {idx + 1}
                          </td>
                          <td className="p-1.5 border border-stone-200">
                            <input
                              type="text"
                              value={row.nf}
                              onChange={(e) => handleUpdateRowField(idx, 'nf', e.target.value)}
                              className="w-full bg-transparent outline-none font-bold text-[11px]"
                            />
                          </td>
                          <td className="p-1.5 border border-stone-200">
                            <input
                              type="text"
                              value={row.valorNf}
                              onChange={(e) => handleUpdateRowField(idx, 'valorNf', e.target.value)}
                              className="w-full bg-transparent outline-none font-bold text-red-700 text-[11px]"
                            />
                          </td>
                          <td className="p-1.5 border border-stone-200 text-center">
                            <button
                              onClick={() => handleRemoveRow(idx)}
                              className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Remover nota"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: "DADOS OPERACIONAIS" SIDEBAR */}
        <div className="flex flex-col gap-3 w-full shrink-0">
          
          {/* Header Section */}
          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 flex items-center justify-between shadow-sm">
            <span className="text-xs font-black uppercase text-[#C49A45] tracking-wider flex items-center gap-2 font-mono">
              🏢 DADOS OPERACIONAIS
            </span>
            <ChevronDown size={14} className="text-[#C49A45]" />
          </div>

          {/* SIDEBAR FIELDS CARDS (Updated automatically upon pasting or manual editing!) */}
          <div className="space-y-3.5 text-xs text-left">
            
            {/* Field 1: Origem */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                ORIGEM
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <MapPin size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.origem}
                  onChange={(e) => handleUpdateOperationalField('origem', e.target.value.toUpperCase())}
                  placeholder="EX: SANTA LUZIA"
                  className="w-full bg-transparent font-black text-[#292820] outline-none uppercase placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Field 2: Destino */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                DESTINO
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <MapPin size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.destino}
                  onChange={(e) => handleUpdateOperationalField('destino', e.target.value.toUpperCase())}
                  placeholder="EX: LONDRINA"
                  className="w-full bg-transparent font-black text-[#292820] outline-none uppercase placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Field 3: Transportadora */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                TRANSPORTADORA
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <Building size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.transportadora}
                  onChange={(e) => handleUpdateOperationalField('transportadora', e.target.value.toUpperCase())}
                  placeholder="EX: MODECENSE"
                  className="w-full bg-transparent font-black text-[#292820] outline-none uppercase placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Field 4: Placa Cavalo */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                PLACA CAVALO
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <Truck size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.placaCav}
                  onChange={(e) => handleUpdateOperationalField('placaCav', e.target.value.toUpperCase())}
                  placeholder="EX: QWA6A22"
                  className="w-full bg-transparent font-black text-[#292820] outline-none uppercase font-mono placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Field 5: Placas Carretas */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                PLACAS CARRETAS
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <Truck size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.placaCarr}
                  onChange={(e) => handleUpdateOperationalField('placaCarr', e.target.value.toUpperCase())}
                  placeholder="EX: DLV7307"
                  className="w-full bg-transparent font-black text-[#292820] outline-none uppercase font-mono placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Field 6: Tecnologia */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                TECNOLOGIA
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <ShieldCheck size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.tecnologia}
                  onChange={(e) => handleUpdateOperationalField('tecnologia', e.target.value.toUpperCase())}
                  placeholder="EX: SIGHRA"
                  className="w-full bg-transparent font-black text-[#292820] outline-none uppercase placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Field 7: Nome do Condutor */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                NOME MOTORISTA
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <User size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.nomeMotorista}
                  onChange={(e) => handleUpdateOperationalField('nomeMotorista', e.target.value.toUpperCase())}
                  placeholder="EX: ROBSON LUIS VIEIRA"
                  className="w-full bg-transparent font-black text-[#292820] outline-none uppercase placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Field 8: CPF */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                CPF
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <CreditCard size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.cpf}
                  onChange={(e) => handleUpdateOperationalField('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-transparent font-black text-[#292820] outline-none font-mono placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Field 9: Telefone */}
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-xl p-3 shadow-sm">
              <label className="text-[9px] font-black text-[#77736B] uppercase block mb-1">
                TELEFONE
              </label>
              <div className="flex items-center gap-2 bg-white border border-[#E6D2A3] rounded px-3 py-2 shadow-inner">
                <Phone size={13} className="text-[#77736B]" />
                <input
                  type="text"
                  value={extraData.telefone}
                  onChange={(e) => handleUpdateOperationalField('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-transparent font-black text-[#292820] outline-none placeholder:text-stone-400 placeholder:font-normal text-xs"
                />
              </div>
            </div>

            {/* Summary Info Card */}
            {!hideAnexos && (
              <div className="bg-gradient-to-br from-white to-[#FAF6EE] border border-[#E6D2A3] rounded-xl p-3 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-black text-[#C49A45] uppercase block font-mono">
                  📊 RESUMO DA AVERBAÇÃO
                </span>
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-stone-600">Total de Notas:</span>
                  <span className="font-mono text-stone-900">{parsedRows.length}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-stone-600">Valor Total:</span>
                  <span className="font-mono text-red-700">{getTotalValue()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-stone-600">Protocolo(s):</span>
                  <span className="font-mono text-blue-700 truncate max-w-[170px]" title={getProtocolsList(parsedRows)}>
                    {getProtocolsList(parsedRows)}
                  </span>
                </div>
              </div>
            )}

          </div>

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
