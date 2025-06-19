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
    <div className="hidden md:block bg-white/60 backdrop-blur-xl shadow border-b border-white/10">
      <nav className="max-w-7xl mx-auto -mb-px flex justify-center space-x-8 px-4 sm:px-6 lg:px-8 h-16 items-center" aria-label="Tabs">
        {tabs.map((tab) => {
          const effectiveIsActive = tab.href === '/dashboard' ? pathname === tab.href : pathname.startsWith(tab.href);

          return (
            <Link key={tab.name} href={tab.href} legacyBehavior> 
              <a
                className={`
                  whitespace-nowrap py-2 px-4 rounded-xl font-medium text-base transition-all duration-200
                  ${
                    effectiveIsActive
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow border-none scale-105'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-white/70 border-none'
                  }
                `}
                aria-current={effectiveIsActive ? 'page' : undefined}
                style={{ boxShadow: effectiveIsActive ? '0 2px 16px 0 rgba(30, 64, 175, 0.10)' : undefined }}
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