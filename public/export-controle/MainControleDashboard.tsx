import React, { useState, useEffect } from 'react';

// ==========================================
// INTERACTIVE DATA & CONFIGURATION CONSTANTS
// ==========================================

const REGIONS_DATA = [
  { name: 'SUDESTE', count: 14, pct: 33, color: 'bg-amber-500', fill: '#f59e0b' },
  { name: 'SUL', count: 9, pct: 21, color: 'bg-cyan-500', fill: '#06b6d4' },
  { name: 'NORDESTE', count: 7, pct: 17, color: 'bg-emerald-500', fill: '#10b981' },
  { name: 'CENTRO-OESTE', count: 6, pct: 14, color: 'bg-orange-500', fill: '#f97316' },
  { name: 'NORTE', count: 6, pct: 14, color: 'bg-red-500', fill: '#ef4444' },
];

const CITIES_DB = {
  manaus: { name: 'Manaus', state: 'AM', region: 'NORTE', active: 1, temp: '29°C', humidity: '82%', transit: 2, stock: '85%' },
  belem: { name: 'Belém', state: 'PA', region: 'NORTE', active: 1, temp: '28°C', humidity: '88%', transit: 1, stock: '90%' },
  fortaleza: { name: 'Fortaleza', state: 'CE', region: 'NORDESTE', active: 1, temp: '27°C', humidity: '76%', transit: 2, stock: '94%' },
  recife: { name: 'Recife', state: 'PE', region: 'NORDESTE', active: 1, temp: '26°C', humidity: '79%', transit: 1, stock: '92%' },
  salvador: { name: 'Salvador', state: 'BA', region: 'NORDESTE', active: 1, temp: '25°C', humidity: '80%', transit: 2, stock: '89%' },
  brasilia: { name: 'Brasília', state: 'DF', region: 'CENTRO-OESTE', active: 2, temp: '24°C', humidity: '45%', transit: 3, stock: '95%' },
  saopaulo: { name: 'S. Paulo/Rio', state: 'SP/RJ', region: 'SUDESTE', active: 4, temp: '21°C', humidity: '68%', transit: 8, stock: '98%' },
  portoalegre: { name: 'Porto Alegre', state: 'RS', region: 'SUL', active: 1, temp: '19°C', humidity: '72%', transit: 2, stock: '87%' },
};

const PROTOCOLS_LIST = [
  { id: 'pgr-1', code: 'PGR-01', title: 'Controle de Velocidade em Curva', desc: 'Monitoramento contínuo de aceleração lateral e desaceleração obrigatória em trechos de serra.', status: 'Ativo', icon: 'fa-gauge-high', color: 'text-emerald-500' },
  { id: 'pgr-2', code: 'PGR-02', title: 'Averbação Eletrônica Automática', desc: 'Envio imediato de manifesto de carga e apólice de seguro antes de cruzar divisas estaduais.', status: 'Ativo', icon: 'fa-shield-halved', color: 'text-amber-500' },
  { id: 'pgr-3', code: 'PGR-03', title: 'Isca de Carga Ativa', desc: 'Ativação periódica de sinal RF/Satélite redundante em cargas paletizadas de café solúvel.', status: 'Ativo', icon: 'fa-satellite-dish', color: 'text-cyan-500' },
  { id: 'pgr-4', code: 'PGR-04', title: 'Parada Segura em Posto Credenciado', desc: 'Alerta automático de pernoite e monitoramento por câmera externa de comboios.', status: 'Ativo', icon: 'fa-bed', color: 'text-indigo-500' },
  { id: 'pgr-5', code: 'PGR-05', title: 'Checklist de Embarque e Lacre', desc: 'Fotos obrigatórias do paletizado, temperatura de baú e lacres de segurança numerados.', status: 'Ativo', icon: 'fa-square-check', color: 'text-rose-500' },
];

const INITIAL_VEHICLES = [
  { id: 'V-101', driver: 'Carlos Henrique', plate: 'BRA-3C21', type: 'Bitrem', load: 'Café Tradicional', origin: 'Brasília', dest: 'São Paulo', progress: 75, status: 'Ativa', region: 'SUDESTE' },
  { id: 'V-102', driver: 'José Roberto', plate: 'MER-8F92', type: 'Carreta LS', load: 'Café Gourmet', origin: 'Recife', dest: 'Salvador', progress: 40, status: 'Ativa', region: 'NORDESTE' },
  { id: 'V-103', driver: 'Mauro Souza', plate: 'COL-4D88', type: 'VUC', load: 'Café Solúvel', origin: 'Manaus', dest: 'Belém', progress: 95, status: 'Ativa', region: 'NORTE' },
  { id: 'V-104', driver: 'Amanda Lima', plate: 'SUL-2A19', type: 'Sider', load: 'Cápsulas Três', origin: 'Porto Alegre', dest: 'Curitiba', progress: 60, status: 'Ativa', region: 'SUL' },
  { id: 'V-105', driver: 'Felipe Santos', plate: 'MGC-5H22', type: 'Bitrem', load: 'Café Tradicional', origin: 'Varginha', dest: 'Rio de Janeiro', progress: 15, status: 'Carregada', region: 'SUDESTE' },
  { id: 'V-106', driver: 'Ricardo Cruz', plate: 'DFK-9E33', type: 'Carreta LS', load: 'Café Descafeinado', origin: 'Brasília', dest: 'Cuiabá', progress: 100, status: 'Descarga', region: 'CENTRO-OESTE' },
  { id: 'V-107', driver: 'Sandro Melo', plate: 'RJS-1C44', type: 'Sider', load: 'Grãos Verdes', origin: 'São Paulo', dest: 'Vitória', progress: 0, status: 'Parada', region: 'SUDESTE' },
];

