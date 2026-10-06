import React, { useState, useRef } from 'react';
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
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { safeCopyText, safeCopyHtmlAndText, safeCopyImage } from '../utils/clipboard';

interface AverbacaoRow {
  dataAverbacao: string;
  origem: string;
  destino: string;
  placaCav: string;
  placaCarr: string;
  nf: string;
  valorNf: string;
  somaVl: string;
  protocolo: string;
}

interface ExtraData {
  transportadora: string;
  tecnologia: string;
  nomeMotorista: string;
  cpf: string;
  telefone: string;
}

const DEFAULT_TRANSPORTADORAS = [
  "MODECENSE",
  "3C LOGÍSTICA",
  "FROTA 3C",
  "APK TRANSPORTES",
  "TOMASI LOGÍSTICA",
  "TRANSMAGNA",
  "RNCGG EXTEMPORÂNEO",
  "GT MINAS",
  "GOBOR"
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

const SAMPLE_TSV_DATA = `25/09/2026\tSANTA LUZIA/MG\tLONDRINA/PR\tQWA6A22\tDLV7307\t3045088\tR$ 142.319,43\tR$ 905.343,74\tAVB-98124
25/09/2026\tSANTA LUZIA/MG\tLONDRINA/PR\t-\t-\t3046755\tR$ 182.678,57\tR$ 182.678,57\tAVB-98125`;

interface AverbacaoProps {
  view?: string;
  onBack?: () => void;
}

export function Averbacao({ onBack }: AverbacaoProps) {
  const [emailColor, setEmailColor] = useState<'amarelo' | 'vermelho' | 'azul' | 'verde'>('vermelho');
  const activeTheme = COLOR_THEMES[emailColor];
  const emailPreviewRef = useRef<HTMLDivElement>(null);
  
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [rawInputText, setRawInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'delete' } | null>(null);

  const [customTransportadoras, setCustomTransportadoras] = useState<string[]>(DEFAULT_TRANSPORTADORAS);
  const [showAddTranspInput, setShowAddTranspInput] = useState(false);
  const [newTranspName, setNewTranspName] = useState("");

  const [extraData, setExtraData] = useState<ExtraData>({
    transportadora: 'MODECENSE',
    tecnologia: 'SIGHRA',
    nomeMotorista: 'ROBSON LUIS VIEIRA',
    cpf: '051.248.966-09',
    telefone: '(31) 99935-0970'
  });

  const [parsedRows, setParsedRows] = useState<AverbacaoRow[]>([
    {
      dataAverbacao: '25/09/2026',
      origem: 'SANTA LUZIA',
      destino: 'LONDRINA',
      placaCav: 'QWA6A22',
      placaCarr: 'DLV7307',
      nf: '3045088',
      valorNf: 'R$ 142.319,43',
      somaVl: 'R$ 905.343,74',
      protocolo: 'AVB-98124'
    },
    {
      dataAverbacao: '25/09/2026',
      origem: 'SANTA LUZIA',
      destino: 'LONDRINA',
      placaCav: '-',
      placaCarr: '-',
      nf: '3046755',
      valorNf: 'R$ 182.678,57',
      somaVl: 'R$ 182.678,57',
      protocolo: 'AVB-98125'
    }
  ]);

  const showNotificationMsg = (message: string, type: 'success' | 'delete' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 2500);
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

  const parseInput = (text: string) => {
    if (!text.trim()) return;
    const lines = text.trim().split('\n');
    const newRows: AverbacaoRow[] = [];

    lines.forEach((line) => {
      const parts = line.split('\t');
      if (parts.length >= 7) {
        newRows.push({
          dataAverbacao: parts[0]?.trim() || '',
          origem: parts[1]?.trim().split('/')[0] || '',
          destino: parts[2]?.trim().split('/')[0] || '',
          placaCav: parts[3]?.trim() || '',
          placaCarr: parts[4]?.trim() || '',
          nf: parts[5]?.trim() || '',
          valorNf: parts[6]?.trim() || '',
          somaVl: parts[7]?.trim() || '',
          protocolo: parts[8]?.trim() || ''
        });
      }
    });

    if (newRows.length > 0) {
      setParsedRows(newRows);
      setShowPasteModal(false);
      setRawInputText('');
      showNotificationMsg(`${newRows.length} registros importados!`);
    } else {
      showNotificationMsg('Formato inválido. Use dados separados por TAB.', 'delete');
    }
  };

  const handleClearAll = () => {
    setParsedRows([]);
    showNotificationMsg('Todos os registros foram limpos.', 'delete');
  };

  const parseCurrency = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/R\$/gi, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const getTotalValue = () => {
    if (parsedRows.length === 0) return 'R$ 324.998,00';
    const sum = parsedRows.reduce((acc, row) => acc + parseCurrency(row.valorNf), 0);
    return formatCurrency(sum);
  };

  const getRouteTitle = (rows: AverbacaoRow[]) => {
    const activeRows = rows.length > 0 ? rows : parsedRows;
    const origem = activeRows.find(r => r.origem && r.origem !== '-')?.origem || 'SANTA LUZIA';
    const uniqueDestinos = Array.from(new Set(activeRows.map(r => r.destino?.trim()).filter(Boolean)));

    if (uniqueDestinos.length === 0) {
      return `ROTA: ${origem} X LONDRINA`;
    }
    if (uniqueDestinos.length === 1) {
      return `ROTA: ${origem} X ${uniqueDestinos[0]}`;
    }
    return `ROTA: ${origem} X MÚLTIPLOS DESTINOS (${uniqueDestinos.join(', ')})`;
  };

  const getProtocolsList = (rows: AverbacaoRow[]) => {
    const activeRows = rows.length > 0 ? rows : parsedRows;
    const uniqueProtocols = Array.from(new Set(activeRows.map(r => r.protocolo?.trim()).filter(Boolean)));
    return uniqueProtocols.length > 0 ? uniqueProtocols.join(', ') : 'AVB-98124, AVB-98125';
  };

  const getUniqueTransportRows = (rows: AverbacaoRow[]) => {
    const activeRows = rows.length > 0 ? rows : parsedRows;
    if (activeRows.length === 0) return [];

    const primaryPlacaCav = activeRows.find(r => r.placaCav && r.placaCav !== '-')?.placaCav || 'QWA6A22';
    const primaryPlacaCarr = activeRows.find(r => r.placaCarr && r.placaCarr !== '-')?.placaCarr || 'DLV7307';
    const primaryOrigem = activeRows.find(r => r.origem && r.origem !== '-')?.origem || 'SANTA LUZIA';

    const seen = new Set<string>();
    const uniqueList: AverbacaoRow[] = [];

    activeRows.forEach(row => {
      const orig = (row.origem && row.origem !== '-') ? row.origem : primaryOrigem;
      const dest = row.destino || 'LONDRINA';
      const cav = (row.placaCav && row.placaCav !== '-') ? row.placaCav : primaryPlacaCav;
      const carr = (row.placaCarr && row.placaCarr !== '-') ? row.placaCarr : primaryPlacaCarr;

      const key = `${orig.toUpperCase().trim()}|${dest.toUpperCase().trim()}|${cav.toUpperCase().trim()}|${carr.toUpperCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push({
          ...row,
          origem: orig,
          destino: dest,
          placaCav: cav,
          placaCarr: carr
        });
      }
    });

    return uniqueList;
  };

  const copyAsImage = async () => {
    if (!emailPreviewRef.current) return;
    setIsGeneratingImg(true);
    try {
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

  const copyToEmail = async () => {
    const accentHex = activeTheme.accentColor;
    const textColorHex = activeTheme.textColor;
    
    const displayRows = filteredRows.length > 0 ? filteredRows : parsedRows;
    const rowsToUse = displayRows.length > 0 ? displayRows : [
      {
        dataAverbacao: '25/09/2026',
        origem: 'SANTA LUZIA',
        destino: 'LONDRINA',
        placaCav: 'QWA6A22',
        placaCarr: 'DLV7307',
        nf: '3045088',
        valorNf: 'R$ 142.319,43',
        somaVl: 'R$ 905.343,74',
        protocolo: 'AVB-98124'
      }
    ];

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

    const tableRowsHtml = uniqueTransportRows.map(r => `
      <tr style="font-weight: bold;">
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: ${accentHex}; color: ${textColorHex}; text-transform: uppercase;">${r.origem || 'SANTA LUZIA'}</td>
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: ${accentHex}; color: ${textColorHex}; text-transform: uppercase;">${r.destino || 'LONDRINA'}</td>
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: ${accentHex}; color: ${textColorHex}; text-transform: uppercase;">${extraData.transportadora}</td>
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: #e2e8f0; color: #1e293b; text-transform: uppercase;">${r.placaCav && r.placaCav !== '-' ? r.placaCav : 'QWA6A22'}</td>
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: ${accentHex}; color: ${textColorHex}; text-transform: uppercase;">${r.placaCarr && r.placaCarr !== '-' ? r.placaCarr : 'DLV7307'}</td>
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: ${accentHex}; color: ${textColorHex}; text-transform: uppercase;">${extraData.tecnologia}</td>
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: ${accentHex}; color: ${textColorHex}; text-transform: uppercase;">${extraData.nomeMotorista}</td>
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: ${accentHex}; color: ${textColorHex}; text-transform: uppercase;">${extraData.cpf}</td>
        <td style="padding: 8px 10px; border: 1px solid #000000; background-color: ${accentHex}; color: ${textColorHex}; text-transform: uppercase;">${extraData.telefone}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; line-height: 1.6; max-width: 850px; background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <p style="font-weight: bold; margin: 0 0 12px 0; color: #000000; font-size: 15px;">Bom dia!</p>
        
        <p style="margin: 0 0 14px 0; color: #1f2937;">
          Segue <span style="background-color: ${accentHex}; color: ${textColorHex}; padding: 3px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">AVERBAÇÃO</span> realizada via sistema.
        </p>

        <div style="background-color: #f8f9fa; border-left: 5px solid ${accentHex}; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-family: Arial, sans-serif;">
          <div style="font-size: 14px; font-weight: bold; color: #000000; margin-bottom: 6px; text-transform: uppercase;">
            ${routeTitle}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #000000; margin-bottom: 6px;">
            PROTOCOLO: <span style="color: #2563eb; font-family: monospace, Courier, monospace; font-weight: bold;">${protocolosList}</span>
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #000000;">
            Valor da Carga: <span style="color: #dc2626; font-family: monospace, Courier, monospace; font-weight: bold;">${totalCarga}</span>
          </div>
        </div>

        <p style="margin: 14px 0 12px 0; color: #1f2937;">Segue dados e NFs em anexo:</p>

        <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; border: 1px solid #000000; margin: 12px 0;">
          <thead>
            <tr style="background-color: #000000; color: #ffffff; font-weight: bold; text-transform: uppercase; font-size: 11px;">
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">ORIGEM</th>
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">DESTINO</th>
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">TRANSPORTADORA</th>
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">PLACA CAVALO</th>
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">PLACAS CARRETAS</th>
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">TECNOLOGIA</th>
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">NOME MOTORISTA</th>
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">CPF</th>
              <th style="padding: 8px 10px; border: 1px solid #333333; text-align: left;">TELEFONE</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <p style="font-weight: bold; margin-top: 16px; margin-bottom: 0; color: #000000;">Att,</p>
      </div>
    `.trim();

    const plainText = `Bom dia!\n\nSegue AVERBAÇÃO realizada via sistema.\n\n${routeTitle}\nPROTOCOLO: ${protocolosList}\nValor da Carga: ${totalCarga}\n\nSegue dados e NFs em anexo:\n\nAtt,`;

    const copiedSuccessfully = await safeCopyHtmlAndText(htmlContent, plainText, imageBlob);
    if (copiedSuccessfully) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showNotificationMsg('Formato visual da averbação copiado com sucesso!');
    } else {
      showNotificationMsg('Texto simples da averbação copiado!');
    }
  };

  const filteredRows = parsedRows.filter(r => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.placaCav.toLowerCase().includes(term) ||
      r.placaCarr.toLowerCase().includes(term) ||
      r.nf.toLowerCase().includes(term) ||
      r.protocolo.toLowerCase().includes(term) ||
      r.destino.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full h-full flex flex-col relative text-left bg-[#fcf9f5] p-3 text-[#00163a] font-sans overflow-y-auto">
      
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
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            )}
          >
            <Check size={15} className={notification.type === 'delete' ? "text-red-600" : "text-emerald-600"} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* GRID SYSTEM: SIDEBAR ON THE RIGHT, MASTER BOARD ON THE LEFT                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 w-full items-start">
        
        {/* LEFT COLUMN: BRANDED INTERACTIVE BOARD PANEL */}
        <div className="flex flex-col gap-3.5 w-full">
          
          {/* TOP CONTROLS: CODES BAR */}
          <div className="bg-[#fffdfa] border border-[#e7dac9] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-black uppercase text-amber-800 flex items-center gap-1">
                ⚡ CÓDIGOS RÁPIDOS OPERACIONAIS:
              </span>
              
              {/* Capsula Field */}
              <div className="flex items-center bg-white border border-[#ded5c6] rounded px-3 py-1.5 font-bold font-mono text-[#00163a] gap-2 shadow-2xs">
                <span>CÁPSULA:</span>
                <span className="text-stone-900 tracking-wider font-extrabold uppercase">
                  9000000982
                </span>
                <button 
                  onClick={() => copyCodeToClipboard('CÁPSULA', '9000000982')}
                  className="text-stone-400 hover:text-stone-800 cursor-pointer"
                >
                  <Copy size={11} />
                </button>
              </div>

              {/* Maquina Field */}
              <div className="flex items-center bg-white border border-[#ded5c6] rounded px-3 py-1.5 font-bold font-mono text-[#00163a] gap-2 shadow-2xs">
                <span>MÁQUINA:</span>
                <span className="text-stone-950 font-black">00008901</span>
                <button 
                  onClick={() => copyCodeToClipboard('MÁQUINA', '00008901')}
                  className="text-stone-400 hover:text-stone-800 cursor-pointer"
                >
                  <Copy size={11} />
                </button>
              </div>

              {/* Embarques Field */}
              <div className="flex items-center bg-white border border-[#ded5c6] rounded px-3 py-1.5 font-bold font-mono text-[#00163a] gap-2 shadow-2xs">
                <span>EMBARQUES:</span>
                <span className="text-stone-950 font-black">132</span>
                <button 
                  onClick={() => copyCodeToClipboard('EMBARQUES', '132')}
                  className="text-stone-400 hover:text-stone-800 cursor-pointer"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>

            {/* BUTTON BAR */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setShowPasteModal(true)}
                className="bg-[#8d1118] hover:bg-[#6f0d14] text-white text-[11px] font-black uppercase px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                COLAR PLANILHA TSV
              </button>
              <button
                onClick={() => parseInput(SAMPLE_TSV_DATA)}
                className="bg-white hover:bg-stone-50 border border-[#ded5c6] text-stone-700 text-[11px] font-black uppercase px-4 py-2 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={11} className="text-amber-600" />
                <span>EXEMPLO</span>
              </button>
              <button
                onClick={handleClearAll}
                className="bg-white hover:bg-red-50 border border-red-200 text-red-600 text-[11px] font-black uppercase px-4 py-2 rounded-xl shadow-2xs cursor-pointer"
              >
                LIMPAR
              </button>
            </div>
          </div>

          {/* SEARCH BAR (Wide) */}
          <div className="relative w-full">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa, nota, protocolo ou destino..."
              className="w-full bg-white text-stone-900 border border-[#e7dac9] rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#8d1118] shadow-2xs"
            />
          </div>

          {/* EMAIL PREVIEW CARD CONTAINER */}
          <div className="bg-[#fffdfa] border border-[#e7dac9] rounded-2xl p-4 shadow-sm text-xs font-mono space-y-3.5">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 border border-red-100 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="text-left leading-none">
                  <span className="text-[9px] font-black uppercase tracking-wider text-red-800 block">
                    FORMATO PARA CLIENTE DE E-MAIL
                  </span>
                  <span className="text-[13px] font-black text-stone-900 uppercase tracking-tight block mt-1">
                    CORPO DA MENSAGEM DE AVERBAÇÃO
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">


                  <button
                    onClick={copyToEmail}
                    className="bg-[#8d1118] hover:bg-[#6f0d14] text-white text-[11px] font-black uppercase px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Clipboard size={12} />
                    <span>{copied ? 'COPIADO' : 'COPIAR FORMATADO'}</span>
                  </button>
              </div>
            </div>

            {/* Inner Message Template */}
            <div 
              ref={emailPreviewRef}
              className="bg-white border border-stone-200 rounded-2xl p-6 text-left font-sans text-stone-900 space-y-4 shadow-sm leading-relaxed"
            >
              <p className="font-extrabold text-stone-950 text-sm">Bom dia!</p>
              
              <p className="font-semibold text-stone-800 text-xs sm:text-sm">
                Segue <span className={cn("px-2 py-0.5 rounded font-black", activeTheme.highlightClass)} style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>AVERBAÇÃO</span> realizada via sistema.
              </p>

              {/* Highlights Quote Panel */}
              <div 
                className="bg-[#f8f9fa] p-4.5 rounded-xl space-y-1.5 shadow-2xs"
                style={{ borderLeft: `5px solid ${activeTheme.accentColor}` }}
              >
                <div className="text-xs sm:text-[13px] font-black text-stone-950 uppercase">
                  {getRouteTitle(filteredRows.length > 0 ? filteredRows : parsedRows)}
                </div>
                <div className="text-xs font-black text-stone-900">
                  PROTOCOLO: <span className="text-[#2563eb] font-extrabold font-mono">{getProtocolsList(filteredRows.length > 0 ? filteredRows : parsedRows)}</span>
                </div>
                <div className="text-xs font-black text-stone-900">
                  Valor da Carga: <span className="text-[#dc2626] font-extrabold font-mono">{getTotalValue()}</span>
                </div>
              </div>

              <p className="font-semibold text-stone-800 text-xs sm:text-sm">Segue dados e NFs em anexo:</p>

              {/* BLACK & SELECTED ACCENT THEME GRID */}
              <div className="overflow-x-auto rounded-lg border border-stone-900">
                <table className="w-full border-collapse text-xs text-left min-w-[780px] font-mono">
                  <thead>
                    <tr className="bg-black text-white text-[10px] font-black uppercase tracking-wider">
                      <th className="p-2.5 border border-stone-800">ORIGEM</th>
                      <th className="p-2.5 border border-stone-800">DESTINO</th>
                      <th className="p-2.5 border border-stone-800">TRANSPORTADORA</th>
                      <th className="p-2.5 border border-stone-800">PLACA CAVALO</th>
                      <th className="p-2.5 border border-stone-800">PLACAS CARRETAS</th>
                      <th className="p-2.5 border border-stone-800">TECNOLOGIA</th>
                      <th className="p-2.5 border border-stone-800">NOME MOTORISTA</th>
                      <th className="p-2.5 border border-stone-800">CPF</th>
                      <th className="p-2.5 border border-stone-800">TELEFONE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getUniqueTransportRows(filteredRows.length > 0 ? filteredRows : parsedRows).map((row, idx) => (
                      <tr key={idx} className="font-black">
                        <td className="p-2.5 border border-stone-900 uppercase text-[11px]" style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>
                          {row.origem || 'SANTA LUZIA'}
                        </td>
                        <td className="p-2.5 border border-stone-900 uppercase text-[11px]" style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>
                          {row.destino || 'LONDRINA'}
                        </td>
                        <td className="p-2.5 border border-stone-900 uppercase text-[11px]" style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>
                          {extraData.transportadora}
                        </td>
                        <td className="p-2.5 border border-stone-900 uppercase text-[11px] bg-[#e2e8f0] text-slate-900">
                          {row.placaCav && row.placaCav !== '-' ? row.placaCav : 'QWA6A22'}
                        </td>
                        <td className="p-2.5 border border-stone-900 uppercase text-[11px]" style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>
                          {row.placaCarr && row.placaCarr !== '-' ? row.placaCarr : 'DLV7307'}
                        </td>
                        <td className="p-2.5 border border-stone-900 uppercase text-[11px]" style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>
                          {extraData.tecnologia}
                        </td>
                        <td className="p-2.5 border border-stone-900 uppercase text-[11px]" style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>
                          {extraData.nomeMotorista}
                        </td>
                        <td className="p-2.5 border border-stone-900 text-[11px]" style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>
                          {extraData.cpf}
                        </td>
                        <td className="p-2.5 border border-stone-900 text-[11px]" style={{ backgroundColor: activeTheme.accentColor, color: activeTheme.textColor }}>
                          {extraData.telefone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="font-extrabold text-stone-950 pt-2 text-sm">Att,</p>
            </div>

            {/* Branded footer of this panel */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-slate-400 border-t border-stone-200/60 pt-3 gap-2">
              <div className="flex items-center gap-1 flex-wrap uppercase">
                <span>TOTAL DE ROTAS: {getUniqueTransportRows(filteredRows.length > 0 ? filteredRows : parsedRows).length || 1}</span>
                <span>•</span>
                <span>TOTAL DE NOTAS: {filteredRows.length}</span>
                <span>•</span>
                <span>ÚLTIMA ATUALIZAÇÃO: 25/09/2026 21:39</span>
              </div>
              
              <div className="flex items-center gap-1.5 uppercase text-[#00e676]">
                <span className="w-2 h-2 rounded-full bg-[#00e676] inline-block animate-pulse" />
                <span>SISTEMA ONLINE</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: "DADOS OPERACIONAIS" SIDEBAR */}
        <div className="flex flex-col gap-3 w-full shrink-0">
          
          {/* Header Section */}
          <div className="bg-[#fffdfa] border border-[#e7dac9] rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <span className="text-xs font-black uppercase text-[#00163a] tracking-wider flex items-center gap-2">
              🏢 DADOS OPERACIONAIS
            </span>
            <ChevronDown size={14} className="text-[#00163a]" />
          </div>

          {/* SIDEBAR FIELDS CARDS */}
          <div className="space-y-3.5 text-xs text-left">
            
            {/* Field 1: Transportadora */}
            <div className="bg-white border border-[#ded5c6] rounded-xl p-3 shadow-2xs">
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                TRANSPORTADORA
              </label>
              
              <div className="relative">
                <select
                  value={extraData.transportadora}
                  onChange={(e) => setExtraData(prev => ({ ...prev, transportadora: e.target.value }))}
                  className="w-full bg-[#fbf9f5] border border-[#ded5c6] rounded px-3 py-2 text-xs font-black text-stone-900 outline-none uppercase appearance-none cursor-pointer pr-8"
                >
                  {customTransportadoras.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
              </div>

              {/* Add Custom Transportadora Button */}
              {showAddTranspInput ? (
                <div className="mt-2.5 flex gap-1.5">
                  <input
                    type="text"
                    value={newTranspName}
                    onChange={(e) => setNewTranspName(e.target.value)}
                    placeholder="NOME"
                    className="flex-1 bg-stone-50 border border-stone-200 rounded px-2 py-1 uppercase font-bold text-xs"
                  />
                  <button 
                    onClick={handleAddCustomTransp}
                    className="px-2.5 py-1 bg-stone-800 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddTranspInput(true)}
                  className="text-red-700 font-black text-[10px] mt-2 block hover:underline cursor-pointer"
                >
                  + ADICIONAR NOVA
                </button>
              )}
            </div>

            {/* Field 2: Tecnologia PGR */}
            <div className="bg-white border border-[#ded5c6] rounded-xl p-3 shadow-2xs">
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                TECNOLOGIA PGR
              </label>
              <div className="relative">
                <select
                  value={extraData.tecnologia}
                  onChange={(e) => setExtraData(prev => ({ ...prev, tecnologia: e.target.value }))}
                  className="w-full bg-[#fbf9f5] border border-[#ded5c6] rounded px-3 py-2 text-xs font-black text-stone-900 outline-none uppercase appearance-none cursor-pointer pr-8"
                >
                  {DEFAULT_TECNOLOGIAS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
              </div>
            </div>

            {/* Field 3: Nome do Condutor */}
            <div className="bg-white border border-[#ded5c6] rounded-xl p-3 shadow-2xs">
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                NOME DO CONDUTOR
              </label>
              <div className="flex items-center gap-2 bg-[#fbf9f5] border border-[#ded5c6] rounded px-3 py-2">
                <User size={13} className="text-slate-400" />
                <input
                  type="text"
                  value={extraData.nomeMotorista}
                  onChange={(e) => setExtraData(prev => ({ ...prev, nomeMotorista: e.target.value.toUpperCase() }))}
                  className="w-full bg-transparent font-black text-stone-900 outline-none uppercase"
                />
              </div>
            </div>

            {/* Field 4: CPF */}
            <div className="bg-white border border-[#ded5c6] rounded-xl p-3 shadow-2xs">
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                CPF / MOTORISTA
              </label>
              <div className="flex items-center gap-2 bg-[#fbf9f5] border border-[#ded5c6] rounded px-3 py-2">
                <CreditCard size={13} className="text-slate-400" />
                <input
                  type="text"
                  value={extraData.cpf}
                  onChange={(e) => setExtraData(prev => ({ ...prev, cpf: e.target.value }))}
                  className="w-full bg-transparent font-black text-stone-900 outline-none"
                />
              </div>
            </div>

            {/* Field 5: Telefone */}
            <div className="bg-white border border-[#ded5c6] rounded-xl p-3 shadow-2xs">
              <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
                TELEFONE / WHATSAPP
              </label>
              <div className="flex items-center gap-2 bg-[#fbf9f5] border border-[#ded5c6] rounded px-3 py-2">
                <Phone size={13} className="text-slate-400" />
                <input
                  type="text"
                  value={extraData.telefone}
                  onChange={(e) => setExtraData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="w-full bg-transparent font-black text-stone-900 outline-none"
                />
              </div>
            </div>

            {/* Field 6: Paleta de Cores do E-mail */}
            <div className="bg-white border border-[#ded5c6] rounded-xl p-3 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400">
                <span>PALETA DE CORES DO E-MAIL</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded font-bold border",
                  emailColor === 'amarelo' ? "bg-[#FFFF00] text-black border-yellow-400" :
                  emailColor === 'vermelho' ? "bg-red-600 text-white border-red-700" :
                  emailColor === 'azul' ? "bg-blue-600 text-white border-blue-700" :
                  "bg-emerald-600 text-white border-emerald-700"
                )}>
                  {COLOR_THEMES[emailColor].name}
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {/* Yellow Theme Button */}
                <button
                  type="button"
                  onClick={() => setEmailColor('amarelo')}
                  className={cn(
                    "h-10 rounded-lg bg-[#FFFF00] border relative flex items-center justify-center cursor-pointer transition-all",
                    emailColor === 'amarelo' ? "border-stone-950 scale-95 shadow-sm border-2" : "border-stone-200"
                  )}
                >
                  {emailColor === 'amarelo' && <Check size={16} className="text-black stroke-[3]" />}
                </button>

                {/* Red Theme Button */}
                <button
                  type="button"
                  onClick={() => setEmailColor('vermelho')}
                  className={cn(
                    "h-10 rounded-lg bg-red-600 border relative flex items-center justify-center cursor-pointer transition-all",
                    emailColor === 'vermelho' ? "border-stone-950 scale-95 shadow-sm border-2" : "border-stone-200"
                  )}
                >
                  {emailColor === 'vermelho' && <Check size={16} className="text-white stroke-[3]" />}
                </button>

                {/* Blue Theme Button */}
                <button
                  type="button"
                  onClick={() => setEmailColor('azul')}
                  className={cn(
                    "h-10 rounded-lg bg-blue-600 border relative flex items-center justify-center cursor-pointer transition-all",
                    emailColor === 'azul' ? "border-stone-950 scale-95 shadow-sm border-2" : "border-stone-200"
                  )}
                >
                  {emailColor === 'azul' && <Check size={16} className="text-white stroke-[3]" />}
                </button>

                {/* Green Theme Button */}
                <button
                  type="button"
                  onClick={() => setEmailColor('verde')}
                  className={cn(
                    "h-10 rounded-lg bg-emerald-600 border relative flex items-center justify-center cursor-pointer transition-all",
                    emailColor === 'verde' ? "border-stone-950 scale-95 shadow-sm border-2" : "border-stone-200"
                  )}
                >
                  {emailColor === 'verde' && <Check size={16} className="text-white stroke-[3]" />}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Paste TSV Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl border border-[#ded5c6] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-left">
              <h3 className="font-bold text-base text-stone-900 font-sans uppercase">
                Colar Planilha TSV de Averbação
              </h3>
              <button 
                onClick={() => setShowPasteModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <textarea
              value={rawInputText}
              onChange={(e) => setRawInputText(e.target.value)}
              placeholder="Cole aqui as linhas separadas por TAB da sua planilha..."
              rows={8}
              className="w-full bg-[#fbf9f5] border border-[#ded5c6] rounded-xl p-3 text-xs font-mono outline-none"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => parseInput(rawInputText)}
                className="px-4 py-2 rounded-xl font-bold text-white bg-[#8d1118] hover:bg-[#6f0d14] cursor-pointer"
              >
                Processar e Inserir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Averbacao;
