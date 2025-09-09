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
  const isCadastroPage = pathname === '/cadastro';

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
    if (!isLoading && !session && pathname !== '/profissionais/login' && pathname !== '/' && pathname !== '/cadastro') {
      window.location.href = '/profissionais/login'; // Redireciona para a tela de login
    }
  }, [isLoading, session, pathname]);

  // Definir título da página dinamicamente
  useEffect(() => {
    document.title = 'FaceMind';
  }, []);

  // Forçar atualização do favicon
  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = '/favicon.svg?v=2';
    document.getElementsByTagName('head')[0].appendChild(link);
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>FaceMind</title>
        <meta name="description" content="Sistema de gestão para clínicas de estética" />
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
        <link rel="manifest" href="/manifest.json?v=2" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      {/* ✨ GARANTA QUE ESTA CLASSE ESTÁ AQUI E É CLARA ✨ */}
      <body className="bg-slate-100 antialiased">
        <Toaster richColors position="top-right" closeButton />
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            {/* Você pode adicionar um spinner ou loader aqui */}
          </div>
        ) : session && !isLoginPage && !isCadastroPage && pathname !== '/' ? (
          <>
            <Header />
            <MainMenuTabs />
            <main className="pb-20 md:pb-0">{children}</main>
            <MobileBottomNav />
          </>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}