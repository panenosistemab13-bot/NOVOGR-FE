import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BRAZIL_MAP_NODES, MapNode } from '../../data/mockData';

interface BrazilMap3DProps {
  selectedNodeId?: string;
  onSelectNode?: (node: MapNode) => void;
}

export default function BrazilMap3D({ selectedNodeId, onSelectNode }: BrazilMap3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [hasWebGl, setHasWebGl] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let mapGroup: THREE.Group;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 0, 18);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      mapGroup = new THREE.Group();
      scene.add(mapGroup);

      // Ambient & Directional Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const redLight = new THREE.PointLight(0xA31324, 2, 50);
      redLight.position.set(5, 5, 10);
      scene.add(redLight);

      const goldLight = new THREE.PointLight(0xD6A84F, 1.5, 50);
      goldLight.position.set(-5, -5, 10);
      scene.add(goldLight);

      // Brazil Contour Map Grid System
      const mapShape = new THREE.Group();

      // Create glowing nodes in 3D space
      BRAZIL_MAP_NODES.forEach((node) => {
        // Map 0-100 x/y to THREE coordinate system (-7 to 7, -6 to 6)
        const x = (node.xPercent - 50) * 0.16;
        const y = -(node.yPercent - 50) * 0.14;
        const z = Math.random() * 0.4;

        // Node Geometry (Outer Ring + Core)
        const coreGeo = new THREE.SphereGeometry(0.22, 16, 16);
        const nodeColor = node.status === 'optimal' ? 0x43D17A : node.status === 'warning' ? 0xD6A84F : 0xE63946;
        
        const coreMat = new THREE.MeshBasicMaterial({ color: nodeColor });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(x, y, z);
        mapShape.add(coreMesh);

        // Ring pulse mesh
        const ringGeo = new THREE.RingGeometry(0.28, 0.38, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
          color: nodeColor, 
          transparent: true, 
          opacity: 0.6,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(x, y, z);
        mapShape.add(ringMesh);
      });

      // Connecting Curved Flight/Route Lines
      const lineMat = new THREE.LineBasicMaterial({ color: 0xD6A84F, transparent: true, opacity: 0.35 });
      const mainHub = BRAZIL_MAP_NODES.find(n => n.id === 'node-sp') || BRAZIL_MAP_NODES[0];
      const mainX = (mainHub.xPercent - 50) * 0.16;
      const mainY = -(mainHub.yPercent - 50) * 0.14;

      BRAZIL_MAP_NODES.forEach((node) => {
        if (node.id === mainHub.id) return;
        const x = (node.xPercent - 50) * 0.16;
        const y = -(node.yPercent - 50) * 0.14;

        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(mainX, mainY, 0),
          new THREE.Vector3((mainX + x) / 2, (mainY + y) / 2, 1.8),
          new THREE.Vector3(x, y, 0)
        );

        const points = curve.getPoints(30);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMat);
        mapShape.add(line);
      });

      mapGroup.add(mapShape);

      // Subtle Rotation Animation
      let angle = 0;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        angle += 0.003;
        mapGroup.rotation.y = Math.sin(angle) * 0.08;
        mapGroup.rotation.x = Math.cos(angle) * 0.04;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (e) {
      console.warn("WebGL Fallback activated:", e);
      setHasWebGl(false);
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#121A26] rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between">
      
      {/* Header Overlay */}
      <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-[#121A26] to-transparent">
        <div className="text-left">
          <span className="text-[10px] font-mono font-black text-[#D6A84F] uppercase tracking-widest block mb-0.5">
            VISÃO GERAL DAS OPERAÇÕES
          </span>
          <h2 className="text-3xl font-black text-[#F3F6F8] uppercase tracking-tight font-heading">
            BRASIL
          </h2>
          <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
            Inteligência, precisão e foco em resultados para todo o país.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-[#94A3B8] bg-[#172231] px-2.5 py-1 rounded-full border border-white/10 uppercase">
            ATUALIZAÇÃO: 15.01.25 09:30 ◆
          </span>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        {hasWebGl ? (
          <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-pointer" />
        ) : null}

        {/* Interactive SVG Node Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 600">
            {/* Background Map Silhouette Vector */}
            <path
              d="M320,120 Q480,80 650,140 T850,220 Q880,320 780,420 T620,520 Q520,540 450,480 T350,380 Q280,280 320,120 Z"
              fill="rgba(23, 34, 49, 0.4)"
              stroke="rgba(214, 168, 79, 0.25)"
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {BRAZIL_MAP_NODES.map((node) => {
              const cx = node.xPercent * 10;
              const cy = node.yPercent * 6;
              const isSelected = selectedNodeId === node.id;

              return (
                <g 
                  key={node.id} 
                  className="pointer-events-auto cursor-pointer group"
                  onClick={() => onSelectNode && onSelectNode(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 10 : 7}
                    fill={node.status === 'optimal' ? '#43D17A' : node.status === 'warning' ? '#D6A84F' : '#E63946'}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 18 : 12}
                    fill="none"
                    stroke={node.status === 'optimal' ? '#43D17A' : node.status === 'warning' ? '#D6A84F' : '#E63946'}
                    strokeWidth="1.5"
                    className="animate-node-pulse"
                  />
                  <text
                    x={cx + 12}
                    y={cy + 4}
                    fill="#F3F6F8"
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="Inter, sans-serif"
                    className="drop-shadow-md uppercase tracking-wider"
                  >
                    {node.city}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip */}
        {hoveredNode && (
          <div className="absolute top-4 right-4 z-30 bg-[#172231]/95 backdrop-blur-md border border-[#D6A84F]/50 p-3 rounded-xl shadow-2xl text-left font-sans animate-fade-in max-w-xs">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
              <span className="text-xs font-black text-[#F3F6F8] uppercase tracking-wide">
                {hoveredNode.city} ({hoveredNode.state})
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#43D17A]/20 text-[#43D17A] border border-[#43D17A]/40 uppercase">
                {hoveredNode.status}
              </span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-[#94A3B8]">
              <div>Valor Averbado: <span className="text-[#F3F6F8] font-bold">{hoveredNode.value}</span></div>
              <div>Rotas Ativas: <span className="text-[#D6A84F] font-bold">{hoveredNode.routesCount}</span></div>
              <div>Conformidade: <span className="text-[#43D17A] font-bold">{hoveredNode.compliance}%</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="p-3 bg-[#172231]/80 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#94A3B8] z-10 flex-wrap gap-2">
        <span className="font-bold text-[#D6A84F] uppercase">DESEMPENHO REGIONAL:</span>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#43D17A]" /> Acima da meta</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4DD6D8]" /> Dentro da meta</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D6A84F]" /> Atenção</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" /> Abaixo da meta</span>
        </div>
      </div>

    </div>
  );
}
