import React from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Radio, 
  Clock, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';

interface ProtocolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToChecklist?: () => void;
}

export default function ProtocolsModal({ isOpen, onClose, onGoToChecklist }: ProtocolsModalProps) {
  if (!isOpen) return null;

  const PROTOCOLS = [
    {
      id: 'pgr',
      title: '1. Plano de Gerenciamento de Risco (PGR)',
      desc: 'Todas as viagens de café gourmet, solúvel ou fardos acima de R$ 80.000 exigem cadastro ativo na gerenciadora de risco, validação de motorista (Telerisco/Buonny) e rotograma aprovado.',
      status: 'Obrigatório'
    },
    {
      id: 'averbacao',
      title: '2. Averbação Automática Pré-Saída',
      desc: 'Nenhum veículo pode transpor a guarita da fábrica sem averbação eletrônica confirmada perante a seguradora com geração de protocolo ATTR.',
      status: 'Ativo 100%'
    },
    {
      id: 'telemetria',
      title: '3. Telemetria e Duplo Espelhamento',
      desc: 'Comunicação a cada 2 minutos em áreas de sombra via satélite. Monitoramento contínuo de velocidade (máx. 80 km/h em pista seca, 60 km/h em chuva).',
      status: '24 Horas'
    },
    {
      id: 'paradas',
      title: '4. Postos Homologados e Paradas Seguras',
      desc: 'Proibido pernoitar em acostamentos ou postos desprovidos de segurança armada. Paradas de descanso obrigatórias a cada 4 horas conforme Lei do Motorista.',
      status: 'Conforme'
    },
    {
      id: 'lacre',
      title: '5. Lacre Inviolável & Sensor de Baú',
      desc: 'Lacres metálicos numerados conferidos na prancheta de saída e conferência ótica na portaria de destino.',
      status: 'Inspecionado'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#fcfaf7] border border-[#ded5c6] rounded-[22px] shadow-[0_20px_60px_rgba(30,18,10,0.25)] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8d1118] via-[#a31523] to-[#58090e] text-white flex items-center justify-between border-b border-[#dfb15b]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 border border-[#dfb15b] flex items-center justify-center text-[#dfb15b] shadow-inner">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide uppercase font-sans">
                Protocolos Operacionais & Segurança 3C
              </h2>
              <p className="text-[10px] text-amber-200/90 font-medium tracking-wider">
                NORMAS TÁTICAS • CONFORMIDADE ANTT • GESTÃO DE RISCO DE CARGAS
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
        <div className="p-6 overflow-y-auto space-y-4 text-left">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <strong>Manual de Segurança 2026/2027:</strong> Em vigor para todas as unidades industriais e centros de distribuição do Grupo Três Corações.
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              Certificado ISO 9001
            </span>
          </div>

          <div className="space-y-3">
            {PROTOCOLS.map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1 hover:border-[#8d1118]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900">{p.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[#8d1118] text-[10px] font-mono font-bold border border-stone-200">
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed font-sans">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-[#ded5c6] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onGoToChecklist) onGoToChecklist();
            }}
            className="px-4 py-2 rounded-xl bg-[#8d1118] hover:bg-[#a31523] text-white font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileText size={13} />
            <span>Abrir Módulo de Checklist Completo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
