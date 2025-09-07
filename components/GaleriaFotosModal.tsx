'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface GaleriaFotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  fotosAntes: string[];
  fotosDepois: string[];
  grupoInicial: 'antes' | 'depois';
  indiceInicial: number;
}

export default function GaleriaFotosModal({
  isOpen,
  onClose,
  fotosAntes,
  fotosDepois,
  grupoInicial,
  indiceInicial
}: GaleriaFotosModalProps) {
  const [grupoAtivo, setGrupoAtivo] = useState<'antes' | 'depois'>(grupoInicial);
  const [indiceAtivo, setIndiceAtivo] = useState(indiceInicial);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageRect, setImageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  // Lista ativa baseada no grupo selecionado
  const fotosAtivas = grupoAtivo === 'antes' ? fotosAntes : fotosDepois;
  const fotoAtual = fotosAtivas[indiceAtivo];

  // Reset quando o modal abrir e controlar scroll da página
  useEffect(() => {
    if (isOpen) {
      setGrupoAtivo(grupoInicial);
      setIndiceAtivo(indiceInicial);
      // Bloquear scroll da página
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll da página
      document.body.style.overflow = 'unset';
    }

    // Cleanup quando o componente desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, grupoInicial, indiceInicial]);

  // Função para processar URLs (mesma lógica do sistema)
  const processarUrl = (rawUrl: string) => {
    return rawUrl
      .replace('facemind-files.bunnycdn.com', 'facemind.b-cdn.net')
      .replace('facemind-files.b-cdn.net', 'facemind.b-cdn.net');
  };

  // Navegação
  const proximaFoto = () => {
    setIndiceAtivo((prev) => (prev + 1) % fotosAtivas.length);
    setIsZoomMode(false); // Reset zoom ao trocar foto
  };

  const fotoAnterior = () => {
    setIndiceAtivo((prev) => (prev - 1 + fotosAtivas.length) % fotosAtivas.length);
    setIsZoomMode(false); // Reset zoom ao trocar foto
  };

  // Trocar de grupo
  const trocarGrupo = (novoGrupo: 'antes' | 'depois') => {
    setGrupoAtivo(novoGrupo);
    setIndiceAtivo(0); // Reset para primeiro índice do novo grupo
    setIsZoomMode(false); // Reset zoom ao trocar grupo
  };

  // Funções para a lupa
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isZoomMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setImageRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
    
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLImageElement>) => {
    setIsZoomMode(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setImageRect({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    });
  };

  const handleMouseLeave = () => {
    setIsZoomMode(false);
  };

  // Navegar com teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          proximaFoto();
          break;
        case 'ArrowLeft':
          fotoAnterior();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, fotosAtivas.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* CSS para esconder scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50">
          <div className="flex items-center space-x-4">
            {/* Toggle de Grupos */}
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => trocarGrupo('antes')}
                disabled={fotosAntes.length === 0}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  grupoAtivo === 'antes'
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${fotosAntes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Antes ({fotosAntes.length})</span>
                </span>
              </button>
              <button
                onClick={() => trocarGrupo('depois')}
                disabled={fotosDepois.length === 0}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  grupoAtivo === 'depois'
                    ? 'bg-green-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${fotosDepois.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Depois ({fotosDepois.length})</span>
                </span>
              </button>
            </div>

            {/* Contador */}
            <div className="text-white/70 text-sm">
              {indiceAtivo + 1} de {fotosAtivas.length}
            </div>
          </div>

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Área da Imagem */}
        <div className="flex-1 flex items-center justify-center relative px-20 py-4">
          {fotosAtivas.length > 0 ? (
            <>
              {/* Imagem Principal */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative">
                  <img
                    src={processarUrl(fotoAtual)}
                    alt={`Foto ${grupoAtivo} ${indiceAtivo + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-crosshair"
                    style={{ 
                      maxWidth: 'calc(100vw - 160px)', 
                      maxHeight: 'calc(100vh - 250px)'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const originalUrl = fotoAtual.split('?')[0];
                      if (target.src !== originalUrl) {
                        target.src = originalUrl;
                      }
                    }}
                  />
                  
                  {/* Lupa Circular */}
                  {isZoomMode && (
                    <div
                      className="fixed pointer-events-none z-50 border-4 border-white rounded-full shadow-2xl overflow-hidden"
                      style={{
                        left: mousePosition.x - 75,
                        top: mousePosition.y - 75,
                        width: '150px',
                        height: '150px',
                      }}
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${processarUrl(fotoAtual)})`,
                          backgroundSize: `${imageRect.width * 2}px ${imageRect.height * 2}px`,
                          backgroundPosition: `${-(mousePosition.x - imageRect.left) * 2 + 75}px ${-(mousePosition.y - imageRect.top) * 2 + 75}px`,
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      {/* Pequeno ponto central da lupa */}
                      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
                    </div>
                  )}
                </div>
              </div>

              {/* Controles de Navegação - Sempre Visíveis */}
              <button
                onClick={fotoAnterior}
                disabled={fotosAtivas.length <= 1}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={proximaFoto}
                disabled={fotosAtivas.length <= 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <div className="text-center text-white/50">
              <PhotoIcon className="w-16 h-16 mx-auto mb-4" />
              <p>Nenhuma foto disponível no grupo "{grupoAtivo}"</p>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {fotosAtivas.length > 1 && (
          <div className="flex-shrink-0 p-4 bg-black/50">
            <div className="flex justify-center space-x-2 max-w-full overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2 px-4">
                {fotosAtivas.map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => setIndiceAtivo(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === indiceAtivo
                        ? 'border-white'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={processarUrl(foto)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const originalUrl = foto.split('?')[0];
                        if (target.src !== originalUrl) {
                          target.src = originalUrl;
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            {/* Legenda de Atalhos */}
            <div className="text-center mt-2">
              <p className="text-white/40 text-xs">
                Use ← → para navegar • ESC para fechar
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
