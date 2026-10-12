import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../lib/utils';
import { 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Search, 
  Database,
  Check,
  Clipboard,
  Route as RouteIcon
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
  { ida: 'SANTA LUZIA-MG X MACEIÓ-AL', idaCod: '4327', volta: 'MACEIÓ-AL X SANTA LUZIA-MG', voltaCod: '-' },
  { ida: 'SANTA LUZIA-MG X RIO DE JANEIRO-RJ', idaCod: '4878', volta: 'RIO DE JANEIRO-RJ X SANTA LUZIA-MG', voltaCod: '4879' },
  { ida: 'SANTA LUZIA-MG X GUARULHOS-SP', idaCod: '4878', volta: 'GUARULHOS-SP X SANTA LUZIA-MG', voltaCod: '4876' },
  { ida: 'SANTA LUZIA-MG X MONTES CLAROS-MG', idaCod: '4588', volta: 'MONTES CLAROS-MG X SANTA LUZIA-MG', voltaCod: '4171' },
  { ida: 'SANTA LUZIA-MG X VIANA-ES', idaCod: '4584', volta: 'VIANA-ES X SANTA LUZIA-MG', voltaCod: '3985' },
  { ida: 'SANTA LUZIA-MG X BRASÍLIA-DF', idaCod: '4582', volta: 'BRASÍLIA-DF X SANTA LUZIA-MG', voltaCod: '4877' },
  { ida: 'SANTA LUZIA-MG X SUMARÉ-SP', idaCod: '4198', volta: 'SUMARÉ-SP X SANTA LUZIA-MG', voltaCod: '3994' },
  { ida: 'SANTA LUZIA-MG X PINHAIS-PR', idaCod: '4588', volta: 'PINHAIS-PR X SANTA LUZIA-MG', voltaCod: '4830' },
  { ida: 'SANTA LUZIA-MG X LONDRINA-PR', idaCod: '4293', volta: 'LONDRINA-PR X SANTA LUZIA-MG', voltaCod: '4891' },
  { ida: 'SANTA LUZIA-MG X NATAL-RN', idaCod: '4156', volta: 'NATAL-RN X SANTA LUZIA-MG', voltaCod: '3979' },
  { ida: 'SANTA LUZIA-MG X GOV. CELSO RAMOS-SC', idaCod: '3332', volta: 'GOV. CELSO RAMOS-SC X SANTA LUZIA-MG', voltaCod: '3212' },
  { ida: 'SANTA LUZIA-MG X SALVADOR-BA', idaCod: '3611', volta: 'SALVADOR-BA X SANTA LUZIA-MG', voltaCod: '2746' },
  { ida: 'SANTA LUZIA-MG X EUSEBIO-CE', idaCod: '3658', volta: 'EUSEBIO-CE X SANTA LUZIA-MG', voltaCod: '259' },
  { ida: 'SANTA LUZIA-MG X GRAVATAÍ-RS', idaCod: '3706', volta: 'GRAVATAÍ-RS X SANTA LUZIA-MG', voltaCod: '-' },
  { ida: 'SANTA LUZIA-MG X CAMPO GRANDE-MT', idaCod: '4191', volta: 'CAMPO GRANDE-MT X SANTA LUZIA-MG', voltaCod: '2116' },
  { ida: 'SANTA LUZIA-MG X CUIABÁ-MT', idaCod: '1787', volta: 'CUIABÁ-MT X SANTA LUZIA-MG', voltaCod: '2119' },
  { ida: 'SANTA LUZIA-MG X ARIQUEMES-RO', idaCod: '-', volta: 'ARIQUEMES-RO X SANTA LUZIA-MG', voltaCod: '-' },
  { ida: 'SANTA LUZIA-MG X VESPASIANO-MG', idaCod: '4597', volta: 'VESPASIANO-MG X SANTA LUZIA-MG', voltaCod: '3990' },
  { ida: 'SANTA LUZIA-MG X CASTRO-PR', idaCod: '368', volta: 'CASTRO-PR X SANTA LUZIA-MG', voltaCod: '4177' },
  { ida: 'SANTA LUZIA-MG X ARAÇARIGUAMA-SP', idaCod: '-', volta: 'ARAÇARIGUAMA-SP X SANTA LUZIA-MG', voltaCod: '3614' }
];

