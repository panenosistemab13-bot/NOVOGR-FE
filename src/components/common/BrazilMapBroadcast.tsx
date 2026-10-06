import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export interface BrazilStateInfo {
  uf: string;
  name: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  path: string;
  center: { x: number; y: number };
}

// Highly optimized SVG geometry for all 27 Brazilian Federation Units in viewBox="0 0 600 600"
export const BRAZIL_STATES: BrazilStateInfo[] = [
  {
    uf: 'RR',
    name: 'Roraima',
    region: 'Norte',
    center: { x: 212, y: 55 },
    path: 'M 195,15 L 230,22 L 245,60 L 225,95 L 200,90 L 180,60 L 195,15 Z'
  },
  {
    uf: 'AP',
    name: 'Amapá',
    region: 'Norte',
    center: { x: 345, y: 62 },
    path: 'M 330,35 L 365,55 L 360,95 L 330,85 L 325,50 Z'
  },
  {
    uf: 'AM',
    name: 'Amazonas',
    region: 'Norte',
    center: { x: 145, y: 145 },
    path: 'M 70,100 L 175,70 L 205,95 L 230,95 L 240,165 L 200,210 L 125,200 L 80,180 L 50,135 Z'
  },
  {
    uf: 'PA',
    name: 'Pará',
    region: 'Norte',
    center: { x: 300, y: 135 },
    path: 'M 240,80 L 325,85 L 360,95 L 385,140 L 350,185 L 335,230 L 285,235 L 240,165 Z'
  },
  {
    uf: 'AC',
    name: 'Acre',
    region: 'Norte',
    center: { x: 45, y: 200 },
    path: 'M 20,200 L 70,180 L 85,205 L 55,225 L 20,200 Z'
  },
  {
    uf: 'RO',
    name: 'Rondônia',
    region: 'Norte',
    center: { x: 142, y: 235 },
    path: 'M 115,205 L 165,205 L 180,240 L 140,265 L 115,245 Z'
  },
  {
    uf: 'TO',
    name: 'Tocantins',
    region: 'Norte',
    center: { x: 350, y: 225 },
    path: 'M 345,185 L 370,205 L 365,270 L 340,275 L 330,225 Z'
  },
  {
    uf: 'MA',
    name: 'Maranhão',
    region: 'Nordeste',
    center: { x: 395, y: 145 },
    path: 'M 365,115 L 420,130 L 415,190 L 375,195 L 365,145 Z'
  },
  {
    uf: 'PI',
    name: 'Piauí',
    region: 'Nordeste',
    center: { x: 425, y: 180 },
    path: 'M 415,140 L 440,150 L 445,225 L 415,235 L 405,190 Z'
  },
  {
    uf: 'CE',
    name: 'Ceará',
    region: 'Nordeste',
    center: { x: 472, y: 142 },
    path: 'M 445,130 L 490,140 L 485,175 L 450,170 Z'
  },
  {
    uf: 'RN',
    name: 'Rio Grande do Norte',
    region: 'Nordeste',
    center: { x: 512, y: 146 },
    path: 'M 490,138 L 528,145 L 525,162 L 492,160 Z'
  },
  {
    uf: 'PB',
    name: 'Paraíba',
    region: 'Nordeste',
    center: { x: 515, y: 168 },
    path: 'M 490,162 L 535,166 L 530,180 L 488,175 Z'
  },
  {
    uf: 'PE',
    name: 'Pernambuco',
    region: 'Nordeste',
    center: { x: 495, y: 190 },
    path: 'M 450,182 L 532,185 L 525,205 L 455,200 Z'
  },
  {
    uf: 'AL',
    name: 'Alagoas',
    region: 'Nordeste',
    center: { x: 520, y: 210 },
    path: 'M 505,202 L 530,205 L 522,222 L 500,216 Z'
  },
  {
    uf: 'SE',
    name: 'Sergipe',
    region: 'Nordeste',
    center: { x: 508, y: 228 },
    path: 'M 498,220 L 518,222 L 512,238 L 495,232 Z'
  },
  {
    uf: 'BA',
    name: 'Bahia',
    region: 'Nordeste',
    center: { x: 440, y: 255 },
    path: 'M 375,205 L 455,205 L 500,235 L 490,305 L 440,320 L 400,285 L 375,245 Z'
  },
  {
    uf: 'MT',
    name: 'Mato Grosso',
    region: 'Centro-Oeste',
    center: { x: 235, y: 255 },
    path: 'M 185,200 L 290,205 L 325,260 L 290,325 L 215,315 L 180,245 Z'
  },
  {
    uf: 'GO',
    name: 'Goiás',
    region: 'Centro-Oeste',
    center: { x: 335, y: 310 },
    path: 'M 320,265 L 370,270 L 375,340 L 335,360 L 305,325 Z'
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    region: 'Centro-Oeste',
    center: { x: 360, y: 300 },
    path: 'M 353,294 L 368,294 L 368,306 L 353,306 Z'
  },
  {
    uf: 'MS',
    name: 'Mato Grosso do Sul',
    region: 'Centro-Oeste',
    center: { x: 255, y: 375 },
    path: 'M 225,325 L 295,335 L 305,395 L 260,430 L 220,380 Z'
  },
  {
    uf: 'MG',
    name: 'Minas Gerais',
    region: 'Sudeste',
    center: { x: 410, y: 345 },
    path: 'M 360,285 L 440,290 L 460,345 L 425,405 L 370,390 L 350,335 Z'
  },
  {
    uf: 'ES',
    name: 'Espírito Santo',
    region: 'Sudeste',
    center: { x: 478, y: 355 },
    path: 'M 465,335 L 488,345 L 480,380 L 460,365 Z'
  },
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    region: 'Sudeste',
    center: { x: 450, y: 400 },
    path: 'M 430,390 L 475,385 L 465,415 L 425,410 Z'
  },
  {
    uf: 'SP',
    name: 'São Paulo',
    region: 'Sudeste',
    center: { x: 335, y: 410 },
    path: 'M 290,375 L 375,385 L 415,405 L 375,445 L 300,435 Z'
  },
  {
    uf: 'PR',
    name: 'Paraná',
    region: 'Sul',
    center: { x: 305, y: 462 },
    path: 'M 275,435 L 355,440 L 345,485 L 270,480 Z'
  },
  {
    uf: 'SC',
    name: 'Santa Catarina',
    region: 'Sul',
    center: { x: 325, y: 502 },
    path: 'M 285,485 L 355,488 L 340,520 L 285,510 Z'
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    region: 'Sul',
    center: { x: 295, y: 550 },
    path: 'M 270,515 L 340,522 L 325,585 L 260,580 L 250,535 Z'
  }
];

