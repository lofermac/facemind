'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export default function ProfissionaisLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Email ou senha inválidos. Tente novamente.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white font-system">
      {/* HEADER SIMPLES */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-center">
          <Link href="/">
            <Image src="/logo.png" alt="FaceMind" width={120} height={32} priority className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      {/* FORMULÁRIO DE LOGIN */}
      <section className="relative z-10 pt-24 pb-8 px-8 overflow-hidden min-h-screen flex items-center">
        {/* Fundo Aurora Sutil */}
        <div className="absolute top-0 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-900/60 to-purple-900/40 opacity-20 blur-3xl animate-aurora" />
        
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-none">
              Área do{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">
                Profissional
              </span>
            </h1>
            <p className="text-base text-gray-400 leading-relaxed font-light">
              Acesse sua área exclusiva para gerenciar seus atendimentos e procedimentos
            </p>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="seu@email.com"
                required
                autoFocus
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] mt-6"
            >
              Entrar
            </button>

            {/* Link para Cadastro */}
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Crie sua conta gratuita
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
} 