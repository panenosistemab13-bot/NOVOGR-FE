import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Copy,
  Check,
  Plus,
  Trash2,
  Search,
  MapPin,
  ClipboardPaste,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  Eraser,
  Sparkles,
  Users,
  Maximize2,
  Minimize2,
  MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set } from '../utils/rtdbWithUndo';
import { logAuditAction, logDebouncedEdit } from '../utils/auditHistory';

interface ListaEmailsProps {
  onBack?: () => void;
}

export interface EmailUnit {
  id: string;
  destino: string;
  paraRaw: string;
  updatedAt: number;
}

const STORAGE_KEY = 'pgr_lista_emails_units_v1';

const QUICK_DESTINOS = [
  'BRASILIAS',
  'SANTA LUZIA',
  'GUARULHOS',
  'ARAÇARIGUAMA',
  'RIO DE JANEIRO',
  'CURITIBA',
  'LONDRINA',
  'MANAUS',
  'RECIFE',
  'CUIABÁ',
  'MONTES CLAROS',
  'VIANA',
  'SALVADOR',
  'GRAVATAÍ',
  'SUMARÉ'
];

const DEFAULT_UNITS: EmailUnit[] = [
  {
    id: 'unit_brasilias_default',
    destino: 'BRASILIAS',
    paraRaw: '',
    updatedAt: Date.now()
  }
];

function extractEmails(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  const matches = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (!matches) return [];
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const item of matches) {
    const clean = item.trim().toLowerCase();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      unique.push(clean);
    }
  }
  return unique;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeEmailFromRaw(raw: string, emailToRemove: string): string {
  const remaining = extractEmails(raw).filter((e) => e !== emailToRemove);
  const regex = new RegExp(`[^\\n,;]*<?${escapeRegExp(emailToRemove)}>?\\s*[;,]?`, 'gi');
  const cleaned = raw
    .replace(regex, '')
    .split('\n')
    .map((line) => line.replace(/^[;,\s]+|[;,\s]+$/g, ''))
    .filter((line) => line.length > 0)
    .join('\n');
  if (extractEmails(cleaned).length === remaining.length) {
    return cleaned;
  }
  return remaining.join('; ');
}