export interface BrazilMapStateData {
  status?: 'active' | 'secondary' | 'neutral' | 'disabled';
  count?: number;
  highlight?: boolean;
  value?: string;
  metric?: string;
  tag?: string;
  color?: string;
  detail?: string;
}

interface BrazilMapBroadcastProps {
  selectedUf?: string | null;
  onSelectUf?: (uf: string) => void;
  stateData?: Record<string, BrazilMapStateData>;
  activeColor?: string;
  secondaryColor?: string;
  neutralColor?: string;
  titleLegend?: string;
  legendItems?: { label: string; count: number | string; color: string }[];
  className?: string;
}

export function BrazilMapBroadcast({
  selectedUf,
  onSelectUf,
  stateData = {},
  activeColor = '#0f172a',
  secondaryColor = '#8a7c6e',
  neutralColor = '#e8ded2',
  titleLegend = 'LÍDER POR UF',
  legendItems,
  className
}: BrazilMapBroadcastProps) {
  const [hoveredUf, setHoveredUf] = useState<string | null>(null);

  const getFillColor = (uf: string) => {
    const data = stateData[uf];
    if (data?.color) return data.color;
    if (data?.status === 'active') return activeColor;
    if (data?.status === 'secondary') return secondaryColor;
    if (data?.status === 'neutral') return '#d4c5b1';
    if (data?.count && data.count > 0) return activeColor;
    return secondaryColor;
  };

  const activeCount = Object.values(stateData).filter(d => d.status === 'active' || (d.count && d.count > 0)).length;
  const secondaryCount = Object.values(stateData).filter(d => d.status === 'secondary' || d.status === 'neutral').length || (27 - activeCount);

  const defaultLegend = [
    { label: 'Rotas Ativas / Operando', count: `${activeCount} UFs`, color: activeColor },
    { label: 'Outras Regiões / Conexão', count: `${27 - activeCount} UFs`, color: secondaryColor }
  ];

  const effectiveLegend = legendItems || defaultLegend;

  return (
    <div className={cn("relative w-full h-full flex flex-col items-center justify-center select-none", className)}>
      {/* Background Stylized 2026 Watermark */}
      <div className="absolute right-6 bottom-12 pointer-events-none opacity-15 font-mono text-7xl font-black text-[#8a7c6e] tracking-tighter">
        2026
      </div>

      {/* SVG Map Container */}
      <svg
        viewBox="0 0 580 600"
        className="w-full h-full max-h-[520px] filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
      >
        <defs>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* State Polygons */}
        {BRAZIL_STATES.map((state) => {
          const isSelected = selectedUf === state.uf;
          const isHovered = hoveredUf === state.uf;
          const fill = getFillColor(state.uf);
          const data = stateData[state.uf];

          return (
            <g
              key={state.uf}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectUf && onSelectUf(state.uf)}
              onMouseEnter={() => setHoveredUf(state.uf)}
              onMouseLeave={() => setHoveredUf(null)}
            >
              <path
                d={state.path}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.2}
                strokeLinejoin="round"
                className={cn(
                  "transition-all duration-200",
                  isSelected && "brightness-110 drop-shadow-md",
                  isHovered && "opacity-90"
                )}
                filter={isSelected ? "url(#glowEffect)" : undefined}
              />

              {/* State Abbreviation Label */}
              <text
                x={state.center.x}
                y={state.center.y}
                fill="#ffffff"
                fontSize={state.uf === 'DF' || state.uf === 'SE' || state.uf === 'AL' ? '8.5' : '11'}
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              >
                {state.uf}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating State Info Tooltip on Hover */}
      {hoveredUf && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute top-4 left-4 bg-[#1a1614]/95 text-white backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#dfb15b]/40 shadow-xl pointer-events-none text-left font-sans text-xs z-30"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getFillColor(hoveredUf) }} />
            <span className="font-black text-sm uppercase text-white">{BRAZIL_STATES.find(s => s.uf === hoveredUf)?.name} ({hoveredUf})</span>
          </div>
          {stateData[hoveredUf]?.detail ? (
            <p className="text-[11px] text-[#dfb15b] font-mono mt-0.5">{stateData[hoveredUf]?.detail}</p>
          ) : (
            <p className="text-[10px] text-white/80 mt-0.5">Clique para filtrar dados de {hoveredUf}</p>
          )}
        </motion.div>
      )}

      {/* Bottom Left Legend Box (Matching Television Broadcast Graphic) */}
      <div className="absolute left-4 bottom-4 bg-[#fbf8f3]/95 backdrop-blur-md border border-[#e8ded2] p-3.5 rounded-2xl shadow-sm text-left font-sans text-xs max-w-xs z-10">
        <span className="text-[9.5px] font-black uppercase tracking-wider text-[#8a7c6e] block mb-2 font-mono">
          {titleLegend}
        </span>
        <div className="space-y-1.5">
          {effectiveLegend.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 text-[11px] font-bold text-[#1a1614]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className="font-mono text-[#73675a] font-extrabold text-[10.5px] shrink-0">{item.count}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-[#8a7c6e] mt-2 pt-2 border-t border-[#e8ded2] font-medium">
          Destaque no mapa reflete cobertura e status operacional 3C em tempo real.
        </p>
      </div>
    </div>
  );
}

export default BrazilMapBroadcast;
