import React, { useEffect, useMemo, useState } from 'react';
import {
  History,
  Search,
  User,
  Users,
  PlusCircle,
  Edit3,
  Trash2,
  Download,
  X,
  Clock,
  Layers,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import {
  AuditActionType,
  AuditHistoryEntry,
  clearAllAuditHistory,
  subscribeAuditHistory
} from '../utils/auditHistory';

interface HistoricoProps {
  onBack?: () => void;
  currentUser?: { email: string; name: string; role: string } | null;
  embedded?: boolean;
}

interface KnownUser {
  key: string;
  name: string;
  email: string;
  role: string;
  addCount: number;
  editCount: number;
  deleteCount: number;
  totalCount: number;
  lastActionAt: number;
}

type DateRangeFilter = 'all' | 'today' | '7d' | '30d';

function formatDateTime(ts: number): string {
  if (!ts) return '-';
  try {
    return new Date(ts).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return '-';
  }
}

function getActionMeta(action: AuditActionType) {
  switch (action) {
    case 'ADD':
      return {
        label: 'Adicionou',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: PlusCircle,
        iconColor: 'text-emerald-600'
      };
    case 'EDIT':
      return {
        label: 'Editou',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Edit3,
        iconColor: 'text-amber-600'
      };
    case 'DELETE':
      return {
        label: 'Apagou',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        icon: Trash2,
        iconColor: 'text-rose-600'
      };
  }
}

export default function Historico({ onBack: _onBack, currentUser, embedded = false }: HistoricoProps) {
  const [entries, setEntries] = useState<AuditHistoryEntry[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<Array<{ name: string; email: string; role: string }>>([]);
  const [selectedUserKey, setSelectedUserKey] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<'ALL' | AuditActionType>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const unsubscribe = subscribeAuditHistory((list) => {
      setEntries(list);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRegisteredUsers(
            parsed.map((u: any) => ({
              name: String(u.name || '').trim(),
              email: String(u.email || '').trim().toLowerCase(),
              role: String(u.role || 'Agente de Risco')
            }))
          );
        }
      }
    } catch {
      // ignore
    }

    const usersRef = ref(rtdb, 'app_users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const val = snapshot.val();
      if (Array.isArray(val)) {
        setRegisteredUsers(
          val
            .filter((u: any) => u && (u.name || u.email))
            .map((u: any) => ({
              name: String(u.name || '').trim(),
              email: String(u.email || '').trim().toLowerCase(),
              role: String(u.role || 'Agente de Risco')
            }))
        );
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Build individual users summary combining registered users + anyone who generated history
  const individualUsers = useMemo<KnownUser[]>(() => {
    const map = new Map<string, KnownUser>();

    const getUserKey = (email: string, name: string) => {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (cleanEmail && cleanEmail !== 'sem-email@sistema') return cleanEmail;
      return `name:${(name || 'usuario').trim().toLowerCase()}`;
    };

    registeredUsers.forEach((u) => {
      const key = getUserKey(u.email, u.name);
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: u.name || u.email.split('@')[0],
          email: u.email,
          role: u.role,
          addCount: 0,
          editCount: 0,
          deleteCount: 0,
          totalCount: 0,
          lastActionAt: 0
        });
      }
    });

    entries.forEach((entry) => {
      const key = getUserKey(entry.userEmail, entry.userName);
      const existing = map.get(key) || {
        key,
        name: entry.userName || 'Usuário',
        email: entry.userEmail || '',
        role: entry.userRole || 'Operacional',
        addCount: 0,
        editCount: 0,
        deleteCount: 0,
        totalCount: 0,
        lastActionAt: 0
      };

      if (entry.action === 'ADD') existing.addCount += 1;
      else if (entry.action === 'EDIT') existing.editCount += 1;
      else if (entry.action === 'DELETE') existing.deleteCount += 1;

      existing.totalCount += 1;
      if (entry.timestamp > existing.lastActionAt) {
        existing.lastActionAt = entry.timestamp;
        if (entry.userName) existing.name = entry.userName;
        if (entry.userRole) existing.role = entry.userRole;
      }

      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
      return a.name.localeCompare(b.name, 'pt-BR');
    });
  }, [registeredUsers, entries]);

  const availableModules = useMemo(() => {
    const setMods = new Set<string>();
    entries.forEach((e) => {
      if (e.module) setMods.add(e.module);
    });
    return Array.from(setMods).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    return entries.filter((entry) => {
      if (selectedUserKey !== 'ALL') {
        const cleanEmail = (entry.userEmail || '').trim().toLowerCase();
        const entryKey =
          cleanEmail && cleanEmail !== 'sem-email@sistema'
            ? cleanEmail
            : `name:${(entry.userName || 'usuario').trim().toLowerCase()}`;
        if (entryKey !== selectedUserKey) return false;
      }

      if (actionFilter !== 'ALL' && entry.action !== actionFilter) return false;
      if (moduleFilter !== 'ALL' && entry.module !== moduleFilter) return false;

      if (dateFilter === 'today' && entry.timestamp < todayMs) return false;
      if (dateFilter === '7d' && entry.timestamp < now - 7 * 24 * 60 * 60 * 1000) return false;
      if (dateFilter === '30d' && entry.timestamp < now - 30 * 24 * 60 * 60 * 1000) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${entry.userName} ${entry.userEmail} ${entry.module} ${entry.target} ${entry.details || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [entries, selectedUserKey, actionFilter, moduleFilter, dateFilter, searchQuery]);

  const summaryCounts = useMemo(() => {
    let add = 0;
    let edit = 0;
    let del = 0;
    filteredEntries.forEach((e) => {
      if (e.action === 'ADD') add += 1;
      else if (e.action === 'EDIT') edit += 1;
      else if (e.action === 'DELETE') del += 1;
    });
    return {
      total: filteredEntries.length,
      add,
      edit,
      del
    };
  }, [filteredEntries]);

  const selectedUserInfo = useMemo(() => {
    if (selectedUserKey === 'ALL') return null;
    return individualUsers.find((u) => u.key === selectedUserKey) || null;
  }, [selectedUserKey, individualUsers]);

  const handleExportCsv = () => {
    if (filteredEntries.length === 0) {
      showToast('Nenhum registro para exportar.');
      return;
    }

    const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;
    const headers = ['Data/Hora', 'Usuário', 'E-mail', 'Função', 'Ação', 'Página/Módulo', 'Item', 'Detalhes'];
    const rows = filteredEntries.map((e) =>
      [
        formatDateTime(e.timestamp),
        e.userName,
        e.userEmail,
        e.userRole,
        getActionMeta(e.action).label,
        e.module,
        e.target,
        e.details || ''
      ]
        .map(escapeCsv)
        .join(';')
    );

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico-acoes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`${filteredEntries.length} registros exportados em CSV!`);
  };

  const handleClearHistory = async () => {
    await clearAllAuditHistory();
    setConfirmClear(false);
    showToast('Histórico limpo com sucesso.');
  };

  const resetFilters = () => {
    setSelectedUserKey('ALL');
    setActionFilter('ALL');
    setModuleFilter('ALL');
    setDateFilter('all');
    setSearchQuery('');
  };

  return (
    <div
      className={cn(
        embedded
          ? 'w-full text-[#1E1D1A] select-none'
          : 'w-full min-h-[calc(100vh-76px)] bg-[#FAF6EF] text-[#1E1D1A] p-4 sm:p-7 select-none overflow-y-auto'
      )}
      style={{ fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif" }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium shadow-lg"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(embedded ? 'space-y-5' : 'max-w-7xl mx-auto space-y-5')}>
        {/* Cabeçalho Principal */}
        <header className="bg-[#FFFCF6] rounded-2xl p-5 sm:p-6 border border-[#E6D2A3] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#292820] border border-[#D4AF37]/60 flex items-center justify-center shrink-0 text-[#F5C542]">
              <History className="w-5 h-5 stroke-[2]" />
            </div>

            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C6D28]">
                Central GR · Auditoria Operacional em Tempo Real
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17191E] mt-0.5">
                Histórico
              </h1>
              <p className="text-xs text-[#6B665D] mt-0.5 tabular-nums">
                Acompanhe tudo o que cada usuário individualmente adiciona, edita e apaga no aplicativo · {individualUsers.length} usuários monitorados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF1DC] border border-[#D9C39B] text-xs font-bold text-[#292820] flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <Download size={14} className="text-[#8C6D28]" />
              <span>Exportar CSV</span>
            </button>

            {isAdmin && entries.length > 0 && (
              confirmClear ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 rounded-xl px-3 py-1.5">
                  <span className="text-[11px] font-bold text-rose-800 whitespace-nowrap">
                    Apagar tudo?
                  </span>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer whitespace-nowrap"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 rounded-lg bg-white border border-stone-300 text-stone-700 text-[11px] font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-xs font-bold text-stone-700 hover:text-rose-700 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Limpar Histórico</span>
                </button>
              )
            )}
          </div>
        </header>

        {/* Indicadores de Resumo */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#FFFCF6] rounded-2xl p-4 border border-[#E6D2A3] flex items-center justify-between text-left">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#77736B] block">
                Total de Ações
              </span>
              <span className="text-2xl font-extrabold text-[#17191E] tabular-nums mt-1 block">
                {summaryCounts.total}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F5EFE4] border border-[#E6D2A3] flex items-center justify-center text-[#8C6D28]">
              <History size={18} />
            </div>
          </div>

          <div
            onClick={() => setActionFilter(actionFilter === 'ADD' ? 'ALL' : 'ADD')}
            className={cn(
              'bg-[#FFFCF6] rounded-2xl p-4 border flex items-center justify-between text-left cursor-pointer transition-colors',
              actionFilter === 'ADD' ? 'border-emerald-500 bg-emerald-50/40' : 'border-[#E6D2A3] hover:border-emerald-300'
            )}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                Adicionados
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 block">
                {summaryCounts.add}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <PlusCircle size={18} />
            </div>
          </div>

          <div
            onClick={() => setActionFilter(actionFilter === 'EDIT' ? 'ALL' : 'EDIT')}
            className={cn(
              'bg-[#FFFCF6] rounded-2xl p-4 border flex items-center justify-between text-left cursor-pointer transition-colors',
              actionFilter === 'EDIT' ? 'border-amber-500 bg-amber-50/40' : 'border-[#E6D2A3] hover:border-amber-300'
            )}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
                Editados
              </span>
              <span className="text-2xl font-extrabold text-amber-700 tabular-nums mt-1 block">
                {summaryCounts.edit}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Edit3 size={18} />
            </div>
          </div>

          <div
            onClick={() => setActionFilter(actionFilter === 'DELETE' ? 'ALL' : 'DELETE')}
            className={cn(
              'bg-[#FFFCF6] rounded-2xl p-4 border flex items-center justify-between text-left cursor-pointer transition-colors',
              actionFilter === 'DELETE' ? 'border-rose-500 bg-rose-50/40' : 'border-[#E6D2A3] hover:border-rose-300'
            )}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
                Apagados
              </span>
              <span className="text-2xl font-extrabold text-rose-700 tabular-nums mt-1 block">
                {summaryCounts.del}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Trash2 size={18} />
            </div>
          </div>
        </section>

        {/* Painel de Usuários Individuais */}
        <section className="bg-[#FFFCF6] rounded-2xl p-4 sm:p-5 border border-[#E6D2A3] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-left">
              <Users size={16} className="text-[#8C6D28]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#17191E]">
                Atividade por Usuário Individual
              </h2>
            </div>
            <span className="text-[11px] text-[#77736B]">
              Clique em um usuário para ver exatamente o que ele adicionou, editou ou apagou
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Opção Todos os Usuários */}
            <button
              type="button"
              onClick={() => setSelectedUserKey('ALL')}
              className={cn(
                'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2',
                selectedUserKey === 'ALL'
                  ? 'bg-[#292820] text-white border-[#D4AF37]'
                  : 'bg-white hover:bg-[#FAF1DC]/60 text-[#1E1D1A] border-[#E6D2A3]'
              )}
            >
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">Todos os Usuários</span>
                <span
                  className={cn(
                    'text-[11px] block truncate tabular-nums mt-0.5',
                    selectedUserKey === 'ALL' ? 'text-stone-300' : 'text-[#77736B]'
                  )}
                >
                  Visão geral completa
                </span>
              </div>
              <span
                className={cn(
                  'text-sm font-extrabold tabular-nums shrink-0',
                  selectedUserKey === 'ALL' ? 'text-[#F5C542]' : 'text-[#292820]'
                )}
              >
                {entries.length}
              </span>
            </button>

            {/* Cards de cada usuário individual */}
            {individualUsers.map((u) => {
              const isSelected = selectedUserKey === u.key;
              return (
                <button
                  key={u.key}
                  type="button"
                  onClick={() => setSelectedUserKey(isSelected ? 'ALL' : u.key)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2',
                    isSelected
                      ? 'bg-[#292820] text-white border-[#D4AF37]'
                      : 'bg-white hover:bg-[#FAF1DC]/60 text-[#1E1D1A] border-[#E6D2A3]'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                          isSelected
                            ? 'bg-white/10 border-[#D4AF37]/50 text-[#F5C542]'
                            : 'bg-[#F5EFE4] border-[#E6D2A3] text-[#8C6D28]'
                        )}
                      >
                        <User size={13} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate uppercase">
                          {u.name}
                        </span>
                        <span
                          className={cn(
                            'text-[10.5px] block truncate',
                            isSelected ? 'text-stone-300' : 'text-[#77736B]'
                          )}
                        >
                          {u.email || u.role}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-xs font-extrabold tabular-nums shrink-0',
                        isSelected ? 'text-[#F5C542]' : 'text-[#292820]'
                      )}
                    >
                      {u.totalCount}
                    </span>
                  </div>

                  <div
                    className={cn(
                      'text-[10.5px] font-semibold tabular-nums pt-1.5 border-t flex items-center justify-between',
                      isSelected
                        ? 'border-white/15 text-stone-200'
                        : 'border-[#EFE6D4] text-[#6B665D]'
                    )}
                  >
                    <span className={isSelected ? 'text-emerald-300' : 'text-emerald-700'}>
                      +{u.addCount} add
                    </span>
                    <span className={isSelected ? 'text-amber-300' : 'text-amber-700'}>
                      ~{u.editCount} edit
                    </span>
                    <span className={isSelected ? 'text-rose-300' : 'text-rose-700'}>
                      -{u.deleteCount} apag
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Barra de Filtros */}
        <section className="bg-[#FFFCF6] rounded-2xl p-4 border border-[#E6D2A3] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tipo de ação */}
            <div className="flex items-center bg-white border border-[#D9C39B] rounded-xl p-1 gap-1">
              {(
                [
                  { id: 'ALL', label: 'Todas' },
                  { id: 'ADD', label: 'Adicionou' },
                  { id: 'EDIT', label: 'Editou' },
                  { id: 'DELETE', label: 'Apagou' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActionFilter(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                    actionFilter === tab.id
                      ? 'bg-[#292820] text-[#FAF7F0]'
                      : 'text-[#5C574E] hover:bg-stone-100'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filtro de módulo */}
            <div className="flex items-center gap-1.5 bg-white border border-[#D9C39B] rounded-xl px-3 py-1.5">
              <Layers size={13} className="text-[#8C6D28] shrink-0" />
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="text-xs font-semibold text-[#1E1D1A] bg-transparent outline-none cursor-pointer"
              >
                <option value="ALL">Todas as páginas ({availableModules.length})</option>
                {availableModules.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div className="flex items-center gap-1.5 bg-white border border-[#D9C39B] rounded-xl px-3 py-1.5">
              <Clock size={13} className="text-[#8C6D28] shrink-0" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateRangeFilter)}
                className="text-xs font-semibold text-[#1E1D1A] bg-transparent outline-none cursor-pointer"
              >
                <option value="all">Todo o período</option>
                <option value="today">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-[#8C6D28] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar item, detalhe ou usuário..."
                className="w-full sm:w-64 pl-9 pr-8 py-2 rounded-xl bg-white border border-[#D9C39B] text-xs text-[#1E1D1A] placeholder:text-stone-400 focus:outline-none focus:border-[#B98321]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {(selectedUserKey !== 'ALL' || actionFilter !== 'ALL' || moduleFilter !== 'ALL' || dateFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-[#D9C39B] text-xs font-bold text-[#292820] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </section>

        {/* Tabela de Registros */}
        <section className="bg-[#FFFCF6] rounded-2xl border border-[#D9C39B] overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-[#E6D2A3] bg-[#FBF7EE] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-left">
              <Filter size={15} className="text-[#8C6D28]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#17191E]">
                {selectedUserInfo
                  ? `Movimentações de ${selectedUserInfo.name}`
                  : 'Linha do Tempo de Ações'}
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#6B665D] tabular-nums">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-xl bg-[#F5EFE4] border border-[#E6D2A3] flex items-center justify-center mx-auto text-[#8C6D28]">
                <History size={22} />
              </div>
              <h3 className="text-sm font-bold text-[#17191E]">
                {entries.length === 0
                  ? 'Nenhuma ação registrada no histórico ainda'
                  : 'Nenhum registro corresponde aos filtros selecionados'}
              </h3>
              <p className="text-xs text-[#6B665D] max-w-md mx-auto">
                {entries.length === 0
                  ? 'Assim que qualquer usuário adicionar, editar ou apagar registros nas páginas do sistema, tudo aparecerá aqui automaticamente.'
                  : 'Tente alterar os filtros de usuário, página ou tipo de ação.'}
              </p>
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#292820] text-[#FAF7F0] text-xs font-bold cursor-pointer"
                >
                  Mostrar tudo
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#17191E] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-4 py-3 whitespace-nowrap">Data / Hora</th>
                    <th className="px-4 py-3 whitespace-nowrap">Usuário</th>
                    <th className="px-4 py-3 whitespace-nowrap">Ação</th>
                    <th className="px-4 py-3 whitespace-nowrap">Página</th>
                    <th className="px-4 py-3 whitespace-nowrap">Item</th>
                    <th className="px-4 py-3">O que foi feito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE6D4]">
                  {filteredEntries.map((entry, idx) => {
                    const meta = getActionMeta(entry.action);
                    const ActionIcon = meta.icon;

                    return (
                      <tr
                        key={entry.id}
                        className={cn(
                          'transition-colors hover:bg-[#FAF1DC]/40',
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFCF6]'
                        )}
                      >
                        <td
                          className="px-4 py-3 whitespace-nowrap text-[11.5px] text-[#5C574E] tabular-nums"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {formatDateTime(entry.timestamp)}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-[#17191E] uppercase">
                            {entry.userName}
                          </div>
                          <div className="text-[11px] text-[#77736B]">
                            {entry.userEmail} · {entry.userRole}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold',
                              meta.badgeClass
                            )}
                          >
                            <ActionIcon size={12} className={meta.iconColor} />
                            <span>{meta.label}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-[#292820]">
                          {entry.module}
                        </td>

                        <td className="px-4 py-3 font-bold text-[#17191E] max-w-[240px] truncate" title={entry.target}>
                          {entry.target}
                        </td>

                        <td className="px-4 py-3 text-[#5C574E] min-w-[220px]">
                          {entry.details || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
