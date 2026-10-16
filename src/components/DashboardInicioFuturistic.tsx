import React, { useState } from 'react';
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
  Menu as MenuIcon,
  Package,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Trophy,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getAllAvailablePages, loadPageVisibility, ICON_MAP, PageDefinition } from '../data/pagesConfig';

// Image assets
import goldMedalLogo from '../assets/images/gold_logo_medal_3c_1790406432555.jpg';
import panoramicTruck from '../assets/images/panoramic_truck_sunset_1791630272932.jpg';
import brazilMapGold from '../assets/images/brazil_map_gold_1791473887938.jpg';
import avatarJefferson from '../assets/images/avatar_jefferson_dias_1790206857666.jpg';
import goldPodiumImg from '../assets/images/gold_trophy_podium_1791473848875.jpg';

interface DashboardInicioFuturisticProps {
  onNavigate?: (tab: string) => void;
  activeTab?: string;
  pageVisibility?: Record<string, boolean>;
  availablePages?: PageDefinition[];
  currentUser?: { email: string; name: string; role: string } | null;
}

export default function DashboardInicioFuturistic({ 
  onNavigate, 
  activeTab = 'rotas',
  pageVisibility = {},
  availablePages = [],
  currentUser
}: DashboardInicioFuturisticProps) {
  const [rankingTab, setRankingTab] = useState<'geral' | 'estado' | 'regiao'>('geral');

  const menuModules = React.useMemo(() => {
    // If props are empty, fallback to local loading (but props should be provided by InitialMenu)
    const pages = availablePages.length > 0 ? availablePages : getAllAvailablePages();
    const vis = Object.keys(pageVisibility).length > 0 ? pageVisibility : loadPageVisibility();
    
    return pages
      .filter(p => p.id !== 'cadastro' && vis[p.id] !== false)
      .map(p => ({
        id: p.id,
        label: p.label,
        desc: p.description || p.category,
        icon: ICON_MAP[p.iconName] || MapPin
      }));
  }, [availablePages, pageVisibility]);

  const rankingItems = [
    { pos: 1, name: 'FLAVIO BOLSONARO', party: 'PL - Nº 22 • Vice: Alfredo Gaspar', percent: '49,58%', votes: '37.568.895 votos', color: 'bg-amber-400' },
    { pos: 2, name: 'LULA', party: 'PT - Nº 13 • Vice: Geraldo Alckmin', percent: '42,25%', votes: '32.087.853 votos', color: 'bg-blue-500' },
    { pos: 3, name: 'ESCRITOR AUGUSTO CURY', party: 'AVANTE - Nº 70 • Vice: Júlio Delgado', percent: '2,97%', votes: '2.247.926 votos', color: 'bg-stone-500' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none font-sans overflow-y-auto bg-[#141412] text-[#F3F0E6] p-4 gap-4">
      
      {/* Top Header Bar */}
      <header className="w-full h-[64px] flex items-center justify-between px-6 bg-[#FFFEFC] border border-[#E8DDCA] rounded-2xl shadow-sm shrink-0">
        
        {/* Left: Menu Icon & Logo */}
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-xl bg-[#F5EFE4] border border-[#E8DDCA] flex items-center justify-center text-[#C49A45] cursor-pointer hover:bg-[#E8DDCA] transition-colors">
            <MenuIcon size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C69A45] shadow-sm bg-white">
              <img src={goldMedalLogo} alt="3 Corações" className="w-full h-full object-contain" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[15px] font-black tracking-wider text-[#25231F] uppercase font-heading block">
                CENTRAL GR
              </span>
              <span className="text-[8px] font-bold tracking-[0.25em] text-[#C69A45] uppercase block mt-0.5 font-mono">
                LOGÍSTICA QUE APROXIMA
              </span>
            </div>
          </div>
        </div>

        {/* Center/Left Badge: Location */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F5EFE4] border border-[#E8DDCA] shadow-xs">
          <MapPin size={15} className="text-[#C69A45]" />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#25231F]">
            SANTA LUZIA - MG
          </span>
          <ChevronRight size={13} className="text-[#8C7B63]" />
        </div>

        {/* Right: User profile, Time & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F5EFE4] border border-[#E8DDCA] px-3.5 py-2 rounded-xl">
            <Radio size={14} className="text-emerald-600 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-[#25231F]">AO VIVO</span>
          </div>

          <button className="w-10 h-10 rounded-full bg-[#F5EFE4] border border-[#E8DDCA] flex items-center justify-center text-[#25231F] hover:bg-[#E8DDCA] transition-colors cursor-pointer relative shadow-xs">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#C91F2D] border border-white" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-[#E8DDCA]">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C69A45]">
              <img src={avatarJefferson} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-[#25231F] block uppercase">
                {currentUser?.name || 'JEFFERSON'}
              </span>
              <span className="text-[9px] text-[#C69A45] font-mono block">
                {currentUser?.role === 'admin' ? 'Administrador' : 'Funcionário'}
              </span>
            </div>
          </div>
        </div>

      </header>

      {/* TOP HERO & PROGRESS SECTION (Matching Reference Image) */}
      <div className="grid grid-cols-12 gap-4 shrink-0">
        
        {/* Left Hero Banner */}
        <div className="col-span-12 lg:col-span-9 relative rounded-2xl overflow-hidden border border-[#333026] shadow-md min-h-[160px] flex items-center justify-between p-6 bg-[#1A1916]">
          <img
            src={panoramicTruck}
            alt="Hero Convoy Sunset"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-60 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pointer-events-none" />

          <div className="relative z-10 text-left max-w-xl">
            <span className="text-[10px] font-mono font-bold text-[#C69A45] uppercase tracking-widest block mb-1">
              CENTRAL GR ➔
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading leading-none mb-2">
              JUNTOS EM TODAS <br />
              <span className="text-[#C69A45]">AS ROTAS</span>
            </h1>
            <p className="text-xs text-stone-300 font-medium">
              Mais controle, mais segurança, mais resultados para o seu negócio.
            </p>
          </div>

          <div className="relative z-10 hidden sm:flex items-center gap-3 bg-black/60 backdrop-blur-md border border-[#C69A45]/40 px-4 py-3 rounded-2xl shadow-xl">
            <div className="w-9 h-9 rounded-xl bg-[#C69A45] text-black font-black flex items-center justify-center text-xs">
              3C
            </div>
            <div className="text-left leading-tight">
              <span className="text-[11px] font-black uppercase text-white block">GRUPO 3CORAÇÕES</span>
              <span className="text-[9px] text-[#C69A45] font-mono block">Paixão por cada entrega</span>
            </div>
          </div>
        </div>

        {/* Right Circular Progress Card */}
        <div className="col-span-12 lg:col-span-3 bg-[#1A1916] border border-[#333026] rounded-2xl p-4 shadow-md flex items-center justify-between">
          <div className="text-left leading-tight">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-[#A39274] block mb-1">
              SEÇÕES APURADAS <span className="text-emerald-400 font-bold">↑ (+17,55 P.P.)</span>
            </span>
            <span className="text-2xl font-black font-mono text-white tracking-tight block">
              64,81%
            </span>
            <span className="text-[9px] font-bold text-[#A39274] block mt-1 font-mono">
              323.539 <span className="text-stone-400">de 499.248 seções</span>
            </span>
          </div>

          {/* Circular Progress Indicator */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#262420]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#C69A45]"
                strokeDasharray="65, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
              64,8%
            </div>
          </div>
        </div>

      </div>

      {/* METRICS CARDS ROW (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0">
        
        {/* Card 1 */}
        <div className="bg-[#1A1916] border border-[#333026] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A39274]">TOTAL DE VEÍCULOS</span>
            <div className="w-8 h-8 rounded-xl bg-[#262420] border border-[#3E3A2F] flex items-center justify-center text-[#C69A45]">
              <Truck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[26px] font-black font-mono text-white tracking-tight block">328</span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingUp size={12} /> +12% vs. mês anterior
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1A1916] border border-[#333026] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A39274]">MOTORISTAS ATIVOS</span>
            <div className="w-8 h-8 rounded-xl bg-[#262420] border border-[#3E3A2F] flex items-center justify-center text-[#C69A45]">
              <Users2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[26px] font-black font-mono text-white tracking-tight block">412</span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingUp size={12} /> +8% vs. mês anterior
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1A1916] border border-[#333026] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A39274]">EM ROTA</span>
            <div className="w-8 h-8 rounded-xl bg-[#262420] border border-[#3E3A2F] flex items-center justify-center text-amber-400">
              <MapPin size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[26px] font-black font-mono text-white tracking-tight block">287</span>
            <span className="text-[10px] font-bold text-amber-400 block mt-0.5 font-mono">
              87,5% da frota
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#1A1916] border border-[#C91F2D]/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#C91F2D]/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-300">EM ALERTA</span>
            <div className="w-8 h-8 rounded-xl bg-[#262420] border border-red-900/50 flex items-center justify-center text-red-400">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <span className="text-[26px] font-black font-mono text-white tracking-tight block">18</span>
            <span className="text-[10px] font-bold text-red-400 block mt-0.5 font-mono">
              5,5% da frota
            </span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-[#1A1916] border border-[#333026] rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A39274]">DISPONÍVEIS NO PÁTIO</span>
            <div className="w-8 h-8 rounded-xl bg-[#262420] border border-[#3E3A2F] flex items-center justify-center text-emerald-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[26px] font-black font-mono text-white tracking-tight block">37</span>
            <span className="text-[10px] font-bold text-emerald-400 block mt-0.5 font-mono">
              11,3% da frota
            </span>
          </div>
        </div>

      </div>

      {/* BOTTOM 3-COLUMN SECTION (Ranking, Brazil Telemetry, Podium/Votes) */}
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* COLUMN 1: RANKING NACIONAL (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 bg-[#1A1916] border border-[#333026] rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#333026]">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-[#C69A45]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">RANKING NACIONAL</span>
              </div>
              <span className="text-[9px] font-mono text-[#A39274]">VOTAÇÃO EM TEMPO REAL</span>
            </div>

            <div className="flex items-center justify-between mb-4 bg-[#22211D] p-1.5 rounded-xl border border-[#333026]">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#2E2B25] rounded-lg text-[10px] font-bold text-[#E6C575] border border-[#C69A45]/40">
                Outubro 2025 ▾
              </div>
              <div className="flex items-center gap-1">
                {(['geral', 'estado', 'regiao'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRankingTab(tab)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer",
                      rankingTab === tab ? "bg-[#C69A45] text-black shadow-xs" : "text-stone-400 hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {rankingItems.map((item) => (
                <div key={item.pos} className="bg-[#22211D] border border-[#333026] rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#2E2B25] border border-[#3E3A2F] text-white font-mono text-xs font-black flex items-center justify-center">
                      {item.pos}º
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-xs font-black uppercase text-white block font-heading">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-[#A39274] font-mono block mt-0.5">
                        {item.party}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-white block">{item.percent}</span>
                    <span className="text-[8.5px] font-mono text-[#A39274] block">{item.votes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#333026] mt-4 flex items-center justify-between text-[10px] font-mono text-[#A39274]">
            <span>Módulos Operacionais</span>
            <button 
              onClick={() => onNavigate?.('rotas')}
              className="text-[#C69A45] hover:underline cursor-pointer font-bold flex items-center gap-1"
            >
              Acessar Rotas ➔
            </button>
          </div>
        </div>

        {/* COLUMN 2: TELEMETRIA OPERACIONAL 3C (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 bg-[#1A1916] border border-[#333026] rounded-3xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <img
            src={panoramicTruck}
            alt="Truck background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141412] via-[#141412]/80 to-[#141412]/40 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[10px] font-mono font-bold text-[#E6C575] bg-black/60 px-3 py-1 rounded-full border border-[#C69A45]/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              TELEMETRIA OPERACIONAL 3C
            </span>
            <span className="text-[9px] font-mono text-stone-300">BRASIL</span>
          </div>

          <div className="relative z-10 my-auto flex flex-col items-center justify-center py-4">
            <div className="w-[200px] h-[170px] relative flex items-center justify-center filter drop-shadow-[0_8px_20px_rgba(198,154,69,0.5)]">
              <img 
                src={brazilMapGold}
                alt="Mapa do Brasil Dourado"
                className="w-full h-full object-contain opacity-95 animate-pulse duration-1000"
              />
              <div className="absolute top-[58%] left-[54%] w-3.5 h-3.5 rounded-full bg-[#C69A45] border-2 border-white shadow-[0_0_12px_#C69A45] animate-ping" />
            </div>

            <div className="text-center mt-2">
              <span className="text-xs font-black tracking-widest text-white uppercase block">
                COBERTURA NACIONAL 3C
              </span>
              <span className="text-[9px] text-[#A39274] font-mono block mt-0.5">
                Monitoramento ativo de frotas e iscas
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-3 border-t border-white/10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 text-center">
            {menuModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  onClick={() => onNavigate?.(mod.id)}
                  className="bg-black/60 hover:bg-black/80 border border-white/10 rounded-xl py-2 px-1 text-stone-200 cursor-pointer flex flex-col items-center transition-colors"
                >
                  <Icon size={14} className="text-[#C69A45] mb-1" />
                  <span className="text-[8.5px] font-black uppercase tracking-wider">{mod.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: PODIUM & VOTES SUMMARY (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 bg-[#1A1916] border border-[#333026] rounded-3xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#333026] mb-3">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#C69A45]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">DIFERENÇA 1º X 2º</span>
              </div>
              <span className="text-[8px] font-mono uppercase bg-[#22211D] text-[#C69A45] border border-[#333026] px-2 py-0.5 rounded-full">
                BRASIL
              </span>
            </div>

            <div className="text-left mb-3">
              <span className="text-2xl font-black font-mono text-white tracking-tight block">
                5.559.042 <small className="text-xs font-bold text-[#A39274]">votos</small>
              </span>
              <span className="text-[10px] font-bold text-[#C69A45] block mt-0.5 font-mono">
                7,33 pontos percentuais
              </span>
            </div>

            {/* Podium Image Card */}
            <div className="w-full h-32 rounded-2xl overflow-hidden border border-[#333026] relative bg-[#22211D] shadow-inner mb-4 group">
              <img 
                src={goldPodiumImg} 
                alt="Pódio de Ouro" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="bg-[#22211D] border border-[#333026] rounded-2xl p-3 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase text-[#A39274] block">VOTOS VÁLIDOS</span>
                <span className="text-xs font-black font-mono text-white block mt-0.5">75.762.826</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-1 rounded-lg">
                (95,43%)
              </span>
            </div>

            <div className="pt-3 border-t border-[#333026] text-center mt-3">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#C69A45] uppercase">
                criado por jefferson augusto
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
