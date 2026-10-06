import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Coffee, 
  Users,
  ChevronUp,
  Heart,
  Calendar as CalendarIcon,
  Camera,
  LayoutGrid,
  Briefcase,
  User,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Eye,
  MoreVertical,
  SlidersHorizontal,
  Tv,
  CheckCircle2,
  Check,
  MapPin,
  Sparkles,
  ArrowRightLeft,
  Building2,
  FileText,
  Globe,
  CalendarCheck2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { safeCopyText } from '../utils/clipboard';
import { BrazilMapBroadcast, BRAZIL_STATES } from './common/BrazilMapBroadcast';

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

const UF_TICKER = [
  'BR', 'MG', 'SP', 'RJ', 'PR', 'SC', 'RS', 'BA', 'DF', 'ES', 'GO', 
  'MT', 'MS', 'PA', 'CE', 'PE', 'RN', 'PB', 'AL', 'SE', 'TO', 'RO'
];

export default function PresenceList({ onBack }: PresenceListProps) {
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedUf, setSelectedUf] = useState<string>('BR');
  const [centerMode, setCenterMode] = useState<'calendar' | 'map'>('calendar');

  const [dayStatuses, setDayStatuses] = useState<Record<string, 'trabalhei' | 'falta' | 'folga' | ''>>({});
  const [dayTimes, setDayTimes] = useState<Record<string, { entrada: string; saida: string }>>({});
  const [escalaConfig, setEscalaConfig] = useState<{ enabled: boolean; startDate: string }>({
    enabled: true,
    startDate: '2026-06-14',
  });
  const [bancoHorasManual, setBancoHorasManual] = useState<number>(0);
  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});

  // Appointment form
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppTime, setNewAppTime] = useState('12:00');
  const [newAppType, setNewAppType] = useState<'pessoal' | 'corporativo'>('corporativo');
  const [searchFilter, setSearchFilter] = useState('');
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
        if (data.times) setDayTimes(data.times);
        if (data.escalaConfig) setEscalaConfig(data.escalaConfig);
        if (data.bancoHorasManual !== undefined && typeof data.bancoHorasManual === 'number') {
          setBancoHorasManual(data.bancoHorasManual);
        }
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

  // Appointments for the selected day
  const selectedDayAppointments = useMemo(() => {
    return (Object.values(appointments) as Appointment[]).filter((app: Appointment) => app.date === selectedDate);
  }, [appointments, selectedDate]);

  // All upcoming appointments
  const allAppointmentsList = useMemo(() => {
    const list = Object.values(appointments) as Appointment[];
    if (!searchFilter.trim()) {
      return list.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    }
    return list.filter((a: Appointment) => 
      a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.date.includes(searchFilter) ||
      a.time.includes(searchFilter)
    );
  }, [appointments, searchFilter]);

  // Presence metrics
  const totalAppsCount = Object.keys(appointments).length;
  const currentMonthWorkDaysCount = useMemo(() => {
    return calendarDays.filter(d => d.isCurrentMonth && (dayStatuses[d.dateStr] === 'trabalhei' || isAutomaticWorkDay(d.dateStr))).length;
  }, [calendarDays, dayStatuses]);

  // Map state presence distribution
  const presenceMapData = useMemo(() => {
    const data: Record<string, { status: 'active' | 'secondary' | 'neutral'; count: number; detail: string; color: string }> = {};

    BRAZIL_STATES.forEach(st => {
      const isBase = ['MG', 'SP', 'RJ', 'PR', 'SC', 'RS', 'BA', 'DF', 'ES', 'GO'].includes(st.uf);
      data[st.uf] = {
        status: isBase ? 'active' : 'secondary',
        count: isBase ? (st.uf === 'MG' ? 18 : 6) : 0,
        detail: isBase 
          ? `Polo Ativo • Base ${st.name} (${st.uf}) • 100% Presença Confirmada` 
          : `Posto Avançado • ${st.name} (${st.uf}) • Em Monitoramento`,
        color: isBase ? '#c4161c' : '#8a7c6e'
      };
    });

    return data;
  }, []);

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full min-h-screen bg-[#f4eee5] text-[#1a1614] font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
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

      <div className="w-full space-y-3.5 p-2 sm:p-4 max-w-[1700px] mx-auto">
        
        {/* ========================================================================= */}
        {/* MASTER BROADCAST HERO PANELS                                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          
          {/* Top Left Title Banner (3C Vermelho Corporativo & Vinho) */}
          <div className="lg:col-span-7 bg-gradient-to-r from-[#7a0c16] via-[#c4161c] to-[#910d14] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
            <div className="space-y-1 relative z-10 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-[#ffd54f] uppercase tracking-widest">
                  ESCALAS, FREQUÊNCIA & AGENDA OPERACIONAL
                </span>
                <span className="bg-white/20 text-[#ffd54f] text-[9px] font-mono font-black px-2 py-0.5 rounded-full border border-white/30 uppercase">
                  SISTEMA 3C
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 font-heading">
                CALENDÁRIO <span className="text-[#ffd54f]">BRASIL</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 relative z-10">
              <div className="bg-black/25 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-left">
                <span className="text-[9px] font-mono font-bold text-white/80 uppercase block">STATUS DO DIA</span>
                <span className="text-xs font-mono font-black text-[#ffd54f] uppercase tracking-wide">
                  {selectedDate === getTodayStr() ? 'HOJE SELECIONADO' : selectedDate}
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

          {/* Top Right Broadcast Progress Card */}
          <div className="lg:col-span-5 bg-white border border-[#e8ded2] p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-black text-[#8a7c6e] uppercase tracking-wider">
                FREQUÊNCIA — OPERAÇÃO BRASIL
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#1a1614] tracking-tight font-heading">
                88,40%
              </span>
            </div>

            <div className="w-full bg-[#f4ece0] h-3 rounded-full overflow-hidden border border-[#e8ded2] p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#c4161c] via-[#b8141c] to-[#dfb15b] rounded-full transition-all duration-700 shadow-xs"
                style={{ width: '88.4%' }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#8a7c6e] mt-2">
              <span>{currentMonthWorkDaysCount} Dias de Escala no Mês</span>
              <span className="text-[#c4161c] font-black">{totalAppsCount} Compromissos Agendados</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MAIN SPLIT VIEW: CALENDAR / MAP (LEFT) + BROADCAST TABLE (RIGHT)          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
          
          {/* LEFT 7 COLUMNS: BROADCAST CALENDAR OR MAP VIEW */}
          <div className="xl:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between relative min-h-[580px]">
            
            {/* Top Bar with Mode Toggle & Month Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex bg-[#f4ece0] p-1 rounded-xl border border-[#e8ded2]">
                  <button
                    onClick={() => setCenterMode('calendar')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-mono text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5",
                      centerMode === 'calendar' ? "bg-gradient-to-r from-[#c4161c] to-[#910d14] text-white shadow-xs" : "text-[#57493d] hover:text-[#1a1614]"
                    )}
                  >
                    <CalendarIcon size={13} />
                    <span>Grade Mensal</span>
                  </button>
                  <button
                    onClick={() => setCenterMode('map')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg font-mono text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5",
                      centerMode === 'map' ? "bg-[#7a0c16] text-white shadow-xs" : "text-[#57493d] hover:text-[#1a1614]"
                    )}
                  >
                    <Globe size={13} />
                    <span>Mapa Nacional</span>
                  </button>
                </div>
              </div>

              {centerMode === 'calendar' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg bg-[#fbf8f3] hover:bg-white text-[#57493d] border border-[#e8ded2] transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-mono font-black text-sm text-[#1a1614] uppercase px-2 min-w-[140px] text-center font-heading">
                    {monthName}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg bg-[#fbf8f3] hover:bg-white text-[#57493d] border border-[#e8ded2] transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Center Visualizer: Calendar Grid vs Vector Map */}
            {centerMode === 'calendar' ? (
              <div className="w-full flex-1 flex flex-col">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] font-black uppercase text-[#8a7c6e] mb-2">
                  <span>DOM</span>
                  <span>SEG</span>
                  <span>TER</span>
                  <span>QUA</span>
                  <span>QUI</span>
                  <span>SEX</span>
                  <span>SÁB</span>
                </div>

                {/* 42-cell Calendar Matrix */}
                <div className="grid grid-cols-7 gap-1.5 flex-1">
                  {calendarDays.map((d, i) => {
                    const isSelected = selectedDate === d.dateStr;
                    const isToday = d.dateStr === getTodayStr();
                    const isWork = dayStatuses[d.dateStr] === 'trabalhei' || (!dayStatuses[d.dateStr] && isAutomaticWorkDay(d.dateStr));
                    const isOff = dayStatuses[d.dateStr] === 'folga';
                    const hasApps = (Object.values(appointments) as Appointment[]).some((a: Appointment) => a.date === d.dateStr);

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedDate(d.dateStr)}
                        className={cn(
                          "min-h-[64px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group",
                          isSelected
                            ? "border-[#c4161c] bg-[#c4161c]/5 ring-2 ring-[#c4161c]/30 shadow-xs"
                            : isWork
                              ? "bg-[#fbf8f3] border-[#e8ded2] hover:border-[#c4161c]"
                              : "bg-white border-[#f0e8dd] hover:border-[#e8ded2]",
                          !d.isCurrentMonth && "opacity-35"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "font-mono font-black text-xs",
                            isToday ? "bg-[#c4161c] text-white px-1.5 py-0.5 rounded-md text-[10px]" : "text-[#1a1614]"
                          )}>
                            {d.dayNumber}
                          </span>

                          {/* Work indicator */}
                          {isWork && (
                            <span className="w-2 h-2 rounded-full bg-[#c4161c]" title="Dia de Escala" />
                          )}
                          {isOff && (
                            <span className="w-2 h-2 rounded-full bg-[#d4c5b1]" title="Folga" />
                          )}
                        </div>

                        {/* Appointments Dot Bar */}
                        <div className="flex items-center gap-1 mt-1">
                          {hasApps && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#dfb15b] text-[#5c3c00] font-mono text-[8px] font-black">
                              AGENDA
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full flex-1 flex items-center justify-center my-2 relative">
                <BrazilMapBroadcast
                  selectedUf={selectedUf === 'BR' ? null : selectedUf}
                  onSelectUf={(uf) => setSelectedUf(uf)}
                  stateData={presenceMapData}
                  activeColor="#c4161c"
                  secondaryColor="#8a7c6e"
                  titleLegend="PRESENÇA NACIONAL POR UF"
                  legendItems={[
                    { label: 'Polos Operacionais 3C', count: '10 UFs', color: '#c4161c' },
                    { label: 'Unidades de Monitoramento', count: '17 UFs', color: '#8a7c6e' }
                  ]}
                />
              </div>
            )}

            {/* Bottom Quick Appointment Form */}
            <div className="mt-4 pt-3 border-t border-[#f0e8dd] flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={newAppTitle}
                  onChange={(e) => setNewAppTitle(e.target.value)}
                  placeholder={`Novo agendamento para ${selectedDate}...`}
                  className="bg-[#fbf8f3] border border-[#e8ded2] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1a1614] focus:bg-white focus:border-[#c4161c] outline-none flex-1 sm:w-72"
                />
                <input
                  type="time"
                  value={newAppTime}
                  onChange={(e) => setNewAppTime(e.target.value)}
                  className="bg-[#fbf8f3] border border-[#e8ded2] rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-[#1a1614]"
                />
                <button
                  onClick={() => addAppointment(newAppTime, newAppTitle, newAppType)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#c4161c] to-[#910d14] text-white rounded-xl font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateStatus(selectedDate, 'trabalhei')}
                  className="px-2.5 py-1 bg-[#fae8e9] hover:bg-[#f5d0d3] text-[#c4161c] border border-[#f5c6cb] rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                >
                  Marcar Trabalho
                </button>
                <button
                  onClick={() => updateStatus(selectedDate, 'folga')}
                  className="px-2.5 py-1 bg-[#fbf8f3] hover:bg-[#f4ece0] text-[#73675a] border border-[#e8ded2] rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                >
                  Marcar Folga
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: BROADCAST SUMMARY & AGENDA LEADERBOARD */}
          <div className="xl:col-span-5 space-y-3.5">
            
            {/* Candidate / Attendance Leader Cards */}
            <div className="bg-white border border-[#e8ded2] rounded-2xl p-4 shadow-xs space-y-3">
              <span className="text-[9.5px] font-mono font-black text-[#8a7c6e] uppercase tracking-wider block">
                FREQUÊNCIA E COBERTURA EM TEMPO REAL
              </span>

              {/* Leader Card 1: Presença Confirmada */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded2]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c4161c] to-[#910d14] text-white flex items-center justify-center font-mono font-black text-sm shadow-xs">
                    100
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-xs font-black text-[#1a1614] uppercase block">PRESENÇA CONFIRMADA</span>
                    <span className="text-[10px] font-mono font-bold text-[#8a7c6e] mt-1 block">Escala Principal 12x36</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-black text-[#c4161c] block">88,40%</span>
                  <span className="text-[9px] font-bold text-[#8a7c6e] uppercase">Quadro Ativo</span>
                </div>
              </div>

              {/* Leader Card 2: Aguardando / Turno */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded2]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7a0c16] text-white flex items-center justify-center font-mono font-black text-sm shadow-xs">
                    AGD
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-xs font-black text-[#1a1614] uppercase block">BANCO DE HORAS & FOLGAS</span>
                    <span className="text-[10px] font-mono font-bold text-[#8a7c6e] mt-1 block">Compensações e Turnos</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-black text-[#7a0c16] block">11,60%</span>
                  <span className="text-[9px] font-bold text-[#8a7c6e] uppercase">Reserva Operacional</span>
                </div>
              </div>
            </div>

            {/* Detailed Table Card (Matching 3C Leaderboard) */}
            <div className="bg-white border border-[#e8ded2] rounded-2xl p-4 shadow-xs space-y-3">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0e8dd] pb-3">
                <div className="text-left">
                  <h4 className="text-xs font-mono font-black text-[#1a1614] uppercase tracking-wide flex items-center gap-1.5 font-heading">
                    <CalendarCheck2 size={14} className="text-[#c4161c]" />
                    AGENDA DO DIA ({selectedDate})
                  </h4>
                  <span className="text-[10px] font-mono text-[#8a7c6e] block mt-0.5">
                    {selectedDayAppointments.length} agendamentos no dia selecionado
                  </span>
                </div>

                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a7c6e]" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar agenda..."
                    className="bg-[#fbf8f3] border border-[#e8ded2] rounded-xl pl-7 pr-2.5 py-1 text-xs font-mono font-bold text-[#1a1614] outline-none w-36 focus:w-48 transition-all"
                  />
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-y-auto max-h-[460px] rounded-xl border border-[#e8ded2]">
                <table className="w-full border-collapse text-left font-mono text-xs">
                  <thead className="sticky top-0 bg-gradient-to-r from-[#7a0c16] via-[#910d14] to-[#7a0c16] text-white z-10 text-[9.5px] uppercase font-black tracking-wider">
                    <tr>
                      <th className="p-2.5 w-16 text-center">HORA</th>
                      <th className="p-2.5">COMPROMISSO / TAREFA</th>
                      <th className="p-2.5 text-center w-20">TIPO</th>
                      <th className="p-2.5 text-center w-12">AÇÃO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e8dd] bg-white">
                    {allAppointmentsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-[#8a7c6e] text-xs">
                          Nenhum agendamento encontrado para esta seleção.
                        </td>
                      </tr>
                    ) : (
                      allAppointmentsList.map((app) => {
                        const isTodayApp = app.date === selectedDate;

                        return (
                          <tr 
                            key={app.id} 
                            className={cn(
                              "hover:bg-[#fbf8f3] transition-colors group",
                              isTodayApp && "bg-[#fbf4eb]"
                            )}
                          >
                            {/* Time Badge */}
                            <td className="p-2.5 text-center font-black">
                              <span className="bg-[#f4ece0] text-[#1a1614] px-2 py-0.5 rounded text-[10.5px]">
                                {app.time}
                              </span>
                            </td>

                            {/* Title & Date */}
                            <td className="p-2.5">
                              <div>
                                <span className="font-extrabold text-[#1a1614] text-[11px] block truncate max-w-[200px] sm:max-w-xs">
                                  {app.title}
                                </span>
                                <span className="text-[9.5px] text-[#8a7c6e] block mt-0.5">
                                  {app.date}
                                </span>
                              </div>
                            </td>

                            {/* Type Badge */}
                            <td className="p-2.5 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[9.5px] font-black uppercase",
                                app.type === 'corporativo'
                                  ? "bg-[#fae8e9] text-[#c4161c] border border-[#f5c6cb]"
                                  : "bg-[#fdf3e7] text-[#b88628] border border-[#f3debe]"
                              )}>
                                {app.type === 'corporativo' ? 'CORP' : 'PESSOAL'}
                              </span>
                            </td>

                            {/* Action Delete */}
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => deleteAppointment(app.id)}
                                className="p-1 text-[#8a7c6e] hover:text-rose-600 transition-colors cursor-pointer"
                                title="Remover"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM BROADCAST STUDIO TICKER FOOTER                                      */}
        {/* ========================================================================= */}
        <div className="w-full bg-gradient-to-r from-[#7a0c16] via-[#8c0f18] to-[#5e070e] text-white p-2.5 sm:p-3 rounded-2xl shadow-md border border-white/20 flex flex-col sm:flex-row items-center justify-between text-[10.5px] font-mono gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 font-black text-[#ffd54f]">
              <span className="w-2 h-2 rounded-full bg-[#ffd54f] inline-block animate-ping" />
              FONTE: ESCALA OPERACIONAL & FREQUÊNCIA 3C
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">Coletor: Sincronizado</span>
            <span className="text-white/40">•</span>
            <span className="text-[#ffd54f] font-bold">{totalAppsCount} registros</span>
          </div>

          <div className="flex items-center gap-2 text-white/70 text-[9.5px] uppercase">
            <span>[↑↓] navegar</span>
            <span>•</span>
            <span>[←→] selecionar dia</span>
            <span>•</span>
            <span>[M] mapa/grade</span>
            <span>•</span>
            <span className="text-[#ffd54f] font-bold">[3C] FREQUÊNCIA</span>
          </div>
        </div>

      </div>

    </div>
  );
}
