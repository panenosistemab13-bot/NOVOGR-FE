import React from 'react';
import { 
  X, 
  MapPin, 
  Truck, 
  Clock, 
  CloudSun, 
  Warehouse, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface CityHubModalProps {
  city: string | null;
  onClose: () => void;
  onNavigateToRotas?: () => void;
}

const CITY_DETAILS: Record<string, {
  region: string;
  role: string;
  activeTrucks: number;
  dockOccupancy: string;
  weather: string;
  status: string;
  recentDestinations: string[];
}> = {
  'Manaus': {
    region: 'Norte',
    role: 'Pólo Industrial & Abastecimento Fluvial',
    activeTrucks: 4,
    dockOccupancy: '80% (4 de 5 docas)',
    weather: '31°C • Ensolarado c/ pancadas isoladas',
    status: 'Operação Regular',
    recentDestinations: ['Belém', 'Porto Velho', 'Santarém']
  },
  'Belém': {
    region: 'Norte',
    role: 'Terminal Fluvial & Distribuição Paraense',
    activeTrucks: 3,
    dockOccupancy: '65% (3 de 4 docas)',
    weather: '29°C • Céu parcialmente nublado',
    status: 'Operação Regular',
    recentDestinations: ['Manaus', 'Fortaleza', 'São Luís']
  },
  'Fortaleza': {
    region: 'Nordeste',
    role: 'Terminal Litoral & Centro Logístico Ceará',
    activeTrucks: 5,
    dockOccupancy: '90% (6 de 6 docas)',
    weather: '28°C • Ensolarado c/ ventos fortes',
    status: 'Alto Fluxo',
    recentDestinations: ['Recife', 'Natal', 'Sobral']
  },
  'Recife': {
    region: 'Nordeste',
    role: 'Centro de Distribuição Pernambuco',
    activeTrucks: 4,
    dockOccupancy: '75% (5 de 6 docas)',
    weather: '27°C • Chuva fraca matinal',
    status: 'Operação Regular',
    recentDestinations: ['Salvador', 'Fortaleza', 'Caruaru']
  },
  'Salvador': {
    region: 'Nordeste',
    role: 'Pátio Avançado Bahia & Cargas Rodoviárias',
    activeTrucks: 6,
    dockOccupancy: '85% (7 de 8 docas)',
    weather: '28°C • Ensolarado',
    status: 'Operação Regular',
    recentDestinations: ['Brasília', 'Recife', 'Feira de Santana']
  },
  'Brasília': {
    region: 'Centro-Oeste',
    role: 'Hub Estratégico Central & Entroncamento Federal',
    activeTrucks: 8,
    dockOccupancy: '95% (9 de 10 docas)',
    weather: '25°C • Tempo seco e aberto',
    status: 'Pico Operacional',
    recentDestinations: ['São Paulo', 'Goiânia', 'Salvador', 'Belém']
  },
  'S. Paulo/Rio': {
    region: 'Sudeste',
    role: 'Matriz Logística, Fábricas e Exportação',
    activeTrucks: 14,
    dockOccupancy: '100% (16 de 16 docas)',
    weather: '22°C • Céu limpo',
    status: 'Operação Máxima',
    recentDestinations: ['Três Corações', 'Curitiba', 'Belo Horizonte', 'Brasília']
  },
  'Porto Alegre': {
    region: 'Sul',
    role: 'Centro de Distribuição Cone Sul',
    activeTrucks: 5,
    dockOccupancy: '70% (5 de 7 docas)',
    weather: '19°C • Fresco e estável',
    status: 'Operação Regular',
    recentDestinations: ['Curitiba', 'Caxias do Sul', 'Florianópolis']
  }
};

export default function CityHubModal({ city, onClose, onNavigateToRotas }: CityHubModalProps) {
  if (!city) return null;
  const details = CITY_DETAILS[city] || {
    region: 'Brasil',
    role: 'Entreposto Operacional',
    activeTrucks: 3,
    dockOccupancy: '70%',
    weather: '25°C • Condições Normais',
    status: 'Ativo',
    recentDestinations: ['Matriz Logística']
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#fcfaf7] border border-[#ded5c6] rounded-[22px] shadow-[0_20px_60px_rgba(30,18,10,0.25)] w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8d1118] via-[#a31523] to-[#58090e] text-white flex items-center justify-between border-b border-[#dfb15b]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-[#dfb15b] flex items-center justify-center text-[#dfb15b] shadow-inner">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide uppercase font-sans">
                Pólo Operacional: {city}
              </h2>
              <p className="text-[10px] text-amber-200/90 font-medium tracking-wider">
                REGIÃO {details.region.toUpperCase()} • TELEMETRIA DE PÁTIO ATIVA
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-left">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span className="font-bold">{details.role}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              {details.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <div className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                <Truck size={12} className="text-[#8d1118]" />
                <span>Veículos em Trânsito:</span>
              </div>
              <div className="text-lg font-black text-stone-900 font-mono mt-1">
                {details.activeTrucks} caminhões
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <div className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                <Warehouse size={12} className="text-amber-600" />
                <span>Ocupação das Docas:</span>
              </div>
              <div className="text-sm font-black text-stone-900 font-mono mt-1">
                {details.dockOccupancy}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 col-span-2">
              <div className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
                <CloudSun size={12} className="text-sky-600" />
                <span>Condições Climáticas & Pista:</span>
              </div>
              <div className="text-xs font-semibold text-stone-800 mt-1">
                {details.weather}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Conexões Diretas Ativas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {details.recentDestinations.map(d => (
                <span key={d} className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-xs font-medium text-stone-800 flex items-center gap-1">
                  <span>{d}</span>
                  <ChevronRight size={11} className="text-stone-400" />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-[#ded5c6] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onNavigateToRotas) onNavigateToRotas();
            }}
            className="px-4 py-2 rounded-xl bg-[#8d1118] hover:bg-[#a31523] text-white font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>Ver Rotas no Módulo</span>
            <ChevronRight size={13} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
