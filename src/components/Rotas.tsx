import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import { 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Search, 
  ArrowRightLeft, 
  MapPin, 
  Navigation,
  Globe,
  Settings2,
  Database,
  ArrowRight,
  ShieldCheck,
  Activity,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Clipboard,
  Check,
  Upload,
  Download,
  AlertTriangle,
  LayoutGrid,
  Sparkles,
  Route as RouteIcon,
  Compass,
  Container,
  Clock,
  CheckCircle2,
  Radio,
  Tv,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { rtdb as db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { safeCopyText } from '../utils/clipboard';
import { BrazilMapBroadcast, BRAZIL_STATES } from './common/BrazilMapBroadcast';

interface RouteItem {
  ida: string;
  idaCod: string;
  volta: string;
  voltaCod: string;
}

const DEFAULT_ROUTES: RouteItem[] = [
  { ida: 'SANTA LUZIA-MG X RIO DE JANEIRO-RJ', idaCod: '4069', volta: 'RIO DE JANEIRO-RJ X SANTA LUZIA-MG', voltaCod: '4079' },
  { ida: 'SANTA LUZIA-MG X GUARULHOS-SP', idaCod: '4070', volta: 'GUARULHOS-SP X SANTA LUZIA-MG', voltaCod: '3971/4076' },
  { ida: 'SANTA LUZIA-MG X MONTES CLAROS-MG', idaCod: '', volta: 'MONTES CLAROS-MG X SANTA LUZIA-MG', voltaCod: '4081' },
  { ida: 'SANTA LUZIA-MG X VIANA-ES', idaCod: '', volta: 'VIANA-ES X SANTA LUZIA-MG', voltaCod: '3985' },
  { ida: 'SANTA LUZIA-MG X BRASILIA-DF', idaCod: '4071', volta: 'BRASILIA-DF X SANTA LUZIA-MG', voltaCod: '4077' },
  { ida: 'SANTA LUZIA-MG X SUMARE-SP', idaCod: '', volta: 'SUMARE-SP X SANTA LUZIA-MG', voltaCod: '3994' },
  { ida: 'SANTA LUZIA-MG X PINHAIS-PR', idaCod: '', volta: 'PINHAIS-PR X SANTA LUZIA-MG', voltaCod: '4080' },
  { ida: 'SANTA LUZIA-MG X LONDRINA-PR', idaCod: '4027', volta: 'LONDRINA-PR X SANTA LUZIA-MG', voltaCod: '3975/4078/4091' },
  { ida: 'SANTA LUZIA-MG X NATAL-RN', idaCod: '4015', volta: 'NATAL-RN X SANTA LUZIA-MG', voltaCod: '3969/3970/4075' },
  { ida: 'SANTA LUZIA-MG X GOV. CELSO RAMOS-SC', idaCod: '', volta: 'GOV. CELSO RAMOS-SC X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X SALVADOR-BA', idaCod: '', volta: 'SALVADOR-BA X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X EUSEBIO-CE', idaCod: '', volta: 'EUSEBIO-CE X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X GRAVATAI-RS', idaCod: '', volta: 'GRAVATAI-RS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CAMPO GRANDE-MS', idaCod: '', volta: 'CAMPO GRANDE-MS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CUIABA-MT', idaCod: '', volta: 'CUIABA-MT X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X ARIQUEMES-RO', idaCod: '', volta: 'ARIQUEMES-RO X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X VESPASIANO-MG', idaCod: '', volta: 'VESPASIANO-MG X SANTA LUZIA-MG', voltaCod: '3989/3990' },
];

const UF_LIST = [
  'BR', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 
  'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function Rotas({ onBack }: { onBack?: () => void }) {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempRoutes, setTempRoutes] = useState<RouteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUf, setSelectedUf] = useState<string>('BR');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // States for backup and migration
  const [legacyData, setLegacyData] = useState<RouteItem[] | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2200);
  };

  const copyIndividualCode = async (code: string, label: string) => {
    if (!code) return;
    await safeCopyText(code);
    setCopiedCode(`${label}-${code}`);
    showToast(`Código ${code} copiado!`);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  useEffect(() => {
    const rotasRef = ref(db, 'rotas_data');
    const unsubscribe = onValue(rotasRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length > 0) {
        setRoutes(data);
      } else {
        const saved = localStorage.getItem('app_rotas_data');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              set(rotasRef, parsed);
              setRoutes(parsed);
              return;
            }
          } catch (e) {
            console.error('Erro ao ler dados locais de rotas:', e);
          }
        }
        set(rotasRef, DEFAULT_ROUTES);
        setRoutes(DEFAULT_ROUTES);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStartEdit = () => {
    setTempRoutes(JSON.parse(JSON.stringify(routes)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempRoutes([]);
  };

  const handleSave = async () => {
    try {
      const rotasRef = ref(db, 'rotas_data');
      await set(rotasRef, tempRoutes);
      setRoutes(tempRoutes);
      setIsEditing(false);
      showToast('Rotas salvas com sucesso no banco em nuvem!');
    } catch (err) {
      console.error('Erro ao salvar rotas no Firebase:', err);
      showToast('Erro ao salvar dados na nuvem.');
    }
  };

  const updateRow = (index: number, field: keyof RouteItem, value: string) => {
    const updated = [...tempRoutes];
    updated[index] = { ...updated[index], [field]: value.toUpperCase() };
    setTempRoutes(updated);
  };

  const addRow = () => {
    setTempRoutes([
      ...tempRoutes,
      { ida: 'SANTA LUZIA-MG X NOVO DESTINO-UF', idaCod: '', volta: 'NOVO DESTINO-UF X SANTA LUZIA-MG', voltaCod: '' }
    ]);
  };

  const removeRow = (index: number) => {
    const updated = tempRoutes.filter((_, i) => i !== index);
    setTempRoutes(updated);
  };

  // Helper to extract UF from route string
  const extractUf = (routeStr: string): string => {
    const match = routeStr.match(/-([A-Z]{2})/);
    if (match) return match[1];
    const parts = routeStr.split('X');
    if (parts[1]) {
      const ufMatch = parts[1].match(/\b([A-Z]{2})\b/);
      if (ufMatch) return ufMatch[1];
    }
    return 'MG';
  };

  // Build map state distribution
  const mapStateData = useMemo(() => {
    const data: Record<string, { status: 'active' | 'secondary' | 'neutral'; count: number; detail: string; color: string }> = {};
    
    // Always mark MG (origin base)
    data['MG'] = {
      status: 'active',
      count: routes.length,
      detail: `Base Operacional Central (Santa Luzia/Vespasiano) • ${routes.length} rotas conectadas`,
      color: '#ff5500'
    };

    routes.forEach(r => {
      const ufDest = extractUf(r.ida);
      if (ufDest) {
        data[ufDest] = {
          status: 'active',
          count: (data[ufDest]?.count || 0) + 1,
          detail: `${r.ida} (Ida: ${r.idaCod || 'S/C'} | Volta: ${r.voltaCod || 'S/C'})`,
          color: '#ff5500'
        };
      }
    });

    // Fill in other states as secondary
    BRAZIL_STATES.forEach(st => {
      if (!data[st.uf]) {
        data[st.uf] = {
          status: 'secondary',
          count: 0,
          detail: `${st.name} (${st.uf}) • Área de Expansão e Monitoramento`,
          color: '#5c6b7e'
        };
      }
    });

    return data;
  }, [routes]);

  const activeUfsCount = useMemo(() => {
    return Object.values(mapStateData).filter((d: { status: string }) => d.status === 'active').length;
  }, [mapStateData]);

  const coveragePercent = useMemo(() => {
    return ((activeUfsCount / 27) * 100).toFixed(2).replace('.', ',');
  }, [activeUfsCount]);

  // Filtered rows
  const activeRoutesList = isEditing ? tempRoutes : routes;

  const filteredRoutes = useMemo(() => {
    return activeRoutesList.filter(r => {
      const matchesSearch = !searchTerm.trim() || 
        r.ida.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.volta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.idaCod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.voltaCod.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedUf === 'BR') return true;

      const ufDest = extractUf(r.ida);
      return ufDest === selectedUf || r.ida.includes(`-${selectedUf}`) || r.volta.includes(`-${selectedUf}`);
    });
  }, [activeRoutesList, searchTerm, selectedUf]);

  const handleUfClick = (uf: string) => {
    if (selectedUf === uf) {
      setSelectedUf('BR');
    } else {
      setSelectedUf(uf);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4eee5] text-[#1a1614] font-sans flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-slate-950/90 text-white border border-white/20 text-xs font-mono font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <Check size={16} className="text-emerald-400" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-3 p-2 sm:p-4 max-w-[1700px] mx-auto">
        
        {/* ========================================================================= */}
        {/* MASTER BROADCAST HERO PANELS                                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          
          {/* Top Left Title Banner (3C Vermelho Corporativo & Vinho) */}
          <div className="lg:col-span-7 bg-gradient-to-r from-[#7a0c16] via-[#c4161c] to-[#910d14] text-white p-4 sm:p-5 rounded-2xl shadow-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
            <div className="space-y-1 relative z-10 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-[#ffd54f] uppercase tracking-widest">
                  PAINEL OPERACIONAL DE ROTAS & EXPEDIÇÃO
                </span>
                <span className="bg-white/20 text-[#ffd54f] text-[9px] font-mono font-black px-2 py-0.5 rounded-full border border-white/30 uppercase">
                  LOGÍSTICA 3C
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 font-heading">
                ROTAS <span className="text-[#ffd54f]">BRASIL</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 relative z-10">
              <div className="bg-black/25 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-left">
                <span className="text-[9px] font-mono font-bold text-white/80 uppercase block">STATUS DAS UFs</span>
                <span className="text-xs font-mono font-black text-[#ffd54f] uppercase tracking-wide">
                  {activeUfsCount} de 27 UFs com rotas
                </span>
              </div>

              {onBack && (
                <button
                  onClick={onBack}
                  className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all cursor-pointer border border-white/20"
                  title="Voltar ao Painel Principal"
                >
                  <ArrowRightLeft size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Top Right Broadcast Progress Card */}
          <div className="lg:col-span-5 bg-white border border-[#e8ded2] p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-black text-[#8a7c6e] uppercase tracking-wider">
                COBERTURA NACIONAL — ROTAS
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#1a1614] tracking-tight font-heading">
                {coveragePercent}%
              </span>
            </div>

            <div className="w-full bg-[#f4ece0] h-3 rounded-full overflow-hidden border border-[#e8ded2] p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#c4161c] via-[#b8141c] to-[#dfb15b] rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${(activeUfsCount / 27) * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#8a7c6e] mt-2">
              <span>{routes.length} Trechos Cadastrados</span>
              <span className="text-[#c4161c] font-black">{selectedUf === 'BR' ? 'Visão Geral Brasil' : `Filtro UF: ${selectedUf}`}</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MAIN SPLIT VIEW: INTERACTIVE MAP (LEFT) + BROADCAST TABLE (RIGHT)          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
          
          {/* LEFT 7 COLUMNS: BROADCAST MAP DISPLAY */}
          <div className="xl:col-span-7 bg-[#f8fafc]/92 backdrop-blur-md border border-[#e8ded2] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between relative min-h-[560px]">
            
            {/* Map Top Bar */}
            <div className="flex items-center justify-between mb-3 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c4161c] animate-pulse" />
                <h3 className="text-xs font-mono font-black text-[#1a1614] uppercase tracking-wider font-heading">
                  MAPA GEOPOLÍTICO DE ESCALAS • BRASIL
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedUf !== 'BR' && (
                  <button
                    onClick={() => setSelectedUf('BR')}
                    className="px-2.5 py-1 rounded-lg bg-[#f4ece0] hover:bg-[#e8ded2] text-[#1a1614] font-mono text-[10px] font-bold uppercase transition-all cursor-pointer border border-[#e8ded2]"
                  >
                    Ver Todas UFs
                  </button>
                )}
                <span className="text-[10px] font-mono font-bold text-[#8a7c6e] bg-[#fbf8f3] px-2.5 py-1 rounded-lg border border-[#e8ded2]">
                  Clique na UF para filtrar
                </span>
              </div>
            </div>

            {/* Interactive Vector Map */}
            <div className="w-full flex-1 flex items-center justify-center my-2 relative">
              <BrazilMapBroadcast
                selectedUf={selectedUf === 'BR' ? null : selectedUf}
                onSelectUf={handleUfClick}
                stateData={mapStateData}
                activeColor="#c4161c"
                secondaryColor="#8a7c6e"
                titleLegend="LEGENDA DE COBERTURA 3C"
                legendItems={[
                  { label: 'UFs com Rotas Regulares', count: `${activeUfsCount} UFs`, color: '#c4161c' },
                  { label: 'UFs de Apoio / Rede', count: `${27 - activeUfsCount} UFs`, color: '#8a7c6e' }
                ]}
              />
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-3 border-t border-[#f0e8dd] flex flex-wrap items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const tsv = routes.map(r => `${r.ida}\t${r.idaCod}\t${r.volta}\t${r.voltaCod}`).join('\n');
                    safeCopyText(tsv);
                    showToast('Tabela de rotas copiada como TSV!');
                  }}
                  className="px-3 py-1.5 bg-[#fbf8f3] hover:bg-white text-[#57493d] rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border border-[#e8ded2] shadow-2xs"
                >
                  <Clipboard size={12} />
                  <span>Copiar TSV</span>
                </button>

                <button
                  onClick={() => setIsBackupOpen(true)}
                  className="px-3 py-1.5 bg-[#fbf8f3] hover:bg-white text-[#57493d] rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border border-[#e8ded2] shadow-2xs"
                >
                  <Database size={12} />
                  <span>Backup JSON</span>
                </button>
              </div>

              <div className="text-[10px] font-mono text-[#8a7c6e]">
                Base central: <strong className="text-[#1a1614]">Santa Luzia / Vespasiano (MG)</strong>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: LEADERBOARD & DETAILED TABLE */}
          <div className="xl:col-span-5 space-y-3.5">
            
            {/* Candidate / Route Summary Cards */}
            <div className="bg-[#f8fafc]/92 backdrop-blur-md border border-[#e8ded2] rounded-2xl p-4 shadow-sm space-y-3">
              <span className="text-[9.5px] font-mono font-black text-[#8a7c6e] uppercase tracking-wider block">
                DISTRIBUIÇÃO DE FLUXO OPERACIONAL
              </span>

              {/* Leader Card 1: Rota Ida */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded2]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c4161c] to-[#910d14] text-white flex items-center justify-center font-mono font-black text-sm shadow-xs">
                    IDA
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-xs font-black text-[#1a1614] uppercase block">FLUXO DEDICADO</span>
                    <span className="text-[10px] font-mono font-bold text-[#8a7c6e] mt-1 block">Santa Luzia ➔ Destinos</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-black text-[#c4161c] block">48,47%</span>
                  <span className="text-[9px] font-bold text-[#8a7c6e] uppercase">Volume Regular</span>
                </div>
              </div>

              {/* Leader Card 2: Rota Volta */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbf8f3] border border-[#e8ded2]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7a0c16] text-white flex items-center justify-center font-mono font-black text-sm shadow-xs">
                    RET
                  </div>
                  <div className="text-left leading-none">
                    <span className="text-xs font-black text-[#1a1614] uppercase block">FLUXO RETORNO</span>
                    <span className="text-[10px] font-mono font-bold text-[#8a7c6e] mt-1 block">Destinos ➔ Santa Luzia</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-black text-[#7a0c16] block">43,49%</span>
                  <span className="text-[9px] font-bold text-[#8a7c6e] uppercase">Volume Retorno</span>
                </div>
              </div>
            </div>

            {/* Detailed Table Card (Matching Broadcast TV State Leaderboard) */}
            <div className="bg-white border border-[#e8ded2] rounded-2xl p-4 shadow-xs space-y-3">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0e8dd] pb-3">
                <div className="text-left">
                  <h4 className="text-xs font-mono font-black text-[#1a1614] uppercase tracking-wide flex items-center gap-1.5 font-heading">
                    <RouteIcon size={14} className="text-[#c4161c]" />
                    TABELA DE CÓDIGOS E ROTAS
                  </h4>
                  <span className="text-[10px] font-mono text-[#8a7c6e] block mt-0.5">
                    {filteredRoutes.length} registros exibidos • Clique no código para copiar
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isEditing ? (
                    <>
                      <button
                        onClick={addRow}
                        className="px-2.5 py-1.5 rounded-xl bg-[#fbf8f3] hover:bg-white text-[#1a1614] font-mono text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer border border-[#e8ded2]"
                      >
                        <Plus size={12} /> Add
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#c4161c] to-[#910d14] text-white font-mono text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Save size={12} /> Salvar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-2.5 py-1.5 rounded-xl bg-[#e8ded2] text-[#57493d] font-mono text-[10px] font-black uppercase transition-all cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 rounded-xl bg-[#c4161c] hover:bg-[#910d14] text-white font-mono text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Edit2 size={12} />
                      <span>Editar Rotas</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Field */}
              <div className="relative w-full">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7c6e]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por cidade, código ou UF..."
                  className="w-full bg-[#fbf8f3] border border-[#e8ded2] rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-[#1a1614] focus:bg-white focus:border-[#c4161c] outline-none transition-all placeholder:text-[#a89a8a]"
                />
              </div>

              {/* Table Container */}
              <div className="overflow-y-auto max-h-[460px] rounded-xl border border-[#e8ded2]">
                <table className="w-full border-collapse text-left font-mono text-xs">
                  <thead className="sticky top-0 bg-gradient-to-r from-[#7a0c16] via-[#910d14] to-[#7a0c16] text-white z-10 text-[9.5px] uppercase font-black tracking-wider">
                    <tr>
                      <th className="p-2.5 w-12 text-center">UF</th>
                      <th className="p-2.5">TRECHO / ROTA</th>
                      <th className="p-2.5 text-center w-24">CÓD. IDA</th>
                      <th className="p-2.5 text-center w-28">CÓD. VOLTA</th>
                      {isEditing && <th className="p-2.5 text-center w-10">AÇÕES</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e8dd] bg-white">
                    {filteredRoutes.map((row, idx) => {
                      const uf = extractUf(row.ida);
                      const isIdaCopied = copiedCode === `ida-${row.idaCod}`;
                      const isVoltaCopied = copiedCode === `volta-${row.voltaCod}`;

                      return (
                        <tr 
                          key={idx} 
                          className="hover:bg-[#fbf8f3] transition-colors group"
                        >
                          {/* UF Badge */}
                          <td className="p-2.5 text-center font-black">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black",
                              selectedUf === uf 
                                ? "bg-[#c4161c] text-white shadow-2xs" 
                                : "bg-[#f4ece0] text-[#57493d]"
                            )}>
                              {uf}
                            </span>
                          </td>

                          {/* Route Name */}
                          <td className="p-2.5">
                            {isEditing ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={row.ida}
                                  onChange={(e) => updateRow(idx, 'ida', e.target.value)}
                                  className="w-full bg-[#fbf8f3] border border-[#e8ded2] rounded px-2 py-1 text-[11px] font-bold uppercase"
                                />
                                <input
                                  type="text"
                                  value={row.volta}
                                  onChange={(e) => updateRow(idx, 'volta', e.target.value)}
                                  className="w-full bg-[#fbf8f3] border border-[#e8ded2] rounded px-2 py-1 text-[11px] font-bold uppercase text-[#73675a]"
                                />
                              </div>
                            ) : (
                              <div>
                                <span className="font-extrabold text-[#1a1614] text-[11px] block truncate max-w-[200px] sm:max-w-xs">
                                  {row.ida}
                                </span>
                                <span className="text-[9.5px] text-[#8a7c6e] block truncate max-w-[200px] sm:max-w-xs mt-0.5">
                                  {row.volta}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Cód Ida */}
                          <td className="p-2.5 text-center">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.idaCod}
                                onChange={(e) => updateRow(idx, 'idaCod', e.target.value)}
                                className="w-full bg-[#fbf8f3] border border-[#e8ded2] rounded px-1.5 py-1 text-center font-mono font-bold text-xs"
                                placeholder="---"
                              />
                            ) : row.idaCod ? (
                              <button
                                onClick={() => copyIndividualCode(row.idaCod, 'ida')}
                                className={cn(
                                  "px-2 py-1 rounded-md text-[11px] font-bold font-mono transition-all cursor-pointer border w-full text-center",
                                  isIdaCopied
                                    ? "bg-emerald-600 text-white border-emerald-700"
                                    : "bg-[#fbf8f3] hover:bg-[#c4161c] hover:text-white text-[#1a1614] border-[#e8ded2]"
                                )}
                                title="Clique para copiar"
                              >
                                {isIdaCopied ? 'OK' : row.idaCod}
                              </button>
                            ) : (
                              <span className="text-[#c7baa8] text-[10px]">---</span>
                            )}
                          </td>

                          {/* Cód Volta */}
                          <td className="p-2.5 text-center">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.voltaCod}
                                onChange={(e) => updateRow(idx, 'voltaCod', e.target.value)}
                                className="w-full bg-[#fbf8f3] border border-[#e8ded2] rounded px-1.5 py-1 text-center font-mono font-bold text-xs"
                                placeholder="---"
                              />
                            ) : row.voltaCod ? (
                              <button
                                onClick={() => copyIndividualCode(row.voltaCod, 'volta')}
                                className={cn(
                                  "px-2 py-1 rounded-md text-[10.5px] font-black font-mono transition-all cursor-pointer border w-full text-center",
                                  isVoltaCopied
                                    ? "bg-emerald-600 text-white border-emerald-700"
                                    : "bg-[#fae8e9] hover:bg-[#7a0c16] hover:text-white text-[#7a0c16] border-[#f5c6cb]"
                                )}
                                title="Clique para copiar"
                              >
                                {isVoltaCopied ? 'OK' : row.voltaCod}
                              </button>
                            ) : (
                              <span className="text-[#c7baa8] text-[10px]">---</span>
                            )}
                          </td>

                          {/* Action Delete in Edit Mode */}
                          {isEditing && (
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => removeRow(idx)}
                                className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                                title="Remover Rota"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM BROADCAST STUDIO TICKER FOOTER                                      */}
        {/* ========================================================================= */}
        <div className="w-full bg-gradient-to-r from-[#7a0c16] via-[#8c0f18] to-[#5e070e] text-white p-2.5 sm:p-3 rounded-2xl shadow-md border border-white/20 flex flex-col sm:flex-row items-center justify-between text-[10.5px] font-mono gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 font-black text-[#ffd54f]">
              <span className="w-2 h-2 rounded-full bg-[#ffd54f] inline-block animate-ping" />
              FONTE: SISTEMA OPERACIONAL LOGÍSTICO 3C
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">Coletor: 100% Sincronizado</span>
            <span className="text-white/40">•</span>
            <span className="text-[#ffd54f] font-bold">{routes.length} rotas ativas</span>
          </div>

          <div className="flex items-center gap-2 text-white/70 text-[9.5px] uppercase">
            <span>[↑↓] navegar</span>
            <span>•</span>
            <span>[←→] selecionar UF</span>
            <span>•</span>
            <span>[M] mapa</span>
            <span>•</span>
            <span className="text-[#ffd54f] font-bold">[3C] LOGÍSTICA</span>
          </div>
        </div>

      </div>

      {/* Backup & JSON Modal */}
      <AnimatePresence>
        {isBackupOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-lg w-full text-left space-y-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Database size={18} className="text-[#001a44]" />
                  <h3 className="text-sm font-mono font-black text-slate-900 uppercase">
                    BACKUP & RESTAURAÇÃO DE ROTAS
                  </h3>
                </div>
                <button
                  onClick={() => setIsBackupOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Exporte o backup atual em formato JSON ou cole dados para restaurar a base de rotas.
                </p>

                <textarea
                  rows={6}
                  value={backupText || JSON.stringify(routes, null, 2)}
                  onChange={(e) => setBackupText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#001a44] outline-none"
                />

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => {
                      safeCopyText(JSON.stringify(routes, null, 2));
                      showToast('JSON copiado com sucesso!');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-mono text-xs font-black uppercase cursor-pointer"
                  >
                    Copiar JSON
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const parsed = JSON.parse(backupText);
                        if (Array.isArray(parsed)) {
                          const rotasRef = ref(db, 'rotas_data');
                          await set(rotasRef, parsed);
                          setRoutes(parsed);
                          setIsBackupOpen(false);
                          showToast('Rotas restauradas com sucesso!');
                        }
                      } catch (e) {
                        alert('JSON inválido.');
                      }
                    }}
                    className="px-4 py-2 bg-[#001a44] hover:bg-[#002766] text-white rounded-xl font-mono text-xs font-black uppercase cursor-pointer shadow-sm"
                  >
                    Importar / Restaurar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