export default function ListaEmails({ onBack: _onBack }: ListaEmailsProps) {
  const [units, setUnits] = useState<EmailUnit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore localStorage read error
    }
    return DEFAULT_UNITS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitName, setEditingUnitName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [expandedParaIds, setExpandedParaIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with Firebase Realtime Database
  useEffect(() => {
    const unitsRef = ref(rtdb, 'lista_emails_units');
    const unsubscribe = onValue(unitsRef, (snapshot) => {
      const data = snapshot.val();
      if (Array.isArray(data) && data.length > 0) {
        setUnits(data);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // ignore
        }
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        const list = Object.values(data) as EmailUnit[];
        if (list.length > 0) {
          setUnits(list);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          } catch {
            // ignore
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const persistUnits = (nextUnits: EmailUnit[]) => {
    setUnits(nextUnits);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUnits));
    } catch {
      // ignore
    }
    try {
      set(ref(rtdb, 'lista_emails_units'), nextUnits).catch(() => {});
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const copyToClipboard = async (id: string, text: string, feedbackLabel: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedId(id);
    showToast(feedbackLabel);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleAddUnit = (destinoInput?: string) => {
    const cleanName = (destinoInput ?? newUnitName).trim().toUpperCase();
    if (!cleanName) {
      showToast('Informe o nome do destino ou unidade.');
      return;
    }

    const exists = units.some((u) => u.destino.trim().toUpperCase() === cleanName);
    if (exists) {
      showToast(`A unidade "${cleanName}" já está na lista.`);
      return;
    }

    const newUnit: EmailUnit = {
      id: `unit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      destino: cleanName,
      paraRaw: '',
      updatedAt: Date.now()
    };

    persistUnits([newUnit, ...units]);
    logAuditAction({
      action: 'ADD',
      module: 'Lista de E-mails',
      target: cleanName,
      details: `Adicionou unidade "${cleanName}"`
    });
    if (!destinoInput) setNewUnitName('');
    showToast(`Unidade "${cleanName}" adicionada.`);
  };

  const handleUpdatePara = (unitId: string, paraRaw: string, skipDebounceLog = false) => {
    const targetUnit = units.find((u) => u.id === unitId);
    const next = units.map((u) =>
      u.id === unitId ? { ...u, paraRaw, updatedAt: Date.now() } : u
    );
    persistUnits(next);
    if (!skipDebounceLog && targetUnit) {
      const count = extractEmails(paraRaw).length;
      logDebouncedEdit(`lista_emails_para_${unitId}`, {
        action: 'EDIT',
        module: 'Lista de E-mails',
        target: targetUnit.destino,
        details: `Editou campo PARA (${count} e-mail${count === 1 ? '' : 's'} identificados)`
      });
    }
  };

  const handlePasteFromClipboard = async (unitId: string, currentRaw: string) => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText || !clipText.trim()) {
        showToast('A área de transferência está vazia.');
        return;
      }
      const combined = currentRaw.trim()
        ? `${currentRaw.trim()}\n${clipText.trim()}`
        : clipText.trim();
      handleUpdatePara(unitId, combined, true);
      const count = extractEmails(combined).length;
      const targetUnit = units.find((u) => u.id === unitId);
      logAuditAction({
        action: 'ADD',
        module: 'Lista de E-mails',
        target: targetUnit?.destino || 'Unidade',
        details: `Colou destinatários no campo PARA (${count} e-mail${count === 1 ? '' : 's'} no total)`
      });
      showToast(`Texto colado no campo PARA (${count} e-mail${count === 1 ? '' : 's'} identificados).`);
    } catch {
      showToast('Use Ctrl+V diretamente dentro do campo PARA.');
    }
  };

  const handleOrganizePara = (unitId: string, paraRaw: string) => {
    const emails = extractEmails(paraRaw);
    if (emails.length === 0) {
      showToast('Nenhum e-mail válido encontrado para organizar.');
      return;
    }
    handleUpdatePara(unitId, emails.join('; '), true);
    const targetUnit = units.find((u) => u.id === unitId);
    logAuditAction({
      action: 'EDIT',
      module: 'Lista de E-mails',
      target: targetUnit?.destino || 'Unidade',
      details: `Organizou/padronizou ${emails.length} e-mail${emails.length === 1 ? '' : 's'}`
    });
    showToast(`${emails.length} e-mail${emails.length === 1 ? '' : 's'} padronizado(s) sem duplicidade.`);
  };

  const handleRemoveSingleEmail = (unitId: string, emailToRemove: string) => {
    const target = units.find((u) => u.id === unitId);
    if (!target) return;
    const nextRaw = removeEmailFromRaw(target.paraRaw, emailToRemove);
    handleUpdatePara(unitId, nextRaw, true);
    logAuditAction({
      action: 'DELETE',
      module: 'Lista de E-mails',
      target: target.destino,
      details: `Removeu e-mail "${emailToRemove}"`
    });
    showToast(`Removido: ${emailToRemove}`);
  };

  const handleClearUnitEmails = (unitId: string) => {
    const target = units.find((u) => u.id === unitId);
    handleUpdatePara(unitId, '', true);
    if (target) {
      logAuditAction({
        action: 'DELETE',
        module: 'Lista de E-mails',
        target: target.destino,
        details: `Limpou todos os e-mails do campo PARA de ${target.destino}`
      });
    }
    showToast('Campo PARA limpo.');
  };

  const handleStartEditUnit = (unit: EmailUnit) => {
    setEditingUnitId(unit.id);
    setEditingUnitName(unit.destino);
  };

  const handleSaveEditUnit = (unitId: string) => {
    const cleanName = editingUnitName.trim().toUpperCase();
    if (!cleanName) {
      setEditingUnitId(null);
      return;
    }
    const prevUnit = units.find((u) => u.id === unitId);
    const next = units.map((u) =>
      u.id === unitId ? { ...u, destino: cleanName, updatedAt: Date.now() } : u
    );
    persistUnits(next);
    setEditingUnitId(null);
    if (prevUnit && prevUnit.destino !== cleanName) {
      logAuditAction({
        action: 'EDIT',
        module: 'Lista de E-mails',
        target: cleanName,
        details: `Renomeou unidade de "${prevUnit.destino}" para "${cleanName}"`
      });
    }
    showToast(`Destino atualizado para "${cleanName}".`);
  };

  const handleDeleteUnit = (unitId: string) => {
    const target = units.find((u) => u.id === unitId);
    const next = units.filter((u) => u.id !== unitId);
    persistUnits(next);
    setConfirmDeleteId(null);
    if (target) {
      logAuditAction({
        action: 'DELETE',
        module: 'Lista de E-mails',
        target: target.destino,
        details: `Excluiu unidade "${target.destino}"`
      });
      showToast(`Unidade "${target.destino}" removida.`);
    }
  };

  const toggleCollapse = (unitId: string) => {
    setCollapsedIds((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleParaField = (unitId: string) => {
    setExpandedParaIds((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const parsedUnits = useMemo(() => {
    return units.map((unit) => ({
      ...unit,
      emails: extractEmails(unit.paraRaw)
    }));
  }, [units]);

  const filteredUnits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return parsedUnits;
    return parsedUnits.filter(
      (u) =>
        u.destino.toLowerCase().includes(q) ||
        u.paraRaw.toLowerCase().includes(q) ||
        u.emails.some((email) => email.includes(q))
    );
  }, [parsedUnits, searchQuery]);

  const totalUniqueEmails = useMemo(() => {
    const all = new Set<string>();
    parsedUnits.forEach((u) => u.emails.forEach((e) => all.add(e)));
    return all.size;
  }, [parsedUnits]);

  const unusedQuickDestinos = useMemo(() => {
    const existingSet = new Set(units.map((u) => u.destino.trim().toUpperCase()));
    return QUICK_DESTINOS.filter((d) => !existingSet.has(d));
  }, [units]);

  return (
    <div
      className="relative w-full min-h-[calc(100vh-76px)] bg-[#F9F8F6] text-[#1D1E22] p-4 sm:p-7 select-none overflow-x-hidden overflow-y-auto"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif" }}
    >
      {/* Decoração ambiente elegante (Carmesim & Dourado 3 Corações) */}
      <svg
        viewBox="0 0 360 220"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-0 right-0 w-72 sm:w-96 h-auto opacity-85 z-0"
      >
        <path d="M360 0 L140 0 C210 62 282 96 360 132 Z" fill="url(#leTopCrimson)" />
        <path d="M360 118 C278 86 206 52 136 0 L112 0 C188 64 264 102 360 144 Z" fill="url(#leTopGold)" />
        <defs>
          <linearGradient id="leTopCrimson" x1="360" y1="0" x2="140" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C0A12" />
            <stop offset="60%" stopColor="#C11924" />
            <stop offset="100%" stopColor="#9B0F19" />
          </linearGradient>
          <linearGradient id="leTopGold" x1="360" y1="140" x2="112" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BA8523" />
            <stop offset="50%" stopColor="#F8DE8A" />
            <stop offset="100%" stopColor="#CFA03E" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        viewBox="0 0 360 220"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none select-none fixed bottom-0 left-0 w-64 sm:w-80 h-auto opacity-80 z-0"
      >
        <path d="M0 220 L0 100 C70 150 155 186 240 220 Z" fill="url(#leBotLeftCrimson)" />
        <path d="M0 92 C76 144 162 182 260 220 L236 220 C145 184 68 148 0 106 Z" fill="url(#leBotLeftGold)" />
        <defs>
          <linearGradient id="leBotLeftCrimson" x1="0" y1="220" x2="220" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C0A12" />
            <stop offset="60%" stopColor="#C11924" />
            <stop offset="100%" stopColor="#9B0F19" />
          </linearGradient>
          <linearGradient id="leBotLeftGold" x1="0" y1="92" x2="260" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BA8523" />
            <stop offset="50%" stopColor="#F8DE8A" />
            <stop offset="100%" stopColor="#CFA03E" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        viewBox="0 0 360 220"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none select-none fixed bottom-0 right-0 w-64 sm:w-80 h-auto opacity-85 z-0"
      >
        <path d="M360 220 L360 88 C280 144 195 182 105 220 Z" fill="url(#leBotRightCrimson)" />
        <path d="M360 76 C272 138 188 180 86 220 L114 220 C206 182 286 144 360 92 Z" fill="url(#leBotRightGold)" />
        <defs>
          <linearGradient id="leBotRightCrimson" x1="105" y1="220" x2="360" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B0E17" />
            <stop offset="55%" stopColor="#C11924" />
            <stop offset="100%" stopColor="#6E070D" />
          </linearGradient>
          <linearGradient id="leBotRightGold" x1="86" y1="220" x2="360" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BA8523" />
            <stop offset="50%" stopColor="#F8DE8A" />
            <stop offset="100%" stopColor="#CFA03E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg"
          >
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto space-y-5">
        {/* 1. CABEÇALHO PRINCIPAL */}
        <header className="relative overflow-hidden bg-gradient-to-r from-[#FFFFFF] via-[#FFFDF9] to-[#FCF3DF] rounded-2xl p-4 sm:px-6 sm:py-5 border border-[#DFC078] shadow-[0_12px_30px_-14px_rgba(84,54,18,0.18)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Onda decorativa interna no canto direito do cabeçalho */}
          <svg
            viewBox="0 0 380 120"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none select-none absolute right-0 top-0 h-full w-auto opacity-95"
          >
            <path d="M220 120 C290 95 335 45 380 0 L380 120 Z" fill="url(#leHdrCrimson)" />
            <path d="M180 120 C268 100 328 50 380 0 L380 14 C332 62 272 106 196 120 Z" fill="url(#leHdrGold)" />
            <defs>
              <linearGradient id="leHdrCrimson" x1="220" y1="120" x2="380" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8E0E17" />
                <stop offset="100%" stopColor="#B81621" />
              </linearGradient>
              <linearGradient id="leHdrGold" x1="180" y1="120" x2="380" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D6A845" />
                <stop offset="50%" stopColor="#FAEA9C" />
                <stop offset="100%" stopColor="#BE8A26" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative z-10 flex items-center gap-4">
            {/* Emblema Dourado 3D com Envelope + Arroba Carmesim */}
            <div className="relative w-14 h-12 shrink-0 flex items-center justify-center">
              <div className="w-12 h-10 rounded-xl bg-gradient-to-br from-[#FCE89E] via-[#DFB042] to-[#A67317] border border-[#F9DF8B] shadow-[0_8px_18px_-6px_rgba(140,94,18,0.45)] flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#5E3A08] stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-1 right-0 w-6 h-6 rounded-full bg-gradient-to-b from-[#CF1D27] to-[#7B0910] border-2 border-[#FCE394] text-white text-[11px] font-black flex items-center justify-center shadow-md">
                @
              </span>
            </div>

            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B665D]">
                CENTRAL GR • DESTINATÁRIOS OPERACIONAIS
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17191E] leading-tight">
                Lista de E-mails
              </h1>
              <p className="text-xs text-[#5E5A52] mt-0.5 tabular-nums font-medium">
                {units.length} {units.length === 1 ? 'unidade cadastrada' : 'unidades cadastradas'} • {totalUniqueEmails} {totalUniqueEmails === 1 ? 'e-mail único' : 'e-mails únicos'} no total
              </p>
            </div>
          </div>

          {/* Barra de Busca em Pílula */}
          <div className="relative z-10 flex items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#6B665D] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar destino ou e-mail..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#FFFDF8] border border-[#DFC078] text-xs font-medium text-[#1E1D1A] placeholder:text-[#8E8678] shadow-[inset_0_2px_6px_rgba(84,54,18,0.08)] focus:outline-none focus:border-[#B98321] focus:ring-2 focus:ring-[#D4AF37]/25"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 2. BARRA DE NOVA UNIDADE / DESTINO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#FDF8EC] rounded-2xl border border-[#DFC078] shadow-[0_10px_26px_-14px_rgba(84,54,18,0.16)]">
          {/* Ornamento discreto no canto inferior direito */}
          <svg
            viewBox="0 0 84 44"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none select-none absolute bottom-0 right-0 w-20 h-11 opacity-85"
          >
            <path d="M84 44 L84 4 C66 26 42 36 8 44 Z" fill="url(#leCardCrimson)" />
            <path d="M84 14 C64 31 44 39 14 44 C46 37 67 27 84 6 Z" fill="url(#leCardGold)" />
            <defs>
              <linearGradient id="leCardCrimson" x1="8" y1="44" x2="84" y2="4" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8B0E17" />
                <stop offset="100%" stopColor="#C11924" />
              </linearGradient>
              <linearGradient id="leCardGold" x1="14" y1="44" x2="84" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D4A646" />
                <stop offset="50%" stopColor="#F9DF8B" />
                <stop offset="100%" stopColor="#B88322" />
              </linearGradient>
            </defs>
          </svg>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddUnit();
            }}
            className="relative z-10 p-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FBE295] via-[#DFB042] to-[#B07C1B] border border-[#F9DF8B] shadow-xs flex items-center justify-center text-[#4F3106]">
                <MapPin size={17} className="stroke-[2.3]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#22201C]">
                NOVO DESTINO / UNIDADE:
              </span>
            </div>

            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="Ex.: BRASILIAS, SANTA LUZIA, GUARULHOS..."
              className="flex-1 px-4 py-2.5 rounded-full bg-[#FCF9F2] border border-[#DFC078] text-xs font-semibold uppercase text-[#1E1D1A] placeholder:normal-case placeholder:font-normal placeholder:text-[#8E8678] shadow-[inset_0_2px_5px_rgba(84,54,18,0.06)] focus:outline-none focus:border-[#B98321]"
            />

            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-gradient-to-b from-[#CA1D27] via-[#9E0E17] to-[#6E060C] hover:brightness-110 border border-[#E7C46D] text-white text-xs font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_6px_14px_-4px_rgba(142,11,20,0.55)] transition-all active:scale-[0.99]"
            >
              <Plus size={16} className="text-[#FCE394] stroke-[2.6]" />
              <span>Adicionar Unidade</span>
            </button>
          </form>

          {unusedQuickDestinos.length > 0 && (
            <div className="relative z-10 px-4 sm:px-5 py-2.5 bg-[#FFFDF8]/80 border-t border-[#EFE2C2] flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B665D] shrink-0 mr-1">
                <Users size={14} className="text-[#B98321]" />
                <span>Atalhos rápidos:</span>
              </div>
              {unusedQuickDestinos.slice(0, 10).map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => handleAddUnit(dest)}
                  className="px-3 py-1 rounded-full bg-[#FFFDF8] hover:bg-[#FAF0D7] border border-[#DFC078] text-[10.5px] font-extrabold text-[#292820] shadow-2xs whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  + {dest}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 3. LISTA DE UNIDADES / DESTINOS */}
        {filteredUnits.length === 0 ? (
          <div className="bg-[#FFFCF7] rounded-2xl border border-[#DFC078] p-10 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FCE89E] to-[#DFB042] border border-[#DFC078] flex items-center justify-center mx-auto text-[#5E3A08]">
              <Mail size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17191E]">
                {searchQuery ? 'Nenhuma unidade ou e-mail encontrado' : 'Nenhuma unidade cadastrada'}
              </h2>
              <p className="text-xs text-[#6B665D] mt-1">
                {searchQuery
                  ? `Não encontramos resultados para "${searchQuery}".`
                  : 'Adicione um destino como BRASILIAS para colar e copiar todos os e-mails no campo PARA.'}
              </p>
            </div>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-5 py-2 rounded-full bg-gradient-to-b from-[#CA1D27] to-[#78070E] border border-[#E7C46D] text-white text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
              >
                Limpar filtro
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAddUnit('BRASILIAS')}
                className="px-5 py-2 rounded-full bg-gradient-to-b from-[#CA1D27] to-[#78070E] border border-[#E7C46D] text-white text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
              >
                + Criar unidade BRASILIAS
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUnits.map((unit) => {
              const isCollapsed = Boolean(collapsedIds[unit.id]);
              const isParaOpen = Boolean(expandedParaIds[unit.id]);
              const isCopied = copiedId === `all_${unit.id}`;
              const hasTextWithoutEmail = unit.paraRaw.trim().length > 0 && unit.emails.length === 0;

              return (
                <article
                  key={unit.id}
                  className="relative bg-[#FFFDF9] rounded-2xl border border-[#DFC078] overflow-hidden shadow-[0_14px_30px_-14px_rgba(92,16,22,0.2)]"
                >
                  {/* Cabeçalho Carmesim 3D com Mapa Pontilhado + Borda Dourada */}
                  <div
                    className="relative overflow-hidden text-white px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#E2BA5A]"
                    style={{
                      background: 'linear-gradient(105deg, #54040A 0%, #940C15 52%, #59040A 100%)'
                    }}
                  >
                    {/* Padrão sutil de pontos estilizados no fundo carmesim + faixa dourada no canto direito */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none select-none absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: 'radial-gradient(rgba(255, 200, 170, 0.85) 1.2px, transparent 1.2px)',
                        backgroundSize: '10px 10px',
                        maskImage: 'linear-gradient(to right, transparent 25%, black 75%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 25%, black 75%)'
                      }}
                    />
                    <svg
                      viewBox="0 0 240 60"
                      fill="none"
                      aria-hidden="true"
                      className="pointer-events-none select-none absolute bottom-0 right-0 w-56 h-14 opacity-90"
                    >
                      <path
                        d="M240 60 L90 60 C155 54 205 34 240 6 Z"
                        fill="url(#leUnitGoldCurve)"
                        opacity="0.35"
                      />
                      <path
                        d="M70 60 C145 55 198 35 240 2 L240 9 C202 41 150 58 92 60 Z"
                        fill="url(#leUnitGoldCurve)"
                      />
                      <defs>
                        <linearGradient id="leUnitGoldCurve" x1="70" y1="60" x2="240" y2="2" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#BA8523" />
                          <stop offset="55%" stopColor="#FAE18F" />
                          <stop offset="100%" stopColor="#D49E32" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="relative z-10 flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#A8131D] to-[#570409] border-2 border-[#E7C46D] flex items-center justify-center shrink-0 text-[#FCE394] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                        <MapPin size={20} className="stroke-[2.2]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {editingUnitId === unit.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSaveEditUnit(unit.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editingUnitName}
                              onChange={(e) => setEditingUnitName(e.target.value)}
                              className="px-3 py-1 rounded-full bg-white text-[#17191E] text-sm font-extrabold uppercase border border-[#E7C46D] focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1 rounded-full bg-gradient-to-b from-[#FCE6A2] to-[#DFB042] text-[#292012] text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUnitId(null)}
                              className="px-2.5 py-1 rounded-full bg-black/30 text-white text-xs cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <>
                            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#F5C542] leading-none mb-1">
                              DESTINO
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-lg sm:text-xl font-black tracking-wide uppercase text-white truncate leading-none">
                                {unit.destino}
                              </h2>
                              <button
                                type="button"
                                onClick={() => handleStartEditUnit(unit)}
                                className="p-1 rounded-full text-amber-100/80 hover:text-white hover:bg-white/15 cursor-pointer transition-colors"
                                title="Editar nome do destino"
                              >
                                <Edit3 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-rose-100/90 tabular-nums mt-1">
                          <Users size={13} className="text-[#F5C542] shrink-0" />
                          <span>
                            {unit.emails.length} {unit.emails.length === 1 ? 'e-mail cadastrado' : 'e-mails cadastrados'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botão principal Copiar todos os e-mails + ações da unidade */}
                    <div className="relative z-10 flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                      <button
                        type="button"
                        disabled={unit.emails.length === 0}
                        onClick={() =>
                          copyToClipboard(
                            `all_${unit.id}`,
                            unit.emails.join('; '),
                            `Todos os ${unit.emails.length} e-mails de ${unit.destino} copiados!`
                          )
                        }
                        className={cn(
                          'px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all border',
                          unit.emails.length === 0
                            ? 'bg-[#3C1414]/85 text-amber-100/70 border-[#C99C45]/55 cursor-not-allowed'
                            : isCopied
                              ? 'bg-emerald-600 text-white border-emerald-300 cursor-pointer shadow-sm'
                              : 'bg-gradient-to-b from-[#4C1A13] to-[#280B08] hover:brightness-115 text-white border-[#E7C46D] cursor-pointer shadow-sm'
                        )}
                      >
                        {isCopied ? (
                          <Check size={14} className="text-white" />
                        ) : (
                          <Copy size={14} className="text-[#F5C542]" />
                        )}
                        <span>
                          {isCopied
                            ? `Copiado (${unit.emails.length})`
                            : `Copiar todos os e-mails (${unit.emails.length})`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCollapse(unit.id)}
                        className="w-9 h-9 rounded-full bg-[#4A1416]/90 hover:bg-[#64191C] border border-[#D4AF37]/75 text-white flex items-center justify-center cursor-pointer transition-colors"
                        title={isCollapsed ? 'Expandir unidade' : 'Recolher unidade'}
                      >
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>

                      {confirmDeleteId === unit.id ? (
                        <div className="flex items-center gap-1 bg-rose-950/95 border border-[#E7C46D]/70 rounded-full px-2.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="text-[11px] font-bold text-rose-200 hover:text-white px-1.5 py-0.5 cursor-pointer whitespace-nowrap"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] text-stone-300 hover:text-white px-1 py-0.5 cursor-pointer"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(unit.id)}
                          className="w-9 h-9 rounded-full bg-[#4A1416]/90 hover:bg-rose-700 border border-[#D4AF37]/75 text-white flex items-center justify-center cursor-pointer transition-colors"
                          title="Excluir unidade"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo da Unidade: Área PARA */}
                  {!isCollapsed && (
                    <div className="relative p-4 sm:px-5 sm:py-4 bg-gradient-to-b from-[#FFFFFF] to-[#FDF9F0] space-y-4">
                      {/* Barra do Campo PARA */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="px-3.5 py-1 rounded-full bg-gradient-to-b from-[#6B4823] via-[#4A2E12] to-[#2A1908] border border-[#E5C16A] text-[#FBE08B] text-[11px] font-black tracking-widest uppercase shadow-xs">
                            PARA
                          </span>
                          <span className="text-xs font-medium text-[#3B362C]">
                            Cole todas as pessoas ou e-mails de <strong className="font-extrabold text-[#17191E]">{unit.destino}</strong> abaixo
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleParaField(unit.id)}
                            className={cn(
                              'px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-all shadow-xs',
                              isParaOpen
                                ? 'bg-[#292820] text-[#FAF7F0] border-[#D9C39B] hover:bg-black'
                                : 'bg-gradient-to-b from-[#FCE6A2] to-[#E6B84C] text-[#292012] border-[#C69732] hover:brightness-105'
                            )}
                          >
                            {isParaOpen ? (
                              <>
                                <Minimize2 size={13} className="text-[#F5C542]" />
                                <span>Minimizar campo</span>
                              </>
                            ) : (
                              <>
                                <Maximize2 size={13} className="text-[#5E3A08]" />
                                <span>Abrir</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePasteFromClipboard(unit.id, unit.paraRaw)}
                            className="px-4 py-1.5 rounded-full bg-[#FFFDF8] hover:bg-[#FAF1DC] border border-[#DFC078] text-xs font-bold text-[#292820] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs transition-colors"
                          >
                            <ClipboardPaste size={13} className="text-[#B98321]" />
                            <span>Colar</span>
                          </button>

                          {unit.emails.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOrganizePara(unit.id, unit.paraRaw)}
                              className="px-4 py-1.5 rounded-full bg-[#FFFDF8] hover:bg-[#FAF1DC] border border-[#DFC078] text-xs font-bold text-[#292820] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs transition-colors"
                              title="Extrair apenas e-mails limpos e remover duplicados no campo PARA"
                            >
                              <Sparkles size={13} className="text-[#B98321]" />
                              <span>Organizar e-mails</span>
                            </button>
                          )}

                          {unit.paraRaw.trim().length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleClearUnitEmails(unit.id)}
                              className="px-4 py-1.5 rounded-full bg-[#FFFDF8] hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-xs font-bold text-stone-700 hover:text-rose-700 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs transition-colors"
                            >
                              <Eraser size={13} />
                              <span>Limpar</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Textarea de Colagem em Massa PARA (minimizada por padrão até clicar no botão) */}
                      {isParaOpen && (
                        <textarea
                          value={unit.paraRaw}
                          onChange={(e) => handleUpdatePara(unit.id, e.target.value)}
                          rows={4}
                          autoFocus
                          placeholder={`Cole aqui todas as pessoas / e-mails para ${unit.destino} (ex.: Nome Sobrenome <email@empresa.com.br>; outro@3coracoes.com.br, lista do Excel ou Outlook)...`}
                          className="w-full rounded-2xl bg-white border border-[#DFC078] px-4 py-3 text-xs text-[#1E1D1A] placeholder:text-stone-400 focus:outline-none focus:border-[#B98321] focus:ring-2 focus:ring-[#D4AF37]/20 resize-y leading-relaxed shadow-inner"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        />
                      )}

                      {hasTextWithoutEmail && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2">
                          Nenhum endereço de e-mail com "@" foi identificado no texto acima. Cole ou digite os e-mails para habilitar a cópia rápida.
                        </p>
                      )}

                      {/* Lista de E-mails Extraídos do Campo PARA */}
                      {unit.emails.length > 0 && (() => {
                        const safeSvgId = unit.id.replace(/[^a-zA-Z0-9_-]/g, '_');
                        const crimsonGradId = `leDestCrimson_${safeSvgId}`;
                        const goldGradId = `leDestGold_${safeSvgId}`;

                        return (
                          <div className="relative overflow-hidden rounded-2xl border border-[#DFC078] bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF8] to-[#FCF2DC] p-4 sm:p-5 shadow-[0_10px_24px_-12px_rgba(92,16,22,0.16)]">
                            {/* Ornamento carmesim e dourado no canto inferior direito */}
                            <svg
                              className="pointer-events-none absolute bottom-0 right-0 w-24 h-12 opacity-90"
                              viewBox="0 0 120 60"
                              fill="none"
                              preserveAspectRatio="none"
                              aria-hidden="true"
                            >
                              <defs>
                                <linearGradient id={crimsonGradId} x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor="#B81620" />
                                  <stop offset="65%" stopColor="#75060D" />
                                  <stop offset="100%" stopColor="#4B0307" />
                                </linearGradient>
                                <linearGradient id={goldGradId} x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#E4BE5E" />
                                  <stop offset="50%" stopColor="#FCE79D" />
                                  <stop offset="100%" stopColor="#B98321" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M120 60V12C102 36 74 52 24 60H120Z"
                                fill={`url(#${crimsonGradId})`}
                              />
                              <path
                                d="M120 12C102 36 74 52 24 60H8C66 49 98 30 120 4V12Z"
                                fill={`url(#${goldGradId})`}
                              />
                            </svg>

                            {/* Cabeçalho do Painel */}
                            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#C81B24] via-[#9E0E17] to-[#6E060C] border-2 border-[#E7C46D] shadow-sm flex items-center justify-center text-white shrink-0">
                                  <Users size={16} />
                                </div>
                                <span className="text-sm sm:text-[15px] font-extrabold text-[#17191E] tracking-tight">
                                  Destinatários:
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedParaIds((prev) => ({
                                    ...prev,
                                    [unit.id]: true,
                                  }))
                                }
                                className="px-3.5 py-1.5 rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#FAF0DA] border border-[#DFC078] shadow-[0_2px_6px_-2px_rgba(92,58,12,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] text-xs font-bold text-[#292012] flex items-center gap-1.5 hover:brightness-105 cursor-pointer transition-all"
                                title="Expandir campo PARA para adicionar e-mails"
                              >
                                <MousePointerClick size={14} className="text-[#A8131D]" />
                                <span>Clique para adicionar</span>
                              </button>
                            </div>

                            {/* Linha divisória metálica carmesim-dourada */}
                            <div className="relative z-10 h-[1.5px] w-full bg-gradient-to-r from-[#8E0E17] via-[#C81B24] to-[#DFB042]/60 mb-3.5" />

                            {/* Cápsulas de E-mail */}
                            <div className="relative z-10 flex flex-wrap gap-2.5">
                              {unit.emails.map((email) => {
                                const singleCopyId = `single_${unit.id}_${email}`;
                                const isSingleCopied = copiedId === singleCopyId;

                                return (
                                  <div
                                    key={email}
                                    className="flex items-center justify-between gap-2.5 pl-1.5 pr-2 py-1.5 rounded-full max-w-full bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#F7EEDB] border border-[#DFC078] shadow-[0_3px_10px_-4px_rgba(92,58,12,0.22),inset_0_1px_0_rgba(255,255,255,0.95)] hover:border-[#B98321] transition-all group"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyToClipboard(
                                          singleCopyId,
                                          email,
                                          `E-mail copiado: ${email}`
                                        )
                                      }
                                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                                      title={`Copiar ${email}`}
                                    >
                                      <span
                                        className={cn(
                                          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border shadow-xs transition-all',
                                          isSingleCopied
                                            ? 'bg-emerald-600 border-emerald-300'
                                            : 'bg-gradient-to-b from-[#D2212B] via-[#9E0E17] to-[#68060B] border-[#E7C46D] group-hover:scale-105'
                                        )}
                                      >
                                        {isSingleCopied ? (
                                          <Check size={13} className="text-white" />
                                        ) : (
                                          <Mail size={13} className="text-white" />
                                        )}
                                      </span>
                                      <span
                                        className={cn(
                                          'text-xs sm:text-[13px] font-semibold truncate pr-1',
                                          isSingleCopied ? 'text-emerald-700' : 'text-[#17191E]'
                                        )}
                                      >
                                        {email}
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSingleEmail(unit.id, email)}
                                      className="w-6 h-6 rounded-full bg-[#FBF4E4] hover:bg-rose-100 border border-[#E6D2A3] flex items-center justify-center shrink-0 text-[#59090F] hover:text-rose-700 transition-colors cursor-pointer"
                                      title={`Remover ${email}`}
                                    >
                                      <X size={12} strokeWidth={2.5} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