export default function MainControleDashboard() {
  // Navigation & Interactive States
  const [activeTab, setActiveTab] = useState<'inicio' | 'checklist' | 'averbacao' | 'sm' | 'controle' | 'escala' | 'presenca' | 'rotas'>('inicio');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAlerts, setActiveAlerts] = useState(3);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  // Modals Visibility
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showProtocolsModal, setShowProtocolsModal] = useState(false);
  const [showFusionModal, setShowFusionModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<null | typeof CITIES_DB.saopaulo>(null);

  // Database / State for Dynamic Additions (Route Launch)
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [newRoute, setNewRoute] = useState({
    driver: '',
    plate: '',
    type: 'Bitrem',
    load: 'Café Tradicional',
    origin: 'São Paulo',
    dest: 'Rio de Janeiro',
    region: 'SUDESTE'
  });

  // Prompt Fusion Tool states
  const [fusionType, setFusionType] = useState<'image' | 'text' | 'list'>('image');
  const [elemA, setElemA] = useState('um lobo cibernético');
  const [elemB, setElemB] = useState('uma floresta tropical de néon');
  const [styleVal, setStyleVal] = useState('ilustração digital futurista');
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [toneVal, setToneVal] = useState('profissional');
  const [listA, setListA] = useState('');
  const [listB, setListB] = useState('');
  const [sortType, setSortType] = useState('ordem alfabética');
  const [formatType, setFormatType] = useState('tabela');
  const [fusionOutput, setFusionOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Clock Synchronization (2026 Accurate)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0].substring(0, 5));
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      setCurrentDate(now.toLocaleDateString('pt-BR', options).toUpperCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter vehicles based on Top Search query
  const filteredVehicles = vehicles.filter(v =>
    v.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.dest.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.load.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle launching new route
  const handleLaunchRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.driver || !newRoute.plate) return;

    const added = {
      id: `V-${100 + vehicles.length + 1}`,
      driver: newRoute.driver,
      plate: newRoute.plate.toUpperCase(),
      type: newRoute.type,
      load: newRoute.load,
      origin: newRoute.origin,
      dest: newRoute.dest,
      progress: 0,
      status: 'Ativa' as const,
      region: newRoute.region
    };

    setVehicles([added, ...vehicles]);
    setShowRouteModal(false);
    setNewRoute({
      driver: '',
      plate: '',
      type: 'Bitrem',
      load: 'Café Tradicional',
      origin: 'São Paulo',
      dest: 'Rio de Janeiro',
      region: 'SUDESTE'
    });
  };

  // Prompt Generator Logic
  const generateFusionPrompt = () => {
    if (fusionType === 'image') {
      setFusionOutput(`Uma fusão harmoniosa e detalhada entre [${elemA}] e [${elemB}], combinando os traços característicos de ambos num único conceito visual. Estilo [${styleVal}], iluminação dramática, alta definição, 8k.`);
    } else if (fusionType === 'text') {
      setFusionOutput(`Por favor, combina as duas ideias/textos abaixo num único documento coeso, claro e bem estruturado.\n\nRequisitos:\n1. Mantém os pontos essenciais de ambos sem perder detalhes importantes.\n2. Elimina repetições e ajusta o tom para ser [${toneVal}].\n3. Assegura uma transição suave e lógica entre os dois tópicos.\n\nTexto A:\n${textA || '[Inserir texto A]'}\n\nTexto B:\n${textB || '[Inserir texto B]'}`);
    } else {
      const parsedA = listA.split('\n').filter(l => l.trim());
      const parsedB = listB.split('\n').filter(l => l.trim());
      const combined = Array.from(new Set([...parsedA, ...parsedB]));
      if (sortType === 'ordem alfabética') combined.sort();
      
      let out = `Unifica as duas listas abaixo numa única lista organizada por [${sortType}].\nRemove todas as duplicadas e apresenta o resultado num formato [${formatType}].\n\nResultado Organizado:\n`;
      if (formatType === 'lista numerada') {
        out += combined.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
      } else if (formatType === 'tabela') {
        out += `| Nº | Item |\n| --- | --- |\n` + combined.map((item, idx) => `| ${idx + 1} | ${item} |`).join('\n');
      } else {
        out += combined.map(item => `• ${item}`).join('\n');
      }
      setFusionOutput(out);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fusionOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col justify-between p-3 md:p-5 font-sans" style={{
      backgroundColor: '#e8ded0',
      backgroundImage: 'radial-gradient(#d5c4af 1.2px, transparent 1.2px)',
      backgroundSize: '20px 20px'
    }}>

      {/* GLOBAL CSS KEYFRAMES & STYLING OVERRIDES */}
      <style>{`
        .custom-frame {
          background: linear-gradient(135deg, #ffffff 0%, #fcf8f2 100%);
          border: 1.5px solid #ded3c1;
          box-shadow: 0 10px 30px -5px rgba(60, 40, 15, 0.08), inset 0 1px 0 rgba(255,255,255,0.8);
          border-radius: 18px;
        }
        .glow-cyan {
          filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.8));
        }
        .glow-red {
          filter: drop-shadow(0 0 8px rgba(255, 23, 68, 0.8));
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .map-pulse {
          animation: pulse-ring 2s infinite ease-in-out;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1e8d9; }
        ::-webkit-scrollbar-thumb { background: #c5a059; border-radius: 4px; }
      `}</style>

      <div className="max-w-[1720px] mx-auto w-full space-y-4">

        {/* ==========================================
             HEADER EXECUTIVO DE TOPO
        ========================================== */}
        <header className="custom-frame p-3.5 px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center shadow-lg border-2 border-yellow-500">
              <i className="fa-solid fa-heart text-yellow-500 text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
                Café Três Corações
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">OFICIAL</span>
              </h1>
              <p className="text-xs font-semibold tracking-widest text-amber-800 uppercase">
                SEGURANÇA • LOGÍSTICA • RESULTADOS
              </p>
            </div>
            <div className="h-8 w-[1px] bg-amber-200 mx-2 hidden md:block"></div>
            <div className="hidden lg:block">
              <span className="text-xs font-bold text-gray-800 tracking-wider block">SISTEMA OPERACIONAL</span>
              <span className="text-[11px] text-gray-500 font-medium">CONTROLE TÁTICO • GESTÃO • RESULTADOS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Campo de Busca Geral */}
            <div className="relative hidden sm:block w-64">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Buscar frota, rota, carga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-amber-50/50 border border-amber-200/80 rounded-full focus:outline-none focus:border-yellow-500 transition font-medium"
              />
            </div>

            {/* Prompt Fusion Tool Launcher Button */}
            <button
              onClick={() => setShowFusionModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-md border border-amber-500 transition transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-yellow-300"></i>
              <span className="hidden md:inline">CENTRAL DE FUSÃO</span>
            </button>

            {/* Notificações Operacionais */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative w-9 h-9 rounded-full bg-amber-100/60 border border-amber-200 flex items-center justify-center text-gray-700 hover:bg-amber-200 transition"
              >
                <i className="fa-regular fa-bell text-sm"></i>
                {activeAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                    {activeAlerts}
                  </span>
                )}
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-amber-200 rounded-xl shadow-xl z-50 p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                    <span className="text-xs font-bold text-gray-900">Alertas Operacionais</span>
                    <button onClick={() => setActiveAlerts(0)} className="text-[10px] text-red-700 hover:underline">Limpar</button>
                  </div>
                  {activeAlerts > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-[11px]">
                        <div className="font-bold text-red-700 flex items-center gap-1">
                          <i className="fa-solid fa-triangle-exclamation"></i> Velocidade Excedida
                        </div>
                        <p className="text-gray-600 mt-0.5">Veículo Carlos H. (BRA-3C21) acima de 85km/h na descida da serra.</p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-[11px]">
                        <div className="font-bold text-amber-700 flex items-center gap-1">
                          <i className="fa-solid fa-clock"></i> Checklist Pendente
                        </div>
                        <p className="text-gray-600 mt-0.5">Veículo Mauro Souza aguardando liberação de lacre de segurança em Manaus.</p>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-[11px]">
                        <div className="font-bold text-cyan-700 flex items-center gap-1">
                          <i className="fa-solid fa-shield-halved"></i> Averbação Concluída
                        </div>
                        <p className="text-gray-600 mt-0.5">Manifesto eletrônico da rota Recife-Salvador averbado com sucesso.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-gray-500 py-4">Nenhum alerta pendente.</p>
                  )}
                </div>
              )}
            </div>

            {/* Perfil Administrador */}
            <div className="flex items-center gap-3 pl-2 border-l border-amber-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 p-0.5 shadow">
                <div className="w-full h-full rounded-full bg-amber-900 border border-yellow-500 flex items-center justify-center text-white font-extrabold text-sm shadow-inner">
                  JD
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-gray-800 leading-none">Jefferson Dias</div>
                <div className="text-[10px] text-amber-700 font-medium mt-0.5">Administrador</div>
              </div>
            </div>

            {/* Relógio Executivo */}
            <div className="text-right hidden xl:block bg-amber-100/40 px-3 py-1 rounded-lg border border-amber-200/50">
              <div className="text-[10px] font-extrabold text-amber-900 tracking-wider">{currentDate || '26 SET. 2026'}</div>
              <div className="text-xs font-bold text-gray-800 leading-none">{currentTime || '01:44'}</div>
            </div>
          </div>
        </header>

        {/* ==========================================
             CORPO PRINCIPAL (SIDEBAR + CONTEÚDO)
        ========================================== */}
        <div className="grid grid-cols-12 gap-4">

          {/* SIDEBAR ESQUERDA */}
          <aside className="col-span-12 lg:col-span-2 flex flex-col justify-between gap-4">
            <nav className="custom-frame p-2.5 space-y-1.5">
              <button
                onClick={() => setActiveTab('inicio')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs shadow-md border transition ${
                  activeTab === 'inicio'
                    ? 'bg-gradient-to-r from-red-800 to-red-950 text-white border-red-700'
                    : 'text-gray-700 hover:bg-amber-100/60 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-house text-yellow-500"></i>
                  <span>Início</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] opacity-70"></i>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                  activeTab === 'checklist' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-700 hover:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-clipboard-check text-amber-800"></i>
                  <span>Checklist</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
              </button>

              <button
                onClick={() => setActiveTab('averbacao')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                  activeTab === 'averbacao' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-700 hover:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-file-contract text-amber-800"></i>
                  <span>Averbação</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
              </button>

              <button
                onClick={() => setActiveTab('sm')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                  activeTab === 'sm' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-700 hover:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-envelope-open-text text-amber-800"></i>
                  <span>SM</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
              </button>

              <button
                onClick={() => setActiveTab('controle')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                  activeTab === 'controle' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-700 hover:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-chart-line text-amber-800"></i>
                  <span>Controle</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
              </button>

              <button
                onClick={() => setActiveTab('escala')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                  activeTab === 'escala' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-700 hover:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-calendar-days text-amber-800"></i>
                  <span>Escala</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
              </button>

              <button
                onClick={() => setActiveTab('presenca')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                  activeTab === 'presenca' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-700 hover:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-users text-amber-800"></i>
                  <span>Lista de Presença</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
              </button>

              <button
                onClick={() => setActiveTab('rotas')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                  activeTab === 'rotas' ? 'bg-amber-100 font-bold text-amber-900' : 'text-gray-700 hover:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-route text-amber-800"></i>
                  <span>Rotas</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] text-gray-400"></i>
              </button>
            </nav>

            {/* CARD PUBLICITÁRIO CAFÉ */}
            <div className="custom-frame p-3 bg-gradient-to-b from-amber-950 to-amber-900 text-white overflow-hidden relative border-amber-600/40">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
              <div className="relative z-10 space-y-2">
                <div className="font-extrabold text-sm text-yellow-500 tracking-tight">Café Três Corações</div>
                <p className="text-[11px] text-amber-200/90 leading-tight">Mais que café, movemos o Brasil.</p>
                <div className="pt-2 flex justify-center">
                  <div className="w-20 h-20 rounded-full border border-amber-500/30 bg-black/30 p-1 flex items-center justify-center shadow-inner">
                    <i className="fa-solid fa-mug-hot text-3xl text-yellow-500 drop-shadow-md"></i>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ÁREA DE CONTEÚDO PRINCIPAL */}
          <main className="col-span-12 lg:col-span-10 space-y-4">

            {activeTab === 'inicio' ? (
              <>
                {/* HERO BANNER - LOGÍSTICA OMNIPRESENTE */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-yellow-500/60 shadow-xl bg-gray-900 min-h-[220px] flex items-center">
                  <div className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity" style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1600")'
                  }}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-950/95 via-amber-950/80 to-transparent"></div>

                  <div className="relative z-10 p-6 md:p-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-7 space-y-3">
                      <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs tracking-widest uppercase">
                        <i className="fa-solid fa-compass"></i>
                        <span>LOGÍSTICA OPERACIONAL</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                        LOGÍSTICA OMNIPRESENTE
                      </h2>
                      <p className="text-xs md:text-sm text-amber-100/90 max-w-xl leading-relaxed font-medium">
                        Conectando regiões, pessoas e oportunidades com segurança, eficiência e o sabor do Brasil em cada rota operada de norte a sul.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => setShowRouteModal(true)}
                          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold text-xs flex items-center gap-2 shadow-lg border border-red-500 transition transform hover:-translate-y-0.5"
                        >
                          <i className="fa-solid fa-location-arrow text-yellow-500 animate-pulse"></i>
                          <span>LANÇAR NOVA ROTA</span>
                          <i className="fa-solid fa-chevron-right text-[10px] ml-1"></i>
                        </button>

                        <button
                          onClick={() => setShowProtocolsModal(true)}
                          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/30 backdrop-blur-md transition"
                        >
                          <i className="fa-solid fa-file-shield text-yellow-300"></i>
                          <span>VER PROTOCOLOS</span>
                          <i className="fa-solid fa-chevron-right text-[10px] ml-1"></i>
                        </button>
                      </div>
                    </div>

                    {/* HUD HOLOGRÁFICO DIREITA */}
                    <div className="lg:col-span-5 bg-slate-950/75 border border-cyan-500/30 rounded-xl p-4 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4">
                      <div className="w-32 h-32 relative flex items-center justify-center">
                        <svg viewBox="0 0 200 200" className="w-full h-full glow-cyan">
                          <path d="M40 60 L80 40 L140 50 L170 90 L150 160 L100 180 L50 140 Z" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3 3" />
                          <path d="M60 70 L120 60 L140 100 L110 150 L70 120 Z" fill="rgba(0, 229, 255, 0.08)" stroke="#00e5ff" strokeWidth="2" />
                          <circle cx="80" cy="50" r="4" fill="#00e5ff" />
                          <circle cx="140" cy="80" r="4" fill="#00e5ff" />
                          <circle cx="110" cy="140" r="4" fill="#00e5ff" />
                          <line x1="80" y1="50" x2="140" y2="80" stroke="#00e5ff" strokeWidth="1.5" />
                          <line x1="140" y1="80" x2="110" y2="140" stroke="#00e5ff" strokeWidth="1.5" />
                        </svg>
                      </div>

                      <div className="space-y-2 flex-1 font-sans">
                        <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-cyan-500/20">
                          <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400 text-[10px]">
                            <i className="fa-solid fa-bullseye"></i>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-cyan-300 tracking-wider">+ EFICIÊNCIA</div>
                            <div className="text-[9px] text-slate-400">NAS ROTAS</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-cyan-500/20">
                          <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400 text-[10px]">
                            <i className="fa-solid fa-shield-halved"></i>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-cyan-300 tracking-wider">+ SEGURANÇA</div>
                            <div className="text-[9px] text-slate-400">NAS OPERAÇÕES</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-cyan-500/20">
                          <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400 text-[10px]">
                            <i className="fa-solid fa-box-open"></i>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-cyan-300 tracking-wider">+ RESULTADOS</div>
                            <div className="text-[9px] text-slate-400">EM TODAS AS REGIÕES</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAINEL CENTRAL DE OPERAÇÃO - GRID */}
                <div className="grid grid-cols-12 gap-4">

                  {/* MAPA DE ROTAS + KPIS VERTICAIS + TELEMETRIA (8 COLUNAS) */}
                  <div className="col-span-12 lg:col-span-8 space-y-4">

                    {/* MAPA DO BRASIL + KPIS VERTICAIS */}
                    <div className="grid grid-cols-12 gap-4">

                      {/* MAPA DO BRASIL INTERATIVO */}
                      <div className="col-span-12 md:col-span-7 custom-frame p-3 flex flex-col justify-between relative min-h-[280px]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <i className="fa-solid fa-map-location-dot text-red-700 text-sm"></i>
                            <div>
                              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">ROTAS EM TEMPO REAL</h3>
                              <p className="text-[10px] text-gray-500">ACOMPANHAMENTO DE TODA A OPERAÇÃO</p>
                            </div>
                          </div>
                        </div>

                        {/* Desenho do Relevo com Pontos de Cidade Clicáveis */}
                        <div className="relative w-full h-52 bg-slate-900 rounded-xl overflow-hidden border border-amber-200/40 shadow-inner flex items-center justify-center">
                          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:12px_12px]"></div>

                          {/* SVG do Mapa do Brasil com Conexões e Cidades */}
                          <svg viewBox="0 0 500 400" className="w-full h-full p-2">
                            <path d="M 150 60 Q 250 40 380 90 Q 450 150 400 280 Q 320 380 220 370 Q 150 300 120 220 Q 90 140 150 60 Z" fill="#143823" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" />

                            {/* Feixes Laser das Rotas */}
                            <line x1="180" y1="120" x2="310" y2="110" stroke="#ff1744" strokeWidth="1.5" strokeDasharray="4 2" />
                            <line x1="310" y1="110" x2="390" y2="130" stroke="#ff1744" strokeWidth="1.5" />
                            <line x1="390" y1="130" x2="360" y2="200" stroke="#ff1744" strokeWidth="1.5" />
                            <line x1="280" y1="210" x2="360" y2="200" stroke="#ff1744" strokeWidth="1.5" />
                            <line x1="280" y1="210" x2="300" y2="280" stroke="#ff1744" strokeWidth="1.5" />
                            <line x1="300" y1="280" x2="250" y2="340" stroke="#ff1744" strokeWidth="1.5" />
                            <line x1="180" y1="120" x2="280" y2="210" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="2 2" />

                            {/* Cidades Interativas com Círculos Clicáveis e Nome */}
                            {Object.entries(CITIES_DB).map(([key, city]) => {
                              let cx = 0, cy = 0;
                              if (key === 'manaus') { cx = 180; cy = 120; }
                              else if (key === 'belem') { cx = 310; cy = 110; }
                              else if (key === 'fortaleza') { cx = 390; cy = 130; }
                              else if (key === 'recife') { cx = 410; cy = 165; }
                              else if (key === 'salvador') { cx = 360; cy = 200; }
                              else if (key === 'brasilia') { cx = 280; cy = 210; }
                              else if (key === 'saopaulo') { cx = 300; cy = 280; }
                              else if (key === 'portoalegre') { cx = 250; cy = 340; }

                              return (
                                <g key={key} className="cursor-pointer group" onClick={() => setSelectedCity(city)}>
                                  <circle cx={cx} cy={cy} r="8" fill="rgba(255,23,68,0.3)" className="map-pulse" />
                                  <circle cx={cx} cy={cy} r="5" fill={key === 'brasilia' || key === 'saopaulo' ? '#ff9100' : '#ff1744'} className="glow-red transition group-hover:scale-125" />
                                  <text x={cx} y={cy - 12} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none drop-shadow-md select-none group-hover:fill-yellow-400 transition">{city.name}</text>
                                </g>
                              );
                            })}
                          </svg>

                          <div className="absolute bottom-2 left-2 bg-slate-950/95 border border-amber-500/40 rounded-lg px-2.5 py-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <div>
                              <div className="text-[10px] font-bold text-white">{vehicles.length} ROTAS ATIVAS</div>
                              <div className="text-[8px] text-emerald-400">Clique nas cidades para detalhes</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* KPIS TÁTICOS VERTICAIS */}
                      <div className="col-span-12 md:col-span-5 custom-frame p-3.5 flex flex-col justify-between space-y-3">
                        {/* Total de Rotas */}
                        <div className="flex items-center gap-3 p-2 bg-amber-50/80 rounded-xl border border-amber-200/70">
                          <div className="w-10 h-10 rounded-lg bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-900 shadow-xs">
                            <i className="fa-solid fa-truck-fast text-lg"></i>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase">TOTAL DE ROTAS</div>
                            <div className="text-xl font-extrabold text-gray-900 flex items-center gap-2 leading-none">
                              {vehicles.length + 35}
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center leading-none">
                                <i className="fa-solid fa-arrow-up mr-0.5"></i>12%
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-400">vs. mês anterior</div>
                          </div>
                        </div>

                        {/* Distância Percorrida */}
                        <div className="flex items-center gap-3 p-2 bg-amber-50/80 rounded-xl border border-amber-200/70">
                          <div className="w-10 h-10 rounded-lg bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-900 shadow-xs">
                            <i className="fa-solid fa-road text-lg"></i>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase">DISTÂNCIA PERCORRIDA</div>
                            <div className="text-base font-extrabold text-gray-900 flex items-center gap-2 leading-none">
                              12.480 km
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                                <i className="fa-solid fa-arrow-up mr-0.5"></i>8%
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-400">vs. mês anterior</div>
                          </div>
                        </div>

                        {/* Tempo Médio */}
                        <div className="flex items-center gap-3 p-2 bg-amber-50/80 rounded-xl border border-amber-200/70">
                          <div className="w-10 h-10 rounded-lg bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-900 shadow-xs">
                            <i className="fa-solid fa-stopwatch text-lg"></i>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase">TEMPO MÉDIO</div>
                            <div className="text-base font-extrabold text-gray-900 flex items-center gap-2 leading-none">
                              8h 24min
                              <span className="text-[10px] font-bold text-red-600 flex items-center">
                                <i className="fa-solid fa-arrow-down mr-0.5"></i>6%
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-400">vs. mês anterior</div>
                          </div>
                        </div>

                        {/* Legendas Rápidas */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-extrabold text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span>Ativa: {vehicles.filter(v=>v.status==='Ativa').length}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span>Carregada: {vehicles.filter(v=>v.status==='Carregada').length}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                            <span>Descarga: {vehicles.filter(v=>v.status==='Descarga').length}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span>Parada: {vehicles.filter(v=>v.status==='Parada').length}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* TELEMETRIA TÁTICA COM ONDA DUPLA */}
                    <div className="custom-frame p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-wave-square text-red-700 text-sm"></i>
                          <div>
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">TELEMETRIA TÁTICA</h3>
                            <p className="text-[10px] text-gray-500">FLUXO DE MOVIMENTAÇÃO 24H</p>
                          </div>
                        </div>
                      </div>

                      {/* GRÁFICO DARK */}
                      <div className="bg-slate-950 rounded-xl p-4 border border-amber-300/30 shadow-2xl relative overflow-hidden">
                        <div className="flex">
                          {/* Eixo Y */}
                          <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 pr-3 border-r border-slate-800 h-40">
                            <span>80</span>
                            <span>60</span>
                            <span>40</span>
                            <span>20</span>
                            <span>0</span>
                          </div>

                          {/* Área do SVG do gráfico */}
                          <div className="flex-1 pl-3 relative h-40">
                            <div className="absolute inset-0 flex flex-col justify-between opacity-15 pointer-events-none">
                              <div className="border-b border-slate-400 w-full"></div>
                              <div className="border-b border-slate-400 w-full"></div>
                              <div className="border-b border-slate-400 w-full"></div>
                              <div className="border-b border-slate-400 w-full"></div>
                              <div className="border-b border-slate-400 w-full"></div>
                            </div>

                            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                              <defs>
                                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                                </linearGradient>
                              </defs>

                              {/* Onda Cyan */}
                              <path d="M 20 130 Q 125 100 250 60 T 480 80 L 480 160 L 20 160 Z" fill="url(#cyanGrad)" />

                              {/* ONDA VERMELHA NEON */}
                              <path d="M 20 100 C 80 80, 120 40, 180 60 C 240 80, 270 20, 330 40 C 390 60, 420 10, 480 30" fill="none" stroke="#ff1744" strokeWidth="3" className="glow-red" />

                              {/* ONDA CYAN NEON */}
                              <path d="M 20 130 C 80 120, 120 90, 180 100 C 240 110, 270 60, 330 80 C 390 100, 420 60, 480 80" fill="none" stroke="#00e5ff" strokeWidth="3" className="glow-cyan" />

                              {/* Pontos nas ondas */}
                              <circle cx="20" cy="100" r="4" fill="#ffffff" stroke="#ff1744" strokeWidth="2" />
                              <circle cx="180" cy="60" r="4" fill="#ffffff" stroke="#ff1744" strokeWidth="2" />
                              <circle cx="330" cy="40" r="4" fill="#ffffff" stroke="#ff1744" strokeWidth="2" />

                              <circle cx="20" cy="130" r="4" fill="#ffffff" stroke="#00e5ff" strokeWidth="2" />
                              <circle cx="180" cy="100" r="4" fill="#ffffff" stroke="#00e5ff" strokeWidth="2" />
                              <circle cx="330" cy="80" r="4" fill="#ffffff" stroke="#00e5ff" strokeWidth="2" />
                            </svg>

                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                              <span>00h</span>
                              <span>06h</span>
                              <span>12h</span>
                              <span>18h</span>
                              <span>24h</span>
                            </div>
                          </div>
                        </div>

                        {/* CARDS INFERIORES ESCUROS */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800">
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 transition" onClick={() => setShowAssetModal(true)}>
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs">
                              <i className="fa-solid fa-truck-moving text-yellow-500"></i>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase leading-none">VEÍCULOS EM ROTA</div>
                              <div className="text-sm font-black text-white mt-1">{vehicles.filter(v=>v.status==='Ativa').length}</div>
                            </div>
                          </div>

                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 transition" onClick={() => setShowAssetModal(true)}>
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs">
                              <i className="fa-solid fa-warehouse text-emerald-400"></i>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase leading-none">EM PÁTIO</div>
                              <div className="text-sm font-black text-white mt-1">8</div>
                            </div>
                          </div>

                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 transition" onClick={() => setShowAssetModal(true)}>
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs">
                              <i className="fa-solid fa-box-archive text-amber-400"></i>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase leading-none">CARREGANDO</div>
                              <div className="text-sm font-black text-white mt-1">{vehicles.filter(v=>v.status==='Carregada').length}</div>
                            </div>
                          </div>

                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 transition" onClick={() => setShowAssetModal(true)}>
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white text-xs">
                              <i className="fa-solid fa-truck-ramp-box text-cyan-400"></i>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase leading-none">DESCARREGANDO</div>
                              <div className="text-sm font-black text-white mt-1">{vehicles.filter(v=>v.status==='Descarga').length}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* OPERAÇÃO GLOBAL & ALOCAÇÃO DE ATIVOS (4 COLUNAS) */}
                  <div className="col-span-12 lg:col-span-4 space-y-4">

                    {/* OPERAÇÃO GLOBAL */}
                    <div className="custom-frame p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-globe text-red-700 text-sm"></i>
                          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">OPERAÇÃO GLOBAL</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">ONLINE</span>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center justify-between gap-3">
                          <div className="relative w-14 h-14 flex items-center justify-center">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="100, 100" />
                            </svg>
                            <span className="absolute text-xs font-extrabold text-gray-800">100%</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-gray-800 leading-none">COBERTURA ATIVA</div>
                            <div className="text-[10px] text-gray-500 mt-1">DE PÁTIO E FROTA NACIONAL</div>
                          </div>
                          <div className="w-12 h-10 rounded-lg overflow-hidden border border-amber-300 shadow-xs">
                            <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=120" alt="Caminhão" className="w-full h-full object-cover" />
                          </div>
                        </div>

                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center justify-between gap-3">
                          <div className="relative w-14 h-14 flex items-center justify-center">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="98, 100" />
                            </svg>
                            <span className="absolute text-xs font-extrabold text-gray-800">98%</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-gray-800 leading-none">PROCESSAMENTO</div>
                            <div className="text-[10px] text-gray-500 mt-1">DA OPERAÇÃO <span className="text-emerald-600 font-bold">EFICIÊNCIA ↳</span></div>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                            <i className="fa-solid fa-chart-column text-lg animate-bounce"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ALOCAÇÃO DE ATIVOS - DONUT CHART */}
                    <div className="custom-frame p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-chart-pie text-red-700 text-sm"></i>
                        <div>
                          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">ALOCAÇÃO DE ATIVOS</h3>
                          <p className="text-[10px] text-gray-500">DISTRIBUIÇÃO DA FROTA POR REGIÃO</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-xl transform rotate-12">
                            {/* Sudeste */}
                            <path d="M 100 20 A 80 80 0 0 1 176 124 L 142 116 A 45 45 0 0 0 100 55 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="transition duration-300 hover:opacity-90" />
                            {/* Sul */}
                            <path d="M 176 124 A 80 80 0 0 1 100 180 L 100 145 A 45 45 0 0 0 142 116 Z" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" className="transition duration-300 hover:opacity-90" />
                            {/* Nordeste */}
                            <path d="M 100 180 A 80 80 0 0 1 32 142 L 62 124 A 45 45 0 0 0 100 145 Z" fill="#10b981" stroke="#ffffff" strokeWidth="2" className="transition duration-300 hover:opacity-90" />
                            {/* Centro-Oeste */}
                            <path d="M 32 142 A 80 80 0 0 1 32 58 L 62 76 A 45 45 0 0 0 62 124 Z" fill="#f97316" stroke="#ffffff" strokeWidth="2" className="transition duration-300 hover:opacity-90" />
                            {/* Norte */}
                            <path d="M 32 58 A 80 80 0 0 1 100 20 L 100 55 A 45 45 0 0 0 62 76 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="transition duration-300 hover:opacity-90" />
                          </svg>

                          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-amber-50 to-amber-200 border-2 border-yellow-600 shadow-md flex flex-col items-center justify-center leading-none">
                            <span className="text-xl font-black text-amber-950">{vehicles.length + 35}</span>
                            <span className="text-[8px] font-bold text-amber-800">TOTAL</span>
                          </div>
                        </div>

                        {/* Legendas detalhadas clicáveis */}
                        <div className="w-full space-y-1.5 text-xs font-bold text-gray-700">
                          {REGIONS_DATA.map((reg) => (
                            <div key={reg.name} className="flex items-center justify-between p-1.5 bg-amber-50/60 rounded-lg border border-amber-200/50 hover:bg-amber-100/60 transition cursor-pointer" onClick={() => setShowAssetModal(true)}>
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${reg.color}`}></span>
                                <span>{reg.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-extrabold">{reg.count}</span>
                                <span className="text-gray-400 font-normal text-[10px]">({reg.pct}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => setShowAssetModal(true)}
                          className="w-full py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition flex items-center justify-center gap-2 shadow-xs"
                        >
                          <span>VER DETALHAMENTO DA FROTA</span>
                          <i className="fa-solid fa-chevron-right text-[10px]"></i>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </>
            ) : (
              // EXCEPCIONALMENTE SE ELE NAVEGAR PARA TABS MOCKADAS
              <div className="custom-frame p-10 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-3xl">
                  <i className="fa-solid fa-circle-info"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Recurso Estático Simulador</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Esta aba representa uma visualização simplificada das outras seções que, no aplicativo original, estão integradas às tabelas completas.
                </p>
                <button
                  onClick={() => setActiveTab('inicio')}
                  className="px-5 py-2 rounded-lg bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition"
                >
                  Voltar ao Início
                </button>
              </div>
            )}

          </main>

        </div>

        {/* RODAPÉ DA PÁGINA */}
        <footer className="custom-frame p-3 text-center text-xs text-amber-900 font-semibold flex items-center justify-center gap-2">
          <span>Café Três Corações</span>
          <span>|</span>
          <span>Do campo para o Brasil, com segurança.</span>
          <i className="fa-solid fa-heart text-red-700 ml-1"></i>
        </footer>

      </div>

      {/* ==========================================
           MODAIS INTERATIVOS DE ALTA FIDELIDADE
      ========================================== */}

      {/* 1. LAUNCH NEW ROUTE MODAL */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border-2 border-yellow-500 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowRouteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <i className="fa-solid fa-truck-ramp-box text-red-700"></i> Despachar Nova Rota
              </h3>
              <p className="text-[11px] text-gray-500">Crie e aloque um veículo imediatamente no pátio ativo.</p>
            </div>

            <form onSubmit={handleLaunchRoute} className="space-y-3.5 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Nome do Motorista</label>
                  <input
                    type="text" required placeholder="Ex: Roberto Ramos"
                    value={newRoute.driver} onChange={(e)=>setNewRoute({...newRoute, driver: e.target.value})}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none focus:border-yellow-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Placa Mercosul</label>
                  <input
                    type="text" required placeholder="Ex: AAA-0A00"
                    value={newRoute.plate} onChange={(e)=>setNewRoute({...newRoute, plate: e.target.value})}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none focus:border-yellow-500 font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Tipo de Veículo</label>
                  <select
                    value={newRoute.type} onChange={(e)=>setNewRoute({...newRoute, type: e.target.value})}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option>Bitrem</option>
                    <option>Carreta LS</option>
                    <option>Sider</option>
                    <option>VUC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Tipo de Café (Carga)</label>
                  <select
                    value={newRoute.load} onChange={(e)=>setNewRoute({...newRoute, load: e.target.value})}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option>Café Tradicional</option>
                    <option>Café Gourmet</option>
                    <option>Cápsulas Três</option>
                    <option>Café Solúvel</option>
                    <option>Café Descafeinado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Origem</label>
                  <input
                    type="text" placeholder="Origem" required
                    value={newRoute.origin} onChange={(e)=>setNewRoute({...newRoute, origin: e.target.value})}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Destino</label>
                  <input
                    type="text" placeholder="Destino" required
                    value={newRoute.dest} onChange={(e)=>setNewRoute({...newRoute, dest: e.target.value})}
                    className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Região de Atuação</label>
                <select
                  value={newRoute.region} onChange={(e)=>setNewRoute({...newRoute, region: e.target.value})}
                  className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none font-bold"
                >
                  <option value="SUDESTE">SUDESTE (MG, SP, RJ, ES)</option>
                  <option value="SUL">SUL (PR, SC, RS)</option>
                  <option value="NORDESTE">NORDESTE (CE, PE, BA, etc.)</option>
                  <option value="CENTRO-OESTE">CENTRO-OESTE (DF, GO, MS, MT)</option>
                  <option value="NORTE">NORTE (AM, PA, etc.)</option>
                </select>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[10px] text-gray-600 leading-relaxed font-semibold">
                <i className="fa-solid fa-shield-halved text-red-700 mr-1"></i>
                PGR automático: Ao lançar, as travas automáticas e sinal satélite duplicado serão vinculados para auditoria na aba de averbações.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={()=>setShowRouteModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold shadow-md">Iniciar Rota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SECURITY PROTOCOLS MODAL */}
      {showProtocolsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-yellow-500 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowProtocolsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <i className="fa-solid fa-file-shield text-red-700"></i> Protocolos PGR & Seguro Ativo
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">Lista de regras automáticas monitoradas pela central.</p>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {PROTOCOLS_LIST.map((p) => (
                <div key={p.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl flex items-start gap-3 hover:bg-amber-50 transition">
                  <div className={`w-9 h-9 rounded-full bg-white border border-amber-200 flex items-center justify-center text-lg ${p.color} shadow-xs`}>
                    <i className={`fa-solid ${p.icon}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gray-900">{p.code} • {p.title}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase border border-emerald-300">ATIVO</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed font-semibold">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => { setShowProtocolsModal(false); setActiveTab('checklist'); }} className="px-5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center gap-2 shadow-md">
                <span>Ir para o Checklist Completo</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CITY HUB TACTICAL OVERLAY */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-yellow-500 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setSelectedCity(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-lg font-bold border border-red-300">
                <i className="fa-solid fa-city"></i>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">{selectedCity.name} ({selectedCity.state})</h3>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold tracking-wider">{selectedCity.region}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-700">
              <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-200">
                <span className="text-[9px] text-gray-400 block uppercase font-extrabold">TEMPERATURA</span>
                <span className="text-sm font-black text-slate-800">{selectedCity.temp}</span>
              </div>
              <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-200">
                <span className="text-[9px] text-gray-400 block uppercase font-extrabold">UMIDADE AR</span>
                <span className="text-sm font-black text-slate-800">{selectedCity.humidity}</span>
              </div>
              <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-200">
                <span className="text-[9px] text-gray-400 block uppercase font-extrabold">EM TRÂNSITO</span>
                <span className="text-sm font-black text-slate-800">{selectedCity.transit} Caminhões</span>
              </div>
              <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-200">
                <span className="text-[9px] text-gray-400 block uppercase font-extrabold">OCUPAÇÃO DOCAS</span>
                <span className="text-sm font-black text-slate-800">{selectedCity.stock}</span>
              </div>
            </div>

            <div className="bg-slate-950 text-white rounded-lg p-2.5 text-[10px] space-y-1 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <p className="text-slate-300 leading-tight">Radar active. 0 incidents registered in the last 24h.</p>
            </div>

            <button onClick={() => setSelectedCity(null)} className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 rounded-lg">
              Fechar Monitoramento
            </button>
          </div>
        </div>
      )}

      {/* 4. ASSET ALLOCATION DETAIL LIST (42 VEHICLES) */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-yellow-500 rounded-2xl p-6 max-w-3xl w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowAssetModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <i className="fa-solid fa-truck-moving text-red-700"></i> Detalhamento de Ativos e Viagens
                </h3>
                <p className="text-[11px] text-gray-500">Monitoramento detalhado de progresso, status e motoristas por região.</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-extrabold">
                {filteredVehicles.length} veículos encontrados
              </span>
            </div>

            {/* List Table container */}
            <div className="overflow-x-auto rounded-xl border border-amber-200 max-h-[340px] overflow-y-auto">
              <table className="w-full text-left text-xs font-bold border-collapse">
                <thead>
                  <tr className="bg-amber-50 text-gray-700 border-b border-amber-200 uppercase text-[10px]">
                    <th className="p-3">Veículo</th>
                    <th className="p-3">Motorista / Placa</th>
                    <th className="p-3">Rota / Região</th>
                    <th className="p-3">Carga / Tipo</th>
                    <th className="p-3">Progresso</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 text-gray-800 font-sans">
                  {filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-amber-50/50 transition">
                      <td className="p-3 text-red-800 font-black">{v.id}</td>
                      <td className="p-3">
                        <div className="font-extrabold text-gray-900">{v.driver}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{v.plate} • {v.type}</div>
                      </td>
                      <td className="p-3">
                        <div>{v.origin} ↳ {v.dest}</div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-extrabold mt-0.5 inline-block">{v.region}</span>
                      </td>
                      <td className="p-3 font-semibold text-gray-700">{v.load}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${v.progress}%` }}></div>
                          </div>
                          <span>{v.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          v.status === 'Ativa' ? 'bg-emerald-100 text-emerald-800' :
                          v.status === 'Carregada' ? 'bg-amber-100 text-amber-800' :
                          v.status === 'Descarga' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShowAssetModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs">
                Fechar Detalhamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TACTICAL PROMPT FUSION TOOL (3 CHANNELS) */}
      {showFusionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-yellow-500 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setShowFusionModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-lg shadow-sm">
                <i className="fa-solid fa-wand-magic-sparkles text-amber-700 animate-pulse"></i>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Central de Fusão & Prompts</h3>
                <p className="text-[11px] text-gray-500">Unifique conceitos de imagem, ideias ou listas em prompts coesos.</p>
              </div>
            </div>

            {/* Channels Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-amber-50 p-1 rounded-xl">
              <button onClick={() => { setFusionType('image'); setFusionOutput(''); }} className={`py-1.5 rounded-lg text-xs font-bold ${fusionType === 'image' ? 'bg-white shadow-xs text-amber-950' : 'text-gray-500'}`}>1. Fusão de Imagens</button>
              <button onClick={() => { setFusionType('text'); setFusionOutput(''); }} className={`py-1.5 rounded-lg text-xs font-bold ${fusionType === 'text' ? 'bg-white shadow-xs text-amber-950' : 'text-gray-500'}`}>2. Fusão de Textos</button>
              <button onClick={() => { setFusionType('list'); setFusionOutput(''); }} className={`py-1.5 rounded-lg text-xs font-bold ${fusionType === 'list' ? 'bg-white shadow-xs text-amber-950' : 'text-gray-500'}`}>3. Unificação de Listas</button>
            </div>

            {/* Forms body */}
            <div className="space-y-3.5 text-xs font-semibold text-gray-700">
              {fusionType === 'image' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Elemento A (Ex: lobo cibernético)</label>
                      <input type="text" value={elemA} onChange={(e) => setElemA(e.target.value)} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block mb-1">Elemento B (Ex: floresta de néon)</label>
                      <input type="text" value={elemB} onChange={(e) => setElemB(e.target.value)} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Estilo Visual (Ex: ilustração digital futurista, 8k)</label>
                    <input type="text" value={styleVal} onChange={(e) => setStyleVal(e.target.value)} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none" />
                  </div>
                </div>
              )}

              {fusionType === 'text' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Ideia/Texto A</label>
                      <textarea rows={3} value={textA} onChange={(e) => setTextA(e.target.value)} placeholder="Insira o bloco A..." className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block mb-1">Ideia/Texto B</label>
                      <textarea rows={3} value={textB} onChange={(e) => setTextB(e.target.value)} placeholder="Insira o bloco B..." className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none resize-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Ajuste de Tom</label>
                    <select value={toneVal} onChange={(e) => setToneVal(e.target.value)} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none font-bold">
                      <option value="profissional">Profissional / Executivo</option>
                      <option value="criativo">Criativo / Impactante</option>
                      <option value="tático">Tático / Operacional</option>
                      <option value="acadêmico">Acadêmico / Técnico</option>
                    </select>
                  </div>
                </div>
              )}

              {fusionType === 'list' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Lista A (Uma por linha)</label>
                      <textarea rows={3} value={listA} onChange={(e) => setListA(e.target.value)} placeholder="Ex: Item 1\nItem 2" className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none resize-none font-mono" />
                    </div>
                    <div>
                      <label className="block mb-1">Lista B (Uma por linha)</label>
                      <textarea rows={3} value={listB} onChange={(e) => setListB(e.target.value)} placeholder="Ex: Item 2\nItem 3" className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none resize-none font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Ordenação por</label>
                      <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none">
                        <option value="ordem alfabética">Ordem Alfabética</option>
                        <option value="prioridade">Prioridade de Carga</option>
                        <option value="categoria">Categoria / Tipo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Formato de Saída</label>
                      <select value={formatType} onChange={(e) => setFormatType(e.target.value)} className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-2 focus:outline-none">
                        <option value="tabela">Tabela Executiva</option>
                        <option value="lista numerada">Lista Numerada</option>
                        <option value="tópicos">Tópicos (Marcadores)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={generateFusionPrompt} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md border border-amber-500 transition">
                <i className="fa-solid fa-play mr-1.5"></i> FUNDIR CONCEITOS E GERAR PROMPT
              </button>

              {fusionOutput && (
                <div className="space-y-2 border-t border-amber-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-amber-900">Resultado da Fusão Tática:</span>
                    <button onClick={handleCopy} className="text-amber-800 hover:text-amber-900 flex items-center gap-1">
                      <i className={`fa-solid ${copied ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <pre className="w-full max-h-40 overflow-y-auto bg-amber-50/70 border border-amber-200 rounded-xl p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all select-none">
                    {fusionOutput}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-amber-100">
              <button onClick={() => setShowFusionModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs">
                Fechar Central
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
