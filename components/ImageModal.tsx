// components/ImageModal.tsx
'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null; // Este será o URL da miniatura (com parâmetros de transformação)
  altText?: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, altText = "Imagem do Procedimento" }: ImageModalProps) {
  if (!isOpen || !imageUrl) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Tenta obter a URL base da imagem original removendo os parâmetros de transformação
  let originalImageUrl = imageUrl;
  if (imageUrl.includes('?width=') || imageUrl.includes('?height=')) {
    originalImageUrl = imageUrl.split('?')[0];
  }

  // Extrai nome do arquivo para legenda
  const fileName = originalImageUrl.split('/').pop()?.split('?')[0] || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-white p-0 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col items-center animate-scale-in">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 bg-white bg-opacity-80 hover:bg-opacity-100 hover:text-red-600 rounded-full p-2 shadow transition z-10"
          aria-label="Fechar modal"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        {/* Botão download */}
        <a
          href={originalImageUrl}
          download={fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 left-3 text-gray-700 bg-white bg-opacity-80 hover:bg-opacity-100 hover:text-blue-600 rounded-full p-2 shadow transition z-10"
          title="Baixar imagem"
        >
          <Download className="w-6 h-6" />
        </a>
        {/* Imagem */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <img
            src={originalImageUrl}
            alt={altText}
            className="object-contain max-w-full max-h-[70vh] rounded-lg shadow-lg border border-gray-200"
          />
        </div>
      </div>
      {/* Animações */}
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn .25s cubic-bezier(.4,0,.2,1); }
        .animate-scale-in { animation: scaleIn .25s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}