const OFFICIAL_IDA_CODES: Record<string, string> = {
  'MACEIÓ': '4327',
  'MACEO': '4327',
  'RIO DE JANEIRO': '4878',
  'GUARULHOS': '4878',
  'MONTES CLAROS': '4588',
  'VIANA': '4584',
  'BRASÍLIA': '4582',
  'BRASILIA': '4582',
  'SUMARÉ': '4198',
  'SUMARE': '4198',
  'PINHAIS': '4588',
  'LONDRINA': '4293',
  'NATAL': '4156',
  'GOV. CELSO RAMOS': '3332',
  'SALVADOR': '3611',
  'EUSEBIO': '3658',
  'GRAVATAÍ': '3706',
  'CAMPO GRANDE': '4191',
  'CUIABÁ': '1787',
  'VESPASIANO': '4597',
  'CASTRO': '368'
};

const getDisplayIdaCod = (row: RouteItem) => {
  if (row.idaCod && row.idaCod.trim() !== '' && row.idaCod !== '-') {
    return row.idaCod;
  }
  const upper = (row.ida || '').toUpperCase();
  for (const [key, code] of Object.entries(OFFICIAL_IDA_CODES)) {
    if (upper.includes(key)) {
      return code;
    }
  }
  return row.idaCod || '';
};

