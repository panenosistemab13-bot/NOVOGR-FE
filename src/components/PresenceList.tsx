import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  Filter,
  Layers,
  Search,
  CheckCircle2,
  UserCheck,
  Briefcase,
  User,
  Coffee,
  X,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { safeCopyText } from '../utils/clipboard';

// Color themes identical to Pre-Alerta and Checklist
const COLOR_THEMES = {
  amarelo: {
    name: 'AMARELO CAFÉ',
    highlightClass: 'bg-[#FFFF00] text-black border border-yellow-500 font-bold',
    badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    accentColor: '#C49A45',
    activeBg: 'bg-[#C49A45] text-white',
    circleBg: 'bg-[#FFFF00]'
  },
  vermelho: {
    name: 'VERMELHO 3C',
    highlightClass: 'bg-red-600 text-white border border-red-700 font-bold',
    badgeClass: 'bg-red-100 text-red-900 border-red-300',
    accentColor: '#E11D48',
    activeBg: 'bg-red-600 text-white',
    circleBg: 'bg-red-600'
  },
  azul: {
    name: 'AZUL FROTA',
    highlightClass: 'bg-blue-600 text-white border border-blue-700 font-bold',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    accentColor: '#2563EB',
    activeBg: 'bg-blue-600 text-white',
    circleBg: 'bg-blue-600'
  },
  verde: {
    name: 'VERDE LOG',
    highlightClass: 'bg-emerald-600 text-white border border-emerald-700 font-bold',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    accentColor: '#10B981',
    activeBg: 'bg-emerald-600 text-white',
    circleBg: 'bg-emerald-600'
  }
};

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo' | 'plantao' | 'auditoria';
  description?: string;
}

interface PresenceListProps {
  onBack?: () => void;
}

type CalendarDisplayFormat = 'grade_executiva' | 'timeline_semanal' | 'agenda_feed' | 'matriz_compacta';

