import React from 'react';
import { GiftIcon } from '@heroicons/react/24/outline';

interface Aniversariante {
  nome: string;
  dia: number; // Dia do mês
  whatsapp: string | null; // WhatsApp para contato
}

interface CardAniversariosProps {
  title?: string;
  aniversariantes: Aniversariante[];
  Icon?: React.ElementType;
  iconColor?: string;
}

export default function CardAniversarios({
  title = 'Aniversários do Mês',
  aniversariantes,
  Icon = GiftIcon,
  iconColor = 'text-pink-500',
}: CardAniversariosProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 h-full min-h-[420px] group hover:shadow-2xl transition-all duration-200 ease-in-out border border-white/30">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {Icon && <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />}
          {title}
        </h3>
      </div>
      <div className="flow-root">
        {aniversariantes.length > 0 ? (
          <ul role="list" className="space-y-3 max-h-72 overflow-y-auto">
            {aniversariantes.map((p, index) => (
              <li key={index} className="bg-white/50 rounded-lg p-3 hover:bg-white/70 transition-all duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {p.nome}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.dia.toString().padStart(2, '0')}/{(new Date().getUTCMonth() + 1).toString().padStart(2, '0')}
                    </p>
                  </div>
                  {p.whatsapp && (
                    <a 
                      href={`https://wa.me/+55${p.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-3 px-3 py-2 flex items-center gap-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 hover:scale-105 transition-all duration-150 shadow-sm"
                      title="Parabenizar via WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.105 1.523 5.84L0 24l6.32-1.523A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.89 0-3.675-.47-5.25-1.29l-.375-.21-3.75.905.905-3.75-.21-.375A10.455 10.455 0 011.5 12c0-5.799 4.701-10.5 10.5-10.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5zm5.25-7.5c-.285-.143-1.68-.83-1.94-.925-.26-.095-.45-.143-.64.143-.19.285-.735.925-.9 1.11-.165.19-.33.215-.615.072-.285-.143-1.2-.44-2.29-1.4-.845-.755-1.415-1.685-1.58-1.97-.165-.285-.018-.44.125-.582.13-.13.285-.33.43-.495.145-.165.19-.285.285-.475.095-.19.048-.357-.024-.5-.072-.143-.64-1.54-.88-2.115-.23-.555-.465-.48-.64-.49-.165-.007-.357-.01-.55-.01-.19 0-.5.072-.76.357-.26.285-.99.965-.99 2.36 0 1.395 1.015 2.74 1.155 2.93.14.19 2 3.05 4.845 4.28.68.292 1.21.465 1.625.595.68.215 1.3.185 1.79.112.545-.08 1.68-.685 1.92-1.35.24-.665.24-1.235.165-1.35-.072-.115-.26-.19-.545-.33z" />
                      </svg>
                      <span className="text-xs font-medium whitespace-nowrap">Parabenizar! 🎉</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[320px]">
            <span className="text-4xl mb-2">🎁</span>
            <p className="text-slate-500 italic text-center">Sem aniversariantes este mês.</p>
          </div>
        )}
      </div>
    </div>
  );
} 