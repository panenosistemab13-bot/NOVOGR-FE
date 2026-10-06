import React, { useState, useMemo } from 'react';
import { ClipboardCheck, CheckCircle2, Clock, AlertCircle, Filter, Search, Check } from 'lucide-react';
import { CHECKLIST_ITEMS, ChecklistItem } from '../../data/mockData';

export default function ChecklistView() {
  const [items, setItems] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [priorityFilter, setPriorityFilter] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleComplete = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const isDone = item.status === 'Concluído';
        return {
          ...item,
          status: isDone ? 'Em Andamento' : 'Concluído',
          progress: isDone ? 50 : 100
        };
      }
      return item;
    }));
  };

  const sectorStats = useMemo(() => {
    const sectors = Array.from(new Set(items.map(i => i.sector)));
    return sectors.map(sec => {
      const secItems = items.filter(i => i.sector === sec);
      const doneCount = secItems.filter(i => i.status === 'Concluído').length;
      const avgProgress = Math.round(secItems.reduce((acc, curr) => acc + curr.progress, 0) / secItems.length);
      return {
        sector: sec,
        total: secItems.length,
        doneCount,
        pendingCount: secItems.length - doneCount,
        progress: avgProgress
      };
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesStatus = statusFilter === 'TODOS' || item.status === statusFilter;
      const matchesPriority = priorityFilter === 'TODAS' || item.priority === priorityFilter;
      const matchesSearch = !searchTerm.trim() || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [items, statusFilter, priorityFilter, searchTerm]);

  return (
    <div className="w-full space-y-4 p-4 xl:p-6 max-w-[1920px] mx-auto text-left select-none">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121A26] border border-white/10 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest bg-[#172231] px-2.5 py-0.5 rounded border border-white/10">
              MÓDULO DE CONFORMIDADE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight uppercase font-heading flex items-center gap-2">
            <ClipboardCheck size={28} className="text-[#A31324]" />
            Acompanhamento de Checklists
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Inspeções operacionais, conformidade PGR e verificação de frota em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#94A3B8] bg-[#172231] p-3 rounded-xl border border-white/10">
          <div>Concluídos: <strong className="text-[#43D17A]">{items.filter(i => i.status === 'Concluído').length}</strong> / {items.length}</div>
        </div>
      </div>

      {/* SECTOR PROGRESS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {sectorStats.map((sec, idx) => (
          <div key={idx} className="exec-card p-4 space-y-2">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider truncate">
                {sec.sector}
              </span>
              <span className="text-xs font-mono font-bold text-[#D6A84F]">{sec.progress}%</span>
            </div>

            <div className="w-full bg-[#172231] h-2.5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-[#A31324] to-[#43D17A] rounded-full transition-all duration-500"
                style={{ width: `${sec.progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-[#94A3B8]">
              <span>{sec.doneCount} concluídas</span>
              <span className="text-[#E63946]">{sec.pendingCount} pendentes</span>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="exec-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, responsável ou setor..."
            className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#D6A84F]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-[#172231] px-3 py-1.5 rounded-xl border border-white/10 text-[#94A3B8]">
            <Filter size={14} className="text-[#D6A84F]" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#F3F6F8] font-bold outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-[#172231]">TODOS</option>
              <option value="Concluído" className="bg-[#172231]">Concluído</option>
              <option value="Em Andamento" className="bg-[#172231]">Em Andamento</option>
              <option value="Pendente" className="bg-[#172231]">Pendente</option>
              <option value="Atrasado" className="bg-[#172231]">Atrasado</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#172231] px-3 py-1.5 rounded-xl border border-white/10 text-[#94A3B8]">
            <span>Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-[#F3F6F8] font-bold outline-none cursor-pointer"
            >
              <option value="TODAS" className="bg-[#172231]">TODAS</option>
              <option value="Alta" className="bg-[#172231]">Alta</option>
              <option value="Média" className="bg-[#172231]">Média</option>
              <option value="Baixa" className="bg-[#172231]">Baixa</option>
            </select>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="exec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#172231] text-[#94A3B8] text-[10px] font-black uppercase tracking-wider border-b border-white/10">
                <th className="p-3">SETOR</th>
                <th className="p-3">ITEM / TAREFA</th>
                <th className="p-3">RESPONSÁVEL</th>
                <th className="p-3">PRAZO</th>
                <th className="p-3 text-center">PRIORIDADE</th>
                <th className="p-3 text-center">STATUS</th>
                <th className="p-3 text-center">AÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                    Nenhum checklist encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#172231]/60 transition-colors">
                    <td className="p-3 font-bold text-[#D6A84F] uppercase">{item.sector}</td>
                    <td className="p-3 font-extrabold text-[#F3F6F8]">{item.title}</td>
                    <td className="p-3 text-[#94A3B8]">{item.responsible}</td>
                    <td className="p-3 text-[#94A3B8]">{item.deadline}</td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        item.priority === 'Alta' ? 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/40' :
                        item.priority === 'Média' ? 'bg-[#D6A84F]/20 text-[#D6A84F] border border-[#D6A84F]/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {item.priority}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'Concluído' ? 'bg-[#43D17A]/20 text-[#43D17A] border border-[#43D17A]/40' :
                        item.status === 'Em Andamento' ? 'bg-[#4DD6D8]/20 text-[#4DD6D8] border border-[#4DD6D8]/40' :
                        item.status === 'Atrasado' ? 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/40' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto ${
                          item.status === 'Concluído'
                            ? 'bg-[#172231] text-[#94A3B8] hover:text-[#F3F6F8]'
                            : 'bg-[#A31324] hover:bg-[#E63946] text-white shadow-md'
                        }`}
                      >
                        <Check size={12} />
                        <span>{item.status === 'Concluído' ? 'Reabrir' : 'Concluir'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
