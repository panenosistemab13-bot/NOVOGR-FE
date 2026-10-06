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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';

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
    setTimeout(() => setNotification(null), 2200);
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

  const selectedDayAppointments = useMemo(() => {
    return (Object.values(appointments) as Appointment[]).filter((app) => app.date === selectedDate);
  }, [appointments, selectedDate]);

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col items-center justify-start overflow-hidden select-none p-3 sm:p-5">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md"
          >
            <Check size={15} className="text-emerald-400" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg mx-auto space-y-2.5">
        
        {/* ========================================================================= */}
        {/* HEADER HERO BANNER (ULTRA COMPACT)                                        */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#0f172a] text-white px-4 py-3 rounded-xl shadow-md border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={11} />
              CALENDÁRIO 3C
            </span>
            <h1 className="text-lg font-black uppercase tracking-tight text-white font-heading">
              FREQUÊNCIA <span className="text-blue-400">BRASIL</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300">
              ESCALA: <strong className="text-blue-400">{stats.workDays}D</strong>
            </span>

            {onBack && (
              <button
                onClick={onBack}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg transition-all cursor-pointer border border-slate-700"
                title="Voltar"
              >
                <ArrowRightLeft size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ULTRA-ZOOMED-OUT COMPACT CALENDAR BOARD                                   */}
        {/* ========================================================================= */}
        <div className="w-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          
          {/* Controls Bar: Navigation & Today Jump */}
          <div className="flex items-center justify-between gap-2 mb-2.5 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={jumpToToday}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-mono font-black uppercase transition-all cursor-pointer"
              >
                HOJE
              </button>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button
                onClick={prevMonth}
                className="p-1 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft size={13} />
              </button>
              
              <span className="font-mono font-bold text-xs text-slate-900 uppercase px-2 text-center font-heading">
                {monthName}
              </span>

              <button
                onClick={nextMonth}
                className="p-1 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Calendar Matrix Grid (Ultra Zoomed Out) */}
          <div className="w-full flex-1 flex flex-col">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9.5px] font-bold uppercase text-slate-500 mb-1.5">
              <span className="p-0.5 rounded bg-slate-50">DOM</span>
              <span className="p-0.5 rounded bg-slate-50">SEG</span>
              <span className="p-0.5 rounded bg-slate-50">TER</span>
              <span className="p-0.5 rounded bg-slate-50">QUA</span>
              <span className="p-0.5 rounded bg-slate-50">QUI</span>
              <span className="p-0.5 rounded bg-slate-50">SEX</span>
              <span className="p-0.5 rounded bg-slate-50">SÁB</span>
            </div>

            {/* 42-cell Calendar Grid */}
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
                      "min-h-[28px] sm:min-h-[32px] p-0.5 rounded-md border flex flex-col justify-between transition-all cursor-pointer relative group text-left",
                      isSelected
                        ? "border-[#0f172a] bg-blue-50/70 ring-1 ring-[#0f172a] shadow-xs z-10"
                        : isWork
                          ? "bg-slate-50/60 border-slate-200 hover:border-slate-400"
                          : "bg-white border-slate-200 hover:border-slate-300",
                      !d.isCurrentMonth && "opacity-30 bg-slate-50"
                    )}
                  >
                    {/* Top Row: Number & Primary Status Badge */}
                    <div className="flex items-center justify-between gap-0.5">
                      <span className={cn(
                        "font-mono font-bold text-[9px] px-0.5 rounded transition-all",
                        isToday 
                          ? "bg-[#0f172a] text-white shadow-xs" 
                          : isSelected 
                            ? "bg-slate-900 text-white" 
                            : "text-slate-800"
                      )}>
                        {d.dayNumber}
                      </span>

                      {/* Status Badges */}
                      {isWork && (
                        <span className="px-0.5 py-0 rounded bg-blue-100 text-blue-800 font-mono text-[6px] font-black uppercase">
                          ESC
                        </span>
                      )}
                      {isOff && (
                        <span className="px-0.5 py-0 rounded bg-slate-200 text-slate-700 font-mono text-[6px] font-black uppercase">
                          FOL
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Event Badges List */}
                    <div className="space-y-0.5 overflow-hidden">
                      {dayApps.slice(0, 1).map((app) => (
                        <div 
                          key={app.id} 
                          className="bg-white border border-slate-200 rounded px-1 py-0 text-[7.5px] font-mono text-slate-800 truncate flex items-center gap-0.5"
                        >
                          <span className="text-blue-600 font-bold">{app.time}</span>
                          <span className="truncate">{app.title}</span>
                        </div>
                      ))}
                      {dayApps.length > 1 && (
                        <span className="text-[7.5px] font-mono font-bold text-blue-600 block">
                          +{dayApps.length - 1}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail & Appointment Manager Dock */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 text-xs">
            
            {/* Quick Status Buttons for Selected Day */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-mono font-bold uppercase text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[10px]">
                {selectedDate}:
              </span>

              <button
                onClick={() => updateStatus(selectedDate, 'trabalhei')}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 text-[10px]"
              >
                <UserCheck size={11} />
                <span>Trabalho</span>
              </button>

              <button
                onClick={() => updateStatus(selectedDate, 'folga')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 text-[10px]"
              >
                <Coffee size={11} />
                <span>Folga</span>
              </button>

              <button
                onClick={() => updateStatus(selectedDate, '')}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-lg font-mono uppercase transition-all cursor-pointer text-[10px]"
              >
                Limpar
              </button>
            </div>

            {/* Quick Add Appointment Form */}
            <div className="flex items-center gap-1 flex-wrap w-full sm:w-auto justify-end">
              <input
                type="text"
                value={newAppTitle}
                onChange={(e) => setNewAppTitle(e.target.value)}
                placeholder="Novo compromisso..."
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-900 focus:bg-white focus:border-blue-600 outline-none w-36"
              />

              <input
                type="time"
                value={newAppTime}
                onChange={(e) => setNewAppTime(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-[11px] font-mono text-slate-900"
              />

              <button
                onClick={() => addAppointment(newAppTime, newAppTitle, newAppType)}
                className="px-3 py-1 bg-[#0f172a] hover:bg-slate-800 text-white rounded-lg font-mono text-[10px] font-bold uppercase transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
              >
                <Plus size={12} />
                <span>Agendar</span>
              </button>
            </div>

          </div>

          {/* Active Appointments Drawer for Selected Day */}
          {selectedDayAppointments.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-slate-100 bg-slate-50 rounded-lg p-2 text-left space-y-1">
              <span className="text-[9.5px] font-mono font-bold text-slate-600 uppercase tracking-wider block">
                COMPROMISSOS EM {selectedDate} ({selectedDayAppointments.length}):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedDayAppointments.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded px-2 py-1 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-bold text-[9.5px]">
                        {app.time}
                      </span>
                      <span className="font-bold text-slate-800 truncate">{app.title}</span>
                    </div>

                    <button
                      onClick={() => deleteAppointment(app.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
