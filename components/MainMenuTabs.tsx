// components/MainMenuTabs.tsx
'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Visão Geral', href: '/dashboard' },
  { name: 'Pacientes', href: '/pacientes' },
  { name: 'Procedimentos', href: '/procedimentos' }, 
  { name: 'Formulários', href: '/formularios' },
  { name: 'Tabela de Valores', href: '/tabela-valores' },
  { name: 'Financeiro', href: '/financeiro' },
  { name: 'Configurações', href: '/configuracoes' },
];

export default function MainMenuTabs() {
  const pathname = usePathname();

  if (!pathname) return null;

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      {/* Adicionado justify-center para centralizar as abas se elas não ocuparem toda a largura */}
      <nav className="max-w-7xl mx-auto -mb-px flex justify-center space-x-8 px-4 sm:px-6 lg:px-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const effectiveIsActive = tab.href === '/dashboard' ? pathname === tab.href : pathname.startsWith(tab.href);

          return (
            <Link key={tab.name} href={tab.href} legacyBehavior> 
              <a
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 
                  font-medium text-sm transition-colors duration-150 ease-in-out
                  ${
                    effectiveIsActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={effectiveIsActive ? 'page' : undefined}
              >
                {tab.name}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}