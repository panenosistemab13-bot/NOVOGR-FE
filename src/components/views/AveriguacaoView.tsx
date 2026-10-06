import React, { useState, useMemo } from 'react';
import { SearchCheck, ShieldAlert, Eye, X, ArrowUpDown, Filter, Search, CheckCircle2 } from 'lucide-react';
import { OCCURRENCE_ITEMS, OccurrenceItem } from '../../data/mockData';

export default function AveriguacaoView() {
  const [occurrences, setOccurrences] = useState<OccurrenceItem[]>(OCCURRENCE_ITEMS);
  const [selectedItem, setSelectedItem] = useState<OccurrenceItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('TODAS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [sortField, setSortFilter] = useState<'date' | 'priority'>('date');

  const stats = useMemo(() => {
    return {
      total: occurrences.length,
      inAnalysis: occurrences.filter(o => o.status === 'Em Análise').length,
      completed: occurrences.filter(o => o.status === 'Concluída').length,
      critical: occurrences.filter(o => o.priority === 'Crítica').length,
    };
  }, [occurrences]);

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter(occ => {
      const matchesSearch = !searchTerm.trim() ||
        occ.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.region.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = priorityFilter === 'TODAS' || occ.priority === priorityFilter;
      const matchesStatus = statusFilter === 'TODOS' || occ.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    }).sort((a, b) => {
      if (sortField === 'date') return b.date.localeCompare(a.date);
      return a.priority.localeCompare(b.priority);
    });
  }, [occurrences, searchTerm, priorityFilter, statusFilter, sortField]);

  return (
    <div className="w-full space-y-4 p-4 xl:p-6 max-w-[1920px] mx-auto text-left select-none">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121A26] border border-white/10 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest bg-[#172231] px-2.5 py-0.5 rounded border border-white/10">
              AUDITORIA & ANÁLISE DE DIVERGÊNCIAS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight uppercase font-heading flex items-center gap-2">
            <SearchCheck size={28} className="text-[#A31324]" />
            Averiguação de Ocorrências
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Consulta detalhada, investigação e auditoria preventiva de divergências logísticas.
          </p>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="exec-card p-4">
          <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">TOTAL DE OCORRÊNCIAS</span>
          <div className="text-3xl font-black text-[#F3F6F8] mt-1 font-heading">{stats.total}</div>
        </div>

        <div className="exec-card p-4">
          <span className="text-[10px] font-mono text-[#4DD6D8] uppercase block">EM ANÁLISE</span>
          <div className="text-3xl font-black text-[#4DD6D8] mt-1 font-heading">{stats.inAnalysis}</div>
        </div>

        <div className="exec-card p-4">
          <span className="text-[10px] font-mono text-[#43D17A] uppercase block">CONCLUÍDAS</span>
          <div className="text-3xl font-black text-[#43D17A] mt-1 font-heading">{stats.completed}</div>
        </div>

        <div className="exec-card p-4 border-[#E63946]/40 bg-[#E63946]/10">
          <span className="text-[10px] font-mono text-[#E63946] uppercase font-bold block">OCORRÊNCIAS CRÍTICAS</span>
          <div className="text-3xl font-black text-[#E63946] mt-1 font-heading">{stats.critical}</div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="exec-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por protocolo, tipo, placa, motorista ou região..."
            className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#D6A84F]"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs flex-wrap w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-[#172231] px-3 py-1.5 rounded-xl border border-white/10 text-[#94A3B8]">
            <Filter size={14} className="text-[#D6A84F]" />
            <span>Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-[#F3F6F8] font-bold outline-none cursor-pointer"
            >
              <option value="TODAS" className="bg-[#172231]">TODAS</option>
              <option value="Crítica" className="bg-[#172231]">Crítica</option>
              <option value="Alta" className="bg-[#172231]">Alta</option>
              <option value="Média" className="bg-[#172231]">Média</option>
              <option value="Baixa" className="bg-[#172231]">Baixa</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#172231] px-3 py-1.5 rounded-xl border border-white/10 text-[#94A3B8]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#F3F6F8] font-bold outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-[#172231]">TODOS</option>
              <option value="Em Análise" className="bg-[#172231]">Em Análise</option>
              <option value="Investigação" className="bg-[#172231]">Investigação</option>
              <option value="Concluída" className="bg-[#172231]">Concluída</option>
            </select>
          </div>

          <button
            onClick={() => setSortFilter(prev => prev === 'date' ? 'priority' : 'date')}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#172231] text-[#94A3B8] hover:text-[#F3F6F8] rounded-xl border border-white/10 cursor-pointer"
          >
            <ArrowUpDown size={13} />
            <span>Ordenar: {sortField === 'date' ? 'Data' : 'Prioridade'}</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="exec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#172231] text-[#94A3B8] text-[10px] font-black uppercase tracking-wider border-b border-white/10">
                <th className="p-3">PROTOCOLO</th>
                <th className="p-3">TIPO DE OCORRÊNCIA</th>
                <th className="p-3">VEÍCULO / PLACA</th>
                <th className="p-3">MOTORISTA</th>
                <th className="p-3">REGIÃO</th>
                <th className="p-3">DATA / HORA</th>
                <th className="p-3 text-center">PRIORIDADE</th>
                <th className="p-3 text-center">STATUS</th>
                <th className="p-3 text-center">DETALHES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOccurrences.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#94A3B8]">
                    Nenhuma ocorrência encontrada para esta busca.
                  </td>
                </tr>
              ) : (
                filteredOccurrences.map((occ) => (
                  <tr key={occ.id} className="hover:bg-[#172231]/60 transition-colors">
                    <td className="p-3 font-bold text-[#D6A84F]">{occ.protocol}</td>
                    <td className="p-3 font-extrabold text-[#F3F6F8]">{occ.type}</td>
                    <td className="p-3 text-[#F3F6F8]">{occ.vehicle}</td>
                    <td className="p-3 text-[#94A3B8]">{occ.driver}</td>
                    <td className="p-3 text-[#94A3B8]">{occ.region}</td>
                    <td className="p-3 text-[#94A3B8]">{occ.date}</td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        occ.priority === 'Crítica' ? 'bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/40' :
                        occ.priority === 'Alta' ? 'bg-[#D6A84F]/20 text-[#D6A84F] border border-[#D6A84F]/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {occ.priority}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        occ.status === 'Concluída' ? 'bg-[#43D17A]/20 text-[#43D17A]' : 'bg-[#4DD6D8]/20 text-[#4DD6D8]'
                      }`}>
                        {occ.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedItem(occ)}
                        className="p-1.5 rounded-lg bg-[#172231] hover:bg-[#A31324] text-[#F3F6F8] transition-colors cursor-pointer mx-auto"
                        title="Ver Detalhes"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="exec-card p-6 w-full max-w-xl border-[#D6A84F]/40 shadow-2xl space-y-4 text-left font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-[#E63946]" />
                <span className="font-heading font-black text-lg text-[#F3F6F8] uppercase">
                  Ocorrência {selectedItem.protocol}
                </span>
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="text-[#94A3B8] hover:text-[#F3F6F8] p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div><span className="text-[#94A3B8]">Tipo:</span> <span className="font-bold text-[#F3F6F8]">{selectedItem.type}</span></div>
              <div><span className="text-[#94A3B8]">Veículo:</span> <span className="font-bold text-[#F3F6F8]">{selectedItem.vehicle}</span></div>
              <div><span className="text-[#94A3B8]">Motorista:</span> <span className="font-bold text-[#F3F6F8]">{selectedItem.driver}</span></div>
              <div><span className="text-[#94A3B8]">Região:</span> <span className="font-bold text-[#F3F6F8]">{selectedItem.region}</span></div>
              <div><span className="text-[#94A3B8]">Valor Carga:</span> <span className="font-bold text-[#D6A84F]">{selectedItem.value}</span></div>
              <div><span className="text-[#94A3B8]">Data/Hora:</span> <span className="font-bold text-[#F3F6F8]">{selectedItem.date}</span></div>
            </div>

            <div className="bg-[#172231] p-3.5 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">DESCRIÇÃO TÁTICA</span>
              <p className="text-xs text-[#F3F6F8] leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-[#172231] hover:bg-[#202D3C] text-[#F3F6F8] text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
