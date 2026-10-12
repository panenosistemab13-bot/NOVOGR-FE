import React from 'react';
import { LayoutGrid, FileText, Radio, Sliders, Truck, Calendar, Route, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const modules = [
  { id: 'averbacao', title: 'AVERBAÇÃO', desc: 'SEGUROS DE CARGA', icon: FileText },
  { id: 'sm', title: 'SM', desc: 'MONITORAMENTO', icon: Radio },
  { id: 'controle', title: 'PRÉ-ALERTA', desc: 'ISCAS & CONTROLE PGR', icon: Sliders },
  { id: 'disponibilidade', title: 'DISPONIBILIDADE', desc: 'VEÍCULOS PÁTIO', icon: Truck },
  { id: 'escala', title: 'ESCALA 3C', desc: 'PLANTÃO LOGÍSTICO', icon: Calendar },
  { id: 'rotas', title: 'ROTAS', desc: 'PGR E DESTINOS', icon: Route, active: true },
  { id: 'config', title: 'CONFIGURAÇÕES & PÁGINAS', desc: '', icon: Settings },
];

export default function OperationalMenu() {
  return (
    <div className="w-full h-full p-6 bg-[#F5EFE4] text-[#33291B] flex flex-col gap-6 font-sans">
      {/* Header institucional */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d41a22] to-[#7f0b12] flex items-center justify-center text-white font-black text-xl">3C</div>
        <div>
          <h1 className="text-2xl font-black uppercase">CENTRAL GR</h1>
          <p className="text-sm text-[#857662] font-semibold">LOGÍSTICA QUE APROXIMA</p>
        </div>
      </div>

      {/* Cartão principal */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#C69A45] to-[#DDB76B] text-[#33291B] shadow-xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF9EF] flex items-center justify-center text-[#91651F]">
          <LayoutGrid size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase">MENU OPERACIONAL</h2>
          <p className="text-sm font-semibold opacity-90">PAINEL CENTRAL</p>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {modules.map((m) => (
          <div key={m.id} className={cn(
            "p-4 rounded-2xl border border-[#D9C39B] flex items-center gap-3 transition-all",
            m.active ? "bg-[#C69A45] text-white" : "bg-[#FFF9EF] hover:bg-[#EEE2CD]"
          )}>
            <div className="w-10 h-10 rounded-xl bg-[#F5EFE4] flex items-center justify-center text-[#91651F]">
              <m.icon size={20} />
            </div>
            <div>
              <p className="font-black text-sm">{m.title}</p>
              <p className="text-[10px] font-semibold opacity-70">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <p className="text-center text-[#857662] font-semibold text-xs border-t border-[#D9C39B] pt-4">
        Juntos em todos os caminhos
      </p>
    </div>
  );
}
