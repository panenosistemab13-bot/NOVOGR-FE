import React, { useState, useMemo } from 'react';
import { Route, Navigation, Search, Filter, ShieldCheck, MapPin } from 'lucide-react';
import { ROUTES, RouteItem } from '../../data/mockData';

export default function RotasView() {
  const [routes, setRoutes] = useState<RouteItem[]>(ROUTES);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    return {
      active: routes.filter(r => r.status === 'Ativa').length,
      completed: 1420,
      delayed: routes.filter(r => r.status === 'Atrasada').length,
      attention: routes.filter(r => r.status === 'Em Atenção').length,
    };
  }, [routes]);

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => {
      const matchesStatus = statusFilter === 'TODOS' || r.status === statusFilter;
      const matchesSearch = !searchTerm.trim() ||
        r.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.plate.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [routes, statusFilter, searchTerm]);

  return (
    <div className="w-full space-y-4 p-4 xl:p-6 max-w-[1920px] mx-auto text-left select-none">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121A26] border border-white/10 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest bg-[#172231] px-2.5 py-0.5 rounded border border-white/10">
              MONITORAMENTO DE VIAGENS & EMBARQUES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight uppercase font-heading flex items-center gap-2">
            <Route size={28} className="text-[#A31324]" />
            Painel de Rotas Táticas
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Rastreamento de itinerários autorizados, risco e pontos de passagem no Brasil.
          </p>
        </div>
      </div>

      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="exec-card p-4">
          <span className="text-[10px] font-mono text-[#43D17A] uppercase block font-bold">ROTAS ATIVAS</span>
          <div className="text-3xl font-black text-[#43D17A] font-heading mt-1">{stats.active}</div>
        </div>

        <div className="exec-card p-4">
          <span className="text-[10px] font-mono text-[#4DD6D8] uppercase block font-bold">CONCLUÍDAS</span>
          <div className="text-3xl font-black text-[#4DD6D8] font-heading mt-1">{stats.completed}</div>
        </div>

        <div className="exec-card p-4 bg-[#E63946]/10 border-[#E63946]/30">
          <span className="text-[10px] font-mono text-[#E63946] uppercase block font-bold">ATRASADAS</span>
          <div className="text-3xl font-black text-[#E63946] font-heading mt-1">{stats.delayed}</div>
        </div>

        <div className="exec-card p-4 bg-[#D6A84F]/10 border-[#D6A84F]/30">
          <span className="text-[10px] font-mono text-[#D6A84F] uppercase block font-bold">EM ATENÇÃO</span>
          <div className="text-3xl font-black text-[#D6A84F] font-heading mt-1">{stats.attention}</div>
        </div>
      </div>

      {/* ROUTE VISUALIZER CANVAS CARD */}
      <div className="exec-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-mono font-black text-[#F3F6F8] uppercase tracking-wider flex items-center gap-2">
            <Navigation size={15} className="text-[#D6A84F]" />
            MAPA VETORIAL DE CORREDORES LOGÍSTICOS
          </span>
          <span className="text-[10px] font-mono text-[#43D17A]">● REDE SINCRONIZADA</span>
        </div>

        {/* Vector Canvas Map */}
        <div className="w-full h-[220px] bg-[#172231] rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 800 200">
            {/* Animated Route Lines */}
            <path d="M 150 140 Q 300 40 450 110 T 700 80" fill="none" stroke="#A31324" strokeWidth="3" strokeDasharray="6,4" />
            <path d="M 200 60 Q 400 160 650 120" fill="none" stroke="#4DD6D8" strokeWidth="2" strokeDasharray="4,4" />

            {/* Waypoints */}
            <circle cx="150" cy="140" r="6" fill="#A31324" />
            <text x="150" y="160" fill="#F3F6F8" fontSize="10" fontWeight="bold" textAnchor="middle">SP</text>

            <circle cx="450" cy="110" r="6" fill="#D6A84F" />
            <text x="450" y="130" fill="#F3F6F8" fontSize="10" fontWeight="bold" textAnchor="middle">BH</text>

            <circle cx="700" cy="80" r="6" fill="#43D17A" />
            <text x="700" y="100" fill="#F3F6F8" fontSize="10" fontWeight="bold" textAnchor="middle">DF</text>

            <circle cx="200" cy="60" r="6" fill="#4DD6D8" />
            <text x="200" y="45" fill="#F3F6F8" fontSize="10" fontWeight="bold" textAnchor="middle">PR</text>

            <circle cx="650" cy="120" r="6" fill="#E63946" />
            <text x="650" y="140" fill="#F3F6F8" fontSize="10" fontWeight="bold" textAnchor="middle">BA</text>
          </svg>

          <div className="absolute bottom-3 left-4 text-[10px] font-mono text-[#94A3B8] bg-[#121A26]/80 px-3 py-1 rounded-lg border border-white/10">
            Visão esquemática dos principais corredores táticos em operação.
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
            placeholder="Buscar por código de rota, origem, destino, motorista ou placa..."
            className="w-full bg-[#172231] text-[#F3F6F8] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#D6A84F]"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-[#172231] px-3 py-1.5 rounded-xl border border-white/10 text-[#94A3B8]">
            <Filter size={14} className="text-[#D6A84F]" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#F3F6F8] font-bold outline-none cursor-pointer"
            >
              <option value="TODOS" className="bg-[#172231]">TODOS</option>
              <option value="Ativa" className="bg-[#172231]">Ativa</option>
              <option value="Em Atenção" className="bg-[#172231]">Em Atenção</option>
              <option value="Atrasada" className="bg-[#172231]">Atrasada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="exec-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#172231] text-[#94A3B8] text-[10px] font-black uppercase tracking-wider border-b border-white/10">
                <th className="p-3">ROTA</th>
                <th className="p-3">ORIGEM</th>
                <th className="p-3">DESTINO</th>
                <th className="p-3">MOTORISTA</th>
                <th className="p-3">PLACA</th>
                <th className="p-3">TECNOLOGIA</th>
                <th className="p-3">DISTÂNCIA</th>
                <th className="p-3">ETA</th>
                <th className="p-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRoutes.map((rot) => (
                <tr key={rot.id} className="hover:bg-[#172231]/60 transition-colors">
                  <td className="p-3 font-bold text-[#D6A84F]">{rot.routeCode}</td>
                  <td className="p-3 text-[#F3F6F8]">{rot.origin}</td>
                  <td className="p-3 text-[#F3F6F8]">{rot.destination}</td>
                  <td className="p-3 text-[#94A3B8]">{rot.driver}</td>
                  <td className="p-3 text-[#F3F6F8] font-bold">{rot.plate}</td>
                  <td className="p-3 text-[#94A3B8]">{rot.pgrTech}</td>
                  <td className="p-3 text-[#94A3B8]">{rot.distance}</td>
                  <td className="p-3 text-[#F3F6F8]">{rot.eta}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      rot.status === 'Ativa' ? 'bg-[#43D17A]/20 text-[#43D17A]' :
                      rot.status === 'Em Atenção' ? 'bg-[#D6A84F]/20 text-[#D6A84F]' :
                      'bg-[#E63946]/20 text-[#E63946]'
                    }`}>
                      {rot.status}
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
