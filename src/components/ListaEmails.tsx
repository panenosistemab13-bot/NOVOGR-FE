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
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
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
    <div className="w-full min-h-[calc(100vh-76px)] bg-[#FAF6EF] text-[#1E1D1A] p-4 sm:p-7 select-none overflow-y-auto" style={{ fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium flex items-center gap-2.5 shadow-lg"
          >
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-5">
        {/* Cabeçalho Principal */}
        <header className="bg-[#FFFCF6] rounded-2xl p-5 sm:p-6 border border-[#E6D2A3] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#292820] border border-[#D4AF37]/60 flex items-center justify-center shrink-0 text-[#F5C542]">
              <Mail className="w-5 h-5 stroke-[2]" />
            </div>

            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C6D28]">
                Central GR · Destinatários Operacionais
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17191E] mt-0.5">
                Lista de E-mails
              </h1>
              <p className="text-xs text-[#6B665D] mt-0.5 tabular-nums">
                {units.length} {units.length === 1 ? 'unidade cadastrada' : 'unidades cadastradas'} · {totalUniqueEmails} {totalUniqueEmails === 1 ? 'e-mail único' : 'e-mails únicos'} no total
              </p>
            </div>
          </div>

          {/* Controle de busca */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C6D28] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar destino ou e-mail..."
                className="w-full sm:w-64 pl-9 pr-8 py-2 rounded-xl bg-white border border-[#D9C39B] text-xs text-[#1E1D1A] placeholder:text-stone-400 focus:outline-none focus:border-[#B98321]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Barra de Nova Unidade / Destino */}
        <section className="bg-[#FFFCF6] rounded-2xl p-4 sm:p-5 border border-[#E6D2A3] space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddUnit();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B665D] shrink-0">
              <MapPin size={15} className="text-[#B98321]" />
              <span>Novo Destino / Unidade:</span>
            </div>

            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="Ex.: BRASILIAS, SANTA LUZIA, GUARULHOS..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#D9C39B] text-xs font-semibold uppercase text-[#1E1D1A] placeholder:normal-case placeholder:font-normal placeholder:text-stone-400 focus:outline-none focus:border-[#B98321]"
            />

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#292820] hover:bg-black text-[#FAF7F0] text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <Plus size={15} className="text-[#F5C542]" />
              <span>Adicionar Unidade</span>
            </button>
          </form>

          {unusedQuickDestinos.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#E6D2A3]/50">
              <span className="text-[11px] font-semibold text-[#77736B] shrink-0">
                Atalhos rápidos:
              </span>
              {unusedQuickDestinos.slice(0, 10).map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => handleAddUnit(dest)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF1DC] border border-[#E6D2A3] text-[11px] font-semibold text-[#3B362C] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  + {dest}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Lista de Unidades / Destinos */}
        {filteredUnits.length === 0 ? (
          <div className="bg-[#FFFCF6] rounded-2xl border border-[#E6D2A3] p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F5EFE4] border border-[#E6D2A3] flex items-center justify-center mx-auto text-[#8C6D28]">
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
                className="px-4 py-2 rounded-xl bg-[#292820] text-[#FAF7F0] text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
              >
                Limpar filtro
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAddUnit('BRASILIAS')}
                className="px-4 py-2 rounded-xl bg-[#292820] text-[#FAF7F0] text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
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
                  className="bg-[#FFFCF6] rounded-2xl border border-[#D9C39B] overflow-hidden shadow-xs"
                >
                  {/* Cabeçalho com o Destino (ex.: BRASILIAS) */}
                  <div className="bg-[#17191E] text-white px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#272A32] border border-[#D4AF37]/50 flex items-center justify-center shrink-0 text-[#F5C542]">
                        <MapPin size={18} />
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
                              className="px-2.5 py-1 rounded-lg bg-white text-[#17191E] text-sm font-extrabold uppercase border border-[#D4AF37] focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1 rounded-lg bg-[#D4AF37] text-[#17191E] text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUnitId(null)}
                              className="px-2 py-1 rounded-lg bg-white/10 text-white text-xs cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D8B065]">
                              Destino
                            </span>
                            <h2 className="text-base sm:text-lg font-extrabold tracking-wide uppercase text-white truncate">
                              {unit.destino}
                            </h2>
                            <button
                              type="button"
                              onClick={() => handleStartEditUnit(unit)}
                              className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                              title="Editar nome do destino"
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-stone-300 tabular-nums mt-0.5">
                          {unit.emails.length} {unit.emails.length === 1 ? 'e-mail cadastrado' : 'e-mails cadastrados'}
                        </p>
                      </div>
                    </div>

                    {/* Botão principal Copiar todos os e-mails + ações da unidade */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
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
                          'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all',
                          unit.emails.length === 0
                            ? 'bg-white/10 text-stone-400 border border-white/10 cursor-not-allowed'
                            : isCopied
                              ? 'bg-emerald-500 text-white border border-emerald-400 cursor-pointer'
                              : 'bg-gradient-to-r from-[#E6B84C] to-[#F5D37A] hover:brightness-105 text-[#17191E] cursor-pointer shadow-xs'
                        )}
                      >
                        {isCopied ? <Check size={15} /> : <Copy size={15} />}
                        <span>
                          {isCopied
                            ? `Copiado (${unit.emails.length})`
                            : `Copiar todos os e-mails (${unit.emails.length})`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCollapse(unit.id)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 cursor-pointer transition-colors"
                        title={isCollapsed ? 'Expandir unidade' : 'Recolher unidade'}
                      >
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>

                      {confirmDeleteId === unit.id ? (
                        <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500/60 rounded-xl px-2 py-1">
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
                          className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-stone-300 hover:text-white cursor-pointer transition-colors"
                          title="Excluir unidade"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo da Unidade: Área PARA */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Barra do Campo PARA */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-md bg-[#292820] text-[#F5C542] text-xs font-extrabold tracking-widest uppercase">
                            PARA
                          </span>
                          <span className="text-xs font-medium text-[#5C574E]">
                            Cole todas as pessoas ou e-mails de <strong>{unit.destino}</strong> abaixo
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleParaField(unit.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors',
                              isParaOpen
                                ? 'bg-[#292820] text-[#FAF7F0] border-[#292820] hover:bg-black'
                                : 'bg-[#FAF1DC] text-[#292820] border-[#D4AF37] hover:bg-[#F5E4B8]'
                            )}
                          >
                            {isParaOpen ? (
                              <>
                                <Minimize2 size={13} className="text-[#F5C542]" />
                                <span>Minimizar campo</span>
                              </>
                            ) : (
                              <>
                                <Maximize2 size={13} className="text-[#8C6D28]" />
                                <span>Abrir</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePasteFromClipboard(unit.id, unit.paraRaw)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF1DC] border border-[#D9C39B] text-[11px] font-semibold text-[#292820] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                          >
                            <ClipboardPaste size={13} className="text-[#B98321]" />
                            <span>Colar</span>
                          </button>

                          {unit.emails.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOrganizePara(unit.id, unit.paraRaw)}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF1DC] border border-[#D9C39B] text-[11px] font-semibold text-[#292820] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
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
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-[11px] font-semibold text-stone-600 hover:text-rose-700 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
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
                          className="w-full rounded-xl bg-white border border-[#D9C39B] px-3.5 py-2.5 text-xs text-[#1E1D1A] placeholder:text-stone-400 focus:outline-none focus:border-[#B98321] focus:ring-2 focus:ring-[#D4AF37]/20 resize-y leading-relaxed"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        />
                      )}

                      {hasTextWithoutEmail && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2">
                          Nenhum endereço de e-mail com "@" foi identificado no texto acima. Cole ou digite os e-mails para habilitar a cópia rápida.
                        </p>
                      )}

                      {/* Lista de E-mails Extraídos do Campo PARA */}
                      {unit.emails.length > 0 && (
                        <div className="pt-3 border-t border-[#E6D2A3]/70 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#3B362C]">
                              <Users size={14} className="text-[#8C6D28]" />
                              <span className="tabular-nums">
                                Destinatários no PARA ({unit.emails.length})
                              </span>
                            </div>
                            <span className="text-[11px] text-[#77736B]">
                              Clique em um e-mail para copiar individualmente
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {unit.emails.map((email) => {
                              const singleCopyId = `single_${unit.id}_${email}`;
                              const isSingleCopied = copiedId === singleCopyId;

                              return (
                                <div
                                  key={email}
                                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-[#E6D2A3] hover:border-[#B98321] transition-colors group"
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
                                    className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                                    title={`Copiar ${email}`}
                                  >
                                    {isSingleCopied ? (
                                      <Check size={13} className="text-emerald-600 shrink-0" />
                                    ) : (
                                      <Copy size={13} className="text-[#8C6D28] shrink-0 opacity-70 group-hover:opacity-100" />
                                    )}
                                    <span
                                      className={cn(
                                        'text-xs truncate',
                                        isSingleCopied ? 'text-emerald-700 font-semibold' : 'text-[#1E1D1A]'
                                      )}
                                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                      {email}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSingleEmail(unit.id, email)}
                                    className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0 transition-colors"
                                    title={`Remover ${email}`}
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
