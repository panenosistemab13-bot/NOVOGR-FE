import React from 'react';
import brazilMapWhiteDayImg from '../../assets/images/brazil_map_white_day.png';

interface MainDashboardProps {
  onNavigate?: (tabId: string) => void;
}

export default function MainDashboard({ onNavigate: _onNavigate }: MainDashboardProps) {
  return (
    <div className="w-full h-full min-h-[calc(100vh-64px)] relative overflow-hidden bg-white select-none font-sans flex flex-col justify-center items-center">
      {/* 
        ========================================================================= 
        MAPA 3D DIURNO BRASIL CONECTADO • ROTAS DOURADAS & CABINE PGR
        100% IDÊNTICO À IMAGEM ANEXADA (image_2d856a04.png)
        ========================================================================= 
      */}
      <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
        <img 
          src={brazilMapWhiteDayImg} 
          alt="Brasil Conectado • Rotas Douradas e Monitoramento PGR" 
          className="w-full h-full object-cover object-center pointer-events-none select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
