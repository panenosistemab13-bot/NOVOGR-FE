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
  AlertCircle
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
    <div className="w-full min-h-screen bg-[#080A0C] text-[#F4F0E8] font-sans flex flex-col items-center justify-between overflow-y-auto select-none relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-[#121517] text-[#F4F0E8] border border-[#E5C27A]/30 text-xs font-mono font-bold flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <Check size={16} className="text-[#E5C27A]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        
        {/* ========================================================================= */}
        {/* 1. HERO CINEMATOGRÁFICO                                                   */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full relative rounded-2xl overflow-hidden border border-[#E5C27A]/25 shadow-[0_20px_50px_rgba(0,0,0,0.8)] min-h-[170px] flex items-center px-6 sm:px-10 py-6"
        >
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroCinematicEscala} 
              alt="Central Logística 3 Corações" 
              className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080A0C]/95 via-[#080A0C]/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 w-full">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0D1012]/90 border border-[#E5C27A]/40 flex items-center justify-center shadow-2xl text-[#E5C27A] shrink-0">
                <CalendarIcon size={30} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] sm:text-xs font-mono font-black text-[#E5C27A] uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-lg bg-[#C9973E]/15 border border-[#C9973E]/30 flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={12} />
                    CALENDÁRIO 3C
                  </span>
                  <span className="text-[10px] font-mono text-[#A8A39A] hidden sm:inline">CENTRAL GR • LOGÍSTICA</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white font-heading drop-shadow-md">
                  FREQUÊNCIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9973E] via-[#E5C27A] to-[#D9AD5A]">BRASIL</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#D8D3C8] max-w-2xl font-sans drop-shadow">
                  Acompanhe e gerencie a frequência de viagens, rotas e compromissos de toda a operação logística.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <div className="bg-[#080A0C]/80 backdrop-blur-md border border-[#E5C27A]/30 px-5 py-3 rounded-xl flex items-center gap-3 shadow-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E5C27A] animate-pulse" />
                <span className="text-xs font-mono text-[#A8A39A]">ESCALA:</span>
                <span className="font-mono font-black text-base text-[#E5C27A]">{stats.workDays}D</span>
              </div>

              {onBack && (
                <button
                  onClick={onBack}
                  className="bg-[#121517] hover:bg-[#171A1C] text-[#F4F0E8] px-4 py-3 rounded-xl transition-all cursor-pointer border border-[#E5C27A]/30 flex items-center gap-2 text-xs font-mono font-bold shadow-xl"
                  title="Voltar"
                >
                  <ArrowRightLeft size={15} className="text-[#E5C27A]" />
                  <span className="hidden sm:inline">Voltar</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>


        {/* ========================================================================= */}
        <div>
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    
    {/* ===================================================================== */}
    {/* 3. CALENDÁRIO PRINCIPAL (~68% width -> lg:col-span-8)                 */}
    {/* ===================================================================== */}
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="lg:col-span-8 w-full bg-[#101416] border border-[#E5C27A]/15 rounded-[22px] p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.40)] flex flex-col justify-between"
    >
      
      {/* 5. CABEÇALHO DO CALENDÁRIO */}
      <div className="flex items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={jumpToToday}
            className="px-3.5 py-1.5 bg-[#171A1C] hover:bg-[#121517] text-[#E5C27A] border border-[#E5C27A]/30 rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>HOJE</span>
          </button>
          
          <div className="text-xs font-mono text-[#D8D3C8] uppercase font-bold tracking-wider">
            Mês Ativo: <span className="text-[#E5C27A]">{monthName}</span>
          </div>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2 bg-[#0D1012] p-1.5 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-[#171A1C] hover:bg-[#080A0C] text-[#F4F0E8] border border-white/10 transition-all cursor-pointer hover:border-[#E5C27A]/40"
            title="Mês Anterior"
          >
            <ChevronLeft size={15} className="text-[#E5C27A]" />
          </button>
          
          <span className="font-mono font-black text-xs sm:text-sm text-white uppercase px-3 text-center tracking-wider font-heading">
            {monthName}
          </span>

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-[#171A1C] hover:bg-[#080A0C] text-[#F4F0E8] border border-white/10 transition-all cursor-pointer hover:border-[#E5C27A]/40"
            title="Próximo Mês"
          >
            <ChevronRight size={15} className="text-[#E5C27A]" />
          </button>
        </div>
      </div>

      {/* 6. GRID DO CALENDÁRIO */}
      <div className="w-full flex-1 flex flex-col mb-5">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[11px] font-bold uppercase text-[#A8A39A] mb-2">
          <span className="py-1.5 rounded-lg bg-[#0D1012] text-[#E5C27A]">DOM</span>
          <span className="py-1.5 rounded-lg bg-[#0D1012] text-[#F4F0E8]">SEG</span>
          <span className="py-1.5 rounded-lg bg-[#0D1012] text-[#F4F0E8]">TER</span>
          <span className="py-1.5 rounded-lg bg-[#0D1012] text-[#F4F0E8]">QUA</span>
          <span className="py-1.5 rounded-lg bg-[#0D1012] text-[#F4F0E8]">QUI</span>
          <span className="py-1.5 rounded-lg bg-[#0D1012] text-[#F4F0E8]">SEX</span>
          <span className="py-1.5 rounded-lg bg-[#0D1012] text-[#E5C27A]">SÁB</span>
        </div>

        {/* 42-cell Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
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
                  "min-h-[72px] sm:min-h-[82px] p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group text-left",
                  isSelected
                    ? "border-[#D9AD5A] bg-[rgba(201,151,62,0.10)] ring-1 ring-[#D9AD5A]/50 shadow-[0_0_15px_rgba(217,173,90,0.25)] z-10"
                    : isWork
                      ? "bg-[#0D1012] border-white/[0.08] hover:bg-[rgba(201,151,62,0.08)] hover:border-[#C9973E]/30"
                      : "bg-[#0D1012] border-white/[0.06] hover:bg-[rgba(201,151,62,0.06)] hover:border-white/20",
                  !d.isCurrentMonth && "opacity-25 bg-[#080A0C]"
                )}
              >
                {/* Top Row: Number & Status Indicator */}
                <div className="flex items-center justify-between gap-0.5">
                  <span className={cn(
                    "font-mono font-bold text-[10px] px-1.5 py-0.2 rounded transition-all",
                    isToday 
                      ? "bg-[#E5C27A] text-[#080A0C] font-black shadow-sm" 
                      : isSelected 
                        ? "bg-[#D9AD5A] text-[#080A0C] font-black" 
                        : "text-[#FFFFFF]"
                  )}>
                    {d.dayNumber}
                  </span>

                  {/* Status Badges */}
                  {isWork && (
                    <span className="px-1 py-0 rounded bg-[#C9973E]/20 text-[#E5C27A] border border-[#C9973E]/30 font-mono text-[8px] font-black uppercase">
                      ESC
                    </span>
                  )}
                  {isOff && (
                    <span className="px-1 py-0 rounded bg-white/5 text-[#A8A39A] border border-white/10 font-mono text-[8px] font-black uppercase">
                      FOL
                    </span>
                  )}
                </div>

                {/* Event Indicators */}
                <div className="space-y-0.5 overflow-hidden mt-0.5">
                  {dayApps.slice(0, 1).map((app) => (
                    <div 
                      key={app.id} 
                      className="bg-[#080A0C] border border-white/10 rounded px-1 py-0.5 text-[8.5px] font-mono text-[#F4F0E8] truncate flex items-center gap-1 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5C27A] shrink-0" />
                      <span className="truncate">{app.title}</span>
                    </div>
                  ))}
                  {dayApps.length > 1 && (
                    <span className="text-[8.5px] font-mono font-bold text-[#E5C27A] block pl-0.5">
                      +{dayApps.length - 1} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10. ÁREA DE CONTROLES */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Status / Date Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <span className="font-mono font-bold uppercase text-[#E5C27A] bg-[#0D1012] px-2.5 py-1.5 rounded-lg border border-white/10 text-[10px]">
            {selectedDate}
          </span>

          <button
            onClick={() => updateStatus(selectedDate, 'trabalhei')}
            className="px-2.5 py-1.5 bg-[#C9973E]/15 hover:bg-[#C9973E]/25 text-[#E5C27A] border border-[#C9973E]/30 rounded-lg font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 text-[10px]"
          >
            <UserCheck size={12} />
            <span>Trabalho</span>
          </button>

          <button
            onClick={() => updateStatus(selectedDate, 'folga')}
            className="px-2.5 py-1.5 bg-[#171A1C] hover:bg-[#121517] text-[#D8D3C8] border border-white/10 rounded-lg font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 text-[10px]"
          >
            <Coffee size={12} />
            <span>Folga</span>
          </button>

          <button
            onClick={() => updateStatus(selectedDate, '')}
            className="px-2 py-1.5 bg-[#080A0C] hover:bg-[#171A1C] text-[#A8A39A] border border-white/10 rounded-lg font-mono uppercase transition-all cursor-pointer text-[10px]"
          >
            Limpar
          </button>
        </div>

        {/* Appointment Creator Form */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
          <input
            type="text"
            value={newAppTitle}
            onChange={(e) => setNewAppTitle(e.target.value)}
            placeholder="Novo compromisso..."
            className="bg-[#0D1012] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:bg-[#171A1C] focus:border-[#D9AD5A] outline-none w-36 sm:w-44 font-mono"
          />

          <input
            type="time"
            value={newAppTime}
            onChange={(e) => setNewAppTime(e.target.value)}
            className="bg-[#0D1012] border border-white/15 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:border-[#D9AD5A] outline-none"
          />

          <button
            onClick={() => addAppointment(newAppTime, newAppTitle, newAppType)}
            className="px-3.5 py-1.5 bg-[#D9AD5A] hover:bg-[#E5C27A] text-[#080A0C] rounded-lg font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-md flex items-center gap-1 shrink-0"
          >
            <Plus size={13} />
            <span>Agendar</span>
          </button>
        </div>

      </div>

      {/* Selected Day Appointments Drawer if any */}
      {selectedDayAppointments.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-white/10 bg-[#0D1012] rounded-xl p-3 text-left space-y-1.5 border border-white/10">
          <span className="text-[10px] font-mono font-bold text-[#E5C27A] uppercase tracking-wider block">
            COMPROMISSOS EM {selectedDate}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedDayAppointments.map((app) => (
              <div key={app.id} className="bg-[#171A1C] border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="bg-[#C9973E]/20 text-[#E5C27A] px-1.5 py-0.5 rounded font-bold text-[10px]">
                    {app.time}
                  </span>
                  <span className="font-bold text-white truncate">{app.title}</span>
                </div>
                <button
                  onClick={() => deleteAppointment(app.id)}
                  className="text-[#A8A39A] hover:text-[#D71920] transition-colors p-0.5 cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </motion.div>


    {/* ===================================================================== */}
    {/* 9. PAINEL DIREITO (~32% width -> lg:col-span-4)                       */}
    {/* ===================================================================== */}
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="lg:col-span-4 w-full space-y-5"
    >
      
      {/* CARD 1: LEGENDA */}
      <div className="w-full bg-[#101416] border border-[#E5C27A]/15 rounded-[22px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.40)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="text-xs font-mono font-black text-[#E5C27A] uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon size={14} />
            LEGENDA
          </span>
          <span className="text-[10px] font-mono text-[#A8A39A]">SISTEMA 3C</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono text-[#D8D3C8]">
          <div className="flex items-center gap-2 bg-[#0D1012] p-2 rounded-xl border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9973E] shrink-0" />
            <span>Viagem / Rota</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0D1012] p-2 rounded-xl border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5C27A] shrink-0" />
            <span>Compromisso</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0D1012] p-2 rounded-xl border border-white/5">
            <span className="px-1.5 py-0.5 rounded bg-[#C9973E]/20 text-[#E5C27A] border border-[#C9973E]/30 text-[9px] font-black">ESC</span>
            <span>Escala</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0D1012] p-2 rounded-xl border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D71920] shrink-0" />
            <span>Pendente</span>
          </div>
        </div>
      </div>


      {/* CARD 2: PRÓXIMOS COMPROMISSOS */}
      <div className="w-full bg-[#101416] border border-[#E5C27A]/15 rounded-[22px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.40)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="text-xs font-mono font-black text-[#E5C27A] uppercase tracking-wider flex items-center gap-2">
            <Clock size={14} />
            PRÓXIMOS COMPROMISSOS
          </span>
          <span className="text-[10px] font-mono text-[#A8A39A]">
            ({upcomingAppointmentsList.length})
          </span>
        </div>

        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {upcomingAppointmentsList.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-[#A8A39A]">
              Nenhum compromisso agendado.
            </div>
          ) : (
            upcomingAppointmentsList.map((app) => (
              <div 
                key={app.id}
                className="bg-[#0D1012] border border-white/5 hover:border-[#E5C27A]/30 rounded-xl p-3 transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A39A]">
                  <span className="text-[#E5C27A] font-bold flex items-center gap-1">
                    <CalendarIcon size={11} />
                    {app.date}
                  </span>
                  <span className="flex items-center gap-1 text-white bg-white/5 px-2 py-0.5 rounded">
                    <Clock size={10} className="text-[#E5C27A]" />
                    {app.time}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-white group-hover:text-[#E5C27A] transition-colors">
                  {app.title}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </motion.div>

  </div>
</div>

      </div>

      {/* FOOTER */}
      <footer className="w-full bg-[#0D1012] border-t border-white/10 py-4 px-6 text-center text-xs font-mono text-[#A8A39A] mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D71920]" />
          <span>Juntos em todos os caminhos</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest text-[#E5C27A]">
          <span>3 CORAÇÕES</span>
          <span>|</span>
          <span>LOGÍSTICA</span>
          <span>|</span>
          <span>PESSOAS</span>
          <span>|</span>
          <span>RESULTADOS</span>
        </div>
        <div className="text-[11px] text-[#A8A39A]">
          Juntos vamos mais longe ❤️
        </div>
      </footer>

    </div>
  );
}
