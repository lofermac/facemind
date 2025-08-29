// app/layout.tsx
'use client';

// Importar metadata do novo arquivo
import { metadata } from './metadata';

import type { Metadata } from "next";
import "./globals.css"; // O globals.css é importado aqui
import Header from "@/components/Header"; 
import MainMenuTabs from "@/components/MainMenuTabs"; 
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isLoginPage = pathname === '/profissionais/login';

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setIsLoading(false);
      if (session && pathname === '/profissionais/login') {
        window.location.href = '/dashboard'; // Redireciona para a aba Visão Geral
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão inicial:', session);
      setSession(session);
      setIsLoading(false);
      if (session && pathname === '/profissionais/login') {
        window.location.href = '/dashboard'; // Redireciona para a aba Visão Geral
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !session && pathname !== '/profissionais/login' && pathname !== '/') {
      window.location.href = '/profissionais/login'; // Redireciona para a tela de login
    }
  }, [isLoading, session, pathname]);

  // Definir título da página dinamicamente
  useEffect(() => {
    document.title = 'FaceMind';
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        <title>FaceMind</title>
        <meta name="description" content="Sistema de gestão para clínicas de estética" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      {/* ✨ GARANTA QUE ESTA CLASSE ESTÁ AQUI E É CLARA ✨ */}
      <body className="bg-slate-100 antialiased"> 
        {!isLoginPage && !isLoading && pathname !== '/' ? (
          session ? (
            <>
        <Header />
        <MainMenuTabs />
            </>
          ) : (
            <div className="flex justify-center items-center min-h-screen">
              <p className="text-lg text-gray-700">Redirecionando para login...</p>
            </div>
          )
        ) : null}
        <main className="pb-20 md:pb-0">{children}</main>
        <MobileBottomNav />
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}