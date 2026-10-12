import React from 'react';
import { 
  FileCheck2, 
  Share2, 
  SlidersHorizontal, 
  Truck, 
  Calendar, 
  MapPin, 
  Settings, 
  ChevronRight, 
  ShieldCheck, 
  Target, 
  Users2,
  Bell,
  Search,
  Menu as MenuIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

// Image assets
import goldMedalLogo from '../assets/images/gold_logo_medal_3c_1790406432555.jpg';
import panoramicTruck from '../assets/images/panoramic_truck_sunset_1791630272932.jpg';
import brazilMapGold from '../assets/images/brazil_map_gold_1791473887938.jpg';
import avatarJefferson from '../assets/images/avatar_jefferson_dias_1790206857666.jpg';

interface DashboardInicioFuturisticProps {
  onNavigate?: (tab: string) => void;
  activeTab?: string;
}

export default function DashboardInicioFuturistic({ onNavigate, activeTab = 'rotas' }: DashboardInicioFuturisticProps) {
  
  const menuModules = [
    { id: 'averbacao', label: 'AVERBAÇÃO', desc: 'SEGUROS DE CARGA', icon: FileCheck2 },
    { id: 'sm_creator', label: 'SM', desc: 'MONITORAMENTO', icon: Share2 },
    { id: 'checklist', label: 'PRÉ-ALERTA', desc: 'ISCAS & CONTROLE PGR', icon: SlidersHorizontal },
    { id: 'controle', label: 'DISPONIBILIDADE', desc: 'VEÍCULOS PÁTIO', icon: Truck },
    { id: 'escala', label: 'ESCALA 3C', desc: 'PLANTÃO LOGÍSTICO', icon: Calendar },
    { id: 'rotas', label: 'ROTAS', desc: 'PGR E DESTINOS', icon: MapPin, active: true },
    { id: 'config', label: 'CONFIGURAÇÕES & PÁGINAS', desc: 'SISTEMA & MÓDULOS', icon: Settings },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none font-sans overflow-hidden bg-[#F5EFE4] text-[#33291B] p-4">
      
      {/* Top Header Bar inside Workspace */}
      <header className="w-full h-[60px] flex items-center justify-between px-6 bg-[#FFF9EF] border border-[#E7D4AF] rounded-2xl shadow-xs shrink-0 mb-3">
        
        {/* Left: Menu Icon & Logo */}
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-xl bg-[#F5EFE4] border border-[#E7D4AF] flex items-center justify-center text-[#91651F] cursor-pointer hover:bg-[#E7D4AF]/30 transition-colors">
            <MenuIcon size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C69A45] shadow-xs bg-[#FFF9EF]">
              <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[15px] font-black tracking-wider text-[#33291B] uppercase font-heading block">
                CENTRAL GR
              </span>
              <span className="text-[8px] font-bold tracking-[0.25em] text-[#91651F] uppercase block mt-0.5 font-mono">
                LOGÍSTICA QUE APROXIMA
              </span>
            </div>
          </div>
        </div>

        {/* Right: Location Badge & Notifications */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F5EFE4] border border-[#E7D4AF] shadow-2xs">
            <MapPin size={15} className="text-[#C69A45]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#33291B]">
              SANTA LUZIA - MG
            </span>
            <ChevronRight size={13} className="text-[#857662]" />
          </div>

          <button className="w-10 h-10 rounded-full bg-[#FFF9EF] border border-[#E7D4AF] flex items-center justify-center text-[#33291B] hover:bg-[#F5EFE4] transition-colors cursor-pointer relative shadow-2xs">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#C91F2D] border border-white" />
          </button>
        </div>

      </header>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">
        
        {/* LEFT COLUMN: OPERATIONAL MENU (~56% / 7 cols) */}
        <div className="col-span-7 bg-[#FFF9EF] border border-[#E7D4AF] rounded-3xl p-4 shadow-sm flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-2.5">
            
            {/* Main Highlight Card: MENU OPERACIONAL */}
            <div className="w-full h-[66px] bg-gradient-to-r from-[#E7D4AF] via-[#C69A45] to-[#91651F] rounded-2xl p-4 flex items-center justify-between shadow-md border border-[#DDB76B] text-[#33291B] cursor-pointer relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/10 pointer-events-none" />
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-[#FFF9EF] border border-[#DDB76B] flex items-center justify-center text-[#33291B] shadow-inner font-bold">
                  <MenuIcon size={22} />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[14px] font-black tracking-wider uppercase block font-heading text-[#33291B]">
                    MENU OPERACIONAL
                  </span>
                  <span className="text-[9.5px] font-bold tracking-widest text-[#33291B]/80 uppercase font-mono block mt-0.5 bg-white/30 px-2 py-0.5 rounded-md inline-block">
                    PAINEL CENTRAL
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#33291B] relative z-10 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Operational Modules List */}
            <div className="space-y-2">
              {menuModules.map((mod) => {
                const Icon = mod.icon;
                const isActive = mod.id === activeTab || (mod.id === 'rotas' && activeTab === 'rotas');

                return (
                  <div
                    key={mod.id}
                    onClick={() => onNavigate?.(mod.id === 'config' ? 'controle' : mod.id)}
                    className={cn(
                      "w-full h-[52px] rounded-2xl px-4 flex items-center justify-between transition-all cursor-pointer border shadow-2xs group",
                      isActive
                        ? "bg-gradient-to-r from-[#DDB76B] via-[#C69A45] to-[#91651F] text-[#33291B] border-[#C69A45] shadow-md scale-[1.01]"
                        : "bg-[#FFFDF8] hover:bg-[#F5EFE4] text-[#33291B] border-[#E7D4AF]/80"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs shrink-0",
                        isActive 
                          ? "bg-[#FFF9EF] text-[#33291B] border-[#E7D4AF]" 
                          : "bg-[#F5EFE4] text-[#91651F] border-[#E7D4AF]"
                      )}>
                        <Icon size={18} />
                      </div>
                      <div className="text-left leading-tight">
                        <span className={cn(
                          "text-[12.5px] font-black uppercase tracking-wide block font-heading",
                          isActive ? "text-[#33291B]" : "text-[#33291B]"
                        )}>
                          {mod.label}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider block mt-0.5 font-mono",
                          isActive ? "text-[#33291B]/80" : "text-[#857662]"
                        )}>
                          {mod.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#33291B] text-[#FFF9EF] text-[9px] font-black tracking-widest uppercase shadow-xs">
                          ATIVO
                        </span>
                      )}
                      <ChevronRight 
                        size={16} 
                        className={cn(
                          "transition-transform group-hover:translate-x-0.5",
                          isActive ? "text-[#33291B]" : "text-[#857662]"
                        )} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Footer inside Left Column */}
          <div className="pt-3 border-t border-[#E7D4AF] text-center mt-2">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#91651F] uppercase">
              Juntos em todos os caminhos
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: CINEMATIC LOGISTICAL PANEL (~44% / 5 cols) */}
        <div className="col-span-5 relative rounded-3xl overflow-hidden border border-[#E7D4AF] shadow-md flex flex-col justify-between p-6 bg-stone-900">
          
          {/* Background Cinematic Truck on Mountain Road at Sunset */}
          <img
            src={panoramicTruck}
            alt="Caminhão em Rota Câmera Cinematográfica"
            className="absolute inset-0 w-full h-full object-cover object-center filter saturate-110 brightness-90"
          />

          {/* Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />

          {/* Top Floating Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#C69A45]/60 text-[9px] font-mono font-bold text-[#E7D4AF] uppercase tracking-widest">
              CENTRAL DE CONTROLE 4K
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
          </div>

          {/* Center Content: Brazil Map Overlay with Gold Lines & MG Highlight */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center py-4">
            
            <div className="w-[210px] h-[190px] relative flex items-center justify-center filter drop-shadow-[0_8px_24px_rgba(198,154,69,0.45)]">
              <img 
                src={brazilMapGold}
                alt="Mapa do Brasil Dourado"
                className="w-full h-full object-contain opacity-90 animate-pulse duration-1000"
              />
              {/* Pulsing beacon over Minas Gerais */}
              <div className="absolute top-[58%] left-[54%] w-4 h-4 rounded-full bg-[#C69A45] border-2 border-white shadow-[0_0_15px_#C69A45] animate-ping" />
            </div>

            {/* Slogan */}
            <div className="text-center mt-3">
              <h2 className="text-[26px] font-black text-white tracking-wider uppercase font-heading drop-shadow-md">
                LOGÍSTICA <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF8] via-[#E7D4AF] to-[#C69A45]">
                  QUE APROXIMA
                </span>
              </h2>
            </div>

          </div>

          {/* Bottom Indicators: SEGURANÇA, EFICIÊNCIA, PESSOAS */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-4 border-t border-white/20 text-center">
            
            <div className="flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl py-2 px-1 border border-white/10">
              <ShieldCheck size={16} className="text-[#C69A45] mb-1" />
              <span className="text-[9px] font-black tracking-wider text-white uppercase font-heading">
                SEGURANÇA
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl py-2 px-1 border border-white/10">
              <Truck size={16} className="text-[#C69A45] mb-1" />
              <span className="text-[9px] font-black tracking-wider text-white uppercase font-heading">
                EFICIÊNCIA
              </span>
            </div>

            <div className="flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl py-2 px-1 border border-white/10">
              <Users2 size={16} className="text-[#C69A45] mb-1" />
              <span className="text-[9px] font-black tracking-wider text-white uppercase font-heading">
                PESSOAS
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
