import React from 'react';
import { MapPin } from 'lucide-react';
import brazilGoldMapImg from '../../assets/images/brazil_map_gold_1791473887938.jpg';

interface MainDashboardProps {
  onNavigate?: (tabId: string) => void;
}

export default function MainDashboard({ onNavigate: _onNavigate }: MainDashboardProps) {
  return (
    <div className="w-full h-full min-h-[calc(100vh-68px)] relative overflow-hidden bg-[#07080c] select-none font-sans flex items-center justify-center">
      
      {/* ========================================================================= */}
      {/* MAPA 3D "BRASIL CONECTADO" • SEMPRE EM TELA CHEIA / FULL BLEED            */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full bg-[#07080c] flex items-center justify-center overflow-hidden">
        <img 
          src={brazilGoldMapImg} 
          alt="Brasil Conectado • Cobertura Nacional 3C" 
          className="w-full h-full object-contain md:object-cover lg:object-contain object-center pointer-events-none select-none filter brightness-105 contrast-105"
        />
        {/* Camadas sutis de luminosidade e transição cinematográfica */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* CARD FLUTUANTE INFERIOR ESQUERDO (EXATAMENTE COMO NO ANEXO)              */}
      {/* ========================================================================= */}
      <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-20 bg-[#0e1014]/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-stone-800/80 shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-left max-w-sm sm:max-w-md md:max-w-lg text-white animate-in fade-in duration-300">
        
        {/* Tag Categoria */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D8B065] to-[#AA7E2F] text-black flex items-center justify-center font-bold shadow-xs shrink-0">
            <MapPin size={13} className="stroke-[2.5]" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">
            BRASIL CONECTADO
          </span>
        </div>

        {/* Título Principal */}
        <h4 className="text-sm sm:text-base md:text-lg font-black text-white uppercase tracking-tight leading-snug mb-2">
          SEJA BEM-VINDO(A) AO NOSSO SISTEMA!
        </h4>

        {/* Mensagem de Boas-Vindas */}
        <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed">
          É um prazer ter você aqui. Acompanhe o monitoramento ativo, para todas as regiões do país com alta precisão PGR.
        </p>

        {/* Legenda de Rotas */}
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/10 text-[10.5px] sm:text-xs font-mono font-bold text-stone-400">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm" />
            Rotas ativas
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm" />
            Pontos de entrega
          </span>
        </div>

      </div>

    </div>
  );
}
