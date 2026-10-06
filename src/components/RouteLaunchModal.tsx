import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  DollarSign, 
  Send,
  AlertTriangle
} from 'lucide-react';

interface RouteLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteLaunched?: (newRoute: any) => void;
}

const HUBS = [
  'São Paulo/Rio (Matriz)',
  'Brasília (Hub Central)',
  'Belo Horizonte / Três Corações (MG)',
  'Salvador (Pátio Nordeste)',
  'Recife (CD Nordeste)',
  'Fortaleza (Terminal Litoral)',
  'Belém (Terminal Fluvial)',
  'Manaus (Pólo Norte)',
  'Porto Alegre (CD Sul)',
  'Curitiba (CD Sul)'
];

const CARGO_TYPES = [
  'Café Tradicional 3C (Fardo 500g)',
  'Café Gourmet Especial Rituais 3C',
  'Cápsulas Multicombinações Três Corações',
  'Café Solúvel & Cappuccinos Clássicos',
  'Café em Grãos Cru Arábica Premium'
];

export default function RouteLaunchModal({ isOpen, onClose, onRouteLaunched }: RouteLaunchModalProps) {
  const [origin, setOrigin] = useState('São Paulo/Rio (Matriz)');
  const [destination, setDestination] = useState('Brasília (Hub Central)');
  const [plate, setPlate] = useState('BRA2E19');
  const [driver, setDriver] = useState('Carlos Eduardo Silva');
  const [cargoType, setCargoType] = useState('Café Tradicional 3C (Fardo 500g)');
  const [cargoValue, setCargoValue] = useState('185.400,00');
  const [securityLevel, setSecurityLevel] = useState<'pgr_padrao' | 'pgr_alto_valor'>('pgr_padrao');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      if (onRouteLaunched) {
        onRouteLaunched({
          origin,
          destination,
          plate,
          driver,
          cargoType,
          cargoValue,
          securityLevel,
          dispatchedAt: new Date().toISOString()
        });
      }
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#fcfaf7] border border-[#ded5c6] rounded-[22px] shadow-[0_20px_60px_rgba(30,18,10,0.25)] w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8d1118] via-[#a31523] to-[#58090e] text-white flex items-center justify-between border-b border-[#dfb15b]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-[#dfb15b] flex items-center justify-center text-[#dfb15b] shadow-inner">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide uppercase font-sans">
                Lançar Nova Rota Operacional
              </h2>
              <p className="text-[10px] text-amber-200/90 font-medium tracking-wider">
                DESPACHO IMEDIATO • AVERBAÇÃO INTEGRADA • PGR ATIVO
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

        {/* Content */}
        {isSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-stone-900 uppercase">
              Rota Lançada com Sucesso!
            </h3>
            <p className="text-xs text-stone-600 max-w-md">
              A rota entre <strong>{origin}</strong> e <strong>{destination}</strong> foi averbada e enviada para a central de rastreamento satelital 24h.
            </p>
            <div className="text-[11px] font-mono bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700">
              SM: #{Math.floor(100000 + Math.random() * 900000)} • Placa: {plate}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origem */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#8d1118]" />
                  <span>Origem da Carga:</span>
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner font-medium"
                >
                  {HUBS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Destino */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={12} className="text-emerald-600" />
                  <span>Destino / Polo:</span>
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-[#8d1118] shadow-inner font-medium"
                >
                  {HUBS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Placa */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Placa do Cavalo / Carreta:
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 font-mono font-bold uppercase tracking-wider shadow-inner"
                  required
                />
              </div>

              {/* Motorista */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Motorista Designado:
                </label>
                <input
                  type="text"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 shadow-inner"
                  required
                />
              </div>

              {/* Tipo de Carga */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Tipo de Produto Café Três Corações:
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 font-medium shadow-inner"
                >
                  {CARGO_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Valor da Carga */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Valor Declarado (R$):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">R$</span>
                  <input
                    type="text"
                    value={cargoValue}
                    onChange={(e) => setCargoValue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 font-mono font-bold shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Protocolo de Segurança PGR */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#8d1118]" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  Regras de Gerenciamento de Risco (PGR):
                </span>
              </div>
              <div className="flex gap-4 text-xs font-medium text-stone-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pgr"
                    checked={securityLevel === 'pgr_padrao'}
                    onChange={() => setSecurityLevel('pgr_padrao')}
                    className="accent-[#8d1118]"
                  />
                  <span>Padrão 3C (Rastreador + Bloqueador + Isca de Carga)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pgr"
                    checked={securityLevel === 'pgr_alto_valor'}
                    onChange={() => setSecurityLevel('pgr_alto_valor')}
                    className="accent-[#8d1118]"
                  />
                  <span>Alto Valor (Escolta Armada + Telemetria Dupla)</span>
                </label>
              </div>
            </div>

            {/* Botoes de Acao */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8d1118] via-[#a31523] to-[#58090e] hover:from-[#a31523] hover:to-[#8d1118] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer border border-[#dfb15b]/40"
              >
                <Send size={13} />
                <span>Despachar & Lançar Rota</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
