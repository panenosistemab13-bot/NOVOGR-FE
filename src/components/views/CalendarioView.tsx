import React, { useState, useMemo } from 'react';
import { CalendarDays, Plus, Filter, Clock, MapPin, X, Check } from 'lucide-react';
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
    <div className="w-full space-y-4 p-4 xl:p-6 max-w-[1920px] mx-auto text-left select-none">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121A26] border border-white/10 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest bg-[#172231] px-2.5 py-0.5 rounded border border-white/10">
              AGENDA CORPORATIVA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight uppercase font-heading flex items-center gap-2">
            <CalendarDays size={28} className="text-[#A31324]" />
            Calendário Operacional
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Gestão de inspeções, auditorias, reuniões táticas e compromissos institucionais.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#A31324] to-[#700C18] hover:from-[#E63946] text-white rounded-xl font-mono text-xs font-black uppercase tracking-wider border border-[#D6A84F]/40 shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Novo Evento</span>
        </button>
      </div>

      {/* FILTER & DATE SELECTOR BAR */}
      <div className="exec-card p-4 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[#94A3B8]">Data Selecionada:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl px-3 py-1.5 font-bold outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#D6A84F]" />
          <span className="text-[#94A3B8]">Tipo de Evento:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#172231] text-[#F3F6F8] font-bold px-3 py-1.5 rounded-xl border border-white/10 outline-none cursor-pointer"
          >
            <option value="TODOS">TODOS</option>
            <option value="Operacional">Operacional</option>
            <option value="Reunião">Reunião</option>
            <option value="Inspeção">Inspeção</option>
            <option value="Auditoria">Auditoria</option>
          </select>
        </div>
      </div>

      {/* EVENTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="exec-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                  evt.type === 'Auditoria' ? 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/40' :
                  evt.type === 'Inspeção' ? 'bg-[#D6A84F]/20 text-[#D6A84F] border border-[#D6A84F]/40' :
                  evt.type === 'Reunião' ? 'bg-[#4DD6D8]/20 text-[#4DD6D8] border border-[#4DD6D8]/40' :
                  'bg-[#43D17A]/20 text-[#43D17A] border border-[#43D17A]/40'
                }`}>
                  {evt.type}
                </span>
                <span className="font-heading font-black text-sm text-[#F3F6F8]">{evt.title}</span>
              </div>

              <span className="font-mono text-xs text-[#D6A84F] font-bold">{evt.time}</span>
            </div>

            <div className="space-y-1 font-mono text-xs text-left">
              <div><span className="text-[#94A3B8]">Data:</span> <span className="text-[#F3F6F8] font-bold">{evt.date}</span></div>
              <div><span className="text-[#94A3B8]">Responsável:</span> <span className="text-[#F3F6F8] font-bold">{evt.responsible}</span></div>
              <div><span className="text-[#94A3B8]">Local:</span> <span className="text-[#94A3B8]">{evt.location}</span></div>
            </div>

            <p className="text-xs font-mono text-[#94A3B8] bg-[#172231] p-3 rounded-xl border border-white/5 leading-relaxed">
              {evt.description}
            </p>
          </div>
        ))}
      </div>

      {/* ADD EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddEvent} className="exec-card p-6 w-full max-w-md border-[#D6A84F]/40 shadow-2xl space-y-4 text-left font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-heading font-black text-base text-[#F3F6F8] uppercase">
                Agendar Novo Evento ({selectedDate})
              </span>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-[#94A3B8] hover:text-[#F3F6F8] p-1 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#94A3B8] block mb-1">Título do Evento:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Auditoria PGR..."
                  className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#94A3B8] block mb-1">Horário:</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#94A3B8] block mb-1">Tipo:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Reunião">Reunião</option>
                    <option value="Inspeção">Inspeção</option>
                    <option value="Auditoria">Auditoria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1">Responsável:</label>
                <input
                  type="text"
                  value={newResponsible}
                  onChange={(e) => setNewResponsible(e.target.value)}
                  placeholder="Ex: Diretoria de Risco"
                  className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-[#94A3B8] block mb-1">Descrição / Pauta:</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl px-3 py-2 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#172231] text-[#F3F6F8] text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#A31324] hover:bg-[#E63946] text-white text-xs font-bold uppercase rounded-xl cursor-pointer"
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
