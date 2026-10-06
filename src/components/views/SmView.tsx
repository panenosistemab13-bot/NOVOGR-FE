import React, { useState, useMemo } from 'react';
import { Share2, Filter, Search, PieChart as PieChartIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { SM_RECORDS, SmRecord } from '../../data/mockData';

const DONUT_COLORS = ['#43D17A', '#4DD6D8', '#D6A84F', '#E63946'];

export default function SmView() {
  const [records, setRecords] = useState<SmRecord[]>(SM_RECORDS);
  const [regionFilter, setRegionFilter] = useState('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    return {
      total: 1890,
      pending: 45,
      completed: 1780,
      delayed: 25,
    };
  }, []);

  const donutData = useMemo(() => {
    return [
      { name: 'Em Trânsito', value: 62 },
      { name: 'Chegada Confirmada', value: 28 },
      { name: 'Em Análise', value: 7 },
      { name: 'Retida', value: 3 },
    ];
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesRegion = regionFilter === 'TODAS' || r.region === regionFilter;
      const matchesSearch = !searchTerm.trim() ||
        r.smCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [records, regionFilter, searchTerm]);

  return (
    <div className="w-full space-y-4 p-4 xl:p-6 max-w-[1920px] mx-auto text-left select-none">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121A26] border border-white/10 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest bg-[#172231] px-2.5 py-0.5 rounded border border-white/10">
              SOLICITAÇÃO DE MONITORAMENTO (SM)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight uppercase font-heading flex items-center gap-2">
            <Share2 size={28} className="text-[#A31324]" />
            Acompanhamento de SM
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Gerenciamento e rastreamento de solicitações de viagens averbadas.
          </p>
        </div>
      </div>

      {/* METRICS & DONUT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Metric Cards (Left 7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="exec-card p-4 flex flex-col justify-center">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">TOTAL DE SMs</span>
            <div className="text-3xl font-black text-[#F3F6F8] font-heading mt-1">{stats.total}</div>
          </div>

          <div className="exec-card p-4 flex flex-col justify-center">
            <span className="text-[10px] font-mono text-[#4DD6D8] uppercase block">PENDÊNCIAS</span>
            <div className="text-3xl font-black text-[#4DD6D8] font-heading mt-1">{stats.pending}</div>
          </div>

          <div className="exec-card p-4 flex flex-col justify-center">
            <span className="text-[10px] font-mono text-[#43D17A] uppercase block">CONCLUÍDAS</span>
            <div className="text-3xl font-black text-[#43D17A] font-heading mt-1">{stats.completed}</div>
          </div>

          <div className="exec-card p-4 flex flex-col justify-center bg-[#E63946]/10 border-[#E63946]/30">
            <span className="text-[10px] font-mono text-[#E63946] uppercase block font-bold">ATRASADAS</span>
            <div className="text-3xl font-black text-[#E63946] font-heading mt-1">{stats.delayed}</div>
          </div>
        </div>

        {/* Donut Chart (Right 5 Cols) */}
        <div className="lg:col-span-5 exec-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-mono font-black text-[#F3F6F8] uppercase tracking-wider flex items-center gap-1.5">
              <PieChartIcon size={15} className="text-[#D6A84F]" />
              SITUAÇÃO DAS SOLICITAÇÕES
            </span>
          </div>

          <div className="h-[140px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#172231', borderRadius: '8px', borderColor: 'rgba(255,255,255,0.1)', color: '#F3F6F8', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-[10px] font-mono text-[#94A3B8]">
            <span className="text-[#43D17A]">Em Trânsito: 62%</span>
            <span className="text-[#4DD6D8]">Entregue: 28%</span>
            <span className="text-[#E63946]">Retida/Atraso: 10%</span>
          </div>
        </div>

      </div>

      {/* FILTER & TABLE */}
      <div className="exec-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código SM, transportadora, origem ou destino..."
            className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#D6A84F]"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-[#172231] px-3 py-1.5 rounded-xl border border-white/10 text-[#94A3B8]">
            <Filter size={14} className="text-[#D6A84F]" />
            <span>Região:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent text-[#F3F6F8] font-bold outline-none cursor-pointer"
            >
              <option value="TODAS" className="bg-[#172231]">TODAS</option>
              <option value="Sudeste" className="bg-[#172231]">Sudeste</option>
              <option value="Sul" className="bg-[#172231]">Sul</option>
              <option value="Nordeste" className="bg-[#172231]">Nordeste</option>
            </select>
          </div>
        </div>
      </div>

      <div className="exec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#172231] text-[#94A3B8] text-[10px] font-black uppercase tracking-wider border-b border-white/10">
                <th className="p-3">CÓDIGO SM</th>
                <th className="p-3">TRANSPORTADORA</th>
                <th className="p-3">ORIGEM</th>
                <th className="p-3">DESTINO</th>
                <th className="p-3">CARGA</th>
                <th className="p-3">VALOR</th>
                <th className="p-3">ETA</th>
                <th className="p-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.map((sm) => (
                <tr key={sm.id} className="hover:bg-[#172231]/60 transition-colors">
                  <td className="p-3 font-bold text-[#D6A84F]">{sm.smCode}</td>
                  <td className="p-3 font-extrabold text-[#F3F6F8]">{sm.carrier}</td>
                  <td className="p-3 text-[#94A3B8]">{sm.origin}</td>
                  <td className="p-3 text-[#94A3B8]">{sm.destination}</td>
                  <td className="p-3 text-[#94A3B8]">{sm.cargoType}</td>
                  <td className="p-3 text-[#F3F6F8] font-bold">{sm.value}</td>
                  <td className="p-3 text-[#94A3B8]">{sm.eta}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      sm.status === 'Em Trânsito' ? 'bg-[#4DD6D8]/20 text-[#4DD6D8]' :
                      sm.status === 'Concluído' ? 'bg-[#43D17A]/20 text-[#43D17A]' :
                      'bg-[#E63946]/20 text-[#E63946]'
                    }`}>
                      {sm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
