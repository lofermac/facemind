'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, UserGroupIcon, ReceiptPercentIcon, CreditCardIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const tabs = [
  { name: 'Home', href: '/dashboard', Icon: HomeIcon },
  { name: 'Pacientes', href: '/pacientes', Icon: UserGroupIcon },
  { name: 'Procedimentos', href: '/procedimentos', Icon: ReceiptPercentIcon },
  { name: 'Financeiro', href: '/financeiro', Icon: CreditCardIcon },
  { name: 'Config', href: '/configuracoes', Icon: Cog6ToothIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname() ?? '';

  return (
    <nav className="fixed bottom-0 left-0 w-full md:hidden bg-white/70 backdrop-blur-xl border-t border-white/30 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-50">
      <ul className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href);
          return (
            <li key={tab.name}>
              <Link href={tab.href} legacyBehavior>
                <a
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className="relative flex flex-col items-center text-xs font-medium transition-colors duration-150"
                  style={{ color: active ? '#1d4ed8' : '#334155' }}
                >
                  <tab.Icon className={`h-6 w-6 mb-0.5 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                  {tab.name}
                  {tab.name === 'Pacientes' && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-[10px] px-1.5">!</span>
                  )}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 