import React, { useState } from 'react';
import { Compass, MapPin, Navigation, Radio, Shield, Sparkles } from 'lucide-react';

const brasilSatelliteMap = "/assets/aistudio/Painel_Log_stico_com_Rotas_Douradas_no_Brasil_ffcd0e2b.png";

interface MainDashboardProps {
  onNavigate?: (tabId: string) => void;
}

export interface CityMarker {
  id: string;
  name: string;
  top: string;
  left: string;
  status?: string;
  routesCount?: number;
  tabTarget?: string;
}

export const CITY_MARKERS: CityMarker[] = [
  { id: 'manaus', name: 'MANAUS', top: '22%', left: '43.5%', status: 'Operação Normal', routesCount: 6, tabTarget: 'rotas' },
  { id: 'parana_north', name: 'PARANÁ', top: '21%', left: '50.5%', status: 'Hub Regional', routesCount: 4, tabTarget: 'controle' },
  { id: 'brasilia', name: 'BRASÍLIA', top: '47%', left: '61.5%', status: 'Entroncamento Central', routesCount: 12, tabTarget: 'rotas' },
  { id: 'recife', name: 'RECIFE', top: '35.5%', left: '76.5%', status: 'Base Nordeste', routesCount: 8, tabTarget: 'rotas' },
  { id: 'salvador', name: 'SALVADOR', top: '44.5%', left: '73%', status: 'Base Leste', routesCount: 7, tabTarget: 'rotas' },
  { id: 'belo_horizonte', name: 'BELO HORIZONTE', top: '56.5%', left: '68.5%', status: 'Base Central MG', routesCount: 14, tabTarget: 'controle' },
  { id: 'rio', name: 'RIO DE JANEIRO', top: '65%', left: '71.5%', status: 'Terminal Fluminense', routesCount: 11, tabTarget: 'rotas' },
  { id: 'sao_paulo', name: 'SÃO PAULO', top: '67.5%', left: '64%', status: 'QG Principal 3C', routesCount: 28, tabTarget: 'rotas' },
  { id: 'curitiba', name: 'CURITIBA', top: '69.5%', left: '55.5%', status: 'Base Sul 01', routesCount: 9, tabTarget: 'rotas' },
  { id: 'porto_alegre', name: 'PORTO ALEGRE', top: '82.5%', left: '60.5%', status: 'Base Sul 02', routesCount: 5, tabTarget: 'rotas' },
];

export default function MainDashboard({ onNavigate }: MainDashboardProps) {
  const [selectedCity, setSelectedCity] = useState<CityMarker | null>(null);

  const handleCityClick = (city: CityMarker) => {
    setSelectedCity(city);
    if (city.tabTarget && onNavigate) {
      setTimeout(() => {
        onNavigate(city.tabTarget!);
      }, 400);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-76px)] overflow-hidden relative bg-[#070c14] select-none font-sans">
      
      {/* 1. MAPA CINEMATOGRÁFICO DO BRASIL DE FUNDO (SEM O CABEÇALHO DUPLICADO DA IMAGEM) */}
      <div className="absolute inset-x-0 -top-[15.5%] w-full h-[115.5%] z-0 overflow-hidden bg-[#070c14]">
        <img
          src={brasilSatelliteMap}
          alt="Central GR - Mapa Logístico 3D Brasil"
          className="w-full h-full object-cover object-bottom pointer-events-none select-none"
        />
        {/* Glow overlay suave nos bordos */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-black/10" />

        {/* 2. OVERLAY INTERATIVO DE CIDADES E ROTAS */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          {CITY_MARKERS.map((city) => (
            <div
              key={city.id}
              style={{ top: city.top, left: city.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              onClick={() => handleCityClick(city)}
            >
              {/* Ponto Pulsante Dourado */}
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-[#FFC247] opacity-65" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFC247] border border-white shadow-[0_0_10px_#FFC247]" />
              </div>

              {/* Tooltip / Label Hover FX */}
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-[#10243D]/90 backdrop-blur-md text-white border border-[#FFC247]/40 px-3 py-1.5 rounded-lg shadow-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 z-30">
                <Radio className="w-3 h-3 text-[#FFC247] animate-pulse" />
                <span>{city.name}</span>
                <span className="text-[#FFC247]">({city.routesCount} rotas)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CARD DE INFORMAÇÕES CIDADE SELECIONADA (MODAL DISCRETO SE CLICADO) */}
      {selectedCity && (
        <div className="absolute top-6 left-6 z-20 bg-[#10243D]/95 backdrop-blur-md border border-[#FFC247]/50 rounded-2xl p-4 text-white shadow-2xl max-w-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FFC247]" />
              <strong className="text-sm font-black tracking-wide text-white uppercase">{selectedCity.name}</strong>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCity(null);
              }}
              className="text-stone-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-md hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          <div className="text-xs space-y-1.5 text-stone-200">
            <p className="flex justify-between">
              <span className="text-stone-400 font-medium">Status:</span>
              <span className="font-bold text-emerald-400">{selectedCity.status}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-400 font-medium">Rotas Ativas:</span>
              <span className="font-bold text-[#FFC247]">{selectedCity.routesCount} conexões</span>
            </p>
          </div>
          <button
            onClick={() => onNavigate?.(selectedCity.tabTarget || 'rotas')}
            className="w-full mt-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D99A19] to-[#FFC247] text-[#10243D] text-[10px] font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Ver Detalhes da Operação</span>
          </button>
        </div>
      )}

    </div>
  );
}
