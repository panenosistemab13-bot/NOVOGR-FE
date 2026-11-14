import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Clipboard, 
  Trash2, 
  Calculator, 
  Mail, 
  Plus, 
  Check, 
  ChevronRight,
  TrendingUp,
  Download,
  Info,
  Copy,
  ChevronUp,
  ChevronDown,
  ArrowRightLeft,
  Truck,
  RefreshCw,
  Calendar as CalendarIcon,
  X,
  LayoutGrid,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  StickyNote,
  ArrowLeft,
  FileSpreadsheet,
  ArrowDownUp,
  Route,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Zap,
  ArrowDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { safeCopyText, safeCopyHtmlAndText } from '../utils/clipboard';
import { ref, onValue, set, update } from 'firebase/database';

// Configuração robusta do Worker do PDF.js (pdfjs-dist v6.2.108 usa .mjs)
// 1. Arquivo local servido estaticamente em /public/pdf.worker.min.mjs (recomendado para empacotamento Vite)
// 2. Vite new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)
// 3. Fallbacks CDNJS / jsDelivr / unpkg com terminação .mjs
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  } catch (e) {
    const version = pdfjsLib.version || '6.2.108';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  }
}

let isWorkerConfigured = false;
const ensurePdfWorker = async () => {
  if (isWorkerConfigured) return;
  if (typeof window === 'undefined') return;

  const version = pdfjsLib.version || '6.2.108';

  // 1. Prioridade máxima: Arquivo local estático (/pdf.worker.min.mjs)
  try {
    const localRes = await fetch('/pdf.worker.min.mjs', { method: 'HEAD' });
    if (localRes.ok) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      isWorkerConfigured = true;
      return;
    }
  } catch {
    // Caso falhe busca local, tenta Vite URL
  }

  // 2. Segunda opção: new URL do Vite para pdfjs-dist build
  try {
    const viteWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    pdfjsLib.GlobalWorkerOptions.workerSrc = viteWorkerUrl;
    isWorkerConfigured = true;
    return;
  } catch {
    // Continua para CDNs com terminação .mjs
  }

  // 3. CDNs compatíveis com .mjs (cdnjs, jsdelivr, unpkg)
  const cdnOptions = [
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
    `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
  ];

  for (const cdnUrl of cdnOptions) {
    try {
      const resp = await fetch(cdnUrl, { method: 'HEAD' });
      if (resp.ok) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl;
        isWorkerConfigured = true;
        return;
      }
    } catch {
      // Tenta próximo CDN
    }
  }

  // Fallback final garantido com extensão .mjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  isWorkerConfigured = true;
};

const invertRoute = (trecho: string) => {
  if (!trecho) return '';
  const parts = trecho.trim().split(/\s+/);
  const xIndex = parts.findIndex(p => p.toUpperCase() === 'X');
  if (xIndex > 0 && xIndex < parts.length - 1) {
    const newParts = [...parts];
    const startCity = newParts[xIndex - 1];
    const endCity = newParts[xIndex + 1];
    newParts[xIndex - 1] = endCity;
    newParts[xIndex + 1] = startCity;
    return newParts.join(' ').toUpperCase();
  }
  return trecho.toUpperCase();
};

export function parsePastedCurrency(raw: string | undefined | null): number {
  if (!raw) return 0;
  let str = String(raw).trim();
  if (!str) return 0;

  // Remove aspas
  str = str.replace(/^["']|["']$/g, '').trim();

  // Remove prefixos e sufixos de moeda (R$, BRL, RS, $)
  str = str.replace(/^(R\$|BRL|RS|\$)\s*/i, '').trim();
  str = str.replace(/\s*(R\$|BRL|RS|\$)$/i, '').trim();

  // Caso tenha sido colado sobre um campo existente "0,00" e concatenado
  if (str.startsWith('0,00') && str.length > 4) {
    str = str.slice(4).trim();
  }
  if (str.endsWith('0,00') && str.length > 4 && (str.includes(',') || str.includes('.'))) {
    const commaCount = (str.match(/,/g) || []).length;
    if (commaCount > 1) {
      str = str.slice(0, -4).trim();
    }
  }

  // Caso 1: Contém ponto E vírgula (ex: 1.234.567,89 ou 1,234,567.89)
  if (str.includes('.') && str.includes(',')) {
    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Padrão brasileiro: 1.234.567,89 -> remove pontos, vírgula vira ponto
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Padrão americano: 1,234,567.89 -> remove vírgulas
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    // Apenas vírgula: ex "1234,56" ou "50,5"
    const parts = str.split(',');
    if (parts.length === 2) {
      str = str.replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes('.')) {
    // Apenas ponto: ex "1234.56" ou "50.000" ou "1.500"
    const parts = str.split('.');
    if (parts.length > 2) {
      // Múltiplos pontos -> separador de milhar brasileiro
      str = str.replace(/\./g, '');
    } else if (parts.length === 2) {
      if (parts[1].length === 3) {
        // Ex: 50.000 ou 1.500 -> milhar brasileiro
        str = str.replace(/\./g, '');
      }
      // Se não for 3 dígitos (ex: 50.5 ou 1234.56), é ponto decimal
    }
  }

  // Remove quaisquer caracteres restantes que não sejam dígitos, sinal ou ponto
  str = str.replace(/[^\d.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) || num < 0 ? 0 : num;
}

export function formatCurrencyNumber(num: number): string {
  if (isNaN(num) || num <= 0) return '0,00';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

const formatNfValue = (value: string) => {
  if (!value) return '0,00';
  const trimmed = value.trim();

  // Se o valor contiver símbolos de moeda, concatenação com "0,00" ou múltiplos separadores
  if (
    /R?S?\$|BRL/i.test(trimmed) || 
    (trimmed.startsWith('0,00') && trimmed.length > 4) || 
    (trimmed.match(/,/g) || []).length > 1 ||
    (trimmed.includes('.') && trimmed.includes(','))
  ) {
    const parsed = parsePastedCurrency(trimmed);
    return formatCurrencyNumber(parsed);
  }

  // Máscara tradicional para digitação dígito a dígito
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '0,00';
  const amount = parseFloat(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const parseNfNumeric = (val: string | undefined | null): number => {
  if (!val) return 0;
  return parsePastedCurrency(val);
};

export const isValorNfEmpty = (val: string | undefined | null): boolean => {
  if (!val) return true;
  const trimmed = String(val).trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '--' || trimmed === '0,00') return true;
  const num = parseNfNumeric(trimmed);
  return num <= 0;
};

export const sortSMRowsByValorNf = (rows: SMRow[]): SMRow[] => {
  if (!rows || rows.length === 0) return [];
  return [...rows].sort((a, b) => {
    const aEmpty = isValorNfEmpty(a.valorNf);
    const bEmpty = isValorNfEmpty(b.valorNf);

    // Linhas com valor adicionado vão para o topo
    if (!aEmpty && bEmpty) return -1;
    // Linhas vazias vão para o final
    if (aEmpty && !bEmpty) return 1;

    // Se ambas tiverem valor adicionado: maior valor no topo (ordem decrescente)
    if (!aEmpty && !bEmpty) {
      const aVal = parseNfNumeric(a.valorNf);
      const bVal = parseNfNumeric(b.valorNf);
      return bVal - aVal;
    }

    return 0;
  });
};

interface SMRow {
  dataSaida: string;
  motorista: string;
  placa: string;
  bau1: string;
  bau2: string;
  trecho: string;
  valorNf: string;
  ok?: boolean;
}

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

interface SMCreatorProps {
  view?: 'generator' | 'codes';
  onBack?: () => void;
}

interface RouteItem {
  ida: string;
  idaCod: string;
  volta: string;
  voltaCod: string;
}

const DEFAULT_ROUTES: RouteItem[] = [
  { ida: 'SANTA LUZIA-MG X RIO DE JANEIRO-RJ', idaCod: '4069', volta: 'RIO DE JANEIRO-RJ X SANTA LUZIA-MG', voltaCod: '4079' },
  { ida: 'SANTA LUZIA-MG X GUARULHOS-SP', idaCod: '4070', volta: 'GUARULHOS-SP X SANTA LUZIA-MG', voltaCod: '3971/4076' },
  { ida: 'SANTA LUZIA-MG X MONTES CLAROS-MG', idaCod: '', volta: 'MONTES CLAROS-MG X SANTA LUZIA-MG', voltaCod: '4081' },
  { ida: 'SANTA LUZIA-MG X VIANA-ES', idaCod: '', volta: 'VIANA-ES X SANTA LUZIA-MG', voltaCod: '3985' },
  { ida: 'SANTA LUZIA-MG X BRASILIA-DF', idaCod: '4071', volta: 'BRASILIA-DF X SANTA LUZIA-MG', voltaCod: '4077' },
  { ida: 'SANTA LUZIA-MG X SUMARE-SP', idaCod: '', volta: 'SUMARE-SP X SANTA LUZIA-MG', voltaCod: '3994' },
  { ida: 'SANTA LUZIA-MG X PINHAIS-PR', idaCod: '', volta: 'PINHAIS-PR X SANTA LUZIA-MG', voltaCod: '4080' },
  { ida: 'SANTA LUZIA-MG X LONDRINA-PR', idaCod: '4027', volta: 'LONDRINA-PR X SANTA LUZIA-MG', voltaCod: '3975/4078/4091' },
  { ida: 'SANTA LUZIA-MG X NATAL-RN', idaCod: '4015', volta: 'NATAL-RN X SANTA LUZIA-MG', voltaCod: '3969/3970/4075' },
  { ida: 'SANTA LUZIA-MG X GOV. CELSO RAMOS-SC', idaCod: '', volta: 'GOV. CELSO RAMOS-SC X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X SALVADOR-BA', idaCod: '', volta: 'SALVADOR-BA X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X EUSEBIO-CE', idaCod: '', volta: 'EUSEBIO-CE X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X GRAVATAI-RS', idaCod: '', volta: 'GRAVATAI-RS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CAMPO GRANDE-MT', idaCod: '', volta: 'CAMPO GRANDE-MS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CUIABA-MT', idaCod: '', volta: 'CUIABA-MT X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X ARIQUEMES', idaCod: '', volta: 'ARIQUEMES-RO X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X VESPASIANO-MG', idaCod: '', volta: 'VESPASIANO-MG X SANTA LUZIA-MG', voltaCod: '3989/3990' },
];

const CITY_MAP: Record<string, string> = {
  slt: 'SANTA LUZIA',
  stl: 'SANTA LUZIA',
  'santa luzia': 'SANTA LUZIA',
  vesp: 'VESPASIANO',
  vespasiano: 'VESPASIANO',
  bra: 'BRASILIA',
  brasilia: 'BRASILIA',
  spo: 'GUARULHOS',
  guarulhos: 'GUARULHOS',
  cam: 'SUMARE',
  sumare: 'SUMARE',
  via: 'VIANA',
  viana: 'VIANA',
  rjo: 'RIO DE JANEIRO',
  'rio de janeiro': 'RIO DE JANEIRO',
  pinh: 'PINHAIS',
  pinhais: 'PINHAIS',
  lon: 'LONDRINA',
  londrina: 'LONDRINA',
  moc: 'MONTES CLAROS',
  'montes claros': 'MONTES CLAROS',
  nat: 'NATAL',
  natal: 'NATAL',
  gov: 'GOV. CELSO RAMOS',
  salv: 'SALVADOR',
  euseb: 'EUSEBIO',
  grav: 'GRAVATAI',
  cg: 'CAMPO GRANDE',
  cui: 'CUIABA',
  ariq: 'ARIQUEMES'
};

const resolveCityName = (term: string): string => {
  const clean = term.trim().toLowerCase().replace(/[-_]/g, ' ');
  if (CITY_MAP[clean]) return CITY_MAP[clean];
  
  for (const [key, val] of Object.entries(CITY_MAP)) {
    if (clean.includes(key)) return val;
  }
  return clean.toUpperCase();
};

const findRouteCode = (trechoStr: string, section: 'ida' | 'volta', routes: RouteItem[]): string => {
  if (!trechoStr || !trechoStr.trim()) return '---';
  
  const raw = trechoStr.trim();
  const parts = raw.split(/\s*X\s*/i);
  let origin = '';
  let destination = '';

  if (parts.length >= 2) {
    origin = resolveCityName(parts[0]);
    destination = resolveCityName(parts[1]);
  } else {
    origin = resolveCityName(raw);
  }

  if (section === 'volta') {
    if (origin === 'SANTA LUZIA' && destination && destination !== 'SANTA LUZIA') {
      const temp = origin;
      origin = destination;
      destination = temp;
    }
  }

  for (const r of routes) {
    const idaUpper = (r.ida || '').toUpperCase();
    const voltaUpper = (r.volta || '').toUpperCase();

    if (section === 'ida') {
      if (origin && destination) {
        if (idaUpper.includes(origin) && idaUpper.includes(destination)) {
          return r.idaCod || r.voltaCod || '---';
        }
      } else if (origin) {
        if (idaUpper.includes(origin)) return r.idaCod || r.voltaCod || '---';
      }
    } else {
      if (origin && destination) {
        if (voltaUpper.includes(origin) && voltaUpper.includes(destination)) {
          return r.voltaCod || r.idaCod || '---';
        }
      } else if (origin) {
        if (voltaUpper.includes(origin)) return r.voltaCod || r.idaCod || '---';
      }
    }
  }

  for (const r of routes) {
    const idaUpper = (r.ida || '').toUpperCase();
    const voltaUpper = (r.volta || '').toUpperCase();

    if (origin && destination) {
      if ((idaUpper.includes(origin) && idaUpper.includes(destination)) ||
          (voltaUpper.includes(origin) && voltaUpper.includes(destination))) {
        return section === 'ida' ? (r.idaCod || r.voltaCod || '---') : (r.voltaCod || r.idaCod || '---');
      }
    }
  }

  return '---';
};

const generateStyledTableHtml = (rows: SMRow[], type: 'ida' | 'volta' | 'vespasiano' | 'nordeste') => {
  if (rows.length === 0) return '';
  const headerBg = type === 'ida' ? '#0A0D10' : type === 'volta' ? '#801414' : type === 'nordeste' ? '#F2B729' : '#166534';
  const headerBorder = type === 'ida' ? '#D9AD5A' : type === 'nordeste' ? '#C98A0C' : headerBg;
  const headerColor = type === 'ida' ? '#E5C27A' : type === 'nordeste' ? '#141311' : '#ffffff';
  
  let rowsHtml = '';
  rows.forEach((r, idx) => {
    const isValFilled = !isValorNfEmpty(r.valorNf);
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    rowsHtml += `
      <tr style="background-color: ${bg}; height: 32px;">
        <td style="width: 11%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.dataSaida || '-'}</td>
        <td style="width: 25%; padding: 6px 8px; text-align: left; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.motorista || '-'}</td>
        <td style="width: 12%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.placa || '-'}</td>
        <td style="width: 11%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.bau1 || '-'}</td>
        <td style="width: 11%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.bau2 || '-'}</td>
        <td style="width: 18%; padding: 6px 4px; text-align: center; vertical-align: middle; border: 1px solid #cbd5e1; color: #0f172a; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; text-transform: uppercase;">${r.trecho || '-'}</td>
        <td style="width: 12%; padding: 6px 8px; text-align: right; vertical-align: middle; border: 1px solid #cbd5e1; color: ${type === 'ida' && isValFilled ? '#946c15' : '#0f172a'}; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px;">${r.valorNf || '0,00'}</td>
      </tr>`;
  });

  return `
    <div style="width: 100%; max-width: 950px; box-sizing: border-box; margin: 10px 0;">
      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; border: 1px solid ${type === 'ida' ? '#D9AD5A' : '#94a3b8'}; background-color: #ffffff;">
        <thead>
          <tr style="background-color: ${headerBg}; color: ${headerColor}; height: 36px;">
            <th style="width: 11%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBorder}; color: ${headerColor};">DATA</th>
            <th style="width: 25%; text-align: left; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 8px; border: 1px solid ${headerBorder}; color: ${headerColor};">MOTORISTA</th>
            <th style="width: 12%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBorder}; color: ${headerColor};">PLACA</th>
            <th style="width: 11%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBorder}; color: ${headerColor};">BAÚ 1</th>
            <th style="width: 11%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBorder}; color: ${headerColor};">BAÚ 2</th>
            <th style="width: 18%; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 4px; border: 1px solid ${headerBorder}; color: ${headerColor};">TRECHO</th>
            <th style="width: 12%; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; padding: 6px 8px; border: 1px solid ${headerBorder}; color: ${headerColor};">VALOR NF</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>`;
};

export default function SMCreator({ view = 'generator', onBack }: SMCreatorProps) {
  const [internalView, setInternalView] = useState<'all' | 'ida' | 'volta' | 'vespasiano' | 'nordeste' | 'codes'>('all');

  // Controle de visibilidade das 4 rotas (ocultas por padrão conforme solicitação)
  const [visibleRoutes, setVisibleRoutes] = useState<Record<'ida' | 'volta' | 'nordeste' | 'vespasiano', boolean>>(() => {
    try {
      const saved = localStorage.getItem('sm_visible_routes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      ida: false,
      volta: false,
      nordeste: false,
      vespasiano: false
    };
  });
  const [isRouteSelectorOpen, setIsRouteSelectorOpen] = useState(false);

  const toggleVisibleRoute = (routeKey: 'ida' | 'volta' | 'nordeste' | 'vespasiano') => {
    setVisibleRoutes(prev => {
      const updated = { ...prev, [routeKey]: !prev[routeKey] };
      try { localStorage.setItem('sm_visible_routes', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const setAllRoutesVisibility = (show: boolean) => {
    const updated = {
      ida: show,
      volta: show,
      nordeste: show,
      vespasiano: show
    };
    setVisibleRoutes(updated);
    try { localStorage.setItem('sm_visible_routes', JSON.stringify(updated)); } catch {}
  };
  const [idaRows, setIdaRows] = useState<SMRow[]>(() => {
    try {
      const saved = localStorage.getItem('sm_creator_ida');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [voltaRows, setVoltaRows] = useState<SMRow[]>(() => {
    try {
      const saved = localStorage.getItem('sm_creator_volta');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [nordesteRows, setNordesteRows] = useState<SMRow[]>(() => {
    try {
      const saved = localStorage.getItem('sm_creator_nordeste');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [vespasianoRows, setVespasianoRows] = useState<SMRow[]>(() => {
    try {
      const saved = localStorage.getItem('sm_creator_vespasiano');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [calcValues, setCalcValues] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sm_creator_calc');
      return saved ? JSON.parse(saved) : [''];
    } catch { return ['']; }
  });
  const [routesList, setRoutesList] = useState<RouteItem[]>(DEFAULT_ROUTES);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isVespasianoMaximized, setIsVespasianoMaximized] = useState(true);
  const [isIdaMaximized, setIsIdaMaximized] = useState(true);
  const [isVoltaMaximized, setIsVoltaMaximized] = useState(true);
  const [isNordesteMaximized, setIsNordesteMaximized] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    const smRef = ref(db, 'sm_creator_data');
    const unsubscribeSM = onValue(smRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.ida) {
          const sorted = sortSMRowsByValorNf(data.ida);
          setIdaRows(sorted);
          try { localStorage.setItem('sm_creator_ida', JSON.stringify(sorted)); } catch {}
        }
        if (data.volta) {
          setVoltaRows(data.volta);
          try { localStorage.setItem('sm_creator_volta', JSON.stringify(data.volta)); } catch {}
        }
        if (data.nordeste) {
          setNordesteRows(data.nordeste);
          try { localStorage.setItem('sm_creator_nordeste', JSON.stringify(data.nordeste)); } catch {}
        }
        if (data.vespasiano) {
          setVespasianoRows(data.vespasiano);
          try { localStorage.setItem('sm_creator_vespasiano', JSON.stringify(data.vespasiano)); } catch {}
        }
        if (data.calc) {
          setCalcValues(data.calc);
          try { localStorage.setItem('sm_creator_calc', JSON.stringify(data.calc)); } catch {}
        }
        if (data.notes) {
          const notesArray = Object.entries(data.notes).map(([id, note]: [string, any]) => ({
            id,
            ...note
          })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotes(notesArray);
        } else {
          setNotes([]);
        }
      }
    });

    const rotasRef = ref(db, 'app_rotas_data');
    const unsubscribeRotas = onValue(rotasRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length > 0) {
        setRoutesList(data);
      } else {
        setRoutesList(DEFAULT_ROUTES);
      }
    });

    return () => {
      unsubscribeSM();
      unsubscribeRotas();
    };
  }, []);

  useEffect(() => {
    setIsIdaMaximized(idaRows.length > 0);
  }, [idaRows.length]);

  useEffect(() => {
    setIsVoltaMaximized(voltaRows.length > 0);
  }, [voltaRows.length]);

  useEffect(() => {
    setIsNordesteMaximized(nordesteRows.length > 0);
  }, [nordesteRows.length]);

  useEffect(() => {
    setIsVespasianoMaximized(vespasianoRows.length > 0);
  }, [vespasianoRows.length]);

  const historyRef = useRef<Array<{ ida: SMRow[]; volta: SMRow[]; nordeste: SMRow[]; vespasiano: SMRow[]; calc: string[] }>>([]);
  const lastPushTimeRef = useRef<number>(0);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);

  const pushHistory = (forcePush = false) => {
    const currentSnapshot = {
      ida: JSON.parse(JSON.stringify(idaRows)),
      volta: JSON.parse(JSON.stringify(voltaRows)),
      nordeste: JSON.parse(JSON.stringify(nordesteRows)),
      vespasiano: JSON.parse(JSON.stringify(vespasianoRows)),
      calc: [...calcValues]
    };

    const history = historyRef.current;
    const last = history[history.length - 1];
    const now = Date.now();

    const isDifferent = !last || JSON.stringify(last) !== JSON.stringify(currentSnapshot);

    if (isDifferent) {
      if (!forcePush && history.length > 0 && now - lastPushTimeRef.current < 800) {
        // Keeps the state prior to the rapid typing sequence
      } else {
        if (history.length >= 50) history.shift();
        history.push(currentSnapshot);
        lastPushTimeRef.current = now;
        setHistoryCount(history.length);
      }
    }
  };

  const saveIda = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setIdaRows(rows);
    try { localStorage.setItem('sm_creator_ida', JSON.stringify(rows)); } catch {}
    set(ref(db, 'sm_creator_data/ida'), rows);
  };

  const saveVolta = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setVoltaRows(rows);
    try { localStorage.setItem('sm_creator_volta', JSON.stringify(rows)); } catch {}
    set(ref(db, 'sm_creator_data/volta'), rows);
  };

  const saveNordeste = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setNordesteRows(rows);
    try { localStorage.setItem('sm_creator_nordeste', JSON.stringify(rows)); } catch {}
    set(ref(db, 'sm_creator_data/nordeste'), rows);
  };

  const saveVespasiano = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setVespasianoRows(rows);
    try { localStorage.setItem('sm_creator_vespasiano', JSON.stringify(rows)); } catch {}
    set(ref(db, 'sm_creator_data/vespasiano'), rows);
  };

  const saveCalc = (vals: string[], forcePush = false) => {
    pushHistory(forcePush);
    setCalcValues(vals);
    try { localStorage.setItem('sm_creator_calc', JSON.stringify(vals)); } catch {}
    set(ref(db, 'sm_creator_data/calc'), vals);
  };

  const saveNote = (text: string) => {
    if (!text.trim()) return;
    const noteId = Date.now().toString();
    const newNote = {
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    set(ref(db, `sm_creator_data/notes/${noteId}`), newNote);
    setNewNoteText('');
  };

  const deleteNote = (id: string) => {
    set(ref(db, `sm_creator_data/notes/${id}`), null);
  };

  const handleUndo = () => {
    const history = historyRef.current;
    if (history.length === 0) return;

    const previousState = history.pop();
    setHistoryCount(history.length);

    if (previousState) {
      setIdaRows(previousState.ida);
      setVoltaRows(previousState.volta);
      setNordesteRows(previousState.nordeste || []);
      setVespasianoRows(previousState.vespasiano || []);
      setCalcValues(previousState.calc);

      set(ref(db, 'sm_creator_data'), {
        ida: previousState.ida,
        volta: previousState.volta,
        nordeste: previousState.nordeste || [],
        vespasiano: previousState.vespasiano || [],
        calc: previousState.calc
      });

      setShowUndoToast(true);
      setTimeout(() => setShowUndoToast(false), 2500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        if (historyRef.current.length > 0) {
          e.preventDefault();
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [totalRawCopied, setTotalRawCopied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [idaCopied, setIdaCopied] = useState(false);
  const [voltaCopied, setVoltaCopied] = useState(false);
  const [nordesteCopied, setNordesteCopied] = useState(false);
  const [subjectIdaCopied, setSubjectIdaCopied] = useState(false);
  const [subjectVoltaCopied, setSubjectVoltaCopied] = useState(false);
  const [subjectNordesteCopied, setSubjectNordesteCopied] = useState(false);
  const [subjectVespasianoCopied, setSubjectVespasianoCopied] = useState(false);

  // Estados e funções para cópia dos números de rota
  const [copiedRouteKey, setCopiedRouteKey] = useState<string | null>(null);
  const [routeToast, setRouteToast] = useState<{ message: string; submessage?: string } | null>(null);

  const copySingleRouteCode = async (code: string, keyId: string) => {
    if (!code || code === '---' || code === '-') {
      setRouteToast({
        message: 'Nenhum código de rota disponível',
        submessage: 'Preencha ou selecione um trecho válido'
      });
      setTimeout(() => setRouteToast(null), 2500);
      return;
    }
    const success = await safeCopyText(code);
    if (success) {
      setCopiedRouteKey(keyId);
      setRouteToast({
        message: `Número de rota copiado: ${code}`,
        submessage: 'Copiado para a área de transferência'
      });
      setTimeout(() => {
        setCopiedRouteKey((curr) => (curr === keyId ? null : curr));
      }, 2000);
      setTimeout(() => {
        setRouteToast(null);
      }, 2500);
    }
  };

  const copyAllSectionRouteCodes = async (rows: SMRow[], section: 'ida' | 'volta', sectionTitle: string, headerKey: string) => {
    const codes = rows
      .map(r => findRouteCode(r.trecho, section, routesList))
      .filter(code => code && code.trim() !== '' && code !== '---' && code !== '-');

    if (codes.length === 0) {
      setRouteToast({
        message: `Nenhum número de rota em ${sectionTitle}`,
        submessage: 'Preencha trechos reconhecidos para copiar os números.'
      });
      setTimeout(() => setRouteToast(null), 2500);
      return;
    }

    const textToCopy = codes.join('\n');
    const success = await safeCopyText(textToCopy);
    if (success) {
      setCopiedRouteKey(headerKey);
      setRouteToast({
        message: `${codes.length} números de rota copiados!`,
        submessage: `Rotas de ${sectionTitle} copiadas com sucesso.`
      });
      setTimeout(() => {
        setCopiedRouteKey((curr) => (curr === headerKey ? null : curr));
      }, 2000);
      setTimeout(() => {
        setRouteToast(null);
      }, 2500);
    }
  };

  // PDF Import Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTargetSection, setPdfTargetSection] = useState<'ida' | 'volta' | 'vespasiano' | 'nordeste' | 'calc'>('ida');
  const [pdfTargetRowIndex, setPdfTargetRowIndex] = useState<number | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [parsedPdfItems, setParsedPdfItems] = useState<Array<{
    fileName: string;
    numeroNf: string;
    valor: number;
    valorFormatado: string;
    success: boolean;
    error?: string;
  }>>([]);
  const [pdfTotalSomado, setPdfTotalSomado] = useState<number>(0);
  const [pdfTotalSomadoFormatado, setPdfTotalSomadoFormatado] = useState<string>('0,00');
  const [pdfCopied, setPdfCopied] = useState(false);

  const openPdfModal = (section: 'ida' | 'volta' | 'vespasiano' | 'nordeste' | 'calc' = 'ida', rowIndex: number | null = null) => {
    setPdfTargetSection(section);
    setPdfTargetRowIndex(rowIndex);
    setIsPdfModalOpen(true);
  };

  const processarNotasFiscaisClient = async (arquivos: File[]) => {
    await ensurePdfWorker();

    const extractedItems: Array<{
      fileName: string;
      numeroNf: string;
      valor: number;
      valorFormatado: string;
      success: boolean;
      error?: string;
    }> = [];

    const parseMoney = (raw: string): number | null => {
      if (!raw) return null;
      const clean = raw.trim().replace(/^R\$\s*/i, '');
      let val = 0;
      if (clean.includes(',')) {
        val = parseFloat(clean.replace(/\./g, '').replace(/\s/g, '').replace(',', '.'));
      } else if (clean.includes('.')) {
        val = parseFloat(clean.replace(/,/g, '').replace(/\s/g, ''));
      } else {
        val = parseFloat(clean);
      }
      return (!isNaN(val) && val > 0) ? val : null;
    };

    const currencyPattern = /(?:R\$\s*)?(\d{1,3}(?:[\.\s]\d{3})+,\d{2}|\d+,\d{2}|\d{1,3}(?:,\d{3})+\.\d{2}|\d+\.\d{2})\b/g;

    for (const arquivo of arquivos) {
      try {
        const arrayBuffer = await arquivo.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        interface SpatialItem {
          str: string;
          x: number;
          y: number;
          width: number;
        }

        let numeroNf = '---';
        let valorNumericoResult: number | null = null;
        let valorTextoResult: string | null = null;

        // Itera pelas páginas do PDF, priorizando a Página 1 (onde sempre fica o cabeçalho e Cálculo do Imposto)
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();

          const pageItems: SpatialItem[] = [];
          const pageStrs: string[] = [];

          for (const item of content.items as any[]) {
            if (!item.str) continue;
            pageStrs.push(item.str);
            if (item.str.trim()) {
              const transform = item.transform || [1, 0, 0, 1, 0, 0];
              pageItems.push({
                str: item.str,
                x: transform[4] || 0,
                y: transform[5] || 0,
                width: item.width || 0
              });
            }
          }

          const rawPageText = pageStrs.join(' ').replace(/\s+/g, ' ');
          // Unifica números com pontuações separadas por espaços em streams de texto do PDF
          const cleanPageText = rawPageText.replace(/(\d+)\s*([\.,])\s*(\d+)/g, '$1$2$3');

          // 1. Extração do Número da NF
          if (numeroNf === '---') {
            // A. Pela Chave de Acesso de 44 dígitos (dígitos 26 a 34 identificam a NF)
            const chaveMatch = rawPageText.match(/\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/) ||
                               cleanPageText.match(/\b\d{44}\b/);
            if (chaveMatch) {
              const rawChave = chaveMatch[0].replace(/\D/g, '');
              if (rawChave.length === 44) {
                const nfFromChave = parseInt(rawChave.substring(25, 34), 10);
                if (!isNaN(nfFromChave) && nfFromChave > 0) {
                  numeroNf = String(nfFromChave);
                }
              }
            }

            // B. Pelo cabeçalho padrão DANFE / NF-e
            if (numeroNf === '---') {
              const matchNf = cleanPageText.match(/(?:NF-e|NOTA FISCAL|DANFE)[^\d]{0,35}N[º°o]?[\s\.:]*(\d{1,3}(?:\.\d{3})+|\d{1,9})/i) ||
                              cleanPageText.match(/N[º°o]?[\s\.:]*(\d{1,3}(?:\.\d{3})+|\d{4,9})/i) || 
                              cleanPageText.match(/NF-e[\s\.:]*(\d+)/i) ||
                              cleanPageText.match(/NOTA\s+FISCAL[\s\S]{0,30}?(\d{3,9})/i);
              if (matchNf && matchNf[1]) {
                numeroNf = matchNf[1].replace(/\D/g, '');
              }
            }
          }

          let pageValNumerico: number | null = null;
          let pageValTexto: string | null = null;

          // ESTRATÉGIA 0: Tags XML ou chave explícita (vNF / vProd)
          const vNfMatch = cleanPageText.match(/<vNF>\s*([\d\.]+)\s*<\/vNF>/i) || cleanPageText.match(/\bvNF\s*[:=]?\s*([\d\.,]+)/i);
          if (vNfMatch) {
            const v = parseMoney(vNfMatch[1]);
            if (v && v > 0) {
              pageValNumerico = v;
              pageValTexto = vNfMatch[1];
            }
          }

          // ESTRATÉGIA 1: Correspondência direta de etiqueta e valor na mesma frase
          if (pageValNumerico === null) {
            const directMatches = cleanPageText.matchAll(/(?:VALOR\s+TOTAL\s+(?:DA\s+)?(?:NOTA|NF|NOTA\s+FISCAL|DO\s+DOCUMENTO)|V\.?\s*TOTAL\s+(?:DA\s+)?NOTA|TOTAL\s+(?:DA\s+)?NOTA|VALOR\s+L[ÍI]QUIDO(?:\s+DA\s+NOTA)?)\s*[:\.]?\s*(?:R\$\s*)?(\d{1,3}(?:[\.\s]\d{3})+,\d{2}|\d+,\d{2}|\d{1,3}(?:,\d{3})+\.\d{2}|\d+\.\d{2})\b/gi);
            for (const m of directMatches) {
              const val = parseMoney(m[1]);
              if (val && val > 0) {
                pageValNumerico = val;
                pageValTexto = m[1];
                break;
              }
            }
          }

          // ESTRATÉGIA 2: Análise Espacial 2D por Coordenadas (busca sob a caixa "VALOR TOTAL DA NOTA")
          if (pageValNumerico === null && pageItems.length > 0) {
            // Agrupa itens em linhas (tolerância Y de 7pt)
            const lineGroups: Array<{ y: number; items: SpatialItem[] }> = [];
            for (const item of pageItems) {
              let group = lineGroups.find(g => Math.abs(g.y - item.y) <= 7);
              if (!group) {
                group = { y: item.y, items: [] };
                lineGroups.push(group);
              }
              group.items.push(item);
            }
            lineGroups.sort((a, b) => b.y - a.y); // Do topo para o rodapé da página

            const lines = lineGroups.map(g => {
              g.items.sort((a, b) => a.x - b.x); // Da esquerda para a direita
              return {
                y: g.y,
                items: g.items,
                fullText: g.items.map(i => i.str).join(' ').replace(/\s+/g, ' ')
              };
            });

            for (let idx = 0; idx < lines.length; idx++) {
              const line = lines[idx];
              if (/(?:VALOR\s+TOTAL\s+(?:DA\s+)?(?:NOTA|NF|NOTA\s+FISCAL|DO\s+DOCUMENTO)|V\.?\s*TOTAL\s+(?:DA\s+)?NOTA|TOTAL\s+(?:DA\s+)?NOTA)/i.test(line.fullText)) {
                // Tenta encontrar valor na mesma linha após a etiqueta
                const afterLabel = line.fullText.substring(line.fullText.search(/(?:VALOR\s+TOTAL|V\.?\s*TOTAL|TOTAL\s+(?:DA\s+)?NOTA)/i));
                const lineMoneyMatches = Array.from(afterLabel.matchAll(currencyPattern))
                  .map(m => ({ raw: m[1], val: parseMoney(m[1]) }))
                  .filter(m => m.val !== null && m.val > 0);
                if (lineMoneyMatches.length > 0) {
                  pageValNumerico = lineMoneyMatches[0].val;
                  pageValTexto = lineMoneyMatches[0].raw;
                  break;
                }

                // Senão, procura nas 1 a 4 linhas diretamente abaixo dentro da mesma coluna X
                const labelItem = line.items.slice().reverse().find(i => /NOTA|NF|TOTAL|VALOR/i.test(i.str)) || line.items[line.items.length - 1];
                const labelX = labelItem ? labelItem.x : 400;

                for (let offset = 1; offset <= 4; offset++) {
                  if (idx + offset < lines.length) {
                    const subLine = lines[idx + offset];
                    const subLineMoney = Array.from(subLine.fullText.matchAll(currencyPattern))
                      .map(m => ({ raw: m[1], val: parseMoney(m[1]) }))
                      .filter(m => m.val !== null && m.val > 0);

                    if (subLineMoney.length > 0) {
                      // Itens alinhados horizontalmente com o quadro da direita
                      const subItemsMoney = subLine.items
                        .map(it => ({ str: it.str, x: it.x, val: parseMoney(it.str) }))
                        .filter((it): it is { str: string; x: number; val: number } => it.val !== null && it.val > 0);

                      const rightAligned = subItemsMoney.filter(n => n.x >= labelX - 60);
                      if (rightAligned.length > 0) {
                        rightAligned.sort((a, b) => b.x - a.x);
                        pageValNumerico = rightAligned[0].val;
                        pageValTexto = rightAligned[0].str;
                      } else {
                        // O último valor monetário desta linha de valores de impostos
                        const chosen = subLineMoney[subLineMoney.length - 1];
                        pageValNumerico = chosen.val;
                        pageValTexto = chosen.raw;
                      }
                      break;
                    }
                  }
                }
                if (pageValNumerico !== null) break;
              }
            }
          }

          // ESTRATÉGIA 3: Região do quadro "CÁLCULO DO IMPOSTO" (Padrão Oficial DANFE)
          if (pageValNumerico === null) {
            const regexBlock = /(?:C[ÁA]LCULO\s+DO\s+IMPOSTO|CALCULO\s+DO\s+IMPOSTO|VALOR\s+TOTAL\s+PRODUTOS)[\s\S]{0,1200}?(?:DADOS\s+DO\s+TRANSPORTE|TRANSPORTADOR|FRETE\s+POR\s+CONTA|DADOS\s+DOS\s+PRODUTOS|RAZ[AÃ]O\s+SOCIAL|INFORMAÇÕES\s+COMPLEMENTARES)/i;
            const blockMatch = cleanPageText.match(regexBlock);
            if (blockMatch) {
              const blockText = blockMatch[0];
              const currencies = Array.from(blockText.matchAll(currencyPattern))
                .map(m => ({ raw: m[1], val: parseMoney(m[1]) }))
                .filter((item): item is { raw: string; val: number } => item.val !== null && item.val > 0);

              if (currencies.length > 0) {
                // No quadro de impostos da NF-e, o VALOR TOTAL DA NOTA é universalmente o maior valor
                // (pois Valor Total Nota >= Valor dos Produtos, enquanto ICMS/frete/impostos são parcelas menores)
                let maxItem = currencies[0];
                for (const c of currencies) {
                  if (c.val > maxItem.val) {
                    maxItem = c;
                  }
                }
                pageValNumerico = maxItem.val;
                pageValTexto = maxItem.raw;
              }
            }
          }

          // ESTRATÉGIA 4: Proximidade imediata após o texto "VALOR TOTAL DA NOTA"
          if (pageValNumerico === null) {
            const labelIdx = cleanPageText.search(/(?:VALOR\s+TOTAL\s+(?:DA\s+)?(?:NOTA|NF|NOTA\s+FISCAL|DO\s+DOCUMENTO)|V\.?\s*TOTAL\s+(?:DA\s+)?NOTA|TOTAL\s+(?:DA\s+)?NOTA)/i);
            if (labelIdx !== -1) {
              const afterText = cleanPageText.substring(labelIdx, labelIdx + 300);
              const currenciesAfter = Array.from(afterText.matchAll(currencyPattern))
                .map(m => ({ raw: m[1], val: parseMoney(m[1]) }))
                .filter((m): m is { raw: string; val: number } => m.val !== null && m.val > 0);
              if (currenciesAfter.length > 0) {
                pageValNumerico = currenciesAfter[0].val;
                pageValTexto = currenciesAfter[0].raw;
              }
            }
          }

          // ESTRATÉGIA 5: Fallback para o maior valor com R$ presente na página
          if (pageValNumerico === null) {
            const allCurrenciesWithRs = Array.from(cleanPageText.matchAll(/(?:R\$\s*)(\d{1,3}(?:[\.\s]\d{3})+,\d{2}|\d+,\d{2}|\d{1,3}(?:,\d{3})+\.\d{2}|\d+\.\d{2})\b/g))
              .map(m => ({ raw: m[1], val: parseMoney(m[1]) }))
              .filter((m): m is { raw: string; val: number } => m.val !== null && m.val > 0);
            if (allCurrenciesWithRs.length > 0) {
              let maxItem = allCurrenciesWithRs[0];
              for (const c of allCurrenciesWithRs) {
                if (c.val > maxItem.val) {
                  maxItem = c;
                }
              }
              pageValNumerico = maxItem.val;
              pageValTexto = maxItem.raw;
            }
          }

          // Se encontrou o valor válido na Página 1 (ou página atual), encerra a busca com sucesso
          if (pageValNumerico !== null && pageValNumerico > 0) {
            valorNumericoResult = pageValNumerico;
            valorTextoResult = pageValTexto;
            break; // Página 1 é a principal, não sobrescrever com páginas de continuação
          }
        }

        if (valorNumericoResult !== null && valorNumericoResult > 0) {
          const valorFormatado = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(valorNumericoResult);

          extractedItems.push({
            fileName: arquivo.name,
            numeroNf,
            valor: valorNumericoResult,
            valorFormatado,
            success: true
          });
        } else {
          extractedItems.push({
            fileName: arquivo.name,
            numeroNf,
            valor: 0,
            valorFormatado: '0,00',
            success: false,
            error: 'Valor Total da NF não localizado'
          });
        }
      } catch (erro: any) {
        console.error(`Erro ao ler o arquivo ${arquivo.name}:`, erro);
        extractedItems.push({
          fileName: arquivo.name,
          numeroNf: '---',
          valor: 0,
          valorFormatado: '0,00',
          success: false,
          error: `Erro de leitura: ${erro?.message || 'PDF inválido'}`
        });
      }
    }

    return extractedItems;
  };

  const handlePdfFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPdf(true);
    const fileArray: File[] = Array.from(files);

    try {
      // 1. Tenta envio para a API de backend /api/parse-nf-pdfs (com pdf-parse + Gemini AI de fallback)
      let finalExtracted: Array<{
        fileName: string;
        numeroNf: string;
        valor: number;
        valorFormatado: string;
        success: boolean;
        error?: string;
      }> = [];

      try {
        const base64Files = await Promise.all(
          fileArray.map(async (file) => {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            return { name: file.name, base64 };
          })
        );

        const resp = await fetch('/api/parse-nf-pdfs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: base64Files })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            finalExtracted = data.items;
          }
        }
      } catch (apiErr) {
        console.warn('Falha na API /api/parse-nf-pdfs, usando parser local do navegador:', apiErr);
      }

      // 2. Se a API não respondeu ou teve falhas gerais, executa o parser client-side avançado
      if (finalExtracted.length === 0) {
        finalExtracted = await processarNotasFiscaisClient(fileArray);
      } else {
        // Para arquivos que a API porventura não conseguiu ler, tenta o client
        const needsClientFix = finalExtracted.some(item => !item.success || item.valor === 0);
        if (needsClientFix) {
          const clientFallback = await processarNotasFiscaisClient(fileArray);
          finalExtracted = finalExtracted.map((item, idx) => {
            if (!item.success && clientFallback[idx] && clientFallback[idx].success) {
              return clientFallback[idx];
            }
            return item;
          });
        }
      }

      const newItems = [...parsedPdfItems, ...finalExtracted];
      const newTotal = newItems.reduce((acc, curr) => acc + (curr.valor || 0), 0);
      const newTotalFormatted = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(newTotal);

      setParsedPdfItems(newItems);
      setPdfTotalSomado(newTotal);
      setPdfTotalSomadoFormatado(newTotalFormatted);
    } catch (err) {
      console.error('Erro ao processar arquivos PDF:', err);
    } finally {
      setIsProcessingPdf(false);
      e.target.value = '';
    }
  };

  const updateParsedPdfItemValue = (index: number, rawVal: string) => {
    const digits = rawVal.replace(/\D/g, '');
    const amount = digits ? parseFloat(digits) / 100 : 0;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    const updated = [...parsedPdfItems];
    updated[index] = {
      ...updated[index],
      valor: amount,
      valorFormatado: formatted,
      success: amount > 0
    };

    const newTotal = updated.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const newTotalFormatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(newTotal);

    setParsedPdfItems(updated);
    setPdfTotalSomado(newTotal);
    setPdfTotalSomadoFormatado(newTotalFormatted);
  };

  const removeParsedPdfItem = (index: number) => {
    const updated = parsedPdfItems.filter((_, idx) => idx !== index);
    const newTotal = updated.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const newTotalFormatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(newTotal);

    setParsedPdfItems(updated);
    setPdfTotalSomado(newTotal);
    setPdfTotalSomadoFormatado(newTotalFormatted);
  };

  const applyPdfTotalToTarget = (section: 'ida' | 'volta' | 'vespasiano' | 'nordeste' | 'calc') => {
    const totalValStr = pdfTotalSomadoFormatado;

    if (section === 'calc') {
      if (calcValues.length === 1 && (!calcValues[0] || calcValues[0] === '')) {
        saveCalc([totalValStr], true);
      } else {
        saveCalc([...calcValues, totalValStr], true);
      }
    } else {
      const targetRows = section === 'ida' ? idaRows : section === 'volta' ? voltaRows : section === 'nordeste' ? nordesteRows : vespasianoRows;
      const saveFunc = section === 'ida' ? saveIda : section === 'volta' ? saveVolta : section === 'nordeste' ? saveNordeste : saveVespasiano;

      if (pdfTargetRowIndex !== null && targetRows[pdfTargetRowIndex]) {
        const updatedRows = [...targetRows];
        updatedRows[pdfTargetRowIndex] = {
          ...updatedRows[pdfTargetRowIndex],
          valorNf: totalValStr
        };
        saveFunc(updatedRows, true);
      } else if (targetRows.length > 0) {
        const updatedRows = [...targetRows];
        updatedRows[updatedRows.length - 1] = {
          ...updatedRows[updatedRows.length - 1],
          valorNf: totalValStr
        };
        saveFunc(updatedRows, true);
      } else {
        const newRow: SMRow = {
          dataSaida: new Date().toLocaleDateString('pt-BR'),
          motorista: '',
          placa: '',
          bau1: '',
          bau2: '',
          trecho: '',
          valorNf: totalValStr
        };
        saveFunc([newRow], true);
      }
    }

    setIsPdfModalOpen(false);
  };

  // Opção para adicionar 1 linha para cada Nota Fiscal importada
  const applyMultiplePdfRowsToTarget = (section: 'ida' | 'volta' | 'vespasiano' | 'nordeste') => {
    const validItems = parsedPdfItems.filter(item => item.valor > 0);
    if (validItems.length === 0) return;

    const targetRows = section === 'ida' ? idaRows : section === 'volta' ? voltaRows : section === 'nordeste' ? nordesteRows : vespasianoRows;
    const saveFunc = section === 'ida' ? saveIda : section === 'volta' ? saveVolta : section === 'nordeste' ? saveNordeste : saveVespasiano;

    const newRows: SMRow[] = validItems.map(item => ({
      dataSaida: new Date().toLocaleDateString('pt-BR'),
      motorista: '',
      placa: '',
      bau1: '',
      bau2: '',
      trecho: '',
      valorNf: item.valorFormatado
    }));

    saveFunc([...targetRows, ...newRows], true);
    setIsPdfModalOpen(false);
  };

  const applyIndividualPdfValuesToCalc = () => {
    const validValues = parsedPdfItems.filter(i => i.valor > 0).map(i => i.valorFormatado);
    if (validValues.length > 0) {
      if (calcValues.length === 1 && (!calcValues[0] || calcValues[0] === '')) {
        saveCalc(validValues, true);
      } else {
        saveCalc([...calcValues, ...validValues], true);
      }
    }
    setIsPdfModalOpen(false);
  };

  const copyPdfTotal = async () => {
    await safeCopyText(pdfTotalSomadoFormatado);
    setPdfCopied(true);
    setTimeout(() => setPdfCopied(false), 2000);
  };

  const renderCodesTable = () => (
    <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl overflow-hidden shadow-md">
      <div className="bg-[#292820] p-5 text-center border-b border-[#C49A45]/40">
        <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm">Solicitação de Monitoramento</h3>
        <p className="text-[#E6D2A3] text-[9px] font-mono font-bold uppercase mt-1 tracking-widest">Trafegus • Códigos Padronizados</p>
      </div>
      <div className="overflow-x-auto p-4 bg-[#FFFCF6]">
        <table className="w-full border-collapse font-mono text-center text-xs">
          <thead>
            <tr className="bg-[#F5F0E6] text-[#25231F] border-b border-[#E6D2A3]">
              <th className="p-3 text-left w-1/3 text-[#25231F] font-bold uppercase">Assunto</th>
              <th className="p-3 w-1/4 text-[#C49A45] font-bold uppercase">Códigos</th>
              <th className="p-3 text-[#25231F] font-bold uppercase">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6D2A3]/40 bg-[#FFFCF6]">
            <tr className="hover:bg-[#F5F0E6]/50 transition-colors">
              <td className="p-3 text-left font-bold text-[#25231F]">Tipo de Transporte</td>
              <td className="p-3 font-bold text-[#C91F2D]">1</td>
              <td className="p-3 text-[#25231F]">Transferência</td>
            </tr>
            <tr className="hover:bg-[#F5F0E6]/50 transition-colors">
              <td className="p-3 text-left font-bold text-[#25231F]">Tipos de Operação</td>
              <td className="p-3 font-bold text-[#C91F2D]">2</td>
              <td className="p-3 text-[#7A756D] italic">Dedicados</td>
            </tr>
            <tr className="hover:bg-[#F5F0E6]/50 transition-colors">
              <td className="p-3 text-left font-bold text-[#25231F]">Embarcador</td>
              <td className="p-3 font-bold text-[#C91F2D]">913</td>
              <td className="p-3 text-[#25231F] font-bold">Três Corações Alimentos</td>
            </tr>
            <tr className="hover:bg-[#F5F0E6]/50 transition-colors">
              <td className="p-3 text-left font-bold text-[#25231F]">Transportador</td>
              <td className="p-3 font-bold text-[#C91F2D]">87</td>
              <td className="p-3 text-[#25231F]">3C Santa Luzia Dedicados</td>
            </tr>
            <tr className="hover:bg-[#F5F0E6]/50 transition-colors">
              <td className="p-3 text-left font-bold text-[#25231F]">Valor Mercadoria Específica</td>
              <td className="p-3 font-bold text-[#C49A45]">126</td>
              <td className="p-3 text-[#25231F] font-bold">Acima de 900 Mil</td>
            </tr>
            <tr className="hover:bg-[#F5F0E6]/50 transition-colors">
              <td className="p-3 text-left font-bold text-[#25231F]">Valor Mercadoria Específica</td>
              <td className="p-3 font-bold text-[#C49A45]">42</td>
              <td className="p-3 text-[#7A756D]">Abaixo de 900 Mil</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const parseInput = (text: string, saveFunc: (rows: SMRow[], forcePush?: boolean) => void, existingRows: SMRow[], section: 'ida' | 'volta') => {
    const lines = text.trim().split('\n');
    const newRows: SMRow[] = [];

    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 2) {
        let trecho = parts[5] || '';
        if (section === 'volta') {
          trecho = invertRoute(trecho);
        }

        const motoristaRaw = parts[1] || '';
        const motoristaClean = motoristaRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

        newRows.push({
          dataSaida: parts[0] || '',
          motorista: motoristaClean,
          placa: (parts[2] || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
          bau1: parts[3] || '',
          bau2: parts[4] || '',
          trecho: trecho,
          valorNf: '0,00'
        });
      }
    });

    if (newRows.length > 0) {
      saveFunc([...existingRows, ...newRows], true);
    }
  };

  const handlePaste = (e: React.ClipboardEvent, section: 'ida' | 'volta' | 'vespasiano' | 'nordeste') => {
    const text = e.clipboardData.getData('text');
    const saveFunc = section === 'ida' ? saveIda : section === 'volta' ? saveVolta : section === 'nordeste' ? saveNordeste : saveVespasiano;
    const rows = section === 'ida' ? idaRows : section === 'volta' ? voltaRows : section === 'nordeste' ? nordesteRows : vespasianoRows;
    parseInput(text, saveFunc, rows, section === 'volta' ? 'volta' : 'ida');
  };

  const addNewRow = (section: 'ida' | 'volta' | 'vespasiano' | 'nordeste') => {
    const newRow: SMRow = {
      dataSaida: new Date().toLocaleDateString('pt-BR'),
      motorista: '',
      placa: '',
      bau1: '',
      bau2: '',
      trecho: '',
      valorNf: '0,00'
    };
    if (section === 'ida') {
      saveIda([...idaRows, newRow], true);
    } else if (section === 'volta') {
      saveVolta([...voltaRows, newRow], true);
    } else if (section === 'nordeste') {
      saveNordeste([...nordesteRows, newRow], true);
    } else {
      saveVespasiano([...vespasianoRows, newRow], true);
    }
  };

  const updateRowValue = (index: number, field: keyof SMRow, value: any, section: 'ida' | 'volta' | 'vespasiano' | 'nordeste', forcePush = false) => {
    let finalValue = value;
    
    if (field === 'valorNf' && typeof value === 'string') {
      finalValue = formatNfValue(value);
    } else if (field === 'placa' && typeof value === 'string') {
      finalValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    } else if (field === 'trecho' && typeof value === 'string') {
      finalValue = value.toUpperCase();
    } else if (field === 'motorista' && typeof value === 'string') {
      finalValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    }

    const isDiscrete = forcePush || field === 'ok';

    if (section === 'ida') {
      const newRows = [...idaRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveIda(newRows, isDiscrete);
    } else if (section === 'volta') {
      const newRows = [...voltaRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveVolta(newRows, isDiscrete);
    } else if (section === 'nordeste') {
      const newRows = [...nordesteRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveNordeste(newRows, isDiscrete);
    } else {
      const newRows = [...vespasianoRows];
      newRows[index] = { ...newRows[index], [field]: finalValue };
      saveVespasiano(newRows, isDiscrete);
    }
  };

  const handlePasteValorNf = (
    pastedText: string,
    startIndex: number,
    section: 'ida' | 'volta' | 'vespasiano' | 'nordeste'
  ) => {
    if (!pastedText) return;

    // Divide em linhas caso o usuário tenha copiado uma coluna inteira de planilha
    const lines = pastedText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    const getRows = () => {
      switch (section) {
        case 'ida': return [...idaRows];
        case 'volta': return [...voltaRows];
        case 'nordeste': return [...nordesteRows];
        case 'vespasiano': return [...vespasianoRows];
      }
    };

    const saveRows = (newRows: SMRow[]) => {
      switch (section) {
        case 'ida': saveIda(newRows, true); break;
        case 'volta': saveVolta(newRows, true); break;
        case 'nordeste': saveNordeste(newRows, true); break;
        case 'vespasiano': saveVespasiano(newRows, true); break;
      }
    };

    const rows = getRows();

    if (lines.length === 1) {
      let valStr = lines[0];
      if (valStr.includes('\t')) {
        const parts = valStr.split('\t').map(p => p.trim());
        const numPart = parts.find(p => /^\s*R?\$?\s*[\d.,]+\s*$/.test(p)) || parts[parts.length - 1];
        valStr = numPart;
      }

      const num = parsePastedCurrency(valStr);
      const formatted = formatCurrencyNumber(num);

      if (startIndex >= 0 && startIndex < rows.length) {
        rows[startIndex] = { ...rows[startIndex], valorNf: formatted };
        saveRows(rows);
        setRouteToast({
          message: `Valor colado: R$ ${formatted}`,
          submessage: 'Valor da NF atualizado com sucesso.'
        });
        setTimeout(() => setRouteToast(null), 2500);
      }
    } else {
      let updatedCount = 0;
      lines.forEach((line, offset) => {
        const targetIdx = startIndex + offset;
        if (targetIdx < rows.length) {
          let valStr = line;
          if (valStr.includes('\t')) {
            const parts = valStr.split('\t').map(p => p.trim());
            const numPart = parts.find(p => /^\s*R?\$?\s*[\d.,]+\s*$/.test(p)) || parts[parts.length - 1];
            valStr = numPart;
          }
          const num = parsePastedCurrency(valStr);
          const formatted = formatCurrencyNumber(num);
          rows[targetIdx] = { ...rows[targetIdx], valorNf: formatted };
          updatedCount++;
        }
      });

      saveRows(rows);
      setRouteToast({
        message: `${updatedCount} valores colados com sucesso!`,
        submessage: 'Valores da NF preenchidos na tabela.'
      });
      setTimeout(() => setRouteToast(null), 2500);
    }
  };

  const moveRow = (index: number, direction: 'up' | 'down', section: 'ida' | 'volta' | 'vespasiano' | 'nordeste') => {
    const rows = section === 'ida' ? [...idaRows] : section === 'volta' ? [...voltaRows] : section === 'nordeste' ? [...nordesteRows] : [...vespasianoRows];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= rows.length) return;

    const temp = rows[index];
    rows[index] = rows[newIndex];
    rows[newIndex] = temp;

    if (section === 'ida') {
      saveIda(rows, true);
    } else if (section === 'volta') {
      saveVolta(rows, true);
    } else if (section === 'nordeste') {
      saveNordeste(rows, true);
    } else {
      saveVespasiano(rows, true);
    }
  };

  const copyIdaToVolta = () => {
    if (idaRows.length === 0) return;
    
    const newVoltaRows: SMRow[] = idaRows.map(row => ({
      ...row,
      trecho: invertRoute(row.trecho),
      valorNf: '',
      ok: false
    }));

    saveVolta([...voltaRows, ...newVoltaRows], true);
  };

  const sortRowsByValorNf = (section: 'ida' | 'volta' | 'vespasiano' | 'nordeste') => {
    const currentRows = section === 'ida' 
      ? [...idaRows] 
      : section === 'volta' 
      ? [...voltaRows] 
      : section === 'nordeste' 
      ? [...nordesteRows] 
      : [...vespasianoRows];

    if (currentRows.length === 0) return;

    const sorted = sortSMRowsByValorNf(currentRows);

    if (section === 'ida') {
      saveIda(sorted, true);
    } else if (section === 'volta') {
      saveVolta(sorted, true);
    } else if (section === 'nordeste') {
      saveNordeste(sorted, true);
    } else {
      saveVespasiano(sorted, true);
    }
  };

  const calculateTotal = () => {
    const sum = calcValues.reduce((acc, curr) => {
      const val = parsePastedCurrency(curr);
      return isNaN(val) ? acc : acc + val;
    }, 0);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(sum);
  };

  const handleClearAllSM = () => {
    setIdaRows([]);
    setVoltaRows([]);
    setNordesteRows([]);
    setVespasianoRows([]);
    setCalcValues(['']);
    setNotes([]);
    set(ref(db, 'sm_creator_data'), null);
  };

  const copyTotalRaw = async () => {
    const total = calculateTotal();
    await safeCopyText(total);
    setTotalRawCopied(true);
    setTimeout(() => setTotalRawCopied(false), 2000);
  };

  const displayCalcValues = Array.from(
    { length: Math.max(calcValues.length, 5) },
    (_, i) => calcValues[i] ?? ''
  );

  const addCalcLine = () => {
    const base = Array.from(
      { length: Math.max(calcValues.length, 5) },
      (_, i) => calcValues[i] ?? ''
    );
    saveCalc([...base, ''], true);
  };

  const updateCalcValue = (index: number, val: string) => {
    const newVals = Array.from(
      { length: Math.max(calcValues.length, 5, index + 1) },
      (_, i) => calcValues[i] ?? ''
    );
    newVals[index] = val;
    saveCalc(newVals);
  };

  const removeCalcLine = (index: number) => {
    const base = Array.from(
      { length: Math.max(calcValues.length, 5) },
      (_, i) => calcValues[i] ?? ''
    );
    const filtered = base.filter((_, idx) => idx !== index);
    while (filtered.length < 5) {
      filtered.push('');
    }
    saveCalc(filtered, true);
  };

  const handlePasteCalc = (pastedText: string, startIndex: number) => {
    if (!pastedText) return;
    const lines = pastedText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    if (lines.length === 0) return;

    const newVals = Array.from(
      { length: Math.max(calcValues.length, 5) },
      (_, i) => calcValues[i] ?? ''
    );
    lines.forEach((line, offset) => {
      const targetIdx = startIndex + offset;
      const num = parsePastedCurrency(line);
      const formatted = formatCurrencyNumber(num);
      if (targetIdx < newVals.length) {
        newVals[targetIdx] = formatted;
      } else {
        newVals.push(formatted);
      }
    });
    saveCalc(newVals, true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 || hour < 24) return 'Boa noite';
    return 'Bom dia';
  };

  const getJourneyDate = (rows: SMRow[]) => {
    return rows[0]?.dataSaida || '---';
  };

  const getSubjectDate = (rows: SMRow[]) => {
    const rawDate = rows[0]?.dataSaida?.trim();
    if (!rawDate || rawDate === '---') {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
    const match = rawDate.match(/(\d{1,2})[\/\.-](\d{1,2})/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      return `${day}/${month}`;
    }
    return rawDate;
  };

  const getSubjectIda = () => `SM IDA - DEDICADOS ${getSubjectDate(idaRows)} - SANTA LUZIA!`;
  const getSubjectVolta = () => `SM VOLTA - DEDICADOS ${getSubjectDate(voltaRows)} - SANTA LUZIA!`;
  const getSubjectNordeste = () => `SM NORDESTE - DEDICADOS ${getSubjectDate(nordesteRows)} - SANTA LUZIA X NORDESTE!`;
  const getSubjectVespasiano = () => `SM VESPASIANO - DEDICADOS ${getSubjectDate(vespasianoRows)} - VESPASIANO!`;

  const copySubjectIda = async () => {
    const subject = getSubjectIda();
    await safeCopyText(subject);
    setSubjectIdaCopied(true);
    setTimeout(() => setSubjectIdaCopied(false), 2000);
  };

  const copySubjectVolta = async () => {
    const subject = getSubjectVolta();
    await safeCopyText(subject);
    setSubjectVoltaCopied(true);
    setTimeout(() => setSubjectVoltaCopied(false), 2000);
  };

  const copySubjectNordeste = async () => {
    const subject = getSubjectNordeste();
    await safeCopyText(subject);
    setSubjectNordesteCopied(true);
    setTimeout(() => setSubjectNordesteCopied(false), 2000);
  };

  const copySubjectVespasiano = async () => {
    const subject = getSubjectVespasiano();
    await safeCopyText(subject);
    setSubjectVespasianoCopied(true);
    setTimeout(() => setSubjectVespasianoCopied(false), 2000);
  };

  const copyToEmail = async () => {
    const greeting = getGreeting();

    const formatRowsText = (rows: SMRow[], title: string) => {
      if (rows.length === 0) return '';
      let text = `--- ${title} ---\n`;
      text += `DATA | MOTORISTA | PLACA | BAÚ 1 | BAÚ 2 | TRECHO | VALOR NF\n`;
      rows.forEach(r => {
        text += `${r.dataSaida} | ${r.motorista} | ${r.placa} | ${r.bau1} | ${r.bau2} | ${r.trecho} | ${r.valorNf}\n`;
      });
      return text + '\n';
    };

    const htmlContent = `
      <div style="font-family: sans-serif; color: #333;">
        <p>${greeting}!</p>
        <p>Segue relatórios de SM - Ida, Volta, Nordeste e Vespasiano.</p>
        
        <div style="margin-top: 20px;">
          <h3 style="color: #D9AD5A; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800;">--- ROTA IDA (PRETO E DOURADO) ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: <strong>${getJourneyDate(idaRows)}</strong>!</p>
          ${generateStyledTableHtml(idaRows, 'ida')}
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: #7f1d1d; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ROTA VOLTA ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: <strong>${getJourneyDate(voltaRows)}</strong>!</p>
          ${generateStyledTableHtml(voltaRows, 'volta')}
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: #B47800; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ROTA SANTA LUZIA X NORDESTE ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento rota Santa Luzia x Nordeste para as escalas de viagem para o dia: <strong>${getJourneyDate(nordesteRows)}</strong>!</p>
          ${generateStyledTableHtml(nordesteRows, 'nordeste')}
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: #166534; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ROTA VESPASIANO ---</h3>
          <p style="font-size: 13px;">${greeting},</p>
          <p style="font-size: 13px;">Seguem em anexo as solicitações de monitoramento rota Vespasiano para as escalas de viagem para o dia: <strong>${getJourneyDate(vespasianoRows)}</strong>!</p>
          ${generateStyledTableHtml(vespasianoRows, 'vespasiano')}
        </div>

        <p style="margin-top: 20px;"><strong>Total Calculado: ${calculateTotal()}</strong></p>
        <p>Att,</p>
      </div>
    `;

    const textContent = `${greeting}!\n\nSegue relatórios de SM - Ida, Volta, Nordeste e Vespasiano.\n\nROTA IDA\n${greeting}, Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${getJourneyDate(idaRows)}!\n${formatRowsText(idaRows, '')}\nROTA VOLTA\n${greeting}, Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${getJourneyDate(voltaRows)}!\n${formatRowsText(voltaRows, '')}\nROTA SANTA LUZIA X NORDESTE\n${greeting}, Seguem em anexo as solicitações de monitoramento rota Santa Luzia x Nordeste para as escalas de viagem para o dia: ${getJourneyDate(nordesteRows)}!\n${formatRowsText(nordesteRows, '')}\nROTA VESPASIANO\n${greeting}, Seguem em anexo as solicitações de monitoramento rota Vespasiano para as escalas de viagem para o dia: ${getJourneyDate(vespasianoRows)}!\n${formatRowsText(vespasianoRows, '')}\nTotal Calculado: ${calculateTotal()}\n\nAtt,`;

    const success = await safeCopyHtmlAndText(htmlContent, textContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copySection = async (rows: SMRow[], title: string, setCopiedStatus: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (rows.length === 0) return;
    
    const isNordeste = title.toUpperCase().includes('NORDESTE');
    const color = isNordeste ? '#B47800' : title.includes('IDA') ? '#0A0D10' : title.includes('VOLTA') ? '#7f1d1d' : '#166534';
    const type = isNordeste ? 'nordeste' : title.includes('IDA') ? 'ida' : title.includes('VOLTA') ? 'volta' : 'vespasiano';
    const greeting = getGreeting();
    const date = getJourneyDate(rows);
    
    const phrase = isNordeste
      ? `Seguem em anexo as solicitações de monitoramento rota Santa Luzia x Nordeste para as escalas de viagem para o dia: ${date}!`
      : title.includes('IDA') 
        ? `Seguem em anexo as solicitações de monitoramento para as escalas de viagem para o dia: ${date}!`
        : title.includes('VOLTA')
          ? `Seguem em anexo as solicitações de monitoramento rota de volta para as escalas de viagem para o dia: ${date}!`
          : `Seguem em anexo as solicitações de monitoramento rota Vespasiano para as escalas de viagem para o dia: ${date}!`;

    let html = `<div style="font-family: sans-serif; color: #333;">
      <h3 style="color: ${color}; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ${title} ---</h3>
      <p style="font-size: 13px;">${greeting},</p>
      <p style="font-size: 13px;">${phrase}</p>
      ${generateStyledTableHtml(rows, type)}
      <p style="margin-top: 15px;">Att,</p>
    </div>`;

    let text = `--- ${title} ---\n${greeting},\n${phrase}\n\n`;
    text += `| DATA | MOTORISTA | PLACA | BAÚ 1 | BAÚ 2 | TRECHO | VALOR NF |\n`;
    rows.forEach(r => {
      text += `| ${r.dataSaida} | ${r.motorista} | ${r.placa} | ${r.bau1} | ${r.bau2} | ${r.trecho} | ${r.valorNf} |\n`;
    });

    const success = await safeCopyHtmlAndText(html, text);
    if (success) {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 2000);
    }
  };

  return (
    <div className="w-full relative pb-10 space-y-5 font-sans text-[#1A1917] text-left bg-[#FDF8EE] p-4 sm:p-7 rounded-3xl border border-[#EFE2C6] shadow-lg">
      
      {internalView === 'codes' || view === 'codes' ? (
        <div className="relative z-10 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE2C6] shadow-md text-[#1A1917]">{renderCodesTable()}</div>
      ) : (
        <div className="relative z-10 space-y-5 animate-fade-in text-left">
          
          {/* ========================================================================= */}
          {/* EXECUTIVE DASHBOARD GRAPHIC (CENTRAL DE ESCALA & ASSUNTOS PADRONIZADOS)    */}
          {/* ========================================================================= */}
          <div className="w-full shrink-0 space-y-5">
            {/* Header: ROTA DE TRANSPORTE - BRASIL / Central de Escala */}
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 pt-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-[#FBD24D] via-[#F2B529] to-[#E39B12] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(234,168,25,0.32)] shrink-0">
                  <Route size={28} className="stroke-[2.2] text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.06em] text-[#DE9A14] uppercase leading-tight">
                    ROTA DE TRANSPORTE - BRASIL
                  </span>
                  <h1 className="text-2xl sm:text-[31px] font-black tracking-tight text-[#1A1917] leading-none mt-1">
                    Central de Escala
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRouteSelectorOpen(true)}
                  className="px-5 py-2.5 text-xs font-bold rounded-full bg-[#FFFDF9] hover:bg-[#FAF1DF] text-[#1A1917] border border-[#EDE0C8] cursor-pointer transition-all flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95"
                  title="Escolher quais rotas devem aparecer"
                >
                  <SlidersHorizontal size={15} className="text-[#1A1917] stroke-[2.2]" />
                  <span>Rotas ({Object.values(visibleRoutes).filter(Boolean).length}/4)</span>
                  <ArrowDown size={13} className="text-[#785A28] stroke-[2.3]" />
                </button>

                <button
                  type="button"
                  onClick={handleClearAllSM}
                  className="px-5 py-2.5 text-xs font-bold rounded-full bg-[#C90A14] hover:bg-[#AD0710] text-white cursor-pointer transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(201,10,20,0.25)] active:scale-95"
                  title="Limpar todas as informações"
                >
                  <Trash2 size={15} className="stroke-[2.2]" />
                  <span>Limpar Dados</span>
                </button>

                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-5 py-2.5 text-xs font-bold rounded-full bg-[#1C1B1A] hover:bg-[#2F2E2C] text-white cursor-pointer transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.18)] active:scale-95"
                    title="Voltar ao menu"
                  >
                    <ArrowLeft size={15} className="stroke-[2.2]" />
                    <span>Voltar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Assuntos de E-mail Padronizados (Exibidos apenas para as rotas visíveis) */}
            {Object.values(visibleRoutes).some(Boolean) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                {/* Card 1: Rota Ida Subject */}
                {visibleRoutes.ida && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFFDF9] via-[#FFF9ED] to-[#FDF1D6]/85 border border-[#F2E2C4] px-5 py-4 flex items-center justify-between gap-4 shadow-[0_4px_14px_rgba(218,165,32,0.06)] animate-fade-in">
                    {/* Barra vertical dourada na esquerda */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#F7C948] to-[#E5A31A]" />
                    {/* Detalhe suave de onda dourada no fundo direito */}
                    <div className="pointer-events-none absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-gradient-to-tl from-[#FBE5B8]/55 to-transparent blur-md" />

                    <div className="relative z-10 flex items-center gap-4 min-w-0 flex-1 pl-1">
                      <div className="w-12 h-12 rounded-full bg-[#FDF0D2] border border-[#F7DFA8] flex items-center justify-center text-[#D89412] shrink-0">
                        <Mail size={20} className="stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[15px] font-extrabold text-[#1A1917] tracking-tight">
                            Assuntos de E-mail Padronizados
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F2B729] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                            AUTO
                          </span>
                        </div>
                        <span className="block text-xs font-extrabold uppercase tracking-wide text-[#DC9814]">
                          SM ROTA IDA
                        </span>
                        <span className="block text-xs sm:text-[13px] font-extrabold text-[#1A1917] uppercase tracking-tight truncate">
                          {getSubjectIda()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={copySubjectIda}
                      className={cn(
                        "relative z-10 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0",
                        subjectIdaCopied
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-[#FCEAC6] hover:bg-[#F9DDA6] text-[#1A1917] border border-[#F3D499]/70 shadow-2xs active:scale-95"
                      )}
                    >
                      {subjectIdaCopied ? (
                        <Check size={14} className="stroke-[2.5]" />
                      ) : (
                        <Copy size={14} className="text-[#78530D] stroke-[2.2]" />
                      )}
                      <span>{subjectIdaCopied ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                )}

                {/* Card 2: Rota Volta Subject */}
                {visibleRoutes.volta && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFFDF9] via-[#FFF6F5] to-[#FDE8E8]/80 border border-[#F3D6D4] px-5 py-4 flex items-center justify-between gap-4 shadow-[0_4px_14px_rgba(229,9,20,0.06)] animate-fade-in">
                    {/* Barra vertical vermelha na esquerda */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E50914]" />
                    {/* Detalhes suaves de onda vermelha/rosada no fundo */}
                    <div className="pointer-events-none absolute -left-6 -bottom-8 w-36 h-36 rounded-full bg-[#FCD5D7]/45 blur-md" />
                    <div className="pointer-events-none absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-gradient-to-tl from-[#FCD5D7]/45 to-transparent blur-md" />

                    <div className="relative z-10 flex items-center gap-4 min-w-0 flex-1 pl-1">
                      <div className="w-12 h-12 rounded-full bg-[#E50914] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(229,9,20,0.3)] shrink-0">
                        <Zap size={20} className="fill-white text-white stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="block text-[13px] font-extrabold uppercase tracking-wide text-[#C90812]">
                          SM ROTA VOLTA
                        </span>
                        <span className="block text-xs sm:text-[13px] font-extrabold text-[#1A1917] uppercase tracking-tight truncate">
                          {getSubjectVolta()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={copySubjectVolta}
                      className={cn(
                        "relative z-10 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0",
                        subjectVoltaCopied
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-[#E50914] hover:bg-[#C40710] text-white shadow-[0_4px_12px_rgba(229,9,20,0.28)] active:scale-95"
                      )}
                    >
                      {subjectVoltaCopied ? (
                        <Check size={14} className="stroke-[2.5]" />
                      ) : (
                        <Copy size={14} className="text-white stroke-[2.2]" />
                      )}
                      <span>{subjectVoltaCopied ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                )}

                {/* Card 3: Rota Santa Luzia x Nordeste Subject */}
                {visibleRoutes.nordeste && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFFDF9] via-[#FFFBEB] to-[#FEF08A]/75 border border-[#FDE047] px-5 py-4 flex items-center justify-between gap-4 shadow-[0_4px_14px_rgba(234,179,8,0.08)] animate-fade-in">
                    {/* Barra vertical amarela na esquerda */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EAB308]" />
                    {/* Detalhe suave de onda amarela no fundo direito */}
                    <div className="pointer-events-none absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-gradient-to-tl from-[#FDE047]/45 to-transparent blur-md" />

                    <div className="relative z-10 flex items-center gap-4 min-w-0 flex-1 pl-1">
                      <div className="w-12 h-12 rounded-full bg-[#F2B729] border border-[#DF9610]/40 flex items-center justify-center text-[#141311] shadow-[0_4px_12px_rgba(242,183,41,0.3)] shrink-0">
                        <TrendingUp size={20} className="stroke-[2.3]" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[15px] font-extrabold text-[#1A1917] tracking-tight">
                            Assuntos de E-mail Padronizados
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#141311] text-[#F2B729] text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                            AUTO
                          </span>
                        </div>
                        <span className="block text-xs font-extrabold uppercase tracking-wide text-[#B47800]">
                          SM ROTA SANTA LUZIA X NORDESTE
                        </span>
                        <span className="block text-xs sm:text-[13px] font-extrabold text-[#1A1917] uppercase tracking-tight truncate">
                          {getSubjectNordeste()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={copySubjectNordeste}
                      className={cn(
                        "relative z-10 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0",
                        subjectNordesteCopied
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-[#F2B729] hover:bg-[#DF9E14] text-[#141311] border border-[#C98A0C]/40 shadow-2xs active:scale-95"
                      )}
                    >
                      {subjectNordesteCopied ? (
                        <Check size={14} className="stroke-[2.5]" />
                      ) : (
                        <Copy size={14} className="text-[#141311] stroke-[2.2]" />
                      )}
                      <span>{subjectNordesteCopied ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                )}

                {/* Card 4: Rota Vespasiano Subject */}
                {visibleRoutes.vespasiano && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFFDF9] via-[#F2FDF6] to-[#DCFCE7]/80 border border-[#BBF7D0] px-5 py-4 flex items-center justify-between gap-4 shadow-[0_4px_14px_rgba(22,101,52,0.07)] animate-fade-in">
                    {/* Barra vertical verde na esquerda */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#166534]" />
                    {/* Detalhes suaves de onda verde no fundo */}
                    <div className="pointer-events-none absolute -left-6 -bottom-8 w-36 h-36 rounded-full bg-[#BBF7D0]/45 blur-md" />
                    <div className="pointer-events-none absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-gradient-to-tl from-[#BBF7D0]/50 to-transparent blur-md" />

                    <div className="relative z-10 flex items-center gap-4 min-w-0 flex-1 pl-1">
                      <div className="w-12 h-12 rounded-full bg-[#166534] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(22,101,52,0.3)] shrink-0">
                        <Truck size={20} className="text-white stroke-[2]" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="block text-[13px] font-extrabold uppercase tracking-wide text-[#166534]">
                          SM ROTA VESPASIANO
                        </span>
                        <span className="block text-xs sm:text-[13px] font-extrabold text-[#1A1917] uppercase tracking-tight truncate">
                          {getSubjectVespasiano()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={copySubjectVespasiano}
                      className={cn(
                        "relative z-10 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0",
                        subjectVespasianoCopied
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-[#166534] hover:bg-[#14532D] text-white shadow-[0_4px_12px_rgba(22,101,52,0.25)] active:scale-95"
                      )}
                    >
                      {subjectVespasianoCopied ? (
                        <Check size={14} className="stroke-[2.5]" />
                      ) : (
                        <Copy size={14} className="text-white stroke-[2.2]" />
                      )}
                      <span>{subjectVespasianoCopied ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Main Work Area */}
            <div className="xl:col-span-3 space-y-4">

              {/* Se todas as rotas estiverem ocultas, exibe o cartão no lugar com o ícone para clicar */}
              {Object.values(visibleRoutes).every(v => !v) && (
                <div className="bg-[#FFFCF6] border-2 border-dashed border-[#E6D2A3] rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-4 shadow-sm animate-fade-in">
                  <button
                    type="button"
                    onClick={() => setIsRouteSelectorOpen(true)}
                    className="w-16 h-16 rounded-2xl bg-[#292820] border border-[#C49A45]/50 flex items-center justify-center text-[#D6A84F] shadow-md cursor-pointer hover:scale-105 hover:bg-[#38372d] transition-all group"
                    title="Clique para escolher qual rota irá aparecer"
                  >
                    <SlidersHorizontal size={28} className="group-hover:rotate-12 transition-transform" />
                  </button>
                  <div className="max-w-md">
                    <h3 className="text-sm sm:text-base font-mono font-black text-[#25231F] uppercase tracking-wide">
                      Rotas Ocultas
                    </h3>
                    <p className="text-xs text-[#7A756D] font-mono mt-1 leading-relaxed">
                      As rotas estão ocultas no momento. Clique no ícone acima para escolher qual rota deseja que apareça na tela.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRouteSelectorOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] hover:brightness-105 text-[#25231F] transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Eye size={14} />
                    <span>Qual dessas rotas irá aparecer?</span>
                  </button>
                </div>
              )}

              {/* ROTA IDA (Cor Preta) */}
              {visibleRoutes.ida && (
              <section className="space-y-3 font-sans">
                <div className="flex items-center justify-between bg-[#0A0D10] text-white p-3.5 rounded-2xl shadow-md border border-[#C49A45]/40">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={18} className="text-[#E5B84B]" /> 
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                      Rota Ida
                    </h3>
                    <span className="text-[10px] font-mono font-black bg-[#1A1E24] text-[#E5B84B] border border-[#C49A45]/50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      PRETO & DOURADO / VIP
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsIdaMaximized(!isIdaMaximized)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1C2026] hover:bg-[#2A303A] text-[#E6D2A3] transition-all shadow-xs cursor-pointer border border-[#C49A45]/40 active:scale-95"
                      title={isIdaMaximized ? 'Minimizar' : 'Maximizar'}
                    >
                      {isIdaMaximized ? <ChevronUp size={16} className="stroke-[2.5]" /> : <ChevronDown size={16} className="stroke-[2.5]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => addNewRow('ida')}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E6D2A3] to-[#C49A45] text-[#0A0D10] transition-all shadow-sm cursor-pointer hover:brightness-110 active:scale-95"
                      title="Adicionar Linha"
                    >
                      <Plus size={16} className="stroke-[2.8]" />
                    </button>

                    {idaRows.length > 0 && (
                      <button
                        type="button"
                        onClick={copyIdaToVolta}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1C2026] hover:bg-[#2A303A] text-[#E6D2A3] transition-all shadow-xs cursor-pointer border border-[#C49A45]/40 active:scale-95"
                        title="Enviar para Volta (Invertendo Trecho)"
                      >
                        <ArrowRightLeft size={15} className="text-[#E5B84B] stroke-[2.3]" />
                      </button>
                    )}

                    {idaRows.length > 0 && (
                      <button
                        type="button"
                        onClick={() => copySection(idaRows, 'ROTA IDA', setIdaCopied)}
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs border active:scale-95",
                          idaCopied
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-[#1C2026] hover:bg-[#2A303A] text-[#E6D2A3] border-[#C49A45]/40"
                        )}
                        title={idaCopied ? 'Copiado!' : 'Copiar Ida'}
                      >
                        {idaCopied ? <Check size={15} className="stroke-[2.5]" /> : <Copy size={15} className="stroke-[2.2]" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => saveIda([], true)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[#C91F2D] hover:bg-[#a61723] text-white cursor-pointer shadow-xs transition-all active:scale-95"
                      title="Limpar Rota Ida"
                    >
                      <Trash2 size={15} className="stroke-[2.2]" />
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "transition-all duration-300 ease-in-out",
                  isIdaMaximized ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                )}>
                  {/* Styled Table Frame */}
                  <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-2.5 shadow-sm overflow-hidden relative">
                    {idaRows.length === 0 ? (
                      <div className="p-8 flex flex-col items-center justify-center text-center bg-[#F5F0E6] border border-dashed border-[#E6D2A3] rounded-xl text-[#25231F]">
                        <Clipboard className="text-[#C49A45] w-8 h-8 mb-2" />
                        <p className="text-xs text-[#25231F] mb-3 font-bold font-mono">Cole aqui as informações da Rota Ida ou adicione manualmente</p>
                        <div className="flex flex-col gap-2.5 w-full max-w-md">
                          <textarea 
                            onPaste={(e) => handlePaste(e, 'ida')}
                            placeholder="Ctrl+V aqui para colar escala..."
                            className="w-full h-20 bg-white border border-[#E6D2A3] rounded-xl p-3 text-xs font-mono text-[#25231F] font-bold outline-none placeholder-[#7A756D] focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/40 resize-none shadow-inner"
                          />
                          <button 
                            onClick={() => addNewRow('ida')}
                            className="w-full py-2.5 bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] hover:brightness-105 text-[#25231F] rounded-xl text-xs font-mono font-black uppercase transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
                          >
                            <Plus size={14} className="inline mr-1" /> Adicionar linha manualmente
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-[#E6D2A3]/60 shadow-inner">
                        <table className="w-full text-left border-collapse font-sans">
                          <thead>
                            <tr className="bg-[#F5F0E6] border-b border-[#E6D2A3] text-[#25231F] text-[11px] uppercase font-mono font-bold tracking-wider h-11">
                              <th className="px-2 py-2.5 w-8 text-center text-[#C49A45]">#</th>
                              <th className="px-2 py-2.5 w-10 text-center text-[#C49A45]">OK</th>
                              <th className="px-2 py-2.5 w-28 text-center text-[#25231F]">DATA</th>
                              <th className="px-2 py-2.5 text-[#25231F]">MOTORISTA</th>
                              <th className="px-2 py-2.5 w-28 text-center text-[#25231F]">PLACA</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">BAÚ 1</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">BAÚ 2</th>
                              <th className="px-2 py-2.5 text-center text-[#25231F]">TRECHO</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">
                                <div className="flex items-center justify-center gap-1">
                                  <span>ROTAS</span>
                                  <button
                                    type="button"
                                    onClick={() => copyAllSectionRouteCodes(idaRows, 'ida', 'Rota Ida', 'header-ida')}
                                    className={cn(
                                      "p-1 rounded transition-all cursor-pointer border",
                                      copiedRouteKey === 'header-ida'
                                        ? "bg-[#292820] text-[#D6A84F] border-[#D6A84F]"
                                        : "bg-transparent text-[#7A756D] border-transparent hover:text-[#25231F] hover:bg-[#E6D2A3]/70 hover:border-[#E6D2A3]"
                                    )}
                                    title="Copiar todos os números de rotas da Rota Ida"
                                  >
                                    {copiedRouteKey === 'header-ida' ? <Check size={11} className="text-[#D6A84F]" /> : <Copy size={11} />}
                                  </button>
                                </div>
                              </th>
                              <th className="px-2.5 py-2 w-48 text-right text-[#25231F] select-none transition-colors border-l border-[#E6D2A3]/50">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span 
                                    onClick={() => sortRowsByValorNf('ida')}
                                    className="cursor-pointer hover:text-[#C49A45] flex items-center gap-1 font-mono font-bold text-[10px] uppercase tracking-wider"
                                    title="Clique para organizar: Valores adicionados no topo, vazios no final"
                                  >
                                    VALOR TOTAL DA NF
                                    <ArrowDownUp size={11} className="text-[#C49A45]" />
                                  </span>
                                  <span className="text-[9px] font-mono text-[#7A756D] font-normal">(R$)</span>
                                </div>
                              </th>
                              <th className="px-2 py-2.5 w-12 text-center text-[#25231F]">AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody className="bg-[#FFFCF6] divide-y divide-[#E6D2A3]/30">
                            {idaRows.map((row, i) => {
                              const hasValue = !isValorNfEmpty(row.valorNf);
                              return (
                                <tr 
                                  key={i} 
                                  className={cn(
                                    "text-xs text-[#25231F] group/row font-bold transition-colors",
                                    hasValue 
                                      ? "bg-[#FDFBF7] hover:bg-[#F5F0E6]/70" 
                                      : "hover:bg-[#F5F0E6]/50"
                                  )}
                                >
                                  <td className="p-1.5 text-center text-[#C49A45] font-mono text-xs w-8">
                                    {i + 1}
                                  </td>
                                  <td className="p-1.5 text-center w-10">
                                    <button
                                      type="button"
                                      onClick={() => updateRowValue(i, 'ok', !row.ok, 'ida')}
                                      className={cn(
                                        "w-5 h-5 mx-auto flex items-center justify-center rounded border transition-all cursor-pointer",
                                        row.ok 
                                          ? "bg-[#292820] border-[#C49A45] text-[#C49A45] shadow-xs" 
                                          : "bg-[#F5F0E6] border-[#E6D2A3] text-transparent hover:border-[#C49A45]"
                                      )}
                                      title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                    >
                                      <Check size={12} className="stroke-[3]" />
                                    </button>
                                  </td>
                                  <td className="p-1.5">
                                    <input 
                                      type="text"
                                      value={row.dataSaida}
                                      onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'ida')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5 group/cell">
                                    <div className="flex items-center gap-1.5">
                                      <input 
                                        type="text"
                                        value={row.motorista}
                                        onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'ida')}
                                        className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2.5 focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                      />
                                      <button 
                                        onClick={() => safeCopyText(row.motorista)}
                                        className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                        title="Copiar Motorista"
                                      >
                                        <Copy size={12} />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <input 
                                      type="text"
                                      value={row.placa}
                                      onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'ida')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs font-mono tracking-wider"
                                    />
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <input 
                                      type="text"
                                      value={row.bau1}
                                      onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'ida')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <input 
                                      type="text"
                                      value={row.bau2}
                                      onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'ida')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <input 
                                      type="text"
                                      value={row.trecho}
                                      onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'ida')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5 text-center">
                                    {(() => {
                                      const routeCode = findRouteCode(row.trecho, 'ida', routesList);
                                      const keyId = `ida-${i}`;
                                      const isCopied = copiedRouteKey === keyId;
                                      const isValid = routeCode && routeCode.trim() !== '' && routeCode !== '---' && routeCode !== '-';
                                      return isValid ? (
                                        <button
                                          type="button"
                                          onClick={() => copySingleRouteCode(routeCode, keyId)}
                                          className={cn(
                                            "group/route relative inline-flex items-center justify-center gap-1 font-extrabold text-xs rounded-md py-1.5 px-2.5 min-w-[58px] text-center transition-all cursor-pointer shadow-xs border select-all",
                                            isCopied
                                              ? "bg-[#292820] text-[#D6A84F] border-[#D6A84F] ring-2 ring-[#D6A84F]/30 scale-105"
                                              : "bg-[#F5F0E6] border-[#E6D2A3] text-[#25231F] hover:bg-[#E6D2A3] hover:border-[#C49A45] hover:shadow-sm active:scale-95"
                                          )}
                                          title={isCopied ? "Número da rota copiado!" : `Clique para copiar a rota: ${routeCode}`}
                                        >
                                          <span className="font-mono tracking-wide">{routeCode}</span>
                                          {isCopied ? (
                                            <Check size={12} className="text-[#D6A84F] shrink-0" />
                                          ) : (
                                            <Copy size={11} className="text-[#7A756D] group-hover/route:text-[#25231F] opacity-60 group-hover/route:opacity-100 transition-opacity shrink-0" />
                                          )}
                                        </button>
                                      ) : (
                                        <div 
                                          className="bg-[#F5F0E6]/70 border border-[#E6D2A3]/60 text-[#7A756D] font-mono font-bold text-xs rounded-md py-1.5 px-2 inline-block min-w-[58px] text-center select-none"
                                          title="Código da rota obtido da página de Rotas"
                                        >
                                          ---
                                        </div>
                                      );
                                    })()}
                                  </td>
                                  <td className="p-1.5 text-right font-extrabold group/cell border-l border-[#E6D2A3]/40">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Botão de Importação Direta de PDF para esta Linha */}
                                      <button 
                                        type="button"
                                        onClick={() => openPdfModal('ida', i)}
                                        className={cn(
                                          "px-2 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-mono font-extrabold transition-all cursor-pointer shrink-0 shadow-xs border",
                                          hasValue 
                                            ? "bg-[#292820] text-[#E6D2A3] hover:bg-[#38372d] hover:text-white border-[#C49A45]/60" 
                                            : "bg-[#F5F0E6] text-[#25231F] hover:bg-[#292820] hover:text-[#E6D2A3] border-[#E6D2A3] hover:border-[#C49A45]"
                                        )}
                                        title="Importar uma ou várias Notas Fiscais (PDF) para esta linha"
                                      >
                                        <FileText size={11} className={hasValue ? "text-[#C49A45]" : "text-[#7A756D]"} />
                                        <span>PDF</span>
                                      </button>

                                      <button 
                                        type="button"
                                        onClick={() => safeCopyText(row.valorNf)}
                                        className="p-1.5 text-[#7A756D] hover:text-[#25231F] hover:bg-[#F5F0E6] rounded-md transition-colors shrink-0 cursor-pointer"
                                        title="Copiar Valor"
                                      >
                                        <Copy size={12} />
                                      </button>

                                      <div className="relative flex items-center w-full min-w-[110px]">
                                        <span className="absolute left-2 text-[10px] font-mono font-bold text-[#7A756D] pointer-events-none">R$</span>
                                        <input 
                                          type="text"
                                          value={row.valorNf}
                                          onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'ida')}
                                          onPaste={(e) => {
                                            e.preventDefault();
                                            const text = e.clipboardData.getData('text');
                                            handlePasteValorNf(text, i, 'ida');
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          placeholder="0,00"
                                          className={cn(
                                            "w-full rounded-md py-1.5 pl-6 pr-2 text-right outline-none transition-all text-xs font-mono font-extrabold border border-[#E6D2A3]",
                                            hasValue 
                                              ? "bg-white text-[#25231F] border-[#C49A45]/40 shadow-xs focus:ring-1 focus:ring-[#C49A45]" 
                                              : "bg-[#F5F0E6] text-stone-500 placeholder-stone-400 focus:bg-white focus:border-[#C49A45] focus:text-[#25231F]"
                                          )}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <div className="flex flex-col gap-0.5">
                                        <button 
                                          onClick={() => moveRow(i, 'up', 'ida')}
                                          disabled={i === 0}
                                          className={cn(
                                            "p-0.5 rounded transition-colors cursor-pointer",
                                            i === 0 ? "text-stone-300 cursor-not-allowed" : "text-[#292820] hover:text-[#C49A45]"
                                          )}
                                          title="Mover para cima"
                                        >
                                          <ChevronUp size={14} />
                                        </button>
                                        <button 
                                          onClick={() => moveRow(i, 'down', 'ida')}
                                          disabled={i === idaRows.length - 1}
                                          className={cn(
                                            "p-0.5 rounded transition-colors cursor-pointer",
                                            i === idaRows.length - 1 ? "text-stone-300 cursor-not-allowed" : "text-[#292820] hover:text-[#C49A45]"
                                          )}
                                          title="Mover para baixo"
                                        >
                                          <ChevronDown size={14} />
                                        </button>
                                      </div>
                                      <button 
                                        onClick={() => saveIda(idaRows.filter((_, idx) => idx !== i), true)} 
                                        className="p-1.5 text-[#C91F2D] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Remover Linha"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>
              )}

              {/* ROTA VOLTA (Cor Vermelha) */}
              {visibleRoutes.volta && (
              <section className="space-y-3 font-sans animate-fade-in">
                <div className="flex items-center justify-between bg-[#A80C14] text-white p-3.5 rounded-2xl shadow-md border border-[#7F090F]">
                  <div className="flex items-center gap-2.5">
                    <Download size={18} className="rotate-180 text-white" /> 
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                      Rota Volta
                    </h3>
                    <span className="text-[10px] font-mono font-black bg-black/25 text-white border border-white/25 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      VERMELHA
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVoltaMaximized(!isVoltaMaximized)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/45 text-white transition-all shadow-xs cursor-pointer border border-white/25 active:scale-95"
                      title={isVoltaMaximized ? 'Minimizar' : 'Maximizar'}
                    >
                      {isVoltaMaximized ? <ChevronUp size={16} className="stroke-[2.5]" /> : <ChevronDown size={16} className="stroke-[2.5]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => addNewRow('volta')}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white hover:bg-red-50 text-[#A80C14] transition-all shadow-sm cursor-pointer active:scale-95"
                      title="Adicionar Linha"
                    >
                      <Plus size={16} className="stroke-[2.8]" />
                    </button>

                    {voltaRows.length > 0 && (
                      <button
                        type="button"
                        onClick={() => copySection(voltaRows, 'ROTA VOLTA', setVoltaCopied)}
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs border active:scale-95",
                          voltaCopied
                            ? "bg-emerald-600 text-white border-emerald-400"
                            : "bg-black/30 hover:bg-black/45 text-white border-white/25"
                        )}
                        title={voltaCopied ? 'Copiado!' : 'Copiar Volta'}
                      >
                        {voltaCopied ? <Check size={15} className="stroke-[2.5]" /> : <Copy size={15} className="stroke-[2.2]" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => saveVolta([], true)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[#0A0D10] hover:bg-[#1C2026] text-white border border-white/20 cursor-pointer shadow-xs transition-all active:scale-95"
                      title="Limpar Rota Volta"
                    >
                      <Trash2 size={15} className="stroke-[2.2]" />
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "transition-all duration-300 ease-in-out",
                  isVoltaMaximized ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                )}>
                  {/* Styled Table Frame */}
                  <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-2.5 shadow-sm overflow-hidden relative">
                    {voltaRows.length === 0 ? (
                      <div className="p-8 flex flex-col items-center justify-center text-center bg-[#F5F0E6] border border-dashed border-[#E6D2A3] rounded-xl text-[#25231F]">
                        <Clipboard className="text-[#C91F2D] w-8 h-8 mb-2" />
                        <p className="text-xs text-[#25231F] mb-3 font-bold font-mono">Cole aqui as informações da Rota Volta ou adicione manualmente</p>
                        <div className="flex flex-col gap-2.5 w-full max-w-md">
                          <textarea 
                            onPaste={(e) => handlePaste(e, 'volta')}
                            placeholder="Ctrl+V aqui para colar escala..."
                            className="w-full h-20 bg-white border border-[#E6D2A3] rounded-xl p-3 text-xs font-mono text-[#25231F] font-bold outline-none placeholder-[#7A756D] focus:border-[#C91F2D] focus:ring-1 focus:ring-[#C91F2D]/40 resize-none shadow-inner"
                          />
                          <button 
                            onClick={() => addNewRow('volta')}
                            className="w-full py-2.5 bg-gradient-to-r from-[#C91F2D] to-[#990c11] hover:brightness-105 text-white rounded-xl text-xs font-mono font-bold uppercase transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
                          >
                            <Plus size={14} className="inline mr-1" /> Adicionar linha manualmente
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-[#E6D2A3]/60 shadow-inner">
                        <table className="w-full text-left border-collapse font-sans">
                          <thead>
                            <tr className="bg-[#F5F0E6] border-b border-[#E6D2A3] text-[#25231F] text-[11px] uppercase font-mono font-bold tracking-wider h-11">
                              <th className="px-2 py-2.5 w-8 text-center text-[#C91F2D]">#</th>
                              <th className="px-2 py-2.5 w-10 text-center text-[#C91F2D]">OK</th>
                              <th className="px-2 py-2.5 w-28 text-center text-[#25231F]">DATA</th>
                              <th className="px-2 py-2.5 text-[#25231F]">MOTORISTA</th>
                              <th className="px-2 py-2.5 w-28 text-center text-[#25231F]">PLACA</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">BAÚ 1</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">BAÚ 2</th>
                              <th className="px-2 py-2.5 text-center text-[#25231F]">TRECHO</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">
                                <div className="flex items-center justify-center gap-1">
                                  <span>ROTAS</span>
                                  <button
                                    type="button"
                                    onClick={() => copyAllSectionRouteCodes(voltaRows, 'volta', 'Rota Volta', 'header-volta')}
                                    className={cn(
                                      "p-1 rounded transition-all cursor-pointer border",
                                      copiedRouteKey === 'header-volta'
                                        ? "bg-[#292820] text-[#D6A84F] border-[#D6A84F]"
                                        : "bg-transparent text-[#7A756D] border-transparent hover:text-[#25231F] hover:bg-[#E6D2A3]/70 hover:border-[#E6D2A3]"
                                    )}
                                    title="Copiar todos os números de rotas da Rota Volta"
                                  >
                                    {copiedRouteKey === 'header-volta' ? <Check size={11} className="text-[#D6A84F]" /> : <Copy size={11} />}
                                  </button>
                                </div>
                              </th>
                              <th className="px-2.5 py-2 w-48 text-right text-[#25231F] select-none transition-colors border-l border-[#E6D2A3]/50">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span 
                                    onClick={() => sortRowsByValorNf('volta')}
                                    className="cursor-pointer hover:text-[#C91F2D] flex items-center gap-1 font-mono font-bold text-[10px] uppercase tracking-wider"
                                    title="Clique para organizar: Valores adicionados no topo, vazios no final"
                                  >
                                    VALOR TOTAL DA NF
                                    <ArrowDownUp size={11} className="text-[#C91F2D]" />
                                  </span>
                                  <span className="text-[9px] font-mono text-[#7A756D] font-normal">(R$)</span>
                                </div>
                              </th>
                              <th className="px-2 py-2.5 w-12 text-center text-[#25231F]">AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody className="bg-[#FFFCF6] divide-y divide-[#E6D2A3]/30">
                            {voltaRows.map((row, i) => {
                              const hasValue = !isValorNfEmpty(row.valorNf);
                              return (
                              <tr key={i} className="text-xs text-[#25231F] group/row font-bold hover:bg-[#F5F0E6]/50 transition-colors">
                                <td className="p-1.5 text-center text-[#C91F2D] font-mono text-xs w-8">
                                  {i + 1}
                                </td>
                                <td className="p-1.5 text-center w-10">
                                  <button
                                    type="button"
                                    onClick={() => updateRowValue(i, 'ok', !row.ok, 'volta')}
                                    className={cn(
                                      "w-5 h-5 mx-auto flex items-center justify-center rounded border transition-all cursor-pointer",
                                      row.ok 
                                        ? "bg-[#C91F2D] border-[#C91F2D] text-white shadow-xs" 
                                        : "bg-[#F5F0E6] border-[#E6D2A3] text-transparent hover:border-[#C91F2D]"
                                    )}
                                    title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                  >
                                    <Check size={12} className="stroke-[3]" />
                                  </button>
                                </td>
                                <td className="p-1.5">
                                  <input 
                                    type="text"
                                    value={row.dataSaida}
                                    onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'volta')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C91F2D] focus:ring-1 focus:ring-[#C91F2D]/30 outline-none transition-all uppercase text-xs"
                                  />
                                </td>
                                <td className="p-1.5 group/cell">
                                  <div className="flex items-center gap-1.5">
                                    <input 
                                      type="text"
                                      value={row.motorista}
                                      onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'volta')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2.5 focus:bg-white focus:border-[#C91F2D] focus:ring-1 focus:ring-[#C91F2D]/30 outline-none transition-all uppercase text-xs"
                                    />
                                    <button 
                                      onClick={() => safeCopyText(row.motorista)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                      title="Copiar Motorista"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-1.5 text-center">
                                  <input 
                                    type="text"
                                    value={row.placa}
                                    onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'volta')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C91F2D] focus:ring-1 focus:ring-[#C91F2D]/30 outline-none transition-all uppercase text-xs font-mono"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <input 
                                    type="text"
                                    value={row.bau1}
                                    onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'volta')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C91F2D] focus:ring-1 focus:ring-[#C91F2D]/30 outline-none transition-all uppercase text-xs"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <input 
                                    type="text"
                                    value={row.bau2}
                                    onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'volta')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C91F2D] focus:ring-1 focus:ring-[#C91F2D]/30 outline-none transition-all uppercase text-xs"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <div className="flex items-center gap-1 group/trecho">
                                    <input 
                                      type="text"
                                      value={row.trecho}
                                      onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'volta')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C91F2D] focus:ring-1 focus:ring-[#C91F2D]/30 outline-none transition-all uppercase text-xs"
                                    />
                                    <button 
                                      onClick={() => {
                                        const inverted = invertRoute(row.trecho);
                                        updateRowValue(i, 'trecho', inverted, 'volta');
                                      }}
                                      className="opacity-0 group-hover/trecho:opacity-100 p-1.5 bg-[#F5F0E6] text-[#25231F] hover:bg-[#E6D2A3] rounded transition-all shrink-0 cursor-pointer shadow-xs"
                                      title="Inverter Rota"
                                    >
                                      <RefreshCw size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-1.5 text-center">
                                  {(() => {
                                    const routeCode = findRouteCode(row.trecho, 'volta', routesList);
                                    const keyId = `volta-${i}`;
                                    const isCopied = copiedRouteKey === keyId;
                                    const isValid = routeCode && routeCode.trim() !== '' && routeCode !== '---' && routeCode !== '-';
                                    return isValid ? (
                                      <button
                                        type="button"
                                        onClick={() => copySingleRouteCode(routeCode, keyId)}
                                        className={cn(
                                          "group/route relative inline-flex items-center justify-center gap-1 font-extrabold text-xs rounded-md py-1.5 px-2.5 min-w-[58px] text-center transition-all cursor-pointer shadow-xs border select-all",
                                          isCopied
                                            ? "bg-[#292820] text-[#D6A84F] border-[#D6A84F] ring-2 ring-[#D6A84F]/30 scale-105"
                                            : "bg-[#F5F0E6] border-[#E6D2A3] text-[#25231F] hover:bg-[#E6D2A3] hover:border-[#C49A45] hover:shadow-sm active:scale-95"
                                        )}
                                        title={isCopied ? "Número da rota copiado!" : `Clique para copiar a rota: ${routeCode}`}
                                      >
                                        <span className="font-mono tracking-wide">{routeCode}</span>
                                        {isCopied ? (
                                          <Check size={12} className="text-[#D6A84F] shrink-0" />
                                        ) : (
                                          <Copy size={11} className="text-[#7A756D] group-hover/route:text-[#25231F] opacity-60 group-hover/route:opacity-100 transition-opacity shrink-0" />
                                        )}
                                      </button>
                                    ) : (
                                      <div 
                                        className="bg-[#F5F0E6]/70 border border-[#E6D2A3]/60 text-[#7A756D] font-mono font-bold text-xs rounded-md py-1.5 px-2 inline-block min-w-[58px] text-center select-none"
                                        title="Código da rota obtido da página de Rotas"
                                      >
                                        ---
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="p-1.5 text-right font-extrabold group/cell border-l border-[#E6D2A3]/40">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Botão de Importação Direta de PDF para esta Linha */}
                                    <button 
                                      type="button"
                                      onClick={() => openPdfModal('volta', i)}
                                      className={cn(
                                        "px-2 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-mono font-extrabold transition-all cursor-pointer shrink-0 shadow-xs border",
                                        hasValue 
                                          ? "bg-[#C91F2D] text-white hover:bg-[#a61723] border-[#C91F2D]" 
                                          : "bg-[#F5F0E6] text-[#25231F] hover:bg-[#C91F2D] hover:text-white border-[#E6D2A3] hover:border-[#C91F2D]"
                                      )}
                                      title="Importar uma ou várias Notas Fiscais (PDF) para esta linha"
                                    >
                                      <FileText size={11} className={hasValue ? "text-white" : "text-[#7A756D]"} />
                                      <span>PDF</span>
                                    </button>

                                    <button 
                                      type="button"
                                      onClick={() => safeCopyText(row.valorNf)}
                                      className="p-1.5 text-[#7A756D] hover:text-[#25231F] hover:bg-[#F5F0E6] rounded-md transition-colors shrink-0 cursor-pointer"
                                      title="Copiar Valor"
                                    >
                                      <Copy size={12} />
                                    </button>

                                    <div className="relative flex items-center w-full min-w-[110px]">
                                      <span className="absolute left-2 text-[10px] font-mono font-bold text-[#7A756D] pointer-events-none">R$</span>
                                      <input 
                                        type="text"
                                        value={row.valorNf}
                                        onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'volta')}
                                        onPaste={(e) => {
                                          e.preventDefault();
                                          const text = e.clipboardData.getData('text');
                                          handlePasteValorNf(text, i, 'volta');
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="0,00"
                                        className={cn(
                                          "w-full rounded-md py-1.5 pl-6 pr-2 text-right outline-none transition-all text-xs font-mono font-extrabold border border-[#E6D2A3]",
                                          hasValue 
                                            ? "bg-white text-[#25231F] border-[#C91F2D]/50 shadow-xs focus:ring-1 focus:ring-[#C91F2D]" 
                                            : "bg-[#F5F0E6] text-stone-500 placeholder-stone-400 focus:bg-white focus:border-[#C91F2D] focus:text-[#25231F]"
                                        )}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="p-1.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="flex flex-col gap-0.5">
                                      <button 
                                        onClick={() => moveRow(i, 'up', 'volta')}
                                        disabled={i === 0}
                                        className={cn(
                                          "p-0.5 rounded transition-colors cursor-pointer",
                                          i === 0 ? "text-stone-300 cursor-not-allowed" : "text-[#292820] hover:text-[#C49A45]"
                                        )}
                                        title="Mover para cima"
                                      >
                                        <ChevronUp size={14} />
                                      </button>
                                      <button 
                                        onClick={() => moveRow(i, 'down', 'volta')}
                                        disabled={i === voltaRows.length - 1}
                                        className={cn(
                                          "p-0.5 rounded transition-colors cursor-pointer",
                                          i === voltaRows.length - 1 ? "text-stone-300 cursor-not-allowed" : "text-[#292820] hover:text-[#C49A45]"
                                        )}
                                        title="Mover para baixo"
                                      >
                                        <ChevronDown size={14} />
                                      </button>
                                    </div>
                                    <button 
                                      onClick={() => saveVolta(voltaRows.filter((_, idx) => idx !== i), true)} 
                                      className="p-1.5 text-[#C91F2D] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Remover Linha"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ); })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>
              )}

              {/* ROTA SANTA LUZIA X NORDESTE (Cor Amarela) */}
              {visibleRoutes.nordeste && (
              <section className="space-y-3 font-sans animate-fade-in">
                <div className="flex items-center justify-between bg-[#F2B729] text-[#141311] p-3.5 rounded-2xl shadow-md border border-[#C98A0C]">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={18} className="text-[#141311]" /> 
                    <h3 className="text-sm font-mono font-bold text-[#141311] uppercase tracking-wider">
                      Rota Santa Luzia x Nordeste
                    </h3>
                    <span className="text-[10px] font-mono font-black bg-[#141311]/12 text-[#141311] border border-[#141311]/25 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      AMARELA (NORDESTE)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNordesteMaximized(!isNordesteMaximized)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[#141311] hover:bg-[#292820] text-[#F2B729] transition-all shadow-xs cursor-pointer border border-[#141311]/30 active:scale-95"
                      title={isNordesteMaximized ? 'Minimizar' : 'Maximizar'}
                    >
                      {isNordesteMaximized ? <ChevronUp size={16} className="stroke-[2.5]" /> : <ChevronDown size={16} className="stroke-[2.5]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => addNewRow('nordeste')}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white hover:bg-amber-50 text-[#141311] border border-[#141311]/20 transition-all shadow-sm cursor-pointer active:scale-95"
                      title="Adicionar Linha"
                    >
                      <Plus size={16} className="stroke-[2.8]" />
                    </button>

                    {nordesteRows.length > 0 && (
                      <button
                        type="button"
                        onClick={() => copySection(nordesteRows, 'ROTA SANTA LUZIA X NORDESTE', setNordesteCopied)}
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs border active:scale-95",
                          nordesteCopied
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-[#141311] hover:bg-[#292820] text-[#F2B729] border-[#141311]/30"
                        )}
                        title={nordesteCopied ? 'Copiado!' : 'Copiar Rota'}
                      >
                        {nordesteCopied ? <Check size={15} className="stroke-[2.5]" /> : <Copy size={15} className="stroke-[2.2]" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => saveNordeste([], true)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[#C91F2D] hover:bg-[#a61723] text-white cursor-pointer shadow-xs transition-all active:scale-95"
                      title="Limpar Rota Nordeste"
                    >
                      <Trash2 size={15} className="stroke-[2.2]" />
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "transition-all duration-300 ease-in-out",
                  isNordesteMaximized ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                )}>
                  {/* Styled Table Frame */}
                  <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-2.5 shadow-sm overflow-hidden relative">
                    {nordesteRows.length === 0 ? (
                      <div className="p-8 flex flex-col items-center justify-center text-center bg-[#F5F0E6] border border-dashed border-[#E6D2A3] rounded-xl text-[#25231F]">
                        <Clipboard className="text-[#C49A45] w-8 h-8 mb-2" />
                        <p className="text-xs text-[#25231F] mb-3 font-bold font-mono">Cole aqui as informações da Rota Nordeste ou adicione manualmente</p>
                        <div className="flex flex-col gap-2.5 w-full max-w-md">
                          <textarea 
                            onPaste={(e) => handlePaste(e, 'nordeste')}
                            placeholder="Ctrl+V aqui para colar escala..."
                            className="w-full h-20 bg-white border border-[#E6D2A3] rounded-xl p-3 text-xs font-mono text-[#25231F] font-bold outline-none placeholder-[#7A756D] focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/40 resize-none shadow-inner"
                          />
                          <button 
                            onClick={() => addNewRow('nordeste')}
                            className="w-full py-2.5 bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] hover:brightness-105 text-[#25231F] rounded-xl text-xs font-mono font-black uppercase transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
                          >
                            <Plus size={14} className="inline mr-1" /> Adicionar linha manualmente
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-[#E6D2A3]/60 shadow-inner">
                        <table className="w-full text-left border-collapse font-sans">
                          <thead>
                            <tr className="bg-[#F5F0E6] border-b border-[#E6D2A3] text-[#25231F] text-[11px] uppercase font-mono font-bold tracking-wider h-11">
                              <th className="px-2 py-2.5 w-8 text-center text-[#C49A45]">#</th>
                              <th className="px-2 py-2.5 w-10 text-center text-[#C49A45]">OK</th>
                              <th className="px-2 py-2.5 w-28 text-center text-[#25231F]">DATA</th>
                              <th className="px-2 py-2.5 text-[#25231F]">MOTORISTA</th>
                              <th className="px-2 py-2.5 w-28 text-center text-[#25231F]">PLACA</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">BAÚ 1</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">BAÚ 2</th>
                              <th className="px-2 py-2.5 text-center text-[#25231F]">TRECHO</th>
                              <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">
                                <div className="flex items-center justify-center gap-1">
                                  <span>ROTAS</span>
                                  <button
                                    type="button"
                                    onClick={() => copyAllSectionRouteCodes(nordesteRows, 'ida', 'Rota Nordeste', 'header-nordeste')}
                                    className={cn(
                                      "p-1 rounded transition-all cursor-pointer border",
                                      copiedRouteKey === 'header-nordeste'
                                        ? "bg-[#292820] text-[#D6A84F] border-[#D6A84F]"
                                        : "bg-transparent text-[#7A756D] border-transparent hover:text-[#25231F] hover:bg-[#E6D2A3]/70 hover:border-[#E6D2A3]"
                                    )}
                                    title="Copiar todos os números de rotas da Rota Nordeste"
                                  >
                                    {copiedRouteKey === 'header-nordeste' ? <Check size={11} className="text-[#D6A84F]" /> : <Copy size={11} />}
                                  </button>
                                </div>
                              </th>
                              <th className="px-2.5 py-2 w-48 text-right text-[#25231F] select-none transition-colors border-l border-[#E6D2A3]/50">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span 
                                    onClick={() => sortRowsByValorNf('nordeste')}
                                    className="cursor-pointer hover:text-[#C49A45] flex items-center gap-1 font-mono font-bold text-[10px] uppercase tracking-wider"
                                    title="Clique para organizar: Valores adicionados no topo, vazios no final"
                                  >
                                    VALOR TOTAL DA NF
                                    <ArrowDownUp size={11} className="text-[#C49A45]" />
                                  </span>
                                  <span className="text-[9px] font-mono text-[#7A756D] font-normal">(R$)</span>
                                </div>
                              </th>
                              <th className="px-2 py-2.5 w-12 text-center text-[#25231F]">AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody className="bg-[#FFFCF6] divide-y divide-[#E6D2A3]/30">
                            {nordesteRows.map((row, i) => {
                              const hasValue = !isValorNfEmpty(row.valorNf);
                              return (
                              <tr key={i} className="text-xs text-[#25231F] group/row font-bold hover:bg-[#F5F0E6]/50 transition-colors">
                                <td className="p-1.5 text-center text-[#C49A45] font-mono text-xs w-8">
                                  {i + 1}
                                </td>
                                <td className="p-1.5 text-center w-10">
                                  <button
                                    type="button"
                                    onClick={() => updateRowValue(i, 'ok', !row.ok, 'nordeste')}
                                    className={cn(
                                      "w-5 h-5 mx-auto flex items-center justify-center rounded border transition-all cursor-pointer",
                                      row.ok 
                                        ? "bg-[#292820] border-[#C49A45] text-[#C49A45] shadow-xs" 
                                        : "bg-[#F5F0E6] border-[#E6D2A3] text-transparent hover:border-[#C49A45]"
                                    )}
                                    title={row.ok ? "Marcar como pendente" : "Marcar como OK"}
                                  >
                                    <Check size={12} className="stroke-[3]" />
                                  </button>
                                </td>
                                <td className="p-1.5">
                                  <input 
                                    type="text"
                                    value={row.dataSaida}
                                    onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'nordeste')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                  />
                                </td>
                                <td className="p-1.5 group/cell">
                                  <div className="flex items-center gap-1.5">
                                    <input 
                                      type="text"
                                      value={row.motorista}
                                      onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'nordeste')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2.5 focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                    />
                                    <button 
                                      onClick={() => safeCopyText(row.motorista)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                      title="Copiar Motorista"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-1.5 text-center">
                                  <input 
                                    type="text"
                                    value={row.placa}
                                    onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'nordeste')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs font-mono tracking-wider"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <input 
                                    type="text"
                                    value={row.bau1}
                                    onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'nordeste')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <input 
                                    type="text"
                                    value={row.bau2}
                                    onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'nordeste')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <input 
                                    type="text"
                                    value={row.trecho}
                                    onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'nordeste')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  {(() => {
                                    const routeCode = findRouteCode(row.trecho, 'ida', routesList);
                                    const keyId = `nordeste-${i}`;
                                    const isCopied = copiedRouteKey === keyId;
                                    const isValid = routeCode && routeCode.trim() !== '' && routeCode !== '---' && routeCode !== '-';
                                    return isValid ? (
                                      <button
                                        type="button"
                                        onClick={() => copySingleRouteCode(routeCode, keyId)}
                                        className={cn(
                                          "group/route relative inline-flex items-center justify-center gap-1 font-extrabold text-xs rounded-md py-1.5 px-2.5 min-w-[58px] text-center transition-all cursor-pointer shadow-xs border select-all",
                                          isCopied
                                            ? "bg-[#292820] text-[#D6A84F] border-[#D6A84F] ring-2 ring-[#D6A84F]/30 scale-105"
                                            : "bg-[#F5F0E6] border-[#E6D2A3] text-[#25231F] hover:bg-[#E6D2A3] hover:border-[#C49A45] hover:shadow-sm active:scale-95"
                                        )}
                                        title={isCopied ? "Número da rota copiado!" : `Clique para copiar a rota: ${routeCode}`}
                                      >
                                        <span className="font-mono tracking-wide">{routeCode}</span>
                                        {isCopied ? (
                                          <Check size={12} className="text-[#D6A84F] shrink-0" />
                                        ) : (
                                          <Copy size={11} className="text-[#7A756D] group-hover/route:text-[#25231F] opacity-60 group-hover/route:opacity-100 transition-opacity shrink-0" />
                                        )}
                                      </button>
                                    ) : (
                                      <div 
                                        className="bg-[#F5F0E6]/70 border border-[#E6D2A3]/60 text-[#7A756D] font-mono font-bold text-xs rounded-md py-1.5 px-2 inline-block min-w-[58px] text-center select-none"
                                        title="Código da rota obtido da página de Rotas"
                                      >
                                        ---
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="p-1.5 text-right font-extrabold group/cell border-l border-[#E6D2A3]/40">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Botão de Importação Direta de PDF para esta Linha */}
                                    <button 
                                      type="button"
                                      onClick={() => openPdfModal('nordeste', i)}
                                      className={cn(
                                        "px-2 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-mono font-extrabold transition-all cursor-pointer shrink-0 shadow-xs border",
                                        hasValue 
                                          ? "bg-[#292820] text-[#E6D2A3] hover:bg-[#38372d] hover:text-white border-[#C49A45]/60" 
                                          : "bg-[#F5F0E6] text-[#25231F] hover:bg-[#292820] hover:text-[#E6D2A3] border-[#E6D2A3] hover:border-[#C49A45]"
                                      )}
                                      title="Importar uma ou várias Notas Fiscais (PDF) para esta linha"
                                    >
                                      <FileText size={11} className={hasValue ? "text-[#C49A45]" : "text-[#7A756D]"} />
                                      <span>PDF</span>
                                    </button>

                                    <button 
                                      type="button"
                                      onClick={() => safeCopyText(row.valorNf)}
                                      className="p-1.5 text-[#7A756D] hover:text-[#25231F] hover:bg-[#F5F0E6] rounded-md transition-colors shrink-0 cursor-pointer"
                                      title="Copiar Valor"
                                    >
                                      <Copy size={12} />
                                    </button>

                                    <div className="relative flex items-center w-full min-w-[110px]">
                                      <span className="absolute left-2 text-[10px] font-mono font-bold text-[#7A756D] pointer-events-none">R$</span>
                                      <input 
                                        type="text"
                                        value={row.valorNf}
                                        onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'nordeste')}
                                        onPaste={(e) => {
                                          e.preventDefault();
                                          const text = e.clipboardData.getData('text');
                                          handlePasteValorNf(text, i, 'nordeste');
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="0,00"
                                        className={cn(
                                          "w-full rounded-md py-1.5 pl-6 pr-2 text-right outline-none transition-all text-xs font-mono font-extrabold border border-[#E6D2A3]",
                                          hasValue 
                                            ? "bg-white text-[#25231F] border-[#C49A45]/40 shadow-xs focus:ring-1 focus:ring-[#C49A45]" 
                                            : "bg-[#F5F0E6] text-stone-500 placeholder-stone-400 focus:bg-white focus:border-[#C49A45] focus:text-[#25231F]"
                                        )}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="p-1.5 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="flex flex-col gap-0.5">
                                      <button 
                                        onClick={() => moveRow(i, 'up', 'nordeste')}
                                        disabled={i === 0}
                                        className={cn(
                                          "p-0.5 rounded transition-colors cursor-pointer",
                                          i === 0 ? "text-stone-300 cursor-not-allowed" : "text-[#292820] hover:text-[#C49A45]"
                                        )}
                                        title="Mover para cima"
                                      >
                                        <ChevronUp size={14} />
                                      </button>
                                      <button 
                                        onClick={() => moveRow(i, 'down', 'nordeste')}
                                        disabled={i === nordesteRows.length - 1}
                                        className={cn(
                                          "p-0.5 rounded transition-colors cursor-pointer",
                                          i === nordesteRows.length - 1 ? "text-stone-300 cursor-not-allowed" : "text-[#292820] hover:text-[#C49A45]"
                                        )}
                                        title="Mover para baixo"
                                      >
                                        <ChevronDown size={14} />
                                      </button>
                                    </div>
                                    <button 
                                      onClick={() => saveNordeste(nordesteRows.filter((_, idx) => idx !== i), true)} 
                                      className="p-1.5 text-[#C91F2D] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Remover Linha"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ); })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>
              )}

              {/* ================= ROTA VESPASIANO (Cor Verde) ================= */}
              {visibleRoutes.vespasiano && (
              <section className="space-y-3 font-sans animate-fade-in">
                <div className="flex items-center justify-between bg-[#166534] text-white p-3.5 rounded-2xl shadow-md border border-[#14532D]">
                  <div className="flex items-center gap-2.5">
                    <Truck size={18} className="text-[#A7F3D0]" />
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                      Rota Vespasiano
                    </h3>
                    <span className="text-[10px] font-mono font-black bg-black/25 text-[#D1FAE5] border border-white/25 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      VERDE (VESPASIANO)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVespasianoMaximized(!isVespasianoMaximized)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/45 text-white transition-all shadow-xs cursor-pointer border border-white/25 active:scale-95"
                      title={isVespasianoMaximized ? 'Minimizar' : 'Maximizar'}
                    >
                      {isVespasianoMaximized ? <ChevronUp size={16} className="stroke-[2.5]" /> : <ChevronDown size={16} className="stroke-[2.5]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => addNewRow('vespasiano')}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white hover:bg-emerald-50 text-[#166534] transition-all shadow-sm cursor-pointer active:scale-95"
                      title="Adicionar Linha"
                    >
                      <Plus size={16} className="stroke-[2.8]" />
                    </button>

                    {vespasianoRows.length > 0 && (
                      <button
                        type="button"
                        onClick={() => copySection(vespasianoRows, 'ROTA VESPASIANO', setVoltaCopied)}
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs border active:scale-95",
                          voltaCopied
                            ? "bg-emerald-500 text-white border-emerald-300"
                            : "bg-black/30 hover:bg-black/45 text-white border-white/25"
                        )}
                        title={voltaCopied ? 'Copiado!' : 'Copiar Rota'}
                      >
                        {voltaCopied ? <Check size={15} className="stroke-[2.5]" /> : <Copy size={15} className="stroke-[2.2]" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => saveVespasiano([], true)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-[#C91F2D] hover:bg-[#a61723] text-white cursor-pointer shadow-xs transition-all active:scale-95"
                      title="Limpar Rota Vespasiano"
                    >
                      <Trash2 size={15} className="stroke-[2.2]" />
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "transition-all duration-300 ease-in-out",
                  isVespasianoMaximized ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                )}>
                  <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-2.5 sm:p-4 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      <div className="relative group">
                        <textarea
                          placeholder="Cole aqui os dados da Rota Vespasiano..."
                          className="w-full h-24 bg-[#F5F0E6] border border-[#E6D2A3] rounded-xl p-3 text-xs text-[#25231F] font-mono font-bold focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all resize-none placeholder-[#7A756D]"
                          onPaste={(e) => handlePaste(e, 'vespasiano')}
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-mono font-bold text-[#7A756D] bg-[#FFFCF6] px-2 py-0.5 rounded-full border border-[#E6D2A3]">Ctrl + V para colar</span>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-3 flex items-end justify-start gap-2.5">

                        <button 
                          onClick={() => addNewRow('vespasiano')}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] hover:brightness-105 text-[#25231F] rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-[#C49A45]/50 active:scale-95"
                        >
                          <Plus size={14} className="stroke-[2.5]" /> Adicionar Linha
                        </button>
                        <button 
                          onClick={() => saveVespasiano([], true)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C91F2D] hover:bg-[#a61723] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                        >
                          <Trash2 size={14} /> Limpar Tudo
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#E6D2A3]/60 shadow-inner">
                      <table className="w-full text-left border-collapse font-sans min-w-[1000px]">
                        <thead>
                          <tr className="bg-[#F5F0E6] border-b border-[#E6D2A3] text-[#25231F] text-[11px] uppercase font-mono font-bold tracking-wider h-11">
                            <th className="px-2 py-2.5 w-8 text-center text-[#C49A45]">#</th>
                            <th className="px-2 py-2.5 w-10 text-center text-[#C49A45]">OK</th>
                            <th className="px-2 py-2.5 w-28 text-center text-[#25231F]">DATA</th>
                            <th className="px-2 py-2.5 text-[#25231F]">MOTORISTA</th>
                            <th className="px-2 py-2.5 w-28 text-center text-[#25231F]">PLACA</th>
                            <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">BAÚ 1</th>
                            <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">BAÚ 2</th>
                            <th className="px-2 py-2.5 text-center text-[#25231F]">TRECHO</th>
                            <th className="px-2 py-2.5 w-24 text-center text-[#25231F]">
                              <div className="flex items-center justify-center gap-1">
                                <span>ROTAS</span>
                                <button
                                  type="button"
                                  onClick={() => copyAllSectionRouteCodes(vespasianoRows, 'ida', 'Rota Vespasiano', 'header-vespasiano')}
                                  className={cn(
                                    "p-1 rounded transition-all cursor-pointer border",
                                    copiedRouteKey === 'header-vespasiano'
                                      ? "bg-[#292820] text-[#D6A84F] border-[#D6A84F]"
                                      : "bg-transparent text-[#7A756D] border-transparent hover:text-[#25231F] hover:bg-[#E6D2A3]/70 hover:border-[#E6D2A3]"
                                  )}
                                  title="Copiar todos os números de rotas da Rota Vespasiano"
                                >
                                  {copiedRouteKey === 'header-vespasiano' ? <Check size={11} className="text-[#D6A84F]" /> : <Copy size={11} />}
                                </button>
                              </div>
                            </th>
                            <th className="px-2.5 py-2 w-48 text-right text-[#25231F] select-none transition-colors border-l border-[#E6D2A3]/50">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span 
                                  onClick={() => sortRowsByValorNf('vespasiano')}
                                  className="cursor-pointer hover:text-[#C49A45] flex items-center gap-1 font-mono font-bold text-[10px] uppercase tracking-wider"
                                  title="Clique para organizar: Valores adicionados no topo, vazios no final"
                                >
                                  VALOR TOTAL DA NF
                                  <ArrowDownUp size={11} className="text-[#C49A45]" />
                                </span>
                                <span className="text-[9px] font-mono text-[#7A756D] font-normal">(R$)</span>
                              </div>
                            </th>
                            <th className="px-2 py-2.5 w-12 text-center text-[#25231F]">AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#FFFCF6] divide-y divide-[#E6D2A3]/30">
                          {vespasianoRows.map((row, i) => {
                            const hasValue = !isValorNfEmpty(row.valorNf);
                            return (
                            <tr key={i} className="text-xs text-[#25231F] group/row font-bold hover:bg-[#F5F0E6]/50 transition-colors">
                              <td className="p-1.5 text-center text-[#C49A45] font-mono text-xs w-8">
                                {i + 1}
                              </td>
                              <td className="p-1.5 text-center w-10">
                                <button
                                  type="button"
                                  onClick={() => updateRowValue(i, 'ok', !row.ok, 'vespasiano')}
                                  className={cn(
                                    "w-5 h-5 mx-auto flex items-center justify-center rounded border transition-all cursor-pointer",
                                    row.ok 
                                      ? "bg-[#292820] border-[#C49A45] text-[#C49A45] shadow-xs" 
                                      : "bg-[#F5F0E6] border-[#E6D2A3] text-transparent hover:border-[#C49A45]"
                                  )}
                                >
                                  <Check size={12} className="stroke-[3]" />
                                </button>
                              </td>
                              <td className="p-1.5">
                                <input 
                                  type="text"
                                  value={row.dataSaida}
                                  onChange={(e) => updateRowValue(i, 'dataSaida', e.target.value, 'vespasiano')}
                                  className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 group/cell">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="text"
                                    value={row.motorista}
                                    onChange={(e) => updateRowValue(i, 'motorista', e.target.value, 'vespasiano')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2.5 focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                  />
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(row.motorista)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                    title="Copiar Motorista"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.placa}
                                  onChange={(e) => updateRowValue(i, 'placa', e.target.value, 'vespasiano')}
                                  className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs font-mono"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.bau1}
                                  onChange={(e) => updateRowValue(i, 'bau1', e.target.value, 'vespasiano')}
                                  className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <input 
                                  type="text"
                                  value={row.bau2}
                                  onChange={(e) => updateRowValue(i, 'bau2', e.target.value, 'vespasiano')}
                                  className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                />
                              </td>
                              <td className="p-1.5 text-center">
                                <div className="flex items-center gap-1 group/trecho">
                                  <input 
                                    type="text"
                                    value={row.trecho}
                                    onChange={(e) => updateRowValue(i, 'trecho', e.target.value, 'vespasiano')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-center focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all uppercase text-xs"
                                  />
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                {(() => {
                                  const routeCode = findRouteCode(row.trecho, 'ida', routesList);
                                  const keyId = `vespasiano-${i}`;
                                  const isCopied = copiedRouteKey === keyId;
                                  const isValid = routeCode && routeCode.trim() !== '' && routeCode !== '---' && routeCode !== '-';
                                  return isValid ? (
                                    <button
                                      type="button"
                                      onClick={() => copySingleRouteCode(routeCode, keyId)}
                                      className={cn(
                                        "group/route relative inline-flex items-center justify-center gap-1 font-extrabold text-xs rounded-md py-1.5 px-2.5 min-w-[58px] text-center transition-all cursor-pointer shadow-xs border select-all",
                                        isCopied
                                          ? "bg-[#292820] text-[#D6A84F] border-[#D6A84F] ring-2 ring-[#D6A84F]/30 scale-105"
                                          : "bg-[#F5F0E6] border-[#E6D2A3] text-[#25231F] hover:bg-[#E6D2A3] hover:border-[#C49A45] hover:shadow-sm active:scale-95"
                                      )}
                                      title={isCopied ? "Número da rota copiado!" : `Clique para copiar a rota: ${routeCode}`}
                                    >
                                      <span className="font-mono tracking-wide">{routeCode}</span>
                                      {isCopied ? (
                                        <Check size={12} className="text-[#D6A84F] shrink-0" />
                                      ) : (
                                        <Copy size={11} className="text-[#7A756D] group-hover/route:text-[#25231F] opacity-60 group-hover/route:opacity-100 transition-opacity shrink-0" />
                                      )}
                                    </button>
                                  ) : (
                                    <div 
                                      className="bg-[#F5F0E6]/70 border border-[#E6D2A3]/60 text-[#7A756D] font-mono font-bold text-xs rounded-md py-1.5 px-2 inline-block min-w-[58px] text-center select-none"
                                      title="Código da rota obtido da página de Rotas"
                                    >
                                      ---
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="p-1.5 text-right font-extrabold group/cell border-l border-[#E6D2A3]/40">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Botão de Importação Direta de PDF para esta Linha */}
                                  <button 
                                    type="button"
                                    onClick={() => openPdfModal('vespasiano', i)}
                                    className={cn(
                                      "px-2 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-mono font-extrabold transition-all cursor-pointer shrink-0 shadow-xs border",
                                      hasValue 
                                        ? "bg-[#292820] text-[#E6D2A3] hover:bg-[#38372d] hover:text-white border-[#C49A45]/60" 
                                        : "bg-[#F5F0E6] text-[#25231F] hover:bg-[#292820] hover:text-[#E6D2A3] border-[#E6D2A3] hover:border-[#C49A45]"
                                    )}
                                    title="Importar uma ou várias Notas Fiscais (PDF) para esta linha"
                                  >
                                    <FileText size={11} className={hasValue ? "text-[#C49A45]" : "text-[#7A756D]"} />
                                    <span>PDF</span>
                                  </button>

                                  <button 
                                    type="button"
                                    onClick={() => safeCopyText(row.valorNf)}
                                    className="p-1.5 text-[#7A756D] hover:text-[#25231F] hover:bg-[#F5F0E6] rounded-md transition-colors shrink-0 cursor-pointer"
                                    title="Copiar Valor"
                                  >
                                    <Copy size={12} />
                                  </button>

                                  <div className="relative flex items-center w-full min-w-[110px]">
                                    <span className="absolute left-2 text-[10px] font-mono font-bold text-[#7A756D] pointer-events-none">R$</span>
                                    <input 
                                      type="text"
                                      value={row.valorNf}
                                      onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'vespasiano')}
                                      onPaste={(e) => {
                                        e.preventDefault();
                                        const text = e.clipboardData.getData('text');
                                        handlePasteValorNf(text, i, 'vespasiano');
                                      }}
                                      onFocus={(e) => e.target.select()}
                                      placeholder="0,00"
                                      className={cn(
                                        "w-full rounded-md py-1.5 pl-6 pr-2 text-right outline-none transition-all text-xs font-mono font-extrabold border border-[#E6D2A3]",
                                        hasValue 
                                          ? "bg-white text-[#25231F] border-[#C49A45]/40 shadow-xs focus:ring-1 focus:ring-[#C49A45]" 
                                          : "bg-[#F5F0E6] text-stone-500 placeholder-stone-400 focus:bg-white focus:border-[#C49A45] focus:text-[#25231F]"
                                      )}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-1.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <div className="flex flex-col gap-0.5">
                                    <button 
                                      onClick={() => moveRow(i, 'up', 'vespasiano')}
                                      disabled={i === 0}
                                      className={cn(
                                        "p-0.5 rounded transition-colors cursor-pointer",
                                        i === 0 ? "text-stone-300 cursor-not-allowed" : "text-[#292820] hover:text-[#C49A45]"
                                      )}
                                      title="Mover para cima"
                                    >
                                      <ChevronUp size={14} />
                                    </button>
                                    <button 
                                      onClick={() => moveRow(i, 'down', 'vespasiano')}
                                      disabled={i === vespasianoRows.length - 1}
                                      className={cn(
                                        "p-0.5 rounded transition-colors cursor-pointer",
                                        i === vespasianoRows.length - 1 ? "text-stone-300 cursor-not-allowed" : "text-[#292820] hover:text-[#C49A45]"
                                      )}
                                      title="Mover para baixo"
                                    >
                                      <ChevronDown size={14} />
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => saveVespasiano(vespasianoRows.filter((_, idx) => idx !== i), true)} 
                                    className="p-1.5 text-[#C91F2D] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Remover Linha"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ); })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
              )}
            </div>

            {/* Calculator Sidebar (Sticky - Acompanha a rolagem da tela para cima e para baixo) */}
            <div className="xl:col-span-1">
              <div className="sticky top-4 space-y-4 font-sans z-20">
                <div className="bg-[#FFFBF2] border border-[#F0E1C6] p-5 rounded-[28px] shadow-[0_10px_30px_rgba(180,140,60,0.08)] relative overflow-hidden flex flex-col font-sans max-h-[calc(100vh-2rem)] overflow-y-auto">
                  {/* Top Header Row: Soma de Valores + PDF + Trash */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[18px] font-extrabold text-[#181715] flex items-center gap-2.5 tracking-tight">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-7 h-7 text-[#E59E14] shrink-0"
                         stroke="currentColor"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3v18h18" />
                        <path d="M7 16v-4" />
                        <path d="M12 16v-6" />
                        <path d="M17 16V9" />
                        <path d="M7 9l5-3 5-2" />
                        <circle cx="17" cy="4" r="1.5" fill="currentColor" />
                        <circle cx="19" cy="21" r="1.5" fill="currentColor" />
                      </svg>
                      <span>Soma de Valores</span>
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openPdfModal('calc')}
                        className="px-3.5 py-1.5 bg-[#1C1B1A] hover:bg-[#2F2E2C] text-white rounded-full text-xs font-extrabold uppercase tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        title="Importar PDFs de NFs para somar na calculadora"
                      >
                        <FileText size={13} className="text-[#F5B82E] stroke-[2.3]" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => saveCalc(['', '', '', '', ''], true)}
                        className="w-8 h-8 rounded-full bg-[#FFFDF9] hover:bg-red-50 text-[#4A4640] hover:text-[#D30C15] border border-[#EDE0C8] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="Resetar calculadora"
                      >
                        <Trash2 size={14} className="stroke-[2]" />
                      </button>
                    </div>
                  </div>

                  {/* Golden Total Consolidado Banner */}
                  <div
                    onClick={copyTotalRaw}
                    className="relative rounded-2xl px-5 py-5 mb-4 overflow-hidden cursor-pointer group/total border border-[#E5B548]/60 border-l-[3px] border-l-[#9E7014] bg-gradient-to-br from-[#FFFDF7] via-[#FCE6A6] to-[#E8A320] shadow-[0_6px_18px_rgba(229,163,32,0.2)] transition-all active:scale-[0.99]"
                    title="Clique para copiar o Total Consolidado"
                  >
                    {/* Barras decorativas douradas crecendo à direita */}
                    <div className="pointer-events-none absolute right-2.5 bottom-0 flex items-end gap-1.5">
                      <div className="w-3.5 h-3 bg-[#D48808]/40 rounded-t-xs" />
                      <div className="w-3.5 h-6 bg-[#D48808]/50 rounded-t-xs" />
                      <div className="w-3.5 h-8 bg-[#C87D04]/55 rounded-t-xs" />
                      <div className="w-4 h-12 bg-[#C87D04]/60 rounded-t-xs" />
                      <div className="w-4 h-16 bg-[#B87000]/65 rounded-t-xs" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center pr-6">
                      <p className="text-[11px] font-extrabold text-[#593A04] uppercase tracking-[0.04em] mb-1">
                        TOTAL CONSOLIDADO
                      </p>
                      <h4 className="text-[26px] sm:text-[28px] font-black tracking-tight text-[#141311] leading-none tabular-nums flex items-baseline justify-center">
                        <span className="text-[#B87A08] mr-1.5 text-[22px] sm:text-[25px] font-extrabold">R$</span>
                        <span>{calculateTotal()}</span>
                      </h4>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-20">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1",
                          totalRawCopied
                            ? "bg-emerald-600 text-white shadow-xs opacity-100"
                            : "bg-white/70 text-[#593A04] opacity-0 group-hover/total:opacity-100"
                        )}
                      >
                        {totalRawCopied ? <Check size={11} className="stroke-[2.5]" /> : <Copy size={11} />}
                        {totalRawCopied && <span>Copiado</span>}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Valores */}
                  <div className="space-y-2.5 flex-1 max-h-[380px] overflow-y-auto pr-0.5">
                    {displayCalcValues.map((val, i) => {
                      const hasVal = Boolean(val && val.trim() !== '' && val.trim() !== '0,00');
                      return (
                        <div
                          key={i}
                          className="group relative flex items-center bg-[#FFF9ED] hover:bg-[#FFFDF8] focus-within:bg-white border border-[#F3E5CA] focus-within:border-[#E5A91B] rounded-2xl px-3.5 py-2.5 transition-all shadow-[0_2px_6px_rgba(0,0,0,0.015)]"
                        >
                          <button
                            type="button"
                            onClick={addCalcLine}
                            className="shrink-0 mr-2.5 cursor-pointer"
                            title="Clique para adicionar nova linha"
                          >
                            <FileText
                              size={18}
                              className={cn(
                                "transition-opacity",
                                hasVal
                                  ? "text-[#F0A818] opacity-100 stroke-[2.2]"
                                  : "text-[#F0A818] opacity-55 stroke-[2]"
                              )}
                            />
                          </button>

                          <span
                            className={cn(
                              "text-sm select-none mr-1 shrink-0",
                              hasVal ? "font-bold text-[#6E4F1D]" : "font-medium text-[#7A746B]"
                            )}
                          >
                            R$
                          </span>

                          <input
                            type="text"
                            value={val}
                            onChange={(e) => updateCalcValue(i, e.target.value)}
                            onPaste={(e) => {
                              e.preventDefault();
                              const text = e.clipboardData.getData('text');
                              handlePasteCalc(text, i);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCalcLine();
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            placeholder="0,00"
                            className={cn(
                              "w-full bg-transparent pr-14 text-sm outline-none transition-all tabular-nums",
                              hasVal
                                ? "text-[#181715] font-extrabold"
                                : "text-[#7A746B] font-medium placeholder:text-[#7A746B]"
                            )}
                          />

                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                            {hasVal && (
                              <button
                                type="button"
                                onClick={() => updateCalcValue(i, '')}
                                className="text-[#4A4640] hover:text-[#181715] p-0.5 transition-colors cursor-pointer"
                                title="Limpar Campo"
                              >
                                <X size={15} className="stroke-[2.3]" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => removeCalcLine(i)}
                              className={cn(
                                "p-0.5 transition-colors cursor-pointer",
                                hasVal
                                  ? "text-[#D30C15] hover:text-[#A3060E]"
                                  : "text-[#6E6A63] hover:text-[#D30C15]"
                              )}
                              title="Remover Linha"
                            >
                              <Trash2 size={15} className="stroke-[2.1]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botões de Ação: + NOVA LINHA e LIMPAR */}
                  <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                    <button
                      type="button"
                      onClick={addCalcLine}
                      className="py-2.5 px-3 rounded-2xl border border-dashed border-[#D6B87C] bg-[#FFFDF8] hover:bg-[#FAF0D8] hover:border-[#C49A45] text-[#25231F] font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                      title="Adicionar nova linha de valor"
                    >
                      <Plus size={14} className="text-[#B8862D] stroke-[2.5]" />
                      <span>NOVA LINHA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => saveCalc(['', '', '', '', ''], true)}
                      className="py-2.5 px-3 rounded-2xl border border-dashed border-[#E8A5A8] bg-[#FDF2F2] hover:bg-[#FCE4E4] hover:border-[#D30C15] text-[#C91F2D] font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                      title="Limpar todos os valores da calculadora"
                    >
                      <Trash2 size={14} className="text-[#C91F2D] stroke-[2.2]" />
                      <span>LIMPAR</span>
                    </button>
                  </div>

                  {/* Botão Desfazer (Ctrl+Z) integrado na base do card */}
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyCount === 0}
                    className={cn(
                      "w-full mt-2.5 py-2.5 px-4 rounded-full border border-[#E5B85B] bg-[#FFFDF8] hover:bg-[#FAF0D8] text-[#181715] font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.99]",
                      historyCount === 0 && "opacity-75 hover:bg-[#FFFDF8]"
                    )}
                    title="Restaurar informação modificada (Ctrl + Z)"
                  >
                    <RefreshCw size={15} className="text-[#F0A818] stroke-[2.4]" />
                    <span>Desfazer (Ctrl+Z)</span>
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* ================= PDF IMPORT MODAL (Master Light) ================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] text-[#25231F] relative">
            
            {/* Modal Header */}
            <div className="bg-[#292820] p-5 text-white flex items-center justify-between border-b border-[#C49A45]/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#FFFCF6] border border-[#E6D2A3] text-[#C49A45] rounded-xl shadow-xs">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-mono font-bold uppercase text-base tracking-wide text-white">
                    Importar Várias Notas Fiscais (PDF)
                  </h3>
                  <p className="text-xs text-[#E6D2A3] font-sans">
                    Extração automática do valor total das NFs e cálculo da soma total
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPdfModalOpen(false)}
                className="p-2 text-[#E6D2A3] hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#FFFCF6]">
              
              {/* File Upload Dropzone */}
              <div className="relative border-2 border-dashed border-[#E6D2A3] hover:border-[#C49A45] bg-[#F5F0E6]/50 hover:bg-[#F5F0E6] rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer group">
                <input 
                  type="file" 
                  multiple 
                  accept="application/pdf,.pdf" 
                  onChange={handlePdfFilesUpload}
                  disabled={isProcessingPdf}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="p-4 bg-gradient-to-br from-[#E6D2A3] to-[#C49A45] text-[#25231F] rounded-full shadow-xs group-hover:scale-105 transition-transform mb-3">
                  <Upload size={28} />
                </div>
                <p className="text-sm font-mono font-bold text-[#25231F] uppercase tracking-wide">
                  Clique para Selecionar ou Arraste os PDFs das NFs
                </p>
                <p className="text-xs text-[#7A756D] mt-1">
                  Você pode selecionar várias notas fiscais em PDF simultaneamente (DANFE / NF-e)
                </p>
              </div>

              {/* Processing Loader */}
              {isProcessingPdf && (
                <div className="bg-[#F5F0E6] border border-[#E6D2A3] rounded-2xl p-4 flex items-center justify-center gap-3 text-[#25231F] font-bold text-sm animate-pulse">
                  <Loader2 size={20} className="animate-spin text-[#C49A45]" />
                  Processando e lendo o valor das NFs em PDF...
                </div>
              )}

              {/* Parsed Results Area */}
              {parsedPdfItems.length > 0 && (
                <div className="space-y-4">
                  {/* Total Banner */}
                  <div className="bg-[#292820] p-5 rounded-2xl text-white shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#C49A45]/40">
                    <div>
                      <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#E6D2A3]">
                        Valor Total Somado ({parsedPdfItems.length} NFs)
                      </p>
                      <h4 className="text-3xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                        <span className="text-[#C49A45] text-xl font-normal mr-1.5">R$</span>
                        {pdfTotalSomadoFormatado}
                      </h4>
                    </div>

                    <button 
                      onClick={copyPdfTotal}
                      className={cn(
                        "px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer border",
                        pdfCopied 
                          ? "bg-emerald-600 border-emerald-400 text-white" 
                          : "bg-[#1a1917] hover:bg-[#38372d] border-[#C49A45]/50 text-[#E6D2A3]"
                      )}
                    >
                      {pdfCopied ? <Check size={16} /> : <Copy size={16} />}
                      {pdfCopied ? 'Copiado!' : 'Copiar Total'}
                    </button>
                  </div>

                  {/* List of imported PDFs */}
                  <div className="border border-[#E6D2A3] rounded-2xl overflow-hidden bg-[#FFFCF6] shadow-xs">
                    <div className="bg-[#F5F0E6] p-3 border-b border-[#E6D2A3] flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-[#25231F] tracking-wider">
                        Notas Importadas ({parsedPdfItems.length})
                      </span>
                      <button 
                        onClick={() => {
                          setParsedPdfItems([]);
                          setPdfTotalSomado(0);
                          setPdfTotalSomadoFormatado('0,00');
                        }}
                        className="text-[10px] font-mono font-bold text-[#C91F2D] hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Limpar Lista
                      </button>
                    </div>

                    <div className="divide-y divide-[#E6D2A3]/30 max-h-56 overflow-y-auto">
                      {parsedPdfItems.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-[#F5F0E6]/50 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className={cn("p-1.5 rounded-lg shrink-0", item.success ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200")}>
                              {item.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#25231F] truncate" title={item.fileName}>
                                {item.fileName}
                              </p>
                              <p className="text-[10px] text-[#7A756D] font-mono">
                                {item.numeroNf !== '---' ? `NF Nº ${item.numeroNf}` : item.error || 'Valor extraído do PDF'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[#C49A45] font-bold text-[10px]">R$</span>
                            <input 
                              type="text" 
                              value={item.valorFormatado}
                              onChange={(e) => updateParsedPdfItemValue(idx, e.target.value)}
                              className="w-28 bg-[#F5F0E6] border border-[#E6D2A3] rounded-lg py-1 px-2 text-right font-mono text-xs font-bold text-[#25231F] outline-none focus:border-[#C49A45]"
                            />
                            <button 
                              onClick={() => removeParsedPdfItem(idx)}
                              className="p-1.5 text-[#C91F2D] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Remover Nota"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-[#F5F0E6] p-5 border-t border-[#E6D2A3] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-xs text-[#25231F] font-mono text-center sm:text-left">
                  {pdfTargetRowIndex !== null ? (
                    <span className="font-bold text-[#C49A45]">
                      Destino: Linha #{pdfTargetRowIndex + 1} da {pdfTargetSection === 'ida' ? 'Rota Ida' : pdfTargetSection === 'volta' ? 'Rota Volta' : pdfTargetSection === 'nordeste' ? 'Rota Nordeste' : pdfTargetSection === 'vespasiano' ? 'Rota Vespasiano' : 'Calculadora'}
                    </span>
                  ) : (
                    <span>Selecione onde adicionar o valor total somado (R$ {pdfTotalSomadoFormatado})</span>
                  )}
                </div>

                {pdfTargetRowIndex !== null && pdfTargetSection !== 'calc' && (
                  <button
                    onClick={() => applyPdfTotalToTarget(pdfTargetSection)}
                    disabled={parsedPdfItems.length === 0}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] hover:brightness-105 disabled:opacity-40 text-[#25231F] font-mono font-black text-xs rounded-xl uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-[#C49A45] flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Check size={14} className="stroke-[3]" />
                    <span>Aplicar Soma (R$ {pdfTotalSomadoFormatado}) na Linha #{pdfTargetRowIndex + 1}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6D2A3]/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-[#7A756D] uppercase">Soma Total para:</span>
                  <button 
                    onClick={() => applyPdfTotalToTarget('ida')}
                    disabled={parsedPdfItems.length === 0}
                    className="px-3 py-1.5 bg-[#292820] hover:bg-[#38372d] disabled:opacity-40 text-[#E6D2A3] font-mono font-bold text-[11px] rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                  >
                    Ida
                  </button>

                  <button 
                    onClick={() => applyPdfTotalToTarget('volta')}
                    disabled={parsedPdfItems.length === 0}
                    className="px-3 py-1.5 bg-[#C91F2D] hover:bg-[#a61723] disabled:opacity-40 text-white font-mono font-bold text-[11px] rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C91F2D]"
                  >
                    Volta
                  </button>

                  <button 
                    onClick={() => applyPdfTotalToTarget('nordeste')}
                    disabled={parsedPdfItems.length === 0}
                    className="px-3 py-1.5 bg-[#292820] hover:bg-[#38372d] disabled:opacity-40 text-[#E6D2A3] font-mono font-bold text-[11px] rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                  >
                    Nordeste
                  </button>

                  <button 
                    onClick={() => applyPdfTotalToTarget('vespasiano')}
                    disabled={parsedPdfItems.length === 0}
                    className="px-3 py-1.5 bg-[#292820] hover:bg-[#38372d] disabled:opacity-40 text-[#E6D2A3] font-mono font-bold text-[11px] rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                  >
                    Vespasiano
                  </button>

                  <button 
                    onClick={() => applyPdfTotalToTarget('calc')}
                    disabled={parsedPdfItems.length === 0}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] hover:brightness-105 disabled:opacity-40 text-[#25231F] font-mono font-black text-[11px] rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/50"
                  >
                    Calculadora
                  </button>
                </div>

                {parsedPdfItems.length > 1 && (
                  <button 
                    onClick={() => applyMultiplePdfRowsToTarget(pdfTargetSection === 'calc' ? 'ida' : pdfTargetSection)}
                    className="px-3 py-1.5 bg-[#FFFCF6] hover:bg-white text-[#25231F] border border-[#E6D2A3] hover:border-[#C49A45] font-mono font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                    title="Cria uma linha separada para cada uma das notas fiscais importadas"
                  >
                    + Criar 1 Linha por NF
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Notepad Sliding Panel */}
      <AnimatePresence>
        {isNotepadOpen && (
          <div className="fixed inset-0 z-50 flex justify-end font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotepadOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-[#FFFCF6] shadow-2xl flex flex-col border-l border-[#E6D2A3]"
            >
              <div className="p-5 border-b border-[#C49A45]/40 flex items-center justify-between bg-[#292820] text-white">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#FFFCF6] text-[#C49A45] rounded-xl border border-[#E6D2A3]">
                    <StickyNote size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-tight">Bloco de Notas</h2>
                    <p className="text-[10px] text-[#E6D2A3] font-bold uppercase tracking-widest font-mono">Lembretes e Avisos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNotepadOpen(false)}
                  className="p-2 text-[#E6D2A3] hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 border-b border-[#E6D2A3] bg-[#FFFCF6]">
                <div className="flex gap-2">
                  <textarea
                    placeholder="Digite seu lembrete aqui..."
                    className="flex-1 min-h-[100px] p-4 bg-[#F5F0E6] border border-[#E6D2A3] rounded-xl text-sm text-[#25231F] focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all resize-none font-medium placeholder-[#7A756D]"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        saveNote(newNoteText);
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => saveNote(newNoteText)}
                    disabled={!newNoteText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#292820] hover:bg-[#38372d] border border-[#C49A45]/40 disabled:opacity-40 text-[#E6D2A3] rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus size={16} className="text-[#C49A45]" /> Adicionar
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F5F0E6]/30">
                {notes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#7A756D] space-y-3 opacity-60">
                    <div className="p-4 bg-[#FFFCF6] border border-[#E6D2A3] rounded-full">
                      <StickyNote size={32} className="text-[#C49A45]" />
                    </div>
                    <p className="text-xs font-bold font-mono uppercase tracking-widest">Nenhum lembrete salvo</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-[#FFFCF6] p-4 rounded-2xl border border-[#E6D2A3] shadow-xs hover:shadow-md transition-all"
                      key={note.id}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-[#25231F] font-medium whitespace-pre-wrap leading-relaxed">
                            {note.text}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-[9px] font-mono font-bold text-[#7A756D] uppercase tracking-tighter">
                            <CalendarIcon size={10} className="text-[#C49A45]" />
                            <span>
                              {new Date(note.timestamp).toLocaleDateString('pt-BR')} às {new Date(note.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-1.5 text-[#C91F2D] hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Interativo para Escolher Qual Rota Irá Aparecer */}
      <AnimatePresence>
        {isRouteSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl p-6 sm:p-7 shadow-2xl max-w-lg w-full text-[#25231F] space-y-5"
            >
              {/* Header do Modal */}
              <div className="flex items-start justify-between border-b border-[#E6D2A3]/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#292820] flex items-center justify-center text-[#D6A84F] shadow-sm shrink-0">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-mono font-black text-[#25231F] uppercase tracking-wide">
                      Qual rota irá aparecer?
                    </h3>
                    <p className="text-xs text-[#7A756D] font-mono mt-0.5">
                      Selecione quais rotas você deseja visualizar no monitoramento:
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRouteSelectorOpen(false)}
                  className="p-1.5 text-[#7A756D] hover:text-[#25231F] hover:bg-[#F5F0E6] rounded-xl transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Lista das 4 opções de rotas */}
              <div className="space-y-2.5">
                {[
                  {
                    id: 'ida' as const,
                    title: 'ROTA IDA',
                    tag: 'PRETO & DOURADO / VIP',
                    tagClass: 'bg-[#0A0D10] text-[#E5B84B] border-[#C49A45]/50',
                    icon: TrendingUp,
                    iconColor: 'text-[#0A0D10]'
                  },
                  {
                    id: 'volta' as const,
                    title: 'ROTA VOLTA',
                    tag: 'VERMELHA',
                    tagClass: 'bg-[#A80C14] text-white border-[#7F090F]',
                    icon: Download,
                    iconColor: 'text-[#A80C14]'
                  },
                  {
                    id: 'nordeste' as const,
                    title: 'ROTA SANTA LUZIA X NORDESTE',
                    tag: 'AMARELA (NORDESTE)',
                    tagClass: 'bg-[#F2B729] text-[#141311] border-[#C98A0C]',
                    icon: TrendingUp,
                    iconColor: 'text-[#C98A0C]'
                  },
                  {
                    id: 'vespasiano' as const,
                    title: 'ROTA VESPASIANO',
                    tag: 'VERDE (VESPASIANO)',
                    tagClass: 'bg-[#166534] text-white border-[#14532D]',
                    icon: Truck,
                    iconColor: 'text-[#166534]'
                  }
                ].map(opt => {
                  const isChecked = visibleRoutes[opt.id];
                  const IconComponent = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleVisibleRoute(opt.id)}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs select-none",
                        isChecked
                          ? "bg-[#F5F0E6] border-[#C49A45] ring-2 ring-[#C49A45]/30 shadow-sm"
                          : "bg-white border-[#E6D2A3]/70 hover:border-[#C49A45]/60 hover:bg-[#F5F0E6]/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
                          isChecked
                            ? "bg-[#292820] border-[#292820] text-[#D6A84F]"
                            : "bg-white border-[#E6D2A3]"
                        )}>
                          {isChecked && <Check size={13} className="stroke-[3]" />}
                        </div>
                        <IconComponent size={16} className={opt.iconColor} />
                        <div>
                          <span className="text-xs font-mono font-black text-[#25231F] block">
                            {opt.title}
                          </span>
                          <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded border inline-block mt-0.5", opt.tagClass)}>
                            {opt.tag}
                          </span>
                        </div>
                      </div>

                      <span className={cn(
                        "text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg",
                        isChecked
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                          : "text-[#7A756D] bg-[#F5F0E6] border border-[#E6D2A3]"
                      )}>
                        {isChecked ? 'Visível' : 'Oculto'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Ações rápidas e confirmação */}
              <div className="pt-2 border-t border-[#E6D2A3]/60 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllRoutesVisibility(true)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold text-[#25231F] bg-[#F5F0E6] hover:bg-[#E6D2A3] border border-[#E6D2A3] transition-colors cursor-pointer"
                  >
                    Exibir Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllRoutesVisibility(false)}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold text-[#C91F2D] bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                  >
                    Ocultar Todas
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRouteSelectorOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] hover:brightness-105 text-[#25231F] transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Concluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast feedback when Ctrl+Z is activated */}
      <AnimatePresence>
        {showUndoToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#292820] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#C49A45]/40"
          >
            <RotateCcw className="text-[#C49A45] w-5 h-5" />
            <div>
              <p className="text-xs font-bold font-sans">Informação restaurada!</p>
              <p className="text-[10px] text-[#E6D2A3] font-sans">Desfazer (Ctrl + Z) aplicado com sucesso.</p>
            </div>
          </motion.div>
        )}
        {routeToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#292820] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#C49A45]/50 backdrop-blur-md"
          >
            <div className="w-7 h-7 rounded-lg bg-[#D6A84F]/20 flex items-center justify-center text-[#D6A84F] shrink-0 border border-[#D6A84F]/40">
              <Check size={16} />
            </div>
            <div>
              <p className="text-xs font-bold font-sans text-white">{routeToast.message}</p>
              {routeToast.submessage && (
                <p className="text-[10px] text-[#E6D2A3] font-mono">{routeToast.submessage}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