export default function Rotas({ onBack }: { onBack?: () => void }) {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempRoutes, setTempRoutes] = useState<RouteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUf, setSelectedUf] = useState<string>('BR');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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
        const normalized = data.map((r: any) => {
          let idaCod = String(r.idaCod ?? r.codigoIda ?? r.codigo_ida ?? r.codeIda ?? r.ida_cod ?? r.codigo ?? r.id ?? '').trim();
          if (!idaCod || idaCod === '-' || idaCod === '---') {
            const upperIda = (r.ida || '').toUpperCase();
            for (const [key, code] of Object.entries(OFFICIAL_IDA_CODES)) {
              if (upperIda.includes(key)) {
                idaCod = code;
                break;
              }
            }
          }
          if (!idaCod || idaCod === '-') idaCod = '';

          let voltaCod = String(r.voltaCod ?? r.codigoVolta ?? r.codigo_volta ?? r.codeVolta ?? r.volta_cod ?? r.volta_codigo ?? '').trim();
          if (voltaCod === '-') voltaCod = '';

          return {
            ida: String(r.ida || r.trechoIda || r.route || ''),
            idaCod,
            volta: String(r.volta || r.trechoVolta || ''),
            voltaCod
          };
        });
        setRoutes(normalized);
      } else {
        const saved = localStorage.getItem('app_rotas_data');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const normalized = parsed.map((r: any) => {
                let idaCod = String(r.idaCod ?? r.codigoIda ?? r.codigo_ida ?? r.codeIda ?? r.ida_cod ?? r.codigo ?? r.id ?? '').trim();
                if (!idaCod || idaCod === '-' || idaCod === '---') {
                  const upperIda = (r.ida || '').toUpperCase();
                  for (const [key, code] of Object.entries(OFFICIAL_IDA_CODES)) {
                    if (upperIda.includes(key)) {
                      idaCod = code;
                      break;
                    }
                  }
                }
                if (!idaCod || idaCod === '-') idaCod = '';

                let voltaCod = String(r.voltaCod ?? r.codigoVolta ?? r.codigo_volta ?? r.codeVolta ?? r.volta_cod ?? r.volta_codigo ?? '').trim();
                if (voltaCod === '-') voltaCod = '';

                return {
                  ida: String(r.ida || r.trechoIda || r.route || ''),
                  idaCod,
                  volta: String(r.volta || r.trechoVolta || ''),
                  voltaCod
                };
              });
              set(rotasRef, normalized);
              setRoutes(normalized);
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
      showToast('Rotas salvas com sucesso na nuvem!');
    } catch (err) {
      console.error('Erro ao salvar rotas no Firebase:', err);
      showToast('Erro ao salvar dados na nuvem.');
    }
  };

  const handleResetDefault = async () => {
    try {
      const rotasRef = ref(db, 'rotas_data');
      await set(rotasRef, DEFAULT_ROUTES);
      setRoutes(DEFAULT_ROUTES);
      showToast('Rotas oficiais restauradas com sucesso!');
    } catch (err) {
      console.error('Erro ao restaurar rotas:', err);
      showToast('Erro ao restaurar rotas oficiais.');
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

  const mapStateData = useMemo(() => {
    const data: Record<string, { status: 'active' | 'secondary' | 'neutral'; count: number; detail: string; color: string }> = {};
    
    // MG is always base operational (Amber/Gold highlight #D69A21)
    data['MG'] = {
      status: 'active',
      count: routes.length,
      detail: `Base Operacional Central (Santa Luzia/Vespasiano) • ${routes.length} rotas conectadas`,
      color: '#D69A21'
    };

    routes.forEach(r => {
      const ufDest = extractUf(r.ida);
      if (ufDest && ufDest !== 'MG') {
        data[ufDest] = {
          status: 'active',
          count: (data[ufDest]?.count || 0) + 1,
          detail: `${r.ida} (Ida: ${r.idaCod || 'S/C'} | Volta: ${r.voltaCod || 'S/C'})`,
          color: '#596D81'
        };
      }
    });

    BRAZIL_STATES.forEach(st => {
      if (!data[st.uf]) {
        data[st.uf] = {
          status: 'secondary',
          count: 0,
          detail: `${st.name} (${st.uf}) • Área de Expansão e Monitoramento`,
          color: '#596D81'
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
    <div className="w-full relative pb-12 space-y-5 font-sans text-[#29261F] text-left bg-[#F5EFE4] p-4 sm:p-6 rounded-3xl border border-[#E5D1A5] shadow-xl">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[#FFFDF8] text-[#29261F] border border-[#C69A45] text-xs font-mono font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-full bg-[#C69A45]/20 flex items-center justify-center text-[#C69A45]">
              <Check size={14} className="stroke-[3]" />
            </div>
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-4">
        
        {/* ========================================================================= */}
        {/* BANNER DE GERENCIAMENTO DE ROTAS (MATCHING REFERENCE IMAGE)               */}
        {/* ========================================================================= */}
        <div className="relative w-full h-[76px] bg-[#FFFDF8] rounded-2xl overflow-hidden flex items-center justify-between px-6 shadow-sm border border-[#E5D1A5]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF8] via-[#F1E7D5]/40 to-[#FFFDF8] pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E5D1A5] to-[#C69A45] flex items-center justify-center text-[#29261F] shadow-sm shrink-0 border border-[#D8B56D]/50">
              <RouteIcon size={24} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10.5px] font-black tracking-widest text-[#8F692A] uppercase font-mono">
                ROTA DE TRANSPORTE • BRASIL • MG
              </span>
              <span className="text-[24px] font-black tracking-tight text-[#29261F] uppercase font-heading">
                GERENCIAMENTO DE ROTAS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="hidden sm:flex bg-[#F1E7D5] border border-[#E5D1A5] px-4 py-2 rounded-xl text-left shadow-xs">
              <span className="text-xs font-mono font-black text-[#29261F] uppercase tracking-wide">
                1 DE 27 UFs COM ROTAS
              </span>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-xs font-black rounded-xl border bg-[#FFFDF8] hover:bg-[#F1E7D5] text-[#29261F] border-[#C69A45] cursor-pointer transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
                title="Voltar"
              >
                Voltar
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COBERTURA NACIONAL — ROTAS BANNER                                         */}
        {/* ========================================================================= */}
        <div className="bg-[#FFFDF8] border border-[#E5D1A5] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden text-[#29261F]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black text-[#8F692A] uppercase tracking-wider">
                COBERTURA NACIONAL • ROTAS
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-bold text-[#71695C]">
                {routes.length} Trechos Cadastrados
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#29261F] tracking-tight font-heading">
                {coveragePercent}%
              </span>
            </div>
          </div>

          <div className="w-full bg-[#F1E7D5] h-3 rounded-full overflow-hidden border border-[#E5D1A5] p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#E5D1A5] via-[#C69A45] to-[#8F692A] rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${(activeUfsCount / 27) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#71695C] mt-2">
            <span className="text-[#8F692A]">Rede Logística Ativa em Minas Gerais e Estados Conectados</span>
            <span className="text-[#C69A45] font-black bg-[#F1E7D5] px-2.5 py-0.5 rounded-lg border border-[#E5D1A5]">
              {selectedUf === 'BR' ? 'Visão Geral Brasil' : `Filtro UF: ${selectedUf}`}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN SPLIT VIEW: INTERACTIVE MAP (LEFT) + TABLE & FLOW (RIGHT)             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          
          {/* LEFT 7 COLUMNS: MAPA GEOPOLÍTICO DE ESCALAS */}
          <div className="xl:col-span-7 bg-[#FFFDF8] border border-[#E5D1A5] rounded-2xl p-5 shadow-sm flex flex-col justify-between relative min-h-[580px] text-[#29261F]">
            
            {/* Map Top Bar */}
            <div className="flex items-center justify-between mb-3 z-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C69A45] animate-pulse" />
                <h3 className="text-xs font-mono font-black text-[#29261F] uppercase tracking-wider font-heading">
                  MAPA GEOPOLÍTICO DE ESCALAS • BRASIL
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedUf !== 'BR' && (
                  <button
                    onClick={() => setSelectedUf('BR')}
                    className="px-3 py-1 rounded-lg bg-[#F1E7D5] hover:bg-[#E5D1A5] text-[#29261F] font-mono text-[10px] font-bold uppercase transition-all cursor-pointer border border-[#E5D1A5]"
                  >
                    Ver Todas UFs
                  </button>
                )}
                <span className="text-[10px] font-mono font-bold text-[#71695C] bg-[#F1E7D5] px-3 py-1 rounded-lg border border-[#E5D1A5]">
                  Clique no UF para filtrar
                </span>
              </div>
            </div>

            {/* Interactive Vector Map Container */}
            <div className="w-full flex-1 flex items-center justify-center my-3 relative bg-[#F5EFE4]/50 rounded-2xl p-4 border border-[#E5D1A5]/60">
              <BrazilMapBroadcast
                selectedUf={selectedUf === 'BR' ? null : selectedUf}
                onSelectUf={handleUfClick}
                stateData={mapStateData}
                activeColor="#596D81"
                secondaryColor="#71695C"
                neutralColor="#E5D1A5"
                titleLegend="LEGENDA DE COBERTURA 3C"
                legendItems={[
                  { label: 'UFs com Rotas Regulares', count: `${activeUfsCount} UFs`, color: '#596D81' },
                  { label: 'UFs de Apoio / Rede', count: `${27 - activeUfsCount} UFs`, color: '#71695C' }
                ]}
              />
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-3 border-t border-[#E5D1A5] flex flex-wrap items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const tsv = routes.map(r => `${r.ida}\t${r.idaCod}\t${r.volta}\t${r.voltaCod}`).join('\n');
                    safeCopyText(tsv);
                    showToast('Tabela de rotas copiada como TSV!');
                  }}
                  className="px-3.5 py-2 bg-[#FFFDF8] hover:bg-[#F1E7D5] text-[#29261F] rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border border-[#C69A45] shadow-xs"
                >
                  <Clipboard size={13} className="text-[#C69A45]" />
                  <span>Copiar CSV</span>
                </button>

                <button
                  onClick={() => {
                    const jsonStr = JSON.stringify(routes, null, 2);
                    safeCopyText(jsonStr);
                    showToast('Backup JSON copiado para a área de transferência!');
                  }}
                  className="px-3.5 py-2 bg-[#FFFDF8] hover:bg-[#F1E7D5] text-[#29261F] rounded-xl text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border border-[#C69A45] shadow-xs"
                >
                  <Database size={13} className="text-[#C69A45]" />
                  <span>Backup JSON</span>
                </button>
              </div>

              <div className="text-[10px] font-mono text-[#71695C]">
                Base central: <strong className="text-[#29261F]">Santa Luzia / Vespasiano (MG)</strong>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: DISTRIBUIÇÃO DE FLUXO & TABELA */}
          <div className="xl:col-span-5 space-y-4">
            
            {/* Operational Flow Distribution Cards */}
            <div className="bg-[#FFFDF8] border border-[#E5D1A5] rounded-2xl p-4.5 shadow-sm space-y-3 text-[#29261F]">
              <span className="text-[10px] font-mono font-black text-[#8F692A] uppercase tracking-wider block">
                DISTRIBUIÇÃO DE FLUXO OPERACIONAL
              </span>

              {/* Card 1: Fluxo Dedicado */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5EFE4] border border-[#E5D1A5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5D1A5] to-[#C69A45] text-[#29261F] border border-[#D8B56D]/60 flex items-center justify-center font-mono font-black text-xs shadow-xs">
                    IDA
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-xs font-black text-[#29261F] uppercase block">FLUXO DEDICADO</span>
                    <span className="text-[10px] font-mono font-bold text-[#71695C] mt-0.5 block">Santa Luzia ➔ Destinos</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-black text-[#29261F] block">48,67%</span>
                  <span className="text-[9px] font-bold text-[#8F692A] uppercase">VOLUME REGULAR</span>
                </div>
              </div>

              {/* Card 2: Fluxo Retorno */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5EFE4] border border-[#E5D1A5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F1E7D5] text-[#29261F] border border-[#C69A45]/40 flex items-center justify-center font-mono font-black text-xs shadow-xs">
                    RET
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-xs font-black text-[#29261F] uppercase block">FLUXO RETORNO</span>
                    <span className="text-[10px] font-mono font-bold text-[#71695C] mt-0.5 block">Destinos ➔ Santa Luzia</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-lg font-black text-[#29261F] block">43,49%</span>
                  <span className="text-[9px] font-bold text-[#C91F2D] uppercase">VOLUME RETORNO</span>
                </div>
              </div>
            </div>

            {/* Detailed Table Card */}
            <div className="bg-[#FFFDF8] border border-[#E5D1A5] rounded-2xl p-4.5 shadow-sm space-y-3">
              
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5D1A5] pb-3">
                <div className="text-left">
                  <h4 className="text-xs font-mono font-black text-[#29261F] uppercase tracking-wide flex items-center gap-1.5 font-heading">
                    <RouteIcon size={14} className="text-[#C69A45]" />
                    TABELA DE CÓDIGOS E ROTAS
                  </h4>
                  <span className="text-[10px] font-mono text-[#71695C] block mt-0.5">
                    {filteredRoutes.length} registros exibidos • Clique no código para copiar
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={addRow}
                        className="px-3 py-1.5 rounded-xl bg-[#F1E7D5] hover:bg-[#E5D1A5] text-[#29261F] font-mono text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer border border-[#C69A45]"
                      >
                        <Plus size={12} className="stroke-[3]" /> Add
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E5D1A5] to-[#C69A45] text-[#29261F] font-mono text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 border border-[#C69A45]"
                      >
                        <Save size={12} /> Salvar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-2.5 py-1.5 rounded-xl bg-[#F1E7D5] text-[#29261F] font-mono text-[10px] font-black uppercase transition-all cursor-pointer border border-[#E5D1A5]"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleResetDefault}
                        className="px-3 py-1.5 rounded-xl bg-[#FFFDF8] hover:bg-[#F1E7D5] text-[#29261F] font-mono text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer border border-[#C69A45]"
                        title="Restaurar Rotas Fixas Oficiais"
                      >
                        Restaurar Padrão
                      </button>
                      <button
                        onClick={handleStartEdit}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E5D1A5] to-[#C69A45] text-[#29261F] font-mono text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 border border-[#C69A45]"
                      >
                        <Edit2 size={12} />
                        <span>EDITAR ROTAS</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Field */}
              <div className="relative w-full">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C69A45]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por cidade, código ou UF..."
                  className="w-full bg-[#FFFDF8] border border-[#E5D1A5] rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-[#29261F] focus:border-[#C69A45] outline-none transition-all placeholder:text-[#71695C]/60"
                />
              </div>

              {/* Table Container */}
              <div className="overflow-y-auto max-h-[440px] rounded-xl border border-[#E5D1A5] bg-[#FFFDF8]">
                <table className="w-full border-collapse text-left font-mono text-xs">
                  <thead className="sticky top-0 bg-[#F1E7D5] text-[#29261F] border-b border-[#E5D1A5] z-10 text-[9.5px] uppercase font-black tracking-wider">
                    <tr>
                      <th className="p-2.5 w-12 text-center text-[#29261F]">UF</th>
                      <th className="p-2.5 text-[#29261F]">TRECHO / ROTA</th>
                      <th className="p-2.5 text-center w-24 text-[#29261F]">CÓD. IDA</th>
                      <th className="p-2.5 text-center w-28 text-[#29261F]">CÓD. VOLTA</th>
                      {isEditing && <th className="p-2.5 text-center w-10 text-[#29261F]">AÇÕES</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5D1A5]/60 bg-[#FFFDF8]">
                    {filteredRoutes.map((row, idx) => {
                      const uf = extractUf(row.ida);
                      const isIdaCopied = copiedCode === `ida-${row.idaCod}`;
                      const isVoltaCopied = copiedCode === `volta-${row.voltaCod}`;

                      return (
                        <tr 
                          key={idx} 
                          className="hover:bg-[#F5EFE4] transition-colors group"
                        >
                          {/* UF Badge */}
                          <td className="p-2.5 text-center font-black">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black border",
                              selectedUf === uf 
                                ? "bg-[#C69A45] text-[#29261F] border-[#8F692A] shadow-xs" 
                                : "bg-[#F1E7D5] text-[#29261F] border-[#E5D1A5]"
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
                                  className="w-full bg-[#FFFDF8] border border-[#E5D1A5] rounded px-2 py-1 text-[11px] font-bold uppercase text-[#29261F]"
                                />
                                <input
                                  type="text"
                                  value={row.volta}
                                  onChange={(e) => updateRow(idx, 'volta', e.target.value)}
                                  className="w-full bg-[#FFFDF8] border border-[#E5D1A5] rounded px-2 py-1 text-[11px] font-bold uppercase text-[#71695C]"
                                />
                              </div>
                            ) : (
                              <div>
                                <span className="font-extrabold text-[#29261F] text-[11px] block truncate max-w-[190px] sm:max-w-xs">
                                  {row.ida}
                                </span>
                                <span className="text-[9.5px] text-[#71695C] block truncate max-w-[190px] sm:max-w-xs mt-0.5">
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
                                className="w-full bg-[#FFFDF8] border border-[#E5D1A5] rounded px-1.5 py-1 text-center font-mono font-bold text-xs text-[#29261F]"
                                placeholder="---"
                              />
                            ) : (() => {
                              const displayCode = getDisplayIdaCod(row);
                              const hasCode = displayCode && displayCode.trim() !== '' && displayCode !== '-';
                              return hasCode ? (
                                <button
                                  onClick={() => copyIndividualCode(displayCode, 'ida')}
                                  className={cn(
                                    "px-2.5 py-1 rounded-md text-[11px] font-bold font-mono transition-all cursor-pointer border w-full text-center shadow-xs",
                                    isIdaCopied
                                      ? "bg-[#C69A45] text-[#29261F] border-[#8F692A]"
                                      : "bg-[#F5EFE4] hover:bg-[#E5D1A5] text-[#29261F] border-[#E5D1A5]"
                                  )}
                                  title="Clique para copiar"
                                >
                                  {isIdaCopied ? 'OK' : displayCode}
                                </button>
                              ) : (
                                <span className="text-[#71695C] text-[10px] font-mono">---</span>
                              );
                            })()}
                          </td>

                          {/* Cód Volta */}
                          <td className="p-2.5 text-center">
                            {isEditing ? (
                              <input
                                type="text"
                                value={row.voltaCod}
                                onChange={(e) => updateRow(idx, 'voltaCod', e.target.value)}
                                className="w-full bg-[#FFFDF8] border border-[#E5D1A5] rounded px-1.5 py-1 text-center font-mono font-bold text-xs text-[#29261F]"
                                placeholder="---"
                              />
                            ) : row.voltaCod && row.voltaCod.trim() !== '' && row.voltaCod !== '-' ? (
                              <button
                                onClick={() => copyIndividualCode(row.voltaCod, 'volta')}
                                className={cn(
                                  "px-2.5 py-1 rounded-md text-[10.5px] font-black font-mono transition-all cursor-pointer border w-full text-center shadow-xs",
                                  isVoltaCopied
                                    ? "bg-[#C69A45] text-[#29261F] border-[#8F692A]"
                                    : "bg-[#F5EFE4] hover:bg-[#E5D1A5] text-[#29261F] border-[#E5D1A5]"
                                )}
                                title="Clique para copiar"
                              >
                                {isVoltaCopied ? 'OK' : row.voltaCod}
                              </button>
                            ) : (
                              <span className="text-[#71695C] text-[10px] font-mono">---</span>
                            )}
                          </td>

                          {/* Action Delete in Edit Mode */}
                          {isEditing && (
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => removeRow(idx)}
                                className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
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

      </div>

    </div>
  );
}