export default function PresenceList({ onBack }: PresenceListProps) {
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // New Calendar format display switcher
  const [displayFormat, setDisplayFormat] = useState<CalendarDisplayFormat>('grade_executiva');
  const [themeKey, setThemeKey] = useState<'amarelo' | 'vermelho' | 'azul' | 'verde'>('amarelo');
  const activeTheme = COLOR_THEMES[themeKey];

  // Database states
  const [dayStatuses, setDayStatuses] = useState<Record<string, 'trabalhei' | 'falta' | 'folga' | ''>>({});
  const [escalaConfig, setEscalaConfig] = useState<{ enabled: boolean; startDate: string }>({
    enabled: true,
    startDate: '2026-06-14',
  });
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});

  // Appointment creation form
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppTime, setNewAppTime] = useState('09:00');
  const [newAppType, setNewAppType] = useState<'pessoal' | 'corporativo' | 'plantao' | 'auditoria'>('corporativo');
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedEscala, setCopiedEscala] = useState(false);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2800);
  };

  // Firebase Realtime DB synchronization
  useEffect(() => {
    const presenceRef = ref(db, 'presence_list');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.statuses) setDayStatuses(data.statuses);
        if (data.escalaConfig) setEscalaConfig(data.escalaConfig);
        if (data.appointments) {
          setAppointments(data.appointments);
        } else {
          setAppointments({});
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
    if (!dateStr1 || !dateStr2) return 0;
    const d1 = new Date(dateStr1 + 'T12:00:00');
    const d2 = new Date(dateStr2 + 'T12:00:00');
    const diffTime = d1.getTime() - d2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const isAutomaticWorkDay = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const isEnabled = escalaConfig.enabled !== false;
    if (!isEnabled) return false;
    const refDate = escalaConfig.startDate || '2026-06-14';
    const diff = getDaysDifference(dateStr, refDate);
    return Math.abs(diff) % 2 === 0;
  };

  // Compute effective day status: manual override or automatic escala
  const getDayEffectiveStatus = (dateStr: string) => {
    const manual = dayStatuses[dateStr];
    if (manual === 'trabalhei') return { type: 'trabalhei', label: 'TRABALHO (REGISTRADO)', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', isWork: true };
    if (manual === 'falta') return { type: 'falta', label: 'FALTA / ATESTADO', badgeColor: 'bg-red-100 text-red-800 border-red-300', isWork: false };
    if (manual === 'folga') return { type: 'folga', label: 'FOLGA (REGISTRADA)', badgeColor: 'bg-slate-100 text-slate-700 border-slate-300', isWork: false };
    
    // Automatic scale
    if (isAutomaticWorkDay(dateStr)) {
      return { type: 'escala_trabalho', label: 'ESCALA ATIVA 3C', badgeColor: 'bg-[#EDE2CE] text-[#8C6D28] border-[#E6D2A3]', isWork: true };
    }
    return { type: 'escala_folga', label: 'FOLGA ESCALA', badgeColor: 'bg-[#F5F0E6] text-[#77736B] border-[#EDE2CE]', isWork: false };
  };

  const updateStatus = (date: string, status: 'trabalhei' | 'falta' | 'folga' | '') => {
    setDayStatuses(prev => ({ ...prev, [date]: status }));
    update(ref(db, 'presence_list/statuses'), { [date]: status });
    showToast(`Status atualizado para ${status ? status.toUpperCase() : 'ESCALA PADRÃO'}`);
  };

  const toggleEscalaConfig = () => {
    const nextState = !escalaConfig.enabled;
    const updated = { ...escalaConfig, enabled: nextState };
    setEscalaConfig(updated);
    update(ref(db, 'presence_list/escalaConfig'), updated);
    showToast(`Escala automática ${nextState ? 'ATIVADA' : 'DESATIVADA'}`);
  };

  const addAppointment = (time: string, title: string, type: 'pessoal' | 'corporativo' | 'plantao' | 'auditoria') => {
    if (!title.trim() || !time) return;
    const id = `app_${Date.now()}`;
    const newApp: Appointment = { id, date: selectedDate, time, title, type };
    update(ref(db, `presence_list/appointments`), { [id]: newApp });
    setNewAppTitle('');
    showToast('Compromisso registrado com sucesso!');
  };

  const deleteAppointment = (id: string) => {
    update(ref(db, `presence_list/appointments`), { [id]: null });
    showToast('Compromisso removido.');
  };

  // Month navigation
  const prevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    setViewDate(new Date());
    setSelectedDate(todayStr);
    showToast('Navegado para o dia de Hoje');
  };

  // Calendar monthly matrix
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }

    // Next month padding to fill grid
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [viewDate]);

  // Current Week days for Timeline Semanal format
  const currentWeekDays = useMemo(() => {
    const sel = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = sel.getDay(); // 0 is Sunday
    const sunday = new Date(sel);
    sunday.setDate(sel.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(sunday);
      cur.setDate(sunday.getDate() + i);
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      week.push({
        dateStr,
        dayNumber: cur.getDate(),
        dayName: ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'][i],
        shortDay: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][i],
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate
      });
    }
    return week;
  }, [selectedDate, todayStr]);

  // Monthly stats
  const stats = useMemo(() => {
    let workDays = 0;
    let offDays = 0;
    let faltas = 0;
    calendarDays.filter(d => d.isCurrentMonth).forEach(d => {
      const st = getDayEffectiveStatus(d.dateStr);
      if (st.type === 'falta') faltas++;
      else if (st.isWork) workDays++;
      else offDays++;
    });
    const monthApps = (Object.values(appointments) as Appointment[]).filter(a => {
      const ym = a.date.substring(0, 7);
      const currentYm = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
      return ym === currentYm;
    }).length;

    return { workDays, offDays, faltas, totalAppointments: monthApps };
  }, [calendarDays, dayStatuses, appointments, escalaConfig, viewDate]);

  // Appointments for selected date
  const selectedDayAppointments = useMemo(() => {
    return (Object.values(appointments) as Appointment[])
      .filter((app) => app.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  // Appointments grouped by date for Agenda Feed
  const allAppointmentsSorted = useMemo(() => {
    return (Object.values(appointments) as Appointment[])
      .filter(app => {
        if (!searchQuery) return true;
        return app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               app.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
               app.date.includes(searchQuery);
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [appointments, searchQuery]);

  // Copy monthly summary to clipboard
  const handleCopySummary = async () => {
    const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    let text = `*RELATÓRIO DE FREQUÊNCIA & ESCALA 3C - ${monthName.toUpperCase()}*\n`;
    text += `Total de Dias de Trabalho: ${stats.workDays}\n`;
    text += `Total de Folgas: ${stats.offDays}\n`;
    text += `Faltas/Atestados: ${stats.faltas}\n`;
    text += `Compromissos Agendados: ${stats.totalAppointments}\n\n`;
    text += `*COMPROMISSOS REGISTRADOS:*\n`;
    if (selectedDayAppointments.length > 0) {
      selectedDayAppointments.forEach(app => {
        text += `• [${app.time}] ${app.title} (${app.type.toUpperCase()})\n`;
      });
    } else {
      text += `Nenhum compromisso marcado para ${selectedDate}.\n`;
    }
    text += `\nGerado via Central Oficial 3 Corações.`;

    const success = await safeCopyText(text);
    if (success) {
      setCopiedEscala(true);
      showToast('Resumo copiado para a área de transferência!');
      setTimeout(() => setCopiedEscala(false), 2000);
    }
  };

  const selectedDateFormatted = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full h-full flex flex-col relative text-left bg-[#F5F0E6] p-3 sm:p-5 text-[#25231F] font-sans overflow-y-auto space-y-4">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="px-4 py-3 rounded-2xl bg-[#292820] text-[#E6D2A3] border border-[#C49A45]/40 text-xs font-mono font-bold flex items-center space-x-2.5 shadow-2xl backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#C49A45]" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER BANNER - 100% IDENTICAL TO PRÉ-ALERTA & CHECKLIST              */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          
          {/* Title & Icon */}
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className={cn("p-2.5 rounded-xl shadow-sm", activeTheme.highlightClass)}>
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#25231F] flex items-center gap-2.5 uppercase font-sans">
                  CALENDÁRIO & FREQUÊNCIA OPERACIONAL
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E6D2A3]/30 text-[#8C6D28] border border-[#E6D2A3] uppercase font-mono tracking-wider font-bold">
                    SISTEMA OFICIAL 3C
                  </span>
                </h1>
                <p className="text-[#77736B] text-xs font-medium">
                  Gestão estratégica de frequência de escalas, compromissos corporativos e plantão logístico.
                </p>
              </div>
            </div>
          </div>

          {/* Theme Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Color Theme Selector */}
            <div className="flex items-center bg-[#F5F0E6] p-1 rounded-xl border border-[#E6D2A3] shadow-inner">
              {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setThemeKey(key as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer",
                    themeKey === key 
                      ? theme.highlightClass + " shadow-sm scale-105" 
                      : "text-[#77736B] hover:text-[#25231F] hover:bg-white"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full", theme.circleBg)} />
                  <span className="font-mono text-[11px]">{theme.name}</span>
                </button>
              ))}
            </div>

            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#292820] hover:bg-black text-[#E6D2A3] font-mono font-bold text-xs shadow-sm transition-all border border-[#C49A45]/30 cursor-pointer active:scale-95"
              title="Copiar resumo mensal"
            >
              {copiedEscala ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#C49A45]" />}
              <span>COPIAR ESCALA</span>
            </button>

            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] hover:brightness-110 text-[#25231F] font-mono font-black text-xs shadow-sm transition-all border border-[#E6D2A3] cursor-pointer active:scale-95"
                title="Voltar ao início"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>VOLTAR</span>
              </button>
            )}
          </div>
        </div>

        {/* Top KPI Metrics Bar - Pré-Alerta Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#E6D2A3]/60">
          <div className="bg-[#F5F0E6] p-3 rounded-xl border border-[#EDE2CE] flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#77736B]">Dias de Trabalho</span>
            <span className="text-xl font-mono font-black text-[#25231F] mt-0.5">{stats.workDays} DIAS</span>
            <span className="text-[10px] text-emerald-700 font-bold mt-0.5">● Escala Ativa</span>
          </div>
          <div className="bg-[#F5F0E6] p-3 rounded-xl border border-[#EDE2CE] flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#77736B]">Folgas Previstas</span>
            <span className="text-xl font-mono font-black text-[#25231F] mt-0.5">{stats.offDays} DIAS</span>
            <span className="text-[10px] text-slate-600 font-bold mt-0.5">● Descanso Legítimo</span>
          </div>
          <div className="bg-[#F5F0E6] p-3 rounded-xl border border-[#EDE2CE] flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#77736B]">Compromissos Mês</span>
            <span className="text-xl font-mono font-black text-[#8C6D28] mt-0.5">{stats.totalAppointments} ITENS</span>
            <span className="text-[10px] text-[#8C6D28] font-bold mt-0.5">● Agenda Corporativa</span>
          </div>
          <div className="bg-[#F5F0E6] p-3 rounded-xl border border-[#EDE2CE] flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase text-[#77736B]">Status do Dia de Hoje</span>
            <span className="text-sm font-mono font-black text-[#25231F] mt-1 truncate">
              {getDayEffectiveStatus(todayStr).label}
            </span>
            <span className="text-[10px] text-[#77736B] font-mono mt-0.5">{todayStr}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CALENDAR CONTROL BAR: VIEW FORMAT SWITCHER & MONTH NAVIGATION         */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-3.5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Formats Switcher (mude o formato do calendário de como aparece) */}
        <div className="flex items-center bg-[#F5F0E6] p-1 rounded-xl border border-[#EDE2CE] overflow-x-auto">
          <button
            onClick={() => setDisplayFormat('grade_executiva')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              displayFormat === 'grade_executiva'
                ? "bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#25231F] shadow-xs border border-[#C49A45]/40"
                : "text-[#77736B] hover:text-[#25231F]"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>1. GRADE EXECUTIVA</span>
          </button>

          <button
            onClick={() => setDisplayFormat('timeline_semanal')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              displayFormat === 'timeline_semanal'
                ? "bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#25231F] shadow-xs border border-[#C49A45]/40"
                : "text-[#77736B] hover:text-[#25231F]"
            )}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>2. LINHA DO TEMPO SEMANAL</span>
          </button>

          <button
            onClick={() => setDisplayFormat('agenda_feed')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              displayFormat === 'agenda_feed'
                ? "bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#25231F] shadow-xs border border-[#C49A45]/40"
                : "text-[#77736B] hover:text-[#25231F]"
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span>3. AGENDA / FEED</span>
          </button>

          <button
            onClick={() => setDisplayFormat('matriz_compacta')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              displayFormat === 'matriz_compacta'
                ? "bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#25231F] shadow-xs border border-[#C49A45]/40"
                : "text-[#77736B] hover:text-[#25231F]"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>4. COMPACTA</span>
          </button>
        </div>

        {/* Month Navigator & Jump to Today */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 bg-[#292820] hover:bg-black text-[#E6D2A3] border border-[#C49A45]/30 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C49A45]" />
            <span>HOJE</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#292820] p-1 rounded-xl border border-[#C49A45]/30">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-[#1a1917] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/20 cursor-pointer transition-all"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-black text-xs uppercase text-[#FFFCF6] px-3 tracking-wider">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-[#1a1917] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/20 cursor-pointer transition-all"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE: CALENDAR DISPLAY + SELECTED DAY SIDEBAR               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Section: Calendar format renders here (Col 8) */}
        <div className="lg:col-span-8 space-y-4">

          {/* =================================================================== */}
          {/* FORMAT 1: GRADE EXECUTIVA 3C (Rich Day Cards with Badges & Shifts)  */}
          {/* =================================================================== */}
          {displayFormat === 'grade_executiva' && (
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-[#E6D2A3]/60 pb-2">
                <span className="text-xs font-mono font-black uppercase text-[#25231F] flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-[#C49A45]" />
                  VISÃO MENSAL EM CARDS INTERATIVOS
                </span>
                <span className="text-[11px] font-mono text-[#77736B]">Clique em qualquer dia para inspecionar</span>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((d, idx) => (
                  <div 
                    key={d} 
                    className={cn(
                      "py-1.5 rounded-xl font-mono text-[11px] font-black uppercase border",
                      idx === 0 || idx === 6 
                        ? "bg-[#EDE2CE]/80 text-[#8C6D28] border-[#E6D2A3]" 
                        : "bg-[#292820] text-[#FFFCF6] border-[#38372d]"
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const isSelected = day.dateStr === selectedDate;
                  const isToday = day.dateStr === todayStr;
                  const effectiveStatus = getDayEffectiveStatus(day.dateStr);
                  const dayApps = (Object.values(appointments) as Appointment[]).filter(a => a.date === day.dateStr);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={cn(
                        "min-h-[92px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group select-none",
                        day.isCurrentMonth ? "bg-white" : "bg-[#F5F0E6]/50 opacity-60",
                        isSelected 
                          ? "ring-2 ring-[#C49A45] border-[#C49A45] shadow-md bg-[#FFFDF7]" 
                          : "border-[#EDE2CE] hover:border-[#C49A45]/60 hover:shadow-xs",
                        isToday && "border-2 border-[#C49A45]"
                      )}
                    >
                      {/* Top Bar of Day Card */}
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-black",
                          isToday 
                            ? "bg-[#C49A45] text-white shadow-xs" 
                            : isSelected ? "bg-[#292820] text-[#E6D2A3]" : "text-[#25231F]"
                        )}>
                          {day.dayNumber}
                        </span>

                        {isToday && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#E6D2A3]/50 text-[#8C6D28] font-mono font-black">
                            HOJE
                          </span>
                        )}
                      </div>

                      {/* Status indicator pill */}
                      <div className="my-1">
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold block truncate border",
                          effectiveStatus.badgeColor
                        )}>
                          {effectiveStatus.isWork ? 'TRABALHO 3C' : 'FOLGA'}
                        </span>
                      </div>

                      {/* Appointments indicator tags */}
                      <div className="space-y-0.5">
                        {dayApps.slice(0, 2).map((app) => (
                          <div 
                            key={app.id} 
                            className="text-[9px] bg-[#292820] text-[#E6D2A3] px-1.5 py-0.5 rounded truncate font-mono flex items-center gap-1"
                            title={`${app.time} - ${app.title}`}
                          >
                            <Clock className="w-2.5 h-2.5 shrink-0 text-[#C49A45]" />
                            <span className="truncate">{app.title}</span>
                          </div>
                        ))}
                        {dayApps.length > 2 && (
                          <span className="text-[8.5px] font-mono text-[#8C6D28] font-bold block text-right">
                            +{dayApps.length - 2} evento(s)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* FORMAT 2: LINHA DO TEMPO SEMANAL (Horizontal Stream of 7 Days)       */}
          {/* =================================================================== */}
          {displayFormat === 'timeline_semanal' && (
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#E6D2A3]/60 pb-2">
                <span className="text-xs font-mono font-black uppercase text-[#25231F] flex items-center gap-2">
                  <Columns className="w-4 h-4 text-[#C49A45]" />
                  SEMANA EM DESTAQUE (DIAS E TURNOS DETALHADOS)
                </span>
                <span className="text-[11px] font-mono text-[#77736B]">Semana da data selecionada</span>
              </div>

              <div className="space-y-2.5">
                {currentWeekDays.map((item) => {
                  const effectiveStatus = getDayEffectiveStatus(item.dateStr);
                  const dayApps = (Object.values(appointments) as Appointment[]).filter(a => a.date === item.dateStr);

                  return (
                    <div
                      key={item.dateStr}
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                        item.isSelected 
                          ? "bg-[#FFFDF7] border-2 border-[#C49A45] shadow-md" 
                          : "bg-white border-[#EDE2CE] hover:border-[#C49A45]/50",
                        item.isToday && "ring-1 ring-[#C49A45]"
                      )}
                    >
                      {/* Left: Day & Date header */}
                      <div className="flex items-center gap-3 min-w-[210px]">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono border",
                          item.isToday 
                            ? "bg-[#C49A45] text-white border-[#C49A45]" 
                            : item.isSelected 
                              ? "bg-[#292820] text-[#E6D2A3] border-[#38372d]" 
                              : "bg-[#F5F0E6] text-[#25231F] border-[#EDE2CE]"
                        )}>
                          <span className="text-[10px] font-bold leading-none">{item.shortDay}</span>
                          <span className="text-lg font-black leading-tight">{item.dayNumber}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#25231F]">
                              {item.dayName}
                            </span>
                            {item.isToday && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#E6D2A3] text-[#8C6D28] font-mono font-black">
                                HOJE
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-[#77736B] block">
                            {item.dateStr}
                          </span>
                        </div>
                      </div>

                      {/* Center: Shift & Work Status */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase border",
                          effectiveStatus.badgeColor
                        )}>
                          {effectiveStatus.label}
                        </span>
                      </div>

                      {/* Right: Appointments summary */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {dayApps.length === 0 ? (
                          <span className="text-xs text-[#77736B] font-mono italic">
                            Nenhum compromisso
                          </span>
                        ) : (
                          dayApps.map(app => (
                            <span 
                              key={app.id} 
                              className="px-2.5 py-1 rounded-lg bg-[#292820] text-[#E6D2A3] text-[10px] font-mono font-bold flex items-center gap-1 border border-[#C49A45]/30"
                            >
                              <Clock className="w-3 h-3 text-[#C49A45]" />
                              {app.time} • {app.title}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* FORMAT 3: AGENDA / FEED CRONOLÓGICO                                 */}
          {/* =================================================================== */}
          {displayFormat === 'agenda_feed' && (
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6D2A3]/60 pb-3">
                <span className="text-xs font-mono font-black uppercase text-[#25231F] flex items-center gap-2">
                  <List className="w-4 h-4 text-[#C49A45]" />
                  FEED CRONOLÓGICO DE COMPROMISSOS & EVENTOS
                </span>

                {/* Filter and search */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#77736B]" />
                    <input
                      type="text"
                      placeholder="Filtrar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1 rounded-xl bg-[#F5F0E6] border border-[#EDE2CE] text-xs font-mono text-[#25231F] focus:outline-hidden focus:border-[#C49A45]"
                    />
                  </div>
                </div>
              </div>

              {/* Feed items */}
              {allAppointmentsSorted.length === 0 ? (
                <div className="p-8 text-center bg-[#F5F0E6] rounded-2xl border border-[#EDE2CE] space-y-2">
                  <CalendarIcon className="w-10 h-10 mx-auto text-[#77736B]/50" />
                  <p className="text-sm font-bold text-[#77736B]">Nenhum compromisso cadastrado para esta pesquisa.</p>
                  <p className="text-xs text-[#77736B]">Utilize o painel ao lado para agendar um novo compromisso na data desejada.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {allAppointmentsSorted.map((app) => {
                    const isSelected = app.date === selectedDate;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedDate(app.date)}
                        className={cn(
                          "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                          isSelected 
                            ? "bg-[#FFFDF7] border-2 border-[#C49A45] shadow-xs" 
                            : "bg-white border-[#EDE2CE] hover:border-[#C49A45]/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#292820] text-[#E6D2A3] flex items-center justify-center font-mono shrink-0 border border-[#C49A45]/30">
                            <Clock className="w-4 h-4 text-[#C49A45]" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-[#25231F]">{app.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDE2CE] text-[#8C6D28] font-mono font-bold uppercase border border-[#E6D2A3]">
                                {app.type}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-[#77736B]">
                              Data: {app.date} às {app.time}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAppointment(app.id);
                            }}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all cursor-pointer"
                            title="Excluir compromisso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* FORMAT 4: MATRIZ COMPACTA (Quick monthly view)                       */}
          {/* =================================================================== */}
          {displayFormat === 'matriz_compacta' && (
            <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-black uppercase mb-2">
                <span className="py-1 rounded-lg bg-[#EDE2CE] text-[#8C6D28] border border-[#E6D2A3]">DOM</span>
                <span className="py-1 rounded-lg bg-[#292820] text-[#FFFCF6]">SEG</span>
                <span className="py-1 rounded-lg bg-[#292820] text-[#FFFCF6]">TER</span>
                <span className="py-1 rounded-lg bg-[#292820] text-[#FFFCF6]">QUA</span>
                <span className="py-1 rounded-lg bg-[#292820] text-[#FFFCF6]">QUI</span>
                <span className="py-1 rounded-lg bg-[#292820] text-[#FFFCF6]">SEX</span>
                <span className="py-1 rounded-lg bg-[#EDE2CE] text-[#8C6D28] border border-[#E6D2A3]">SÁB</span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const isSelected = day.dateStr === selectedDate;
                  const isToday = day.dateStr === todayStr;
                  const effectiveStatus = getDayEffectiveStatus(day.dateStr);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={cn(
                        "h-14 p-1.5 rounded-xl border flex flex-col justify-between items-center transition-all cursor-pointer font-mono",
                        day.isCurrentMonth ? "bg-white" : "bg-[#F5F0E6]/50 opacity-50",
                        isSelected 
                          ? "ring-2 ring-[#C49A45] border-[#C49A45] bg-[#FFFDF7]" 
                          : "border-[#EDE2CE] hover:border-[#C49A45]",
                        isToday && "border-2 border-[#C49A45]"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-black",
                        isToday ? "text-[#C49A45]" : "text-[#25231F]"
                      )}>
                        {day.dayNumber}
                      </span>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        effectiveStatus.isWork ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Escala Configuration Toggle */}
          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#292820] text-[#E6D2A3] border border-[#C49A45]/30">
                <Sliders className="w-5 h-5 text-[#C49A45]" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-black uppercase text-[#25231F]">
                  MOTOR DE ESCALA AUTOMÁTICA 3C (12x36 / ALTERNADA)
                </h3>
                <p className="text-[11px] text-[#77736B]">
                  Calcula automaticamente os plantões a partir da data-base ({escalaConfig.startDate}).
                </p>
              </div>
            </div>

            <button
              onClick={toggleEscalaConfig}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer border shadow-xs active:scale-95",
                escalaConfig.enabled 
                  ? "bg-emerald-600 text-white border-emerald-700" 
                  : "bg-slate-200 text-slate-700 border-slate-300"
              )}
            >
              {escalaConfig.enabled ? 'ESCALA ATIVA ✓' : 'ESCALA DESLIGADA'}
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT SECTION: PAINEL DO DIA SELECIONADO & AGENDADOR (Col 4)          */}
        {/* ===================================================================== */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Selected Date Card */}
          <div className="bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            
            <div className="border-b border-[#E6D2A3]/60 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#8C6D28]">
                  // DIA SELECIONADO
                </span>
                <span className="text-xs font-mono font-bold text-[#77736B]">{selectedDate}</span>
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-[#25231F] font-sans mt-1 capitalize">
                {selectedDateFormatted}
              </h2>
            </div>

            {/* Quick Status Setting Buttons (Trabalhei, Folga, Falta, Limpar) */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#77736B] block">
                Definir Frequência no Dia:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateStatus(selectedDate, 'trabalhei')}
                  className={cn(
                    "px-3 py-2 rounded-xl font-mono text-xs font-black uppercase transition-all border cursor-pointer",
                    dayStatuses[selectedDate] === 'trabalhei'
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-[#F5F0E6] hover:bg-emerald-50 text-emerald-800 border-emerald-200"
                  )}
                >
                  ✓ TRABALHEI
                </button>

                <button
                  onClick={() => updateStatus(selectedDate, 'folga')}
                  className={cn(
                    "px-3 py-2 rounded-xl font-mono text-xs font-black uppercase transition-all border cursor-pointer",
                    dayStatuses[selectedDate] === 'folga'
                      ? "bg-slate-700 text-white border-slate-800 shadow-xs"
                      : "bg-[#F5F0E6] hover:bg-slate-100 text-slate-700 border-slate-300"
                  )}
                >
                  ☕ FOLGA
                </button>

                <button
                  onClick={() => updateStatus(selectedDate, 'falta')}
                  className={cn(
                    "px-3 py-2 rounded-xl font-mono text-xs font-black uppercase transition-all border cursor-pointer",
                    dayStatuses[selectedDate] === 'falta'
                      ? "bg-red-600 text-white border-red-700 shadow-xs"
                      : "bg-[#F5F0E6] hover:bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  ⚠ FALTA/ATESTADO
                </button>

                <button
                  onClick={() => updateStatus(selectedDate, '')}
                  className="px-3 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all border bg-[#F5F0E6] hover:bg-[#EDE2CE] text-[#77736B] border-[#EDE2CE] cursor-pointer"
                  title="Restaurar regra automática da escala"
                >
                  ↺ PADRÃO ESCALA
                </button>
              </div>
            </div>

            {/* List of Appointments for the selected day */}
            <div className="space-y-2 pt-2 border-t border-[#E6D2A3]/60">
              <span className="text-[10px] font-mono font-bold uppercase text-[#77736B] flex items-center justify-between">
                <span>Compromissos Agendados:</span>
                <span className="text-[#8C6D28] font-black">{selectedDayAppointments.length}</span>
              </span>

              {selectedDayAppointments.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F5F0E6] border border-[#EDE2CE] text-center text-xs font-mono text-[#77736B]">
                  Nenhum compromisso marcado para este dia.
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {selectedDayAppointments.map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 rounded-xl bg-white border border-[#EDE2CE] flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black text-[#C49A45]">{app.time}</span>
                          <span className="text-xs font-mono font-bold text-[#25231F] truncate">{app.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#77736B] uppercase block">
                          {app.type}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteAppointment(app.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        title="Remover compromisso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Appointment Form */}
            <div className="space-y-2 pt-2 border-t border-[#E6D2A3]/60">
              <span className="text-[10px] font-mono font-bold uppercase text-[#77736B] block">
                + Novo Compromisso no Dia
              </span>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Título (ex: Reunião PGR, Vistoria)"
                  value={newAppTitle}
                  onChange={(e) => setNewAppTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F0E6] border border-[#EDE2CE] text-xs font-mono text-[#25231F] placeholder:text-[#77736B] focus:outline-hidden focus:border-[#C49A45]"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={newAppTime}
                    onChange={(e) => setNewAppTime(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#F5F0E6] border border-[#EDE2CE] text-xs font-mono text-[#25231F] focus:outline-hidden focus:border-[#C49A45]"
                  />

                  <select
                    value={newAppType}
                    onChange={(e) => setNewAppType(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#F5F0E6] border border-[#EDE2CE] text-xs font-mono text-[#25231F] focus:outline-hidden focus:border-[#C49A45]"
                  >
                    <option value="corporativo">Corporativo</option>
                    <option value="plantao">Plantão 3C</option>
                    <option value="auditoria">Auditoria</option>
                    <option value="pessoal">Pessoal</option>
                  </select>
                </div>

                <button
                  onClick={() => addAppointment(newAppTime, newAppTitle, newAppType)}
                  disabled={!newAppTitle.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] hover:brightness-110 disabled:opacity-50 text-[#25231F] font-mono font-black text-xs uppercase shadow-sm transition-all border border-[#E6D2A3] cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>AGENDAR COMPROMISSO</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
