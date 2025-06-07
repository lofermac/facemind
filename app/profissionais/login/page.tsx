'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import dynamic from 'next/dynamic';

export default function ProfissionaisLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1626] via-[#101a2b] to-[#181f2b] relative overflow-hidden">
      {/* Spotlight radial premium */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-radial from-white/10 via-blue-400/10 to-transparent blur-3xl opacity-70 z-0" />
      {/* Card glassmorphism */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-12 rounded-3xl bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 animate-fade-in">
        <img src="/logo.png" alt="Logo FaceMind" className="h-14 w-auto mb-8 drop-shadow-xl" />
        <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight" style={{ fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>Área do Profissional</h1>
        <p className="text-base text-slate-200 mb-8 text-center font-normal">Acesse sua área exclusiva para gerenciar seus atendimentos e procedimentos</p>
        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-4">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 bg-white/20 text-white placeholder-slate-300 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 transition-all duration-200 text-base font-normal shadow-sm"
                placeholder="Seu email"
                style={{ fontFamily: 'Inter, Poppins, -apple-system, BlinkMacSystemFont, sans-serif' }}
              />
            </div>
            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/20 text-white placeholder-slate-300 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 transition-all duration-200 text-base font-normal shadow-sm"
                placeholder="Sua senha"
                style={{ fontFamily: 'Inter, Poppins, -apple-system, BlinkMacSystemFont, sans-serif' }}
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-100/80 text-red-600 p-3 rounded-lg text-sm text-center animate-fade-in">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white font-semibold text-lg shadow-lg hover:from-blue-800 hover:to-blue-900 hover:scale-[1.01] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ fontFamily: 'Inter, Poppins, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Entrar
          </button>
        </form>
      </div>
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
} 