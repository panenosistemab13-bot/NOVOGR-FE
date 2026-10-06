import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Check,
  ArrowRightLeft,
  Clock,
  Trash2,
  CalendarCheck2,
  Briefcase,
  UserCheck,
  Coffee,
  Sparkles,
  Tag
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
    <div className="w-full min-h-screen bg-[#f4eee5] text-[#1a1614] font-sans flex flex-col justify-between overflow-x-hidden select-none pb-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-[#1a1614]/95 text-white border border-[#dfb15b]/40 text-xs font-mono font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <Check size={16} className="text-[#ffd54f]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-4 p-2 sm:p-4 max-w-[1700px] mx-auto">
        
        {/* ========================================================================= */}
        {/* HEADER HERO BANNER (EXECUTIVE METALLIC RED)                               */}
        {/* ========================================================================= */}
        <div className="w-full bg-gradient-to-r from-[#7a0c16] via-[#c4161c] to-[#910d14] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-white/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-1 relative z-10 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-[#ffd54f] uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} />
                ESCALAS, FREQUÊNCIA & AGENDA OPERACIONAL 3C
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 font-heading">
              CALENDÁRIO <span className="text-[#ffd54f]">BRASIL</span>
            </h1>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap relative z-10">
            <div className="bg-black/25 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-left">
              <span className="text-[9px] font-mono font-bold text-white/70 uppercase block">ESCALA NO MÊS</span>
              <span className="text-sm font-mono font-black text-[#ffd54f]">
                {stats.workDays} Dias
              </span>
            </div>

            <div className="bg-black/25 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-left">
              <span className="text-[9px] font-mono font-bold text-white/70 uppercase block">FOLGAS</span>
              <span className="text-sm font-mono font-black text-white">
                {stats.offDays} Dias
              </span>
            </div>

            <div className="bg-black/25 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-left">
              <span className="text-[9px] font-mono font-bold text-white/70 uppercase block">SELECIONADO</span>
              <span className="text-sm font-mono font-black text-[#ffd54f]">
                {selectedDate}
              </span>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all cursor-pointer border border-white/20"
                title="Voltar ao Painel Principal"
              >
                <ArrowRightLeft size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CALENDAR BOARD                                                       */}
        {/* ========================================================================= */}
        <div className="w-full bg-white border border-[#e8ded2] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between relative min-h-[620px]">
          
          {/* Controls Bar: Navigation & Today Jump */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10 border-b border-[#f0e8dd] pb-3.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded2] text-[#1a1614] font-mono text-xs font-black uppercase">
                <CalendarIcon size={15} className="text-[#c4161c]" />
                <span>Grade Mensal de Frequência</span>
              </div>

              <button
                onClick={jumpToToday}
                className="px-3 py-1.5 bg-[#fae8e9] hover:bg-[#f5c6cb] text-[#c4161c] border border-[#f5c6cb] rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer"
              >
                HOJE
              </button>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center gap-2 bg-[#fbf8f3] p-1 rounded-xl border border-[#e8ded2]">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg bg-white hover:bg-[#f4ece0] text-[#1a1614] border border-[#e8ded2] transition-colors cursor-pointer shadow-2xs"
                title="Mês Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="font-mono font-black text-sm text-[#1a1614] uppercase px-3 min-w-[160px] text-center font-heading">
                {monthName}
              </span>

              <button
                onClick={nextMonth}
                className="p-2 rounded-lg bg-white hover:bg-[#f4ece0] text-[#1a1614] border border-[#e8ded2] transition-colors cursor-pointer shadow-2xs"
                title="Próximo Mês"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Matrix Grid */}
          <div className="w-full flex-1 flex flex-col">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center font-mono text-[11px] font-black uppercase text-[#8a7c6e] mb-3">
              <span className="p-1 rounded bg-[#fbf8f3]">DOMINGO</span>
              <span className="p-1 rounded bg-[#fbf8f3]">SEGUNDA</span>
              <span className="p-1 rounded bg-[#fbf8f3]">TERÇA</span>
              <span className="p-1 rounded bg-[#fbf8f3]">QUARTA</span>
              <span className="p-1 rounded bg-[#fbf8f3]">QUINTA</span>
              <span className="p-1 rounded bg-[#fbf8f3]">SEXTA</span>
              <span className="p-1 rounded bg-[#fbf8f3]">SÁBADO</span>
            </div>

            {/* 42-cell Calendar Grid */}
            <div className="grid grid-cols-7 gap-2.5 flex-1">
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
                      "min-h-[92px] sm:min-h-[105px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer relative group text-left",
                      isSelected
                        ? "border-[#c4161c] bg-[#fae8e9]/20 ring-2 ring-[#c4161c] shadow-md z-10"
                        : isWork
                          ? "bg-[#fffdfa] border-[#e8ded2] hover:border-[#c4161c]"
                          : "bg-white border-[#f0e8dd] hover:border-[#d9cdbd]",
                      !d.isCurrentMonth && "opacity-35 bg-[#fbf8f3]"
                    )}
                  >
                    {/* Top Row: Number & Primary Status Badge */}
                    <div className="flex items-center justify-between gap-1">
                      <span className={cn(
                        "font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-lg transition-all",
                        isToday 
                          ? "bg-[#c4161c] text-white shadow-xs font-heading" 
                          : isSelected 
                            ? "bg-[#1a1614] text-white" 
                            : "text-[#1a1614]"
                      )}>
                        {d.dayNumber}
                      </span>

                      {/* Status Badges */}
                      {isWork && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#fae8e9] text-[#c4161c] border border-[#f5c6cb] font-mono text-[9px] font-black uppercase">
                          ESCALA
                        </span>
                      )}
                      {isOff && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#f4ece0] text-[#73675a] border border-[#e8ded2] font-mono text-[9px] font-black uppercase">
                          FOLGA
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Event Badges List */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayApps.slice(0, 2).map((app) => (
                        <div 
                          key={app.id} 
                          className="bg-[#fbf8f3] border border-[#e8ded2] rounded-md px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-[#1a1614] truncate flex items-center gap-1"
                        >
                          <span className="text-[#c4161c] font-black">{app.time}</span>
                          <span className="truncate">{app.title}</span>
                        </div>
                      ))}
                      {dayApps.length > 2 && (
                        <span className="text-[8.5px] font-mono font-black text-[#c4161c] block">
                          +{dayApps.length - 2} mais
                        </span>
                      )}
                    </div>

                    {/* Bottom Indicator Dot */}
                    <div className="flex items-center justify-between text-[8.5px] font-mono text-[#8a7c6e]">
                      <span className="uppercase">
                        {isToday ? '• HOJE' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Detail & Appointment Manager Dock */}
          <div className="mt-4 pt-4 border-t border-[#f0e8dd] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 z-10">
            
            {/* Quick Status Buttons for Selected Day */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-black uppercase text-[#1a1614] flex items-center gap-1.5 bg-[#fbf8f3] px-3 py-1.5 rounded-xl border border-[#e8ded2]">
                <CalendarCheck2 size={14} className="text-[#c4161c]" />
                DIA {selectedDate}:
              </span>

              <button
                onClick={() => updateStatus(selectedDate, 'trabalhei')}
                className="px-3.5 py-2 bg-[#fae8e9] hover:bg-[#f5c6cb] text-[#c4161c] border border-[#f5c6cb] rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <UserCheck size={14} />
                <span>Marcar Escala / Trabalho</span>
              </button>

              <button
                onClick={() => updateStatus(selectedDate, 'folga')}
                className="px-3.5 py-2 bg-[#fbf8f3] hover:bg-[#f4ece0] text-[#73675a] border border-[#e8ded2] rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <Coffee size={14} />
                <span>Marcar Folga</span>
              </button>

              <button
                onClick={() => updateStatus(selectedDate, '')}
                className="px-2.5 py-2 bg-white hover:bg-stone-100 text-[#8a7c6e] border border-[#e8ded2] rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                title="Limpar Alteração Manual"
              >
                Limpar
              </button>
            </div>

            {/* Quick Add Appointment Form */}
            <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap flex-1 justify-end">
              <input
                type="text"
                value={newAppTitle}
                onChange={(e) => setNewAppTitle(e.target.value)}
                placeholder={`Novo compromisso para ${selectedDate}...`}
                className="bg-[#fbf8f3] border border-[#e8ded2] rounded-xl px-3 py-2 text-xs font-bold text-[#1a1614] focus:bg-white focus:border-[#c4161c] outline-none flex-1 max-w-sm"
              />

              <input
                type="time"
                value={newAppTime}
                onChange={(e) => setNewAppTime(e.target.value)}
                className="bg-[#fbf8f3] border border-[#e8ded2] rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-[#1a1614]"
              />

              <select
                value={newAppType}
                onChange={(e) => setNewAppType(e.target.value as 'pessoal' | 'corporativo')}
                className="bg-[#fbf8f3] border border-[#e8ded2] rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-[#1a1614] uppercase appearance-none cursor-pointer"
              >
                <option value="corporativo">Corp</option>
                <option value="pessoal">Pessoal</option>
              </select>

              <button
                onClick={() => addAppointment(newAppTime, newAppTitle, newAppType)}
                className="px-4 py-2 bg-gradient-to-r from-[#c4161c] to-[#910d14] text-white rounded-xl font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus size={15} />
                <span>Agendar</span>
              </button>
            </div>

          </div>

          {/* Active Appointments Drawer for Selected Day (If any exist) */}
          {selectedDayAppointments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#f0e8dd] bg-[#fbf8f3] rounded-xl p-3 text-left space-y-2">
              <span className="text-[10px] font-mono font-black text-[#c4161c] uppercase tracking-wider block">
                COMPROMISSOS AGENDADOS EM {selectedDate} ({selectedDayAppointments.length}):
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedDayAppointments.map((app) => (
                  <div key={app.id} className="bg-white border border-[#e8ded2] rounded-lg p-2 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="bg-[#fae8e9] text-[#c4161c] px-1.5 py-0.5 rounded font-black text-[10px]">
                        {app.time}
                      </span>
                      <span className="font-bold text-[#1a1614] truncate">{app.title}</span>
                    </div>

                    <button
                      onClick={() => deleteAppointment(app.id)}
                      className="text-[#8a7c6e] hover:text-rose-600 transition-colors p-1 cursor-pointer"
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

        {/* ========================================================================= */}
        {/* FOOTER TICKER                                                            */}
        {/* ========================================================================= */}
        <div className="w-full bg-gradient-to-r from-[#7a0c16] via-[#8c0f18] to-[#5e070e] text-white p-2.5 sm:p-3 rounded-2xl shadow-md border border-white/20 flex flex-col sm:flex-row items-center justify-between text-[10.5px] font-mono gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 font-black text-[#ffd54f]">
              <span className="w-2 h-2 rounded-full bg-[#ffd54f] inline-block animate-ping" />
              SISTEMA DE ESCALA & FREQUÊNCIA OPERACIONAL 3C
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">Coletor: Sincronizado</span>
            <span className="text-white/40">•</span>
            <span className="text-[#ffd54f] font-bold">{stats.totalApps} compromissos gravados</span>
          </div>

          <div className="flex items-center gap-2 text-white/70 text-[9.5px] uppercase">
            <span>[HOJE] ir para data atual</span>
            <span>•</span>
            <span className="text-[#ffd54f] font-bold">[3C] CALENDÁRIO OPERACIONAL</span>
          </div>
        </div>

      </div>

    </div>
  );
}
