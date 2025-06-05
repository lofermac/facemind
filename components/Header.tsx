// components/Header.tsx
import { ArrowRightOnRectangleIcon, BeakerIcon } from '@heroicons/react/24/outline'; // Ícone para o botão Sair
import { SparklesIcon } from '@heroicons/react/24/solid'; // Novo ícone para o FaceMind
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.email || ''); // Supondo que o email seja usado como nome de usuário
      } else {
        setUserName('Usuário'); // Valor padrão caso não haja usuário
      }
    };
    fetchUserName();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/profissionais/login');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <header className="bg-blue-800 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-1 flex justify-start">
            <div className="bg-blue-700 px-3 py-1.5 rounded-lg">
              <span className="text-sm text-white">
                Bem-vindo, <span className="font-semibold">{userName}</span>
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <SparklesIcon className="h-6 w-6 text-yellow-400 mb-1" />
            <span className="font-extrabold text-2xl text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              FaceMind
            </span>
          </div>

          <div className="flex-1 flex justify-end">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-white hover:text-yellow-300 border border-gray-400 hover:border-yellow-300 px-3 py-1.5 rounded-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
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