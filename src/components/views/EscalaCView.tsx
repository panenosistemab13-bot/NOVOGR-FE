import React, { useState } from 'react';
import { Users, Calendar, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { SHIFT_TEAMS, ShiftTeam } from '../../data/mockData';

export default function EscalaCView() {
  const [teams, setTeams] = useState<ShiftTeam[]>(SHIFT_TEAMS);
  const [viewMode, setViewMode] = useState<'diario' | 'semanal' | 'mensal'>('diario');

  return (
    <div className="w-full space-y-4 p-4 xl:p-6 max-w-[1920px] mx-auto text-left select-none">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#121A26] border border-white/10 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest bg-[#172231] px-2.5 py-0.5 rounded border border-white/10">
              GESTAO DE TURNOS & COBERTURA TÁTICA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F3F6F8] tracking-tight uppercase font-heading flex items-center gap-2">
            <Users size={28} className="text-[#A31324]" />
            Escala C — Turnos Operacionais
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Distribuição de equipes de pronto atendimento, supervisão e alocação de plantão.
          </p>
        </div>

        {/* View Mode Switch */}
        <div className="flex bg-[#172231] p-1.5 rounded-xl border border-white/10 font-mono text-xs">
          {(['diario', 'semanal', 'mensal'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg uppercase font-bold transition-all cursor-pointer ${
                viewMode === mode ? 'bg-[#A31324] text-white shadow-md' : 'text-[#94A3B8] hover:text-[#F3F6F8]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* SHIFT TEAMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="exec-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-heading font-black text-sm text-[#F3F6F8] uppercase">{team.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                team.status === 'Em Operação' ? 'bg-[#43D17A]/20 text-[#43D17A]' :
                team.status === 'Disponível' ? 'bg-[#4DD6D8]/20 text-[#4DD6D8]' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {team.status}
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs text-left">
              <div><span className="text-[#94A3B8]">Turno:</span> <span className="text-[#D6A84F] font-bold">{team.shift}</span></div>
              <div><span className="text-[#94A3B8]">Supervisor:</span> <span className="text-[#F3F6F8] font-bold">{team.supervisor}</span></div>
              <div><span className="text-[#94A3B8]">Região:</span> <span className="text-[#94A3B8] font-semibold">{team.coverageRegion}</span></div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-[#94A3B8]">
                <span>Membros Ativos</span>
                <span className="font-bold text-[#F3F6F8]">{team.activeMembers} / {team.capacity}</span>
              </div>
              <div className="w-full bg-[#172231] h-2 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-[#A31324] rounded-full" 
                  style={{ width: `${(team.activeMembers / team.capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SCHEDULE TABLE */}
      <div className="exec-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-mono font-black text-[#F3F6F8] uppercase tracking-wider flex items-center gap-2">
            <Calendar size={15} className="text-[#D6A84F]" />
            QUADRO DE DISPONIBILIDADE DA ESCALA ({viewMode.toUpperCase()})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#172231] text-[#94A3B8] text-[10px] font-black uppercase tracking-wider border-b border-white/10">
                <th className="p-3">HORÁRIO</th>
                <th className="p-3">EQUIPE RESPONSÁVEL</th>
                <th className="p-3">SUPERVISÃO TÁTICA</th>
                <th className="p-3">COBERTURA</th>
                <th className="p-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-[#172231]/60 transition-colors">
                <td className="p-3 font-bold text-[#D6A84F]">06:00 - 18:00</td>
                <td className="p-3 font-extrabold text-[#F3F6F8]">Equipe ALFA</td>
                <td className="p-3 text-[#94A3B8]">Cap. Fernando Ramos</td>
                <td className="p-3 text-[#94A3B8]">Sudeste / Sul</td>
                <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-[#43D17A]/20 text-[#43D17A] text-[10px] font-black uppercase">Ativo</span></td>
              </tr>
              <tr className="hover:bg-[#172231]/60 transition-colors">
                <td className="p-3 font-bold text-[#D6A84F]">18:00 - 06:00</td>
                <td className="p-3 font-extrabold text-[#F3F6F8]">Equipe BRAVO</td>
                <td className="p-3 text-[#94A3B8]">Ten. Marcos Prado</td>
                <td className="p-3 text-[#94A3B8]">Centro-Oeste / Norte</td>
                <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-[#4DD6D8]/20 text-[#4DD6D8] text-[10px] font-black uppercase">Prontidão</span></td>
              </tr>
              <tr className="hover:bg-[#172231]/60 transition-colors">
                <td className="p-3 font-bold text-[#D6A84F]">12x36 Especial</td>
                <td className="p-3 font-extrabold text-[#F3F6F8]">Equipe CHARLIE</td>
                <td className="p-3 text-[#94A3B8]">Dra. Luciana Veiga</td>
                <td className="p-3 text-[#94A3B8]">Nordeste / Apoio</td>
                <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-[#43D17A]/20 text-[#43D17A] text-[10px] font-black uppercase">Ativo</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
