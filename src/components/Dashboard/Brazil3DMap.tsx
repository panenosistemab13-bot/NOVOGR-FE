import React, { useState } from 'react';
import { 
  Crosshair, 
  Compass, 
  Plus, 
  Minus, 
  Navigation, 
  Truck, 
  Route, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  MapPin
} from 'lucide-react';
import brazilRelief3D from '../../assets/images/brazil_relief_satellite_3d_1790406421390.jpg';
import CityHubModal from '../CityHubModal';

interface Brazil3DMapProps {
  onViewAllRoutes?: () => void;
  onCityClick?: (city: string) => void;
}

export default function Brazil3DMap({ onViewAllRoutes, onCityClick }: Brazil3DMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.2, 1.8));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.2, 0.9));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
  };

  const handleNodeClick = (cityName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCity(cityName);
    if (onCityClick) onCityClick(cityName);
  };

  return (
    <article className="bg-[#fffdfa] rounded-[18px] border border-[#ded5c6] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full select-none overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5 shrink-0">
        <div className="w-5.5 h-5.5 rounded-full bg-red-100/80 border border-red-200 flex items-center justify-center text-[#8d1118] shrink-0">
          <span className="text-[11px] leading-none">♡</span>
        </div>
        <div className="text-left">
          <h3 className="text-[11.5px] font-black text-stone-900 tracking-wide uppercase font-sans">
            ROTAS EM TEMPO REAL
          </h3>
          <p className="text-[7.5px] font-bold text-stone-500 uppercase tracking-wider">
            ACOMPANHAMENTO DE TODA A OPERAÇÃO
          </p>
        </div>
      </div>

      {/* Map + Side Info Container */}
      <div className="grid grid-cols-12 gap-2.5 flex-1 min-h-0 items-stretch">
        
        {/* Left 3D Relief Map Container (7.5 cols) */}
        <div 
          className="col-span-7 xl:col-span-8 relative rounded-xl overflow-hidden bg-gradient-to-br from-[#f5ede1] via-[#efe5d5] to-[#e8dcc9] border border-[#ded5c6] flex items-center justify-center shadow-inner h-full select-none"
        >
          {/* Zoomable Container */}
          <div 
            className="w-full h-full relative transition-transform duration-300 flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* 3D Isometric Satellite Relief Background */}
            <img
              src={brazilRelief3D}
              alt="Relevo 3D Brasil"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-95"
            />

            {/* Glowing Route Network SVG Overlay with hub city nodes matching reference */}
            <svg viewBox="0 0 340 260" className="absolute inset-0 w-full h-full select-none z-10 pointer-events-auto">
              <defs>
                <filter id="neonRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Glowing routes between operational hubs */}
              {/* Manaus -> Brasília */}
              <path d="M 85,65 Q 130,105 168,145" fill="none" stroke="#10b981" strokeWidth="2.5" filter="url(#neonRouteGlow)" />
              {/* Belém -> Brasília */}
              <path d="M 172,62 Q 172,105 168,145" fill="none" stroke="#ef4444" strokeWidth="2.2" />
              {/* Fortaleza -> Salvador */}
              <path d="M 242,70 Q 252,115 220,148" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 2" />
              {/* Salvador -> Recife */}
              <path d="M 220,148 Q 252,120 265,92" fill="none" stroke="#10b981" strokeWidth="2" />
              {/* Brasília -> Salvador */}
              <path d="M 168,145 Q 194,145 220,148" fill="none" stroke="#ef4444" strokeWidth="2.2" />
              {/* Brasília -> São Paulo/Rio */}
              <path d="M 168,145 Q 185,180 200,208" fill="none" stroke="#ef4444" strokeWidth="2.5" filter="url(#neonRouteGlow)" />
              {/* São Paulo -> Porto Alegre */}
              <path d="M 200,208 Q 172,230 150,245" fill="none" stroke="#10b981" strokeWidth="2.2" />

              {/* Key Hub Nodes matching reference image */}
              {[
                { n: 'Manaus', x: 85, y: 65, col: '#10b981' },
                { n: 'Belém', x: 172, y: 62, col: '#ef4444' },
                { n: 'Fortaleza', x: 242, y: 70, col: '#10b981' },
                { n: 'Recife', x: 265, y: 92, col: '#10b981' },
                { n: 'Salvador', x: 220, y: 148, col: '#ef4444' },
                { n: 'Brasília', x: 168, y: 145, col: '#ef4444' },
                { n: 'S. Paulo/Rio', x: 200, y: 208, col: '#ef4444' },
                { n: 'Porto Alegre', x: 150, y: 245, col: '#10b981' },
              ].map(city => (
                <g 
                  key={city.n} 
                  transform={`translate(${city.x}, ${city.y})`}
                  className="cursor-pointer group/node"
                  onClick={(e) => handleNodeClick(city.n, e)}
                >
                  <circle r="6" fill={city.col} opacity="0.3" className="animate-ping pointer-events-none" />
                  <circle r="4" fill={city.col} stroke="#ffffff" strokeWidth="1.5" className="transition-transform group-hover/node:scale-125" />
                  <text 
                    y="-7" 
                    textAnchor="middle" 
                    fontSize="7" 
                    fontWeight="900" 
                    fill="#000" 
                    className="font-sans filter drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]"
                  >
                    {city.n}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Map Floating Control Tools */}
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            <button 
              type="button" 
              onClick={handleResetZoom}
              className="w-5 h-5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-xs hover:bg-black transition-colors cursor-pointer" 
              title="Centralizar Foco"
            >
              <Crosshair size={9} className="text-[#f59e0b]" />
            </button>
            <button 
              type="button" 
              onClick={handleResetZoom}
              className="w-5 h-5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-xs hover:bg-black transition-colors cursor-pointer" 
              title="Bússola"
            >
              <Compass size={9} />
            </button>
            <button 
              type="button" 
              onClick={handleZoomIn}
              className="w-5 h-5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-xs hover:bg-black transition-colors cursor-pointer" 
              title="Aproximar Zoom"
            >
              <Plus size={9} />
            </button>
            <button 
              type="button" 
              onClick={handleZoomOut}
              className="w-5 h-5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-xs hover:bg-black transition-colors cursor-pointer" 
              title="Afastar Zoom"
            >
              <Minus size={9} />
            </button>
            <button 
              type="button" 
              onClick={handleResetZoom}
              className="w-5 h-5 rounded-full bg-black/80 border border-white/25 flex items-center justify-center text-white shadow-xs hover:bg-black transition-colors cursor-pointer" 
              title="Resetar Posição"
            >
              <Navigation size={9} />
            </button>
          </div>

          {/* Floating Bottom Status Pill */}
          <div 
            onClick={onViewAllRoutes}
            className="absolute bottom-2 left-2 z-20 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-sm border border-white/25 text-white flex items-center gap-1.5 shadow-md text-[8px] font-bold cursor-pointer hover:bg-black transition-colors"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-[#8d1118] flex items-center justify-center text-white shrink-0">
              <MapPin size={8} />
            </div>
            <span className="font-bold text-white tracking-wide">8 ROTAS ATIVAS</span>
            <span className="text-stone-300">• Sistema em operação</span>
          </div>

        </div>

        {/* Right Side Stats Panel (5 cols) */}
        <div className="col-span-5 xl:col-span-4 flex flex-col justify-between py-0.5 pl-2 text-left border-l border-stone-200">
          
          {/* Stat 1: Total de Rotas */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
              <Truck size={13} />
            </div>
            <div className="leading-tight">
              <span className="text-[7.5px] font-black text-stone-400 uppercase tracking-wider block">
                TOTAL DE ROTAS
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-stone-900 font-mono">42</span>
                <span className="text-[8px] font-bold text-emerald-600 flex items-center">
                  <TrendingUp size={8} className="mr-0.5" /> 12%
                </span>
              </div>
              <span className="text-[6.5px] text-stone-400 font-medium">vs. mês anterior</span>
            </div>
          </div>

          {/* Stat 2: Distância Percorrida */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 shrink-0 shadow-2xs">
              <Route size={13} />
            </div>
            <div className="leading-tight">
              <span className="text-[7.5px] font-black text-stone-400 uppercase tracking-wider block">
                DISTÂNCIA PERCORRIDA
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11.5px] font-black text-stone-900 font-mono">12.480 km</span>
                <span className="text-[8px] font-bold text-emerald-600 flex items-center">
                  <TrendingUp size={8} className="mr-0.5" /> 8%
                </span>
              </div>
              <span className="text-[6.5px] text-stone-400 font-medium">vs. mês anterior</span>
            </div>
          </div>

          {/* Stat 3: Tempo Médio */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 shrink-0 shadow-2xs">
              <Clock size={13} />
            </div>
            <div className="leading-tight">
              <span className="text-[7.5px] font-black text-stone-400 uppercase tracking-wider block">
                TEMPO MÉDIO
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11.5px] font-black text-stone-900 font-mono">8h 24min</span>
                <span className="text-[8px] font-bold text-rose-500 flex items-center">
                  <TrendingDown size={8} className="mr-0.5" /> 6%
                </span>
              </div>
              <span className="text-[6.5px] text-stone-400 font-medium">vs. mês anterior</span>
            </div>
          </div>

          {/* Legend Dots matching reference */}
          <div className="pt-1.5 border-t border-stone-200 grid grid-cols-2 gap-1 text-[7.5px] font-bold text-stone-700">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
              <span>Ativa: 32</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
              <span>Carregada: 5</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#06b6d4] shrink-0" />
              <span>Descarga: 3</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0" />
              <span>Parada: 2</span>
            </div>
          </div>

        </div>

      </div>

      {/* Hub Inspection Modal */}
      {selectedCity && (
        <CityHubModal
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
          onNavigateToRotas={() => {
            setSelectedCity(null);
            if (onViewAllRoutes) onViewAllRoutes();
          }}
        />
      )}

    </article>
  );
}
