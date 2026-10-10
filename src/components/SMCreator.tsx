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
  Route
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { safeCopyText, safeCopyHtmlAndText } from '../utils/clipboard';
import { ref, onValue, set, update } from 'firebase/database';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch (e) {
    console.error('Error initializing PDF worker src:', e);
  }
}

let isWorkerConfigured = false;
const ensurePdfWorker = async () => {
  if (isWorkerConfigured) return;
  if (typeof window === 'undefined') return;

  try {
    const version = pdfjsLib.version || '3.11.174';
    const cdnUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
    const response = await fetch(cdnUrl);
    if (response.ok) {
      const workerCode = await response.text();
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl;
    }
  } catch (err) {
    console.warn('Fallback workerSrc:', err);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  } finally {
    isWorkerConfigured = true;
  }
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

const formatNfValue = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '0,00';
  const amount = parseFloat(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const parseNfNumeric = (val: string | undefined | null): number => {
  if (!val) return 0;
  const digits = val.replace(/\D/g, '');
  if (!digits) return 0;
  return parseFloat(digits) / 100;
};

export const isValorNfEmpty = (val: string | undefined | null): boolean => {
  if (!val) return true;
  const trimmed = val.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '--') return true;
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
  const headerBg = type === 'ida' ? '#080A0C' : type === 'volta' ? '#801414' : type === 'nordeste' ? '#000000' : '#166534';
  const headerBorder = type === 'ida' ? '#D9AD5A' : headerBg;
  const headerColor = type === 'ida' ? '#E5C27A' : '#ffffff';
  
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
  const [idaRows, setIdaRows] = useState<SMRow[]>([]);
  const [voltaRows, setVoltaRows] = useState<SMRow[]>([]);
  const [nordesteRows, setNordesteRows] = useState<SMRow[]>([]);
  const [vespasianoRows, setVespasianoRows] = useState<SMRow[]>([]);
  const [calcValues, setCalcValues] = useState<string[]>(['']);
  const [routesList, setRoutesList] = useState<RouteItem[]>(DEFAULT_ROUTES);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isVespasianoMaximized, setIsVespasianoMaximized] = useState(true);
  const [isIdaMaximized, setIsIdaMaximized] = useState(true);
  const [isVoltaMaximized, setIsVoltaMaximized] = useState(true);
  const [isNordesteMaximized, setIsNordesteMaximized] = useState(true);
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    set(ref(db, 'sm_creator_data'), null);
  }, []);

  useEffect(() => {
    const smRef = ref(db, 'sm_creator_data');
    const unsubscribeSM = onValue(smRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.ida) setIdaRows(sortSMRowsByValorNf(data.ida));
        if (data.volta) setVoltaRows(data.volta);
        if (data.nordeste) setNordesteRows(data.nordeste);
        if (data.vespasiano) setVespasianoRows(data.vespasiano);
        if (data.calc) setCalcValues(data.calc);
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
    set(ref(db, 'sm_creator_data/ida'), rows);
  };

  const saveVolta = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setVoltaRows(rows);
    set(ref(db, 'sm_creator_data/volta'), rows);
  };

  const saveNordeste = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setNordesteRows(rows);
    set(ref(db, 'sm_creator_data/nordeste'), rows);
  };

  const saveVespasiano = (rows: SMRow[], forcePush = false) => {
    pushHistory(forcePush);
    setVespasianoRows(rows);
    set(ref(db, 'sm_creator_data/vespasiano'), rows);
  };

  const saveCalc = (vals: string[], forcePush = false) => {
    pushHistory(forcePush);
    setCalcValues(vals);
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

    for (const arquivo of arquivos) {
      try {
        const arrayBuffer = await arquivo.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        interface SpatialItem {
          str: string;
          x: number;
          y: number;
        }

        interface PageExtractionResult {
          pageNum: number;
          valorNumerico: number | null;
          valorTexto: string | null;
        }

        const pageResults: PageExtractionResult[] = [];
        let numeroNf = '---';

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
                y: transform[5] || 0
              });
            }
          }

          const rawPageText = pageStrs.join(' ');

          // Agrupa itens em linhas na página atual (coordenada Y com tolerância de 6pt)
          const lineGroups: Array<{ y: number; items: SpatialItem[] }> = [];
          for (const item of pageItems) {
            let group = lineGroups.find(g => Math.abs(g.y - item.y) <= 6);
            if (!group) {
              group = { y: item.y, items: [] };
              lineGroups.push(group);
            }
            group.items.push(item);
          }

          lineGroups.sort((a, b) => b.y - a.y); // Do topo para o rodapé

          const lines = lineGroups.map(g => {
            g.items.sort((a, b) => a.x - b.x); // Da esquerda para a direita
            return {
              y: g.y,
              items: g.items,
              fullText: g.items.map(i => i.str).join(' ')
            };
          });

          const fullSpatialText = lines.map(l => l.fullText).join('\n');
          const combinedPageText = rawPageText + '\n' + fullSpatialText;

          // Extrai o Número da NF se ainda não encontrado
          if (numeroNf === '---') {
            const matchNf = combinedPageText.match(/Nº[\s\.:]*(\d[\d\.\-]*\d|\d+)/i) || 
                            combinedPageText.match(/NF-e[\s\.:]*(\d+)/i) ||
                            combinedPageText.match(/NOTA\s+FISCAL[\s\S]{0,30}?(\d{3,9})/i);
            if (matchNf && matchNf[1]) {
              numeroNf = matchNf[1].replace(/\D/g, '');
            }
          }

          let pageValTexto: string | null = null;
          let pageValNumerico: number | null = null;

          // ESTRATÉGIA 1: Correspondência direta quando a etiqueta e o valor estão adjacentes
          const matchDirect1 = rawPageText.match(/VALOR\s+TOTAL\s+(?:DA\s+)?NF[^\d]*?([\d\.]+\,\d{2})/i) ||
                               fullSpatialText.match(/VALOR\s+TOTAL\s+(?:DA\s+)?NF[^\d]*?([\d\.]+\,\d{2})/i);
          if (matchDirect1 && matchDirect1[1]) {
            pageValTexto = matchDirect1[1];
            pageValNumerico = parseFloat(pageValTexto.replace(/\./g, '').replace(',', '.'));
          }

          // ESTRATÉGIA 2: Análise espacial por linhas
          if (pageValNumerico === null) {
            for (let idx = 0; idx < lines.length; idx++) {
              const line = lines[idx];
              if (/VALOR\s+TOTAL\s+(?:DA\s+)?NF/i.test(line.fullText)) {
                // Tenta encontrar valor na mesma linha após a etiqueta
                const labelIdx = line.fullText.search(/VALOR\s+TOTAL\s+(?:DA\s+)?NF/i);
                const afterLabel = line.fullText.substring(labelIdx);
                const afterMatch = afterLabel.match(/([\d\.]+\,\d{2})/);
                if (afterMatch) {
                  pageValTexto = afterMatch[1];
                  pageValNumerico = parseFloat(pageValTexto.replace(/\./g, '').replace(',', '.'));
                  break;
                }

                // Senão procura nas 3 linhas imediatamente abaixo
                const labelItem = line.items.slice().reverse().find(i => /NF|TOTAL|VALOR/i.test(i.str)) || line.items[line.items.length - 1];
                const labelX = labelItem ? labelItem.x : 400;

                for (let offset = 1; offset <= 3; offset++) {
                  if (idx + offset < lines.length) {
                    const subLine = lines[idx + offset];
                    const numbersInSubLine: Array<{ numStr: string; val: number; x: number }> = [];
                    
                    for (const item of subLine.items) {
                      const m = item.str.match(/\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g);
                      if (m) {
                        for (const numStr of m) {
                          const val = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
                          numbersInSubLine.push({ numStr, val, x: item.x });
                        }
                      }
                    }

                    if (numbersInSubLine.length > 0) {
                      const rightAligned = numbersInSubLine.filter(n => n.x >= labelX - 100);
                      if (rightAligned.length > 0) {
                        rightAligned.sort((a, b) => b.x - a.x);
                        pageValTexto = rightAligned[0].numStr;
                        pageValNumerico = rightAligned[0].val;
                      } else {
                        const lastNum = numbersInSubLine[numbersInSubLine.length - 1];
                        pageValTexto = lastNum.numStr;
                        pageValNumerico = lastNum.val;
                      }
                      break;
                    }
                  }
                }
                if (pageValNumerico !== null) break;
              }
            }
          }

          // ESTRATÉGIA 3: Região do quadro "CÁLCULO DO IMPOSTO"
          if (pageValNumerico === null) {
            const regexBlock = /(?:CALCULO\s+DO\s+IMPOSTO|VALOR\s+TOTAL\s+PRODUTOS)[\s\S]{0,350}/i;
            const blockMatch = combinedPageText.match(regexBlock);
            if (blockMatch) {
              const blockText = blockMatch[0];
              const allCurrencies = blockText.match(/\b\d{1,3}(?:\.\d{3})*,\d{2}\b/g);
              if (allCurrencies && allCurrencies.length > 0) {
                const lastVal = allCurrencies[allCurrencies.length - 1];
                pageValTexto = lastVal;
                pageValNumerico = parseFloat(lastVal.replace(/\./g, '').replace(',', '.'));
              }
            }
          }

          // ESTRATÉGIA 4: Fallback por regex geral
          if (pageValNumerico === null) {
            const matchFallback = combinedPageText.match(/VALOR\s+TOTAL\s+(?:DA\s+)?NF[\s\S]{0,150}?([\d\.]+\,\d{2})/i);
            if (matchFallback && matchFallback[1]) {
              pageValTexto = matchFallback[1];
              pageValNumerico = parseFloat(pageValTexto.replace(/\./g, '').replace(',', '.'));
            }
          }

          pageResults.push({
            pageNum,
            valorNumerico: pageValNumerico,
            valorTexto: pageValTexto
          });
        }

        // Seleciona o melhor resultado entre todas as folhas do PDF
        let valorNumericoResult: number | null = null;
        let valorTextoResult: string | null = null;

        // 1. Procura por valores positivos (> 0). Dá preferência ao valor preenchido na última folha que tiver valor > 0
        const nonZeroResults = pageResults.filter(p => p.valorNumerico !== null && p.valorNumerico > 0);
        if (nonZeroResults.length > 0) {
          const chosen = nonZeroResults[nonZeroResults.length - 1];
          valorNumericoResult = chosen.valorNumerico;
          valorTextoResult = chosen.valorTexto;
        } else {
          // 2. Se nenhuma folha tinha valor > 0, pega o primeiro resultado válido (ex: 0,00)
          const anyResult = pageResults.find(p => p.valorNumerico !== null);
          if (anyResult) {
            valorNumericoResult = anyResult.valorNumerico;
            valorTextoResult = anyResult.valorTexto;
          }
        }

        if (valorNumericoResult !== null && valorTextoResult !== null) {
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
      const newExtracted = await processarNotasFiscaisClient(fileArray);
      const newItems = [...parsedPdfItems, ...newExtracted];
      const newTotal = newItems.reduce((acc, curr) => acc + (curr.valor || 0), 0);
      const newTotalFormatted = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(newTotal);

      setParsedPdfItems(newItems);
      setPdfTotalSomado(newTotal);
      setPdfTotalSomadoFormatado(newTotalFormatted);
    } catch (err) {
      console.error('Erro ao ler arquivos PDF:', err);
      alert('Erro ao processar os arquivos PDF.');
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

  const applyPdfTotalToTarget = (section: 'ida' | 'volta' | 'vespasiano' | 'calc') => {
    const totalValStr = pdfTotalSomadoFormatado;

    if (section === 'calc') {
      if (calcValues.length === 1 && (!calcValues[0] || calcValues[0] === '')) {
        saveCalc([totalValStr], true);
      } else {
        saveCalc([...calcValues, totalValStr], true);
      }
    } else {
      const targetRows = section === 'ida' ? idaRows : section === 'volta' ? voltaRows : vespasianoRows;
      const saveFunc = section === 'ida' ? saveIda : section === 'volta' ? saveVolta : saveVespasiano;

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
      const val = parseFloat(curr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
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

  const addCalcLine = () => saveCalc([...calcValues, ''], true);
  const updateCalcValue = (index: number, val: string) => {
    const newVals = [...calcValues];
    newVals[index] = val;
    saveCalc(newVals);
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
          <h3 style="color: #000000; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">--- ROTA SANTA LUZIA X NORDESTE ---</h3>
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
    const color = isNordeste ? '#000000' : title.includes('IDA') ? '#14325c' : title.includes('VOLTA') ? '#7f1d1d' : '#166534';
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
    <div className="w-full relative pb-10 space-y-4 font-sans text-[#25231F] text-left bg-[#F5F0E6] p-4 sm:p-6 rounded-3xl border border-[#E6D2A3] shadow-lg">
      
      {internalView === 'codes' || view === 'codes' ? (
        <div className="relative z-10 bg-[#FFFCF6] p-6 rounded-3xl border border-[#E6D2A3] shadow-md text-[#25231F]">{renderCodesTable()}</div>
      ) : (
        <div className="relative z-10 space-y-4 animate-fade-in text-left">
          
          {/* ========================================================================= */}
          {/* EXECUTIVE DASHBOARD GRAPHIC (CENTRAL DE ESCALA & ASSUNTOS PADRONIZADOS)    */}
          {/* ========================================================================= */}
          <div className="w-full shrink-0 space-y-3.5">
            {/* Header: ROTA DE TRANSPORTE - BRASIL / CENTRAL DE ESCALA */}
            <div className="relative w-full h-[68px] bg-[#292820] rounded-2xl overflow-hidden flex items-center justify-between px-5 sm:px-6 shadow-md border border-[#C49A45]/40">
              <div className="relative z-10 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E6D2A3] to-[#C49A45] flex items-center justify-center text-[#25231F] shadow-sm shrink-0">
                  <Route size={22} className="stroke-[2.5]" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[11px] font-black tracking-widest text-[#C49A45] uppercase">
                    ROTA DE TRANSPORTE - BRASIL
                  </span>
                  <span className="text-[22px] font-black tracking-tight text-[#FFFCF6] uppercase mt-0.5 font-heading">
                    CENTRAL DE ESCALA
                  </span>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-2">
                <button
                  onClick={handleClearAllSM}
                  className="px-3.5 py-1.5 text-xs font-black rounded-xl border bg-red-950/80 hover:bg-red-900 text-red-200 border-red-800/60 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Limpar todas as informações de teste"
                >
                  <Trash2 size={13} /> Limpar Dados
                </button>
                {onBack && (
                  <button
                    onClick={onBack}
                    className="px-3.5 py-1.5 text-xs font-black rounded-xl border bg-[#1a1917] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/40 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    title="Voltar ao menu"
                  >
                    <ArrowLeft size={13} /> Voltar
                  </button>
                )}
              </div>
            </div>

            {/* Assuntos de E-mail Padronizados (2 Cards em destaque) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
              {/* Card 1: Rota Ida Subject */}
              <div className="bg-[#292820] border border-[#C49A45]/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Mail size={14} className="text-[#E6D2A3]" />
                    <span className="text-[11px] font-black text-[#FFFCF6] uppercase tracking-wider">
                      ASSUNTOS DE E-MAIL PADRONIZADOS
                    </span>
                    <span className="text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.2 rounded-full bg-[#C49A45]/20 text-[#E6D2A3] border border-[#C49A45]/40">
                      AUTO
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#C49A45] block mb-0.5">SM ROTA IDA</span>
                  <span className="text-[11px] font-mono font-bold text-[#FFFCF6] truncate block">{getSubjectIda()}</span>
                </div>
                <button
                  type="button"
                  onClick={copySubjectIda}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border",
                    subjectIdaCopied
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-[#1a1917] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/50 shadow-xs active:scale-95"
                  )}
                >
                  {subjectIdaCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{subjectIdaCopied ? "OK" : "COPIAR"}</span>
                </button>
              </div>

              {/* Card 2: Rota Volta Subject */}
              <div className="bg-[#292820] border border-[#C91F2D]/50 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#C91F2D] block mb-1">SM ROTA VOLTA</span>
                  <span className="text-[11px] font-mono font-bold text-[#FFFCF6] truncate block">{getSubjectVolta()}</span>
                </div>
                <button
                  type="button"
                  onClick={copySubjectVolta}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border",
                    subjectVoltaCopied
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-[#C91F2D] hover:bg-[#a61723] text-white border-[#C91F2D]/60 shadow-xs active:scale-95"
                  )}
                >
                  {subjectVoltaCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{subjectVoltaCopied ? "OK" : "COPIAR"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Main Work Area */}
            <div className="xl:col-span-3 space-y-4">
              
              {/* ROTA IDA (Preto com Dourado) */}
              {(internalView === 'all' || internalView === 'ida') && (
              <section className="space-y-3 font-sans">
                <div className="flex items-center justify-between bg-[#FFFCF6] text-[#25231F] p-3.5 rounded-2xl shadow-sm border border-[#E6D2A3]">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={18} className="text-[#C49A45]" /> 
                    <h3 className="text-sm font-mono font-bold text-[#25231F] uppercase tracking-wider">
                      Rota Ida
                    </h3>
                    <span className="text-[10px] font-mono font-black bg-[#F5F0E6] text-[#C49A45] border border-[#E6D2A3] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      PRETO & DOURADO / VIP
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsIdaMaximized(!isIdaMaximized)}
                      className="px-3 py-1.5 rounded-xl text-[10px] bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                    >
                      {isIdaMaximized ? 'Minimizar' : 'Maximizar'}
                    </button>

                    {/* Botão de Ordenar por Valor NF */}
                    {idaRows.length > 0 && (
                      <button
                        onClick={() => sortRowsByValorNf('ida')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/40 font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                        title="Mandar informações vazias para o final e valores adicionados para o topo"
                      >
                        <ArrowDownUp size={12} className="text-[#C49A45]" />
                        <span>Ordenar por Valor</span>
                      </button>
                    )}

                    <button 
                      onClick={() => addNewRow('ida')}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] text-[#25231F] font-mono font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:brightness-105 active:scale-95"
                    >
                      <Plus size={13} className="stroke-[2.5]" /> Add Linha
                    </button>

                    {idaRows.length > 0 && (
                      <button 
                        onClick={copyIdaToVolta}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                        title="Enviar dados da Ida para Volta (Invertendo Trecho)"
                      >
                        <ArrowRightLeft size={12} className="text-[#C49A45]" /> Enviar para Volta
                      </button>
                    )}

                    {idaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(idaRows, 'ROTA IDA', setIdaCopied)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs border",
                          idaCopied 
                            ? "bg-emerald-600 text-white border-emerald-500" 
                            : "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/40"
                        )}
                      >
                        {idaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {idaCopied ? 'Copiado!' : 'Copiar Ida'}
                      </button>
                    )}

                    <button onClick={() => saveIda([], true)} className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-[#C91F2D] hover:bg-[#a61723] text-white uppercase tracking-tight cursor-pointer shadow-xs transition-colors">Limpar</button>
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
                              <th className="px-2 py-2.5 w-20 text-center text-[#25231F]">ROTAS</th>
                              <th 
                                onClick={() => sortRowsByValorNf('ida')}
                                className="px-2 py-2.5 w-36 text-right text-[#25231F] hover:text-[#C49A45] cursor-pointer select-none group/sort transition-colors"
                                title="Clique para organizar: Valores adicionados no topo, vazios no final"
                              >
                                <div className="flex items-center justify-end gap-1.5">
                                  <span>VALOR NF</span>
                                  <ArrowDownUp size={12} className="text-[#C49A45] group-hover/sort:scale-125 transition-transform" />
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
                                    <div className="bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold text-xs rounded-md py-1.5 px-2 inline-block min-w-[55px] text-center shadow-xs" title="Código da rota obtido da página de Rotas">
                                      {findRouteCode(row.trecho, 'ida', routesList)}
                                    </div>
                                  </td>
                                  <td className="p-1.5 text-right font-extrabold group/cell">
                                    <div className="flex items-center justify-end gap-1">
                                      <button 
                                        onClick={() => openPdfModal('ida', i)}
                                        className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                        title="Importar PDFs de NFs para esta linha"
                                      >
                                        <FileText size={12} className="text-[#C49A45]" />
                                      </button>
                                      <button 
                                        onClick={() => safeCopyText(row.valorNf)}
                                        className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                        title="Copiar Valor"
                                      >
                                        <Copy size={12} />
                                      </button>
                                      <input 
                                        type="text"
                                        value={row.valorNf}
                                        onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'ida')}
                                        placeholder="0,00"
                                        className={cn(
                                          "w-full rounded-md py-1.5 px-2 text-right outline-none transition-all text-xs font-mono font-extrabold border border-[#E6D2A3]",
                                          hasValue 
                                            ? "bg-[#FDFBF7] text-[#25231F] focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]" 
                                            : "bg-[#F5F0E6] text-stone-500 placeholder-stone-400 focus:bg-white focus:border-[#C49A45] focus:text-[#25231F]"
                                        )}
                                      />
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

              {/* ROTA VOLTA (Vermelha) */}
              {(internalView === 'all' || internalView === 'volta') && (
              <section className="space-y-3 font-sans animate-fade-in">
                <div className="flex items-center justify-between bg-[#FFFCF6] text-[#25231F] p-3.5 rounded-2xl shadow-sm border border-[#C91F2D]/30">
                  <div className="flex items-center gap-2.5">
                    <Download size={18} className="rotate-180 text-[#C91F2D]" /> 
                    <h3 className="text-sm font-mono font-bold text-[#25231F] uppercase tracking-wider">
                      Rota Volta
                    </h3>
                    <span className="text-[10px] font-mono font-black bg-[#C91F2D]/10 text-[#C91F2D] border border-[#C91F2D]/30 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      VERMELHA
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsVoltaMaximized(!isVoltaMaximized)}
                      className="px-3 py-1.5 rounded-xl text-[10px] bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                    >
                      {isVoltaMaximized ? 'Minimizar' : 'Maximizar'}
                    </button>
                    {voltaRows.length > 0 && (
                      <button
                        onClick={() => sortRowsByValorNf('volta')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/40 font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                        title="Mandar informações vazias para o final e valores adicionados para o topo"
                      >
                        <ArrowDownUp size={12} className="text-[#C49A45]" />
                        <span>Ordenar por Valor</span>
                      </button>
                    )}
                    <button 
                      onClick={() => addNewRow('volta')}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] bg-gradient-to-r from-[#C91F2D] to-[#990c11] text-white font-mono font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:brightness-110 active:scale-95"
                    >
                      <Plus size={13} className="stroke-[2.5]" /> Add Linha
                    </button>
                    {voltaRows.length > 0 && (
                      <button 
                        onClick={() => copySection(voltaRows, 'ROTA VOLTA', setVoltaCopied)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs border",
                          voltaCopied 
                            ? "bg-emerald-600 text-white border-emerald-500" 
                            : "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/40"
                        )}
                      >
                        {voltaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {voltaCopied ? 'Copiado!' : 'Copiar Volta'}
                      </button>
                    )}
                    <button onClick={() => saveVolta([], true)} className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-[#C91F2D] hover:bg-[#a61723] text-white uppercase tracking-tight cursor-pointer shadow-xs transition-colors">Limpar</button>
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
                              <th className="px-2 py-2.5 w-20 text-center text-[#25231F]">ROTAS</th>
                              <th 
                                onClick={() => sortRowsByValorNf('volta')}
                                className="px-2 py-2.5 w-36 text-right text-[#25231F] hover:text-[#C91F2D] cursor-pointer select-none group/sort transition-colors"
                                title="Clique para organizar: Valores adicionados no topo, vazios no final"
                              >
                                <div className="flex items-center justify-end gap-1.5">
                                  <span>VALOR NF</span>
                                  <ArrowDownUp size={12} className="text-[#C91F2D] group-hover/sort:scale-125 transition-transform" />
                                </div>
                              </th>
                              <th className="px-2 py-2.5 w-12 text-center text-[#25231F]">AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody className="bg-[#FFFCF6] divide-y divide-[#E6D2A3]/30">
                            {voltaRows.map((row, i) => (
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
                                  <div className="bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold text-xs rounded-md py-1.5 px-2 inline-block min-w-[55px] text-center shadow-xs" title="Código da rota obtido da página de Rotas">
                                    {findRouteCode(row.trecho, 'volta', routesList)}
                                  </div>
                                </td>
                                <td className="p-1.5 text-right font-extrabold group/cell">
                                  <div className="flex items-center justify-end gap-1">
                                    <button 
                                      onClick={() => openPdfModal('volta', i)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                      title="Importar PDFs de NFs para esta linha"
                                    >
                                      <FileText size={12} className="text-[#C49A45]" />
                                    </button>
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(row.valorNf)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                      title="Copiar Valor"
                                    >
                                      <Copy size={12} />
                                    </button>
                                    <input 
                                      type="text"
                                      value={row.valorNf}
                                      onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'volta')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-right focus:bg-white focus:border-[#C91F2D] focus:ring-1 focus:ring-[#C91F2D]/30 outline-none transition-all text-xs"
                                    />
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>
              )}

              {/* ROTA SANTA LUZIA X NORDESTE */}
              {(internalView === 'all' || internalView === 'nordeste') && (
              <section className="space-y-3 font-sans animate-fade-in">
                <div className="flex items-center justify-between bg-[#FFFCF6] text-[#25231F] p-3.5 rounded-2xl shadow-sm border border-[#E6D2A3]">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={18} className="text-[#C49A45]" /> 
                    <h3 className="text-sm font-mono font-bold text-[#25231F] uppercase tracking-wider">
                      Rota Santa Luzia x Nordeste
                    </h3>
                    <span className="text-[10px] font-mono font-black bg-[#F5F0E6] text-[#C49A45] border border-[#E6D2A3] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      NORDESTE
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsNordesteMaximized(!isNordesteMaximized)}
                      className="px-3 py-1.5 rounded-xl text-[10px] bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                    >
                      {isNordesteMaximized ? 'Minimizar' : 'Maximizar'}
                    </button>
                    {nordesteRows.length > 0 && (
                      <button
                        onClick={() => sortRowsByValorNf('nordeste')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/40 font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer group/sortBtn"
                        title="Mandar informações vazias para o final e valores adicionados para o topo"
                      >
                        <ArrowDownUp size={12} className="text-[#C49A45] group-hover/sortBtn:scale-125 transition-transform" />
                        <span>Ordenar por Valor</span>
                      </button>
                    )}
                    <button 
                      onClick={() => addNewRow('nordeste')}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] text-[#25231F] font-mono font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:brightness-105 active:scale-95"
                    >
                      <Plus size={13} className="stroke-[2.5]" /> Add Linha
                    </button>
                    {nordesteRows.length > 0 && (
                      <button 
                        onClick={() => copySection(nordesteRows, 'ROTA SANTA LUZIA X NORDESTE', setNordesteCopied)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs border",
                          nordesteCopied 
                            ? "bg-emerald-600 text-white border-emerald-500" 
                            : "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/40"
                        )}
                      >
                        {nordesteCopied ? <Check size={12} /> : <Copy size={12} />}
                        {nordesteCopied ? 'Copiado!' : 'Copiar Rota'}
                      </button>
                    )}
                    <button onClick={() => saveNordeste([], true)} className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-[#C91F2D] hover:bg-[#a61723] text-white uppercase tracking-tight cursor-pointer shadow-xs transition-colors">Limpar</button>
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
                              <th className="px-2 py-2.5 w-20 text-center text-[#25231F]">ROTAS</th>
                              <th 
                                onClick={() => sortRowsByValorNf('nordeste')}
                                className="px-2 py-2.5 w-36 text-right text-[#25231F] hover:text-[#C49A45] cursor-pointer select-none group/sort transition-colors"
                                title="Clique para organizar: Valores adicionados no topo, vazios no final"
                              >
                                <div className="flex items-center justify-end gap-1.5">
                                  <span>VALOR NF</span>
                                  <ArrowDownUp size={12} className="text-[#C49A45] group-hover/sort:scale-125 transition-transform" />
                                </div>
                              </th>
                              <th className="px-2 py-2.5 w-12 text-center text-[#25231F]">AÇÕES</th>
                            </tr>
                          </thead>
                          <tbody className="bg-[#FFFCF6] divide-y divide-[#E6D2A3]/30">
                            {nordesteRows.map((row, i) => (
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
                                  <div className="bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold text-xs rounded-md py-1.5 px-2 inline-block min-w-[55px] text-center shadow-xs" title="Código da rota obtido da página de Rotas">
                                    {findRouteCode(row.trecho, 'ida', routesList)}
                                  </div>
                                </td>
                                <td className="p-1.5 text-right font-extrabold group/cell">
                                  <div className="flex items-center justify-end gap-1">
                                    <button 
                                      onClick={() => openPdfModal('nordeste', i)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                      title="Importar PDFs de NFs para esta linha"
                                    >
                                      <FileText size={12} className="text-[#C49A45]" />
                                    </button>
                                    <button 
                                      onClick={() => safeCopyText(row.valorNf)}
                                      className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                      title="Copiar Valor"
                                    >
                                      <Copy size={12} />
                                    </button>
                                    <input 
                                      type="text"
                                      value={row.valorNf}
                                      onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'nordeste')}
                                      className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold rounded-md py-1.5 px-2 text-right focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all text-xs font-mono"
                                    />
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </section>
              )}

              {/* ================= ROTA VESPASIANO ================= */}
              {(internalView === 'all' || internalView === 'vespasiano') && (
              <section className="space-y-3 font-sans animate-fade-in">
                <div className="flex items-center justify-between bg-[#FFFCF6] text-[#25231F] p-3.5 rounded-2xl shadow-sm border border-[#E6D2A3]">
                  <div className="flex items-center gap-2.5">
                    <Truck size={18} className="text-[#C49A45]" />
                    <h3 className="text-sm font-mono font-bold text-[#25231F] uppercase tracking-wider">
                      Rota Vespasiano
                    </h3>
                    <span className="text-[10px] font-mono font-black bg-[#F5F0E6] text-[#C49A45] border border-[#E6D2A3] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      VESPASIANO
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsVespasianoMaximized(!isVespasianoMaximized)}
                      className="px-3 py-1.5 rounded-xl text-[10px] bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                    >
                      {isVespasianoMaximized ? 'Minimizar' : 'Maximizar'}
                    </button>
                    {vespasianoRows.length > 0 && (
                      <button 
                        onClick={() => copySection(vespasianoRows, 'ROTA VESPASIANO', setVoltaCopied)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs border",
                          voltaCopied 
                            ? "bg-emerald-600 text-white border-emerald-500" 
                            : "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/40"
                        )}
                      >
                        {voltaCopied ? <Check size={12} /> : <Copy size={12} />}
                        {voltaCopied ? 'Copiado!' : 'Copiar Rota'}
                      </button>
                    )}
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
                        {vespasianoRows.length > 0 && (
                          <button 
                            onClick={() => sortRowsByValorNf('vespasiano')}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#292820] hover:bg-[#38372d] border border-[#C49A45]/40 text-[#E6D2A3] rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs group/sortBtn"
                            title="Mandar informações vazias para o final e valores adicionados para o topo"
                          >
                            <ArrowDownUp size={12} className="text-[#C49A45] group-hover/sortBtn:scale-125 transition-transform" />
                            <span>Ordenar por Valor</span>
                          </button>
                        )}
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
                            <th className="px-2 py-2.5 w-20 text-center text-[#25231F]">ROTAS</th>
                            <th 
                              onClick={() => sortRowsByValorNf('vespasiano')}
                              className="px-2 py-2.5 w-36 text-right text-[#25231F] hover:text-[#C49A45] cursor-pointer select-none group/th transition-colors"
                              title="Clique para organizar: Valores adicionados no topo, vazios no final"
                            >
                              <div className="flex items-center justify-end gap-1.5">
                                <span>VALOR NF</span>
                                <ArrowDownUp size={12} className="text-[#C49A45] group-hover/th:scale-125 transition-transform" />
                              </div>
                            </th>
                            <th className="px-2 py-2.5 w-12 text-center text-[#25231F]">AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#FFFCF6] divide-y divide-[#E6D2A3]/30">
                          {vespasianoRows.map((row, i) => (
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
                                <div className="bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-extrabold text-xs rounded-md py-1.5 px-2 inline-block min-w-[55px] text-center shadow-xs">
                                  {findRouteCode(row.trecho, 'ida', routesList)}
                                </div>
                              </td>
                              <td className="p-1.5 text-right font-extrabold group/cell">
                                <div className="flex items-center justify-end gap-1">
                                  <button 
                                    onClick={() => openPdfModal('vespasiano', i)}
                                    className="opacity-0 group-hover/cell:opacity-100 p-1.5 bg-[#F5F0E6] hover:bg-white border border-[#E6D2A3] rounded text-[#25231F] transition-all shrink-0 cursor-pointer shadow-xs"
                                    title="Importar PDFs de NFs para esta linha"
                                  >
                                    <FileText size={12} className="text-[#C49A45]" />
                                  </button>
                                  <input 
                                    type="text"
                                    value={row.valorNf}
                                    onChange={(e) => updateRowValue(i, 'valorNf', e.target.value, 'vespasiano')}
                                    className="w-full bg-[#F5F0E6] border border-[#E6D2A3] text-[#25231F] font-mono font-extrabold rounded-md py-1.5 px-2 text-right focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all text-xs"
                                  />
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
                          ))}
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
                <div className="bg-[#FFFCF6] border border-[#E6D2A3] p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col font-sans max-h-[calc(100vh-2rem)] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-[#25231F] flex items-center gap-2 uppercase tracking-wide">
                      <Calculator size={16} className="text-[#C49A45]" />
                      Soma de Valores
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => openPdfModal('calc')}
                        className="px-2.5 py-1 bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] rounded-xl text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer border border-[#C49A45]/40"
                        title="Importar PDFs de NFs para somar na calculadora"
                      >
                        <FileText size={11} className="text-[#C49A45]" /> PDF
                      </button>
                      <button 
                        onClick={() => saveCalc(calcValues.map(() => ''), true)}
                        className="p-1 text-[#7A756D] hover:text-[#C91F2D] transition-colors cursor-pointer"
                        title="Resetar calculadora"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#F5F0E6] border border-[#E6D2A3] rounded-xl p-4 mb-4 text-center relative group/total text-[#25231F] shadow-xs">
                    <p className="text-[10px] font-mono font-bold text-[#7A756D] uppercase tracking-widest mb-1">Total Consolidado</p>
                    <h4 className="text-2xl font-mono font-black tracking-tight text-[#25231F]">
                      <span className="text-[#C49A45] mr-1 text-sm font-bold">R$</span>
                      {calculateTotal()}
                    </h4>
                    <div className="absolute top-2.5 right-2.5">
                      <button 
                        onClick={copyTotalRaw}
                        className={cn(
                          "p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer border",
                          totalRawCopied 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "bg-[#FFFCF6] border-[#E6D2A3] text-[#25231F] hover:bg-white shadow-xs"
                        )}
                        title="Copiar Valor"
                      >
                        {totalRawCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 flex-1 max-h-[380px] overflow-y-auto pr-0.5">
                    {calcValues.map((val, i) => (
                      <div key={i} className="group relative flex items-center">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C49A45] font-bold text-xs">R$</div>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => updateCalcValue(i, e.target.value)}
                          placeholder="0,00"
                          className="w-full bg-[#F5F0E6] border border-[#E6D2A3] rounded-xl pl-9 pr-16 py-2 text-xs text-[#25231F] font-mono font-bold focus:bg-white focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 outline-none transition-all placeholder:text-[#A8A39A]"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {val && (
                            <button 
                              onClick={() => updateCalcValue(i, '')}
                              className="text-[#7A756D] hover:text-[#25231F] p-1 transition-all cursor-pointer"
                              title="Limpar Campo"
                            >
                              <X size={12} />
                            </button>
                          )}
                          {calcValues.length > 1 && (
                            <button 
                              onClick={() => saveCalc(calcValues.filter((_, idx) => idx !== i), true)}
                              className="text-[#A8A39A] hover:text-[#C91F2D] p-1 transition-all cursor-pointer"
                              title="Remover Linha"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button 
                        onClick={addCalcLine}
                        className="py-2.5 border border-dashed border-[#E6D2A3] hover:border-[#C49A45] rounded-xl text-[#25231F] hover:bg-[#F5F0E6] flex items-center justify-center gap-1.5 transition-all text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FFFCF6] cursor-pointer shadow-2xs"
                      >
                        <Plus size={14} className="text-[#C49A45]" /> Nova Linha
                      </button>

                      <button 
                        onClick={() => saveCalc(calcValues.map(() => ''))}
                        className="py-2.5 border border-dashed border-[#C91F2D]/30 hover:border-[#C91F2D] text-[#C91F2D] rounded-xl flex items-center justify-center gap-1.5 transition-all text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C91F2D]/5 hover:bg-[#C91F2D]/10 cursor-pointer shadow-2xs"
                        title="Limpar todos os valores adicionados"
                      >
                        <Trash2 size={14} /> Limpar
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E6D2A3]/40 bg-[#F5F0E6] p-3 rounded-xl text-[10px] text-[#7A756D] font-medium">
                    A soma aceita vírgulas e pontos. Atualizada em tempo real.
                  </div>
                </div>

                <div className="bg-[#FFFCF6] border border-[#E6D2A3] p-3.5 flex items-center justify-between group cursor-pointer hover:border-[#C49A45] transition-all rounded-xl shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CalendarIcon size={16} className="text-[#C49A45] group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[10px] font-mono font-bold text-[#7A756D] uppercase tracking-wider">Última Atualização</p>
                      <p className="text-xs font-bold text-[#25231F]">Agora mesmo</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#7A756D] group-hover:text-[#25231F] transition-colors" />
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
            <div className="bg-[#F5F0E6] p-5 border-t border-[#E6D2A3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#25231F] font-mono text-center sm:text-left">
                {pdfTargetRowIndex !== null ? (
                  <span>Aplicando na linha #{pdfTargetRowIndex + 1} ({pdfTargetSection === 'ida' ? 'Rota Ida' : pdfTargetSection === 'volta' ? 'Rota Volta' : 'Rota Vespasiano'})</span>
                ) : (
                  <span>Selecione onde aplicar o valor somado (R$ {pdfTotalSomadoFormatado})</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => applyPdfTotalToTarget('ida')}
                  disabled={parsedPdfItems.length === 0}
                  className="px-3.5 py-2 bg-[#292820] hover:bg-[#38372d] disabled:opacity-40 text-[#E6D2A3] font-mono font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                >
                  Preencher Ida
                </button>

                <button 
                  onClick={() => applyPdfTotalToTarget('volta')}
                  disabled={parsedPdfItems.length === 0}
                  className="px-3.5 py-2 bg-[#C91F2D] hover:bg-[#a61723] disabled:opacity-40 text-white font-mono font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C91F2D]"
                >
                  Preencher Volta
                </button>

                <button 
                  onClick={() => applyPdfTotalToTarget('vespasiano')}
                  disabled={parsedPdfItems.length === 0}
                  className="px-3.5 py-2 bg-[#292820] hover:bg-[#38372d] disabled:opacity-40 text-[#E6D2A3] font-mono font-bold text-xs rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/40"
                >
                  Preencher Vespasiano
                </button>

                <button 
                  onClick={() => applyPdfTotalToTarget('calc')}
                  disabled={parsedPdfItems.length === 0}
                  className="px-3.5 py-2 bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] hover:brightness-105 disabled:opacity-40 text-[#25231F] font-mono font-black text-xs rounded-xl uppercase tracking-wider transition-all shadow-xs cursor-pointer border border-[#C49A45]/50"
                >
                  Lançar Calculadora
                </button>
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

      {/* Floating Action Bar - Undo Action */}
      <div className="fixed bottom-4 right-6 z-40">
        <button 
          onClick={handleUndo}
          disabled={historyCount === 0}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg border cursor-pointer",
            historyCount > 0 
              ? "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/60 shadow-xl active:scale-95" 
              : "bg-[#292820]/80 text-[#7A756D] border-[#C49A45]/20 backdrop-blur-md opacity-70 cursor-not-allowed"
          )}
          title="Restaurar informação modificada (Ctrl + Z)"
        >
          <RotateCcw size={13} className={historyCount > 0 ? "text-[#C49A45]" : "text-[#7A756D]"} />
          <span>Desfazer (Ctrl+Z)</span>
        </button>
      </div>

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
      </AnimatePresence>
    </div>
  );
}
