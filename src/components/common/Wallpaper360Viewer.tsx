import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft } from 'lucide-react';

interface Wallpaper360ViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export default function Wallpaper360Viewer({ imageUrl, onClose }: Wallpaper360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGl, setHasWebGl] = useState(true);

  // Keyboard shortcut to close (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let mesh: THREE.Mesh | null = null;
    let animationFrameId: number;

    let isUserInteracting = false;
    let onPointerDownPointerX = 0;
    let onPointerDownPointerY = 0;
    let onPointerDownLon = 0;
    let onPointerDownLat = 0;
    let lon = 0;
    let lat = 0;
    let phi = 0;
    let theta = 0;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        1100
      );
      const target = new THREE.Vector3(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      // Inverted Sphere for 360° Photosphere Panorama
      const geometry = new THREE.SphereGeometry(500, 64, 40);
      geometry.scale(-1, 1, 1);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        imageUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;

          const material = new THREE.MeshBasicMaterial({ map: texture });
          mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        },
        undefined,
        (err) => {
          console.warn('Erro ao carregar textura 360, usando fallback CSS', err);
          setHasWebGl(false);
        }
      );

      const onPointerDown = (event: PointerEvent) => {
        isUserInteracting = true;
        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!isUserInteracting) return;
        lon = (onPointerDownPointerX - event.clientX) * 0.15 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.15 + onPointerDownLat;
      };

      const onPointerUp = () => {
        isUserInteracting = false;
      };

      const onWheel = (event: WheelEvent) => {
        camera.fov = Math.max(30, Math.min(95, camera.fov + event.deltaY * 0.05));
        camera.updateProjectionMatrix();
      };

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      container.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      container.addEventListener('wheel', onWheel, { passive: true });
      window.addEventListener('resize', onResize);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        if (!isUserInteracting) {
          lon += 0.06; // Suave rotação contínua 360° automática
        }

        lat = Math.max(-85, Math.min(85, lat));
        phi = THREE.MathUtils.degToRad(90 - lat);
        theta = THREE.MathUtils.degToRad(lon);

        target.x = 500 * Math.sin(phi) * Math.cos(theta);
        target.y = 500 * Math.cos(phi);
        target.z = 500 * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(target);

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        container.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('wheel', onWheel);
        window.removeEventListener('resize', onResize);

        if (mesh) {
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (e) {
      console.warn('WebGL não suportado para 360, ativando fallback CSS', e);
      setHasWebGl(false);
    }
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 w-screen h-screen z-[99999] bg-black overflow-hidden select-none">
      {/* 360° Three.js Interactive Photosphere Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* Fallback CSS 360° se WebGL falhar */}
      {!hasWebGl && (
        <div
          className="w-full h-full absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Única opção na tela: Voltar a exibir as páginas dos aplicativos */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100000] pointer-events-auto">
        <button
          onClick={onClose}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#c4161c] via-[#a31218] to-[#7a0c16] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_12px_36px_rgba(0,0,0,0.85)] border border-white/25 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          title="Voltar a exibir as páginas dos aplicativos"
        >
          <ArrowLeft size={18} className="stroke-[3]" />
          <span>Voltar a exibir as páginas dos aplicativos</span>
        </button>
      </div>
    </div>
  );
}
