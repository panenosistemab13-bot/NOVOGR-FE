import React, { useState } from 'react';
import { 
  X, 
  PieChart, 
  Truck, 
  MapPin, 
  Filter, 
  Activity, 
  Search,
  ExternalLink
} from 'lucide-react';

interface AssetAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle?: (plate: string) => void;
}

interface FleetVehicle {
  plate: string;
  model: string;
  region: 'Sudeste' | 'Sul' | 'Nordeste' | 'Centro-Oeste' | 'Norte';
  driver: string;
  status: 'Em Rota' | 'Em Pátio' | 'Carregando' | 'Descarregando';
  route: string;
  cargo: string;
  speed: string;
}

const FLEET_DATA: FleetVehicle[] = [
  // Sudeste (14)
  { plate: 'BRA2E19', model: 'Scania R450 6x2', region: 'Sudeste', driver: 'Carlos Eduardo Silva', status: 'Em Rota', route: 'Três Corações -> SP', cargo: 'Café Gourmet 3C', speed: '74 km/h' },
  { plate: 'RJX8K44', model: 'Volvo FH 540', region: 'Sudeste', driver: 'Marcos Vinicius Souza', status: 'Em Rota', route: 'Rio de Janeiro -> BH', cargo: 'Café Tradicional', speed: '68 km/h' },
  { plate: 'SPO3B82', model: 'Mercedes Actros', region: 'Sudeste', driver: 'Antônio Ferreira Lima', status: 'Carregando', route: 'Santos -> CD Matriz', cargo: 'Cápsulas Três Corações', speed: '0 km/h' },
  { plate: 'MGZ9F10', model: 'Scania R500', region: 'Sudeste', driver: 'Lucas de Oliveira', status: 'Em Pátio', route: 'Varginha -> Três Corações', cargo: 'Café Cru Arábica', speed: '0 km/h' },
  { plate: 'BHO4T29', model: 'Volvo FH 460', region: 'Sudeste', driver: 'Renato Guimarães', status: 'Em Rota', route: 'BH -> Campinas', cargo: 'Café Tradicional', speed: '79 km/h' },
  { plate: 'ESP1M04', model: 'DAF XF 530', region: 'Sudeste', driver: 'Rodrigo Barbosa', status: 'Descarregando', route: 'Vitória -> CD Rio', cargo: 'Café Solúvel', speed: '0 km/h' },
  { plate: 'CPS7C91', model: 'Scania R450', region: 'Sudeste', driver: 'Danilo Alencar', status: 'Em Rota', route: 'Campinas -> Ribeirão Preto', cargo: 'Cappuccinos 3C', speed: '71 km/h' },

  // Sul (9)
  { plate: 'POA4L88', model: 'Volvo FH 500', region: 'Sul', driver: 'Gilberto Ramos', status: 'Em Rota', route: 'Curitiba -> Porto Alegre', cargo: 'Café Rituais 3C', speed: '76 km/h' },
  { plate: 'CWB9N33', model: 'Mercedes Actros', region: 'Sul', driver: 'Fábio Dornelles', status: 'Em Rota', route: 'Joinville -> Londrina', cargo: 'Café Tradicional', speed: '72 km/h' },
  { plate: 'FLN2J77', model: 'Scania R450', region: 'Sul', driver: 'Paulo Ricardo', status: 'Em Pátio', route: 'Florianópolis -> CD Sul', cargo: 'Cápsulas Três Corações', speed: '0 km/h' },
  { plate: 'CXS5X12', model: 'Volvo FH 460', region: 'Sul', driver: 'Jonas Silveira', status: 'Carregando', route: 'Caxias -> Porto Alegre', cargo: 'Café Solúvel', speed: '0 km/h' },

  // Nordeste (7)
  { plate: 'SSA3P90', model: 'Scania R500', region: 'Nordeste', driver: 'Valter Cerqueira', status: 'Em Rota', route: 'Salvador -> Feira de Santana', cargo: 'Café Tradicional', speed: '75 km/h' },
  { plate: 'REC7V41', model: 'Volvo FH 540', region: 'Nordeste', driver: 'Cláudio Bezerra', status: 'Em Rota', route: 'Recife -> Caruaru', cargo: 'Café Gourmet 3C', speed: '70 km/h' },
  { plate: 'FOR1D55', model: 'Mercedes Actros', region: 'Nordeste', driver: 'Edivaldo Santos', status: 'Descarregando', route: 'Fortaleza -> Sobral', cargo: 'Café Almofada 500g', speed: '0 km/h' },
  { plate: 'NAT8G22', model: 'DAF XF 480', region: 'Nordeste', driver: 'Severino Silva', status: 'Em Pátio', route: 'Natal -> João Pessoa', cargo: 'Cápsulas Três Corações', speed: '0 km/h' },

  // Centro-Oeste (6)
  { plate: 'BSB5K70', model: 'Volvo FH 540', region: 'Centro-Oeste', driver: 'Wellington Prado', status: 'Em Rota', route: 'Brasília -> Goiânia', cargo: 'Café Rituais 3C', speed: '78 km/h' },
  { plate: 'GYN9H33', model: 'Scania R450', region: 'Centro-Oeste', driver: 'Luciano Ribeiro', status: 'Carregando', route: 'Goiânia -> Rio Verde', cargo: 'Café Tradicional', speed: '0 km/h' },
  { plate: 'CGB2R11', model: 'Mercedes Actros', region: 'Centro-Oeste', driver: 'Mauro Faria', status: 'Em Rota', route: 'Cuiabá -> Rondonópolis', cargo: 'Café Solúvel', speed: '73 km/h' },

  // Norte (6)
  { plate: 'MAO8Q14', model: 'Scania R450 6x4', region: 'Norte', driver: 'Raimundo Nonato', status: 'Em Rota', route: 'Manaus -> Presidente Figueiredo', cargo: 'Café Tradicional', speed: '62 km/h' },
  { plate: 'BEL3W99', model: 'Volvo FH 500', region: 'Norte', driver: 'Alexandre Paiva', status: 'Em Pátio', route: 'Belém -> Ananindeua', cargo: 'Café Gourmet 3C', speed: '0 km/h' },
  { plate: 'STM6Y05', model: 'Mercedes Actros', region: 'Norte', driver: 'Geovane Castro', status: 'Em Rota', route: 'Santarém -> Itaituba', cargo: 'Cápsulas Três Corações', speed: '58 km/h' }
];

