// components/Header.tsx
import { ArrowRightOnRectangleIcon, BeakerIcon } from '@heroicons/react/24/outline'; // Ícone para o botão Sair
import Image from "next/image";
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
    <header className="sticky top-0 left-0 z-40 w-full bg-white/60 backdrop-blur-xl shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 py-1 sm:py-2">
        <div className="flex justify-between items-center h-14 sm:h-20">
          {/* Saudação (esconde em telas < md) */}
          <div className="hidden md:flex flex-1 justify-start">
            <div className="bg-white/80 px-3 py-1.5 rounded-xl shadow-sm">
              <span className="text-sm text-slate-700 font-normal">
                Bem-vindo, <span className="font-semibold text-blue-700">{userName}</span>
              </span>
            </div>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center mx-2 sm:mx-6">
            <Image src="/logo.png" alt="Logo FaceMind" width={100} height={36} priority className="h-8 sm:h-10 w-auto drop-shadow-xl" />
          </div>

          {/* Botão Sair */}
          <div className="flex-1 flex justify-end">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center text-sm sm:text-base font-medium text-blue-700 hover:text-blue-900 bg-white/80 hover:bg-white/100 border border-blue-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Sair
              <ArrowRightOnRectangleIcon className="ml-1 sm:ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        header {
          box-shadow: 0 4px 24px 0 rgba(30, 41, 59, 0.10), 0 1.5px 0 0 rgba(255,255,255,0.04);
        }
      `}</style>
    </header>
  );
}