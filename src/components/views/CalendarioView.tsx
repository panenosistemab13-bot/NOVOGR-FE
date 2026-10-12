import React, { useState, useMemo } from 'react';
import { CalendarDays, Plus, Filter, Clock, MapPin, X, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { CALENDAR_EVENTS, CalendarEventItem } from '../../data/mockData';

export default function CalendarioView() {
  const [events, setEvents] = useState<CalendarEventItem[]>(CALENDAR_EVENTS);
  const [selectedDate, setSelectedDate] = useState('2026-10-06');
  const [typeFilter, setTypeFilter] = useState<string>('TODOS');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newType, setNewType] = useState<'Operacional' | 'Reunião' | 'Inspeção' | 'Auditoria'>('Operacional');
  const [newResponsible, setNewResponsible] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvt: CalendarEventItem = {
      id: `evt-${Date.now()}`,
      date: selectedDate,
      time: newTime,
      title: newTitle,
      type: newType,
      responsible: newResponsible || 'Diretoria Operacional',
      location: newLocation || 'Sala Tática 01',
      description: newDescription || 'Compromisso agendado via sistema.'
    };

    setEvents(prev => [...prev, newEvt]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => typeFilter === 'TODOS' || e.type === typeFilter);
  }, [events, typeFilter]);

  return (
    <div className="w-full relative pb-10 space-y-4 font-sans text-[#25231F] text-left bg-[#F5F0E6] p-4 sm:p-6 rounded-3xl border border-[#E6D2A3] shadow-lg">
      
      {/* ========================================================================= */}
      {/* EXECUTIVE DASHBOARD GRAPHIC (CENTRAL CALENDÁRIO OPERACIONAL)               */}
      {/* ========================================================================= */}
      <div className="w-full shrink-0 space-y-3.5">
        {/* Header: AGENDA CORPORATIVA - 3C / CALENDÁRIO OPERACIONAL */}
        <div className="relative w-full h-[68px] bg-[#292820] rounded-2xl overflow-hidden flex items-center justify-between px-5 sm:px-6 shadow-md border border-[#C49A45]/40">
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E6D2A3] to-[#C49A45] flex items-center justify-center text-[#25231F] shadow-sm shrink-0">
              <CalendarDays size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[11px] font-black tracking-widest text-[#C49A45] uppercase font-mono">
                AGENDA CORPORATIVA • 4K ULTRA RESOLUÇÃO
              </span>
              <span className="text-[22px] font-black tracking-tight text-[#FFFCF6] uppercase mt-0.5 font-heading">
                CALENDÁRIO OPERACIONAL
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 text-xs font-black rounded-xl border bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] text-[#25231F] border-[#C49A45]/50 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95 font-mono uppercase tracking-wider"
              title="Adicionar Novo Evento"
            >
              <Plus size={14} className="stroke-[3]" /> Novo Evento
            </button>
          </div>
        </div>

        {/* Filter & Date Selector Bar (SMCreator Gold & Executive Black) */}
        <div className="bg-[#292820] border border-[#C49A45]/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[#E6D2A3] font-black uppercase text-[11px]">DATA SELECIONADA:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#1a1917] text-[#FFFCF6] border border-[#C49A45]/40 rounded-xl px-4 py-2 font-bold outline-none cursor-pointer focus:border-[#E6D2A3] transition-colors shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1a1917] border border-[#C49A45]/40 flex items-center justify-center text-[#C49A45]">
              <Filter size={15} />
            </div>
            <span className="text-[#E6D2A3] font-black uppercase text-[11px]">TIPO DE EVENTO:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#1a1917] text-[#FFFCF6] font-bold px-4 py-2 rounded-xl border border-[#C49A45]/40 outline-none cursor-pointer focus:border-[#E6D2A3] transition-colors shadow-inner"
            >
              <option value="TODOS">TODOS OS EVENTOS</option>
              <option value="Operacional">Operacional</option>
              <option value="Reunião">Reunião</option>
              <option value="Inspeção">Inspeção</option>
              <option value="Auditoria">Auditoria</option>
            </select>
          </div>
        </div>
      </div>

      {/* EVENTS LIST GRID (Matches SMCreator #FFFCF6 executive card with #E6D2A3 border) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="bg-[#FFFCF6] border border-[#E6D2A3] hover:border-[#C49A45] p-5 rounded-2xl shadow-sm space-y-3.5 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-[#E6D2A3]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider ${
                  evt.type === 'Auditoria' ? 'bg-red-100 text-[#C91F2D] border border-red-300' :
                  evt.type === 'Inspeção' ? 'bg-[#F5F0E6] text-[#C49A45] border border-[#E6D2A3]' :
                  evt.type === 'Reunião' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                  'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {evt.type}
                </span>
                <span className="font-heading font-black text-sm text-[#25231F] uppercase">{evt.title}</span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs text-[#25231F] font-black bg-[#F5F0E6] px-3 py-1 rounded-xl border border-[#E6D2A3]">
                <Clock size={13} className="text-[#C49A45]" />
                <span>{evt.time}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-[#F5F0E6] p-2.5 rounded-xl border border-[#E6D2A3]">
                <span className="text-[#7A756D] block text-[10px] uppercase font-bold">Data:</span>
                <span className="text-[#25231F] font-black">{evt.date}</span>
              </div>
              <div className="bg-[#F5F0E6] p-2.5 rounded-xl border border-[#E6D2A3]">
                <span className="text-[#7A756D] block text-[10px] uppercase font-bold">Responsável:</span>
                <span className="text-[#25231F] font-black truncate block">{evt.responsible}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-[#25231F] bg-[#F5F0E6] px-3 py-2 rounded-xl border border-[#E6D2A3]">
              <MapPin size={14} className="text-[#C49A45] shrink-0" />
              <span className="truncate font-bold">{evt.location}</span>
            </div>

            <p className="text-xs font-mono text-[#25231F] bg-white p-3 rounded-xl border border-[#E6D2A3] leading-relaxed shadow-inner">
              {evt.description}
            </p>
          </div>
        ))}
      </div>

      {/* ADD EVENT MODAL (SMCreator Dark & Gold Styling) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddEvent} className="bg-[#292820] border border-[#C49A45]/50 p-6 w-full max-w-md rounded-3xl shadow-2xl space-y-4 text-left font-sans relative overflow-hidden text-[#FFFCF6]">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#A31324]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-heading font-black text-base text-[#F3F6F8] uppercase flex items-center gap-2">
                <CalendarDays size={18} className="text-[#D6A84F]" />
                Agendar Novo Evento ({selectedDate})
              </span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-[#94A3B8] hover:text-[#F3F6F8] p-1.5 rounded-xl bg-[#172231] cursor-pointer border border-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 font-mono text-xs">
              <div>
                <label className="text-[#94A3B8] block mb-1 font-bold">Título do Evento:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Auditoria PGR..."
                  className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 focus:border-[#D6A84F] rounded-xl px-3.5 py-2.5 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94A3B8] block mb-1 font-bold">Horário:</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 focus:border-[#D6A84F] rounded-xl px-3.5 py-2.5 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[#C49A45] block mb-1 font-bold">Tipo:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#1a1917] text-[#FFFCF6] border border-[#C49A45]/40 focus:border-[#E6D2A3] rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold"
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Inspeção">Inspeção</option>
                    <option value="Auditoria">Auditoria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#C49A45] block mb-1 font-bold">Responsável:</label>
                <input
                  type="text"
                  value={newResponsible}
                  onChange={(e) => setNewResponsible(e.target.value)}
                  placeholder="Ex: Diretoria de Risco"
                  className="w-full bg-[#1a1917] text-[#FFFCF6] border border-[#C49A45]/40 focus:border-[#E6D2A3] rounded-xl px-3.5 py-2.5 outline-none font-bold placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="text-[#C49A45] block mb-1 font-bold">Local / Sala:</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Ex: Sala Tática 01"
                  className="w-full bg-[#1a1917] text-[#FFFCF6] border border-[#C49A45]/40 focus:border-[#E6D2A3] rounded-xl px-3.5 py-2.5 outline-none font-bold placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="text-[#C49A45] block mb-1 font-bold">Descrição / Pauta:</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  className="w-full bg-[#1a1917] text-[#FFFCF6] border border-[#C49A45]/40 focus:border-[#E6D2A3] rounded-xl px-3.5 py-2.5 outline-none resize-none placeholder:text-stone-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 bg-[#1a1917] hover:bg-[#38372d] text-[#E6D2A3] text-xs font-bold uppercase rounded-xl cursor-pointer border border-[#C49A45]/40 font-mono"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-[#E6D2A3] to-[#C49A45] text-[#25231F] text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md font-mono active:scale-95"
              >
                Salvar Evento
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
