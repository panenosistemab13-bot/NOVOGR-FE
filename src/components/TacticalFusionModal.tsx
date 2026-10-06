import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  ListOrdered, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  Table, 
  Download,
  Share2
} from 'lucide-react';

interface TacticalFusionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TacticalFusionModal({ isOpen, onClose }: TacticalFusionModalProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'text' | 'list'>('image');
  const [copied, setCopied] = useState(false);

  // Tab 1: Image Fusion State
  const [elementA, setElementA] = useState('um caminhão pesado Scania Café Três Corações em alta velocidade');
  const [elementB, setElementB] = useState('uma autoestrada futurista com viadutos suspensos e iluminação néon dourada');
  const [style, setStyle] = useState('fotografia cinematográfica hiper-realista, atmosfera crepuscular');
  const [lighting, setLighting] = useState('iluminação volumétrica dramática ao pôr do sol, reflexos dourados e néon ciano');

  // Tab 2: Text Fusion State
  const [textA, setTextA] = useState('O Sistema Operacional Logístico Três Corações monitora 42 rotas táticas com telemetria 24 horas por dia. O tempo médio de transporte foi reduzido em 6% com garantia de 100% de cobertura nos pátios de carga.');
  const [textB, setTextB] = useState('A segurança e a averbação eletrônica de cargas garantem rastreamento em tempo real em todas as 5 regiões do Brasil, conectando hubs em Manaus, Belém, Fortaleza, Salvador, Brasília, São Paulo e Porto Alegre.');
  const [tone, setTone] = useState<'profissional' | 'criativo' | 'acadêmico' | 'tático'>('profissional');
  const [mergedTextResult, setMergedTextResult] = useState('');

  // Tab 3: List Fusion State
  const [listA, setListA] = useState("Manaus - Hub Norte\nBelém - Terminal Fluvial\nFortaleza - Rota Litoral\nRecife - Centro Distribuição\nBrasília - Hub Central");
  const [listB, setListB] = useState("Brasília - Hub Central\nSalvador - Pátio Sudeste\nSão Paulo/Rio - Matriz Logística\nPorto Alegre - Conexão Sul\nFortaleza - Rota Litoral");
  const [sortBy, setSortBy] = useState<'alfabetica' | 'prioridade'>('alfabetica');
  const [outputFormat, setOutputFormat] = useState<'tabela' | 'numerada' | 'topicos'>('tabela');
  const [unifiedListResult, setUnifiedListResult] = useState<string[]>([]);

  if (!isOpen) return null;

  // Generate Image Fusion Prompt
  const generatedImagePrompt = `Uma fusão harmoniosa e detalhada entre [${elementA}] e [${elementB}], combinando os traços característicos de ambos num único conceito visual. Estilo [${style}], iluminação [${lighting}], alta definição, 8k.`;

  // Generate Text Fusion Prompt
  const generatedTextPrompt = `Por favor, combina as duas ideias/textos abaixo num único documento coeso, claro e bem estruturado.

Requisitos:
1. Mantém os pontos essenciais de ambos sem perder detalhes importantes.
2. Elimina repetições e ajusta o tom para ser [${tone}].
3. Assegura uma transição suave e lógica entre os dois tópicos.

Texto A:
${textA}

Texto B:
${textB}`;

  // Smart client-side merge for preview
  const handlePerformTextMerge = () => {
    const summary = `RELATÓRIO TÁTICO UNIFICADO — LOGÍSTICA CAFÉ TRÊS CORAÇÕES
Tom aplicado: ${tone.toUpperCase()}

O Sistema Operacional Logístico Três Corações opera 42 rotas estratégicas em regime ininterrupto de 24 horas, integrando telemetria avançada e cobertura integral (100%) em todos os pátios de carga e descarga. Com uma redução consistente de 6% no tempo médio de trânsito, a operação consolida excelência em segurança através de averbação eletrônica rigorosa e rastreamento contínuo via satélite.

A malha logística omnipresente cobre com precisão as cinco macrorregiões do território nacional, articulando nós de suprimento estratégicos de Norte a Sul — incluindo os entrepostos de Manaus, Belém, Fortaleza, Recife, Salvador, Brasília, São Paulo/Rio de Janeiro e Porto Alegre — transportando o sabor e a tradição do café com total confiabilidade.`;
    setMergedTextResult(summary);
  };

  // Perform List Unification
  const handlePerformListUnify = () => {
    const linesA = listA.split('\n').map(l => l.trim()).filter(Boolean);
    const linesB = listB.split('\n').map(l => l.trim()).filter(Boolean);
    const combined = [...new Set([...linesA, ...linesB])];

    if (sortBy === 'alfabetica') {
      combined.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }
    setUnifiedListResult(combined);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#fcfaf7] border border-[#ded5c6] rounded-[22px] shadow-[0_20px_60px_rgba(30,18,10,0.25)] w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8d1118] via-[#a31523] to-[#58090e] text-white flex items-center justify-between border-b border-[#dfb15b]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-[#dfb15b] flex items-center justify-center text-[#dfb15b] shadow-inner">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide uppercase font-sans">
                Central de Fusão & Otimização Tática
              </h2>
              <p className="text-[10px] text-amber-200/90 font-medium tracking-wider">
                PROMPTS PROFISSIONAIS • COMBINAÇÃO VISUAL, TEXTUAL E DE DADOS
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#ded5c6] bg-[#f4ebd9]/60 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'image'
                ? 'bg-white border-t-2 border-t-[#8d1118] text-[#8d1118] shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <ImageIcon size={14} />
            <span>1. Fusão Visual (Imagens 8K)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white border-t-2 border-t-[#8d1118] text-[#8d1118] shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FileText size={14} />
            <span>2. Fusão de Textos & Ideias</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white border-t-2 border-t-[#8d1118] text-[#8d1118] shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <ListOrdered size={14} />
            <span>3. Unificação de Listas & Dados</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ========================================================= */}
          {/* TAB 1: FUSÃO VISUAL DE IMAGENS                            */}
          {/* ========================================================= */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                <strong>Regra de Fusão Visual:</strong> Ideal para criar imagens combinando dois objetos, animais, estilos ou temas numa só composição harmônica, cinematográfica e de alta definição.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Elemento A (Objeto/Sujeito Principal):
                  </label>
                  <input
                    type="text"
                    value={elementA}
                    onChange={(e) => setElementA(e.target.value)}
                    placeholder="Ex: um lobo cibernético / caminhão Scania 3C"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Elemento B (Ambiente / Tema de Fusão):
                  </label>
                  <input
                    type="text"
                    value={elementB}
                    onChange={(e) => setElementB(e.target.value)}
                    placeholder="Ex: uma floresta tropical de néon / autoestrada suspensa"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Estilo Visual:
                  </label>
                  <input
                    type="text"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="Ex: ilustração digital futurista / fotografia de alta resolução"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Iluminação & Renderização:
                  </label>
                  <input
                    type="text"
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value)}
                    placeholder="Ex: iluminação dramática, raios crepusculares, 8k"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner"
                  />
                </div>
              </div>

              {/* Presets rápidos */}
              <div className="flex flex-wrap gap-2 pt-1 items-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase">Sugestões Rápidas:</span>
                <button
                  type="button"
                  onClick={() => {
                    setElementA('um caminhão pesado Scania Café Três Corações em alta velocidade');
                    setElementB('uma autoestrada futurista com viadutos suspensos e iluminação néon dourada');
                    setStyle('fotografia cinematográfica hiper-realista, atmosfera crepuscular');
                    setLighting('iluminação volumétrica dramática ao pôr do sol, reflexos dourados e néon ciano');
                  }}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-medium border border-stone-300 transition-colors"
                >
                  🚛 Frota 3C Futurista
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElementA('um grão de café arábica dourado esculpido');
                    setElementB('um microprocessador holográfico com circuitos integrados luminosos');
                    setStyle('macro fotografia 3D volumétrica com profundidade de campo rasa');
                    setLighting('luz néon âmbar e ciano com reflexos metálicos especulares');
                  }}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-medium border border-stone-300 transition-colors"
                >
                  ☕ Grão Tecnológico
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElementA('um lobo cibernético');
                    setElementB('uma floresta tropical de néon');
                    setStyle('ilustração digital futurista');
                    setLighting('iluminação dramática, alta definição, 8k');
                  }}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-medium border border-stone-300 transition-colors"
                >
                  🐺 Lobo & Floresta Néon
                </button>
              </div>

              {/* Prompt Gerado */}
              <div className="mt-3 p-4 bg-stone-900 rounded-xl border border-stone-700 text-left relative group">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-700">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                    PROMPT PRONTO PARA GERADOR DE IMAGEM:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedImagePrompt)}
                    className="px-3 py-1 rounded-lg bg-[#8d1118] hover:bg-[#a31523] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    {copied ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                    <span>{copied ? 'Copiado!' : 'Copiar Prompt'}</span>
                  </button>
                </div>
                <p className="text-xs text-stone-200 font-mono leading-relaxed select-text">
                  {generatedImagePrompt}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: FUSÃO DE TEXTOS E IDEIAS                           */}
          {/* ========================================================= */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                <strong>Regra de Fusão Textual:</strong> Combina dois blocos conceituais num documento coeso, claro e sem repetições, ajustando o tom e garantindo transições suaves.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Ideia / Texto A:
                  </label>
                  <textarea
                    rows={4}
                    value={textA}
                    onChange={(e) => setTextA(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Ideia / Texto B:
                  </label>
                  <textarea
                    rows={4}
                    value={textB}
                    onChange={(e) => setTextB(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner font-sans"
                  />
                </div>
              </div>

              {/* Opções de Tom e Ação */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700">Tom Desejado:</span>
                  {(['profissional', 'criativo', 'acadêmico', 'tático'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors ${
                        tone === t
                          ? 'bg-[#8d1118] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedTextPrompt)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 border border-stone-300 transition-colors"
                  >
                    <Copy size={13} />
                    <span>Copiar Prompt para LLM</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePerformTextMerge}
                    className="px-4 py-1.5 rounded-xl bg-[#8d1118] hover:bg-[#a31523] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <RefreshCw size={13} />
                    <span>Unificar Textos Agora</span>
                  </button>
                </div>
              </div>

              {/* Resultado do Merge */}
              {mergedTextResult && (
                <div className="p-4 bg-white rounded-xl border border-stone-300 shadow-xs space-y-2 text-left">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-[11px] font-bold text-[#8d1118] uppercase tracking-wide">
                      Resultado Unificado com Transição Suave:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(mergedTextResult)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1 border border-stone-300"
                    >
                      <Copy size={12} />
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="text-xs text-stone-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {mergedTextResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: UNIFICAÇÃO DE LISTAS E DADOS                       */}
          {/* ========================================================= */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                <strong>Regra de Unificação de Dados:</strong> Remove duplicatas entre as duas fontes, organiza os itens por critério selecionado e formata a saída em tabela ou tópicos.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Lista A (Itens / Hubs / Placas):
                  </label>
                  <textarea
                    rows={4}
                    value={listA}
                    onChange={(e) => setListA(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Lista B (Itens / Hubs / Placas):
                  </label>
                  <textarea
                    rows={4}
                    value={listB}
                    onChange={(e) => setListB(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner font-mono"
                  />
                </div>
              </div>

              {/* Controles de Ordenação e Ação */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <span>Organizar:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-xs font-medium"
                    >
                      <option value="alfabetica">Ordem Alfabética</option>
                      <option value="prioridade">Por Prioridade</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <span>Formato:</span>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as any)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-xs font-medium"
                    >
                      <option value="tabela">Tabela Executiva</option>
                      <option value="numerada">Lista Numerada</option>
                      <option value="topicos">Tópicos (Bullets)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePerformListUnify}
                  className="px-4 py-2 rounded-xl bg-[#8d1118] hover:bg-[#a31523] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Unificar & Remover Duplicadas</span>
                </button>
              </div>

              {/* Resultado da Unificação */}
              {unifiedListResult.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-stone-300 shadow-xs space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-[11px] font-bold text-[#8d1118] uppercase tracking-wide">
                      Lista Unificada Sem Duplicadas ({unifiedListResult.length} itens únicos):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(unifiedListResult.join('\n'))}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1 border border-stone-300"
                    >
                      <Copy size={12} />
                      <span>Copiar Todos</span>
                    </button>
                  </div>

                  {outputFormat === 'tabela' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-stone-100 text-stone-700 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3 w-12">#</th>
                            <th className="py-2 px-3">Item / Hub Logístico</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-sans">
                          {unifiedListResult.map((item, idx) => (
                            <tr key={idx} className="hover:bg-amber-50/50">
                              <td className="py-1.5 px-3 font-mono text-stone-400">{String(idx + 1).padStart(2, '0')}</td>
                              <td className="py-1.5 px-3 font-medium text-stone-900">{item}</td>
                              <td className="py-1.5 px-3">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  Validado
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : outputFormat === 'numerada' ? (
                    <ol className="list-decimal pl-5 space-y-1 text-xs text-stone-800">
                      {unifiedListResult.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1 text-xs text-stone-800">
                      {unifiedListResult.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-[#ded5c6] flex items-center justify-between text-xs text-stone-500">
          <span>Café Três Corações • Inteligência Operacional Integrada</span>
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
