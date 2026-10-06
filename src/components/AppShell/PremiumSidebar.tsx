import React from 'react';
import { 
  Home, 
  ClipboardCheck, 
  FileCheck2, 
  Share2, 
  BarChart3, 
  Calendar, 
  Users2, 
  MapPin, 
  ChevronRight 
} from 'lucide-react';
import coffeeBeansCup from '../../assets/images/steaming_cup_coffee_1789847106425.jpg';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'menu', label: 'Início', icon: Home },
  { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
  { id: 'averbacao', label: 'Averbação', icon: FileCheck2 },
  { id: 'sm_creator', label: 'SM', icon: Share2 },
  { id: 'controle', label: 'Controle', icon: BarChart3 },
  { id: 'escala', label: 'Escala', icon: Calendar },
  { id: 'presence', label: 'Lista de Presença', icon: Users2 },
  { id: 'rotas', label: 'Rotas', icon: MapPin },
];

interface PremiumSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  showPresenceList?: boolean;
  showRotasPage?: boolean;
}

export default function PremiumSidebar({
  activeTab,
  onSelectTab,
  showPresenceList = true,
  showRotasPage = true,
}: PremiumSidebarProps) {
  const visibleItems = SIDEBAR_ITEMS.filter(item => {
    if (item.id === 'presence' && !showPresenceList) return false;
    if (item.id === 'rotas' && !showRotasPage) return false;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col justify-between p-2 select-none overflow-hidden">
      
      {/* Navigation Buttons List */}
      <nav className="flex flex-col gap-1 w-full flex-1 justify-between min-h-0">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex-1 max-h-[40px] min-h-[35px] rounded-[14px] px-2.5 flex items-center justify-between transition-all cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-r from-[#8d1118] via-[#a31523] to-[#58090e] text-white shadow-[0_4px_14px_rgba(141,17,24,0.40)] border border-[#dfb15b]/40 scale-[1.01]'
                  : 'bg-gradient-to-b from-[#fffdfa] to-[#f7efe4] hover:bg-[#ede5d8] text-stone-800 border border-[#ded5c6]/80 hover:border-stone-400 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Icon Container Circle */}
                <div
                  className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-inner border border-white/25'
                      : 'bg-[#ede3d3] text-[#8d1118] border border-[#ded5c6]'
                  }`}
                >
                  <Icon size={13} className="stroke-[2.2]" />
                </div>
                
                {/* Item Label */}
                <span
                  className={`text-[12px] font-sans text-left tracking-tight ${
                    isActive ? 'font-black text-white' : 'font-bold text-stone-800'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {/* Chevron Arrow */}
              <ChevronRight
                size={13}
                className={`transition-transform group-hover:translate-x-0.5 shrink-0 ${
                  isActive ? 'text-white/90' : 'text-stone-400 group-hover:text-stone-600'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* BOTTOM CARD: Photorealistic Café Três Corações Cup with Roasted Beans */}
      <div className="w-full mt-2 rounded-[16px] overflow-hidden border border-[#ded5c6] shadow-[0_4px_14px_rgba(0,0,0,0.1)] relative bg-stone-900 group shrink-0 h-[100px]">
        <div className="w-full h-full relative overflow-hidden">
          <img
            src={coffeeBeansCup}
            alt="Café Três Corações - O sabor que move o Brasil"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-transparent pointer-events-none" />
          
          <div className="absolute inset-x-2.5 bottom-2 text-left leading-tight z-10 pointer-events-none">
            <span className="text-[7.5px] font-bold text-[#dfb15b] uppercase tracking-widest block font-mono">
              CAFÉ TRÊS CORAÇÕES
            </span>
            <p className="text-[10.5px] font-black text-white italic font-serif leading-tight drop-shadow-md mt-0.5">
              Mais que café, <br />
              <span className="not-italic font-sans text-[9.5px] font-normal text-stone-200">movemos o Brasil.</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
