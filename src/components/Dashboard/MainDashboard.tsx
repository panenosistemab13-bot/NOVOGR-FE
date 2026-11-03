import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Compass,
  Move,
  Play,
  Pause,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import brazilGoldMapImg from '../../assets/images/brazil_map_gold_1791473887938.jpg';
import Wallpaper360Viewer from '../common/Wallpaper360Viewer';

interface MainDashboardProps {
  onNavigate?: (tabId: string) => void;
}

export default function MainDashboard({ onNavigate: _onNavigate }: MainDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados de manipulação 3D 360° da cena
  const [zoom, setZoom] = useState(1.15); // Inicia levemente ampliado para cobrir 100% da tela sem bordas
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showSphere360, setShowSphere360] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const autoRotateAngleRef = useRef(0);

  // Rotação 3D sutil contínua (Cinematic 3D Drift)
  useEffect(() => {
    if (!isAutoRotate || isDragging) return;

    let animId: number;
    const animate = () => {
      autoRotateAngleRef.current += 0.015;
      const angle = autoRotateAngleRef.current;
      setTilt({
        x: Math.sin(angle * 0.7) * 4,
        y: Math.cos(angle * 0.5) * 6,
      });
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotate, isDragging]);

  // Manipulação de Mouse Move para Parallax 3D
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.panX + deltaX,
        y: dragStartRef.current.panY + deltaY,
      });
    } else if (!isAutoRotate && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
      const yNorm = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        x: -yNorm * 12,
        y: xNorm * 16,
      });
    }
  }, [isDragging, isAutoRotate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Apenas clique principal ativa arrasto
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Zoom pelo scroll do mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    setZoom((prev) => Math.min(2.8, Math.max(1.05, prev * factor)));
  };

  // Suporte Touch para Tablets e Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + deltaX,
      y: dragStartRef.current.panY + deltaY,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleReset = () => {
    setZoom(1.15);
    setPan({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0 });
    autoRotateAngleRef.current = 0;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "w-full h-full min-h-[calc(100vh-68px)] relative overflow-hidden bg-[#07080c] select-none font-sans",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{ perspective: '1400px', touchAction: 'none' }}
    >
      
      {/* ========================================================================= */}
      {/* 1. MAPA 3D 4K • COBERTURA 100% TOTAL DA PÁGINA (ZERO BORDAS PRETAS)       */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <img 
          src={brazilGoldMapImg} 
          alt="Brasil Conectado • Rotas Douradas 3D 4K" 
          className="w-full h-full object-cover object-center pointer-events-none select-none filter brightness-105 contrast-105"
          draggable={false}
        />
      </div>

      {/* Camada Cinematográfica de Profundidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none z-10" />

      {/* ========================================================================= */}
      {/* 2. CONTROLES 3D 360° FLUTUANTES (TOPO DIREITO)                            */}
      {/* ========================================================================= */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="bg-[#0e1014]/92 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800/90 shadow-2xl flex items-center gap-2 text-white">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold text-amber-400">
            <Compass size={14} className="text-[#E5C27A] animate-spin-slow" />
            <span className="hidden sm:inline">MAPA 3D 360° 4K</span>
            <span className="sm:hidden">360° 4K</span>
          </div>

          <span className="w-px h-3.5 bg-stone-700" />

          {/* Toggle Rotação Automática */}
          <button
            type="button"
            onClick={() => setIsAutoRotate(prev => !prev)}
            className={cn(
              "p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer",
              isAutoRotate 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                : "hover:bg-stone-800 text-stone-400"
            )}
            title={isAutoRotate ? "Pausar rotação automática 3D" : "Ativar rotação automática 3D"}
          >
            {isAutoRotate ? <Pause size={12} /> : <Play size={12} />}
            <span className="text-[10px] hidden md:inline font-mono">
              {isAutoRotate ? 'GIRANDO' : 'PAUSADO'}
            </span>
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(2.8, prev * 1.15))}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Aproximar (Zoom In)"
          >
            <ZoomIn size={13} />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(1.05, prev * 0.88))}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Afastar (Zoom Out)"
          >
            <ZoomOut size={13} />
          </button>

          {/* Recentralizar */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Recentralizar visão 3D"
          >
            <RotateCcw size={13} />
          </button>

          {/* Esfera 360° Imersiva */}
          <button
            type="button"
            onClick={() => setShowSphere360(true)}
            className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors cursor-pointer flex items-center gap-1"
            title="Abrir Esfera 360° Completa"
          >
            <Globe size={13} />
            <span className="text-[10px] hidden md:inline font-mono font-bold">ESFERA 360°</span>
          </button>
        </div>

        {/* Dica de interação de arrasto */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#0e1014]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800/80 text-[10.5px] font-mono text-stone-400">
          <Move size={12} className="text-[#E5C27A]" />
          <span>Arraste para explorar em 3D</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CARD FLUTUANTE INFERIOR ESQUERDO (IDÊNTICO AO SOLICITADO)             */}
      {/* ========================================================================= */}
      <div 
        onMouseDown={(e) => e.stopPropagation()} 
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-20 bg-[#0e1014]/92 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-stone-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-left max-w-sm sm:max-w-md md:max-w-lg text-white pointer-events-auto animate-in fade-in duration-300"
      >
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

      {/* ========================================================================= */}
      {/* 4. MODAL ESFERA 360° TOTALMENTE IMERSIVA (CASO DESEJADO PELO USUÁRIO)      */}
      {/* ========================================================================= */}
      {showSphere360 && (
        <Wallpaper360Viewer 
          imageUrl={brazilGoldMapImg}
          onClose={() => setShowSphere360(false)}
        />
      )}

    </div>
  );
}