export default function AssetAllocationModal({ isOpen, onClose }: AssetAllocationModalProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('Todas');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredFleet = FLEET_DATA.filter(v => {
    const matchesRegion = selectedRegion === 'Todas' || v.region === selectedRegion;
    const matchesSearch = v.plate.toLowerCase().includes(search.toLowerCase()) ||
                          v.driver.toLowerCase().includes(search.toLowerCase()) ||
                          v.route.toLowerCase().includes(search.toLowerCase()) ||
                          v.cargo.toLowerCase().includes(search.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#fcfaf7] border border-[#ded5c6] rounded-[22px] shadow-[0_20px_60px_rgba(30,18,10,0.25)] w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8d1118] via-[#a31523] to-[#58090e] text-white flex items-center justify-between border-b border-[#dfb15b]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-[#dfb15b] flex items-center justify-center text-[#dfb15b] shadow-inner">
              <PieChart size={18} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide uppercase font-sans">
                Detalhamento da Alocação de Ativos
              </h2>
              <p className="text-[10px] text-amber-200/90 font-medium tracking-wider">
                DISTRIBUIÇÃO DA FROTA POR REGIÃO • 42 VEÍCULOS CONECTADOS
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

        {/* Region Pills & Search Bar */}
        <div className="p-4 bg-[#f4ebd9]/70 border-b border-[#ded5c6] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {['Todas', 'Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedRegion === r
                    ? 'bg-[#8d1118] text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                }`}
              >
                {r} {r === 'Todas' ? '(42)' : ''}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar placa, motorista, rota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118]"
            />
          </div>
        </div>

        {/* Vehicle List */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 text-stone-700 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Placa / Modelo</th>
                  <th className="py-2.5 px-3">Região</th>
                  <th className="py-2.5 px-3">Motorista</th>
                  <th className="py-2.5 px-3">Rota Atual</th>
                  <th className="py-2.5 px-3">Carga Transportada</th>
                  <th className="py-2.5 px-3">Velocidade</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredFleet.map(v => (
                  <tr key={v.plate} className="hover:bg-amber-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-stone-900">{v.plate}</div>
                      <div className="text-[10px] text-stone-500">{v.model}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-800">
                      {v.region}
                    </td>
                    <td className="py-2.5 px-3 text-stone-800">
                      {v.driver}
                    </td>
                    <td className="py-2.5 px-3 text-stone-700 font-medium">
                      {v.route}
                    </td>
                    <td className="py-2.5 px-3 text-[#8d1118] font-semibold">
                      {v.cargo}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-700">
                      {v.speed}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        v.status === 'Em Rota' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        v.status === 'Carregando' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        v.status === 'Descarregando' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        'bg-stone-200 text-stone-700 border border-stone-300'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-[#ded5c6] flex items-center justify-between text-xs text-stone-600">
          <span>Mostrando {filteredFleet.length} de {FLEET_DATA.length} veículos em conformidade</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
