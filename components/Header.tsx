// components/Header.tsx
import { ArrowRightOnRectangleIcon, BeakerIcon } from '@heroicons/react/24/outline'; // Ícone para o botão Sair

export default function Header() {
  return (
    <header className="bg-blue-800 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20"> {/* Aumentando a altura para caber o ícone */}
          {/* Seção Esquerda: Bem-vindo Hugo */}
          <div className="flex-1 flex justify-start">
            <div className="bg-blue-700 px-3 py-1.5 rounded-lg"> {/* Estilo "pílula" com fundo contrastante */}
              <span className="text-sm text-white"> 
                Bem-vindo, <span className="font-semibold">Hugo</span>
              </span>
            </div>
          </div>

          {/* Seção Central: Logo/Nome do Sistema */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center"> {/* flex-shrink-0 para não espremer */}
            <BeakerIcon className="h-6 w-6 text-white mb-1" /> {/* Ícone acima do texto */}
            <a href="/" className="font-extrabold text-2xl text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}> {/* Fonte moderna e link para Visão Geral */}
              FaceMind
            </a>
          </div>

          {/* Seção Direita: Botão Sair */}
          <div className="flex-1 flex justify-end">
            <button
              type="button"
              // onClick={() => { /* Lógica de logout aqui */ }}
              className="flex items-center text-sm font-medium text-white hover:text-gray-200 border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sair
              <ArrowRightOnRectangleIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}