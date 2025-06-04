// components/ImageModal.tsx
'use client';

import React from 'react';

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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-white p-2 rounded-lg shadow-xl max-w-3xl max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 bg-white bg-opacity-50 hover:bg-opacity-75 hover:text-gray-900 rounded-full p-1.5 z-10"
          aria-label="Fechar modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <img 
          src={originalImageUrl} // Usa a URL original
          alt={altText} 
          className="object-contain max-w-full max-h-[calc(90vh-40px)] rounded"
        />
      </div>
    </div>
  );
}