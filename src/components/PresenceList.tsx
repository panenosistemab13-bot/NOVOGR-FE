import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Check,
  ArrowRightLeft,
  Trash2,
  UserCheck,
  Coffee,
  Sparkles,
  ShieldCheck,
  Truck,
  Clock,
  MapPin,
  AlertCircle,
  CalendarDays,
  ListFilter,
  Layers,
  Briefcase,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import heroCinematicEscala from '../assets/images/hero_cinematic_escala_1790216226888.jpg';

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}

interface PresenceListProps {
  onBack?: () => void;
}

export default function PresenceList({ onBack }: PresenceListProps) {
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState<'mes' | 'semana' | 'lista'>('mes');
  const [filterCategory, setFilterCategory] = useState<'todos' | 'escala' | 'compromisso' | 'pendente'>('todos');

  const [dayStatuses, setDayStatuses] = useState<Record<string, 'trabalhei' | 'falta' | 'folga' | ''>>({});
  const [escalaConfig, setEscalaConfig] = useState<{ enabled: boolean; startDate: string }>({
    enabled: true,
    startDate: '2026-06-14',
  });
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});

  // Appointment form
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppTime, setNewAppTime] = useState('09:00');
  const [newAppType, setNewAppType] = useState<'pessoal' | 'corporativo'>('corporativo');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

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

  const updateStatus = (date: string, status: 'trabalhei' | 'falta' | 'folga' | '') => {
    setDayStatuses(prev => ({ ...prev, [date]: status }));
    update(ref(db, 'presence_list/statuses'), { [date]: status });
    showToast(`Status de ${date} atualizado para ${status.toUpperCase() || 'PADRÃO'}`);
  };

  const addAppointment = (time: string, title: string, type: 'pessoal' | 'corporativo') => {
    if (!title.trim() || !time) return;
    const id = `app_${Date.now()}`;
    const newApp: Appointment = { id, date: selectedDate, time, title, type };
    update(ref(db, `presence_list/appointments`), { [id]: newApp });
    setNewAppTitle('');
    showToast('Compromisso agendado com sucesso!');
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
    setSelectedDate(getTodayStr());
    showToast('Navegado para Hoje');
  };

  // Calendar matrix calculation
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

    // Next month padding to fill 42 cells (6 rows x 7 cols)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [viewDate]);

  // Statistics for current month
  const stats = useMemo(() => {
    let workDays = 0;
    let offDays = 0;
    calendarDays.filter(d => d.isCurrentMonth).forEach(d => {
      const status = dayStatuses[d.dateStr];
      if (status === 'trabalhei' || (!status && isAutomaticWorkDay(d.dateStr))) {
        workDays++;
      } else if (status === 'folga') {
        offDays++;
      }
    });
    const totalApps = Object.keys(appointments).length;
    return { workDays, offDays, totalApps };
  }, [calendarDays, dayStatuses, appointments]);

  const upcomingAppointmentsList = useMemo(() => {
    return (Object.values(appointments) as Appointment[])
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [appointments]);

  const selectedDayAppointments = useMemo(() => {
    return (Object.values(appointments) as Appointment[]).filter((app) => app.date === selectedDate);
  }, [appointments, selectedDate]);

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full relative pb-10 space-y-4 font-sans text-[#25231F] text-left bg-[#F5F0E6] p-4 sm:p-6 rounded-3xl border border-[#E6D2A3] shadow-xl">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[#292820] text-[#E6D2A3] border border-[#C49A45]/40 text-xs font-mono font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <Check size={16} className="text-[#C49A45]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-4">
        
        {/* ========================================================================= */}
        {/* 1. EXECUTIVE DASHBOARD HEADER BANNER                                      */}
        {/* ========================================================================= */}
        <div className="relative w-full h-[72px] bg-gradient-to-r from-[#292820] via-[#1f1e18] to-[#292820] rounded-2xl overflow-hidden flex items-center justify-between px-5 sm:px-6 shadow-md border border-[#C49A45]/40">
          <div className="absolute inset-0 opacity-10 bg-repeat bg-[radial-gradient(#C49A45_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E6D2A3] via-[#C49A45] to-[#A07A33] flex items-center justify-center text-[#25231F] shadow-md shrink-0 border border-[#fff5db]/40">
              <CalendarIcon size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] font-black tracking-widest text-[#C49A45] uppercase font-mono">
                AGENDA CORPORATIVA • CENTRAL GR 3C
              </span>
              <span className="text-[18px] sm:text-[22px] font-black tracking-tight text-[#FFFCF6] uppercase mt-0.5 font-heading drop-shadow-sm">
                CALENDÁRIO & FREQUÊNCIA 3C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-[#1a1917]/90 border border-[#C49A45]/40 px-3.5 py-1.5 rounded-xl hidden sm:flex items-center gap-2 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-[#E6D2A3] font-bold">MINHA ESCALA:</span>
              <span className="font-mono font-black text-xs text-[#FFFCF6]">{stats.workDays} DIAS ATIVOS</span>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-xs font-black rounded-xl border bg-gradient-to-r from-[#C49A45] to-[#A07A33] hover:brightness-110 text-white border-[#E6D2A3] cursor-pointer transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                title="Voltar ao menu"
              >
                <ArrowRightLeft size={13} />
                <span>Voltar</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN GRID (CALENDÁRIO + SIDEBAR)                                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* ===================================================================== */}
          {/* MAIN CALENDÁRIO CARD (~68% width -> lg:col-span-8)                    */}
          {/* ===================================================================== */}
          <div className="lg:col-span-8 w-full bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between text-[#25231F]">
            
            {/* TOP CONTROLS BAR: MÊS, SEMANA, LISTA & NAVIGATION */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-[#E6D2A3] pb-3.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={jumpToToday}
                  className="px-3.5 py-2 bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/40 rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles size={13} className="text-[#C49A45]" />
                  <span>HOJE</span>
                </button>
                
                {/* View Mode Selector Tabs */}
                <div className="flex items-center bg-[#F5F0E6] p-1 rounded-xl border border-[#E6D2A3]">
                  <button
                    onClick={() => setCalendarViewMode('mes')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer",
                      calendarViewMode === 'mes' ? "bg-[#292820] text-[#E6D2A3] shadow-xs" : "text-[#77736B] hover:text-[#25231F]"
                    )}
                  >
                    MÊS
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('semana')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer",
                      calendarViewMode === 'semana' ? "bg-[#292820] text-[#E6D2A3] shadow-xs" : "text-[#77736B] hover:text-[#25231F]"
                    )}
                  >
                    SEMANA
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('lista')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer",
                      calendarViewMode === 'lista' ? "bg-[#292820] text-[#E6D2A3] shadow-xs" : "text-[#77736B] hover:text-[#25231F]"
                    )}
                  >
                    LISTA
                  </button>
                </div>
              </div>

              {/* Month Navigator */}
              <div className="flex items-center gap-2 bg-[#292820] p-1.5 rounded-xl border border-[#C49A45]/40 shadow-xs">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg bg-[#1a1917] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/30 transition-all cursor-pointer"
                  title="Mês Anterior"
                >
                  <ChevronLeft size={15} />
                </button>
                
                <span className="font-mono font-black text-xs sm:text-sm text-[#FFFCF6] uppercase px-3 text-center tracking-wider font-heading">
                  {monthName}
                </span>

                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg bg-[#1a1917] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/30 transition-all cursor-pointer"
                  title="Próximo Mês"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* COMPACT CALENDAR GRID */}
            <div className="w-full flex-1 flex flex-col mb-3">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold uppercase mb-2">
                <span className="py-1.5 rounded-lg bg-[#292820] text-[#E6D2A3] border border-[#C49A45]/30">DOM</span>
                <span className="py-1.5 rounded-lg bg-[#292820] text-[#FFFCF6]">SEG</span>
                <span className="py-1.5 rounded-lg bg-[#292820] text-[#FFFCF6]">TER</span>
                <span className="py-1.5 rounded-lg bg-[#292820] text-[#FFFCF6]">QUA</span>
                <span className="py-1.5 rounded-lg bg-[#292820] text-[#FFFCF6]">QUI</span>
                <span className="py-1.5 rounded-lg bg-[#292820] text-[#FFFCF6]">SEX</span>
                <span className="py-1.5 rounded-lg bg-[#292820] text-[#E6D2A3] border border-[#C49A45]/30">SÁB</span>
              </div>

              {/* 42-cell Calendar Grid (Compact & Elegantly Spaced) */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, i) => {
                  const isSelected = selectedDate === d.dateStr;
                  const isToday = d.dateStr === getTodayStr();
                  const isWork = dayStatuses[d.dateStr] === 'trabalhei' || (!dayStatuses[d.dateStr] && isAutomaticWorkDay(d.dateStr));
                  const isOff = dayStatuses[d.dateStr] === 'folga';
                  
                  const dayApps = (Object.values(appointments) as Appointment[]).filter((a: Appointment) => a.date === d.dateStr);

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={cn(
                        "min-h-[58px] sm:min-h-[66px] p-1 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group text-left",
                        isSelected
                          ? "border-[#C49A45] bg-[#FFF8E8] ring-2 ring-[#C49A45]/50 shadow-sm z-10"
                          : isWork
                            ? "bg-gradient-to-br from-[#123531] to-[#0D2522] text-white border-[#1B4D46] shadow-2xs hover:brightness-110"
                            : isOff
                              ? "bg-[#F3EAD8] border-[#E6D2A3]/70 hover:bg-[#EFE3CF]"
                              : "bg-white border-[#E6D2A3]/60 hover:bg-[#FAF6EE]",
                        !d.isCurrentMonth && "opacity-30 bg-[#EFE9DD]"
                      )}
                    >
                      {/* Top Row: Number & Exclusive Scale / Status Badge */}
                      <div className="flex items-center justify-between gap-0.5">
                        <span className={cn(
                          "font-mono font-bold text-[10px] px-1.5 py-0.2 rounded transition-all",
                          isToday 
                            ? "bg-[#292820] text-[#E6D2A3] font-black shadow-xs ring-1 ring-[#C49A45]" 
                            : isSelected 
                              ? "bg-[#C49A45] text-[#25231F] font-black" 
                              : isWork
                                ? "text-emerald-300 font-black"
                                : "text-[#25231F]"
                        )}>
                          {d.dayNumber}
                        </span>

                        {isWork && (
                          <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[7.5px] font-black uppercase tracking-tight flex items-center gap-0.5">
                            <ShieldCheck size={9} /> MINHA ESCALA
                          </span>
                        )}
                        {isOff && (
                          <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono text-[7.5px] font-bold uppercase">
                            FOLGA
                          </span>
                        )}
                      </div>

                      {/* Event Indicators */}
                      <div className="space-y-0.5 overflow-hidden mt-0.5">
                        {dayApps.slice(0, 1).map((app) => (
                          <div 
                            key={app.id} 
                            className={cn(
                              "border rounded px-1 py-0.5 text-[8px] font-mono truncate flex items-center gap-1 shadow-2xs",
                              app.type === 'corporativo' 
                                ? "bg-[#292820] text-[#E6D2A3] border-[#C49A45]/40" 
                                : "bg-white text-stone-900 border-stone-200"
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C49A45] shrink-0" />
                            <span className="truncate">{app.title}</span>
                          </div>
                        ))}
                        {dayApps.length > 1 && (
                          <span className={cn("text-[8px] font-mono font-bold block pl-0.5", isWork ? "text-emerald-200" : "text-[#C49A45]")}>
                            +{dayApps.length - 1} mais
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION & CREATION BAR (BOTTOM) */}
            <div className="pt-3 border-t border-[#E6D2A3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <span className="font-mono font-bold uppercase text-[#E6D2A3] bg-[#292820] px-3 py-1.5 rounded-xl border border-[#C49A45]/40 text-[10px] shadow-2xs">
                  📅 {selectedDate}
                </span>

                <button
                  onClick={() => updateStatus(selectedDate, 'trabalhei')}
                  className="px-2.5 py-1.5 bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/40 rounded-xl font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 text-[10px] active:scale-95"
                >
                  <UserCheck size={12} className="text-[#C49A45]" />
                  <span>Marcar Escala</span>
                </button>

                <button
                  onClick={() => updateStatus(selectedDate, 'folga')}
                  className="px-2.5 py-1.5 bg-[#FFFCF6] hover:bg-[#F3EAD8] text-[#25231F] border border-[#E6D2A3] rounded-xl font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 text-[10px] active:scale-95"
                >
                  <Coffee size={12} className="text-[#C49A45]" />
                  <span>Folga</span>
                </button>
              </div>

              {/* Appointment Creator Form */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
                <input
                  type="text"
                  value={newAppTitle}
                  onChange={(e) => setNewAppTitle(e.target.value)}
                  placeholder="Novo compromisso..."
                  className="bg-white border border-[#E6D2A3] rounded-xl px-3 py-1.5 text-xs text-[#25231F] focus:border-[#C49A45] outline-none w-36 sm:w-44 font-mono font-bold shadow-inner"
                />

                <input
                  type="time"
                  value={newAppTime}
                  onChange={(e) => setNewAppTime(e.target.value)}
                  className="bg-white border border-[#E6D2A3] rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-[#25231F] focus:border-[#C49A45] outline-none shadow-inner"
                />

                <button
                  onClick={() => addAppointment(newAppTime, newAppTitle, newAppType)}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#C49A45] to-[#A07A33] hover:brightness-110 text-white rounded-xl font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 border border-[#E6D2A3]"
                >
                  <Plus size={13} className="stroke-[3]" />
                  <span>Novo Compromisso</span>
                </button>
              </div>

            </div>

            {/* Selected Day Appointments Details Box */}
            {selectedDayAppointments.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-[#E6D2A3] bg-[#FAF6EE] rounded-xl p-3 text-left space-y-1.5 border border-[#E6D2A3]">
                <span className="text-[10px] font-mono font-black text-[#C49A45] uppercase tracking-wider block">
                  COMPROMISSOS EM {selectedDate}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDayAppointments.map((app) => (
                    <div key={app.id} className="bg-white border border-[#E6D2A3] rounded-xl px-3 py-2 flex items-center justify-between text-xs font-mono shadow-2xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="bg-[#292820] text-[#E6D2A3] px-2 py-0.5 rounded-lg font-bold text-[10px] border border-[#C49A45]/30">
                          {app.time}
                        </span>
                        <span className="font-bold text-[#25231F] truncate">{app.title}</span>
                      </div>
                      <button
                        onClick={() => deleteAppointment(app.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>


          {/* ===================================================================== */}
          {/* RIGHT SIDEBAR (~32% width -> lg:col-span-4)                           */}
          {/* ===================================================================== */}
          <div className="lg:col-span-4 w-full space-y-4">
            
            {/* CARD 1: LEGENDA OPERACIONAL */}
            <div className="w-full bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 text-[#25231F]">
              <div className="flex items-center justify-between border-b border-[#E6D2A3] pb-2.5">
                <span className="text-xs font-mono font-black text-[#C49A45] uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon size={14} />
                  LEGENDA OPERACIONAL
                </span>
                <span className="text-[10px] font-mono text-[#77736B]">SISTEMA 3C</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono text-[#25231F]">
                <div className="flex items-center gap-2 bg-[#F5F0E6] p-2.5 rounded-xl border border-[#E6D2A3]">
                  <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0 shadow-2xs" />
                  <span className="font-bold text-[11px]">Viagem / Rota</span>
                </div>

                <div className="flex items-center gap-2 bg-[#F5F0E6] p-2.5 rounded-xl border border-[#E6D2A3]">
                  <span className="w-3 h-3 rounded-full bg-[#292820] shrink-0 shadow-2xs" />
                  <span className="font-bold text-[11px]">Compromisso</span>
                </div>

                <div className="flex items-center gap-2 bg-[#F5F0E6] p-2.5 rounded-xl border border-[#E6D2A3]">
                  <span className="px-1.5 py-0.5 rounded bg-[#123531] text-emerald-300 border border-emerald-500/30 text-[9px] font-black">ESC</span>
                  <span className="font-bold text-[11px]">Minha Escala</span>
                </div>

                <div className="flex items-center gap-2 bg-[#F5F0E6] p-2.5 rounded-xl border border-[#E6D2A3]">
                  <span className="w-3 h-3 rounded-full bg-[#C91F2D] shrink-0 shadow-2xs" />
                  <span className="font-bold text-[11px]">Pendente</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E6D2A3]/60 flex items-center justify-between text-[11px] font-mono font-bold text-stone-600">
                <span>Total de compromissos no mês:</span>
                <span className="text-[#C49A45] font-black text-xs font-mono">{stats.totalApps}</span>
              </div>
            </div>


            {/* CARD 2: PRÓXIMOS COMPROMISSOS */}
            <div className="w-full bg-[#FFFCF6] border border-[#E6D2A3] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 text-[#25231F]">
              <div className="flex items-center justify-between border-b border-[#E6D2A3] pb-2.5">
                <span className="text-xs font-mono font-black text-[#C49A45] uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} />
                  PRÓXIMOS COMPROMISSOS
                </span>
                <span className="text-[10px] font-mono font-bold text-[#292820] bg-[#F5F0E6] px-2.5 py-0.5 rounded-full border border-[#E6D2A3]">
                  {upcomingAppointmentsList.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {upcomingAppointmentsList.length === 0 ? (
                  <div className="text-center py-6 text-xs font-mono text-[#77736B]">
                    Nenhum compromisso agendado.
                  </div>
                ) : (
                  upcomingAppointmentsList.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-[#F5F0E6] border border-[#E6D2A3] hover:border-[#C49A45] rounded-xl p-3 transition-all space-y-1 group shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#77736B]">
                        <span className="text-[#C49A45] font-black flex items-center gap-1">
                          <CalendarIcon size={11} />
                          {app.date}
                        </span>
                        <span className="flex items-center gap-1 text-[#25231F] bg-white px-2 py-0.5 rounded-lg border border-[#E6D2A3] font-bold shadow-2xs">
                          <Clock size={10} className="text-[#C49A45]" />
                          {app.time}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-[#25231F] group-hover:text-[#C49A45] transition-colors">
                        {app.title}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* DECORATIVE CINEMATIC COFFEE BANNER */}
            <div className="relative rounded-2xl overflow-hidden border border-[#C49A45]/40 shadow-md group">
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-10" />
              <img 
                src={heroCinematicEscala} 
                alt="Café 3 Corações" 
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center text-[10px] font-black shadow-md border border-white/40">
                    ♥
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#E6D2A3]">
                    3 CORAÇÕES
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-heading font-black uppercase tracking-tight text-[#FFFCF6]">
                    Juntos vamos mais longe!
                  </h4>
                  <p className="text-[10px] text-stone-300 font-sans">
                    Compromisso e excelência na logística de cada dia.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full bg-[#292820] border-t border-[#C49A45]/40 py-3.5 px-6 text-center text-xs font-mono text-[#E6D2A3] rounded-2xl shadow-md mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C49A45] animate-pulse" />
          <span className="font-bold text-[#FFFCF6]">Juntos em todos os caminhos</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-[#E6D2A3] font-bold">
          <span>3 CORAÇÕES</span>
          <span>|</span>
          <span>LOGÍSTICA</span>
          <span>|</span>
          <span>PESSOAS</span>
          <span>|</span>
          <span>RESULTADOS</span>
        </div>
        <div className="text-[11px] text-[#FFFCF6] font-bold">
          Paixão por cada entrega ☕
        </div>
      </footer>

    </div>
  );
}
